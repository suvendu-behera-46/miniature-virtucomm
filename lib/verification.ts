import "server-only";

import { createHmac, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { MailConfigError, sendMail } from "@/lib/mailer";
import { takeRateLimit } from "@/lib/rate-limit";

// Verification is stateless: the server hands the browser HMAC-signed tokens.
// A "challenge" token carries a keyed hash of the one-time code (or defers to
// Twilio Verify for SMS); once the code is confirmed the browser receives a
// short-lived "verified" token that the upload route checks.

export type VerificationChannel = "email" | "phone";

const codeTtlMs = 10 * 60 * 1000;
const verifiedTtlMs = 60 * 60 * 1000;
const maxCheckAttempts = 5;

type ChallengePayload = {
  kind: "challenge";
  channel: VerificationChannel;
  target: string;
  nonce: string;
  exp: number;
  provider: "local" | "twilio";
  codeMac?: string;
};

type VerifiedPayload = {
  kind: "verified";
  channel: VerificationChannel;
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

export function normalizePhone(value: string): string | null {
  let phone = value.trim().replace(/[\s().-]/g, "");
  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  if (!phone.startsWith("+")) {
    const countryCode = (process.env.DEFAULT_PHONE_COUNTRY_CODE || "91").replace(/\D/g, "");
    phone = `+${countryCode}${phone.replace(/^0+/, "")}`;
  }
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
}

export function normalizeTarget(channel: VerificationChannel, value: string) {
  const target = channel === "email" ? normalizeEmail(value) : normalizePhone(value);
  if (!target) {
    throw new VerificationError(
      channel === "email" ? "Enter a valid email address." : "Enter a valid phone number with country code.",
    );
  }
  return target;
}

export async function startVerification(channel: VerificationChannel, rawTarget: string, clientIp: string) {
  const target = normalizeTarget(channel, rawTarget);

  if (
    !takeRateLimit(`verify-send:ip:${clientIp}`, 10, 60 * 60 * 1000) ||
    !takeRateLimit(`verify-send:${channel}:${target}`, 5, 60 * 60 * 1000)
  ) {
    throw new VerificationError("Too many verification requests. Please try again later.", 429);
  }
  if (!takeRateLimit(`verify-send-cooldown:${channel}:${target}`, 1, 60 * 1000)) {
    throw new VerificationError("Please wait a minute before requesting another code.", 429);
  }

  const payload: ChallengePayload = {
    kind: "challenge",
    channel,
    target,
    nonce: randomUUID(),
    exp: Date.now() + codeTtlMs,
    provider: channel === "phone" && isTwilioConfigured() ? "twilio" : "local",
  };

  if (payload.provider === "twilio") {
    await twilioRequest("Verifications", { To: target, Channel: "sms" });
  } else {
    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    payload.codeMac = mac(`code:${payload.nonce}:${code}`);
    await deliverLocalCode(channel, target, code);
  }

  return { target, challenge: sign(payload) };
}

export async function confirmVerification(challengeToken: string, rawCode: string) {
  const payload = verify<ChallengePayload>(challengeToken, "challenge");
  if (!payload) throw new VerificationError("This code has expired. Request a new one.");

  const code = rawCode.trim();
  if (!/^\d{4,10}$/.test(code)) throw new VerificationError("Enter the code you received.");

  if (!takeRateLimit(`verify-check:${payload.nonce}`, maxCheckAttempts, codeTtlMs)) {
    throw new VerificationError("Too many incorrect attempts. Request a new code.", 429);
  }

  let approved: boolean;
  if (payload.provider === "twilio") {
    const result = await twilioRequest("VerificationCheck", { To: payload.target, Code: code });
    approved = result.status === "approved";
  } else {
    approved = !!payload.codeMac && safeEqual(payload.codeMac, mac(`code:${payload.nonce}:${code}`));
  }

  if (!approved) throw new VerificationError("That code is incorrect. Please try again.");

  const verified: VerifiedPayload = {
    kind: "verified",
    channel: payload.channel,
    target: payload.target,
    exp: Date.now() + verifiedTtlMs,
  };
  return { target: payload.target, token: sign(verified) };
}

export function isVerified(token: string, channel: VerificationChannel, target: string): boolean {
  const payload = verify<VerifiedPayload>(token, "verified");
  return !!payload && payload.channel === channel && payload.target === target;
}

async function deliverLocalCode(channel: VerificationChannel, target: string, code: string) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Miniature Studio";

  if (channel === "email") {
    await sendMail({
      to: target,
      subject: `${code} is your ${appName} verification code`,
      text: `Your ${appName} verification code is ${code}.\n\nIt expires in 10 minutes. If you did not request this, you can ignore this email.`,
    });
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new VerificationError("Phone verification is not available right now.", 503);
  }
  // Local development without Twilio: print the SMS code instead of sending it.
  console.info(`[sms:dev] Verification code for ${target}: ${code}`);
}

function isTwilioConfigured() {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID);
}

async function twilioRequest(endpoint: "Verifications" | "VerificationCheck", body: Record<string, string>) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = process.env;
  const response = await fetch(`https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });
  const result = (await response.json().catch(() => ({}))) as { status?: string | number; message?: string };

  // Twilio returns 404 when a verification has expired, been used, or exceeded its attempts.
  if (endpoint === "VerificationCheck" && response.status === 404) {
    throw new VerificationError("This code has expired. Request a new one.");
  }
  if (!response.ok) {
    console.error(`Twilio ${endpoint} failed (${response.status}):`, result.message);
    throw new VerificationError(
      response.status === 400 ? "We could not send a code to that phone number." : "Phone verification is not available right now.",
      response.status === 400 ? 400 : 502,
    );
  }
  return result;
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
