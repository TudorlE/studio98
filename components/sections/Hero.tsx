"use client";

import Image from "next/image";
import { studios } from "@/lib/studios";
import { StudioTile } from "./StudioTile";
import { StudioDetails } from "./StudioDetails";
import { useStudioDetails } from "./StudioDetailsContext";

export function Hero() {
  const { openDetails } = useStudioDetails();

  return (
    <section id="top" className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-paper-deep">
      <div className="absolute inset-0">
        <Image
          src="/images/hero.jpg"
          alt="Interior of a photo studio with high ceilings and natural light"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* legibility scrim — darker top & bottom, clear middle */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(14,14,13,0.42),rgba(14,14,13,0.16)_28%,rgba(14,14,13,0.16)_62%,rgba(14,14,13,0.62))]" />
      </div>

      {/* Studio tiles — the main event, centered on the whole screen. */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-5">
        <div className="pointer-events-auto flex flex-col items-center">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-paper/80">
            Choose a studio
          </p>

          <div className="mt-4 flex gap-4 sm:mt-6 sm:gap-6 lg:gap-8">
            {studios.map((s) => (
              <StudioTile key={s.slug} studio={s} onOpen={() => openDetails(s.slug)} />
            ))}
          </div>
        </div>
      </div>

      <StudioDetails />
    </section>
  );
}
