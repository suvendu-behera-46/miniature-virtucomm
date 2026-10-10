import { NextResponse } from "next/server";
import { getStoreProducts } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export async function GET() {
  const featured = await getStoreProducts({ featuredOnly: true, limit: 4 });
  return NextResponse.json({
    hero: {
      title: "Preserve your story in a handcrafted 3D miniature.",
      ctaText: "Upload your reference",
      ctaLink: "/#reference-upload",
    },
    featuredProducts: featured.map(({ name, slug, price }) => ({ name, slug, price })),
  });
}
