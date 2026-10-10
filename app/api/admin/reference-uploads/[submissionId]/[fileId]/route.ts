import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getReferenceFilePath, readSubmission } from "@/lib/reference-uploads";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ submissionId: string; fileId: string }> },
) {
  const session = await auth();
  if (!session?.user || (session.user as typeof session.user & { role?: string }).role === "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId, fileId } = await params;

  try {
    const submission = await readSubmission(submissionId);
    const file = submission.files.find((item) => item.id === fileId);
    if (!file) return NextResponse.json({ error: "Reference image not found." }, { status: 404 });

    const bytes = await readFile(getReferenceFilePath(submissionId, file));
    return new Response(bytes, {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return NextResponse.json({ error: "Reference image not found." }, { status: 404 });
    }
    console.error("Reference image could not be retrieved.", error);
    return NextResponse.json({ error: "Reference image could not be retrieved." }, { status: 500 });
  }
}
