"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { SeasonalTheme } from "@/lib/seasonal-theme";

const fallbackImage = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=80";
const defaultWash = 0.68;

const inactiveTheme: SeasonalTheme = {
  enabled: false,
  title: "",
  subtitle: "",
  startsAt: "",
  endsAt: "",
  accentColor: "#0e7490",
  overlayOpacity: 55,
  images: [],
};

export function SeasonalThemeBackground() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [theme, setTheme] = useState(inactiveTheme);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    fetch("/api/seasonal-theme", { cache: "no-store" })
      .then((response) => response.json())
      .then((result: SeasonalTheme) => {
        if (!mounted || !result.enabled || !Array.isArray(result.images) || result.images.length === 0) return;
        const now = Date.now();
        const startsAt = result.startsAt ? Date.parse(result.startsAt) : null;
        const endsAt = result.endsAt ? Date.parse(result.endsAt) : null;
        if ((startsAt !== null && (Number.isNaN(startsAt) || now < startsAt)) || (endsAt !== null && (Number.isNaN(endsAt) || now > endsAt))) return;
        setTheme(result);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!theme.enabled || theme.images.length < 2 || reduceMotion) return;
    const timer = window.setInterval(() => setImageIndex((current) => (current + 1) % theme.images.length), 7000);
    return () => window.clearInterval(timer);
  }, [theme.enabled, theme.images.length, reduceMotion]);

  if (pathname.startsWith("/admin")) return null;

  const images = theme.enabled && theme.images.length ? theme.images : [{ src: fallbackImage, alt: "" }];
  const activeImage = images[imageIndex % images.length];
  const wash = theme.enabled ? Math.min(0.9, 0.5 + theme.overlayOpacity / 225) : defaultWash;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeImage.src}
          initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: theme.enabled ? 0.68 : 0.5, scale: 1.02 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 1.1, ease: "easeOut" }}
          className="absolute -inset-8 bg-cover bg-center blur-2xl"
          style={{ backgroundImage: `url("${activeImage.src}")` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(255, 255, 255, ${wash})` }} />
    </div>
  );
}