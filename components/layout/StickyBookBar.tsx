"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AnchorLink } from "@/components/ui/AnchorLink";

export function StickyBookBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const booking = document.getElementById("booking");
    const onScroll = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.9;
      let bookingInView = false;
      if (booking) {
        const r = booking.getBoundingClientRect();
        bookingInView = r.top < window.innerHeight && r.bottom > 0;
      }
      const nearBottom =
        window.innerHeight + window.scrollY > document.body.scrollHeight - 240;
      setVisible(pastHero && !bookingInView && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40 p-3 lg:hidden"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnchorLink
            href="#booking"
            className="flex h-14 items-center justify-center bg-ink text-[0.72rem] font-medium uppercase tracking-[0.18em] text-paper shadow-[0_-8px_30px_rgba(17,17,17,0.12)]"
          >
            Book a studio
          </AnchorLink>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
