"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { site } from "@/lib/site";
import { studios } from "@/lib/studios";
import { Logo } from "@/components/ui/Logo";
import { useBookingDrawer } from "@/components/booking/BookingDrawerContext";
import { useStudioDetails } from "@/components/sections/StudioDetailsContext";

const ease = [0.22, 1, 0.36, 1] as const;

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
    openDetails(slug);
  };

  const bookNow = () => {
    onClose();
    openBooking();
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
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[55] bg-black/45"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="fixed inset-0 z-[60] flex w-full flex-col overflow-y-auto bg-paper sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[420px] sm:max-w-[88vw]"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-8 sm:py-5">
              <Logo />
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-10 w-10 place-items-center text-ink-soft hover:text-ink"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex flex-1 flex-col justify-between px-5 py-8 sm:px-8">
              <nav className="flex flex-col gap-1">
                {studios.map((s) => (
                  <button
                    key={s.slug}
                    onClick={seeStudio(s.slug)}
                    className="block py-2 text-left font-serif text-4xl leading-tight tracking-tight sm:text-3xl"
                  >
                    {s.name}
                  </button>
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
        </>
      )}
    </AnimatePresence>
  );
}
