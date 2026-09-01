import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.domain, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.domain}/legal/terms`, lastModified: now, priority: 0.2 },
    { url: `${site.domain}/legal/privacy`, lastModified: now, priority: 0.2 },
    { url: `${site.domain}/legal/cancellation`, lastModified: now, priority: 0.2 },
  ];
}
