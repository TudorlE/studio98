import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, Mail, Phone, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatMoney, onsiteAdvance, sessionEndTime } from "@/lib/booking";
import { site } from "@/lib/site";
import { isAdminAuthed } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { listBookings, type AdminBookingRow } from "@/lib/server/bookings";
import { AdminLoginForm } from "./AdminLoginForm";
import { DeleteBookingButton } from "./DeleteBookingButton";
import { confirmAdvance, logout } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type View = "bookings" | "clients";

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
  const view: View = params.view === "clients" ? "clients" : "bookings";
  const rawQ = typeof params.q === "string" ? params.q.trim() : "";
  const q = rawQ.toLowerCase();

  const all = await listBookings();
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

  const tabHref = (v: View) => {
    const sp = new URLSearchParams();
    if (v === "clients") sp.set("view", "clients");
    if (rawQ) sp.set("q", rawQ);
    const s = sp.toString();
    return s ? `/admin?${s}` : "/admin";
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
          <form action={logout}>
            <button
              type="submit"
              className="h-10 shrink-0 rounded-full border border-ink/25 px-5 text-[0.65rem] font-medium uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper"
            >
              Ieși
            </button>
          </form>
        </div>

        {/* Tabs + search */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav className="inline-flex self-start rounded-full border border-line p-1 text-sm">
            {(
              [
                ["bookings", `Rezervări (${all.length})`],
                ["clients", `Clienți (${clients.length})`],
              ] as const
            ).map(([v, label]) => (
              <Link
                key={v}
                href={tabHref(v)}
                className={cn(
                  "rounded-full px-4 py-2 font-medium transition-colors",
                  view === v ? "bg-ink text-paper" : "text-ink-soft hover:text-ink",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <form action="/admin" className="relative w-full sm:w-80">
            {view === "clients" && <input type="hidden" name="view" value="clients" />}
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-faint"
            />
            <input
              type="search"
              name="q"
              defaultValue={rawQ}
              placeholder="Caută nume, email sau telefon"
              className="h-11 w-full rounded-full border border-line bg-transparent pr-4 pl-10 text-sm outline-none focus:border-ink"
            />
          </form>
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
                      <th className="px-4 py-3 font-medium">Dată &amp; oră</th>
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
                        <td className="px-4 py-4">{b.studio_name}</td>
                        <td className="px-4 py-4">
                          <ClientCell b={b} client={clientByKey.get(clientKey(b))} />
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge b={b} />
                          <PaymentActions b={b} />
                        </td>
                        <td className="px-4 py-4 text-right font-medium whitespace-nowrap">
                          {formatMoney(b.total_price)}
                        </td>
                        <td className="px-4 py-4">
                          <DeleteBookingButton
                            bookingId={b.id}
                            label={`${b.customer_name}, ${b.date} ${b.start_time.slice(0, 5)}`}
                          />
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
                        <p className="font-medium">{formatDay(b.date)}</p>
                        <p className="text-sm text-ink-faint">
                          {timeRange(b)} · {b.studio_name}
                        </p>
                      </div>
                      <p className="font-serif text-lg whitespace-nowrap">{formatMoney(b.total_price)}</p>
                    </div>
                    <div className="mt-3 border-t border-line pt-3">
                      <ClientCell b={b} client={clientByKey.get(clientKey(b))} />
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-3 border-t border-line pt-3">
                      <div>
                        <StatusBadge b={b} />
                        <PaymentActions b={b} />
                      </div>
                      <DeleteBookingButton
                        bookingId={b.id}
                        label={`${b.customer_name}, ${b.date} ${b.start_time.slice(0, 5)}`}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )
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

function Empty({ q }: { q: string }) {
  return (
    <p className="mt-10 text-sm text-ink-soft">
      {q ? `Nimic găsit pentru „${q}”.` : "Încă nu există nicio rezervare."}
    </p>
  );
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

/** Name, tap-to-call / tap-to-email, and how many times they've booked (links to their history). */
function ClientCell({ b, client }: { b: AdminBookingRow; client: Client | undefined }) {
  const count = client?.bookings.length ?? 1;
  return (
    <div className="min-w-0">
      <p className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{b.customer_name}</span>
        <Link
          href={`/admin?view=clients&q=${encodeURIComponent(b.customer_email || b.customer_phone)}`}
          className={cn(
            "rounded-full px-2 py-0.5 text-[0.65rem] font-medium",
            count > 1 ? "bg-accent/10 text-accent hover:bg-accent/20" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200",
          )}
        >
          {count > 1 ? `${count} rezervări` : "Client nou"}
        </Link>
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
function PaymentActions({ b }: { b: AdminBookingRow }) {
  const awaitingAdvance = b.booking_status === "hold" && b.payment_provider === "mia";
  const awaitingFull = b.booking_status === "hold" && b.payment_provider === "mia_full";
  if (!awaitingAdvance && !awaitingFull) return null;
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
        <button
          type="submit"
          className="h-9 shrink-0 rounded-full bg-accent px-4 text-[0.6rem] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-accent-soft"
        >
          Confirmă MIA
        </button>
      </form>
      <span className="mt-1 block text-[0.65rem] text-ink-faint">Se șterge automat la {deadline}</span>
    </div>
  );
}
