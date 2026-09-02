/**
 * Studio content.
 *
 * This is the single source of truth for the marketing site. The same shape
 * is mirrored in Supabase (`studios` + `studio_images`) so a future admin
 * panel can drive this content from the database instead of code.
 *
 * All values are PLACEHOLDERS. Swap images by dropping files into
 * `public/images/<slug>/` and updating the `images` arrays below.
 */

export type StudioImage = {
  /** Path under /public, or a remote URL once real assets exist. */
  src: string;
  alt: string;
  /** Editorial layout hint used by the gallery. */
  span: "tall" | "wide" | "square";
};

export type Studio = {
  id: string;
  slug: "studio-01" | "studio-02";
  index: string; // "01" / "02"
  name: string; // "STUDIO 01"
  subtitle: string; // "THE LIGHT SPACE"
  description: string;
  area: string; // placeholder surface
  capacity: string;
  pricePerHour: number; // in currency units (EUR)
  equipment: string[];
  amenities: string[];
  images: StudioImage[];
  /** Visual identity toggle for the section (light / dark treatment). */
  theme: "light" | "dark";
};

// Example imagery: free-licensed photo-studio interiors from Unsplash.
// Replace with the studio's own photography by dropping files into
// public/images/<slug>/ (keep the same names) — no code change needed.
const galleryFor = (slug: string): StudioImage[] => [
  { src: `/images/${slug}/01.jpg`, alt: "Studio interior — example image", span: "wide" },
  { src: `/images/${slug}/02.jpg`, alt: "Studio detail — example image", span: "tall" },
  { src: `/images/${slug}/05.jpg`, alt: "Studio wide view — example image", span: "wide" },
];

export const studios: Studio[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "studio-01",
    index: "01",
    name: "STUDIO 01",
    subtitle: "THE LIGHT SPACE",
    description:
      "A bright, high-ceiling room with large north-facing windows and warm white walls. Built for natural-light photography, editorial shoots, interviews and intimate creative sessions.",
    area: "00 m²",
    capacity: "Up to 00 people",
    pricePerHour: 25,
    equipment: [
      "Continuous LED panels (placeholder)",
      "Seamless paper backdrops — white / grey / black",
      "Tripods & C-stands",
      "Styling table",
    ],
    amenities: [
      "Fast Wi-Fi",
      "Makeup & changing area",
      "Kitchenette",
      "Street-level access",
    ],
    images: galleryFor("studio-01"),
    theme: "light",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "studio-02",
    index: "02",
    name: "STUDIO 02",
    subtitle: "THE DARK SPACE",
    description:
      "A blacked-out room with full lighting control for cinematic video, product photography and moody portraiture. No daylight spill — you shape every beam.",
    area: "00 m²",
    capacity: "Up to 00 people",
    pricePerHour: 30,
    equipment: [
      "Strobe kit with softboxes (placeholder)",
      "RGB & tungsten fixtures",
      "Cyclorama wall",
      "Grip & rigging",
    ],
    amenities: [
      "Fast Wi-Fi",
      "Client lounge",
      "Blackout curtains",
      "Freight access",
    ],
    images: galleryFor("studio-02"),
    theme: "dark",
  },
];

export const getStudioBySlug = (slug: string) =>
  studios.find((s) => s.slug === slug);

export const studioSlugs = studios.map((s) => s.slug);
export type StudioSlug = (typeof studios)[number]["slug"];
