import { NextResponse } from "next/server";
import { confirmVerification, verificationErrorResponse } from "@/lib/verification";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { challenge?: unknown; code?: unknown } | null;
  if (typeof body?.challenge !== "string" || typeof body?.code !== "string") {
    return NextResponse.json({ error: "Enter the code you received." }, { status: 400 });
  }

  try {
    return NextResponse.json(await confirmVerification(body.challenge, body.code));
  } catch (error) {
    return verificationErrorResponse(error, "We could not check that code. Please try again.");
  }
}
