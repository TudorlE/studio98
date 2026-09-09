"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/lib/site";
import { studios } from "@/lib/studios";
import { Logo } from "@/components/ui/Logo";
import { useBookingDrawer } from "@/components/booking/BookingDrawerContext";
import { useStudioDetails } from "@/components/sections/StudioDetailsContext";

const legal = [
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Cancellation", href: "/legal/cancellation" },
];

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { openBooking } = useBookingDrawer();
  const { openDetails } = useStudioDetails();

  const seeStudio = (slug: (typeof studios)[number]["slug"]) => () => {
    onClose();
    setTimeout(() => openDetails(slug), 70);
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
          className="fixed inset-0 z-[60] overflow-y-auto bg-paper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex min-h-full flex-col px-5 pb-10 pt-5 sm:px-8">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                onClick={onClose}
                className="h-11 px-3 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-soft"
              >
                Close
              </button>
            </div>

            <nav className="mt-auto flex flex-col gap-1 pt-16">
              {studios.map((s, i) => (
                <motion.div
                  key={s.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    onClick={seeStudio(s.slug)}
                    className="block py-2 text-left font-serif text-[2.75rem] leading-tight tracking-tight"
                  >
                    {s.name}
                  </button>
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

              <div className="mt-6 space-y-1 text-sm text-ink-soft">
                <a href={site.contact.phoneHref} className="block hover:text-ink">
                  {site.contact.phone}
                </a>
                <a href={site.contact.emailHref} className="block hover:text-ink">
                  {site.contact.email}
                </a>
                <p>
                  {site.contact.address.line1}, {site.contact.address.line2}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
                <span>© 2026 {site.name}</span>
                {legal.map((l) => (
                  <Link key={l.label} href={l.href} onClick={onClose} className="hover:text-ink">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
