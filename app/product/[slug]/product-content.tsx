"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-chrome";

type ProductDetail = {
  name: string;
  price: string;
  comparePrice: string | null;
  heading: string | null;
  description: string | null;
  features: string[];
  productionTime: string | null;
  category: string | null;
  categorySlug: string | null;
  images: { src: string; alt: string }[];
};

export function ProductContent({ product, whatsappUrl }: { product: ProductDetail; whatsappUrl: string | null }) {
  const images = product.images;

  return (
    <main className="min-h-screen bg-white/55 text-slate-900 backdrop-blur-[1px]">
      <StorefrontHeader />
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Link href="/products" className="mb-6 inline-flex text-sm font-medium text-cyan-800 transition hover:text-cyan-600">
            ← Back to products
          </Link>
        </motion.div>

        <div data-gsap-section className="grid items-start gap-9 md:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] md:gap-12">
          <motion.div initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}>
            <ProductImageGallery images={images} productName={product.name} />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.06 }} className="md:sticky md:top-28">
          {product.categorySlug ? (
            <Link href={`/products?category=${product.categorySlug}`} className="text-sm uppercase tracking-[0.2em] text-cyan-600 hover:text-cyan-800">
              {product.category}
            </Link>
          ) : (
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-600">Custom miniature</p>
          )}
          <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">{product.name}</h1>
          {product.heading && <p className="mt-4 text-lg leading-relaxed text-slate-600">{product.heading}</p>}

          <div className="mt-6 flex items-end gap-4">
            <span className="text-3xl font-bold text-slate-900">{product.price}</span>
            {product.comparePrice && <span className="text-lg text-slate-400 line-through">{product.comparePrice}</span>}
          </div>

          {product.description && <p className="mt-5 whitespace-pre-line text-slate-600">{product.description}</p>}
          {product.productionTime && <p className="mt-3 text-sm text-slate-500">Production time: {product.productionTime}</p>}

          {product.features.length > 0 && <div className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            {product.features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.12 + index * 0.08 }}
                className="flex items-center gap-3 text-slate-700"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">✓</span>
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>}

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/#reference-upload" className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white shadow-lg shadow-slate-200">
              Start your order
            </Link>
            {whatsappUrl && <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Connect on WhatsApp
            </a>}
          </div>
          </motion.div>
        </div>
      </div>
      <StorefrontFooter />
    </main>
  );
}
