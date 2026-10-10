import { NextResponse } from "next/server";
import { getStoreFaqs } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export async function GET() {
  const faqs = await getStoreFaqs();
  return NextResponse.json({ faqs: faqs.map((faq) => ({ question: faq.q, answer: faq.a })) });
}
