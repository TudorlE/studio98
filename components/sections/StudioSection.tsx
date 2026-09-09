"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Images } from "lucide-react";
import { Lightbox } from "@/components/gallery/Lightbox";
import { BookStudioButton } from "@/components/booking/BookStudioButton";
import { formatMoney } from "@/lib/booking";
import type { Studio } from "@/lib/studios";

const ease = [0.22, 1, 0.36, 1] as const;

export function StudioSection({ studio }: { studio: Studio }) {
  const [galleryOpen, setGalleryOpen] = useState<number | null>(null);

  return (
    <section
      id={studio.slug}
      className="relative h-[100svh] min-h-[560px] w-full snap-start overflow-hidden bg-paper-deep [scroll-snap-stop:always]"
    >
      <div className="absolute inset-0">
        <Image
          src={studio.images[0].src}
          alt={studio.images[0].alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(14,14,13,0.42),rgba(14,14,13,0.12)_28%,rgba(14,14,13,0.10)_62%,rgba(14,14,13,0.62))]" />
      </div>

      <button
        type="button"
        onClick={() => setGalleryOpen(0)}
        className="absolute right-5 top-24 z-10 flex h-11 w-11 items-center justify-center border border-paper/40 text-paper transition-colors hover:bg-paper hover:text-ink sm:right-8 sm:top-28"
        aria-label={`See photos of ${studio.subtitle}`}
      >
        <Images size={18} strokeWidth={1.5} />
      </button>

      <div className="on-night relative z-[1] mx-auto flex h-full w-full max-w-[1600px] flex-col justify-end px-5 pb-14 text-paper sm:px-8 sm:pb-20 lg:px-14 lg:pb-24">
        <motion.p
          className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-paper/75"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.6 }}
          transition={{ duration: 0.7, ease }}
        >
          Studio {studio.index}
        </motion.p>

        <motion.h2
          className="display mt-4 max-w-[15ch] text-[13vw] leading-[0.95] sm:text-[7vw] lg:text-[5.2vw]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.6 }}
          transition={{ duration: 0.8, ease, delay: 0.08 }}
        >
          {studio.subtitle}
        </motion.h2>

        <motion.p
          className="mt-4 text-sm text-paper/85 sm:text-base"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.6 }}
          transition={{ duration: 0.7, ease, delay: 0.16 }}
        >
          {studio.description} From {formatMoney(studio.pricePerHour)} / hour.
        </motion.p>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.6 }}
          transition={{ duration: 0.7, ease, delay: 0.24 }}
        >
          <BookStudioButton slug={studio.slug} label={`Book Studio ${studio.index}`} tone="paper" />
        </motion.div>
      </div>

      <Lightbox
        images={studio.images}
        index={galleryOpen}
        onClose={() => setGalleryOpen(null)}
        onIndexChange={setGalleryOpen}
      />
    </section>
  );
}
