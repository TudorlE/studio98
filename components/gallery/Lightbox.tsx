"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { StudioImage } from "@/lib/studios";

export function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: StudioImage[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const open = index !== null;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onIndexChange((index + dir + images.length) % images.length);
    },
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, go]);

  return (
    <AnimatePresence>
      {open && index !== null && (
        <motion.div
          className="on-night fixed inset-0 z-[70] flex flex-col bg-night/97"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <div className="flex items-center justify-between px-5 py-4 text-paper sm:px-8">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-night-soft">
              {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </span>
            <button onClick={onClose} aria-label="Close viewer" className="h-11 w-11 -mr-3 grid place-items-center">
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          <motion.div
            key={index}
            className="relative flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) go(1);
              else if (info.offset.x > 80) go(-1);
            }}
          >
            <Image
              src={images[index].src}
              alt={images[index].alt}
              fill
              sizes="100vw"
              className="object-contain px-4 pb-6 select-none"
              draggable={false}
              priority
            />
          </motion.div>

          <button
            onClick={() => go(-1)}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center text-paper sm:grid"
          >
            <ChevronLeft size={28} strokeWidth={1.25} />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next image"
            className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center text-paper sm:grid"
          >
            <ChevronRight size={28} strokeWidth={1.25} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
