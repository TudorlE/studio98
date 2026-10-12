import type { Metadata } from "next";
import Image from "next/image";
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
    paidAmount: number;
    balance: string | null;
    settled: boolean;
    /** Pay at the studio, nothing owed up front. */
    onsite: boolean;
    /** Pay at the studio, MIA advance still owed before the booking is confirmed. */
    miaAdvance: string | null;
    /** Client chose to pay the whole thing via MIA, right now — held until confirmed. */
    miaFull: string | null;
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
        const onHold = rows.some((r) => r.booking_status === "hold");
        details = {
          studio: studioName(slug),
          dates: rows.map((r) => r.date),
          time: `${rows[0].start_time.slice(0, 5)} – ${sessionEndTime(rows[0].start_time.slice(0, 5), rows[0].duration)}`,
          total: formatMoney(total),
          paid: formatMoney(paidAmount || total),
          paidAmount,
          balance: balance > 0 ? formatMoney(balance) : null,
          settled: rows.every((r) => r.payment_status === "paid"),
          onsite: (provider === "onsite" || provider === "mia") && !onHold,
          miaAdvance:
            provider === "mia" && onHold
              ? formatMoney(Math.round((total * site.booking.onsiteAdvancePercent) / 100))
              : null,
          miaFull: provider === "mia_full" && onHold ? formatMoney(total) : null,
        };
      }
    } catch {
      /* fall through to generic view */
    }
  }

  // Only bookings still waiting on a MIA transfer get the QR code.
  const miaDue = details?.miaAdvance ?? details?.miaFull ?? null;

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
          <div className="flex flex-col items-center text-center">
            <div className="grid h-12 w-12 place-items-center border border-ink">
              <Check size={20} strokeWidth={1.5} />
            </div>
            <h1 className="headline mt-8 text-5xl leading-none tracking-tight sm:text-6xl">
              {miaDue ? "Rezervare înregistrată." : "Rezervare confirmată."}
            </h1>
            <p className="mt-5 max-w-prose text-ink-soft">
              {details?.miaAdvance
                ? `Intervalul este păstrat pentru tine. Rezervarea se confirmă după ce primim avansul de ${details.miaAdvance} prin MIA (Plăți Instant). Ți-am trimis și un email de confirmare cu toate detaliile.`
                : details?.miaFull
                  ? `Intervalul este păstrat pentru tine. Rezervarea se confirmă după ce primim plata de ${details.miaFull} prin MIA (Plăți Instant). Ți-am trimis și un email de confirmare cu toate detaliile.`
                  : details?.onsite && details.paidAmount === 0
                    ? "Te așteptăm! Plata se face la studio, în ziua ședinței. Un email de confirmare este pe drum."
                    : details && !details.settled && !details.onsite && details.paidAmount === 0
                      ? "Am primit rezervarea ta. Plata este încă în așteptare — verifică emailul pentru pașii următori."
                      : "Un email de confirmare este pe drum. Te rugăm să ajungi cu câteva minute mai devreme."}
            </p>
          </div>

          {miaDue && (
            <div className="mt-12 flex flex-col items-center border border-line p-6 text-center sm:p-10">
              <p className="eyebrow">
                {details?.miaAdvance ? "Plătește avansul prin MIA" : "Plătește prin MIA"}
              </p>
              <p className="mt-3 font-serif text-4xl tracking-tight">{miaDue}</p>
              <Image
                src={site.booking.mia.qrSrc}
                alt="Cod QR MIA pentru plată"
                width={240}
                height={240}
                className="mt-6 h-48 w-48 sm:h-56 sm:w-56"
              />
              <p className="mt-6 max-w-sm text-sm text-ink-soft">
                Scanează codul cu aplicația băncii tale sau deschide MIA direct de pe telefon, apoi
                trimite suma de {miaDue} către {site.booking.mia.recipient}.
              </p>
              <a
                href={site.booking.mia.deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-paper transition-colors hover:bg-ink-soft"
              >
                Deschide în MIA
              </a>
            </div>
          )}

          <dl className="mt-12 divide-y divide-line border-y border-line text-sm">
            {details ? (
              <>
                <Line label="Studio" value={details.studio} />
                <Line
                  label={details.dates.length > 1 ? "Date" : "Data"}
                  value={details.dates.join(", ")}
                />
                <Line label="Ora" value={details.time} />
                {miaDue ? (
                  <>
                    <Line label="Total" value={details.total} />
                    {details.miaAdvance && (
                      <Line label="Avans prin MIA" value={details.miaAdvance} />
                    )}
                  </>
                ) : details.onsite && details.paidAmount === 0 ? (
                  <Line label="Total" value={`${details.total} — se achită la studio`} />
                ) : (
                  <>
                    <Line label={details.balance ? "Achitat" : "Total achitat"} value={details.paid} />
                    {details.balance && <Line label="De achitat la studio" value={details.balance} />}
                  </>
                )}
              </>
            ) : (
              <Line
                label="Status"
                value="Confirmată — toate detaliile au fost trimise pe email."
              />
            )}
          </dl>

          <div className="mt-12 flex justify-center">
            <Link
              href="/"
              className="inline-flex h-12 items-center rounded-full border border-ink/25 px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper"
            >
              Înapoi acasă
            </Link>
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <dt className="eyebrow">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
