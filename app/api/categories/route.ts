import { NextResponse } from "next/server";
import { getStoreCategories } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ categories: await getStoreCategories() });
}
