-- STUDIO 98 — payments ledger
-- Run in the Supabase SQL editor (after 0001_init.sql). Safe to run twice.
--
-- One row per amount actually received (MIA transfer or paid at the studio),
-- with when it arrived. Client/booking details are copied in, so the history
-- survives even if the booking itself is deleted from /admin.

create table if not exists public.payments (
  id             uuid primary key default gen_random_uuid(),
  booking_id     uuid references public.bookings(id) on delete set null,
  amount         numeric(10,2) not null check (amount > 0),
  method         text not null check (method in ('mia','studio')),
  paid_at        timestamptz not null default now(),
  customer_name  text not null,
  customer_email text,
  customer_phone text,
  studio_name    text,
  booking_date   date,
  booking_start  time,
  note           text,
  created_at     timestamptz not null default now()
);

create index if not exists payments_paid_at_idx on public.payments (paid_at desc);
create index if not exists payments_booking_idx on public.payments (booking_id);

-- Server-only, like bookings: no anon access (service_role bypasses RLS).
alter table public.payments enable row level security;

-- Backfill: MIA amounts confirmed before this table existed. The exact moment
-- wasn't stored, so the booking's creation time stands in for it.
insert into public.payments
  (booking_id, amount, method, paid_at, customer_name, customer_email, customer_phone,
   studio_name, booking_date, booking_start, note)
select b.id, b.deposit_paid, 'mia', b.created_at, b.customer_name, b.customer_email,
       b.customer_phone, s.name, b.date, b.start_time, 'Importat — data plății aproximativă'
from public.bookings b
left join public.studios s on s.id = b.studio_id
where b.deposit_paid > 0
  and not exists (select 1 from public.payments p where p.booking_id = b.id);
