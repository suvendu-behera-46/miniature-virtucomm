import { NextResponse } from "next/server";
import { getStoreProducts } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ products: await getStoreProducts() });
}
