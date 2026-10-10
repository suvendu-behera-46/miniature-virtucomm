import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    faqs: [
      { question: "How long does production take?", answer: "Usually 12–15 working days." },
      { question: "Can I customize the outfit and pose?", answer: "Yes, the admin panel can enable product-specific customization options." },
      { question: "Do you ship nationwide?", answer: "Yes, delivery is available across India." },
    ],
  });
}
