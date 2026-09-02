/**
 * Hand-written subset of the Supabase schema.
 * Regenerate with `supabase gen types typescript` once the project exists.
 */

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type BookingStatus = "hold" | "confirmed" | "cancelled";

export interface StudioRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_per_hour: number;
  capacity: string | null;
  location: string | null;
  active: boolean;
  created_at: string;
}

export interface StudioImageRow {
  id: string;
  studio_id: string;
  image_url: string;
  sort_order: number;
}

export interface BookingAddOn {
  id: string;
  name: string;
  amount: number;
}

export interface BookingRow {
  id: string;
  studio_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  date: string; // date
  start_time: string; // time
  end_time: string; // time
  duration: number; // hours
  hourly_rate: number;
  total_price: number;
  deposit_paid: number;
  add_ons: BookingAddOn[];
  currency: string;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  payment_provider: string | null;
  payment_reference: string | null;
  created_at: string;
}

export interface BlackoutRow {
  id: string;
  studio_id: string | null; // null = applies to all studios
  date: string;
  start_time: string | null; // null = whole day
  end_time: string | null;
  reason: string | null;
}

export interface Database {
  public: {
    Tables: {
      studios: { Row: StudioRow; Insert: Partial<StudioRow>; Update: Partial<StudioRow> };
      studio_images: {
        Row: StudioImageRow;
        Insert: Partial<StudioImageRow>;
        Update: Partial<StudioImageRow>;
      };
      bookings: { Row: BookingRow; Insert: Partial<BookingRow>; Update: Partial<BookingRow> };
      blackouts: { Row: BlackoutRow; Insert: Partial<BlackoutRow>; Update: Partial<BlackoutRow> };
    };
  };
}
