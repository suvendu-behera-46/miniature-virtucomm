import { readStoredMedia } from "@/lib/media-storage";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const media = await readStoredMedia((await params).name);
  if (!media) return new Response("Not found", { status: 404 });

  return new Response(media.bytes, {
    headers: {
      "Content-Type": media.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
