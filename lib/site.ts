/**
 * Central site configuration.
 *
 * Everything here is a PLACEHOLDER. Replace with real values before launch.
 * Nothing in this object is invented as a real-world fact — treat every
 * string below as "to be provided by the studio owner".
 */

export const site = {
  name: "STUDIO 98",
  legalName: "Studio 98 SRL",
  domain: process.env.NEXT_PUBLIC_SITE_URL || "https://studio98.example", // TODO: real domain
  tagline: "Studiouri pentru fotografie și film",
  description:
    "Două studiouri în centrul orașului — pentru fotografie, film și evenimente. Rezervare la oră.",
  contact: {
    // TODO: replace all contact details with real ones
    phone: "+373 00 000 000",
    phoneHref: "tel:+37300000000",
    email: "hello@studio98.example",
    emailHref: "mailto:hello@studio98.example",
    address: {
      line1: "31 August 1989 St 98",
      line2: "MD-2004, Chișinău",
      country: "Moldova",
    },
    // Real location — pinned by coordinates so the embed and directions match exactly.
    mapsQuery: "31 August 1989 St 98, MD-2004, Chișinău, Moldova",
    mapsEmbedSrc:
      "https://www.google.com/maps?q=47.028892,28.8209084&output=embed&hl=ro",
    mapsDirectionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=47.028892,28.8209084",
  },
  social: {
    instagram: "https://instagram.com/", // TODO
    tiktok: "https://tiktok.com/", // TODO
    facebook: "https://facebook.com/", // TODO
  },
  booking: {
    // Opening hours used to generate bookable slots (24h clock, local time).
    openingHour: 8,
    closingHour: 22,
    slotMinutes: 60,
    // How many days ahead the calendar allows booking.
    maxAdvanceDays: 120,
    // Minimum lead time in hours before a slot can be booked.
    minLeadHours: 2,
    currency: "EUR",
    currencySymbol: "€",
    durations: [1, 2, 3, 4, 5, 6],
    // Days that use the weekend rate + weekend minimum (0 = Sunday … 6 = Saturday).
    weekendDays: [6, 0],
    // Share of the total charged online now. 100 = pay in full.
    // Set e.g. 30 to take a 30% deposit and collect the balance at the studio.
    depositPercent: 100,
  },
} as const;

export type Site = typeof site;
