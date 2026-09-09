"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { studios } from "@/lib/studios";
import { StudioTile } from "./StudioTile";
import { StudioDetails } from "./StudioDetails";
import { useStudioDetails } from "./StudioDetailsContext";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const { openDetails } = useStudioDetails();

  return (
    <section id="top" className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-paper-deep">
      <motion.div
        className="absolute inset-0"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease }}
      >
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
      </motion.div>

      <div className="on-night relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col justify-end px-5 pb-14 text-paper sm:px-8 sm:pb-16 lg:px-14 lg:pb-20">
        <h1 className="display max-w-[15ch] text-[11vw] leading-[0.94] sm:text-[7vw] lg:text-[5.6vw]">
          {["Space for your", "next creation."].map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <motion.span
                className="block"
                initial={reduce ? { opacity: 0 } : { y: "110%" }}
                animate={reduce ? { opacity: 1 } : { y: "0%" }}
                transition={{ duration: 1, ease, delay: 0.45 + i * 0.12 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
      </div>

      {/* Studio tiles — the main event, centered on the whole screen. */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-5">
        <div className="pointer-events-auto flex flex-col items-center">
          <motion.p
            className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-paper/80"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.8 }}
          >
            Choose a studio
          </motion.p>

          <motion.div
            className="mt-4 flex gap-4 sm:mt-6 sm:gap-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.9 }}
          >
            {studios.map((s) => (
              <StudioTile key={s.slug} studio={s} onOpen={() => openDetails(s.slug)} />
            ))}
          </motion.div>
        </div>
      </div>

      <StudioDetails />
    </section>
  );
}
