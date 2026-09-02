-- Seed data. The UUIDs MUST match lib/studios.ts so the marketing site and the
-- database agree on which studio is which.

insert into public.studios
  (id, name, slug, description, price_per_hour, weekend_price_per_hour,
   min_hours, weekend_min_hours, capacity, location, active)
values
  ('00000000-0000-0000-0000-000000000001', 'STUDIO 01', 'studio-01',
   'The Light Space — a bright, high-ceiling room with large north-facing windows.',
   25.00, 30.00, 1, 2, 'Up to 00 people (placeholder)', 'City centre (placeholder)', true),
  ('00000000-0000-0000-0000-000000000002', 'STUDIO 02', 'studio-02',
   'The Dark Space — a blacked-out room with full lighting control.',
   30.00, 35.00, 2, 3, 'Up to 00 people (placeholder)', 'City centre (placeholder)', true)
on conflict (id) do update
  set name = excluded.name,
      slug = excluded.slug,
      description = excluded.description,
      price_per_hour = excluded.price_per_hour,
      weekend_price_per_hour = excluded.weekend_price_per_hour,
      min_hours = excluded.min_hours,
      weekend_min_hours = excluded.weekend_min_hours;

insert into public.studio_images (studio_id, image_url, sort_order)
values
  ('00000000-0000-0000-0000-000000000001', '/images/studio-01/01.jpg', 0),
  ('00000000-0000-0000-0000-000000000001', '/images/studio-01/02.jpg', 1),
  ('00000000-0000-0000-0000-000000000001', '/images/studio-01/05.jpg', 2),
  ('00000000-0000-0000-0000-000000000002', '/images/studio-02/01.jpg', 0),
  ('00000000-0000-0000-0000-000000000002', '/images/studio-02/02.jpg', 1),
  ('00000000-0000-0000-0000-000000000002', '/images/studio-02/05.jpg', 2)
on conflict do nothing;
