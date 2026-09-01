-- STUDIO 98 — initial schema
-- Run in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists "pgcrypto";
create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- studios
-- ---------------------------------------------------------------------------
create table if not exists public.studios (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  description   text,
  price_per_hour numeric(10,2) not null check (price_per_hour >= 0),
  capacity      text,
  location      text,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- studio_images
-- ---------------------------------------------------------------------------
create table if not exists public.studio_images (
  id         uuid primary key default gen_random_uuid(),
  studio_id  uuid not null references public.studios(id) on delete cascade,
  image_url  text not null,
  sort_order int not null default 0
);
create index if not exists studio_images_studio_idx on public.studio_images(studio_id, sort_order);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
do $$ begin
  create type payment_status as enum ('pending','paid','failed','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('hold','confirmed','cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.bookings (
  id               uuid primary key default gen_random_uuid(),
  studio_id        uuid not null references public.studios(id) on delete restrict,
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text not null,
  date             date not null,
  start_time       time not null,
  end_time         time not null,
  duration         int  not null check (duration > 0),
  total_price      numeric(10,2) not null check (total_price >= 0),
  currency         text not null default 'EUR',
  payment_status   payment_status not null default 'pending',
  booking_status   booking_status not null default 'hold',
  payment_provider text,
  payment_reference text,
  created_at       timestamptz not null default now(),

  constraint bookings_time_order check (end_time > start_time),

  -- Generated range used by the overlap guard below.
  slot_range tsrange generated always as
    (tsrange((date + start_time)::timestamp, (date + end_time)::timestamp)) stored
);

create index if not exists bookings_lookup_idx
  on public.bookings (studio_id, date, booking_status);

-- Hard guarantee against double / overlapping bookings for the same studio.
-- Only 'hold' and 'confirmed' rows participate; cancelled slots free up.
alter table public.bookings drop constraint if exists bookings_no_overlap;
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    studio_id with =,
    slot_range with &&
  )
  where (booking_status in ('hold','confirmed'));

-- ---------------------------------------------------------------------------
-- blackouts — admin can block whole days or time ranges
-- ---------------------------------------------------------------------------
create table if not exists public.blackouts (
  id         uuid primary key default gen_random_uuid(),
  studio_id  uuid references public.studios(id) on delete cascade, -- null = all studios
  date       date not null,
  start_time time,   -- null = whole day
  end_time   time,
  reason     text,
  created_at timestamptz not null default now(),
  constraint blackouts_time_order check (end_time is null or start_time is null or end_time > start_time)
);
create index if not exists blackouts_lookup_idx on public.blackouts(date, studio_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
--   * public/anon: may READ active studios + images only.
--   * bookings/blackouts: NO anon access — all writes go through the API
--     using the service-role key (server-side only).
-- ---------------------------------------------------------------------------
alter table public.studios       enable row level security;
alter table public.studio_images enable row level security;
alter table public.bookings      enable row level security;
alter table public.blackouts     enable row level security;

drop policy if exists "studios public read" on public.studios;
create policy "studios public read" on public.studios
  for select using (active = true);

drop policy if exists "studio_images public read" on public.studio_images;
create policy "studio_images public read" on public.studio_images
  for select using (
    exists (select 1 from public.studios s where s.id = studio_id and s.active)
  );

-- (service_role bypasses RLS, so no policies are needed for the API.)
