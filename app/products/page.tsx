"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-chrome";

const products = [
  {
    name: "Custom Couple Miniature",
    slug: "custom-couple-miniature",
    price: "₹5,999",
    tag: "Best seller",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Family Heritage Miniature",
    slug: "family-heritage-miniature",
    price: "₹6,999",
    tag: "Popular",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Pet Portrait Keepsake",
    slug: "pet-portrait-keepsake",
    price: "₹4,799",
    tag: "New",
    image:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Wedding Keepsake",
    slug: "wedding-keepsake",
    price: "₹7,499",
    tag: "Featured",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Friends Group Miniature",
    slug: "friends-group-miniature",
    price: "₹7,999",
    tag: "Custom",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Solo Bike Miniature",
    slug: "solo-bike-miniature",
    price: "₹5,999",
    tag: "Premium",
    image:
      "https://images.unsplash.com/photo-1558980664-10e7170b5df9?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Corporate Team Miniature",
    slug: "corporate-team-miniature",
    price: "₹9,499",
    tag: "Business",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Premium Bronze Sculpture",
    slug: "premium-bronze-sculpture",
    price: "₹12,999",
    tag: "Luxury",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
  },
];

export default function ProductsPage() {
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
            <img src={product.image} alt={product.name} className="h-64 w-full object-cover" />
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
