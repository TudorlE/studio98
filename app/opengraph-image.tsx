import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.tagline}`;

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5f4f0",
          color: "#111111",
          padding: 80,
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase" }}>
          {site.name}
        </div>
        <div style={{ fontSize: 96, lineHeight: 1, maxWidth: 900 }}>
          Space for your next creation.
        </div>
        <div style={{ fontSize: 26, color: "#6f6f6a" }}>{site.tagline}</div>
      </div>
    ),
    size,
  );
}
