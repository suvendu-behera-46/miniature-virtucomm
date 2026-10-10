import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import { startVerification, verificationErrorResponse, type VerificationChannel } from "@/lib/verification";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { channel?: unknown; target?: unknown } | null;
  const channel = body?.channel;
  if ((channel !== "email" && channel !== "phone") || typeof body?.target !== "string") {
    return NextResponse.json({ error: "Invalid verification request." }, { status: 400 });
  }

  try {
    const result = await startVerification(channel as VerificationChannel, body.target, getClientIp(request));
    return NextResponse.json(result);
  } catch (error) {
    return verificationErrorResponse(error, "We could not send a verification code. Please try again.");
  }
}
