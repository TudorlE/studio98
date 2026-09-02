"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import type { StudioImage } from "@/lib/studios";
import { Lightbox } from "./Lightbox";

// Fixed editorial layout for a 3-image set. Each cell is sized purely by its
// column width × aspect ratio, so there are no row-span / auto-row surprises.
const LAYOUT = [
  "sm:col-span-7 aspect-[4/3]",
  "sm:col-span-5 aspect-[3/4]",
  "sm:col-span-8 sm:col-start-3 aspect-[3/2]",
];

export function StudioGallery({
  images,
  theme,
}: {
  images: StudioImage[];
  theme: "light" | "dark";
}) {
  const [open, setOpen] = useState<number | null>(null);
  const bg = theme === "dark" ? "bg-night-line" : "bg-paper-deep";

  return (
    <>
      {/* Mobile: horizontal snap rail */}
      <ul className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 sm:hidden">
        {images.map((img, i) => (
          <li
            key={img.src}
            className={cn("relative aspect-[3/4] w-[80%] shrink-0 snap-center overflow-hidden", bg)}
          >
            <GalleryButton img={img} index={i} onOpen={setOpen} sizes="80vw" />
          </li>
        ))}
      </ul>

      {/* Desktop: asymmetric editorial grid */}
      <ul className="hidden gap-6 sm:grid sm:grid-cols-12">
        {images.map((img, i) => (
          <li
            key={img.src}
            className={cn("relative overflow-hidden", bg, LAYOUT[i] ?? "sm:col-span-6 aspect-[4/3]")}
          >
            <GalleryButton img={img} index={i} onOpen={setOpen} sizes="45vw" />
          </li>
        ))}
      </ul>

      <Lightbox images={images} index={open} onClose={() => setOpen(null)} onIndexChange={setOpen} />
    </>
  );
}

function GalleryButton({
  img,
  index,
  onOpen,
  sizes,
}: {
  img: StudioImage;
  index: number;
  onOpen: (i: number) => void;
  sizes: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className="group absolute inset-0"
      aria-label={`Open image ${index + 1} full screen`}
    >
      <Image
        src={img.src}
        alt={img.alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
      />
    </button>
  );
}
