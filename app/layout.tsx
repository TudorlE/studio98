import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { BookingDrawerProvider } from "@/components/booking/BookingDrawerContext";
import { BookingDrawer } from "@/components/booking/BookingDrawer";
import { StudioDetailsProvider } from "@/components/sections/StudioDetailsContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "închiriere studio foto",
    "studio video",
    "spațiu creativ",
    "închiriere studio",
    "Chișinău",
    "Moldova",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.domain,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f5f4f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ro" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <StudioDetailsProvider>
          <BookingDrawerProvider>
            {children}
            <BookingDrawer />
          </BookingDrawerProvider>
        </StudioDetailsProvider>
      </body>
    </html>
  );
}
