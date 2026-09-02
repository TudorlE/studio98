import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

/**
 * STUDIO 98 wordmark. Line art — inherits the current text colour, so it
 * works on any background.
 *
 * This is a geometric re-creation of the brand mark. To use the exact logo
 * export, replace this SVG's body (and `public/logo.svg`) with it.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-10 -18 1072 438"
      className={cn("h-8 w-auto sm:h-9", className)}
      role="img"
      aria-label={site.name}
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
    >
      <text
        x="0"
        y="250"
        fill="currentColor"
        stroke="none"
        fontSize="148"
        fontWeight="300"
        letterSpacing="15"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        STUDIO
      </text>

      {/* 9 — concentric rings + straightened tail */}
      <circle cx="772" cy="182" r="150" />
      <circle cx="772" cy="182" r="123" />
      <circle cx="772" cy="182" r="66" />
      <rect x="759" y="182" width="26" height="238" rx="13" transform="rotate(57 772 182)" />

      {/* 8 — two lobes with registration ticks */}
      <circle cx="936" cy="120" r="92" />
      <circle cx="936" cy="120" r="66" />
      <circle cx="928" cy="278" r="116" />
      <circle cx="928" cy="278" r="88" />
      <line x1="936" y1="4" x2="936" y2="26" />
      <line x1="928" y1="392" x2="928" y2="400" />
      <line x1="884" y1="188" x2="906" y2="188" />
      <line x1="958" y1="188" x2="980" y2="188" />
    </svg>
  );
}
