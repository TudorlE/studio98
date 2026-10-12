import type { Metadata } from "next";
import { cn } from "@/lib/cn";
import { formatMoney, onsiteAdvance, sessionEndTime } from "@/lib/booking";
import { isAdminAuthed } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { listBookings, type AdminBookingRow } from "@/lib/server/bookings";
import { AdminLoginForm } from "./AdminLoginForm";
import { confirmAdvance, logout } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

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
  if (row.payment_provider === "mia") {
    return { label: "Avans primit", className: "bg-accent/10 text-accent" };
  }
  if (row.payment_provider === "onsite") {
    return { label: "Plată la studio", className: "bg-neutral-100 text-neutral-600" };
  }
  return { label: "În așteptare", className: "bg-amber-50 text-amber-700" };
}

export default async function AdminPage() {
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

  const bookings = await listBookings();
  const paidCount = bookings.filter((b) => b.payment_status === "paid").length;
  const pendingCount = bookings.filter(
    (b) => b.payment_status === "pending" && b.booking_status !== "cancelled",
  ).length;
  const paidTotal = bookings
    .filter((b) => b.payment_status === "paid")
    .reduce((sum, b) => sum + Number(b.deposit_paid || b.total_price), 0);

  return (
    <main className="min-h-[100svh] bg-paper px-5 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-serif text-2xl tracking-tight">Rezervări</p>
            <p className="mt-1 text-sm text-ink-soft">
              {bookings.length} {bookings.length === 1 ? "rezervare" : "rezervări"} · {paidCount}{" "}
              plătite · {pendingCount} în așteptare · {formatMoney(paidTotal)} încasat
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

        {bookings.length === 0 ? (
          <p className="mt-10 text-sm text-ink-soft">Încă nu există nicio rezervare.</p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint">
                  <th className="px-4 py-3 font-medium">Dată &amp; oră</th>
                  <th className="px-4 py-3 font-medium">Studio</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Sumă</th>
                  <th className="px-4 py-3 font-medium">Avans MIA</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const badge = statusBadge(b);
                  const start = b.start_time.slice(0, 5);
                  const awaitingAdvance = b.booking_status === "hold" && b.payment_provider === "mia";
                  const advance = awaitingAdvance ? onsiteAdvance(b.duration, b.total_price) : 0;
                  return (
                    <tr key={b.id} className="border-b border-line last:border-0">
                      <td className="whitespace-nowrap px-4 py-3">
                        {b.date}
                        <span className="text-ink-faint">
                          {" "}
                          · {start}–{sessionEndTime(start, b.duration)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">{b.studio_name}</td>
                      <td className="whitespace-nowrap px-4 py-3">{b.customer_name}</td>
                      <td className="px-4 py-3 text-ink-soft">
                        <span className="block">{b.customer_phone}</span>
                        <span className="block text-xs">{b.customer_email}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                            badge.className,
                          )}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
                        {formatMoney(b.total_price)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {awaitingAdvance && (
                          <form action={confirmAdvance} className="flex items-center gap-1.5">
                            <input type="hidden" name="bookingId" value={b.id} />
                            <input
                              type="number"
                              name="amount"
                              defaultValue={advance}
                              min={0}
                              step={1}
                              aria-label="Suma avansului primit"
                              className="h-9 w-20 rounded-full border border-line bg-transparent px-3 text-right text-xs outline-none focus:border-ink"
                            />
                            <button
                              type="submit"
                              className="h-9 shrink-0 rounded-full bg-accent px-4 text-[0.6rem] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-accent-soft"
                            >
                              Confirmă
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
