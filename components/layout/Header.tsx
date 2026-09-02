"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/cn";
import { navLinks } from "@/lib/nav";
import { AnchorLink } from "@/components/ui/AnchorLink";
import { Logo } from "@/components/ui/Logo";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
          scrolled ? "bg-paper/90 backdrop-blur-sm border-b border-line" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-5 sm:h-20 sm:px-8 lg:px-14">
          <AnchorLink href="#top" className="text-ink">
            <Logo />
          </AnchorLink>

          <nav className="hidden items-center gap-9 lg:flex">
            {navLinks.map((link) => (
              <AnchorLink
                key={link.href}
                href={link.href}
                className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
              >
                {link.label}
              </AnchorLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <AnchorLink
              href="#booking"
              className="hidden h-11 items-center border border-ink/25 px-6 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper lg:inline-flex"
            >
              Book a studio
            </AnchorLink>
            <button
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
