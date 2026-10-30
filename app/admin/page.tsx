import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, Lock, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatMoney, generateDaySlots, localDateString, onsiteAdvance, sessionEndTime } from "@/lib/booking";
import { site } from "@/lib/site";
import { studios, type StudioSlug } from "@/lib/studios";
import { isAdminAuthed } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { listBookings, listPayments, type AdminBookingRow } from "@/lib/server/bookings";
import { getDaySchedule, getMonthBlackoutDays, type HourState } from "@/lib/server/blackouts";
import type { PaymentRow } from "@/lib/supabase/types";
import { AdminLoginForm } from "./AdminLoginForm";
import { AdminSearchBox } from "./AdminSearchBox";
import { SubmitButton } from "./SubmitButton";
import { isCalendarConfigured } from "@/lib/server/google-calendar";
import { ConfirmDeleteButton } from "./ConfirmDeleteButton";
import { CalendarSyncButton } from "./CalendarSyncButton";
import {
  confirmAdvance,
  logout,
  recordStudioPayment,
  removeBooking,
  removePayment,
  toggleHour,
  toggleWholeDay,
} from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type View = "bookings" | "clients" | "payments" | "blackouts";

type Client = {
  key: string;
  name: string;
  email: string;
  phone: string;
  bookings: AdminBookingRow[]; // newest first
  total: number;
};

function statusBadge(row: AdminBookingRow): { label: string; className: string } {
  if (row.booking_status === "cancelled") {
    return { label: "Anulat", className: "bg-neutral-100 text-neutral-400 line-through" };
  }
  if (row.payment_status === "paid") {
    return { label: "Plătit", className: "bg-accent/10 text-accent" };
  }
  if (row.payment_status === "failed") {
    return { label: "Eșuat", className: "bg-red-50 text-red-600" };
  }
  if (row.payment_status === "refunded") {
    return { label: "Rambursat", className: "bg-neutral-100 text-neutral-500" };
  }
  if (row.booking_status === "hold" && row.payment_provider === "mia") {
    return { label: "Așteaptă avans MIA", className: "bg-amber-50 text-amber-700" };
  }
  if (row.booking_status === "hold" && row.payment_provider === "mia_full") {
    return { label: "Așteaptă plată MIA", className: "bg-amber-50 text-amber-700" };
  }
  if (row.payment_provider === "mia_full" && Number(row.deposit_paid) > 0) {
    return { label: "Plătit prin MIA", className: "bg-accent/10 text-accent" };
  }
  if (row.payment_provider === "mia" && Number(row.deposit_paid) > 0) {
    return { label: "Avans primit", className: "bg-accent/10 text-accent" };
  }
  if (row.payment_provider === "mia" || row.payment_provider === "onsite") {
    return { label: "Plată la studio", className: "bg-neutral-100 text-neutral-600" };
  }
  return { label: "În așteptare", className: "bg-amber-50 text-amber-700" };
}

/** Same person across bookings: by email, falling back to the phone's digits. */
const clientKey = (b: AdminBookingRow) =>
  b.customer_email.trim().toLowerCase() || b.customer_phone.replace(/\D/g, "");

const dayFormat = new Intl.DateTimeFormat("ro-RO", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const formatDay = (iso: string) => dayFormat.format(new Date(`${iso}T00:00:00Z`));
const TZ = "Europe/Chisinau";
const dateTimeFormat = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});
/** A real moment (timestamptz) shown in studio time, e.g. "17 oct. 2026, 14:32". */
const formatMoment = (ts: string) => dateTimeFormat.format(new Date(ts));
/** "2026-10" for a timestamp, in studio time. */
const monthKey = (ts: string) =>
  new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: TZ })
    .format(new Date(ts))
    .slice(0, 7);
const monthLabel = (key: string) =>
  new Intl.DateTimeFormat("ro-RO", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${key}-01T00:00:00Z`),
  );
const timeRange = (b: AdminBookingRow) => {
  const start = b.start_time.slice(0, 5);
  return `${start}–${sessionEndTime(start, b.duration)}`;
};

function groupClients(bookings: AdminBookingRow[]): Client[] {
  const map = new Map<string, Client>();
  for (const b of bookings) {
    const key = clientKey(b);
    let c = map.get(key);
    if (!c) {
      // Bookings arrive newest first, so the first row carries the latest contact details.
      c = { key, name: b.customer_name, email: b.customer_email, phone: b.customer_phone, bookings: [], total: 0 };
      map.set(key, c);
    }
    c.bookings.push(b);
    if (b.booking_status !== "cancelled") c.total += Number(b.total_price);
  }
  return [...map.values()];
}

function matches(b: AdminBookingRow, q: string) {
  if (!q) return true;
  const digits = q.replace(/\D/g, "");
  return (
    b.customer_name.toLowerCase().includes(q) ||
    b.customer_email.toLowerCase().includes(q) ||
    (digits.length >= 3 && b.customer_phone.replace(/\D/g, "").includes(digits))
  );
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const authed = await isAdminAuthed();
  if (!authed) return <AdminLoginForm />;

  if (!isSupabaseConfigured()) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-paper px-5 text-center">
        <p className="text-sm text-ink-soft">
          Supabase nu este configurat — nu există rezervări de afișat.
        </p>
      </main>
    );
  }

  const params = await searchParams;
  const view: View =
    params.view === "clients"
      ? "clients"
      : params.view === "payments"
        ? "payments"
        : params.view === "blackouts"
          ? "blackouts"
          : "bookings";
  const month = typeof params.month === "string" && /^\d{4}-\d{2}$/.test(params.month) ? params.month : "";
  const rawQ = typeof params.q === "string" ? params.q.trim() : "";
  const q = rawQ.toLowerCase();

  const bStudio: StudioSlug = params.bs === "studio-02" ? "studio-02" : "studio-01";
  const today = localDateString(new Date());
  const bMonth = typeof params.bm === "string" && /^\d{4}-\d{2}$/.test(params.bm) ? params.bm : today.slice(0, 7);
  const bDay = typeof params.bd === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.bd) ? params.bd : "";

  // Bookings first: listing them also purges expired MIA holds.
  const all = await listBookings();
  const payments = await listPayments();
  const ledgerReady = payments !== null;
  const clients = groupClients(all);
  const clientByKey = new Map(clients.map((c) => [c.key, c]));

  const paidCount = all.filter((b) => b.payment_status === "paid").length;
  const pendingCount = all.filter(
    (b) => b.payment_status === "pending" && b.booking_status !== "cancelled",
  ).length;
  const paidTotal = all
    .filter((b) => b.payment_status === "paid")
    .reduce((sum, b) => sum + Number(b.deposit_paid || b.total_price), 0);

  const bookings = all.filter((b) => matches(b, q));
  const shownClients = clients.filter((c) => c.bookings.some((b) => matches(b, q)));

  // Only the first (newest) row per client shows the "N rezervări" pill — otherwise it
  // visually repeats on every one of that client's rows and reads like a glitch.
  const firstBookingIdForClient = new Map<string, string>();
  for (const b of bookings) {
    const key = clientKey(b);
    if (!firstBookingIdForClient.has(key)) firstBookingIdForClient.set(key, b.id);
  }

  // Newest studio payment per booking, so "Încasat la studio" can offer an inline undo
  // right next to where it was recorded (payments already come back newest-first).
  const lastStudioPaymentByBooking = new Map<string, PaymentRow>();
  for (const p of payments ?? []) {
    if (p.method === "studio" && p.booking_id && !lastStudioPaymentByBooking.has(p.booking_id)) {
      lastStudioPaymentByBooking.set(p.booking_id, p);
    }
  }

  const [bYear, bMonthNum] = bMonth.split("-").map(Number);
  const blackoutDays = view === "blackouts" ? await getMonthBlackoutDays(bStudio, bYear, bMonthNum) : new Set<string>();
  const daySchedule = view === "blackouts" && bDay ? await getDaySchedule(bStudio, bDay) : null;

  const tabHref = (v: View) => {
    const sp = new URLSearchParams();
    if (v !== "bookings") sp.set("view", v);
    if (rawQ) sp.set("q", rawQ);
    const s = sp.toString();
    return s ? `/admin?${s}` : "/admin";
  };

  const blackoutHref = (overrides: { bs?: StudioSlug; bm?: string; bd?: string }) => {
    const sp = new URLSearchParams();
    sp.set("view", "blackouts");
    sp.set("bs", overrides.bs ?? bStudio);
    sp.set("bm", overrides.bm ?? bMonth);
    const bd = "bd" in overrides ? overrides.bd : bDay;
    if (bd) sp.set("bd", bd);
    return `/admin?${sp.toString()}`;
  };

  return (
    <main className="min-h-[100svh] bg-paper px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-serif text-2xl tracking-tight">Rezervări</p>
            <p className="mt-1 text-sm text-ink-soft">
              {all.length} {all.length === 1 ? "rezervare" : "rezervări"} · {clients.length}{" "}
              {clients.length === 1 ? "client" : "clienți"} · {paidCount} plătite · {pendingCount} în
              așteptare · {formatMoney(paidTotal)} încasat
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isCalendarConfigured() && <CalendarSyncButton />}
            <form action={logout}>
              <button
                type="submit"
                className="h-10 shrink-0 rounded-full border border-ink/25 px-5 text-[0.65rem] font-medium uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper"
              >
                Ieși
              </button>
            </form>
          </div>
        </div>

        {/* Tabs + search */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav className="inline-flex max-w-full self-start overflow-x-auto rounded-full border border-line p-1 text-sm">
            {(
              [
                ["bookings", `Rezervări (${all.length})`],
                ["clients", `Clienți (${clients.length})`],
                ["payments", "Plăți"],
                ["blackouts", "Blocaje"],
              ] as const
            ).map(([v, label]) => (
              <Link
                key={v}
                href={tabHref(v)}
                className={cn(
                  "rounded-full px-3.5 py-2 font-medium whitespace-nowrap transition-colors sm:px-4",
                  view === v ? "bg-ink text-paper" : "text-ink-soft hover:text-ink",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          {view !== "blackouts" && <AdminSearchBox defaultValue={rawQ} />}
        </div>

        {view === "bookings" ? (
          bookings.length === 0 ? (
            <Empty q={rawQ} />
          ) : (
            <>
              {/* Wide screens: a table that fits — no sideways scrolling. */}
              <div className="mt-6 hidden rounded-2xl border border-line lg:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint">
                      <th className="px-4 py-3 font-medium">Ședința</th>
                      <th className="px-4 py-3 font-medium">Rezervată pe</th>
                      <th className="px-4 py-3 font-medium">Studio</th>
                      <th className="px-4 py-3 font-medium">Client</th>
                      <th className="px-4 py-3 font-medium">Status &amp; plată</th>
                      <th className="px-4 py-3 text-right font-medium">Sumă</th>
                      <th className="w-12 px-4 py-3">
                        <span className="sr-only">Șterge</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-line align-top last:border-0">
                        <td className="px-4 py-4">
                          <span className="block font-medium whitespace-nowrap">{formatDay(b.date)}</span>
                          <span className="block text-ink-faint">{timeRange(b)}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-ink-soft">{formatMoment(b.created_at)}</td>
                        <td className="px-4 py-4">{b.studio_name}</td>
                        <td className="px-4 py-4">
                          <ClientCell
                            b={b}
                            client={clientByKey.get(clientKey(b))}
                            showBadge={firstBookingIdForClient.get(clientKey(b)) === b.id}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge b={b} />
                          <PaymentActions
                            b={b}
                            ledgerReady={ledgerReady}
                            lastStudioPayment={lastStudioPaymentByBooking.get(b.id) ?? null}
                          />
                        </td>
                        <td className="px-4 py-4 text-right font-medium whitespace-nowrap">
                          {formatMoney(b.total_price)}
                        </td>
                        <td className="px-4 py-4">
                          <DeleteBooking b={b} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phones & tablets: one card per booking. */}
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:hidden">
                {bookings.map((b) => (
                  <li key={b.id} className="rounded-2xl border border-line p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint">Ședința</p>
                        <p className="font-medium">{formatDay(b.date)}</p>
                        <p className="text-sm text-ink-faint">
                          {timeRange(b)} · {b.studio_name}
                        </p>
                        <p className="mt-1.5 text-xs text-ink-faint">Rezervată pe {formatMoment(b.created_at)}</p>
                      </div>
                      <p className="font-serif text-lg whitespace-nowrap">{formatMoney(b.total_price)}</p>
                    </div>
                    <div className="mt-3 border-t border-line pt-3">
                      <ClientCell
                        b={b}
                        client={clientByKey.get(clientKey(b))}
                        showBadge={firstBookingIdForClient.get(clientKey(b)) === b.id}
                      />
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-3 border-t border-line pt-3">
                      <div>
                        <StatusBadge b={b} />
                        <PaymentActions
                          b={b}
                          ledgerReady={ledgerReady}
                          lastStudioPayment={lastStudioPaymentByBooking.get(b.id) ?? null}
                        />
                      </div>
                      <DeleteBooking b={b} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )
        ) : view === "payments" ? (
          <PaymentsView payments={payments} bookings={all} q={q} rawQ={rawQ} month={month} />
        ) : view === "blackouts" ? (
          <BlackoutsView
            studio={bStudio}
            month={bMonth}
            day={bDay}
            blackoutDays={blackoutDays}
            schedule={daySchedule}
            hrefFor={blackoutHref}
          />
        ) : shownClients.length === 0 ? (
          <Empty q={rawQ} />
        ) : (
          <ul className="mt-6 space-y-3">
            {shownClients.map((c) => (
              <li key={c.key}>
                <details className="group rounded-2xl border border-line" open={Boolean(q)}>
                  <summary className="flex cursor-pointer list-none flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0">
                      <p className="font-medium">{c.name}</p>
                      <ContactLinks email={c.email} phone={c.phone} />
                    </div>
                    <div className="flex items-center gap-5 text-sm sm:gap-8">
                      <Stat label="Rezervări" value={String(c.bookings.length)} />
                      <Stat label="Total" value={formatMoney(c.total)} />
                      <Stat label="Ultima" value={formatDay(c.bookings[0].date)} />
                      <ChevronDown
                        size={18}
                        className="ml-auto shrink-0 text-ink-faint transition-transform group-open:rotate-180"
                      />
                    </div>
                  </summary>
                  <ul className="border-t border-line">
                    {c.bookings.map((b) => (
                      <li
                        key={b.id}
                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line px-4 py-3 text-sm last:border-0 sm:px-5"
                      >
                        <span>
                          <span className="font-medium">{formatDay(b.date)}</span>
                          <span className="text-ink-faint">
                            {" "}
                            · {timeRange(b)} · {b.studio_name}
                          </span>
                        </span>
                        <span className="flex items-center gap-3">
                          <StatusBadge b={b} />
                          <span className="font-medium whitespace-nowrap">{formatMoney(b.total_price)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function Empty({ q, none = "Încă nu există nicio rezervare." }: { q: string; none?: string }) {
  return <p className="mt-10 text-sm text-ink-soft">{q ? `Nimic găsit pentru „${q}”.` : none}</p>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="block text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint">{label}</span>
      <span className="block font-medium whitespace-nowrap">{value}</span>
    </span>
  );
}

function ContactLinks({ email, phone }: { email: string; phone: string }) {
  return (
    <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
      <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-ink">
        <Phone size={13} /> {phone}
      </a>
      <a href={`mailto:${email}`} className="inline-flex min-w-0 items-center gap-1.5 break-all hover:text-ink">
        <Mail size={13} className="shrink-0" /> {email}
      </a>
    </span>
  );
}

/**
 * Name, tap-to-call / tap-to-email, and how many times they've booked (links
 * to their history) — shown only once per client (their newest row), since
 * repeating the same "N rezervări" pill on every one of their rows reads
 * like duplicated/broken data rather than one client's booking history.
 */
function ClientCell({
  b,
  client,
  showBadge,
}: {
  b: AdminBookingRow;
  client: Client | undefined;
  showBadge: boolean;
}) {
  const count = client?.bookings.length ?? 1;
  return (
    <div className="min-w-0">
      <p className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{b.customer_name}</span>
        {showBadge && (
          <Link
            href={`/admin?view=clients&q=${encodeURIComponent(b.customer_email || b.customer_phone)}`}
            className={cn(
              "rounded-full px-2 py-0.5 text-[0.65rem] font-medium",
              count > 1 ? "bg-accent/10 text-accent hover:bg-accent/20" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200",
            )}
          >
            {count > 1 ? `${count} rezervări` : "Client nou"}
          </Link>
        )}
      </p>
      <ContactLinks email={b.customer_email} phone={b.customer_phone} />
    </div>
  );
}

function StatusBadge({ b }: { b: AdminBookingRow }) {
  const badge = statusBadge(b);
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap", badge.className)}>
      {badge.label}
    </span>
  );
}

/** "Confirm MIA" form + auto-delete deadline, only for bookings waiting on a MIA transfer. */
function PaymentActions({
  b,
  ledgerReady,
  lastStudioPayment,
}: {
  b: AdminBookingRow;
  ledgerReady: boolean;
  lastStudioPayment: PaymentRow | null;
}) {
  const awaitingAdvance = b.booking_status === "hold" && b.payment_provider === "mia";
  const awaitingFull = b.booking_status === "hold" && b.payment_provider === "mia_full";
  if (!awaitingAdvance && !awaitingFull) {
    if (!ledgerReady) return null;
    const balance = Number(b.total_price) - Number(b.deposit_paid);
    const canRecord = b.booking_status === "confirmed" && balance > 0;
    if (!canRecord && !lastStudioPayment) return null;
    return (
      <div className="mt-2 space-y-1.5">
        {canRecord && (
          <>
            <form action={recordStudioPayment} className="flex items-center gap-1.5">
              <input type="hidden" name="bookingId" value={b.id} />
              <input
                type="number"
                name="amount"
                defaultValue={balance}
                min={1}
                step={1}
                aria-label="Suma încasată la studio"
                className="h-9 w-24 rounded-full border border-line bg-transparent px-3 text-right text-xs outline-none focus:border-ink"
              />
              <SubmitButton
                pendingLabel="Se încasează…"
                className="h-9 shrink-0 rounded-full border border-ink/25 px-4 text-[0.6rem] font-medium uppercase tracking-[0.1em] transition-colors hover:bg-ink hover:text-paper"
              >
                Încasat la studio
              </SubmitButton>
            </form>
            <span className="block text-[0.65rem] text-ink-faint">Rest de plată: {formatMoney(balance)}</span>
          </>
        )}
        {lastStudioPayment && (
          <ConfirmDeleteButton
            action={removePayment}
            name="paymentId"
            value={lastStudioPayment.id}
            label="Anulează încasarea"
            title="Anulezi încasarea?"
            message={`${formatMoney(lastStudioPayment.amount)} încasați la studio pentru ${b.customer_name}. Folosește doar dacă suma a fost introdusă greșit.`}
          />
        )}
      </div>
    );
  }
  const expected = awaitingAdvance ? onsiteAdvance(b.duration, b.total_price) : b.total_price;
  const deadline = new Date(
    new Date(b.created_at).getTime() + site.booking.miaHoldMinutes * 60_000,
  ).toLocaleString("ro-RO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Chisinau",
  });

  return (
    <div className="mt-2">
      <form action={confirmAdvance} className="flex items-center gap-1.5">
        <input type="hidden" name="bookingId" value={b.id} />
        <input
          type="number"
          name="amount"
          defaultValue={expected}
          min={0}
          step={1}
          aria-label="Suma primită prin MIA"
          className="h-9 w-24 rounded-full border border-line bg-transparent px-3 text-right text-xs outline-none focus:border-ink"
        />
        <SubmitButton
          pendingLabel="Se confirmă…"
          className="h-9 shrink-0 rounded-full bg-accent px-4 text-[0.6rem] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-accent-soft"
        >
          Confirmă MIA
        </SubmitButton>
      </form>
      <span className="mt-1 block text-[0.65rem] text-ink-faint">Se șterge automat la {deadline}</span>
    </div>
  );
}

function DeleteBooking({ b }: { b: AdminBookingRow }) {
  return (
    <ConfirmDeleteButton
      action={removeBooking}
      name="bookingId"
      value={b.id}
      title="Ștergi rezervarea?"
      message={`${b.customer_name} · ${formatDay(b.date)}, ${timeRange(b)} · ${b.studio_name}. Rezervarea se șterge definitiv și intervalul se eliberează. Plățile deja încasate rămân în secțiunea Plăți.`}
    />
  );
}

const METHOD_LABEL: Record<PaymentRow["method"], string> = { mia: "MIA", studio: "La studio" };

/** Money received over time: totals, per-month breakdown and every payment. */
function PaymentsView({
  payments,
  bookings,
  q,
  rawQ,
  month,
}: {
  payments: PaymentRow[] | null;
  bookings: AdminBookingRow[];
  q: string;
  rawQ: string;
  month: string;
}) {
  if (payments === null) {
    return (
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        <p className="font-medium">Secțiunea Plăți trebuie activată o singură dată.</p>
        <p className="mt-1">
          Deschide Supabase → SQL Editor, lipește conținutul fișierului{" "}
          <code className="rounded bg-amber-100 px-1">supabase/migrations/0002_payments.sql</code> și apasă Run.
        </p>
      </div>
    );
  }

  const bookingById = new Map(bookings.map((b) => [b.id, b]));
  const now = new Date();
  const thisMonth = monthKey(now.toISOString());
  const lastMonth = monthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 15)).toISOString());

  const sum = (list: PaymentRow[]) => list.reduce((t, p) => t + Number(p.amount), 0);
  const inMonth = (key: string) => payments.filter((p) => monthKey(p.paid_at) === key);
  const outstanding = bookings
    .filter((b) => b.booking_status === "confirmed")
    .reduce((t, b) => t + Math.max(0, Number(b.total_price) - Number(b.deposit_paid)), 0);

  const searched = payments.filter((p) => {
    if (!q) return true;
    const digits = q.replace(/\D/g, "");
    return (
      p.customer_name.toLowerCase().includes(q) ||
      (p.customer_email ?? "").toLowerCase().includes(q) ||
      (digits.length >= 3 && (p.customer_phone ?? "").replace(/\D/g, "").includes(digits))
    );
  });
  const months = [...new Set(searched.map((p) => monthKey(p.paid_at)))];
  const shown = month ? searched.filter((p) => monthKey(p.paid_at) === month) : searched;
  const chips: [string, string, number][] = [
    ["", "Toate", sum(searched)],
    ...months.map((m): [string, string, number] => [
      m,
      monthLabel(m),
      sum(searched.filter((p) => monthKey(p.paid_at) === m)),
    ]),
  ];

  const monthHref = (m: string) => {
    const sp = new URLSearchParams({ view: "payments" });
    if (m) sp.set("month", m);
    if (rawQ) sp.set("q", rawQ);
    return `/admin?${sp}`;
  };

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <StatCard label="Încasat în total" value={formatMoney(sum(payments))} strong />
        <StatCard label={`Luna aceasta · ${monthLabel(thisMonth)}`} value={formatMoney(sum(inMonth(thisMonth)))} />
        <StatCard label={`Luna trecută · ${monthLabel(lastMonth)}`} value={formatMoney(sum(inMonth(lastMonth)))} />
        <StatCard label="MIA" value={formatMoney(sum(payments.filter((p) => p.method === "mia")))} />
        <StatCard label="La studio" value={formatMoney(sum(payments.filter((p) => p.method === "studio")))} />
        <StatCard label="De încasat (confirmate)" value={formatMoney(outstanding)} />
      </div>

      {months.length > 0 && (
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {chips.map(([m, label, total]) => (
            <Link
              key={m || "all"}
              href={monthHref(m)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors",
                month === m ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink/40",
              )}
            >
              <span className="capitalize">{label}</span>
              <span className={cn("ml-2 font-medium", month === m ? "text-paper" : "text-ink")}>
                {formatMoney(total)}
              </span>
            </Link>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <Empty q={rawQ} none="Încă nu există nicio plată înregistrată." />
      ) : (
        <ul className="mt-5 divide-y divide-line rounded-2xl border border-line">
          {shown.map((p) => {
            const b = p.booking_id ? bookingById.get(p.booking_id) : undefined;
            const studio = b?.studio_name ?? p.studio_name;
            const session = p.booking_date
              ? `${formatDay(p.booking_date)}${p.booking_start ? `, ${p.booking_start.slice(0, 5)}` : ""}`
              : null;
            return (
              <li
                key={p.id}
                className="grid gap-x-6 gap-y-2 p-4 sm:grid-cols-[12rem_1fr_auto] sm:items-center sm:px-5"
              >
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint">Încasată pe</p>
                  <p className="text-sm font-medium whitespace-nowrap">{formatMoment(p.paid_at)}</p>
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{p.customer_name}</p>
                  <p className="text-sm text-ink-faint">
                    {session ? `Ședința ${session}` : "Ședință necunoscută"}
                    {studio && ` · ${studio}`}
                    {!b && " · rezervare ștearsă"}
                  </p>
                  {p.note && <p className="text-xs text-ink-faint">{p.note}</p>}
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      p.method === "mia" ? "bg-accent/10 text-accent" : "bg-neutral-100 text-neutral-600",
                    )}
                  >
                    {METHOD_LABEL[p.method]}
                  </span>
                  <span className="ml-auto font-serif text-lg whitespace-nowrap sm:ml-0">
                    {formatMoney(p.amount)}
                  </span>
                  <ConfirmDeleteButton
                    action={removePayment}
                    name="paymentId"
                    value={p.id}
                    size="sm"
                    title="Ștergi plata?"
                    message={`${formatMoney(p.amount)} de la ${p.customer_name}, încasată pe ${formatMoment(p.paid_at)}. Folosește doar dacă plata a fost introdusă greșit.`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatCard({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-4", strong ? "border-ink bg-ink text-paper" : "border-line")}>
      <p className={cn("text-[0.65rem] uppercase tracking-[0.1em]", strong ? "text-paper/70" : "text-ink-faint")}>
        {label}
      </p>
      <p className="mt-1.5 font-serif text-xl tracking-tight">{value}</p>
    </div>
  );
}

const DOW = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
const HOUR_STYLE: Record<HourState, string> = {
  available: "border-line hover:border-accent hover:bg-accent/5",
  blocked: "border-ink bg-ink text-paper",
  booked: "border-line bg-neutral-100 text-ink-faint",
};
const HOUR_TAG: Record<HourState, string> = { available: "Liber", blocked: "Blocat", booked: "Rezervat" };

/**
 * Blocks hours/days that the customer-facing booking flow should treat as
 * unavailable, without touching real bookings — one row in `blackouts` per
 * blocked span. Reads/writes go straight to Supabase with no caching layer,
 * so a toggle here shows up on the site on the very next request.
 */
function BlackoutsView({
  studio,
  month,
  day,
  blackoutDays,
  schedule,
  hrefFor,
}: {
  studio: StudioSlug;
  month: string;
  day: string;
  blackoutDays: Set<string>;
  schedule: { hours: Record<string, HourState>; wholeDay: { id: string } | null } | null;
  hrefFor: (overrides: { bs?: StudioSlug; bm?: string; bd?: string }) => string;
}) {
  const [year, monthNum] = month.split("-").map(Number);
  const firstOfMonth = new Date(year, monthNum - 1, 1);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const leadingPad = (firstOfMonth.getDay() + 6) % 7; // Monday-first grid
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const dayIso = (n: number) => `${year}-${pad2(monthNum)}-${pad2(n)}`;
  const today = localDateString(new Date());

  const prevMonth = new Date(year, monthNum - 2, 1);
  const nextMonth = new Date(year, monthNum, 1);
  const monthKeyOf = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
      <div>
        <div className="mb-4 inline-flex rounded-full border border-line p-1 text-sm">
          {studios.map((s) => (
            <Link
              key={s.slug}
              href={hrefFor({ bs: s.slug, bd: "" })}
              className={cn(
                "rounded-full px-4 py-1.5 transition-colors",
                studio === s.slug ? "bg-ink text-paper" : "text-ink-soft hover:text-ink",
              )}
            >
              {s.name}
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-line p-4">
          <div className="flex items-center justify-between">
            <Link
              href={hrefFor({ bm: monthKeyOf(prevMonth), bd: "" })}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line hover:bg-neutral-100"
              aria-label="Luna precedentă"
            >
              <ChevronLeft size={16} />
            </Link>
            <p className="font-serif text-lg capitalize tracking-tight">{monthLabel(month)}</p>
            <Link
              href={hrefFor({ bm: monthKeyOf(nextMonth), bd: "" })}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line hover:bg-neutral-100"
              aria-label="Luna următoare"
            >
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[0.65rem] uppercase tracking-[0.08em] text-ink-faint">
            {DOW.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1 text-center text-sm">
            {Array.from({ length: leadingPad }).map((_, i) => (
              <span key={`pad-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const n = i + 1;
              const iso = dayIso(n);
              const selected = iso === day;
              const past = iso < today;
              const blocked = blackoutDays.has(iso);
              return (
                <Link
                  key={iso}
                  href={hrefFor({ bd: selected ? "" : iso })}
                  className={cn(
                    "relative flex h-9 items-center justify-center rounded-full transition-colors",
                    selected ? "bg-accent text-white" : past ? "text-neutral-300" : "hover:bg-neutral-100",
                  )}
                >
                  {n}
                  {blocked && !selected && (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-ink" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line p-5">
        {!day ? (
          <p className="text-sm text-ink-soft">Alege o zi din calendar ca să blochezi sau să eliberezi ore.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-medium">{formatDay(day)}</p>
              <form action={toggleWholeDay}>
                <input type="hidden" name="studio" value={studio} />
                <input type="hidden" name="date" value={day} />
                <input type="hidden" name="wholeDayId" value={schedule?.wholeDay?.id ?? ""} />
                <button
                  type="submit"
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-full border px-4 text-[0.65rem] font-medium uppercase tracking-[0.1em] transition-colors",
                    schedule?.wholeDay
                      ? "border-ink bg-ink text-paper hover:bg-ink/85"
                      : "border-ink/25 hover:bg-ink hover:text-paper",
                  )}
                >
                  <Lock size={13} />
                  {schedule?.wholeDay ? "Deblochează toată ziua" : "Blochează toată ziua"}
                </button>
              </form>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {generateDaySlots().map((slot) => {
                const state = schedule?.hours[slot.time] ?? "available";
                const isBooked = state === "booked";
                return (
                  <form key={slot.time} action={toggleHour}>
                    <input type="hidden" name="studio" value={studio} />
                    <input type="hidden" name="date" value={day} />
                    <input type="hidden" name="time" value={slot.time} />
                    <input type="hidden" name="blocked" value={state === "blocked" ? "1" : "0"} />
                    <button
                      type="submit"
                      disabled={isBooked}
                      className={cn(
                        "flex h-14 w-full flex-col items-center justify-center rounded-2xl border text-sm transition-colors",
                        HOUR_STYLE[state],
                        isBooked && "cursor-not-allowed",
                      )}
                    >
                      <span className="font-medium">{slot.time}</span>
                      <span className="text-[0.6rem] uppercase tracking-[0.08em] opacity-70">
                        {HOUR_TAG[state]}
                      </span>
                    </button>
                  </form>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
