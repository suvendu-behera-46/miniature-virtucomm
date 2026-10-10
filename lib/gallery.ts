import "server-only";

import prisma from "@/lib/prisma";

export const MAIN_GALLERY_SLUG = "main";

export async function getMainGalleryId() {
  const gallery = await prisma.gallery.upsert({
    where: { slug: MAIN_GALLERY_SLUG },
    create: { slug: MAIN_GALLERY_SLUG, title: "Studio gallery" },
    update: {},
    select: { id: true },
  });
  return gallery.id;
}
