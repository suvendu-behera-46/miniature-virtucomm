"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Gift,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
  MessageSquareQuote,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { ReferenceUploadForm } from "@/components/reference-upload-form";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-chrome";

const steps = [
  { title: "Upload your reference", text: "Share a clear 2D photo or 3D image of what you would like us to turn into a miniature." },
  { title: "We check if it is possible", text: "Our team reviews your image and confirms whether we can create the miniature before production begins." },
  { title: "We create your miniature", text: "Once approved, our artists sculpt, hand-finish, and carefully prepare your keepsake." },
];

type HomeProduct = { name: string; price: string; image: string | null; slug: string };
type HomeTestimonial = { id: string; name: string; text: string; rating: number };
type HomeFaq = { q: string; a: string };
type HomeGalleryItem = { id: string; title: string; image: string };

export function HomeContent({
  featuredProducts,
  galleryItems,
  testimonials,
  faqs,
}: {
  featuredProducts: HomeProduct[];
  galleryItems: HomeGalleryItem[];
  testimonials: HomeTestimonial[];
  faqs: HomeFaq[];
}) {
  return (
    <main className="text-slate-900">
      <StorefrontHeader />

      <section data-gsap-section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-20 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="min-w-0">
          <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-700 sm:text-xs sm:tracking-[0.22em]">
            <Sparkles className="h-3.5 w-3.5" /> Personalized keepsakes
          </span>
          <h1 className="mt-6 max-w-xl text-[clamp(2.25rem,10vw,3rem)] font-black leading-[1.08] tracking-[-0.04em] text-slate-900 sm:text-5xl sm:leading-[1.05] sm:tracking-tight xl:text-6xl">
            Preserve your story in a handcrafted 3D miniature.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-normal">
            Share a 2D photo or 3D image of your idea. Our team will check if it can be made, then create a hand-finished miniature just for you.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link href="#reference-upload" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:bg-cyan-500 sm:px-6 sm:text-base">
              Upload your reference <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/gallery" className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 sm:px-6 sm:text-base">
              View gallery
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 text-xs leading-tight text-slate-600 sm:mt-10 sm:gap-8 sm:text-sm">
            <div className="min-w-0">
              <p className="text-2xl font-black text-slate-900 sm:text-3xl">12k+</p>
              <p className="mt-1">happy families</p>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black text-slate-900 sm:text-3xl">4.9/5</p>
              <p className="mt-1">average rating</p>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black text-slate-900 sm:text-3xl">18d</p>
              <p className="mt-1">average production time</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative min-w-0">
          <div className="absolute -left-12 top-12 hidden h-32 w-32 rounded-full bg-cyan-200 blur-3xl sm:block" />
          <div className="absolute -right-10 bottom-10 hidden h-40 w-40 rounded-full bg-amber-200 blur-3xl sm:block" />
          <div className="miniature-showcase relative">
            <div className="miniature-showcase__heading">
              <span className="miniature-showcase__eyebrow"><Sparkles className="h-3.5 w-3.5" /> A little piece of you</span>
              <p className="mt-2 text-2xl font-bold text-slate-900">From image to keepsake</p>
              <p className="mt-1 text-sm text-slate-500">We review your reference before we create.</p>
            </div>

            <div
              className="miniature-showcase__canvas"
              role="img"
              aria-label="An animated story showing a customer uploading a 2D or 3D reference, our team checking if it can be made, and creating a hand-finished miniature"
            >
              <div className="miniature-showcase__photo">
                <svg viewBox="0 0 160 160" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="photo-sky" x1="80" y1="0" x2="80" y2="160" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#BAE6FD" />
                      <stop offset="1" stopColor="#FEF3C7" />
                    </linearGradient>
                  </defs>
                  <rect width="160" height="160" fill="url(#photo-sky)" />
                  <circle cx="126" cy="35" r="15" fill="#FDE68A" />
                  <path d="M0 103 43 58l38 45 27-30 52 49v38H0v-57Z" fill="#A7D6B0" />
                  <path d="m0 128 44-31 38 25 33-27 45 32v33H0v-32Z" fill="#78B88C" />
                  <ellipse cx="80" cy="144" rx="55" ry="8" fill="#3F805A" fillOpacity=".24" />
                  <path d="M39 145c2-25 9-38 22-38s20 13 22 38H39Z" fill="#4F7891" />
                  <circle cx="61" cy="95" r="14" fill="#F1C6A2" />
                  <path d="M47 95c-1-14 5-22 15-22 10 0 15 7 13 19l-4-8c-5 4-13 7-23 6l-1 5Z" fill="#49392F" />
                  <path d="M78 145c2-29 10-43 24-43s22 14 24 43H78Z" fill="#D87E6E" />
                  <circle cx="102" cy="99" r="15" fill="#E8B18E" />
                  <path d="M87 99c-2-15 5-24 16-24 11 0 17 9 14 22l-4-9c-6 5-14 8-25 7l-1 4Z" fill="#382F31" />
                </svg>
                <span className="miniature-showcase__scan" aria-hidden="true" />
                <span className="miniature-showcase__upload-badge" aria-hidden="true">
                  <Upload className="h-3.5 w-3.5" />
                </span>
                <span>2D / 3D image</span>
              </div>

              <div className="miniature-showcase__arrow" aria-hidden="true">
                <ArrowRight className="h-5 w-5" />
              </div>

              <div className="miniature-showcase__stage" aria-hidden="true">
              <div className="miniature-showcase__crafting">
                <svg viewBox="0 0 360 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="180" cy="263" rx="119" ry="19" fill="#0F172A" fillOpacity=".12" />
                  <path d="M65 224c0-8 6-14 14-14h202c8 0 14 6 14 14v21c0 17-14 31-31 31H96c-17 0-31-14-31-31v-21Z" fill="#B77949" />
                  <path d="M65 224c0-8 6-14 14-14h202c8 0 14 6 14 14v8c0 8-6 14-14 14H79c-8 0-14-6-14-14v-8Z" fill="#D9A875" />
                  <ellipse cx="180" cy="210" rx="115" ry="20" fill="#F0C99B" />
                  <ellipse cx="180" cy="207" rx="95" ry="13" fill="#E8B984" />
                  <path d="M122 202c3-29 15-47 38-51v-10h33v11c20 6 31 23 34 50h-105Z" fill="#C69B7B" />
                  <path d="M150 151c0-20 11-35 29-35s30 15 30 35v8c-6-5-11-12-14-19-11 10-26 15-45 15v-4Z" fill="#C69B7B" />
                  <ellipse cx="179" cy="116" rx="19" ry="21" fill="#C69B7B" />
                  <path d="M161 120c4 2 8 2 12 0m12 0c4 2 8 2 12 0" stroke="#A87B5F" strokeWidth="2" strokeLinecap="round" />
                  <path d="M171 134c5 3 10 3 15 0" stroke="#A87B5F" strokeWidth="2" strokeLinecap="round" />
                  <g className="miniature-showcase__craft-hand miniature-showcase__craft-hand--left">
                    <path d="M51 91c9-9 18-10 26-2l36 34 17 15-13 20-27-18-39-27c-8-6-8-15 0-22Z" fill="#E8B18E" />
                    <path d="m94 121 20 19" stroke="#D49470" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  <g className="miniature-showcase__craft-hand miniature-showcase__craft-hand--right">
                    <path d="M309 93c-9-9-18-10-26-2l-32 29-20 14 12 21 29-17 36-23c8-6 9-15 1-22Z" fill="#E8B18E" />
                    <path d="m269 121-20 17" stroke="#D49470" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  <g className="miniature-showcase__craft-tool">
                    <path d="m271 91-58 48" stroke="#815B3D" strokeWidth="8" strokeLinecap="round" />
                    <path d="m213 139-9 8 3-12 6 4Z" fill="#64748B" />
                    <path d="m270 91 8-7" stroke="#D6B38C" strokeWidth="3" strokeLinecap="round" />
                  </g>
                  <path d="M106 88v9m-4-4h8m139-22v9m-4-4h8" stroke="#F5B84B" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>Sculpting in progress</span>
              </div>

              <div className="miniature-showcase__sculpture">
                <svg viewBox="0 0 360 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="180" cy="263" rx="119" ry="19" fill="#0F172A" fillOpacity=".12" />
                  <path d="M65 224c0-8 6-14 14-14h202c8 0 14 6 14 14v21c0 17-14 31-31 31H96c-17 0-31-14-31-31v-21Z" fill="#B77949" />
                  <path d="M65 224c0-8 6-14 14-14h202c8 0 14 6 14 14v8c0 8-6 14-14 14H79c-8 0-14-6-14-14v-8Z" fill="#D9A875" />
                  <ellipse cx="180" cy="210" rx="115" ry="20" fill="#F0C99B" />
                  <ellipse cx="180" cy="207" rx="95" ry="13" fill="#E8B984" />
                  <g className="miniature-showcase__person miniature-showcase__person--left">
                    <path d="M105 196c2-31 15-50 39-54 25-4 44 13 48 54l-10 11h-67l-10-11Z" fill="#4F7891" />
                    <path d="m133 146 12 13 13-13 8 8-8 53h-28l-8-53 11-8Z" fill="#F8FAFC" />
                    <path d="M132 145c0-8 5-14 13-14s13 6 13 14l-13 15-13-15Z" fill="#F1C6A2" />
                    <rect x="123" y="97" width="45" height="53" rx="21" fill="#F1C6A2" />
                    <path d="M123 119c-4-24 7-38 25-38 15 0 24 11 22 30-5-6-9-12-10-18-8 12-20 17-37 18v8Z" fill="#49392F" />
                    <path d="M130 120c4 3 8 3 12 0m9 0c4 3 8 3 12 0" stroke="#674536" strokeWidth="2" strokeLinecap="round" />
                    <path d="M145 135c5 4 10 4 15 0" stroke="#C56F65" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  <g className="miniature-showcase__person miniature-showcase__person--right">
                    <path d="M174 196c3-34 17-53 43-54 28-1 43 19 46 54l-10 11h-69l-10-11Z" fill="#D87E6E" />
                    <path d="m202 145 14 14 13-14 8 9-8 53h-28l-8-53 9-9Z" fill="#FFF7ED" />
                    <path d="M201 145c0-8 6-14 14-14s14 6 14 14l-14 15-14-15Z" fill="#E8B18E" />
                    <rect x="191" y="96" width="48" height="54" rx="22" fill="#E8B18E" />
                    <path d="M190 119c-3-27 8-41 27-41 18 0 28 14 22 39l-4 3-3-20c-9 7-21 11-39 11l-3 8Z" fill="#382F31" />
                    <path d="M198 120c4 3 8 3 12 0m10 0c4 3 8 3 12 0" stroke="#674536" strokeWidth="2" strokeLinecap="round" />
                    <path d="M207 135c5 4 11 4 16 0" stroke="#C56F65" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  <path d="M146 208h69" stroke="#D39B67" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="80" cy="119" r="3" fill="#F5B84B" />
                  <path d="M279 91v12m-6-6h12" stroke="#F5B84B" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>Hand-finished</span>
              </div>
              <div className="miniature-showcase__review">
                <svg viewBox="0 0 360 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="180" cy="263" rx="116" ry="18" fill="#0F172A" fillOpacity=".1" />
                  <rect x="72" y="43" width="216" height="216" rx="25" fill="white" stroke="#DCE7EE" strokeWidth="4" />
                  <rect x="94" y="65" width="172" height="112" rx="16" fill="#E0F2FE" />
                  <circle cx="228" cy="91" r="12" fill="#FDE68A" />
                  <path d="m94 149 42-42 34 35 24-23 72 61H94v-31Z" fill="#86B99A" />
                  <circle cx="150" cy="125" r="15" fill="#E8B18E" />
                  <path d="M129 164c2-20 9-29 21-29s20 9 22 29h-43Z" fill="#D87E6E" />
                  <rect x="94" y="193" width="104" height="10" rx="5" fill="#CBD5E1" />
                  <rect x="94" y="212" width="71" height="8" rx="4" fill="#E2E8F0" />
                  <circle cx="239" cy="207" r="27" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="3" />
                  <path d="m226 207 9 9 18-20" stroke="#059669" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M63 111v12m-6-6h12m229-47v12m-6-6h12" stroke="#F5B84B" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <span>Feasible to make</span>
              </div>
              </div>
            </div>

            <div className="miniature-showcase__steps" aria-hidden="true">
              <span><i className="miniature-showcase__step-dot miniature-showcase__step-dot--upload" /> Upload</span>
              <span className="miniature-showcase__step-line" />
              <span><i className="miniature-showcase__step-dot miniature-showcase__step-dot--review" /> Review</span>
              <span className="miniature-showcase__step-line" />
              <span><i className="miniature-showcase__step-dot miniature-showcase__step-dot--create" /> Create</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="reference-upload" data-gsap-section className="mx-auto max-w-7xl scroll-mt-8 px-6 py-16">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Start with your image</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Share your 2D photo or 3D reference</h2>
          <p className="mt-3 text-slate-600">Send us your image and a few details. Our team will review whether it can be made into a miniature before production begins.</p>
        </div>
        <ReferenceUploadForm />
      </section>

      {featuredProducts.length > 0 && (
      <section data-gsap-section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Our collections</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Popular custom keepsakes</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <motion.article
              key={product.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/60"
            >
              {product.image && <img src={product.image} alt={product.name} className="h-64 w-full object-cover" />}
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Custom art</p>
                <h3 className="mt-3 text-xl font-bold text-slate-900">{product.name}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">{product.price}</span>
                  <Link href={`/product/${product.slug}`} className="text-sm font-semibold text-cyan-700">
                    View details
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
      )}

      <section data-gsap-section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-400">How it works</p>
            <h2 className="mt-3 text-3xl font-bold">Simple, guided, and memorable</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.12 }} className="rounded-[2rem] border border-slate-700 bg-slate-800/80 p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-lg font-bold text-cyan-300">
                  0{index + 1}
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-slate-300">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section data-gsap-section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Why people choose us</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Premium quality, personal care, unforgettable memories</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="rounded-[2rem] border border-slate-200 p-6">
            <Gift className="mb-4 h-10 w-10 text-cyan-600" />
            <h3 className="text-xl font-bold text-slate-900">Perfect gifting</h3>
            <p className="mt-3 text-slate-600">Ideal for anniversaries, weddings, birthdays, housewarmings, and memorial keepsakes that feel deeply personal.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="rounded-[2rem] border border-slate-200 p-6">
            <Palette className="mb-4 h-10 w-10 text-cyan-600" />
            <h3 className="text-xl font-bold text-slate-900">Hand-finished detail</h3>
            <p className="mt-3 text-slate-600">Every sculpt is carefully painted and refined to reflect the real expressions, outfits, and textures in your reference photos.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="rounded-[2rem] border border-slate-200 p-6">
            <ShieldCheck className="mb-4 h-10 w-10 text-cyan-600" />
            <h3 className="text-xl font-bold text-slate-900">Trusted process</h3>
            <p className="mt-3 text-slate-600">We review every reference for feasibility before production, then focus on careful hand-finishing, quality checks, and safe delivery.</p>
          </motion.div>
        </div>
      </section>

      {galleryItems.length > 0 && (
      <section data-gsap-section className="bg-amber-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Our gallery</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">A closer look at our handcrafted pieces</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            {galleryItems.map((item, index) => (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: index * 0.08 }} key={item.id} className="overflow-hidden rounded-[1.5rem] border border-amber-200 bg-white shadow-md">
                <img src={item.image} alt={item.title || `Gallery miniature ${index + 1}`} className="h-72 w-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {testimonials.length > 0 && (
      <section data-gsap-section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Testimonials</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Loved by families, couples, and gift-givers</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.12 }} key={testimonial.id} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4 flex items-center gap-1 text-amber-500">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <MessageSquareQuote className="mb-4 h-8 w-8 text-cyan-600" />
              <p className="text-slate-700">“{testimonial.text}”</p>
              <p className="mt-5 font-semibold text-slate-900">{testimonial.name}</p>
            </motion.div>
          ))}
        </div>
      </section>
      )}

      {faqs.length > 0 && (
      <section data-gsap-section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-400">FAQ</p>
            <h2 className="mt-3 text-3xl font-bold">Everything you may want to know</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((item, index) => (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.08 }} key={item.q} className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-cyan-400" />
                  <div>
                    <p className="font-semibold text-white">{item.q}</p>
                    <p className="mt-2 text-slate-300">{item.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      <section data-gsap-section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[2rem] bg-gradient-to-r from-cyan-600 to-sky-500 p-10 text-center text-white shadow-xl shadow-cyan-200">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-100">Start your custom order</p>
          <h2 className="mt-4 text-3xl font-bold">Bring your story to life in miniature.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-cyan-50">
            Whether it is a wedding gift, family portrait, pet keepsake, or a special anniversary memory, we are ready to craft it with care.
          </p>
          <Link href="/products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-900">
            Start custom order <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <StorefrontFooter />
    </main>
  );
}
