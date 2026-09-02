"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

/**
 * In-page anchor link with reliable smooth scrolling.
 *
 * Next.js 16 no longer guarantees a scroll for bare `#hash` <Link> clicks, so
 * for on-page section navigation we use a plain <a> and drive the scroll
 * ourselves. `scroll-margin-top` on the target section handles the header
 * offset.
 */

export function smoothScrollToHash(hash: string) {
  if (typeof document === "undefined") return;
  const id = hash.replace(/^#/, "");
  const el = id ? document.getElementById(id) : null;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (el) {
    el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  } else if (id === "top" || !id) {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    history.replaceState(null, "", window.location.pathname);
  }
}

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

export function AnchorLink({ href, onClick, children, ...rest }: Props) {
  return (
    <a
      href={href}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && href.startsWith("#")) {
          e.preventDefault();
          smoothScrollToHash(href);
        }
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
