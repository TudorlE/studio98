"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { studios, type StudioSlug } from "@/lib/studios";
import {
  durationOptions,
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
import { useBookingDrawer } from "./BookingDrawerContext";

const ease = [0.22, 1, 0.36, 1] as const;

const emptyCustomer: CustomerFields = { name: "", email: "", phone: "" };

export function BookingDrawer() {
  const { isOpen, initialStudio, closeBooking } = useBookingDrawer();

  const [studio, setStudio] = useState<StudioSlug | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [duration, setDuration] = useState(1);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [addOns, setAddOns] = useState<string[]>([]);

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
    setDate(null);
    setDuration(1);
    setStartTime(null);
    setAddOns([]);
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

  const pickStudio = (slug: StudioSlug) => {
    setStudio(slug);
    resetTime();
  };

  const pickDate = (d: string) => {
    setDate(d);
    resetTime();
    const min = minHoursForDate(studio ?? "studio-01", d);
    setDuration((cur) => (cur < min ? min : cur));
  };

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
        setAvailabilityError("Couldn't load times. Please try again.");
        setStatuses(null);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isOpen || !studio || !date) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keyed data fetch, state set after await
    void loadAvailability(studio, date, duration, ctrl.signal);
    return () => ctrl.abort();
  }, [isOpen, studio, date, duration, reloadKey, loadAvailability]);

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
    if (!studio || !date || !startTime || !canSubmit) return;
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
        setSubmitError(data.error ?? "That time was just taken. Pick another one.");
        resetTime();
        setReloadKey((k) => k + 1);
        return;
      }
      setSubmitError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setSubmitError("No connection. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [studio, date, startTime, duration, addOns, customer, canSubmit]);

  const buttonLabel = (() => {
    if (submitting) return "Booking…";
    if (!breakdown) return "Book a studio";
    if (breakdown.depositPercent < 100) return `Pay ${formatMoney(breakdown.dueNow)} now`;
    return `Pay ${formatMoney(breakdown.subtotal)} & book`;
  })();

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
              <p className="font-serif text-xl tracking-tight">Book a studio</p>
              <button
                onClick={closeBooking}
                aria-label="Close"
                className="grid h-10 w-10 place-items-center text-ink-soft hover:text-ink"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-7 sm:px-8">
              <DrawerStep n={1} title="Choose a studio">
                <div className="grid gap-3 sm:grid-cols-2">
                  {studios.map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => pickStudio(s.slug)}
                      className={cn(
                        "overflow-hidden border text-left transition-colors",
                        studio === s.slug ? "border-ink" : "border-line hover:border-ink",
                      )}
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
                      <span
                        className={cn(
                          "block p-4",
                          studio === s.slug ? "bg-ink text-paper" : "bg-paper",
                        )}
                      >
                        <span className="block font-serif text-lg tracking-tight">{s.subtitle}</span>
                        <span className="mt-1 block text-sm opacity-70">
                          {formatMoney(s.pricePerHour)}–{formatMoney(s.weekendPricePerHour)} / hour
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </DrawerStep>

              {studio && (
                <DrawerStep n={2} title="Pick a day">
                  <BookingCalendar value={date} onChange={pickDate} />
                </DrawerStep>
              )}

              {studio && date && (
                <DrawerStep n={3} title="How long?">
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
                            "h-11 border px-4 text-sm transition-colors",
                            duration === h && !disabled
                              ? "border-ink bg-ink text-paper"
                              : "border-line hover:enabled:border-ink",
                            disabled && "text-ink-faint line-through",
                          )}
                        >
                          {h}h
                        </button>
                      );
                    })}
                  </div>
                  {weekend && (
                    <p className="mt-3 text-sm text-ink-soft">
                      Weekends need at least {minHours} hour{minHours > 1 ? "s" : ""}.
                    </p>
                  )}
                </DrawerStep>
              )}

              {studio && date && (
                <DrawerStep n={4} title="Pick a time">
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
                </DrawerStep>
              )}

              {studio && date && startTime && (
                <DrawerStep n={5} title="Anything extra?" optional>
                  <AddOns selected={addOns} onToggle={toggleAddOn} />
                </DrawerStep>
              )}

              {studio && date && startTime && (
                <DrawerStep n={6} title="Your details">
                  <BookingForm
                    values={customer}
                    onChange={setCustomer}
                    terms={terms}
                    onTermsChange={setTerms}
                    onSubmit={submit}
                    error={submitError}
                  />
                </DrawerStep>
              )}
            </div>

            <div className="border-t border-line bg-paper px-6 py-5 sm:px-8">
              {breakdown && (
                <div className="mb-3 flex items-center justify-between text-xs text-ink-faint">
                  <span className="truncate">
                    {studioData?.subtitle} · {date}
                    {startTime ? ` · ${startTime}` : ""}
                  </span>
                  <span>{duration}h</span>
                </div>
              )}
              {breakdown && breakdown.depositPercent < 100 && breakdown.dueAtStudio > 0 && (
                <p className="mb-2 text-xs text-ink-faint">
                  + {formatMoney(breakdown.dueAtStudio)} at the studio
                </p>
              )}
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit || submitting}
                className="flex h-14 w-full items-center justify-center bg-ink text-[0.75rem] font-medium uppercase tracking-[0.18em] text-paper transition-colors hover:bg-ink-soft disabled:opacity-40"
              >
                {buttonLabel}
              </button>
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

function DrawerStep({
  n,
  title,
  optional,
  children,
}: {
  n: number;
  title: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-lg text-ink-faint">{n}.</span>
        <h3 className="font-serif text-lg tracking-tight">{title}</h3>
        {optional && (
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
            optional
          </span>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
