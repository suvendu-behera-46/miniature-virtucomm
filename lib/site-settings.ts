import "server-only";

import prisma from "@/lib/prisma";

export const siteSettingFields = [
  { key: "business_name", label: "Business name", defaultValue: "Mukti Miniature" },
  { key: "tagline", label: "Tagline", defaultValue: "Personalized keepsakes, made to last." },
  { key: "contact_email", label: "Contact email", defaultValue: "muktiminiature@gmail.com" },
  { key: "contact_phone", label: "Contact phone", defaultValue: "" },
  { key: "whatsapp_number", label: "WhatsApp number", defaultValue: "+91 90780 37535" },
  { key: "address", label: "Studio address", defaultValue: "India-wide delivery available" },
  { key: "shipping_fee", label: "Default shipping fee (₹)", defaultValue: "0" },
  { key: "production_time", label: "Typical production time", defaultValue: "12 to 18 working days" },
  { key: "instagram_url", label: "Instagram link", defaultValue: "" },
  { key: "facebook_url", label: "Facebook link", defaultValue: "" },
  { key: "youtube_url", label: "YouTube link", defaultValue: "" },
] as const;

// The logo is stored separately from the text fields above: its value is an
// uploaded image URL (/media/...), or empty for the bundled default.
export const logoSettingKey = "logo_url";
export const defaultLogoUrl = "/brand/mukti-logo.jpg";
// Stable URL that always serves the current logo, so pages, emails, and the
// favicon pick up a new logo without being rebuilt.
export const logoPath = "/brand-logo";

export async function getLogoUrl() {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: logoSettingKey } });
    return row?.value || defaultLogoUrl;
  } catch (error) {
    console.error("Logo setting could not be loaded; using the default.", error instanceof Error ? error.message : error);
    return defaultLogoUrl;
  }
}

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
