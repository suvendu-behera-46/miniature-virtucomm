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

export async function sendMail(options: Omit<Mail.Options, "from">) {
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
