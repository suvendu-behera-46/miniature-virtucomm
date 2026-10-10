import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    businessName: "Miniature Studio",
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    email: "hello@miniaturestudio.in",
    currency: "INR",
  });
}
