import { z } from "zod";
import { studioSlugs, studioAddOns } from "@/lib/studios";
import { site } from "@/lib/site";

const addOnIds = studioAddOns.map((a) => a.id);

const slugEnum = z.enum(studioSlugs as [string, ...string[]]);
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Dată invalidă");
const timeStr = z.string().regex(/^\d{2}:\d{2}$/, "Oră invalidă");

export const availabilityQuerySchema = z.object({
  studio: slugEnum,
  date: dateStr,
});

export const monthAvailabilityQuerySchema = z.object({
  studio: slugEnum,
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export const createBookingSchema = z.object({
  studio: slugEnum,
  // One or more dates — same studio, same start time, booked together.
  dates: z.array(dateStr).min(1).max(14),
  startTime: timeStr,
  durationHours: z
    .number()
    .int()
    .refine((n) => (site.booking.durations as readonly number[]).includes(n), {
      message: "Durată nesuportată",
    }),
  addOnIds: z
    .array(z.enum(addOnIds as [string, ...string[]]))
    .max(20)
    .optional()
    .default([]),
  customer: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(180),
    phone: z.string().min(6).max(40),
  }),
  termsAccepted: z.literal(true, {
    message: "Trebuie să accepți regulile rezervării.",
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
