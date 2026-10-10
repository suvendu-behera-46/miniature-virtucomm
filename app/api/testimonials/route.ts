import { NextResponse } from "next/server";
import { getStoreTestimonials } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export async function GET() {
  const testimonials = await getStoreTestimonials();
  return NextResponse.json({ testimonials: testimonials.map(({ id, name, text, rating }) => ({ id, name, testimonial: text, rating })) });
}
