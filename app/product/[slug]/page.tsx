import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/site-settings";
import { getStoreProduct } from "@/lib/storefront";
import { whatsappLink } from "@/lib/whatsapp";
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
  const [product, settings, requestHeaders] = await Promise.all([getStoreProduct((await params).slug), getSiteSettings(), headers()]);
  if (!product) notFound();

  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const productUrl = host ? `${protocol}://${host}/product/${product.slug}` : "";
  const whatsappUrl = whatsappLink(
    settings.whatsapp_number,
    `Hi, I'm interested in the ${product.name} (${product.price}). Can you share more details?${productUrl ? `\n${productUrl}` : ""}`,
  );

  return <ProductContent product={product} whatsappUrl={whatsappUrl} />;
}
