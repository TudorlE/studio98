"use client";

import { studios } from "@/lib/studios";
import { StudioTile } from "./StudioTile";
import { StudioDetails } from "./StudioDetails";
import { useStudioDetails } from "./StudioDetailsContext";

export function Hero() {
  const { openDetails } = useStudioDetails();

  return (
    <section id="top" className="relative flex h-[100svh] min-h-[560px] w-full flex-col items-center justify-center overflow-hidden bg-paper px-5">
      <p className="eyebrow">Choose a studio</p>

      <div className="mt-4 flex gap-4 sm:mt-6 sm:gap-6 lg:gap-8">
        {studios.map((s) => (
          <StudioTile key={s.slug} studio={s} onOpen={() => openDetails(s.slug)} />
        ))}
      </div>

      <StudioDetails />
    </section>
  );
}
