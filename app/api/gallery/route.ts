import { NextResponse } from "next/server";
import { getGalleryImages } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ items: await getGalleryImages() });
}
