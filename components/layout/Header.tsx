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

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="relative flex flex-col items-center px-5 pb-4 pt-4 sm:pb-5 sm:pt-6">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            className="absolute right-5 top-4 grid h-10 w-10 place-items-center text-ink sm:right-6 sm:top-6"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          <AnchorLink href="#top" aria-label="Studio 98 — home">
            <Logo variant="mark" className="h-14 sm:h-20 lg:h-24" />
          </AnchorLink>

          <button
            type="button"
            onClick={() => openBooking()}
            className="mt-4 flex h-12 items-center border border-ink/30 px-8 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-paper sm:mt-5 sm:h-14 sm:px-10 sm:text-sm"
          >
            Book a studio
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
