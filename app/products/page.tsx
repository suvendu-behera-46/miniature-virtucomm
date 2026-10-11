import type { Metadata } from "next";
import { getStoreCategories, getStoreProducts } from "@/lib/storefront";
import { ProductsContent } from "./products-content";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ category?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category: slug } = await searchParams;
  if (!slug) return {};
  const category = (await getStoreCategories()).find((item) => item.slug === slug);
  return category ? { title: `${category.name} miniatures | Miniature Studio`, description: category.description ?? undefined } : {};
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category: slug } = await searchParams;
  const categories = await getStoreCategories();
  const activeCategory = slug ? categories.find((item) => item.slug === slug) ?? null : null;
  // An unknown or hidden category shows an empty list rather than every product.
  const products = slug && !activeCategory ? [] : await getStoreProducts({ categoryId: activeCategory?.id });

  return <ProductsContent products={products} categories={categories} activeCategory={activeCategory} requestedSlug={slug ?? null} />;
}
