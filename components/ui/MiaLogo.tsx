import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Official MIA (Plăți Instant) logo, taken from the BNM "Ghid de integrare"
 * (July 2024). Variants follow the guide: `color` (polychrome, default),
 * `white` (white wordmark — for black buttons), `black` (monochrome — for the
 * minimal QR card on a white base). Size it by height only.
 */
const SRC = {
  color: "/mia-logo.svg",
  white: "/mia-logo-white.svg",
  black: "/mia-logo-black.svg",
} as const;

export function MiaLogo({
  variant = "color",
  className,
}: {
  variant?: keyof typeof SRC;
  className?: string;
}) {
  return (
    <Image
      src={SRC[variant]}
      alt="MIA"
      width={62}
      height={16}
      className={cn("inline-block h-4 w-auto align-middle", className)}
    />
  );
}

/** Render a label with a `{mia}` slot, swapping the slot for the logo. */
export function withMiaLogo(
  label: string,
  logo: { variant?: keyof typeof SRC; className?: string } = {},
): ReactNode {
  const [before, after] = label.split("{mia}");
  if (after === undefined) return label;
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-2">
      {before.trim()}
      <MiaLogo {...logo} />
      {after.trim()}
    </span>
  );
}

/** The guide's separator: a 2px line in the four colours of the MIA symbol, in order. */
export function MiaSeparator({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-0.5 w-full", className)} aria-hidden="true">
      <span className="flex-1 bg-[#a88ff5]" />
      <span className="flex-1 bg-[#ff7859]" />
      <span className="flex-1 bg-[#669999]" />
      <span className="flex-1 bg-[#b8753b]" />
    </div>
  );
}
