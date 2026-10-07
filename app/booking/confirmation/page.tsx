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
import { formatMoney, sessionEndTime } from "@/lib/booking";

export const metadata: Metadata = {
  title: "Rezervare confirmată",
  robots: { index: false, follow: false },
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const { booking: bookingParam } = await searchParams;
  const bookingIds = (bookingParam ?? "").split(",").map((id) => id.trim()).filter(Boolean);

  let details: {
    studio: string;
    dates: string[];
    time: string;
    total: string;
    paid: string;
    balance: string | null;
    settled: boolean;
    /** Pay at the studio, nothing owed up front. */
    onsite: boolean;
    /** Pay at the studio, MIA advance still owed before the booking is confirmed. */
    miaAdvance: string | null;
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
        const provider = rows[0].payment_provider;
        details = {
          studio: studioName(slug),
          dates: rows.map((r) => r.date),
          time: `${rows[0].start_time.slice(0, 5)} – ${sessionEndTime(rows[0].start_time.slice(0, 5), rows[0].duration)}`,
          total: formatMoney(total),
          paid: formatMoney(paidAmount || total),
          balance: balance > 0 ? formatMoney(balance) : null,
          settled: rows.every((r) => r.payment_status === "paid"),
          onsite: provider === "onsite",
          miaAdvance:
            provider === "mia" && rows.some((r) => r.booking_status === "hold")
              ? formatMoney(Math.round((total * site.booking.onsiteAdvancePercent) / 100))
              : null,
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
            {details?.miaAdvance ? "Rezervare înregistrată." : "Rezervare confirmată."}
          </h1>
          <p className="mt-5 max-w-prose text-ink-soft">
            {details?.miaAdvance
              ? `Intervalul este păstrat pentru tine. Rezervarea se confirmă după ce primim avansul de ${details.miaAdvance} prin MIA (Plăți Instant) — detaliile sunt mai jos și pe email.`
              : details?.onsite
                ? "Te așteptăm! Plata se face la studio, în ziua ședinței. Un email de confirmare este pe drum."
                : details && !details.settled
                  ? "Am primit rezervarea ta. Plata este încă în așteptare — verifică emailul pentru pașii următori."
                  : "Un email de confirmare este pe drum. Te rugăm să ajungi cu câteva minute mai devreme."}
          </p>

          <dl className="mt-12 divide-y divide-line border-y border-line text-sm">
            <Line label="Cod rezervare" value={bookingIds[0] ?? "—"} mono />
            {details && (
              <>
                <Line label="Studio" value={details.studio} />
                <Line
                  label={details.dates.length > 1 ? "Date" : "Data"}
                  value={details.dates.join(", ")}
                />
                <Line label="Ora" value={details.time} />
                {details.onsite || details.miaAdvance ? (
                  <>
                    <Line
                      label="Total"
                      value={details.miaAdvance ? details.total : `${details.total} — se achită la studio`}
                    />
                    {details.miaAdvance && (
                      <>
                        <Line label="Avans prin MIA" value={details.miaAdvance} />
                        <Line
                          label="Destinatar"
                          value={`${site.booking.mia.recipient}, ${site.booking.mia.phone}`}
                        />
                        <Line label="Mențiune" value={bookingIds[0] ?? "—"} mono />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Line label={details.balance ? "Achitat" : "Total achitat"} value={details.paid} />
                    {details.balance && <Line label="De achitat la studio" value={details.balance} />}
                  </>
                )}
              </>
            )}
            {!details && (
              <Line
                label="Status"
                value="Confirmată — toate detaliile au fost trimise pe email."
              />
            )}
          </dl>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-12 items-center border border-ink/25 px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper"
            >
              Înapoi acasă
            </Link>
            <a
              href={site.contact.mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center bg-ink px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-paper transition-colors hover:bg-ink-soft"
            >
              Indicații rutiere
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
