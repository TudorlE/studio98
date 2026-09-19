"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { AnchorLink } from "@/components/ui/AnchorLink";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="relative flex flex-col items-center px-5 pb-4 pt-4 sm:pb-5 sm:pt-6">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Meniu"
            className="absolute right-5 top-4 grid h-10 w-10 place-items-center text-ink sm:right-6 sm:top-6"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          <AnchorLink href="#top" aria-label="Studio 98 — pagina principală">
            <Logo variant="mark" className="h-14 sm:h-20 lg:h-24" />
          </AnchorLink>

          <p className="mt-5 w-56 text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink sm:mt-6">
            Midcentury Studio
          </p>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
