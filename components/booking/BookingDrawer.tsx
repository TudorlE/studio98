"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";
import { studios, subtitleWordSpacing, type StudioSlug } from "@/lib/studios";
import {
  addDays,
  endTimeFor,
  formatMoney,
  generateDaySlots,
  localDateString,
  multiDatePriceBreakdown,
  rateForDate,
  studioTimezoneLabel,
  type SlotStatus,
} from "@/lib/booking";
import { BookingForm, type CustomerFields } from "./BookingForm";
import { useBookingDrawer } from "./BookingDrawerContext";

const ease = [0.22, 1, 0.36, 1] as const;
const emptyCustomer: CustomerFields = { name: "", email: "", phone: "" };

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Step = 1 | 2 | 3;
type DayStatus = "busy" | "full";

/** Every slot must be free on every selected date to count as available. */
function intersectStatuses(maps: Record<string, SlotStatus>[]): Record<string, SlotStatus> {
  if (maps.length === 0) return {};
  const result: Record<string, SlotStatus> = {};
  for (const time of Object.keys(maps[0])) {
    const values = maps.map((m) => m[time] ?? "closed");
    result[time] = values.every((v) => v === "available")
      ? "available"
      : (values.find((v) => v !== "available") ?? "booked");
  }
  return result;
}

export function BookingDrawer() {
  const { isOpen, initialStudio, closeBooking } = useBookingDrawer();

  const [step, setStep] = useState<Step>(1);
  const [studio, setStudio] = useState<StudioSlug | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const allTimes = useMemo(() => generateDaySlots().map((s) => s.time), []);
  const tzLabel = useMemo(() => studioTimezoneLabel(), []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [monthCursor, setMonthCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [monthStatus, setMonthStatus] = useState<Record<string, DayStatus>>({});

  const [statuses, setStatuses] = useState<Record<string, SlotStatus> | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [customer, setCustomer] = useState<CustomerFields>(emptyCustomer);
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Fresh start every time the panel opens.
  useEffect(() => {
    if (!isOpen) return;
    // Resetting a dialog's form state when it opens — not a data sync loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStudio(initialStudio);
    setStep(initialStudio ? 2 : 1);
    setDates([]);
    setTimes([]);
    setStatuses(null);
    setAvailabilityError(null);
    setMonthCursor(new Date(today.getFullYear(), today.getMonth(), 1));
    setCustomer(emptyCustomer);
    setTerms(false);
    setSubmitError(null);
  }, [isOpen, initialStudio, today]);

  // Lock page scroll + close on Escape while open.
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeBooking();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeBooking]);

  // Which days this month are partly/fully booked — feeds the date strip.
  useEffect(() => {
    if (!isOpen || !studio) return;
    const ctrl = new AbortController();
    const params = new URLSearchParams({
      studio,
      year: String(monthCursor.getFullYear()),
      month: String(monthCursor.getMonth() + 1),
    });
    fetch(`/api/availability/month?${params}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { status?: Record<string, DayStatus> } | null) => {
        setMonthStatus(data?.status ?? {});
      })
      .catch(() => setMonthStatus({}));
    return () => ctrl.abort();
  }, [isOpen, studio, monthCursor]);

  const loadAvailability = useCallback(
    async (slug: StudioSlug, days: string[], signal: AbortSignal) => {
      try {
        const maps = await Promise.all(
          days.map(async (day) => {
            const params = new URLSearchParams({ studio: slug, date: day, duration: "1" });
            const res = await fetch(`/api/availability?${params}`, { signal });
            if (!res.ok) throw new Error("bad status");
            const data: { slots: Record<string, SlotStatus> } = await res.json();
            return [day, data.slots] as const;
          }),
        );
        setStatuses(intersectStatuses(maps.map(([, m]) => m)));
        setTimes((cur) =>
          cur.length > 0 && cur.every((t) => maps.every(([, m]) => m[t] === "available")) ? cur : [],
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setAvailabilityError("Couldn't load times. Please try again.");
        setStatuses(null);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isOpen || !studio || dates.length === 0) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keyed data fetch, state set after await
    void loadAvailability(studio, dates, ctrl.signal);
    return () => ctrl.abort();
  }, [isOpen, studio, dates, reloadKey, loadAvailability]);

  const studioData = studios.find((s) => s.slug === studio) ?? null;

  const breakdown = useMemo(
    () =>
      studio && dates.length > 0
        ? multiDatePriceBreakdown({ slug: studio, dates, durationHours: times.length || 1 })
        : null,
    [studio, dates, times.length],
  );

  const canSubmit = Boolean(
    studio &&
      dates.length > 0 &&
      times.length > 0 &&
      terms &&
      customer.name.trim().length >= 2 &&
      /.+@.+\..+/.test(customer.email) &&
      customer.phone.trim().length >= 6,
  );

  const pickStudio = (slug: StudioSlug) => {
    setStudio(slug);
    setDates([]);
    setTimes([]);
    setStatuses(null);
    setStep(2);
  };

  const toggleDate = (d: string) => {
    setDates((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort()));
    setTimes([]);
  };

  /** Tap a time to start, tap another to book every hour in between. */
  const pickTime = (t: string) => {
    if (!statuses) return;
    setTimes((cur) => {
      if (cur.length === 0) return [t];
      if (cur.length === 1 && cur[0] === t) return [];
      const anchor = cur[0];
      const ia = allTimes.indexOf(anchor);
      const it = allTimes.indexOf(t);
      if (ia === -1 || it === -1) return [t];
      const [lo, hi] = ia <= it ? [ia, it] : [it, ia];
      const range = allTimes.slice(lo, hi + 1);
      return range.every((time) => statuses[time] === "available") ? range : [t];
    });
  };

  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  const submit = useCallback(async () => {
    if (!studio || dates.length === 0 || times.length === 0 || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studio,
          dates,
          startTime: times[0],
          durationHours: times.length,
          addOnIds: [],
          customer: {
            name: customer.name.trim(),
            email: customer.email.trim(),
            phone: customer.phone.trim(),
          },
          termsAccepted: true,
        }),
      });
      const data = await res.json();

      if (res.ok && (data.checkoutUrl || data.confirmationUrl)) {
        window.location.assign(data.checkoutUrl ?? data.confirmationUrl);
        return;
      }
      if (res.status === 409) {
        setSubmitError(data.error ?? "One of those times was just taken.");
        setTimes([]);
        setStep(2);
        setReloadKey((k) => k + 1);
        return;
      }
      setSubmitError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setSubmitError("No connection. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [studio, dates, times, customer, canSubmit]);

  // Checking the house-rules box is the final step — once everything else on
  // the form is already valid, it goes straight to payment (no extra click).
  const autoBookedRef = useRef(false);
  useEffect(() => {
    if (!canSubmit) {
      autoBookedRef.current = false;
      return;
    }
    if (step !== 3 || submitting || autoBookedRef.current) return;
    autoBookedRef.current = true;
    void submit();
  }, [step, canSubmit, submitting, submit]);

  const buttonLabel = (() => {
    if (submitting) return "Booking…";
    if (!breakdown) return "Book a studio";
    if (breakdown.depositPercent < 100) return `Pay ${formatMoney(breakdown.dueNow)} now`;
    return `Pay ${formatMoney(breakdown.total)} & book`;
  })();

  const timeSummary =
    times.length === 0
      ? null
      : times.length === 1
        ? times[0]
        : `${times[0]}–${endTimeFor(times[times.length - 1], 1)}`;

  const stepTitle: Record<Step, string> = {
    1: "Choose a studio",
    2: "Day & time",
    3: "Your details",
  };

  const monthDays = useMemo(() => {
    const count = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => new Date(monthCursor.getFullYear(), monthCursor.getMonth(), i + 1));
  }, [monthCursor]);

  const maxDate = useMemo(() => addDays(today, site.booking.maxAdvanceDays), [today]);
  const canPrevMonth = monthCursor > new Date(today.getFullYear(), today.getMonth(), 1);
  const canNextMonth = monthCursor < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  const shiftMonth = (delta: number) =>
    setMonthCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-[80] bg-black/45"
            onClick={closeBooking}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Book a studio"
            className="fixed inset-0 z-[90] flex w-full flex-col bg-paper font-sans sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[85vw] sm:max-w-[560px] lg:w-[55vw] lg:max-w-[760px]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button
                    onClick={goBack}
                    aria-label="Back"
                    className="grid h-9 w-9 place-items-center text-ink-soft hover:text-ink"
                  >
                    <ChevronLeft size={20} strokeWidth={1.5} />
                  </button>
                )}
                <p className="font-serif text-xl tracking-tight">Book a studio</p>
              </div>
              <button
                onClick={closeBooking}
                aria-label="Close"
                className="grid h-10 w-10 place-items-center text-ink-soft hover:text-ink"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            {/* Where you are + what you've picked so far — always visible, no scrolling needed. */}
            <div className="flex items-center gap-2 border-b border-line px-6 py-3 text-xs text-ink-faint sm:px-8">
              <span className="font-medium text-ink">
                Step {step} of 3 — {stepTitle[step]}
              </span>
              {(studioData || dates.length > 0 || timeSummary) && (
                <span className="truncate">
                  ·{" "}
                  {[
                    studioData?.subtitle,
                    dates.length > 0 && `${dates.length} day${dates.length > 1 ? "s" : ""}`,
                    timeSummary,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-7 sm:px-8">
              {step === 1 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {studios.map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => pickStudio(s.slug)}
                      className="overflow-hidden border border-line text-left transition-colors hover:border-ink"
                    >
                      <span className="relative block aspect-[4/3] w-full bg-paper-deep">
                        <Image
                          src={s.images[0].src}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 90vw, 260px"
                          className="object-cover"
                        />
                      </span>
                      <span className="block bg-paper p-4">
                        <span
                          className="block font-serif text-lg tracking-tight"
                          style={{ wordSpacing: subtitleWordSpacing(s.slug) }}
                        >
                          {s.subtitle}
                        </span>
                        <span className="mt-1 block text-sm text-ink-soft">
                          {formatMoney(s.pricePerHour)}–{formatMoney(s.weekendPricePerHour)} / hour
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && studio && (
                <div>
                  {/* Month navigator */}
                  <div className="flex items-center justify-center gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => shiftMonth(-1)}
                      disabled={!canPrevMonth}
                      aria-label="Previous month"
                      className="grid h-8 w-8 shrink-0 place-items-center text-neutral-400 disabled:opacity-20 enabled:hover:text-neutral-700"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {canPrevMonth && (
                      <button
                        type="button"
                        onClick={() => shiftMonth(-1)}
                        className="hidden text-sm text-neutral-400 hover:text-neutral-700 sm:block"
                      >
                        {MONTHS[(monthCursor.getMonth() + 11) % 12]}
                      </button>
                    )}
                    <span className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white">
                      {MONTHS[monthCursor.getMonth()]} {monthCursor.getFullYear()}
                    </span>
                    {canNextMonth && (
                      <button
                        type="button"
                        onClick={() => shiftMonth(1)}
                        className="hidden text-sm text-neutral-400 hover:text-neutral-700 sm:block"
                      >
                        {MONTHS[(monthCursor.getMonth() + 1) % 12]}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => shiftMonth(1)}
                      disabled={!canNextMonth}
                      aria-label="Next month"
                      className="grid h-8 w-8 shrink-0 place-items-center text-neutral-400 disabled:opacity-20 enabled:hover:text-neutral-700"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  {/* Full month calendar grid — tap a day to add/remove it */}
                  <div className="mt-6 grid grid-cols-7 gap-y-1 text-center sm:gap-y-2">
                    {DOW.map((d) => (
                      <span
                        key={d}
                        className="pb-2 text-[0.65rem] font-medium uppercase tracking-wide text-neutral-400"
                      >
                        {d}
                      </span>
                    ))}
                    {Array.from({ length: monthDays[0].getDay() }).map((_, i) => (
                      <span key={`pad-${i}`} />
                    ))}
                    {monthDays.map((date) => {
                      const iso = localDateString(date);
                      const status = monthStatus[iso];
                      const full = status === "full";
                      const disabled = date < today || date > maxDate || full;
                      const selected = dates.includes(iso);
                      return (
                        <button
                          key={iso}
                          type="button"
                          disabled={disabled}
                          onClick={() => toggleDate(iso)}
                          className="flex items-center justify-center py-0.5"
                        >
                          <span
                            className={cn(
                              "grid h-10 w-10 place-items-center rounded-full text-sm font-medium transition-colors sm:h-11 sm:w-11",
                              disabled && "text-neutral-300 line-through",
                              !disabled && !selected && "text-neutral-800 hover:bg-neutral-100",
                              selected && "bg-blue-600 text-white",
                            )}
                          >
                            {date.getDate()}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* One section per selected day, each with its own hourly grid */}
                  {dates.length === 0 && (
                    <p className="mt-8 text-sm text-neutral-500">
                      Pick one day, or several — the same hour books across all of them.
                    </p>
                  )}

                  {availabilityError && <p className="mt-8 text-sm text-neutral-500">{availabilityError}</p>}

                  {!availabilityError &&
                    dates.map((d) => {
                      const dateObj = new Date(`${d}T00:00:00`);
                      const loadingDay = !statuses;
                      const dayRate = rateForDate(studio, d);
                      return (
                        <div key={d} className="mt-9">
                          <div className="flex items-baseline justify-between border-b border-neutral-200 pb-2">
                            <p className="text-sm font-medium text-neutral-800">
                              {DOW[dateObj.getDay()]}, {MONTHS[dateObj.getMonth()]} {dateObj.getDate()},{" "}
                              {dateObj.getFullYear()}
                            </p>
                            <p className="text-xs text-neutral-400">{tzLabel}</p>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                            {loadingDay
                              ? allTimes.map((t) => (
                                  <div key={t} className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
                                ))
                              : allTimes.map((t) => {
                                  const status = statuses[t] ?? "closed";
                                  const selectable = status === "available";
                                  const selected = times.includes(t);
                                  return (
                                    <button
                                      key={t}
                                      type="button"
                                      disabled={!selectable}
                                      onClick={() => pickTime(t)}
                                      className={cn(
                                        "flex flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-3 text-center transition-colors",
                                        selected && "border-blue-600 bg-blue-600 text-white",
                                        !selected && selectable && "border-neutral-200 text-neutral-900 hover:border-blue-600",
                                        !selectable && "border-neutral-100 text-neutral-300",
                                      )}
                                    >
                                      <span className="text-sm font-medium">
                                        {t} — {endTimeFor(t, 1)}
                                      </span>
                                      <span className={cn("text-xs", selected ? "text-white/80" : "text-neutral-400")}>
                                        {selectable ? `from ${formatMoney(dayRate)}` : "—"}
                                      </span>
                                    </button>
                                  );
                                })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {step === 3 && (
                <BookingForm
                  values={customer}
                  onChange={setCustomer}
                  terms={terms}
                  onTermsChange={setTerms}
                  onSubmit={submit}
                  error={submitError}
                />
              )}
            </div>

            <div className="border-t border-line bg-paper px-6 py-5 sm:px-8">
              {breakdown && breakdown.depositPercent < 100 && breakdown.dueAtStudio > 0 && (
                <p className="mb-2 text-xs text-ink-faint">
                  + {formatMoney(breakdown.dueAtStudio)} at the studio
                </p>
              )}
              {step === 3 && (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit || submitting}
                  className="flex h-14 w-full items-center justify-center bg-ink text-[0.75rem] font-medium uppercase tracking-[0.18em] text-paper transition-colors hover:bg-ink-soft disabled:opacity-40"
                >
                  {buttonLabel}
                </button>
              )}
              {step === 2 && (
                <button
                  type="button"
                  disabled={dates.length === 0 || times.length === 0}
                  onClick={() => setStep(3)}
                  className="flex h-14 w-full items-center justify-center rounded-full bg-blue-600 text-[0.75rem] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-blue-700 disabled:opacity-30"
                >
                  {dates.length === 0
                    ? "Pick a day"
                    : times.length === 0
                      ? "Pick a time"
                      : `Continue with ${timeSummary}`}
                </button>
              )}
              {(step === 1 || step === 2) && breakdown && (
                <div className="mt-3 flex items-baseline justify-between text-sm">
                  <span className="text-ink-faint">Total so far</span>
                  <span className="font-serif text-2xl tracking-tight">
                    {formatMoney(breakdown.total)}
                  </span>
                </div>
              )}
              <p className="mt-3 text-center text-xs text-ink-faint">
                Payment is safe. We never see your card.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
