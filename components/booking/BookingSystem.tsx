"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { studios, type StudioSlug } from "@/lib/studios";
import {
  calcTotal,
  endTimeFor,
  formatMoney,
  type SlotStatus,
} from "@/lib/booking";
import { BookingCalendar } from "./BookingCalendar";
import { TimeSlots } from "./TimeSlots";
import { BookingForm, type CustomerFields } from "./BookingForm";
import { STUDIO_SELECT_EVENT } from "./selectStudio";

const DURATIONS: { value: number; label: string }[] = [
  { value: 1, label: "1 hour" },
  { value: 2, label: "2 hours" },
  { value: 3, label: "3 hours" },
  { value: 4, label: "4 hours" },
  { value: 5, label: "5+ hours" },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
};

export function BookingSystem() {
  const [studio, setStudio] = useState<StudioSlug | null>(null);
  const [duration, setDuration] = useState(1);
  const [date, setDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);

  const [statuses, setStatuses] = useState<Record<string, SlotStatus> | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [customer, setCustomer] = useState<CustomerFields>({ name: "", email: "", phone: "" });
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

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
      const slug = (e as CustomEvent<StudioSlug>).detail;
      setStudio(slug);
      setStartTime(null);
    };
    window.addEventListener(STUDIO_SELECT_EVENT, onSelect);
    return () => window.removeEventListener(STUDIO_SELECT_EVENT, onSelect);
  }, []);

  // Load availability whenever studio / date / duration changes.
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
    // Data fetch keyed to studio/date/duration — the canonical useEffect use
    // case (see React docs, "You Might Not Need an Effect → Fetching data").
    // State is only set after an await, inside loadAvailability.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAvailability(studio, date, duration, ctrl.signal);
    return () => ctrl.abort();
  }, [studio, date, duration, reloadKey, loadAvailability]);

  const studioData = studios.find((s) => s.slug === studio) ?? null;
  const total = studio ? calcTotal(studio, duration) : 0;
  const canSubmit = Boolean(
    studio &&
      date &&
      startTime &&
      terms &&
      customer.name.trim().length >= 2 &&
      /.+@.+\..+/.test(customer.email) &&
      customer.phone.trim().length >= 6,
  );

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
          customer: {
            name: customer.name.trim(),
            email: customer.email.trim(),
            phone: customer.phone.trim(),
          },
          termsAccepted: true,
        }),
      });
      const data = await res.json();

      if (res.ok && data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      if (res.ok && data.confirmationUrl) {
        window.location.assign(data.confirmationUrl);
        return;
      }
      if (res.status === 409) {
        setSubmitError(data.error ?? "That time was just taken. Pick another slot.");
        setStartTime(null);
        setStatuses(null);
        setAvailabilityError(null);
        setReloadKey((k) => k + 1); // re-fetch availability
        return;
      }
      setSubmitError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [studio, date, startTime, duration, customer]);

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
          {/* selections */}
          <div className="lg:col-span-7">
            <Step n="01" title="Choose your studio">
              <div className="grid gap-3 sm:grid-cols-2">
                {studios.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => {
                      setStudio(s.slug);
                      setStartTime(null);
                      setStatuses(null);
                      setAvailabilityError(null);
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
                      {formatMoney(s.pricePerHour)} / hour
                    </span>
                  </button>
                ))}
              </div>
            </Step>

            <AnimatePresence>
              {studio && (
                <motion.div {...fadeUp} key="duration">
                  <Step n="02" title="Select duration">
                    <div className="flex flex-wrap gap-2">
                      {DURATIONS.map((d) => (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => setDuration(d.value)}
                          className={cn(
                            "h-11 border px-5 text-sm transition-colors",
                            duration === d.value ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </Step>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {studio && (
                <motion.div {...fadeUp} key="date">
                  <Step n="03" title="Select date">
                    <BookingCalendar
                      value={date}
                      onChange={(d) => {
                        setDate(d);
                        setStartTime(null);
                        setStatuses(null);
                        setAvailabilityError(null);
                      }}
                    />
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
                <motion.div {...fadeUp} key="details">
                  <Step n="05" title="Your details">
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
                  <Row label="Date" value={date ?? "—"} />
                  <Row
                    label="Time"
                    value={
                      startTime ? `${startTime} – ${endTimeFor(startTime, duration)}` : "—"
                    }
                  />
                  <Row label="Duration" value={`${duration} hour${duration > 1 ? "s" : ""}`} />
                  {studioData && (
                    <Row
                      label="Rate"
                      value={`${formatMoney(studioData.pricePerHour)} × ${duration}`}
                    />
                  )}
                </dl>
                <div className="mt-6 flex items-baseline justify-between border-t border-line pt-6">
                  <span className="eyebrow">Total</span>
                  <span className="font-serif text-3xl tracking-tight">
                    {studio ? formatMoney(total) : "—"}
                  </span>
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

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line py-10 first:border-t-0 first:pt-0">
      <div className="flex items-baseline gap-4">
        <span className="font-serif text-2xl text-ink-faint">{n}</span>
        <h3 className="font-serif text-2xl tracking-tight">{title}</h3>
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
