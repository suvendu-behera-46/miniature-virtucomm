import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hero: {
      title: "Turn memories into handcrafted 3D miniatures",
      subtitle: "Custom sculpted keepsakes for families, couples, pets, and special celebrations.",
      ctaText: "Create yours",
      ctaLink: "/products",
    },
    featuredProducts: [
      { name: "Family Miniature", slug: "family-miniature", price: "₹4,999" },
      { name: "Couple Portrait", slug: "couple-portrait", price: "₹7,499" },
    ],
  });
}
