"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { StudioSlug } from "@/lib/studios";

type Ctx = {
  activeSlug: StudioSlug | null;
  openDetails: (slug: StudioSlug) => void;
  closeDetails: () => void;
};

const StudioDetailsContext = createContext<Ctx | null>(null);

/** Which studio's photo-and-details overlay is open, if any — shared so the
 * hero tiles and the menu can both open it. */
export function StudioDetailsProvider({ children }: { children: ReactNode }) {
  const [activeSlug, setActiveSlug] = useState<StudioSlug | null>(null);
  const openDetails = useCallback((slug: StudioSlug) => setActiveSlug(slug), []);
  const closeDetails = useCallback(() => setActiveSlug(null), []);
  const value = useMemo(
    () => ({ activeSlug, openDetails, closeDetails }),
    [activeSlug, openDetails, closeDetails],
  );
  return <StudioDetailsContext.Provider value={value}>{children}</StudioDetailsContext.Provider>;
}

export function useStudioDetails() {
  const ctx = useContext(StudioDetailsContext);
  if (!ctx) throw new Error("useStudioDetails must be used within StudioDetailsProvider");
  return ctx;
}
