import Image from "next/image";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

/**
 * STUDIO 98 wordmark. Horizontal line-art lockup.
 * Real brand asset — swap the files in /public to update.
 */
export function Logo({
  className,
  variant = "black",
}: {
  className?: string;
  /** "black" for light backgrounds, "white" for dark ones. */
  variant?: "black" | "white";
}) {
  return (
    <Image
      src={variant === "white" ? "/logo-white.png" : "/logo.png"}
      alt={site.name}
      width={1834}
      height={797}
      priority
      className={cn("w-auto", className ?? "h-9 sm:h-11")}
    />
  );
}
