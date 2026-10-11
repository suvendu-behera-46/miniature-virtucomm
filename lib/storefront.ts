import "server-only";

import { formatCurrency, toNumber } from "@/lib/format";
import prisma from "@/lib/prisma";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  price: string;
  priceValue: number;
  comparePrice: string | null;
  image: string | null;
  tag: string;
  category: string | null;
  categorySlug: string | null;
  shortDescription: string | null;
};

const placeholderImage = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80";

function productTag(product: { featured: boolean; popular: boolean; newProduct: boolean; category: { name: string } | null }) {
  if (product.popular) return "Popular";
  if (product.newProduct) return "New";
  if (product.featured) return "Featured";
  return product.category?.name ?? "Custom";
}

export async function getStoreProducts({
  featuredOnly = false,
  limit,
  categoryId,
}: { featuredOnly?: boolean; limit?: number; categoryId?: string } = {}): Promise<StoreProduct[]> {
  const query = (featured: boolean) =>
    prisma.product.findMany({
      where: { active: true, ...(featured ? { featured: true } : {}), ...(categoryId ? { categoryId } : {}) },
      include: { category: true, images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 } },
      orderBy: [{ category: { displayOrder: "asc" } }, { createdAt: "asc" }],
      take: limit,
    });

  let products = await query(featuredOnly);
  // Fall back to the latest products when none are marked as featured.
  if (featuredOnly && products.length === 0) products = await query(false);

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: formatCurrency(product.basePrice),
    priceValue: toNumber(product.basePrice),
    comparePrice: product.comparePrice ? formatCurrency(product.comparePrice) : null,
    image: product.images[0]?.url ?? placeholderImage,
    tag: productTag(product),
    category: product.category?.active ? product.category.name : null,
    categorySlug: product.category?.active ? product.category.slug : null,
    shortDescription: product.shortDescription,
  }));
}

export async function getStoreProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: { category: true, images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] } },
  });
  if (!product) return null;

  return {
    name: product.name,
    slug: product.slug,
    price: formatCurrency(product.basePrice),
    comparePrice: product.comparePrice ? formatCurrency(product.comparePrice) : null,
    heading: product.shortDescription,
    description: product.fullDescription,
    features: (product.features ?? "").split("\n").map((line) => line.trim()).filter(Boolean),
    productionTime: product.productionTime,
    material: product.material,
    category: product.category?.active ? product.category.name : null,
    categorySlug: product.category?.active ? product.category.slug : null,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    images: (product.images.length ? product.images.map((image) => image.url) : [placeholderImage]).map((src, index) => ({
      src,
      alt: `${product.name} ${index === 0 ? "main view" : `detail view ${index}`}`,
    })),
  };
}

export async function getStoreTestimonials() {
  const testimonials = await prisma.testimonial.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  return testimonials.map((item) => ({ id: item.id, name: item.name, text: item.testimonial, rating: item.rating ?? 5, featured: item.featured }));
}

export async function getStoreFaqs() {
  const faqs = await prisma.fAQ.findMany({ where: { active: true }, orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
  return faqs.map((item) => ({ q: item.question, a: item.answer }));
}

export async function getGalleryImages({ featuredOnly = false } = {}) {
  const images = await prisma.galleryImage.findMany({
    where: { active: true, gallery: { active: true }, ...(featuredOnly ? { featured: true } : {}) },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return images.map((image) => ({ id: image.id, title: image.title ?? "", caption: image.caption ?? "", image: image.imageUrl }));
}

export type StoreCategory = { id: string; name: string; slug: string; description: string | null; image: string; productCount: number };

// Active categories that have at least one published product, with a cover
// image (the category's own, or its first product's main image).
export async function getStoreCategories(): Promise<StoreCategory[]> {
  const categories = await prisma.category.findMany({
    where: { active: true, products: { some: { active: true } } },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { products: { where: { active: true } } } },
      products: {
        where: { active: true, images: { some: {} } },
        take: 1,
        orderBy: { createdAt: "asc" },
        select: { images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1, select: { url: true } } },
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.coverImage || category.products[0]?.images[0]?.url || placeholderImage,
    productCount: category._count.products,
  }));
}
