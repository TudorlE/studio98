"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { AnchorLink } from "@/components/ui/AnchorLink";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();

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
        <div className="absolute inset-0 bg-ink/10" />
      </motion.div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col justify-end px-5 pb-14 sm:px-8 sm:pb-20 lg:px-14 lg:pb-24">
        <h1 className="display max-w-[15ch] text-[12.5vw] leading-[0.94] sm:text-[9vw] lg:text-[7.4vw]">
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

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.9 }}
          className="mt-9"
        >
          <AnchorLink
            href="#booking"
            className="inline-flex h-12 items-center justify-center bg-ink px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-paper transition-colors hover:bg-ink-soft"
          >
            Book a studio
          </AnchorLink>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-ink-soft"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
      >
        <ArrowDown size={18} strokeWidth={1.5} className="animate-none" />
      </motion.div>
    </section>
  );
}
