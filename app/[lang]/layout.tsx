import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import "../globals.css";
import { site } from "@/lib/site";
import { getDictionary, isLocale, localePath, locales, type Locale } from "@/lib/i18n";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { BookingDrawerProvider } from "@/components/booking/BookingDrawerContext";
import { BookingDrawer } from "@/components/booking/BookingDrawer";
import { StudioDetailsProvider } from "@/components/sections/StudioDetailsContext";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

// Only /ro (served at "/"), /ru and /en exist — anything else is a 404.
export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  const title = `${site.name} — ${t.meta.tagline}`;
  return {
    metadataBase: new URL(site.domain),
    title: { default: title, template: `%s — ${site.name}` },
    description: t.meta.description,
    keywords: t.meta.keywords,
    alternates: {
      canonical: localePath(lang),
      languages: Object.fromEntries(locales.map((l) => [l, localePath(l)])),
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description: t.meta.description,
      url: localePath(lang),
      locale: lang,
    },
    twitter: { card: "summary_large_image", title, description: t.meta.description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#fffff0",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;

  return (
    <html lang={locale} className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <I18nProvider locale={locale}>
          <StudioDetailsProvider>
            <BookingDrawerProvider>
              {children}
              <BookingDrawer />
            </BookingDrawerProvider>
          </StudioDetailsProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
