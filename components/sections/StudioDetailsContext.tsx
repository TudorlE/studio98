"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { StudioSlug } from "@/lib/studios";

/** Where the overlay opens from: the photo the tile was showing and the tile's box on screen. */
export type OpenOrigin = { index?: number; rect?: DOMRect };
/** The photo the overlay was on when it closed — the tile picks up from there. */
export type LastView = { slug: StudioSlug; index: number } | null;

type Ctx = {
  activeSlug: StudioSlug | null;
  origin: OpenOrigin;
  /** Studio whose full-size photos should start loading (pointer over / finger on its tile). */
  warmSlug: StudioSlug | null;
  lastView: LastView;
  openDetails: (slug: StudioSlug, origin?: OpenOrigin) => void;
  closeDetails: (atIndex?: number) => void;
  warmDetails: (slug: StudioSlug) => void;
};

const StudioDetailsContext = createContext<Ctx | null>(null);

/** Which studio's photo-and-details overlay is open, if any — shared so the
 * hero tiles and the menu can both open it. */
export function StudioDetailsProvider({ children }: { children: ReactNode }) {
  const [activeSlug, setActiveSlug] = useState<StudioSlug | null>(null);
  const [origin, setOrigin] = useState<OpenOrigin>({});
  const [warmSlug, setWarmSlug] = useState<StudioSlug | null>(null);
  const [lastView, setLastView] = useState<LastView>(null);

  const openDetails = useCallback((slug: StudioSlug, from: OpenOrigin = {}) => {
    setOrigin(from);
    setWarmSlug(slug);
    setActiveSlug(slug);
  }, []);
  const closeDetails = useCallback(
    (atIndex?: number) => {
      if (activeSlug && atIndex !== undefined) setLastView({ slug: activeSlug, index: atIndex });
      setActiveSlug(null);
    },
    [activeSlug],
  );
  const warmDetails = useCallback((slug: StudioSlug) => setWarmSlug(slug), []);

  const value = useMemo(
    () => ({ activeSlug, origin, warmSlug, lastView, openDetails, closeDetails, warmDetails }),
    [activeSlug, origin, warmSlug, lastView, openDetails, closeDetails, warmDetails],
  );
  return <StudioDetailsContext.Provider value={value}>{children}</StudioDetailsContext.Provider>;
}

export function useStudioDetails() {
  const ctx = useContext(StudioDetailsContext);
  if (!ctx) throw new Error("useStudioDetails must be used within StudioDetailsProvider");
  return ctx;
}
