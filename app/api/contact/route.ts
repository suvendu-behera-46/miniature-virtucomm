import { NextResponse } from "next/server";
import { recordInquiry } from "@/lib/inquiries";
import { sendMail } from "@/lib/mailer";
import { getClientIp, takeRateLimit } from "@/lib/rate-limit";
import { normalizeEmail } from "@/lib/verification";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!takeRateLimit(`contact:${getClientIp(request)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const read = (key: string, max: number) => (typeof body?.[key] === "string" ? (body[key] as string).trim().slice(0, max) : "");
  const name = read("name", 120);
  const phone = read("phone", 30);
  const rawEmail = read("email", 254);
  const message = read("message", 5000);
  const email = rawEmail ? normalizeEmail(rawEmail) : null;

  if (name.length < 2) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  if (rawEmail && !email) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!email && phone.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ error: "Enter an email address or phone number so we can reply." }, { status: 400 });
  }
  if (message.length < 5) return NextResponse.json({ error: "Tell us a little about what you'd like made." }, { status: 400 });

  try {
    const inquiry = await recordInquiry({ name, email, phone, message, subject: "Contact form", source: "CONTACT_FORM" });

    const recipients = process.env.INQUIRY_EMAIL_TO?.trim() || process.env.REFERENCE_UPLOAD_EMAIL_TO?.trim();
    if (recipients) {
      await sendMail({
        to: recipients,
        ...(email ? { replyTo: { name, address: email } } : {}),
        subject: `New inquiry from ${name}`,
        text: [`Name: ${name}`, `Email: ${email ?? "-"}`, `Phone: ${phone || "-"}`, "", message, "", `Inquiry ID: ${inquiry.id}`].join("\n"),
      }).catch((error) => console.error("Inquiry notification email failed.", error));
    }
  } catch (error) {
    console.error("Contact inquiry could not be saved.", error);
    return NextResponse.json({ error: "We could not send your message. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Thanks! We'll get back to you shortly." }, { status: 201 });
}
