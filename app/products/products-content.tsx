"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-chrome";

type ProductCard = { name: string; slug: string; price: string; tag: string; image: string | null };

export function ProductsContent({ products }: { products: ProductCard[] }) {
  return (
    <main className="min-h-screen bg-white/55 text-slate-900 backdrop-blur-[1px]">
      <StorefrontHeader />
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-600">Custom creations</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">Our miniature collections</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Crafted from your 2D photos or 3D reference images with personalization, story-driven detailing, and premium finishing for every special moment.
        </p>
      </motion.div>

      {products.length === 0 && (
        <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">New collections are coming soon. <Link href="/contact" className="font-semibold text-cyan-700">Tell us what you&apos;d like made.</Link></p>
      )}

      <div data-gsap-section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product, index) => (
          <motion.article
            key={product.slug}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/60"
          >
            {product.image && <img src={product.image} alt={product.name} className="h-64 w-full object-cover" />}
            <div className="p-5">
              <span className="inline-flex rounded-full bg-cyan-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                {product.tag}
              </span>
              <h2 className="mt-4 text-xl font-semibold text-slate-900">{product.name}</h2>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-slate-900">{product.price}</span>
                <Link href={`/product/${product.slug}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                  View detail
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
      </div>
      <StorefrontFooter />
    </main>
  );
}
