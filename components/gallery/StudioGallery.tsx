"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import type { StudioImage } from "@/lib/studios";
import { Lightbox } from "./Lightbox";

const spanClass: Record<StudioImage["span"], string> = {
  wide: "sm:col-span-7 aspect-4/3",
  tall: "sm:col-span-5 sm:row-span-2 aspect-3/4",
  square: "sm:col-span-5 aspect-square",
};

export function StudioGallery({
  images,
  theme,
}: {
  images: StudioImage[];
  theme: "light" | "dark";
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      {/* Mobile: swipeable rail. Desktop: editorial asymmetric grid. */}
      <ul className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:auto-rows-[minmax(0,1fr)] sm:grid-cols-12 sm:gap-5 sm:overflow-visible sm:px-0">
        {images.map((img, i) => (
          <li
            key={img.src}
            className={cn(
              "relative w-[82%] shrink-0 snap-center overflow-hidden sm:w-auto",
              theme === "dark" ? "bg-night-line" : "bg-paper-deep",
              "aspect-3/4 sm:aspect-auto",
              spanClass[img.span],
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group absolute inset-0"
              aria-label={`Open image ${i + 1} full screen`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 82vw, 40vw"
                className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      <Lightbox images={images} index={open} onClose={() => setOpen(null)} onIndexChange={setOpen} />
    </>
  );
}
