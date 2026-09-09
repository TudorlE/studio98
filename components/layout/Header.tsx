"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { AnchorLink } from "@/components/ui/AnchorLink";
import { useBookingDrawer } from "@/components/booking/BookingDrawerContext";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openBooking } = useBookingDrawer();

  // The homepage is always the hero photo behind the header — light content.
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-black/30 to-transparent">
        <div className="relative flex flex-col items-center px-5 pb-4 pt-4 sm:pb-5 sm:pt-6">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            className="absolute left-5 top-4 grid h-10 w-10 place-items-center text-paper sm:left-6 sm:top-6"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          <AnchorLink href="#top" aria-label="Studio 98 — home">
            <Logo variant="white" className="h-9 sm:h-12" />
          </AnchorLink>

          <button
            type="button"
            onClick={() => openBooking()}
            className="mt-3 flex h-10 items-center border border-paper/50 px-6 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-paper hover:text-ink sm:mt-4 sm:h-11 sm:px-8"
          >
            Book a studio
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
