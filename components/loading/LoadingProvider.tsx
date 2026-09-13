"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { LoadingScreen } from "./LoadingScreen";

/** Wait this long before showing the loader for a routine background fetch — avoids flicker on fast ones. */
const SHOW_DELAY_MS = 300;
/** Once shown, stay up at least this long so it never just flashes. */
const MIN_VISIBLE_MS = 500;

type LoadingApi = {
  /** Marks one thing as "loading". Call the returned function when it's done. */
  start: (opts?: { immediate?: boolean }) => () => void;
};

const LoadingContext = createContext<LoadingApi | null>(null);

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  // The site's first paint is a mandatory splash — always on, never skipped for a fast load.
  const [visible, setVisible] = useState(true);
  const activeCount = useRef(1);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownAt = useRef<number | null>(null);

  const show = useCallback(() => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    shownAt.current = Date.now();
    setVisible(true);
  }, []);

  const scheduleShow = useCallback(() => {
    if (showTimer.current || shownAt.current) return;
    showTimer.current = setTimeout(() => {
      showTimer.current = null;
      if (activeCount.current > 0) show();
    }, SHOW_DELAY_MS);
  }, [show]);

  const tryHide = useCallback(() => {
    if (activeCount.current > 0) return;
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (!shownAt.current) return;
    const elapsed = Date.now() - shownAt.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    setTimeout(() => {
      if (activeCount.current === 0) {
        setVisible(false);
        shownAt.current = null;
      }
    }, wait);
  }, []);

  const start = useCallback<LoadingApi["start"]>(
    (opts) => {
      activeCount.current += 1;
      if (opts?.immediate) show();
      else scheduleShow();

      let stopped = false;
      return () => {
        if (stopped) return;
        stopped = true;
        activeCount.current = Math.max(0, activeCount.current - 1);
        tryHide();
      };
    },
    [show, scheduleShow, tryHide],
  );

  // The splash starts already visible (initial state) — just release it once
  // the page has actually finished loading (respecting the minimum duration above).
  useEffect(() => {
    shownAt.current = Date.now();
    const release = () => {
      activeCount.current = Math.max(0, activeCount.current - 1);
      tryHide();
    };
    if (document.readyState === "complete") {
      release();
      return;
    }
    window.addEventListener("load", release, { once: true });
    return () => window.removeEventListener("load", release);
  }, [tryHide]);

  // Any network request that runs long enough to notice triggers the same loader.
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = ((...args: Parameters<typeof fetch>) => {
      const stop = start();
      return originalFetch(...args).finally(stop);
    }) as typeof fetch;
    return () => {
      window.fetch = originalFetch;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LoadingContext.Provider value={{ start }}>
      {children}
      <LoadingScreen visible={visible} />
    </LoadingContext.Provider>
  );
}
