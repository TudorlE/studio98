"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { AnchorLink } from "@/components/ui/AnchorLink";
import { useBookingDrawer } from "@/components/booking/BookingDrawerContext";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);
  const { openBooking } = useBookingDrawer();

  // The 3 main screens are full-bleed photos → light header content.
  // Once the footer (plain background) comes into view, switch to dark.
  useEffect(() => {
    const sentinel = document.getElementById("footer-sentinel");
    if (!sentinel) return;
    const io = new IntersectionObserver(([entry]) => setNearFooter(entry.isIntersecting));
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  const light = !nearFooter;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
          light
            ? "bg-gradient-to-b from-black/30 to-transparent"
            : "border-b border-line bg-paper/90 backdrop-blur-sm",
        )}
      >
        <div className="relative flex flex-col items-center px-5 pb-4 pt-4 sm:pb-5 sm:pt-6">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            className={cn(
              "absolute left-5 top-4 grid h-10 w-10 place-items-center transition-colors sm:left-6 sm:top-6",
              light ? "text-paper" : "text-ink",
            )}
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          <AnchorLink href="#top" aria-label="Studio 98 — home">
            <Logo variant={light ? "white" : "black"} className="h-9 sm:h-12" />
          </AnchorLink>

          <button
            type="button"
            onClick={() => openBooking()}
            className={cn(
              "mt-3 flex h-10 items-center border px-6 text-[0.68rem] font-medium uppercase tracking-[0.16em] transition-colors sm:mt-4 sm:h-11 sm:px-8",
              light
                ? "border-paper/50 text-paper hover:bg-paper hover:text-ink"
                : "border-ink/25 text-ink hover:bg-ink hover:text-paper",
            )}
          >
            Book a studio
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
