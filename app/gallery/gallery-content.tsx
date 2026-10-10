"use client";

import { motion } from "framer-motion";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-chrome";

type GalleryItem = { id: string; title: string; caption: string; image: string };

export function GalleryContent({ galleryImages }: { galleryImages: GalleryItem[] }) {
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
            key={item.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/60"
          >
            <img src={item.image} alt={item.title || "Handcrafted miniature"} className="h-80 w-full object-cover" />
            {(item.title || item.caption) && (
              <div className="p-5">
                {item.title && <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>}
                {item.caption && <p className="mt-1 text-sm text-slate-600">{item.caption}</p>}
              </div>
            )}
          </motion.div>
        ))}
      </div>
      </div>
      <StorefrontFooter />
    </main>
  );
}
