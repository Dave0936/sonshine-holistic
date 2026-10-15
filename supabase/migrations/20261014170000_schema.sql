-- Sonshine Hollistic — core schema.
-- Reads go through row-level security; every write goes through the SECURITY DEFINER
-- functions in the next migration, which enforce the booking rules server-side.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- reference data
create table public.settings (
  id boolean primary key default true check (id),
  cancel_hours int not null default 6 check (cancel_hours between 0 and 72),
  offer_hours int not null default 2 check (offer_hours between 1 and 24),
  reminders boolean not null default true
);
insert into public.settings default values;

create table public.instructors (
  id text primary key,
  name text not null,
  role text not null default 'Yoga Instructor',
  ini text not null,
  bio text not null default '',
  active boolean not null default true,
  sort int not null default 0
);

create table public.classes (
  id text primary key,
  name text not null,
  cat text not null,
  ins text not null references public.instructors(id),
  dur int not null default 60,
  level text not null default 'All levels',
  price int not null default 900 check (price >= 0),
  pass boolean not null default true,
  format text not null default 'In studio' check (format in ('In studio', 'Online', 'Hybrid')),
  img text not null,
  descr text not null default '',
  access text not null default ''
);

create table public.products (
  id text primary key,
  name text not null,
  descr text not null default '',
  price int not null check (price >= 0),
  credits int not null check (credits > 0),
  weeks int not null check (weeks > 0),
  scope text not null default 'adult' check (scope in ('adult', 'kids')),
  on_sale boolean not null default true,
  sort int not null default 0
);

create table public.events (
  id text primary key,
  name text not null,
  sub text,
  img text not null,
  date date,
  start_time time,
  finish_time time,
  host text not null,
  venue text not null,
  price int check (price >= 0),
  early int check (early >= 0),
  early_until date,
  cap int check (cap > 0),
  deadline date,
  published boolean not null default true,
  kind text not null default 'book' check (kind in ('book', 'enquire')),
  descr text not null default '',
  info text not null default ''
);

create table public.services (
  id text primary key,
  name text not null,
  practitioner text not null,
  img text not null,
  duration text not null,
  price_label text not null,
  location text not null,
  descr text not null default '',
  prep text not null default '',
  caution text not null default '',
  sort int not null default 0
);

-- ---------------------------------------------------------------- people
create type public.user_role as enum ('customer', 'admin', 'owner');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first text not null default '',
  last text not null default '',
  email text not null,
  role public.user_role not null default 'customer',
  phone text not null default '',
  active boolean not null default true,
  reminders boolean not null default true,
  marketing boolean not null default false,
  demo boolean not null default false,
  joined timestamptz not null default now()
);
create index on public.profiles (role);

-- Staff-only notes live apart from profiles so customers can never read them.
create table public.customer_notes (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  notes text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- timetable
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  cls text not null references public.classes(id),
  date date not null,
  start_time time not null,
  dur int not null check (dur > 0),
  cap int not null check (cap > 0),
  ins text not null references public.instructors(id),
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled')),
  waitlist boolean not null default true,
  format text not null check (format in ('In studio', 'Online', 'Hybrid'))
);
create index on public.sessions (date);

-- Joining links are only visible to staff and to customers with a confirmed place.
create table public.session_links (
  session_id uuid primary key references public.sessions(id) on delete cascade,
  link text not null
);

-- ---------------------------------------------------------------- money & credits
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  ref text not null,
  amount int not null check (amount >= 0),
  kind text not null check (kind in ('Class', 'Pass', 'Event')),
  label text not null,
  at timestamptz not null default now(),
  status text not null check (status in ('succeeded', 'failed', 'refunded')),
  booking_id uuid,
  product_id text references public.products(id),
  refunded_at timestamptz
);
create index on public.payments (user_id);
create index on public.payments (at);

create table public.passes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product text not null references public.products(id),
  purchased timestamptz not null default now(),
  expires timestamptz not null,
  total int not null check (total > 0),
  payment_id uuid references public.payments(id),
  comp boolean not null default false
);
create index on public.passes (user_id);

-- Append-only credit ledger: a pass balance is always sum(delta).
create table public.ledger (
  id uuid primary key default gen_random_uuid(),
  pass_id uuid not null references public.passes(id) on delete cascade,
  delta int not null check (delta <> 0),
  reason text not null,
  booking_id uuid,
  at timestamptz not null default now(),
  by uuid references public.profiles(id) on delete set null
);
create index on public.ledger (pass_id);

-- ---------------------------------------------------------------- bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  status text not null check (status in ('confirmed', 'waitlisted', 'offered', 'attended', 'noshow', 'cancelled')),
  method text check (method in ('pass', 'card', 'free', 'manual')),
  pass_id uuid references public.passes(id),
  payment_id uuid references public.payments(id),
  amount int not null default 0,
  created timestamptz not null default now(),
  cancelled_at timestamptz,
  late boolean not null default false,
  offer_until timestamptz
);
create index on public.bookings (session_id);
create index on public.bookings (user_id);
-- One live booking per customer per session — the database refuses double booking.
create unique index bookings_one_active_per_user
  on public.bookings (user_id, session_id)
  where status in ('confirmed', 'waitlisted', 'offered', 'attended', 'noshow');

create table public.event_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  payment_id uuid references public.payments(id),
  amount int not null default 0,
  created timestamptz not null default now()
);
create unique index event_bookings_one_per_user on public.event_bookings (user_id, event_id) where status = 'confirmed';

-- ---------------------------------------------------------------- requests, messages, audit
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  service text not null,
  enquiry text,
  date date not null,
  slot text not null,
  msg text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'completed')),
  created timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  at timestamptz not null default now(),
  read boolean not null default false
);
create index on public.notifications (user_id, at desc);

create table public.audit (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  actor uuid references public.profiles(id) on delete set null,
  actor_label text not null,
  action text not null
);
create index on public.audit (at desc);

create table public.delete_requests (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  at timestamptz not null default now()
);

-- ---------------------------------------------------------------- helpers used by policies
create function public.is_staff(uid uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = uid and active and role in ('owner', 'admin'));
$$;

-- New sign-ups always start as customers; roles are only ever raised by SQL.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, first, last)
  values (new.id, lower(new.email),
          coalesce(new.raw_user_meta_data ->> 'first', ''),
          coalesce(new.raw_user_meta_data ->> 'last', ''))
  on conflict (id) do nothing;
  insert into notifications (user_id, text)
  values (new.id, 'Welcome to Sonshine Hollistic! Please verify your email address.');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- row-level security
alter table public.settings enable row level security;
alter table public.instructors enable row level security;
alter table public.classes enable row level security;
alter table public.products enable row level security;
alter table public.events enable row level security;
alter table public.services enable row level security;
alter table public.profiles enable row level security;
alter table public.customer_notes enable row level security;
alter table public.sessions enable row level security;
alter table public.session_links enable row level security;
alter table public.payments enable row level security;
alter table public.passes enable row level security;
alter table public.ledger enable row level security;
alter table public.bookings enable row level security;
alter table public.event_bookings enable row level security;
alter table public.requests enable row level security;
alter table public.notifications enable row level security;
alter table public.audit enable row level security;
alter table public.delete_requests enable row level security;

-- Public catalogue (guests can browse the timetable).
create policy "public read" on public.settings for select using (true);
create policy "public read" on public.instructors for select using (true);
create policy "public read" on public.classes for select using (true);
create policy "public read" on public.products for select using (true);
create policy "public read" on public.sessions for select using (true);
create policy "public read" on public.services for select using (true);
create policy "published or staff" on public.events for select using (published or (select public.is_staff()));

-- Own rows, or everything for staff.
create policy "own or staff" on public.profiles for select using (id = (select auth.uid()) or (select public.is_staff()));
create policy "own or staff" on public.payments for select using (user_id = (select auth.uid()) or (select public.is_staff()));
create policy "own or staff" on public.passes for select using (user_id = (select auth.uid()) or (select public.is_staff()));
create policy "own or staff" on public.bookings for select using (user_id = (select auth.uid()) or (select public.is_staff()));
create policy "own or staff" on public.event_bookings for select using (user_id = (select auth.uid()) or (select public.is_staff()));
create policy "own or staff" on public.requests for select using (user_id = (select auth.uid()) or (select public.is_staff()));
create policy "own or staff" on public.delete_requests for select using (user_id = (select auth.uid()) or (select public.is_staff()));
create policy "own pass or staff" on public.ledger for select using (
  (select public.is_staff()) or exists (select 1 from public.passes p where p.id = pass_id and p.user_id = (select auth.uid())));
create policy "own" on public.notifications for select using (user_id = (select auth.uid()));

-- Staff only.
create policy "staff" on public.customer_notes for select using ((select public.is_staff()));
create policy "staff" on public.audit for select using ((select public.is_staff()));

-- Joining links: staff, or a customer holding a confirmed place.
create policy "booked or staff" on public.session_links for select using (
  (select public.is_staff()) or exists (
    select 1 from public.bookings b
    where b.session_id = session_links.session_id and b.user_id = (select auth.uid()) and b.status = 'confirmed'));

-- No direct writes from clients: everything goes through the functions.
revoke insert, update, delete on all tables in schema public from anon, authenticated;
