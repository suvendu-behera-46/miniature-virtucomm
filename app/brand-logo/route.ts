import { getLogoUrl } from "@/lib/site-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Redirects to the logo chosen in Admin → Settings. A relative Location keeps
// this working behind the cPanel proxy, whose public host differs from request.url.
export async function GET() {
  return new Response(null, {
    status: 307,
    headers: { Location: await getLogoUrl(), "Cache-Control": "public, max-age=60, must-revalidate" },
  });
}
