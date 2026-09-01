import type { ReactNode, ElementType } from "react";
import { cn } from "@/lib/cn";

export function Container({
  as: As = "div",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <As className={cn("mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-14", className)}>
      {children}
    </As>
  );
}
