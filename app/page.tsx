import { getGalleryImages, getStoreFaqs, getStoreProducts, getStoreTestimonials } from "@/lib/storefront";
import { HomeContent } from "./home-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredProducts, galleryItems, testimonials, faqs] = await Promise.all([
    getStoreProducts({ featuredOnly: true, limit: 4 }),
    getGalleryImages({ featuredOnly: true }),
    getStoreTestimonials(),
    getStoreFaqs(),
  ]);

  return (
    <HomeContent
      featuredProducts={featuredProducts}
      galleryItems={galleryItems.slice(0, 8)}
      testimonials={testimonials.slice(0, 6)}
      faqs={faqs}
    />
  );
}
