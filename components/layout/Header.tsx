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

  // Over the hero the header is on a dark scrim → light content.
  // Once scrolled it sits on paper → dark content.
  const light = !scrolled;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
          scrolled
            ? "border-b border-line bg-paper/90 backdrop-blur-sm"
            : "bg-gradient-to-b from-black/25 to-transparent",
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-5 sm:h-20 sm:px-8 lg:px-12">
          <AnchorLink href="#top" aria-label="Studio 98 — home">
            <Logo variant={light ? "white" : "black"} />
          </AnchorLink>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <AnchorLink
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[0.7rem] font-medium uppercase tracking-[0.16em] transition-colors",
                  light ? "text-paper/85 hover:text-paper" : "text-ink-soft hover:text-ink",
                )}
              >
                {link.label}
              </AnchorLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <AnchorLink
              href="#booking"
              className={cn(
                "hidden h-11 items-center border px-6 text-[0.7rem] font-medium uppercase tracking-[0.16em] transition-colors lg:inline-flex",
                light
                  ? "border-paper/40 text-paper hover:bg-paper hover:text-ink"
                  : "border-ink/25 text-ink hover:bg-ink hover:text-paper",
              )}
            >
              Book a studio
            </AnchorLink>
            <button
              onClick={() => setMenuOpen(true)}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center lg:hidden",
                light ? "text-paper" : "text-ink",
              )}
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
