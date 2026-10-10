import "server-only";

import prisma from "@/lib/prisma";

export const siteSettingFields = [
  { key: "business_name", label: "Business name", defaultValue: "Miniature Studio" },
  { key: "tagline", label: "Tagline", defaultValue: "Personalized keepsakes, made to last." },
  { key: "contact_email", label: "Contact email", defaultValue: "hello@miniaturestudio.in" },
  { key: "contact_phone", label: "Contact phone", defaultValue: "+91 98765 43210" },
  { key: "whatsapp_number", label: "WhatsApp number", defaultValue: "+91 98765 43210" },
  { key: "address", label: "Studio address", defaultValue: "India-wide delivery available" },
  { key: "shipping_fee", label: "Default shipping fee (₹)", defaultValue: "0" },
  { key: "production_time", label: "Typical production time", defaultValue: "12 to 18 working days" },
] as const;

export type SiteSettingKey = (typeof siteSettingFields)[number]["key"];
export type SiteSettings = Record<SiteSettingKey, string>;

export async function getSiteSettings(): Promise<SiteSettings> {
  const defaults = Object.fromEntries(siteSettingFields.map((field) => [field.key, field.defaultValue])) as SiteSettings;
  try {
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: siteSettingFields.map((field) => field.key) } } });
    for (const row of rows) defaults[row.key as SiteSettingKey] = row.value;
  } catch (error) {
    console.error("Site settings could not be loaded; using defaults.", error instanceof Error ? error.message : error);
  }
  return defaults;
}
