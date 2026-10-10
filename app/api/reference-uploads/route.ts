import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { MailConfigError, sendMail } from "@/lib/mailer";
import {
  maxReferenceFiles as maxFiles,
  maxReferenceFileSize as maxFileSize,
  maxReferenceTotalSize as maxTotalSize,
} from "@/lib/reference-upload-limits";
import {
  getReferenceUploadsDirectory,
  type ReferenceSubmission,
} from "@/lib/reference-uploads";
import { isVerified, normalizeEmail, normalizePhone } from "@/lib/verification";

export const runtime = "nodejs";

const allowedTypes: Record<string, { extension: string; signature: (bytes: Buffer) => boolean }> = {
  "image/jpeg": {
    extension: "jpg",
    signature: (bytes) =>
      bytes.length >= 4 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff &&
      bytes[bytes.length - 2] === 0xff &&
      bytes[bytes.length - 1] === 0xd9,
  },
  "image/png": {
    extension: "png",
    signature: (bytes) =>
      bytes.length >= 45 &&
      bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) &&
      bytes.readUInt32BE(8) === 13 &&
      bytes.subarray(12, 16).toString("ascii") === "IHDR" &&
      bytes.readUInt32BE(16) > 0 &&
      bytes.readUInt32BE(20) > 0 &&
      bytes.includes(Buffer.from("IDAT")) &&
      bytes.subarray(-8).equals(Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82])),
  },
  "image/webp": {
    extension: "webp",
    signature: (bytes) =>
      bytes.length >= 20 &&
      bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.readUInt32LE(4) + 8 === bytes.length &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP",
  },
};

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Submit your contact details and reference images." }, { status: 400 });
  }

  const name = readTextField(formData, "name").trim();
  const email = normalizeEmail(readTextField(formData, "email"));
  const phone = normalizePhone(readTextField(formData, "phone"));
  const description = readTextField(formData, "description").trim();
  const files = formData.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json({ error: "Enter your name (2 to 100 characters)." }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: "Enter a valid phone number with country code." }, { status: 400 });
  }
  if (!isVerified(readTextField(formData, "emailToken"), "email", email)) {
    return NextResponse.json({ error: "Verify your email address before submitting." }, { status: 400 });
  }
  if (!isVerified(readTextField(formData, "phoneToken"), "phone", phone)) {
    return NextResponse.json({ error: "Verify your phone number before submitting." }, { status: 400 });
  }
  if (description.length > 2000) {
    return NextResponse.json({ error: "Keep your project note under 2,000 characters." }, { status: 400 });
  }
  if (files.length === 0 || files.length > maxFiles) {
    return NextResponse.json({ error: `Choose between 1 and ${maxFiles} reference images.` }, { status: 400 });
  }
  if (files.some((file) => !allowedTypes[file.type] || file.size > maxFileSize)) {
    return NextResponse.json({ error: `Use JPG, PNG, or WebP images up to ${formatMegabytes(maxFileSize)} each.` }, { status: 400 });
  }
  if (files.reduce((total, file) => total + file.size, 0) > maxTotalSize) {
    return NextResponse.json({ error: `The combined upload size must be ${formatMegabytes(maxTotalSize)} or less.` }, { status: 400 });
  }

  const uploads = await Promise.all(
    files.map(async (file) => ({
      file,
      bytes: Buffer.from(await file.arrayBuffer()),
    })),
  );

  if (uploads.some(({ file, bytes }) => !allowedTypes[file.type].signature(bytes))) {
    return NextResponse.json({ error: "One or more files are not valid images of the selected type." }, { status: 400 });
  }

  const id = randomUUID();
  const submissionDirectory = path.join(getReferenceUploadsDirectory(), id);
  const submission: ReferenceSubmission = {
    id,
    name,
    email,
    phone,
    description,
    createdAt: new Date().toISOString(),
    files: uploads.map(({ file }) => {
      const fileId = randomUUID();
      const { extension } = allowedTypes[file.type];
      return {
        id: fileId,
        originalName: file.name.slice(0, 180),
        contentType: file.type,
        size: file.size,
        storageName: `${fileId}.${extension}`,
      };
    }),
  };

  const recipients = process.env.REFERENCE_UPLOAD_EMAIL_TO?.trim();
  if (!recipients) {
    console.error("REFERENCE_UPLOAD_EMAIL_TO is not configured.");
    return NextResponse.json({ error: "Submissions are temporarily unavailable. Please try again later." }, { status: 503 });
  }

  try {
    await sendMail({
      to: recipients,
      replyTo: { name, address: email },
      subject: `New miniature reference from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email} (verified)`,
        `Phone: ${phone} (verified)`,
        `Submitted: ${submission.createdAt}`,
        `Submission ID: ${id}`,
        "",
        "What they would like made:",
        description || "(not provided)",
        "",
        `${uploads.length} reference image(s) attached.`,
      ].join("\n"),
      html: renderEmailHtml(submission),
      attachments: uploads.map(({ bytes }, index) => ({
        filename: submission.files[index].originalName || submission.files[index].storageName,
        content: bytes,
        contentType: submission.files[index].contentType,
      })),
    });
  } catch (error) {
    console.error("Reference submission email could not be sent.", error);
    return NextResponse.json(
      { error: error instanceof MailConfigError ? "Submissions are temporarily unavailable. Please try again later." : "We could not send your submission. Please try again." },
      { status: error instanceof MailConfigError ? 503 : 502 },
    );
  }

  // The email has been delivered; keep a private copy for the admin dashboard as well.
  try {
    await mkdir(submissionDirectory, { recursive: true, mode: 0o700 });
    await Promise.all(
      uploads.map(({ bytes }, index) =>
        writeFile(path.join(submissionDirectory, submission.files[index].storageName), bytes, {
          flag: "wx",
          mode: 0o600,
        }),
      ),
    );
    await writeFile(
      path.join(submissionDirectory, "submission.json"),
      JSON.stringify(submission, null, 2),
      { flag: "wx", mode: 0o600 },
    );
  } catch (error) {
    await rm(submissionDirectory, { recursive: true, force: true });
    console.error(`Reference submission ${id} was emailed but could not be stored.`, error);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

function readTextField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function formatMegabytes(bytes: number) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

function renderEmailHtml(submission: ReferenceSubmission) {
  const rows: [string, string][] = [
    ["Name", submission.name],
    ["Email", `<a href="mailto:${escapeHtml(submission.email)}">${escapeHtml(submission.email)}</a> ✓ verified`],
    ["Phone", `<a href="tel:${escapeHtml(submission.phone ?? "")}">${escapeHtml(submission.phone ?? "")}</a> ✓ verified`],
    ["Submitted", new Date(submission.createdAt).toUTCString()],
    ["Images", submission.files.map((file) => escapeHtml(file.originalName)).join("<br>")],
  ];

  return `<div style="font-family:Arial,sans-serif;color:#0f172a;max-width:600px">
  <h2 style="margin:0 0 16px">New miniature reference submission</h2>
  <table cellpadding="8" style="border-collapse:collapse;width:100%">
    ${rows
      .map(
        ([label, value], index) =>
          `<tr><th align="left" style="width:120px;border-bottom:1px solid #e2e8f0">${label}</th><td style="border-bottom:1px solid #e2e8f0">${index === 0 ? escapeHtml(value) : value}</td></tr>`,
      )
      .join("")}
  </table>
  <h3 style="margin:24px 0 8px">What they would like made</h3>
  <p style="white-space:pre-wrap;margin:0">${submission.description ? escapeHtml(submission.description) : "<em>Not provided</em>"}</p>
  <p style="margin-top:24px;color:#64748b;font-size:12px">Submission ID: ${submission.id}. Reply to this email to contact the customer.</p>
</div>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}
