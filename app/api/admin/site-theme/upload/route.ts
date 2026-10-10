import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

const allowedTypes: Record<string, string> = {
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};
const maxFileSize = 12 * 1024 * 1024;
const maxFilesPerUpload = 8;

export async function POST(request: Request) {
  const session = await auth();
  const role = (session?.user as NonNullable<typeof session>["user"] & { role?: string } | undefined)?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Upload one or more image files." }, { status: 400 });
  }

  const files = formData.getAll("files").filter((value): value is File => value instanceof File);
  if (files.length === 0 || files.length > maxFilesPerUpload) {
    return NextResponse.json({ error: `Choose between 1 and ${maxFilesPerUpload} image or GIF files.` }, { status: 400 });
  }

  for (const file of files) {
    if (!allowedTypes[file.type] || file.size === 0 || file.size > maxFileSize) {
      return NextResponse.json({ error: "Use JPEG, PNG, WebP, or GIF files up to 12 MB each." }, { status: 400 });
    }
  }

  const uploadsWithBytes = await Promise.all(files.map(async (file) => ({
    file,
    bytes: Buffer.from(await file.arrayBuffer()),
  })));

  if (uploadsWithBytes.some(({ file, bytes }) => !hasMatchingSignature(file.type, bytes))) {
    return NextResponse.json({ error: "One or more files do not match their declared image format." }, { status: 400 });
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads", "themes");
  await mkdir(uploadDirectory, { recursive: true });

  const uploads = await Promise.all(uploadsWithBytes.map(async ({ file, bytes }) => {
    const extension = allowedTypes[file.type];
    const filename = `${randomUUID()}${extension}`;
    await writeFile(path.join(uploadDirectory, filename), bytes, { flag: "wx" });
    return { src: `/uploads/themes/${filename}`, alt: file.name.slice(0, 160) };
  }));

  return NextResponse.json({ uploads }, { status: 201 });
}

function hasMatchingSignature(type: string, bytes: Buffer) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (type === "image/gif") return bytes.subarray(0, 6).toString("ascii").match(/^GIF8[79]a$/) !== null;
  if (type === "image/webp") return bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}
