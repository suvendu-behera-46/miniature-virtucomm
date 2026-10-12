import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export type ReferenceUploadFile = {
  id: string;
  originalName: string;
  contentType: string;
  size: number;
  storageName: string;
};

export type ReferenceSubmission = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  description: string;
  createdAt: string;
  files: ReferenceUploadFile[];
};

export function getReferenceUploadsDirectory() {
  // Set REFERENCE_UPLOADS_DIR outside the app folder in production so redeploys keep submissions.
  return process.env.REFERENCE_UPLOADS_DIR || path.join(process.cwd(), "private", "reference-uploads");
}

export async function listReferenceSubmissions() {
  const directory = getReferenceUploadsDirectory();
  let entries;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return [];
    throw error;
  }

  const submissions = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && isId(entry.name))
      .map(async ({ name }) => readSubmission(name)),
  );

  return submissions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function readSubmission(id: string): Promise<ReferenceSubmission> {
  if (!isId(id)) throw new Error("Invalid reference submission ID.");

  const metadata = await readFile(
    path.join(getReferenceUploadsDirectory(), id, "submission.json"),
    "utf8",
  );
  const submission = JSON.parse(metadata) as ReferenceSubmission;
  if (submission.id !== id || !Array.isArray(submission.files)) {
    throw new Error(`Reference submission ${id} has invalid metadata.`);
  }

  return submission;
}

export function getReferenceFilePath(submissionId: string, file: ReferenceUploadFile) {
  if (!isId(submissionId) || !isId(file.id) || !/^[a-f0-9-]+\.(jpg|png|webp)$/.test(file.storageName)) {
    throw new Error("Invalid reference file path.");
  }

  return path.join(getReferenceUploadsDirectory(), submissionId, file.storageName);
}

export function isId(value: string): boolean {
  return /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
