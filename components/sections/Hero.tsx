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

      <div className="on-night relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col items-center justify-end px-5 pb-10 text-center text-paper sm:px-8 sm:pb-14 lg:px-14 lg:pb-16">
        <h1 className="display max-w-[15ch] text-[11vw] leading-[0.94] sm:text-[7vw] lg:text-[5.6vw]">
          <span className="block">Space for your</span>
          <span className="block">next creation.</span>
        </h1>
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
