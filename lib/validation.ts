import { z } from "zod";
import { studioSlugs, studioAddOns } from "@/lib/studios";
import { site } from "@/lib/site";

const addOnIds = studioAddOns.map((a) => a.id);

const slugEnum = z.enum(studioSlugs as [string, ...string[]]);
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");
const timeStr = z.string().regex(/^\d{2}:\d{2}$/, "Invalid time");

export const availabilityQuerySchema = z.object({
  studio: slugEnum,
  date: dateStr,
});

export const createBookingSchema = z.object({
  studio: slugEnum,
  date: dateStr,
  startTime: timeStr,
  durationHours: z
    .number()
    .int()
    .refine((n) => (site.booking.durations as readonly number[]).includes(n), {
      message: "Unsupported duration",
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
    message: "You must accept the booking terms.",
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
