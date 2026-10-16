import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { getDictionary, isLocale, defaultLocale } from "@/lib/i18n";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = site.name;

export default async function OgImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : defaultLocale).meta;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fffff0",
          color: "#111111",
          padding: 80,
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase" }}>
          {site.name}
        </div>
        <div style={{ fontSize: 96, lineHeight: 1, maxWidth: 900 }}>
          {t.ogHeadline}
        </div>
        <div style={{ fontSize: 26, color: "#6f6f6a" }}>{t.tagline}</div>
      </div>
    ),
    size,
  );
}
