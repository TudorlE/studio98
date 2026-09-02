import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

/**
 * STUDIO 98 wordmark. Line art — inherits the current text colour, so it
 * works on any background.
 *
 * This is a geometric re-creation of the brand mark. To use the exact logo
 * export, replace this SVG's contents (or `public/logo.svg`) with it.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 400"
      className={cn("h-7 w-auto sm:h-8", className)}
      role="img"
      aria-label={site.name}
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
    >
      <text
        x="0"
        y="252"
        fill="currentColor"
        stroke="none"
        fontSize="150"
        fontWeight="300"
        letterSpacing="16"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        STUDIO
      </text>

      {/* 9 */}
      <circle cx="730" cy="176" r="166" />
      <circle cx="730" cy="176" r="138" />
      <circle cx="730" cy="176" r="76" />
      <rect x="716" y="176" width="28" height="250" rx="14" transform="rotate(-57 730 176)" />

      {/* 8 */}
      <circle cx="886" cy="110" r="98" />
      <circle cx="886" cy="110" r="72" />
      <circle cx="877" cy="270" r="122" />
      <circle cx="877" cy="270" r="94" />
      <line x1="886" y1="2" x2="886" y2="26" />
      <line x1="877" y1="384" x2="877" y2="400" />
      <line x1="832" y1="190" x2="854" y2="190" />
      <line x1="900" y1="190" x2="922" y2="190" />
    </svg>
  );
}
