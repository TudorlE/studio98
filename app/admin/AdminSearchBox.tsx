"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

/**
 * Filters as you type instead of waiting for Enter — a plain <form> left the
 * native "clear" (x) button on type=search inert: it emptied the box but the
 * URL (and the filtered list) never changed until the admin pressed Enter
 * again, which read as a broken filter.
 */
export function AdminSearchBox({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apply = (value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value) sp.set("q", value);
    else sp.delete("q");
    router.push(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  return (
    <div className="relative w-full sm:w-80">
      <Search size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-faint" />
      <input
        type="search"
        defaultValue={defaultValue}
        onChange={(e) => {
          const value = e.target.value;
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => apply(value), value ? 250 : 0);
        }}
        placeholder="Caută nume, email sau telefon"
        className="h-11 w-full rounded-full border border-line bg-transparent pr-4 pl-10 text-sm outline-none focus:border-ink"
      />
    </div>
  );
}
