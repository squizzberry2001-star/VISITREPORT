-- Bestie Visit Supabase schema
-- Jalankan di Supabase Dashboard > SQL Editor.
-- Mode ini dibuat untuk static web/PWA dengan publishable/anon key.
-- Untuk produksi yang lebih aman, ganti policy permissive ini dengan Supabase Auth atau Edge Function admin.

create table if not exists public.app_settings (
  config_key text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.monitor_visits (
  visit_key text primary key,
  bestie_name text,
  store_name text,
  store_code text,
  visit_date text,
  total_visits integer default 1,
  last_visit_at text,
  updated_at text,
  session_id text,
  event_type text,
  page_url text,
  user_agent text
);

create table if not exists public.manual_store_requests (
  request_id text primary key,
  status text not null default 'pending',
  created_at bigint,
  updated_at bigint,
  bestie_name text,
  store_name text,
  store_code text,
  address text,
  note text,
  session_id text,
  page_url text,
  user_agent text
);

alter table public.app_settings enable row level security;
alter table public.monitor_visits enable row level security;
alter table public.manual_store_requests enable row level security;

grant select, insert, update, delete on public.app_settings to anon;
grant select, insert, update, delete on public.monitor_visits to anon;
grant select, insert, update, delete on public.manual_store_requests to anon;

drop policy if exists "Bestie app settings public read" on public.app_settings;
drop policy if exists "Bestie app settings public write" on public.app_settings;
drop policy if exists "Bestie app settings public update" on public.app_settings;
drop policy if exists "Bestie monitor public read" on public.monitor_visits;
drop policy if exists "Bestie monitor public write" on public.monitor_visits;
drop policy if exists "Bestie monitor public update" on public.monitor_visits;
drop policy if exists "Bestie manual requests public read" on public.manual_store_requests;
drop policy if exists "Bestie manual requests public write" on public.manual_store_requests;
drop policy if exists "Bestie manual requests public update" on public.manual_store_requests;

create policy "Bestie app settings public read"
  on public.app_settings for select to anon
  using (true);

create policy "Bestie app settings public write"
  on public.app_settings for insert to anon
  with check (config_key in ('welcome_animation', 'home_update_notice'));

create policy "Bestie app settings public update"
  on public.app_settings for update to anon
  using (config_key in ('welcome_animation', 'home_update_notice'))
  with check (config_key in ('welcome_animation', 'home_update_notice'));

create policy "Bestie monitor public read"
  on public.monitor_visits for select to anon
  using (true);

create policy "Bestie monitor public write"
  on public.monitor_visits for insert to anon
  with check (true);

create policy "Bestie monitor public update"
  on public.monitor_visits for update to anon
  using (true)
  with check (true);

create policy "Bestie manual requests public read"
  on public.manual_store_requests for select to anon
  using (true);

create policy "Bestie manual requests public write"
  on public.manual_store_requests for insert to anon
  with check (true);

create policy "Bestie manual requests public update"
  on public.manual_store_requests for update to anon
  using (true)
  with check (true);

insert into public.app_settings (config_key, payload, updated_by)
values
  ('welcome_animation', '{"title":"Hallo! Bestie","subtitle":"Sudahkah kalian bahagia hari ini?, Semangat ya kerjanya","durationSeconds":5}', 'setup'),
  ('home_update_notice', '{"enabled":true,"title":"Info Update Website","messages":["Konten informasi update dapat diatur dari panel rahasia.","Gunakan area ini untuk mengumumkan perubahan fitur, maintenance, atau instruksi terbaru."],"intervalSeconds":4}', 'setup')
on conflict (config_key) do nothing;
