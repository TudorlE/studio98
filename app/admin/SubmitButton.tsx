"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";

/**
 * A plain <button type="submit"> only repaints once the server action
 * round-trips and the page revalidates — on a slow connection that reads as
 * "nothing happened" for the better part of a second. useFormStatus flips
 * `pending` the instant the form submits, client-side, so this dims the
 * button and swaps its label immediately instead of waiting on the network.
 */
export function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(className, pending && "opacity-60")}>
      {pending ? pendingLabel : children}
    </button>
  );
}
