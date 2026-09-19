"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { BookStudioButton } from "@/components/booking/BookStudioButton";
import { formatMoney } from "@/lib/booking";
import { studios, subtitleWordSpacing } from "@/lib/studios";
import { useStudioDetails } from "./StudioDetailsContext";

/**
 * Full-screen "photos and details" panel for one studio — opened by tapping
 * its tile on the hero. Not a page section: the homepage never scrolls.
 * The photo itself is swiped directly, no separate gallery view.
 */
export function StudioDetails() {
  const { activeSlug, closeDetails } = useStudioDetails();
  const studio = studios.find((s) => s.slug === activeSlug) ?? null;
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lastSlug, setLastSlug] = useState(activeSlug);
  if (activeSlug !== lastSlug) {
    setLastSlug(activeSlug);
    setPhotoIndex(0);
  }

  const goPhoto = useCallback(
    (dir: 1 | -1) => {
      if (!studio) return;
      setPhotoIndex((i) => (i + dir + studio.images.length) % studio.images.length);
    },
    [studio],
  );

  useEffect(() => {
    if (!studio) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDetails();
      if (e.key === "ArrowRight") goPhoto(1);
      if (e.key === "ArrowLeft") goPhoto(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [studio, closeDetails, goPhoto]);

  if (!studio) return null;

  return (
    <div
      className="fixed inset-0 z-[70] overflow-hidden bg-night"
      role="dialog"
      aria-modal="true"
      aria-label={`${studio.subtitle} — fotografii și detalii`}
    >
      <div className="absolute inset-0">
        {/* Swipeable directly — drag the photo itself, not a separate gallery. */}
        <motion.div
          key={photoIndex}
          className="absolute inset-0"
          drag={studio.images.length > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) goPhoto(1);
            else if (info.offset.x > 80) goPhoto(-1);
          }}
        >
          <Image
            src={studio.images[photoIndex].src}
            alt={studio.images[photoIndex].alt}
            fill
            sizes="100vw"
            priority
            draggable={false}
            className="select-none object-cover"
          />
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(14,14,13,0.5),rgba(14,14,13,0.12)_30%,rgba(14,14,13,0.10)_60%,rgba(14,14,13,0.65))]" />
      </div>

      <div className="absolute right-5 top-5 z-10 flex items-center gap-3 sm:right-8 sm:top-6">
        {studio.images.length > 1 && (
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-paper/75">
            {String(photoIndex + 1).padStart(2, "0")} / {String(studio.images.length).padStart(2, "0")}
          </span>
        )}
        <button
          type="button"
          onClick={closeDetails}
          className="flex h-11 w-11 items-center justify-center border border-paper/40 text-paper transition-colors hover:bg-paper hover:text-ink"
          aria-label="Închide"
        >
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div className="on-night pointer-events-none relative z-[1] mx-auto flex h-full w-full max-w-[1600px] flex-col justify-end px-5 pb-14 text-paper sm:px-8 sm:pb-20 lg:px-14 lg:pb-24">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-paper/75">
          Studio {studio.index}
        </p>

        <h2
          className="display mt-4 max-w-[15ch] text-[13vw] leading-[0.85] sm:text-[7vw] lg:text-[5.2vw]"
          style={{ wordSpacing: subtitleWordSpacing(studio.slug) }}
        >
          {studio.subtitle}
        </h2>

        <p className="mt-4 text-sm text-paper/85 sm:text-base">
          {studio.description} De la {formatMoney(studio.pricePerHour)} / oră.
        </p>

        <div className="pointer-events-auto mt-8 inline-block">
          <BookStudioButton
            slug={studio.slug}
            label={`Rezervă Studio ${studio.index}`}
            tone="paper"
            onClick={closeDetails}
          />
        </div>
      </div>
    </div>
  );
}
