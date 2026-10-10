"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-chrome";

const productData = {
  "custom-couple-miniature": {
    name: "Custom Couple Miniature",
    price: "₹5,999",
    heading: "An anniversary keepsake handcrafted from your memories.",
    description:
      "A personalized couple miniature made from your reference photos, with custom outfit detailing, pose matching, and premium finishing to preserve your story beautifully.",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    features: ["2 to 5 persons available", "Premium hand-painted finish", "Feasibility review before production", "Free nationwide delivery"],
  },
  "family-heritage-miniature": {
    name: "Family Heritage Miniature",
    price: "₹6,999",
    heading: "A family portrait you can hold forever.",
    description:
      "Celebrate your parents, grandparents, or the whole family with a detailed miniature sculpture inspired by real family portraits and cherished memories.",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
    features: ["Family of 4+ members", "Custom outfit and pose styling", "Gift-ready packaging", "Made in India"],
  },
  "pet-portrait-keepsake": {
    name: "Pet Portrait Keepsake",
    price: "₹4,799",
    heading: "Your best friend deserves a forever keepsake.",
    description:
      "From fluffy companions to playful puppies, we sculpt and finish each pet miniature to reflect their character, expression, and favorite pose.",
    image:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80",
    features: ["Pet-specific portrait styling", "Full-body or half-body options", "Hand-painted detailing", "Reference feasibility review"],
  },
  "wedding-keepsake": {
    name: "Wedding Keepsake",
    price: "₹7,499",
    heading: "A meaningful wedding memory to keep forever.",
    description:
      "Capture the joy of your ceremony in a sculpted wedding piece that tells your story through pose, clothing, flowers, and decorative details.",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    features: ["Wedding themed custom design", "Miniature for the couple", "Premium display base", "Carefully packed for gifting"],
  },
  "friends-group-miniature": {
    name: "Friends Group Miniature",
    price: "₹7,999",
    heading: "Celebrate the bond that never fades.",
    description:
      "A friendship keepsake for your closest circle, personalized with your photos and styled to reflect each person and the mood of your group.",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
    features: ["Group portrait customization", "Couples or friend groups", "Color and accessory matching", "Celebration-ready finish"],
  },
  "solo-bike-miniature": {
    name: "Solo Bike Miniature",
    price: "₹5,999",
    heading: "A bike tribute made with precision and personality.",
    description:
      "Perfect for riders, enthusiasts, and milestone possessions, this miniature captures your bike design, stance, and color in a display-ready collectible.",
    image:
      "https://images.unsplash.com/photo-1558980664-10e7170b5df9?auto=format&fit=crop&w=1200&q=80",
    features: ["Bike custom detailing", "Display-friendly finish", "Premium paint and texture", "Personalized base design"],
  },
  "corporate-team-miniature": {
    name: "Corporate Team Miniature",
    price: "₹9,499",
    heading: "A professional keepsake for your team and milestones.",
    description:
      "Great for corporate gifting, employee recognition, and brand memories, built with a clean presentation and custom finishing for business occasions.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    features: ["Corporate gifting", "Team or leadership pieces", "Professional finish", "Great for awards and events"],
  },
  "premium-bronze-sculpture": {
    name: "Premium Bronze Sculpture",
    price: "₹12,999",
    heading: "A luxury heirloom for your most meaningful memories.",
    description:
      "A premium-grade sculpture ideal for legacy gifting, milestone moments, and display-focused keepsakes with a more refined metal-inspired finish.",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
    features: ["Luxury finish", "Collector-grade detailing", "Elegant display base", "Ideal for premium gifting"],
  },
};

const additionalProductImages: Record<string, string[]> = {
  "custom-couple-miniature": [
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=85",
  ],
  "family-heritage-miniature": [
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1476231682828-37e571bc172f?auto=format&fit=crop&w=1200&q=85",
  ],
  "pet-portrait-keepsake": [
    "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=85",
  ],
  "wedding-keepsake": [
    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85",
  ],
  "friends-group-miniature": [
    "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85",
  ],
  "solo-bike-miniature": [
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1558980664-10e7170b5df9?auto=format&fit=crop&w=1200&q=85",
  ],
  "corporate-team-miniature": [
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85",
  ],
  "premium-bronze-sculpture": [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1200&q=85",
  ],
};

export default function ProductDetailPage() {
  const params = useParams<{ slug?: string }>();
  const slug = params.slug;
  const product = productData[slug as keyof typeof productData];

  if (!product) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20">
        <p className="text-xl font-semibold text-slate-800">Product not found.</p>
        <Link href="/products" className="mt-6 inline-block rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">
          Back to products
        </Link>
      </main>
    );
  }

  const images = [product.image, ...(additionalProductImages[slug ?? ""] ?? [])].map((src, index) => ({
    src,
    alt: `${product.name} ${index === 0 ? "main view" : `detail view ${index}`}`,
  }));

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
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-600">Custom miniature</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">{product.heading}</p>

          <div className="mt-6 flex items-end gap-4">
            <span className="text-3xl font-bold text-slate-900">{product.price}</span>
            <span className="text-lg text-slate-400 line-through">₹7,999</span>
          </div>

          <p className="mt-5 text-slate-600">{product.description}</p>

          <div className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
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
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white shadow-lg shadow-slate-200">
              Start your order
            </button>
            <Link href="/contact" className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-900">
              Talk to us
            </Link>
          </div>
          </motion.div>
        </div>
      </div>
      <StorefrontFooter />
    </main>
  );
}
