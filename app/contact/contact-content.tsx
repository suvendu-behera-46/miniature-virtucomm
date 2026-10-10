"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-chrome";

type ContactDetails = { phone: string; email: string; address: string };

export function ContactPageContent({ contact }: { contact: ContactDetails }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setSent("");
    setSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result: { error?: string; message?: string } = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Your message could not be sent.");
      form.reset();
      setSent(result.message || "Thanks! We'll be in touch soon.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Your message could not be sent.");
    } finally {
      setSending(false);
    }
  };

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
            {contact.phone && <p>Phone: <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-cyan-300">{contact.phone}</a></p>}
            {contact.email && <p>Email: <a href={`mailto:${contact.email}`} className="hover:text-cyan-300">{contact.email}</a></p>}
            {contact.address && <p>{contact.address}</p>}
          </div>
        </motion.div>

        <motion.form initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.08 }} onSubmit={onSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
              <input name="name" required minLength={2} maxLength={120} autoComplete="name" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500" placeholder="Your name" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
              <input name="phone" type="tel" maxLength={30} autoComplete="tel" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500" placeholder="Your phone number" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input name="email" type="email" maxLength={254} autoComplete="email" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500" placeholder="you@example.com" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Project Details</label>
              <textarea name="message" required minLength={5} maxLength={5000} rows={6} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500" placeholder="Tell us about the concept, people, pet, or occasion you want to memorialize." />
            </div>
          </div>

          {error && <p role="alert" className="mt-4 text-sm font-medium text-rose-700">{error}</p>}
          {sent && <p role="status" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" /> {sent}</p>}
          <button type="submit" disabled={sending} className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-600 px-6 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60">
            {sending && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {sending ? "Sending…" : "Send inquiry"}
          </button>
        </motion.form>
      </div>
      </div>
      <StorefrontFooter />
    </main>
  );
}
