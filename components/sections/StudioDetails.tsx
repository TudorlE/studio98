"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Images, X } from "lucide-react";
import { Lightbox } from "@/components/gallery/Lightbox";
import { BookStudioButton } from "@/components/booking/BookStudioButton";
import { formatMoney } from "@/lib/booking";
import { studios } from "@/lib/studios";
import { useStudioDetails } from "./StudioDetailsContext";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Full-screen "photos and details" panel for one studio — opened by tapping
 * its tile on the hero. Not a page section: the homepage never scrolls.
 */
export function StudioDetails() {
  const { activeSlug, closeDetails } = useStudioDetails();
  const studio = studios.find((s) => s.slug === activeSlug) ?? null;
  const [galleryOpen, setGalleryOpen] = useState<number | null>(null);

  useEffect(() => {
    if (!studio) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDetails();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [studio, closeDetails]);

  return (
    <AnimatePresence>
      {studio && (
        <motion.div
          className="fixed inset-0 z-[70] overflow-hidden bg-night"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease }}
          role="dialog"
          aria-modal="true"
          aria-label={`${studio.subtitle} — photos and details`}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.7, ease }}
          >
            <Image
              src={studio.images[0].src}
              alt={studio.images[0].alt}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(14,14,13,0.5),rgba(14,14,13,0.12)_30%,rgba(14,14,13,0.10)_60%,rgba(14,14,13,0.65))]" />
          </motion.div>

          <div className="absolute right-5 top-5 z-10 flex gap-2 sm:right-8 sm:top-6">
            <button
              type="button"
              onClick={() => setGalleryOpen(0)}
              className="flex h-11 w-11 items-center justify-center border border-paper/40 text-paper transition-colors hover:bg-paper hover:text-ink"
              aria-label={`See more photos of ${studio.subtitle}`}
            >
              <Images size={18} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={closeDetails}
              className="flex h-11 w-11 items-center justify-center border border-paper/40 text-paper transition-colors hover:bg-paper hover:text-ink"
              aria-label="Close"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="on-night relative z-[1] mx-auto flex h-full w-full max-w-[1600px] flex-col justify-end px-5 pb-14 text-paper sm:px-8 sm:pb-20 lg:px-14 lg:pb-24">
            <motion.p
              className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-paper/75"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.15 }}
            >
              Studio {studio.index}
            </motion.p>

            <motion.h2
              className="display mt-4 max-w-[15ch] text-[13vw] leading-[0.95] sm:text-[7vw] lg:text-[5.2vw]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.2 }}
            >
              {studio.subtitle}
            </motion.h2>

            <motion.p
              className="mt-4 text-sm text-paper/85 sm:text-base"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.28 }}
            >
              {studio.description} From {formatMoney(studio.pricePerHour)} / hour.
            </motion.p>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.36 }}
            >
              <BookStudioButton
                slug={studio.slug}
                label={`Book Studio ${studio.index}`}
                tone="paper"
                onClick={closeDetails}
              />
            </motion.div>
          </div>

          <Lightbox
            images={studio.images}
            index={galleryOpen}
            onClose={() => setGalleryOpen(null)}
            onIndexChange={setGalleryOpen}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
