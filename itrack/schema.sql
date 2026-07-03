-- iTrack schema
-- Paste this whole file into the Supabase SQL editor (Project → SQL Editor → New query) and run it.
-- Safe to re-run: it drops and recreates iTrack's own objects only.

-- 1. Enums -------------------------------------------------------------

do $$ begin
  create type job_type as enum (
    'on_campus', 'internship', 'full_time', 'part_time', 'contract', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum (
    'saved', 'applied', 'followed_up', 'oa_assessment', 'interviewing',
    'offer', 'rejected', 'withdrawn', 'ghosted'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type outreach_status as enum (
    'not_contacted', 'reached_out', 'responded', 'meeting_scheduled', 'no_response'
  );
exception when duplicate_object then null; end $$;

-- 2. Tables --------------------------------------------------------------

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  company text not null,
  role_title text not null,
  job_type job_type not null default 'full_time',
  status application_status not null default 'saved',
  date_applied date,
  next_action_date date,
  next_action_note text,
  job_link text,
  source text,
  location text,
  salary_range text,
  job_description text,
  resume_version text,
  notes text,
  custom_fields jsonb not null default '{}'::jsonb
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  name text,
  title text,
  email text,
  phone text,
  linkedin_url text,
  outreach_status outreach_status not null default 'not_contacted',
  last_contacted date,
  notes text
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  event_type text not null,
  description text not null
);

create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists applications_status_idx on public.applications(status);
create index if not exists applications_next_action_date_idx on public.applications(next_action_date);
create index if not exists contacts_application_id_idx on public.contacts(application_id);
create index if not exists activity_log_application_id_idx on public.activity_log(application_id);

-- 3. updated_at trigger ----------------------------------------------------

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- 4. Row Level Security ----------------------------------------------------

alter table public.applications enable row level security;
alter table public.contacts enable row level security;
alter table public.activity_log enable row level security;

drop policy if exists "applications_owner_all" on public.applications;
create policy "applications_owner_all" on public.applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "contacts_owner_all" on public.contacts;
create policy "contacts_owner_all" on public.contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "activity_log_owner_all" on public.activity_log;
create policy "activity_log_owner_all" on public.activity_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
