"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Images, X } from "lucide-react";
import { Lightbox } from "@/components/gallery/Lightbox";
import { BookStudioButton } from "@/components/booking/BookStudioButton";
import { formatMoney } from "@/lib/booking";
import { studios } from "@/lib/studios";
import { useStudioDetails } from "./StudioDetailsContext";

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

  if (!studio) return null;

  return (
    <div
      className="fixed inset-0 z-[70] overflow-hidden bg-night"
      role="dialog"
      aria-modal="true"
      aria-label={`${studio.subtitle} — photos and details`}
    >
      <div className="absolute inset-0">
        <Image
          src={studio.images[0].src}
          alt={studio.images[0].alt}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(14,14,13,0.5),rgba(14,14,13,0.12)_30%,rgba(14,14,13,0.10)_60%,rgba(14,14,13,0.65))]" />
      </div>

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
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-paper/75">
          Studio {studio.index}
        </p>

        <h2 className="display mt-4 max-w-[15ch] text-[13vw] leading-[0.95] sm:text-[7vw] lg:text-[5.2vw]">
          {studio.subtitle}
        </h2>

        <p className="mt-4 text-sm text-paper/85 sm:text-base">
          {studio.description} From {formatMoney(studio.pricePerHour)} / hour.
        </p>

        <div className="mt-8">
          <BookStudioButton
            slug={studio.slug}
            label={`Book Studio ${studio.index}`}
            tone="paper"
            onClick={closeDetails}
          />
        </div>
      </div>

      <Lightbox
        images={studio.images}
        index={galleryOpen}
        onClose={() => setGalleryOpen(null)}
        onIndexChange={setGalleryOpen}
      />
    </div>
  );
}
