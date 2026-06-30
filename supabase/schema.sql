-- TravelAI Planner Supabase schema
-- Run this in the Supabase SQL editor for your project.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  travel_preferences jsonb not null default '{}'::jsonb,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  region text not null default '',
  description text not null default '',
  best_time_to_visit text not null default '',
  cost_level text not null default 'mid-range' check (cost_level in ('budget', 'mid-range', 'luxury')),
  tags text[] not null default '{}',
  popular_attractions text[] not null default '{}',
  safety_notes text not null default '',
  family_suitability_notes text not null default '',
  image_url text not null default '',
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination_id uuid references public.destinations(id) on delete set null,
  custom_destination jsonb not null default '{}'::jsonb,
  title text not null,
  start_date date,
  end_date date,
  duration_days integer check (duration_days is null or (duration_days >= 1 and duration_days <= 365)),
  traveler_count integer not null default 1 check (traveler_count >= 1 and traveler_count <= 50),
  travel_style text not null default '',
  interests text[] not null default '{}',
  notes text not null default '',
  status text not null default 'draft' check (status in ('draft', 'saved', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  currency text not null default 'USD' check (char_length(currency) = 3),
  categories jsonb not null default '{}'::jsonb,
  total_estimate numeric not null default 0 check (total_estimate >= 0),
  confidence_level text not null default 'low' check (confidence_level in ('low', 'medium', 'high')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, trip_id)
);

alter table public.budgets add column if not exists name text not null default 'Trip Budget';
alter table public.budgets add column if not exists category text not null default 'general';
alter table public.budgets add column if not exists description text not null default '';
alter table public.budgets add column if not exists total_budget numeric not null default 0 check (total_budget >= 0);
alter table public.budgets add column if not exists start_date date;
alter table public.budgets add column if not exists end_date date;
alter table public.budgets add column if not exists savings_target numeric not null default 0 check (savings_target >= 0);
alter table public.budgets add column if not exists fixed_costs numeric not null default 0 check (fixed_costs >= 0);
alter table public.budgets add column if not exists variable_costs numeric not null default 0 check (variable_costs >= 0);
alter table public.budgets add column if not exists one_time_costs numeric not null default 0 check (one_time_costs >= 0);
alter table public.budgets add column if not exists recurring_costs numeric not null default 0 check (recurring_costs >= 0);

create table if not exists public.budget_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  budget_id uuid not null references public.budgets(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  title text not null,
  category text not null default 'miscellaneous',
  amount numeric not null default 0 check (amount >= 0),
  expense_date date not null default current_date,
  vendor text not null default '',
  notes text not null default '',
  status text not null default 'estimated' check (status in ('estimated', 'actual')),
  cost_type text not null default 'variable' check (cost_type in ('fixed', 'variable', 'one-time', 'recurring')),
  recurrence_frequency text not null default '' check (recurrence_frequency in ('', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  recurrence_end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  saved_title text not null default '',
  notes text not null default '',
  tags text[] not null default '{}',
  folder text not null default '',
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, trip_id)
);

delete from public.destinations a
using public.destinations b
where a.name = b.name
  and a.country = b.country
  and a.created_at > b.created_at;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'destinations_name_country_key'
      and conrelid = 'public.destinations'::regclass
  ) then
    alter table public.destinations
      add constraint destinations_name_country_key unique (name, country);
  end if;
end;
$$;

create index if not exists destinations_status_idx on public.destinations(status);
create index if not exists destinations_region_idx on public.destinations(region);
create index if not exists destinations_cost_level_idx on public.destinations(cost_level);
create index if not exists destinations_tags_idx on public.destinations using gin(tags);
create index if not exists trips_user_created_idx on public.trips(user_id, created_at desc);
create index if not exists trips_user_status_idx on public.trips(user_id, status);
create index if not exists trips_user_destination_idx on public.trips(user_id, destination_id);
create index if not exists budgets_trip_idx on public.budgets(trip_id);
create index if not exists budgets_user_dates_idx on public.budgets(user_id, start_date, end_date);
create index if not exists budgets_user_category_idx on public.budgets(user_id, category);
create index if not exists budget_expenses_budget_date_idx on public.budget_expenses(budget_id, expense_date desc);
create index if not exists budget_expenses_user_category_idx on public.budget_expenses(user_id, category);
create index if not exists budget_expenses_user_vendor_idx on public.budget_expenses(user_id, vendor);
create index if not exists budget_expenses_user_status_idx on public.budget_expenses(user_id, status);
create index if not exists budget_expenses_user_cost_type_idx on public.budget_expenses(user_id, cost_type);
create index if not exists saved_trips_user_saved_at_idx on public.saved_trips(user_id, saved_at desc);
create index if not exists saved_trips_user_folder_idx on public.saved_trips(user_id, folder);
create index if not exists saved_trips_tags_idx on public.saved_trips using gin(tags);

create or replace trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace trigger destinations_set_updated_at
before update on public.destinations
for each row execute function public.set_updated_at();

create or replace trigger trips_set_updated_at
before update on public.trips
for each row execute function public.set_updated_at();

create or replace trigger budgets_set_updated_at
before update on public.budgets
for each row execute function public.set_updated_at();

create or replace trigger budget_expenses_set_updated_at
before update on public.budget_expenses
for each row execute function public.set_updated_at();

create or replace trigger saved_trips_set_updated_at
before update on public.saved_trips
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.destinations enable row level security;
alter table public.trips enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_expenses enable row level security;
alter table public.saved_trips enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Authenticated users can read active destinations" on public.destinations;
create policy "Authenticated users can read active destinations"
on public.destinations for select
to authenticated
using (status = 'active');

drop policy if exists "Users can read own trips" on public.trips;
create policy "Users can read own trips"
on public.trips for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own trips" on public.trips;
create policy "Users can create own trips"
on public.trips for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own trips" on public.trips;
create policy "Users can update own trips"
on public.trips for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own trips" on public.trips;
create policy "Users can delete own trips"
on public.trips for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own budgets" on public.budgets;
create policy "Users can read own budgets"
on public.budgets for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own budgets" on public.budgets;
create policy "Users can create own budgets"
on public.budgets for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (select 1 from public.trips where trips.id = budgets.trip_id and trips.user_id = auth.uid())
);

drop policy if exists "Users can update own budgets" on public.budgets;
create policy "Users can update own budgets"
on public.budgets for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (select 1 from public.trips where trips.id = budgets.trip_id and trips.user_id = auth.uid())
);

drop policy if exists "Users can delete own budgets" on public.budgets;
create policy "Users can delete own budgets"
on public.budgets for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own budget expenses" on public.budget_expenses;
create policy "Users can read own budget expenses"
on public.budget_expenses for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own budget expenses" on public.budget_expenses;
create policy "Users can create own budget expenses"
on public.budget_expenses for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (select 1 from public.budgets where budgets.id = budget_expenses.budget_id and budgets.user_id = auth.uid())
);

drop policy if exists "Users can update own budget expenses" on public.budget_expenses;
create policy "Users can update own budget expenses"
on public.budget_expenses for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (select 1 from public.budgets where budgets.id = budget_expenses.budget_id and budgets.user_id = auth.uid())
);

drop policy if exists "Users can delete own budget expenses" on public.budget_expenses;
create policy "Users can delete own budget expenses"
on public.budget_expenses for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own saved trips" on public.saved_trips;
create policy "Users can read own saved trips"
on public.saved_trips for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own saved trips" on public.saved_trips;
create policy "Users can create own saved trips"
on public.saved_trips for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (select 1 from public.trips where trips.id = saved_trips.trip_id and trips.user_id = auth.uid())
);

drop policy if exists "Users can update own saved trips" on public.saved_trips;
create policy "Users can update own saved trips"
on public.saved_trips for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own saved trips" on public.saved_trips;
create policy "Users can delete own saved trips"
on public.saved_trips for delete
to authenticated
using (auth.uid() = user_id);

-- Optional seed rows for local/manual testing. Uncomment and customize if needed.
-- insert into public.destinations (name, country, region, description, cost_level, tags, popular_attractions)
-- values
--   ('Goa', 'India', 'West India', 'Beach destination with nightlife, food, and heritage areas.', 'mid-range', array['beach','food','nightlife'], array['Baga Beach','Fort Aguada']),
--   ('Jaipur', 'India', 'Rajasthan', 'Historic pink city with forts, markets, and palaces.', 'budget', array['history','culture','food'], array['Amber Fort','City Palace'])
-- on conflict do nothing;
