"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { studios, type StudioSlug } from "@/lib/studios";
import {
  durationOptions,
  endTimeFor,
  formatMoney,
  isWeekendDate,
  minHoursForDate,
  priceBreakdown,
  type SlotStatus,
} from "@/lib/booking";
import { BookingCalendar } from "./BookingCalendar";
import { TimeSlots } from "./TimeSlots";
import { AddOns } from "./AddOns";
import { BookingForm, type CustomerFields } from "./BookingForm";
import { STUDIO_SELECT_EVENT } from "./selectStudio";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
};

export function BookingSystem() {
  const [studio, setStudio] = useState<StudioSlug | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [duration, setDuration] = useState(1);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [addOns, setAddOns] = useState<string[]>([]);

  const [statuses, setStatuses] = useState<Record<string, SlotStatus> | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [customer, setCustomer] = useState<CustomerFields>({ name: "", email: "", phone: "" });
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const minHours = useMemo(
    () => (studio && date ? minHoursForDate(studio, date) : 1),
    [studio, date],
  );
  const weekend = date ? isWeekendDate(date) : false;

  const resetTime = () => {
    setStartTime(null);
    setStatuses(null);
    setAvailabilityError(null);
  };

  const pickDate = (d: string) => {
    setDate(d);
    resetTime();
    const min = minHoursForDate(studio ?? "studio-01", d);
    setDuration((cur) => (cur < min ? min : cur));
  };

  // Subscribe to "Book Studio XX" buttons (external event + sessionStorage).
  useEffect(() => {
    const applyStored = () => {
      try {
        const stored = sessionStorage.getItem("studio98:studio");
        if (stored === "studio-01" || stored === "studio-02") {
          setStudio(stored);
          sessionStorage.removeItem("studio98:studio");
        }
      } catch {
        /* ignore */
      }
    };
    applyStored();

    const onSelect = (e: Event) => {
      setStudio((e as CustomEvent<StudioSlug>).detail);
      resetTime();
    };
    window.addEventListener(STUDIO_SELECT_EVENT, onSelect);
    return () => window.removeEventListener(STUDIO_SELECT_EVENT, onSelect);
  }, []);

  const loadAvailability = useCallback(
    async (slug: StudioSlug, day: string, hours: number, signal: AbortSignal) => {
      try {
        const params = new URLSearchParams({ studio: slug, date: day, duration: String(hours) });
        const res = await fetch(`/api/availability?${params}`, { signal });
        if (!res.ok) throw new Error("bad status");
        const data: { slots: Record<string, SlotStatus> } = await res.json();
        setStatuses(data.slots);
        setStartTime((cur) => (cur && data.slots[cur] === "available" ? cur : null));
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setAvailabilityError("Could not load availability. Please try again.");
        setStatuses(null);
      }
    },
    [],
  );

  useEffect(() => {
    if (!studio || !date) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    // Data fetch keyed to studio/date/duration — the canonical useEffect use case.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAvailability(studio, date, duration, ctrl.signal);
    return () => ctrl.abort();
  }, [studio, date, duration, reloadKey, loadAvailability]);

  const studioData = studios.find((s) => s.slug === studio) ?? null;

  const breakdown = useMemo(
    () =>
      studio && date
        ? priceBreakdown({ slug: studio, date, durationHours: duration, addOnIds: addOns })
        : null,
    [studio, date, duration, addOns],
  );

  const canSubmit = Boolean(
    studio &&
      date &&
      startTime &&
      duration >= minHours &&
      terms &&
      customer.name.trim().length >= 2 &&
      /.+@.+\..+/.test(customer.email) &&
      customer.phone.trim().length >= 6,
  );

  const toggleAddOn = (id: string) =>
    setAddOns((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const submit = useCallback(async () => {
    if (!studio || !date || !startTime) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studio,
          date,
          startTime,
          durationHours: duration,
          addOnIds: addOns,
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
        setSubmitError(data.error ?? "That time was just taken. Pick another slot.");
        resetTime();
        setReloadKey((k) => k + 1);
        return;
      }
      setSubmitError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [studio, date, startTime, duration, addOns, customer]);

  return (
    <section id="booking" className="scroll-mt-20 border-t border-line bg-paper-dim py-24 sm:py-32 lg:py-40">
      <Container>
        <Reveal>
          <p className="eyebrow">Booking</p>
          <h2 className="headline mt-6 max-w-[16ch] text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.75rem]">
            Reserve your hours.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Step n="01" title="Choose your studio">
              <div className="grid gap-3 sm:grid-cols-2">
                {studios.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => {
                      setStudio(s.slug);
                      resetTime();
                    }}
                    className={cn(
                      "border p-5 text-left transition-colors",
                      studio === s.slug ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                    )}
                  >
                    <span className="block text-[0.7rem] font-medium uppercase tracking-[0.18em] opacity-70">
                      {s.name}
                    </span>
                    <span className="mt-2 block font-serif text-xl tracking-tight">{s.subtitle}</span>
                    <span className="mt-3 block text-sm opacity-80">
                      {formatMoney(s.pricePerHour)}–{formatMoney(s.weekendPricePerHour)} / hour
                    </span>
                  </button>
                ))}
              </div>
            </Step>

            <AnimatePresence>
              {studio && (
                <motion.div {...fadeUp} key="date">
                  <Step n="02" title="Select date">
                    <BookingCalendar value={date} onChange={pickDate} />
                  </Step>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {studio && date && (
                <motion.div {...fadeUp} key="duration">
                  <Step n="03" title="Select duration">
                    <div className="flex flex-wrap gap-2">
                      {durationOptions.map((h) => {
                        const disabled = h < minHours;
                        return (
                          <button
                            key={h}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              setDuration(h);
                              resetTime();
                            }}
                            className={cn(
                              "h-11 border px-5 text-sm transition-colors",
                              duration === h && !disabled
                                ? "border-ink bg-ink text-paper"
                                : "border-line hover:enabled:border-ink",
                              disabled && "text-ink-faint line-through",
                            )}
                          >
                            {h} {h === 1 ? "hour" : "hours"}
                          </button>
                        );
                      })}
                    </div>
                    {weekend && (
                      <p className="mt-3 text-sm text-ink-soft">
                        Weekend rate · minimum {minHours} hours.
                      </p>
                    )}
                  </Step>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {studio && date && (
                <motion.div {...fadeUp} key="time">
                  <Step n="04" title="Select start time">
                    {availabilityError ? (
                      <p className="text-sm text-ink-soft">{availabilityError}</p>
                    ) : (
                      <TimeSlots
                        statuses={statuses}
                        value={startTime}
                        onChange={setStartTime}
                        loading={!statuses}
                      />
                    )}
                  </Step>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {studio && date && startTime && (
                <motion.div {...fadeUp} key="extras">
                  <Step n="05" title="Add extras" optional>
                    <AddOns selected={addOns} onToggle={toggleAddOn} />
                  </Step>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {studio && date && startTime && (
                <motion.div {...fadeUp} key="details">
                  <Step n="06" title="Your details">
                    <BookingForm
                      values={customer}
                      onChange={setCustomer}
                      terms={terms}
                      onTermsChange={setTerms}
                      onSubmit={submit}
                      submitting={submitting}
                      error={submitError}
                      disabled={!canSubmit}
                    />
                  </Step>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* summary */}
          <div className="lg:col-span-4 lg:col-start-9">
            <div className="lg:sticky lg:top-28">
              <div className="border border-line bg-paper p-6 sm:p-8">
                <p className="eyebrow">Summary</p>
                <dl className="mt-6 space-y-4 text-sm">
                  <Row label="Studio" value={studioData ? `${studioData.name} — ${studioData.subtitle}` : "—"} />
                  <Row label="Date" value={date ? `${date}${weekend ? " · weekend" : ""}` : "—"} />
                  <Row
                    label="Time"
                    value={startTime ? `${startTime} – ${endTimeFor(startTime, duration)}` : "—"}
                  />
                  <Row label="Duration" value={`${duration} hour${duration > 1 ? "s" : ""}`} />
                </dl>

                {breakdown && (
                  <dl className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
                    <Row label={breakdown.studioLine.label} value={formatMoney(breakdown.studioLine.amount)} />
                    {breakdown.addOnLines.map((l) => (
                      <Row key={l.label} label={l.label} value={`+ ${formatMoney(l.amount)}`} />
                    ))}
                  </dl>
                )}

                <div className="mt-6 border-t border-line pt-6">
                  {breakdown && breakdown.depositPercent < 100 ? (
                    <>
                      <div className="flex items-baseline justify-between">
                        <span className="eyebrow">Pay now ({breakdown.depositPercent}%)</span>
                        <span className="font-serif text-3xl tracking-tight">
                          {formatMoney(breakdown.dueNow)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline justify-between text-sm text-ink-soft">
                        <span>At the studio</span>
                        <span>{formatMoney(breakdown.dueAtStudio)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-baseline justify-between">
                      <span className="eyebrow">Total</span>
                      <span className="font-serif text-3xl tracking-tight">
                        {breakdown ? formatMoney(breakdown.subtotal) : "—"}
                      </span>
                    </div>
                  )}
                </div>

                <p className="mt-4 text-xs leading-relaxed text-ink-faint">
                  Secure checkout. Card details never touch this site.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Step({
  n,
  title,
  optional,
  children,
}: {
  n: string;
  title: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line py-10 first:border-t-0 first:pt-0">
      <div className="flex items-baseline gap-4">
        <span className="font-serif text-2xl text-ink-faint">{n}</span>
        <h3 className="font-serif text-2xl tracking-tight">{title}</h3>
        {optional && (
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-faint">
            Optional
          </span>
        )}
      </div>
      <div className="mt-6 pl-0 sm:pl-10">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
