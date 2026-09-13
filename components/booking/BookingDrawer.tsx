"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";
import { studios, type StudioSlug } from "@/lib/studios";
import {
  formatMoney,
  multiDatePriceBreakdown,
  rateForDate,
  type SlotStatus,
} from "@/lib/booking";
import { BookingCalendar } from "./BookingCalendar";
import { TimeSlots } from "./TimeSlots";
import { BookingForm, type CustomerFields } from "./BookingForm";
import { useBookingDrawer } from "./BookingDrawerContext";

const ease = [0.22, 1, 0.36, 1] as const;
const emptyCustomer: CustomerFields = { name: "", email: "", phone: "" };

type Step = 1 | 2 | 3 | 4;

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
  const [startTime, setStartTime] = useState<string | null>(null);

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
    setStartTime(null);
    setStatuses(null);
    setAvailabilityError(null);
    setCustomer(emptyCustomer);
    setTerms(false);
    setSubmitError(null);
  }, [isOpen, initialStudio]);

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

  const loadAvailability = useCallback(
    async (slug: StudioSlug, days: string[], signal: AbortSignal) => {
      try {
        const maps = await Promise.all(
          days.map(async (day) => {
            const params = new URLSearchParams({ studio: slug, date: day, duration: "1" });
            const res = await fetch(`/api/availability?${params}`, { signal });
            if (!res.ok) throw new Error("bad status");
            const data: { slots: Record<string, SlotStatus> } = await res.json();
            return data.slots;
          }),
        );
        setStatuses(intersectStatuses(maps));
        setStartTime((cur) => (cur && maps.every((m) => m[cur] === "available") ? cur : null));
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
    () => (studio && dates.length > 0 ? multiDatePriceBreakdown({ slug: studio, dates }) : null),
    [studio, dates],
  );
  const pricePerHour = studio && dates[0] ? rateForDate(studio, dates[0]) : 0;

  const canSubmit = Boolean(
    studio &&
      dates.length > 0 &&
      startTime &&
      terms &&
      customer.name.trim().length >= 2 &&
      /.+@.+\..+/.test(customer.email) &&
      customer.phone.trim().length >= 6,
  );

  const pickStudio = (slug: StudioSlug) => {
    setStudio(slug);
    setDates([]);
    setStartTime(null);
    setStatuses(null);
    setStep(2);
  };

  const toggleDate = (d: string) => {
    setDates((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort()));
    setStartTime(null);
  };

  const pickTime = (t: string) => {
    setStartTime(t);
    setStep(4);
  };

  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  const submit = useCallback(async () => {
    if (!studio || dates.length === 0 || !startTime || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studio,
          dates,
          startTime,
          durationHours: 1,
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
        setStartTime(null);
        setStatuses(null);
        setStep(3);
        setReloadKey((k) => k + 1);
        return;
      }
      setSubmitError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setSubmitError("No connection. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [studio, dates, startTime, customer, canSubmit]);

  const buttonLabel = (() => {
    if (submitting) return "Booking…";
    if (!breakdown) return "Book a studio";
    if (breakdown.depositPercent < 100) return `Pay ${formatMoney(breakdown.dueNow)} now`;
    return `Pay ${formatMoney(breakdown.total)} & book`;
  })();

  const stepTitle: Record<Step, string> = {
    1: "Choose a studio",
    2: "Pick your days",
    3: "Pick a time",
    4: "Your details",
  };

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
            className="fixed inset-0 z-[90] flex w-full flex-col bg-paper sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[85vw] sm:max-w-[560px] lg:w-[55vw] lg:max-w-[760px]"
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
                Step {step} of 4 — {stepTitle[step]}
              </span>
              {(studioData || dates.length > 0 || startTime) && (
                <span className="truncate">
                  · {[studioData?.subtitle, dates.length > 0 && `${dates.length} day${dates.length > 1 ? "s" : ""}`, startTime]
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
                        <span className="block font-serif text-lg tracking-tight">{s.subtitle}</span>
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
                  <p className="mb-5 text-sm text-ink-soft">
                    Pick one day, or several — tap a day to add or remove it.
                  </p>
                  <BookingCalendar studio={studio} values={dates} onToggle={toggleDate} />

                  {dates.length > 0 && (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {dates.map((d) => (
                        <li key={d}>
                          <button
                            type="button"
                            onClick={() => toggleDate(d)}
                            className="flex items-center gap-2 border border-ink/25 px-3 py-1.5 text-sm hover:border-ink"
                          >
                            {d}
                            <X size={13} strokeWidth={2} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {step === 3 && studio && dates.length > 0 && (
                <div>
                  <p className="mb-5 text-sm text-ink-soft">
                    {dates.length > 1
                      ? "Same time on every day you picked."
                      : "One hour, starting at the time you choose."}
                  </p>
                  {availabilityError ? (
                    <p className="text-sm text-ink-soft">{availabilityError}</p>
                  ) : (
                    <TimeSlots
                      statuses={statuses}
                      value={startTime}
                      onChange={pickTime}
                      loading={!statuses}
                      price={pricePerHour}
                    />
                  )}
                </div>
              )}

              {step === 4 && (
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
              {step === 4 && (
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
                  disabled={dates.length === 0}
                  onClick={() => setStep(3)}
                  className="flex h-14 w-full items-center justify-center bg-ink text-[0.75rem] font-medium uppercase tracking-[0.18em] text-paper transition-colors hover:bg-ink-soft disabled:opacity-30"
                >
                  {dates.length === 0
                    ? "Pick at least one day"
                    : `Continue with ${dates.length} day${dates.length > 1 ? "s" : ""}`}
                </button>
              )}
              {(step === 1 || step === 3) && breakdown && (
                <div className="flex items-baseline justify-between text-sm">
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
