import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/ui/Logo";
import { MiaLogo, MiaSeparator, withMiaLogo } from "@/components/ui/MiaLogo";
import { site } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { getBooking, studioName } from "@/lib/server/bookings";
import { studios } from "@/lib/studios";
import { formatMoney, miaHoldLabel, sessionEndTime } from "@/lib/booking";
import { fmt, formatLongDate, getDictionary, localePath, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/booking/confirmation">): Promise<Metadata> {
  const t = getDictionary((await params).lang as Locale);
  return { title: t.confirmation.metaTitle, robots: { index: false, follow: false } };
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: PageProps<"/[lang]/booking/confirmation">) {
  const locale = (await params).lang as Locale;
  const t = getDictionary(locale).confirmation;
  const money = (n: number) => formatMoney(n, locale);
  const hold = miaHoldLabel(locale);
  const bookingParam = (await searchParams).booking;
  const bookingIds = (typeof bookingParam === "string" ? bookingParam : "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const home = localePath(locale);

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

  // Unpaid MIA holds are deleted after `miaHoldMinutes` — the link then points at nothing.
  let expired = false;

  if (bookingIds.length > 0 && isSupabaseConfigured()) {
    try {
      const rows = (await Promise.all(bookingIds.map((id) => getBooking(id)))).filter(
        (r): r is NonNullable<typeof r> => Boolean(r),
      );
      expired = rows.length === 0;
      if (rows.length > 0) {
        const slug = studios.find((s) => s.id === rows[0].studio_id)?.slug ?? "studio-01";
        const total = rows.reduce((sum, r) => sum + Number(r.total_price), 0);
        const paidAmount = rows.reduce((sum, r) => sum + (Number(r.deposit_paid) || 0), 0);
        const balance = Math.max(0, total - paidAmount);
        const provider = rows[0].payment_provider;
        const onHold = rows.some((r) => r.booking_status === "hold");
        details = {
          studio: studioName(slug),
          dates: rows.map((r) => formatLongDate(locale, r.date)),
          time: `${rows[0].start_time.slice(0, 5)} – ${sessionEndTime(rows[0].start_time.slice(0, 5), rows[0].duration)}`,
          total: money(total),
          paid: money(paidAmount || total),
          paidAmount,
          balance: balance > 0 ? money(balance) : null,
          settled: rows.every((r) => r.payment_status === "paid"),
          onsite: (provider === "onsite" || provider === "mia") && !onHold,
          miaAdvance:
            provider === "mia" && onHold
              ? money(Math.round((total * site.booking.onsiteAdvancePercent) / 100))
              : null,
          miaFull: provider === "mia_full" && onHold ? money(total) : null,
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
          <Link href={home} aria-label={site.name}>
            <Logo />
          </Link>
        </Container>
      </header>

      <main className="flex-1 py-24 sm:py-32">
        <Container className="max-w-2xl!">
          {expired ? (
            <div className="flex flex-col items-center text-center">
              <h1 className="headline text-5xl leading-none tracking-tight sm:text-6xl">
                {t.expiredTitle}
              </h1>
              <p className="mt-5 max-w-prose text-ink-soft">{fmt(t.expiredBody, { hold })}</p>
              <Link
                href={home}
                className="mt-10 inline-flex h-12 items-center rounded-full bg-ink px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-paper transition-colors hover:bg-ink-soft"
              >
                {t.rebook}
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center">
                <div className="grid h-12 w-12 place-items-center border border-ink">
                  <Check size={20} strokeWidth={1.5} />
                </div>
                <h1 className="headline mt-8 text-5xl leading-none tracking-tight sm:text-6xl">
                  {miaDue ? t.registered : t.confirmed}
                </h1>
                <p className="mt-5 max-w-prose text-ink-soft">
                  {details?.miaAdvance
                    ? fmt(t.introAdvance, { amount: details.miaAdvance })
                    : details?.miaFull
                      ? fmt(t.introFull, { amount: details.miaFull })
                      : details?.onsite && details.paidAmount === 0
                        ? t.introOnsite
                        : details && !details.settled && !details.onsite && details.paidAmount === 0
                          ? t.introPending
                          : t.introDefault}
                </p>
              </div>

              {miaDue && (
                // MIA QR card — the "minimal modal" layout from the BNM integration guide
                // (white base, black elements, four-colour separator, logo + rights line).
                <div className="mx-auto mt-12 flex max-w-sm flex-col items-center rounded-[2rem] border border-line bg-white px-6 pb-6 pt-8 text-center sm:px-8">
                  <p className="eyebrow">
                    {details?.miaAdvance ? t.payAdvance : t.payFull}
                  </p>
                  <p className="mt-2 font-serif text-4xl tracking-tight">{miaDue}</p>
                  <Image
                    src={site.booking.mia.qrSrc}
                    alt={t.qrAlt}
                    width={240}
                    height={240}
                    className="mt-6 h-52 w-52 sm:h-56 sm:w-56"
                  />
                  <p className="mt-6 text-lg font-medium text-ink">{t.scanAndPay}</p>
                  <p className="mt-2 text-sm text-ink-soft">
                    {fmt(t.qrInstructions, { amount: miaDue, recipient: site.booking.mia.recipient })}
                  </p>
                  <p className="mt-3 text-sm font-medium text-ink">{fmt(t.deadline, { hold })}</p>
                  <a
                    href={site.booking.mia.deepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex h-12 items-center rounded-full bg-black px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-ink-soft"
                  >
                    {withMiaLogo(t.openMia, { variant: "white", className: "h-4" })}
                  </a>
                  <MiaSeparator className="mt-8" />
                  <div className="mt-4 flex w-full items-center justify-between gap-4">
                    <MiaLogo variant="black" className="h-4" />
                    <span className="text-right text-[0.6rem] leading-tight text-ink-faint">
                      {t.miaRights}
                    </span>
                  </div>
                </div>
              )}

              <dl className="mt-12 divide-y divide-line border-y border-line text-sm">
                {details ? (
                  <>
                    <Line label={t.studio} value={details.studio} />
                    <Line
                      label={details.dates.length > 1 ? t.dates : t.date}
                      value={details.dates.join("; ")}
                    />
                    <Line label={t.time} value={details.time} />
                    {miaDue ? (
                      <>
                        <Line label={t.total} value={details.total} />
                        {details.miaAdvance && (
                          <Line label={t.advance} value={details.miaAdvance} />
                        )}
                      </>
                    ) : details.onsite && details.paidAmount === 0 ? (
                      <Line label={t.total} value={fmt(t.totalOnsite, { total: details.total })} />
                    ) : (
                      <>
                        <Line label={details.balance ? t.paid : t.totalPaid} value={details.paid} />
                        {details.balance && <Line label={t.dueAtStudio} value={details.balance} />}
                      </>
                    )}
                  </>
                ) : (
                  <Line label={t.status} value={t.statusValue} />
                )}
              </dl>

              <div className="mt-12 flex justify-center">
                <Link
                  href={home}
                  className="inline-flex h-12 items-center rounded-full border border-ink/25 px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper"
                >
                  {t.backHome}
                </Link>
              </div>
            </>
          )}
        </Container>
      </main>

      <Footer locale={locale} />
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
