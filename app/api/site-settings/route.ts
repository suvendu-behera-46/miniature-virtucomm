import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({
    businessName: settings.business_name,
    phone: settings.contact_phone,
    whatsapp: settings.whatsapp_number,
    email: settings.contact_email,
    address: settings.address,
    currency: "INR",
  });
}
