"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

type ProductImage = {
  src: string;
  alt: string;
};

type ProductImageGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const activeImage = images[activeIndex];

  const showPrevious = () => setActiveIndex((index) => (index - 1 + images.length) % images.length);
  const showNext = () => setActiveIndex((index) => (index + 1) % images.length);

  useEffect(() => {
    if (!viewerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setViewerOpen(false);
      if (event.key === "ArrowLeft") {
        setActiveIndex((index) => (index - 1 + images.length) % images.length);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((index) => (index + 1) % images.length);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewerOpen, images.length]);

  return (
    <div className="min-w-0">
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setViewerOpen(true)}
        aria-label={`Enlarge ${activeImage.alt}`}
        className="group relative block aspect-[4/4.15] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-slate-100 text-left"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage.src}
            src={activeImage.src}
            alt={activeImage.alt}
            initial={{ opacity: 0, scale: 1.025 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </AnimatePresence>
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm">
          <ZoomIn className="h-4 w-4" /> View larger
        </span>
      </motion.button>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-2" aria-label={`${productName} images`}>
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show image ${index + 1} of ${images.length}`}
            aria-pressed={index === activeIndex}
            className={`relative h-[76px] w-[76px] flex-none overflow-hidden rounded-xl border-2 transition ${index === activeIndex ? "border-cyan-700" : "border-transparent hover:border-slate-300"}`}
          >
            <img src={image.src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {viewerOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setViewerOpen(false);
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`${productName} image viewer`}
          >
            <button type="button" onClick={() => setViewerOpen(false)} aria-label="Close image viewer" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-8 sm:top-8">
              <X className="h-5 w-5" />
            </button>
            {images.length > 1 && (
              <button type="button" onClick={showPrevious} aria-label="Previous image" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-8">
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            <motion.img
              key={`viewer-${activeImage.src}`}
              src={activeImage.src}
              alt={activeImage.alt}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-h-[82vh] max-w-[min(100%,1100px)] rounded-xl object-contain shadow-2xl"
            />
            {images.length > 1 && (
              <button type="button" onClick={showNext} aria-label="Next image" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-8">
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
            <p className="absolute bottom-4 text-sm text-white/80">{activeIndex + 1} / {images.length}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
