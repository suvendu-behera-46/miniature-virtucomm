import "server-only";

import nodemailer, { type Transporter } from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

export class MailConfigError extends Error {}

let transporter: Transporter | undefined;

function getTransporter(): Transporter | undefined {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return undefined;

  const port = Number(process.env.SMTP_PORT || 465);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

type Address = NonNullable<Mail.Options["to"]>;

function formatAddresses(value: Address | undefined): string[] {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.flatMap((item) =>
    typeof item === "string" ? item.split(",").map((part) => part.trim()).filter(Boolean) : [item.name ? `${item.name} <${item.address}>` : item.address],
  );
}

// Shared hosting often blocks outgoing SMTP ports (25/465/587). With
// RESEND_API_KEY set, mail goes through Resend's HTTPS API on port 443 instead.
async function sendWithResendApi(options: Omit<Mail.Options, "from">) {
  const attachments = (options.attachments ?? []).map((attachment) => {
    const content = attachment.content;
    if (!(Buffer.isBuffer(content) || typeof content === "string")) throw new Error("Resend attachments must be a Buffer or string.");
    return { filename: attachment.filename || "attachment", content: Buffer.from(content).toString("base64") };
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: formatAddresses(options.to),
      reply_to: formatAddresses(options.replyTo as Address | undefined),
      subject: options.subject,
      text: typeof options.text === "string" ? options.text : undefined,
      html: typeof options.html === "string" ? options.html : undefined,
      attachments: attachments.length ? attachments : undefined,
    }),
  });
  if (!response.ok) throw new Error(`Resend API error ${response.status}: ${await response.text()}`);
}

export async function sendMail(options: Omit<Mail.Options, "from">) {
  if (process.env.RESEND_API_KEY) return sendWithResendApi(options);

  const transport = getTransporter();

  if (!transport) {
    if (process.env.NODE_ENV === "production") {
      throw new MailConfigError("SMTP_HOST is not configured.");
    }
    // Local development without SMTP: print the message instead of sending it.
    console.info(
      `[mail:dev] To: ${options.to}\nSubject: ${options.subject}\n${options.text}` +
        (options.attachments?.length ? `\n(${options.attachments.length} attachment(s) omitted)` : ""),
    );
    return;
  }

  await transport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    ...options,
  });
}
