import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "solid" | "outline" | "ghost";
type Tone = "ink" | "paper";

const base =
  "inline-flex items-center justify-center gap-2 h-12 px-7 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-colors duration-300 disabled:opacity-40 disabled:pointer-events-none select-none";

function styles(variant: Variant, tone: Tone): string {
  const map: Record<Tone, Record<Variant, string>> = {
    ink: {
      solid: "bg-ink text-paper hover:bg-ink-soft",
      outline: "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-paper",
      ghost: "text-ink hover:text-ink-soft",
    },
    paper: {
      solid: "bg-paper text-ink hover:bg-paper-deep",
      outline:
        "border border-paper/30 text-paper hover:border-paper hover:bg-paper hover:text-ink",
      ghost: "text-paper hover:text-night-soft",
    },
  };
  return map[tone][variant];
}

type CommonProps = {
  variant?: Variant;
  tone?: Tone;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "solid",
  tone = "ink",
  className,
  children,
  ...props
}: CommonProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button className={cn(base, styles(variant, tone), className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "solid",
  tone = "ink",
  className,
  children,
  href,
  ...props
}: CommonProps & ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link href={href} className={cn(base, styles(variant, tone), className)} {...props}>
      {children}
    </Link>
  );
}
