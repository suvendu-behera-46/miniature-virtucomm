import "server-only";

import { createHmac, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { MailConfigError, sendMail } from "@/lib/mailer";
import { takeRateLimit } from "@/lib/rate-limit";

// Email verification is stateless: the server hands the browser HMAC-signed
// tokens. A "challenge" token carries a keyed hash of the emailed one-time
// code; once the code is confirmed the browser receives a short-lived
// "verified" token that the upload route checks.

const codeTtlMs = 10 * 60 * 1000;
const verifiedTtlMs = 60 * 60 * 1000;
const maxCheckAttempts = 5;

type ChallengePayload = {
  kind: "challenge";
  target: string;
  nonce: string;
  exp: number;
  codeMac: string;
};

type VerifiedPayload = {
  kind: "verified";
  target: string;
  exp: number;
};

export class VerificationError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

export function verificationErrorResponse(error: unknown, fallback: string) {
  if (error instanceof VerificationError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("Verification failed.", error);
  return NextResponse.json({ error: fallback }, { status: error instanceof MailConfigError ? 503 : 502 });
}

export function normalizeEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function startEmailVerification(rawEmail: string, clientIp: string) {
  const target = normalizeEmail(rawEmail);
  if (!target) throw new VerificationError("Enter a valid email address.");

  if (
    !takeRateLimit(`verify-send:ip:${clientIp}`, 10, 60 * 60 * 1000) ||
    !takeRateLimit(`verify-send:email:${target}`, 5, 60 * 60 * 1000)
  ) {
    throw new VerificationError("Too many verification requests. Please try again later.", 429);
  }
  if (!takeRateLimit(`verify-send-cooldown:email:${target}`, 1, 60 * 1000)) {
    throw new VerificationError("Please wait a minute before requesting another code.", 429);
  }

  const nonce = randomUUID();
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Miniature Studio";

  await sendMail({
    to: target,
    subject: `${code} is your ${appName} verification code`,
    text: `Your ${appName} verification code is ${code}.\n\nIt expires in 10 minutes. If you did not request this, you can ignore this email.`,
  });

  const challenge: ChallengePayload = { kind: "challenge", target, nonce, exp: Date.now() + codeTtlMs, codeMac: mac(`code:${nonce}:${code}`) };
  return { target, challenge: sign(challenge) };
}

export async function confirmEmailVerification(challengeToken: string, rawCode: string) {
  const payload = verify<ChallengePayload>(challengeToken, "challenge");
  if (!payload) throw new VerificationError("This code has expired. Request a new one.");

  const code = rawCode.trim();
  if (!/^\d{6}$/.test(code)) throw new VerificationError("Enter the 6-digit code from the email.");

  if (!takeRateLimit(`verify-check:${payload.nonce}`, maxCheckAttempts, codeTtlMs)) {
    throw new VerificationError("Too many incorrect attempts. Request a new code.", 429);
  }
  if (!safeEqual(payload.codeMac, mac(`code:${payload.nonce}:${code}`))) {
    throw new VerificationError("That code is incorrect. Please try again.");
  }

  const verified: VerifiedPayload = { kind: "verified", target: payload.target, exp: Date.now() + verifiedTtlMs };
  return { target: payload.target, token: sign(verified) };
}

export function isEmailVerified(token: string, email: string): boolean {
  const payload = verify<VerifiedPayload>(token, "verified");
  return !!payload && payload.target === email;
}

function getSecret() {
  const secret = process.env.VERIFICATION_SECRET || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new VerificationError("Verification is not configured.", 503);
  return secret;
}

function mac(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function sign(payload: ChallengePayload | VerifiedPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${mac(`${payload.kind}:${body}`)}`;
}

function verify<T extends ChallengePayload | VerifiedPayload>(token: string, kind: T["kind"]): T | null {
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra !== undefined || !safeEqual(signature, mac(`${kind}:${body}`))) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
    return payload.kind === kind && typeof payload.exp === "number" && payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
