import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "404 — STUDIO 98",
  robots: { index: false, follow: false },
};

/** Unmatched URLs — the site has several root layouts, so the 404 stands alone. */
export default function GlobalNotFound() {
  return (
    <html lang="ro" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col items-center justify-center bg-paper px-5 text-center">
        <p className="eyebrow">404</p>
        <h1 className="headline mt-6 text-5xl leading-none tracking-tight">
          Pagina nu a fost găsită.
        </h1>
        <p className="mt-4 text-sm text-ink-soft">Страница не найдена · Page not found</p>
        <div className="mt-10 flex gap-3">
          {[
            ["/", "Acasă"],
            ["/ru", "На главную"],
            ["/en", "Home"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="inline-flex h-12 items-center rounded-full border border-ink/25 px-6 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper"
            >
              {label}
            </a>
          ))}
        </div>
      </body>
    </html>
  );
}
