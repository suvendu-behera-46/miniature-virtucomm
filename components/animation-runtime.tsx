"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export function AnimationRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      anchors: true,
      lerp: 0.1,
      smoothWheel: true,
      stopInertiaOnNavigate: true,
    });
    const updateScrollTrigger = () => ScrollTrigger.update();
    const updateLenis = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", updateScrollTrigger);
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.off("scroll", updateScrollTrigger);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      const page = document.querySelector<HTMLElement>("main");
      if (page) {
        gsap.fromTo(
          page,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.38, ease: "power2.out", clearProps: "transform,opacity,visibility" },
        );
      }

      gsap.utils.toArray<HTMLElement>("[data-gsap-section]").forEach((section) => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            once: true,
          },
        });

        timeline.fromTo(
          section,
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: 0.65, ease: "power2.out", clearProps: "transform,opacity,visibility" },
        );
      });

      ScrollTrigger.refresh();
    });

    return () => context.revert();
  }, [pathname]);

  return null;
}
