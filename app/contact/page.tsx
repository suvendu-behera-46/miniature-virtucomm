"use client";

import { motion } from "framer-motion";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-chrome";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white/55 text-slate-900 backdrop-blur-[1px]">
      <StorefrontHeader />
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Contact</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">Let’s create your custom miniature</h1>
      </motion.div>

      <div data-gsap-section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }} className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-xl">
          <h2 className="text-2xl font-bold">We’d love to hear your story</h2>
          <div className="mt-6 space-y-4 text-slate-200">
            <p>Phone: +91 98765 43210</p>
            <p>Email: hello@miniaturestudio.in</p>
            <p>India-wide delivery available</p>
          </div>
        </motion.div>

        <motion.form initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.08 }} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
              <input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500" placeholder="Your name" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
              <input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500" placeholder="Your phone number" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input type="email" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500" placeholder="you@example.com" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Project Details</label>
              <textarea rows={6} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500" placeholder="Tell us about the concept, people, pet, or occasion you want to memorialize." />
            </div>
          </div>

          <button type="submit" className="mt-6 rounded-full bg-cyan-600 px-6 py-3 font-semibold text-white">
            Send inquiry
          </button>
        </motion.form>
      </div>
      </div>
      <StorefrontFooter />
    </main>
  );
}
