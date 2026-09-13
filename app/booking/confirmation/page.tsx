import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/ui/Logo";
import { site } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { getBooking, studioName } from "@/lib/server/bookings";
import { studios } from "@/lib/studios";

export const metadata: Metadata = {
  title: "Booking confirmed",
  robots: { index: false, follow: false },
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const { booking: bookingParam } = await searchParams;
  const bookingIds = (bookingParam ?? "").split(",").map((id) => id.trim()).filter(Boolean);

  const sym = site.booking.currencySymbol;

  let details: {
    studio: string;
    dates: string[];
    time: string;
    total: string;
    paid: string;
    balance: string | null;
    settled: boolean;
  } | null = null;

  if (bookingIds.length > 0 && isSupabaseConfigured()) {
    try {
      const rows = (await Promise.all(bookingIds.map((id) => getBooking(id)))).filter(
        (r): r is NonNullable<typeof r> => Boolean(r),
      );
      if (rows.length > 0) {
        const slug = studios.find((s) => s.id === rows[0].studio_id)?.slug ?? "studio-01";
        const total = rows.reduce((sum, r) => sum + Number(r.total_price), 0);
        const paidAmount = rows.reduce((sum, r) => sum + (Number(r.deposit_paid) || 0), 0);
        const balance = Math.max(0, total - paidAmount);
        details = {
          studio: studioName(slug),
          dates: rows.map((r) => r.date),
          time: `${rows[0].start_time.slice(0, 5)} – ${rows[0].end_time.slice(0, 5)}`,
          total: `${sym}${total.toFixed(0)}`,
          paid: `${sym}${(paidAmount || total).toFixed(0)}`,
          balance: balance > 0 ? `${sym}${balance.toFixed(0)}` : null,
          settled: rows.every((r) => r.payment_status === "paid"),
        };
      }
    } catch {
      /* fall through to generic view */
    }
  }

  return (
    <>
      <header className="border-b border-line">
        <Container className="flex h-16 items-center sm:h-20">
          <Link href="/" aria-label={site.name}>
            <Logo />
          </Link>
        </Container>
      </header>

      <main className="flex-1 py-24 sm:py-32">
        <Container className="max-w-2xl!">
          <div className="grid h-12 w-12 place-items-center border border-ink">
            <Check size={20} strokeWidth={1.5} />
          </div>
          <h1 className="headline mt-8 text-5xl leading-none tracking-tight sm:text-6xl">
            Booking confirmed.
          </h1>
          <p className="mt-5 max-w-prose text-ink-soft">
            {details && !details.settled
              ? "We've received your booking. Payment is still pending — check your email for next steps."
              : "A confirmation email is on its way. Please arrive a few minutes early."}
          </p>

          <dl className="mt-12 divide-y divide-line border-y border-line text-sm">
            <Line label="Booking ID" value={bookingIds[0] ?? "—"} mono />
            {details && (
              <>
                <Line label="Studio" value={details.studio} />
                <Line
                  label={details.dates.length > 1 ? "Dates" : "Date"}
                  value={details.dates.join(", ")}
                />
                <Line label="Time" value={details.time} />
                <Line label={details.balance ? "Paid" : "Total paid"} value={details.paid} />
                {details.balance && <Line label="Due at studio" value={details.balance} />}
              </>
            )}
            {!details && (
              <Line
                label="Status"
                value="Confirmed — full details were sent to your email."
              />
            )}
          </dl>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-12 items-center border border-ink/25 px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper"
            >
              Back to home
            </Link>
            <a
              href={site.contact.mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center bg-ink px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-paper transition-colors hover:bg-ink-soft"
            >
              Get directions
            </a>
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
}

function Line({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <dt className="eyebrow">{label}</dt>
      <dd className={mono ? "text-right font-mono text-xs break-all" : "text-right"}>{value}</dd>
    </div>
  );
}
