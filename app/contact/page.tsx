import { getSiteSettings } from "@/lib/site-settings";
import { ContactPageContent } from "./contact-content";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return <ContactPageContent contact={{ phone: settings.contact_phone, email: settings.contact_email, address: settings.address }} />;
}
