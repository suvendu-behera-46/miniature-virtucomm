import { getGalleryImages } from "@/lib/storefront";
import { GalleryContent } from "./gallery-content";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  return <GalleryContent galleryImages={await getGalleryImages()} />;
}
