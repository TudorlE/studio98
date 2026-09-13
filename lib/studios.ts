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
  /** Weekday hourly rate, in currency units (EUR). */
  pricePerHour: number;
  /** Weekend (Sat/Sun) hourly rate. */
  weekendPricePerHour: number;
  /** Minimum bookable hours on a weekday / on a weekend. */
  minHours: number;
  weekendMinHours: number;
  equipment: string[];
  amenities: string[];
  images: StudioImage[];
  /** Visual identity toggle for the section (light / dark treatment). */
  theme: "light" | "dark";
};

/**
 * Optional extras added to a booking, à la carte.
 * `unit: "flat"` — charged once. `unit: "hour"` — multiplied by the booking length.
 * All example values — set real ones with the studio owner.
 */
export type AddOn = {
  id: string;
  name: string;
  note: string;
  price: number;
  unit: "flat" | "hour";
};

export const studioAddOns: AddOn[] = [
  { id: "cyclorama", name: "White wall", note: "A smooth white background", price: 20, unit: "flat" },
  { id: "lighting-kit", name: "Extra lights", note: "More light for your shoot", price: 25, unit: "flat" },
  { id: "backdrop", name: "Extra backdrop", note: "Pick a different colour", price: 10, unit: "flat" },
  { id: "assistant", name: "A helper", note: "Someone to help during your shoot", price: 15, unit: "hour" },
  { id: "glam", name: "Makeup corner", note: "Mirror and a good light", price: 15, unit: "flat" },
];

export const addOnById = (id: string) => studioAddOns.find((a) => a.id === id);

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
    description: "A bright room, full of natural light.",
    area: "00 m²",
    capacity: "Up to 00 people",
    pricePerHour: 25,
    weekendPricePerHour: 30,
    // Duration selection is paused for now (every booking is 1 hour) — both
    // set to 1 so that's always satisfiable. Restore real minimums when the
    // "how long" step comes back.
    minHours: 1,
    weekendMinHours: 1,
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
    description: "A dark room, made for dramatic light.",
    area: "00 m²",
    capacity: "Up to 00 people",
    pricePerHour: 30,
    weekendPricePerHour: 35,
    // See the note on Studio 01 — paused while duration selection is off.
    minHours: 1,
    weekendMinHours: 1,
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
