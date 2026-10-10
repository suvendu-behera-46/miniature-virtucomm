"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";

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
        <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)} aria-label="Stature 3D home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-sm font-bold tracking-wide text-white">S3</span>
          <span className="leading-tight">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-700">Stature</span>
            <span className="block text-sm font-semibold text-slate-950">3D Studio</span>
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

export function StorefrontFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="text-sm font-semibold tracking-wide">STATURE 3D</p>
          <p className="mt-1 text-sm text-slate-400">Personalized keepsakes, made to last.</p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
          <Link className="transition hover:text-white" href="/products">Products</Link>
          <Link className="transition hover:text-white" href="/gallery">Gallery</Link>
          <Link className="transition hover:text-white" href="/contact">Contact</Link>
        </nav>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Stature 3D Studio</p>
      </div>
    </footer>
  );
}
