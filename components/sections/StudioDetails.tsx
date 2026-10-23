"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  usePresence,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { BookStudioButton } from "@/components/booking/BookStudioButton";
import { formatMoney } from "@/lib/booking";
import { fmt } from "@/lib/i18n";
import { studios, subtitleWordSpacing, type Studio } from "@/lib/studios";
import { useI18n } from "@/components/i18n/I18nProvider";
import { TILE_SIZES } from "./StudioTile";
import { useStudioDetails, type OpenOrigin } from "./StudioDetailsContext";

const ease = [0.22, 1, 0.36, 1] as const;
/** Opening: a critically damped spring (no bounce) — soft start, gentle settle. */
const OPEN_SPRING = { type: "spring", visualDuration: 0.75, bounce: 0, restDelta: 0.002 } as const;
/** Closing is a fixed curve so it lands in the tile cleanly, without a long spring tail. */
const CLOSE_TWEEN = { duration: 0.55, ease: [0.32, 0.72, 0, 1] } as const;
const TILE_RADIUS = 32;
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Full-screen "photos and details" panel for one studio — opened by tapping
 * its tile on the hero, it grows out of the tile (clip-path, so the photo is
 * never distorted) and shrinks back into it on close. The photo is swiped
 * directly; arrows, thumbnails and the keyboard also work.
 */
export function StudioDetails() {
  const { activeSlug, origin, warmSlug, closeDetails } = useStudioDetails();
  const studio = studios.find((s) => s.slug === activeSlug) ?? null;
  const warm = studios.find((s) => s.slug === warmSlug) ?? null;

  return (
    <>
      {warm && !studio && <Preloader studio={warm} />}
      <AnimatePresence>
        {studio && (
          <Overlay key={studio.slug} studio={studio} origin={origin} onClose={closeDetails} />
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Starts downloading a studio's full-size photos as soon as a pointer or finger
 * is on its tile — same `sizes` as the overlay, so the browser reuses them.
 */
function Preloader({ studio }: { studio: Studio }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 h-px w-px overflow-hidden opacity-0">
      {studio.images.map((img) => (
        <div key={img.src} className="relative h-px w-px">
          <Image src={img.src} alt="" fill sizes="100vw" loading="eager" />
        </div>
      ))}
    </div>
  );
}

function Overlay({
  studio,
  origin,
  onClose,
}: {
  studio: Studio;
  origin: OpenOrigin;
  onClose: (atIndex: number) => void;
}) {
  const { t, locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const count = studio.images.length;
  const [startIndex] = useState(() => Math.min(Math.max(origin.index ?? 0, 0), count - 1));
  const [index, setIndex] = useState(startIndex);

  const go = useCallback((dir: 1 | -1) => setIndex((i) => (i + dir + count) % count), [count]);
  const close = useCallback(() => onClose(index), [onClose, index]);

  // Keyboard + page scroll lock while open.
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, close]);

  // The tile's box, as insets from the viewport edges — the overlay opens out of it
  // and closes back into it. Animated through a 0→1 progress value (framer can't
  // tween `inset(... round …)` strings), so the photo is clipped, never stretched.
  const tileInset = useMemo(() => {
    const r = origin.rect;
    if (!r || reduceMotion) return null;
    return { top: r.top, right: window.innerWidth - r.right, bottom: window.innerHeight - r.bottom, left: r.left };
  }, [origin.rect, reduceMotion]);
  const tileClip = tileInset !== null;

  const progress = useMotionValue(tileClip ? 0 : 1);
  const clipPath = useTransform(progress, (t) => {
    if (!tileInset) return "none";
    const k = 1 - t;
    return `inset(${tileInset.top * k}px ${tileInset.right * k}px ${tileInset.bottom * k}px ${tileInset.left * k}px round ${lerp(TILE_RADIUS, 0, t)}px)`;
  });
  const photoScale = useTransform(progress, [0, 1], [tileClip ? 1.06 : 1, 1]);

  const [isPresent, safeToRemove] = usePresence();
  useEffect(() => {
    if (!tileClip) {
      if (!isPresent) safeToRemove?.();
      return;
    }
    const controls = isPresent
      ? animate(progress, 1, OPEN_SPRING)
      : animate(progress, 0, { ...CLOSE_TWEEN, onComplete: () => safeToRemove?.() });
    return () => controls.stop();
  }, [isPresent, safeToRemove, progress, tileClip]);

  const chrome = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0, transition: { delay: tileClip ? 0.4 : 0.1, duration: 0.7, ease } },
    exit: { opacity: 0, transition: { duration: 0.2, ease } },
  };
  const label = fmt(t.studio.photosAndDetails, { name: studio.subtitle });

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="on-night fixed inset-0 z-[70] overflow-hidden bg-night text-paper"
      style={tileClip ? { clipPath } : undefined}
      initial={tileClip ? false : { opacity: 0 }}
      animate={tileClip ? undefined : { opacity: 1 }}
      exit={tileClip ? undefined : { opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease }}
    >
      {/* Photos — all mounted at once so switching is instant; crossfade between them. */}
      <motion.div
        className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
        style={{ scale: photoScale }}
        drag={count > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60 || info.velocity.x < -500) go(1);
          else if (info.offset.x > 60 || info.velocity.x > 500) go(-1);
        }}
      >
        {/* Instant placeholder: the same file the tile already loaded, sharpened by the layer above. */}
        <Image
          src={studio.images[startIndex].src}
          alt=""
          fill
          sizes={TILE_SIZES}
          draggable={false}
          className={cn("select-none object-cover", index !== startIndex && "opacity-0")}
        />
        {studio.images.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt={i === index ? img.alt : ""}
            aria-hidden={i !== index}
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority={i === startIndex ? "high" : "auto"}
            draggable={false}
            className={cn(
              "select-none object-cover transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform]",
              i === index ? "scale-100 opacity-100" : "scale-[1.03] opacity-0",
            )}
          />
        ))}
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(14,14,13,0.55),rgba(14,14,13,0)_28%,rgba(14,14,13,0)_50%,rgba(14,14,13,0.75))]" />

      {/* Top bar */}
      <motion.div
        {...chrome}
        className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-6 lg:px-14"
      >
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-paper/80">
          {fmt(t.studio.label, { index: studio.index })}
          {count > 1 && (
            <span className="ml-3 tabular-nums text-paper/55">
              {pad(index + 1)} / {pad(count)}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={close}
          aria-label={t.nav.close}
          className="grid h-11 w-11 place-items-center rounded-full border border-paper/35 bg-night/20 backdrop-blur-sm transition-colors hover:bg-paper hover:text-ink"
        >
          <X size={20} strokeWidth={1.5} />
        </button>
      </motion.div>

      {/* Side arrows (desktop) */}
      {count > 1 && (
        <motion.div {...chrome} className="pointer-events-none absolute inset-y-0 inset-x-0 z-10 hidden items-center justify-between px-6 sm:flex lg:px-10">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => go(dir)}
              aria-label={dir < 0 ? t.studio.prevPhoto : t.studio.nextPhoto}
              className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full border border-paper/35 bg-night/20 backdrop-blur-sm transition-colors hover:bg-paper hover:text-ink"
            >
              {dir < 0 ? <ChevronLeft size={22} strokeWidth={1.5} /> : <ChevronRight size={22} strokeWidth={1.5} />}
            </button>
          ))}
        </motion.div>
      )}

      {/* Details + navigation */}
      <motion.div
        {...chrome}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-[1600px] flex-col gap-7 px-5 pb-10 sm:px-8 sm:pb-12 lg:flex-row lg:items-end lg:justify-between lg:px-14 lg:pb-14"
      >
        <div>
          <h2
            className="display max-w-[15ch] text-[12vw] leading-[0.85] sm:text-[6vw] lg:text-[4.6vw]"
            style={{ wordSpacing: subtitleWordSpacing(studio.slug) }}
          >
            {studio.subtitle}
          </h2>
          <p className="mt-4 max-w-md text-sm text-paper/85 sm:text-base">
            {fmt(t.studio.priceLine, {
              description: t.studio.descriptions[studio.slug],
              price: formatMoney(studio.pricePerHour, locale),
            })}
          </p>
          <div className="pointer-events-auto mt-7 inline-block">
            <BookStudioButton
              slug={studio.slug}
              label={fmt(t.studio.book, { index: studio.index })}
              tone="paper"
              onClick={close}
            />
          </div>
        </div>

        {count > 1 && (
          <>
            {/* Thumbnails (tablet/desktop) */}
            <div className="pointer-events-auto hidden gap-2.5 sm:flex">
              {studio.images.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={fmt(t.studio.photo, { n: i + 1 })}
                  aria-current={i === index ? "true" : undefined}
                  className={cn(
                    "relative h-16 w-24 overflow-hidden rounded-xl transition-all duration-300",
                    i === index
                      ? "opacity-100 ring-2 ring-paper ring-offset-2 ring-offset-night/0"
                      : "opacity-55 hover:opacity-90",
                  )}
                >
                  <Image src={img.src} alt="" fill sizes="96px" className="object-cover" />
                </button>
              ))}
            </div>
            {/* Dots (phones) */}
            <div className="pointer-events-auto flex gap-1.5 sm:hidden">
              {studio.images.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={fmt(t.studio.photo, { n: i + 1 })}
                  aria-current={i === index ? "true" : undefined}
                  className="grid h-6 place-items-center"
                >
                  <span
                    className={cn(
                      "block h-1 rounded-full bg-paper transition-all duration-300",
                      i === index ? "w-7 opacity-100" : "w-2.5 opacity-45",
                    )}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
