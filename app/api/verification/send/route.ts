import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import { startEmailVerification, verificationErrorResponse } from "@/lib/verification";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  if (typeof body?.email !== "string") {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    return NextResponse.json(await startEmailVerification(body.email, getClientIp(request)));
  } catch (error) {
    return verificationErrorResponse(error, "We could not send a verification code. Please try again.");
  }
}
