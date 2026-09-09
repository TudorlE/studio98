"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { StudioSlug } from "@/lib/studios";

type Ctx = {
  isOpen: boolean;
  initialStudio: StudioSlug | null;
  openBooking: (slug?: StudioSlug) => void;
  closeBooking: () => void;
};

const BookingDrawerContext = createContext<Ctx | null>(null);

/** Wraps the app so any button, anywhere, can open the booking panel. */
export function BookingDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialStudio, setInitialStudio] = useState<StudioSlug | null>(null);

  const openBooking = useCallback((slug?: StudioSlug) => {
    setInitialStudio(slug ?? null);
    setIsOpen(true);
  }, []);
  const closeBooking = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, initialStudio, openBooking, closeBooking }),
    [isOpen, initialStudio, openBooking, closeBooking],
  );

  return <BookingDrawerContext.Provider value={value}>{children}</BookingDrawerContext.Provider>;
}

export function useBookingDrawer() {
  const ctx = useContext(BookingDrawerContext);
  if (!ctx) throw new Error("useBookingDrawer must be used within BookingDrawerProvider");
  return ctx;
}
