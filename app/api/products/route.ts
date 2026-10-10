import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    products: [
      {
        id: "prod_1",
        name: "Family Miniature",
        slug: "family-miniature",
        shortDescription: "Custom family sculpture for your home.",
        basePrice: 4999,
        category: "Family",
      },
      {
        id: "prod_2",
        name: "Couple Portrait",
        slug: "couple-portrait",
        shortDescription: "A carefully curated couple keepsake.",
        basePrice: 7499,
        category: "Couple",
      },
    ],
  });
}
