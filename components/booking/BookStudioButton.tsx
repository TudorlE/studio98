"use client";

import { cn } from "@/lib/cn";
import type { StudioSlug } from "@/lib/studios";
import { smoothScrollToHash } from "@/components/ui/AnchorLink";
import { requestStudioSelection } from "./selectStudio";

export function BookStudioButton({
  slug,
  label,
  tone = "ink",
}: {
  slug: StudioSlug;
  label: string;
  tone?: "ink" | "paper";
}) {
  return (
    <a
      href="#booking"
      onClick={(e) => {
        e.preventDefault();
        requestStudioSelection(slug);
        smoothScrollToHash("#booking");
      }}
      className={cn(
        "inline-flex h-12 items-center justify-center px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-colors",
        tone === "ink"
          ? "bg-ink text-paper hover:bg-ink-soft"
          : "bg-paper text-ink hover:bg-paper-deep",
      )}
    >
      {label}
    </a>
  );
}
