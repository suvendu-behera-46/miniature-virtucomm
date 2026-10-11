import { getSiteSettings } from "@/lib/site-settings";
import { getGalleryImages, getStoreCategories, getStoreFaqs, getStoreProducts, getStoreTestimonials } from "@/lib/storefront";
import { whatsappLink } from "@/lib/whatsapp";
import { HomeContent } from "./home-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredProducts, galleryItems, testimonials, faqs, settings, categories] = await Promise.all([
    getStoreProducts({ featuredOnly: true, limit: 4 }),
    getGalleryImages({ featuredOnly: true }),
    getStoreTestimonials(),
    getStoreFaqs(),
    getSiteSettings(),
    getStoreCategories(),
  ]);

  return (
    <HomeContent
      featuredProducts={featuredProducts}
      galleryItems={galleryItems.slice(0, 8)}
      testimonials={testimonials.slice(0, 6)}
      faqs={faqs}
      categories={categories}
      whatsappUrl={whatsappLink(settings.whatsapp_number, "Hi! I'd like to share a reference photo for a custom miniature.")}
    />
  );
}
