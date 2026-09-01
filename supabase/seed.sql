-- Seed data. The UUIDs MUST match lib/studios.ts so the marketing site and the
-- database agree on which studio is which.

insert into public.studios (id, name, slug, description, price_per_hour, capacity, location, active)
values
  ('00000000-0000-0000-0000-000000000001', 'STUDIO 01', 'studio-01',
   'The Light Space — a bright, high-ceiling room with large north-facing windows.',
   25.00, 'Up to 00 people (placeholder)', 'City centre (placeholder)', true),
  ('00000000-0000-0000-0000-000000000002', 'STUDIO 02', 'studio-02',
   'The Dark Space — a blacked-out room with full lighting control.',
   30.00, 'Up to 00 people (placeholder)', 'City centre (placeholder)', true)
on conflict (id) do update
  set name = excluded.name,
      slug = excluded.slug,
      description = excluded.description,
      price_per_hour = excluded.price_per_hour;

insert into public.studio_images (studio_id, image_url, sort_order)
values
  ('00000000-0000-0000-0000-000000000001', '/images/studio-01/01.svg', 0),
  ('00000000-0000-0000-0000-000000000001', '/images/studio-01/02.svg', 1),
  ('00000000-0000-0000-0000-000000000001', '/images/studio-01/03.svg', 2),
  ('00000000-0000-0000-0000-000000000001', '/images/studio-01/04.svg', 3),
  ('00000000-0000-0000-0000-000000000001', '/images/studio-01/05.svg', 4),
  ('00000000-0000-0000-0000-000000000002', '/images/studio-02/01.svg', 0),
  ('00000000-0000-0000-0000-000000000002', '/images/studio-02/02.svg', 1),
  ('00000000-0000-0000-0000-000000000002', '/images/studio-02/03.svg', 2),
  ('00000000-0000-0000-0000-000000000002', '/images/studio-02/04.svg', 3),
  ('00000000-0000-0000-0000-000000000002', '/images/studio-02/05.svg', 4)
on conflict do nothing;
