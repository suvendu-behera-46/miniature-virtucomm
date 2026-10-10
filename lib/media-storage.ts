import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Uploaded images live outside /public so files added after `next build` are
// still served (by app/media/[name]/route.ts).
export const mediaDirectory = path.join(process.cwd(), "storage", "media");
export const maxMediaFileSize = 12 * 1024 * 1024;

const imageTypes: Record<string, { extension: string; signature: (bytes: Buffer) => boolean }> = {
  "image/jpeg": { extension: "jpg", signature: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { extension: "png", signature: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  "image/webp": { extension: "webp", signature: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP" },
  "image/gif": { extension: "gif", signature: (b) => b.subarray(0, 4).toString("ascii") === "GIF8" },
};

const contentTypes: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };
const storageKeyPattern = /^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/;

export class MediaUploadError extends Error {}

export type StoredMedia = { url: string; storageKey: string; filename: string; size: number; contentType: string };

export async function saveImageUpload(file: File): Promise<StoredMedia> {
  const type = imageTypes[file.type];
  if (!type || file.size === 0 || file.size > maxMediaFileSize) {
    throw new MediaUploadError("Use JPG, PNG, WebP, or GIF images up to 12 MB each.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!type.signature(bytes)) throw new MediaUploadError(`${file.name} is not a valid ${type.extension.toUpperCase()} image.`);

  const storageKey = `${randomUUID()}.${type.extension}`;
  await mkdir(mediaDirectory, { recursive: true });
  await writeFile(path.join(mediaDirectory, storageKey), bytes, { flag: "wx" });

  return { url: `/media/${storageKey}`, storageKey, filename: file.name.slice(0, 180), size: file.size, contentType: file.type };
}

export function getUploadedImages(formData: FormData, field = "images") {
  return formData.getAll(field).filter((value): value is File => value instanceof File && value.size > 0);
}

export async function readStoredMedia(storageKey: string) {
  if (!storageKeyPattern.test(storageKey)) return null;
  try {
    const bytes = await readFile(path.join(mediaDirectory, storageKey));
    return { bytes, contentType: contentTypes[storageKey.split(".").pop()!] };
  } catch {
    return null;
  }
}

export async function deleteStoredMedia(storageKey: string | null | undefined) {
  if (!storageKey || !storageKeyPattern.test(storageKey)) return;
  await unlink(path.join(mediaDirectory, storageKey)).catch(() => undefined);
}
