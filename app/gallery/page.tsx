"use client";

import { motion } from "framer-motion";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-chrome";

const galleryImages = [
  {
    title: "Custom Couple Miniature",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Wedding Keepsake",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Pet Portrait",
    image:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Family Memory",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Couple Anniversary",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Premium Display Piece",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
  },
];

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-white/55 text-slate-900 backdrop-blur-[1px]">
      <StorefrontHeader />
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Gallery</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">Handcrafted moments from our studio</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          A look at some of the real memories our customers have entrusted us to preserve in durable, detailed 3D keepsakes.
        </p>
      </motion.div>

      <div data-gsap-section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {galleryImages.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/60"
          >
            <img src={item.image} alt={item.title} className="h-80 w-full object-cover" />
            <div className="p-5">
              <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
            </div>
          </motion.div>
        ))}
      </div>
      </div>
      <StorefrontFooter />
    </main>
  );
}
