"use client";

import { useEffect } from "react";

/**
 * Turns the homepage into 3 full-screen "pages" (Hero, Studio 01, Studio 02):
 * scrolling snaps cleanly from one to the next instead of drifting between
 * them. Scoped to whichever page mounts this — never touches other routes.
 */
export function ScrollSnapEffect() {
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.scrollSnapType;
    // "proximity", not "mandatory": mandatory refuses to scroll past the last
    // snap point at all, which would trap the page and make the footer
    // unreachable. Proximity still snaps the 3 main screens into place but
    // lets scrolling continue naturally into the footer afterwards.
    html.style.scrollSnapType = "y proximity";
    return () => {
      html.style.scrollSnapType = prev;
    };
  }, []);

  return null;
}
