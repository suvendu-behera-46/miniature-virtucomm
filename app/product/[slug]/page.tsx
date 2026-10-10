import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoreProduct } from "@/lib/storefront";
import { ProductContent } from "./product-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getStoreProduct((await params).slug);
  if (!product) return {};
  return {
    title: product.seoTitle || `${product.name} | Miniature Studio`,
    description: product.seoDescription || product.heading || undefined,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getStoreProduct((await params).slug);
  if (!product) notFound();
  return <ProductContent product={product} />;
}
