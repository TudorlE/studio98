"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks } from "@/lib/nav";
import { site } from "@/lib/site";
import { smoothScrollToHash } from "@/components/ui/AnchorLink";
import { Logo } from "@/components/ui/Logo";
import { useBookingDrawer } from "@/components/booking/BookingDrawerContext";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { openBooking } = useBookingDrawer();

  // Close first (restores body scroll), then scroll on the next tick.
  const navigate = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    setTimeout(() => smoothScrollToHash(hash), 70);
  };

  const bookNow = () => {
    onClose();
    setTimeout(() => openBooking(), 70);
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] bg-paper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex h-full flex-col px-5 pb-10 pt-5 sm:px-8">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                onClick={onClose}
                className="h-11 px-3 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-soft"
              >
                Close
              </button>
            </div>

            <nav className="mt-auto flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <a
                    href={link.href}
                    onClick={navigate(link.href)}
                    className="block py-2 font-serif text-[2.75rem] leading-tight tracking-tight"
                  >
                    {link.label}
                  </a>
                </motion.div>
              ))}
            </nav>

            <div className="mt-10 border-t border-line pt-6">
              <button
                onClick={bookNow}
                className="flex h-14 w-full items-center justify-center bg-ink text-[0.72rem] font-medium uppercase tracking-[0.18em] text-paper"
              >
                Book a studio
              </button>
              <div className="mt-6 flex flex-col gap-1 text-sm text-ink-soft">
                <a href={site.contact.phoneHref}>{site.contact.phone}</a>
                <a href={site.contact.emailHref}>{site.contact.email}</a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
