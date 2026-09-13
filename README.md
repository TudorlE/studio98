# STUDIO 98 — studio rental website

Premium, editorial single-page site for a business renting two photo/video
studios, with a real booking + payment architecture behind it.

> **All business content is placeholder.** Studio names, prices, address, phone,
> email, social links and images are stand-ins. Search the codebase for
> `placeholder` / `TODO` and replace before launch.

## Homepage: one screen, nothing to scroll for

The homepage is a single fixed screen — the hero photo, a headline, and two
square tiles ("Studio 01" / "Studio 02"). `<NoScrollEffect>` locks page
scrolling while it's mounted, so there is nothing below the fold to miss.

Tapping a tile opens `<StudioDetails>` — a full-screen "photos and details"
overlay for that studio (bigger photo, description, price, a gallery icon
that opens the lightbox, and a "Book Studio 0X" button). State lives in
`StudioDetailsContext`
([`components/sections/StudioDetailsContext.tsx`](components/sections/StudioDetailsContext.tsx)),
so the menu can open the same overlay as the tiles
(`useStudioDetails().openDetails("studio-01")`).

**Booking is a slide-over panel, not a page.** Any "Book a studio" button
(header, or a studio's details overlay) opens `<BookingDrawer>` — a right-side
panel on desktop (`sm:w-[420px] sm:max-w-[46vw]`, always under half the
screen) and a full-screen panel on mobile. It walks through: studio → day →
duration → time → extras → your details, with a running price on a sticky
button at the bottom. State lives in `BookingDrawerContext`
([`components/booking/BookingDrawerContext.tsx`](components/booking/BookingDrawerContext.tsx)),
so any component can call `useBookingDrawer().openBooking("studio-01")`.

The Footer, and its legal/contact links, live on the confirmation and legal
pages; on the homepage that same information is one tap away in the menu
(top-left icon).

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript (strict)**
- **Tailwind CSS v4** — design tokens in [`app/globals.css`](app/globals.css)
- **Framer Motion** — swipe-to-navigate on a studio's photo
  ([`components/sections/StudioDetails.tsx`](components/sections/StudioDetails.tsx)),
  plus slide-in panels for the menu and booking drawer.
- **lucide-react** — icons
- **Supabase** — database + availability + bookings
- **Stripe** — card / Apple Pay / Google Pay via hosted checkout
- **Resend** (optional) — confirmation emails

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — site runs without it
npm run dev                  # http://localhost:3000
```

With **no environment variables**, the marketing site is fully functional and
the booking UI works in **demo mode** (every slot shows as available; submitting
returns a "backend not configured" message).

## Deploy to Vercel

This repo is the project root — import it into Vercel as-is (framework
auto-detected as Next.js, no root-directory override).

1. **New Project → Import** `TudorlE/studio98`.
2. Set environment variables (Project → Settings → Environment Variables). The
   only one recommended for a first deploy:
   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | your deployment URL, e.g. `https://studio98.vercel.app` |
   Add the Supabase / Stripe / Resend keys from [`.env.example`](.env.example)
   when you're ready to switch off demo mode.
3. **Deploy.** Build command `next build` and install `npm install` are the
   defaults — nothing to change.
4. After adding `STRIPE_WEBHOOK_SECRET`, point a Stripe webhook at
   `https://<your-domain>/api/webhooks/stripe` (events:
   `checkout.session.completed`, `checkout.session.expired`,
   `checkout.session.async_payment_failed`).

`.env*` is gitignored — secrets only live in the Vercel dashboard.

## Enabling real bookings

1. Create a Supabase project.
2. Run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   then [`supabase/seed.sql`](supabase/seed.sql) in the SQL editor.
3. Put the project URL + **service-role** key in `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

Double-booking is prevented at two levels:

- a fast pre-check in the API, and
- a Postgres **exclusion constraint** (`bookings_no_overlap`, GiST on
  `studio_id` + time range) — the authoritative guard against races.

Cancelled bookings automatically free their slot.

### Booking rules

Modelled on how studio-rental widgets (e.g. Mayak / Cue) work:

- **Weekday vs weekend rate** — `pricePerHour` / `weekendPricePerHour` per studio
  ([`lib/studios.ts`](lib/studios.ts)); weekend days set in
  [`lib/site.ts`](lib/site.ts) (`booking.weekendDays`).
- **Minimum hours** — `minHours` / `weekendMinHours` per studio; shorter
  durations are disabled in the picker and rejected by the API (422).
- **Add-on services** — à-la-carte extras (cyclorama, lighting kit, assistant …)
  in `studioAddOns`; `unit: "flat"` charged once, `unit: "hour"` × the booking
  length. Stored on the booking as `add_ons` JSON.
- **Deposit** — `booking.depositPercent` in [`lib/site.ts`](lib/site.ts).
  `100` = pay in full; lower takes a deposit online and shows the balance as
  "due at the studio" on checkout, the confirmation page and the email.

Prices are **always recomputed server-side** in `createHold` — the client total
is display-only.

## Enabling payments

Set `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (and
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`). The flow:

```
booking form → POST /api/bookings → creates `hold` row
            → Stripe Checkout (hosted, card never touches our servers)
            → webhook /api/webhooks/stripe → row becomes `confirmed` + email
            → /booking/confirmation?booking=<id>
```

Local webhook testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Switching payment provider (e.g. for Moldova)

Everything payment-related sits behind
[`lib/payments/provider.ts`](lib/payments/provider.ts). To add maib / Paynet /
another processor:

1. Create `lib/payments/<name>.ts` implementing `PaymentProvider`.
2. Register it in [`lib/payments/index.ts`](lib/payments/index.ts).
3. Set `PAYMENT_PROVIDER=<name>`.

No route or UI changes required.

## Project structure

```
app/
  page.tsx                     one-page composition
  layout.tsx                   fonts, metadata, viewport
  opengraph-image.tsx          generated OG image
  robots.ts / sitemap.ts
  booking/confirmation/        post-payment page
  legal/[doc]/                 terms / privacy / cancellation (placeholder copy)
  api/
    availability/              GET slot statuses
    bookings/                  POST create hold + start checkout
    webhooks/stripe/           POST payment events
components/
  layout/    Header (centered logo + Book button), MobileMenu (the site's
             only other nav — studios, legal), Footer (used on the
             confirmation/legal pages)
  sections/  Hero (the 2 studio tiles), StudioTile, StudioDetails
             (full-screen photos-and-details overlay, photo swiped
             directly — no separate gallery), StudioDetailsContext,
             Directions (how to find us), Rules (house rules)
  booking/   BookingDrawerContext (global open/close state), BookingDrawer
             (the slide-over panel — studio → day & time (date strip +
             per-day hourly grid) → details), BookingForm, BookStudioButton
  ui/        Container, Button, AnchorLink (smooth in-page scroll), Logo
lib/
  site.ts        contact / hours / currency config  (PLACEHOLDER)
  studios.ts     studio content + images            (PLACEHOLDER)
  booking.ts     pure slot / pricing / overlap logic
  validation.ts  zod schemas for the API
  payments/      provider abstraction + Stripe impl
  server/bookings.ts   Supabase-backed booking operations
  supabase/      admin client + row types
  email.ts       Resend or console fallback
supabase/
  migrations/0001_init.sql     schema + RLS + overlap constraint
  seed.sql
```

## Swapping images

The site uses free-licensed photo-studio interiors from Unsplash, stored in
`public/images/`. Each studio's first gallery image (`01.jpg`) is also its
full-screen page background. To use the studio's own photography, replace the
files in `public/images/hero.jpg` and `public/images/<slug>/` — keep the same
filenames and no code changes are needed. Captions/alt text live in
[`lib/studios.ts`](lib/studios.ts). For remote hosting (Supabase Storage etc.)
add the host to `images.remotePatterns` in [`next.config.ts`](next.config.ts).

## Logo

[`components/ui/Logo.tsx`](components/ui/Logo.tsx) renders the real brand
files, `public/logo.png` (black, for light backgrounds) and
`public/logo-white.png` (white, for the photo pages) — pass
`variant="white"`/`"black"`. Replace those two PNGs to update the mark
everywhere at once.

## Future admin panel

The schema already supports it: `bookings` (view/calendar/payment status),
`blackouts` (block days or hours — respected by the availability API),
`studios` / `studio_images` (prices + galleries). Build the UI against the
service-role client; RLS keeps the anon key read-only.

## Scripts

| command | |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | production build |
| `npm run start` | serve the build |
| `npm run lint` | eslint |

## Known checks performed

- `tsc --noEmit` clean · `next build` clean · `eslint` clean
- API tested: availability (demo + past/closed logic), booking validation (400),
  demo-mode guard (503), 404s
- Responsive breakpoints targeted: 390 / 393 / 430 / 768 / 1024 / 1440 / 1920
- `prefers-reduced-motion` honoured in all animations
