"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

// Served by app/brand-logo/route.ts, which points at the logo set in Admin → Settings.
const logoSrc = "/brand-logo";

const links = [
  { href: "/products", label: "Products" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
  { href: "/account", label: "My account" },
];

export function StorefrontHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)} aria-label="Mukti Miniature home">
          {/* eslint-disable-next-line @next/next/no-img-element -- the logo is swapped at runtime from the admin panel */}
          <img src={logoSrc} alt="" width={52} height={52} className="h-[52px] w-[52px] rounded-full bg-white object-cover" />
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-[0.18em] text-slate-950">MUKTI</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-700">Miniature</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm font-medium transition-colors hover:text-cyan-700 ${active ? "text-cyan-800" : "text-slate-600"}`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/products" className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-cyan-800">
            Create a keepsake <ArrowUpRight className="h-4 w-4" />
          </Link>
        </nav>

        <button
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 text-slate-800 transition hover:border-cyan-600 hover:text-cyan-700 md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
          >
            <div className="mx-auto grid max-w-7xl gap-1 px-5 py-3 sm:px-8">
              {links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${active ? "bg-cyan-50 text-cyan-800" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link href="/products" onClick={() => setMenuOpen(false)} className="mt-1 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white">
                Create a keepsake
              </Link>
            </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

type FooterSettings = {
  businessName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  productionTime: string;
  social: { instagram: string; facebook: string; youtube: string };
};
type FooterCategory = { name: string; slug: string };

// Fetched once per visit and shared across client-side navigations. The footer
// sits inside client pages, so it reads the admin-managed details from the API.
let footerData: Promise<{ settings: FooterSettings | null; categories: FooterCategory[] }> | undefined;
function loadFooterData() {
  footerData ??= Promise.all([
    fetch("/api/site-settings").then((response) => (response.ok ? response.json() : null)).catch(() => null),
    fetch("/api/categories").then((response) => (response.ok ? response.json() : null)).catch(() => null),
  ]).then(([settings, categories]) => ({ settings, categories: categories?.categories ?? [] }));
  return footerData;
}

const exploreLinks = [
  { href: "/products", label: "All products" },
  { href: "/gallery", label: "Gallery" },
  { href: "/#reference-upload", label: "Share your photo" },
  { href: "/contact", label: "Contact us" },
  { href: "/account", label: "My account" },
];

export function StorefrontFooter() {
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [categories, setCategories] = useState<FooterCategory[]>([]);

  useEffect(() => {
    let active = true;
    loadFooterData().then((data) => {
      if (!active) return;
      setSettings(data.settings);
      setCategories(data.categories.slice(0, 6));
    });
    return () => {
      active = false;
    };
  }, []);

  const name = settings?.businessName || "Mukti Miniature";
  const whatsappUrl = settings?.whatsapp ? whatsappLink(settings.whatsapp, `Hi ${name}, I'd like to order a custom miniature.`) : null;
  const socials = [
    { label: "Instagram", href: settings?.social.instagram, icon: <InstagramIcon /> },
    { label: "Facebook", href: settings?.social.facebook, icon: <FacebookIcon /> },
    { label: "YouTube", href: settings?.social.youtube, icon: <YoutubeIcon /> },
  ].filter((social) => social.href);

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex flex-col gap-5 border-b border-slate-800 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-semibold">Have a photo you&apos;d love to keep forever?</p>
            <p className="mt-1 text-sm text-slate-400">Send it to us and we&apos;ll tell you how it can become a handcrafted miniature.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/#reference-upload" className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100">
              Share your photo <ArrowUpRight className="h-4 w-4" />
            </Link>
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-700 px-5 text-sm font-semibold text-white transition hover:border-green-500 hover:text-green-300">
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-4" aria-label={`${name} home`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- the logo is swapped at runtime from the admin panel */}
              <img src={logoSrc} alt="" width={64} height={64} className="h-16 w-16 rounded-full bg-white object-cover" />
              <span>
                <span className="block text-base font-semibold tracking-wide">{name}</span>
                <span className="mt-0.5 block text-sm text-slate-400">{settings?.tagline || "Personalized keepsakes, made to last."}</span>
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
              Handcrafted 3D miniatures of the people and pets you love, made from your photos and delivered across India.
            </p>
            {socials.length > 0 && (
              <div className="mt-5 flex gap-3">
                {socials.map((social) => (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="grid h-10 w-10 place-items-center rounded-full border border-slate-700 text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300">
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          <FooterColumn title="Shop">
            {categories.map((category) => (
              <FooterLink key={category.slug} href={`/products?category=${encodeURIComponent(category.slug)}`}>{category.name}</FooterLink>
            ))}
            <FooterLink href="/products">View all miniatures</FooterLink>
          </FooterColumn>

          <FooterColumn title="Explore">
            {exploreLinks.map((link) => <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>)}
          </FooterColumn>

          <FooterColumn title="Get in touch" className="col-span-2 lg:col-span-1">
            {whatsappUrl && settings && (
              <ContactRow icon={<MessageCircle className="h-4 w-4" />}>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">{settings.whatsapp} (WhatsApp)</a>
              </ContactRow>
            )}
            {settings?.phone && (
              <ContactRow icon={<Phone className="h-4 w-4" />}>
                <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="transition hover:text-white">{settings.phone}</a>
              </ContactRow>
            )}
            {settings?.email && (
              <ContactRow icon={<Mail className="h-4 w-4" />}>
                <a href={`mailto:${settings.email}`} className="break-all transition hover:text-white">{settings.email}</a>
              </ContactRow>
            )}
            {settings?.address && <ContactRow icon={<MapPin className="h-4 w-4" />}>{settings.address}</ContactRow>}
            {settings?.productionTime && <ContactRow icon={<Clock className="h-4 w-4" />}>Ready in {settings.productionTime}</ContactRow>}
          </FooterColumn>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-800 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
          <p>Handcrafted with care in India</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">{title}</p>
      <ul className="mt-4 space-y-3 text-sm text-slate-300">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className="transition hover:text-white">{children}</Link>
    </li>
  );
}

function ContactRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 shrink-0 text-cyan-400">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

// lucide-react no longer ships brand icons, so these are drawn inline.
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}
