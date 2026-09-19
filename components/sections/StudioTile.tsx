"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { subtitleWordSpacing, type Studio } from "@/lib/studios";

/** Not too fast, not too slow. */
const SLIDESHOW_INTERVAL_MS = 4500;
const CROSSFADE_MS = 1000;

export function StudioTile({ studio, onOpen }: { studio: Studio; onOpen: () => void }) {
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (studio.images.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setPhotoIndex((i) => (i + 1) % studio.images.length);
    }, SLIDESHOW_INTERVAL_MS);
    return () => clearInterval(id);
  }, [studio.images.length]);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Vezi ${studio.subtitle} — fotografii și detalii`}
      className="group relative aspect-[4/3] w-[clamp(17rem,86vw,26rem)] shrink-0 overflow-hidden border border-paper/30 transition-colors hover:border-paper/70 sm:w-[clamp(20rem,32vw,34rem)]"
    >
      {studio.images.map((image, i) => (
        <Image
          key={image.src}
          src={image.src}
          alt=""
          fill
          priority={i === 0}
          sizes="(max-width: 640px) 86vw, 32vw"
          className={cn(
            "object-cover ease-in-out",
            i === photoIndex ? "opacity-100" : "opacity-0",
          )}
          style={{ transitionProperty: "opacity", transitionDuration: `${CROSSFADE_MS}ms` }}
        />
      ))}
      <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/20" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-left text-paper sm:p-6 lg:p-8">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] opacity-80 sm:text-xs">
          Studio {studio.index}
        </p>
        <p
          className="mt-1 font-serif text-xl leading-[0.85] tracking-tight sm:text-3xl lg:text-5xl"
          style={{ wordSpacing: subtitleWordSpacing(studio.slug) }}
        >
          {studio.subtitle}
        </p>
      </div>
    </button>
  );
}
