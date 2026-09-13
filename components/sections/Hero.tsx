"use client";

import Image from "next/image";
import { studios } from "@/lib/studios";
import { StudioTile } from "./StudioTile";
import { StudioDetails } from "./StudioDetails";
import { useStudioDetails } from "./StudioDetailsContext";

export function Hero() {
  const { openDetails } = useStudioDetails();

  return (
    <section
      id="top"
      className="relative flex h-[100svh] min-h-[560px] w-full flex-col items-center justify-center overflow-hidden px-5"
      style={{
        background:
          "radial-gradient(120% 85% at 50% 10%, var(--color-paper) 0%, var(--color-paper-dim) 65%, var(--color-paper-deep) 100%)",
      }}
    >
      <Image
        src="/logo-mark.png"
        alt=""
        aria-hidden
        width={1962}
        height={1511}
        priority
        className="pointer-events-none absolute -bottom-[18%] -right-[14%] w-[85%] max-w-[1100px] -rotate-6 opacity-[0.07] mix-blend-multiply sm:w-[65%] lg:w-[48%]"
      />

      <p className="eyebrow relative">Choose a studio</p>

      <div className="relative mt-4 flex gap-4 sm:mt-6 sm:gap-6 lg:gap-8">
        {studios.map((s) => (
          <StudioTile key={s.slug} studio={s} onOpen={() => openDetails(s.slug)} />
        ))}
      </div>

      <StudioDetails />
    </section>
  );
}
