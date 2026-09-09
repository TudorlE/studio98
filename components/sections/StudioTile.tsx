"use client";

import Image from "next/image";
import type { Studio } from "@/lib/studios";

export function StudioTile({ studio, onOpen }: { studio: Studio; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`See ${studio.subtitle} — photos and details`}
      className="group relative aspect-square w-[38vw] max-w-48 shrink-0 overflow-hidden border border-paper/30 transition-colors hover:border-paper/70 sm:w-60 sm:max-w-none lg:w-72"
    >
      <Image
        src={studio.images[0].src}
        alt=""
        fill
        sizes="(max-width: 640px) 40vw, 288px"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/20" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-left text-paper sm:p-6">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] opacity-80 sm:text-xs">
          Studio {studio.index}
        </p>
        <p className="mt-1 font-serif text-xl leading-tight tracking-tight sm:text-3xl">
          {studio.subtitle}
        </p>
      </div>
    </button>
  );
}
