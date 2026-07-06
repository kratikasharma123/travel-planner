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
  status text not null default 'active' check (status in ('active', 'suspended', 'disabled')),
  travel_preferences jsonb not null default '{}'::jsonb,
  avatar_url text not null default '',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists avatar_url text not null default '';

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

alter table public.trips add column if not exists city text not null default '';
alter table public.trips add column if not exists country text not null default '';
alter table public.trips add column if not exists budget numeric not null default 0 check (budget >= 0);
alter table public.trips add column if not exists weather_summary jsonb not null default '{}'::jsonb;
alter table public.trips add column if not exists progress numeric not null default 0 check (progress >= 0 and progress <= 100);

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'trips_status_check'
      and conrelid = 'public.trips'::regclass
  ) then
    alter table public.trips drop constraint trips_status_check;
  end if;

  alter table public.trips
    add constraint trips_status_check check (status in ('draft', 'saved', 'active', 'completed', 'archived'));
end;
$$;

create table if not exists public.ai_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete set null,
  title text not null default 'Travel chat',
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.trip_itineraries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'AI Itinerary',
  source text not null default 'ai' check (source in ('ai', 'manual')),
  status text not null default 'draft' check (status in ('draft', 'saved', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references public.trip_itineraries(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number integer not null default 1 check (day_number >= 1),
  time_block text not null default 'morning' check (time_block in ('morning', 'afternoon', 'evening', 'night')),
  title text not null,
  description text not null default '',
  location_name text not null default '',
  category text not null default 'activity',
  estimated_cost numeric not null default 0 check (estimated_cost >= 0),
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  booking_type text not null default 'activity' check (booking_type in ('flight', 'hotel', 'transport', 'activity')),
  title text not null,
  provider text not null default '',
  reference_number text not null default '',
  start_at timestamptz,
  end_at timestamptz,
  details jsonb not null default '{}'::jsonb,
  document_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.travel_checklists (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'Travel Essentials',
  title text not null,
  is_complete boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.travel_documents (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null default 'Travel Document',
  title text not null,
  file_path text not null default '',
  file_name text not null default '',
  mime_type text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_notifications (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_type text not null default 'reminder',
  title text not null,
  message text not null default '',
  remind_at timestamptz,
  is_read boolean not null default false,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_locations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  location_type text not null default 'attraction',
  name text not null,
  address text not null default '',
  lat numeric,
  lng numeric,
  notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.destination_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete set null,
  destination_name text not null,
  country text not null default '',
  city text not null default '',
  image_url text not null default '',
  estimated_budget numeric not null default 0 check (estimated_budget >= 0),
  best_time_to_visit text not null default '',
  rating numeric not null default 4.5 check (rating >= 0 and rating <= 5),
  popular_attractions text[] not null default '{}',
  travel_tips text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trips_user_dates_idx on public.trips(user_id, start_date, end_date);
create index if not exists ai_chat_sessions_user_idx on public.ai_chat_sessions(user_id, updated_at desc);
create index if not exists ai_chat_messages_session_idx on public.ai_chat_messages(session_id, created_at);
create index if not exists trip_itineraries_trip_idx on public.trip_itineraries(trip_id, created_at desc);
create index if not exists itinerary_items_itinerary_day_idx on public.itinerary_items(itinerary_id, day_number, sort_order);
create index if not exists trip_bookings_trip_idx on public.trip_bookings(trip_id, start_at);
create index if not exists travel_checklists_trip_idx on public.travel_checklists(trip_id, sort_order);
create index if not exists travel_documents_trip_idx on public.travel_documents(trip_id, document_type);
create index if not exists trip_notifications_user_remind_idx on public.trip_notifications(user_id, remind_at);
create index if not exists saved_locations_trip_idx on public.saved_locations(trip_id, location_type);
create index if not exists destination_recommendations_user_idx on public.destination_recommendations(user_id, created_at desc);

create or replace trigger ai_chat_sessions_set_updated_at before update on public.ai_chat_sessions for each row execute function public.set_updated_at();
create or replace trigger trip_itineraries_set_updated_at before update on public.trip_itineraries for each row execute function public.set_updated_at();
create or replace trigger itinerary_items_set_updated_at before update on public.itinerary_items for each row execute function public.set_updated_at();
create or replace trigger trip_bookings_set_updated_at before update on public.trip_bookings for each row execute function public.set_updated_at();
create or replace trigger travel_checklists_set_updated_at before update on public.travel_checklists for each row execute function public.set_updated_at();
create or replace trigger travel_documents_set_updated_at before update on public.travel_documents for each row execute function public.set_updated_at();
create or replace trigger trip_notifications_set_updated_at before update on public.trip_notifications for each row execute function public.set_updated_at();
create or replace trigger saved_locations_set_updated_at before update on public.saved_locations for each row execute function public.set_updated_at();
create or replace trigger destination_recommendations_set_updated_at before update on public.destination_recommendations for each row execute function public.set_updated_at();

alter table public.ai_chat_sessions enable row level security;
alter table public.ai_chat_messages enable row level security;
alter table public.trip_itineraries enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.trip_bookings enable row level security;
alter table public.travel_checklists enable row level security;
alter table public.travel_documents enable row level security;
alter table public.trip_notifications enable row level security;
alter table public.saved_locations enable row level security;
alter table public.destination_recommendations enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['ai_chat_sessions','ai_chat_messages','trip_itineraries','itinerary_items','trip_bookings','travel_checklists','travel_documents','trip_notifications','saved_locations','destination_recommendations'] loop
    execute format('drop policy if exists "Users can read own %1$s" on public.%1$I', table_name);
    execute format('create policy "Users can read own %1$s" on public.%1$I for select to authenticated using (auth.uid() = user_id)', table_name);
    execute format('drop policy if exists "Users can create own %1$s" on public.%1$I', table_name);
    execute format('create policy "Users can create own %1$s" on public.%1$I for insert to authenticated with check (auth.uid() = user_id)', table_name);
    execute format('drop policy if exists "Users can update own %1$s" on public.%1$I', table_name);
    execute format('create policy "Users can update own %1$s" on public.%1$I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', table_name);
    execute format('drop policy if exists "Users can delete own %1$s" on public.%1$I', table_name);
    execute format('create policy "Users can delete own %1$s" on public.%1$I for delete to authenticated using (auth.uid() = user_id)', table_name);
  end loop;
end;
$$;

insert into storage.buckets (id, name, public)
values ('travel-documents', 'travel-documents', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read profile images" on storage.objects;
create policy "Public can read profile images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'profile-images');

drop policy if exists "Users can upload own profile images" on storage.objects;
create policy "Users can upload own profile images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update own profile images" on storage.objects;
create policy "Users can update own profile images"
on storage.objects for update
to authenticated
using (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete own profile images" on storage.objects;
create policy "Users can delete own profile images"
on storage.objects for delete
to authenticated
using (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles drop constraint profiles_role_check;
  end if;

  alter table public.profiles
    add constraint profiles_role_check check (role in ('user', 'support', 'moderator', 'admin', 'super_admin'));
end;
$$;

alter table public.profiles add column if not exists permissions jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists suspended_at timestamptz;
alter table public.profiles add column if not exists suspension_reason text not null default '';

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'profiles_status_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles drop constraint profiles_status_check;
  end if;

  alter table public.profiles
    add constraint profiles_status_check check (status in ('active', 'suspended', 'disabled'));
end;
$$;

create or replace function public.is_admin_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('support', 'moderator', 'admin', 'super_admin')
      and status = 'active'
  );
$$;

create or replace function public.has_admin_permission(required_permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'active'
      and (
        role = 'super_admin'
        or permissions ->> required_permission = 'true'
        or (role = 'admin' and required_permission in ('dashboard:read','users:read','users:write','trips:read','trips:write','bookings:read','bookings:write','ai:read','ai:write','content:read','content:write','reports:read','notifications:read','notifications:write','support:read','support:write','reviews:read','reviews:write','settings:read'))
        or (role = 'moderator' and required_permission in ('dashboard:read','users:read','trips:read','bookings:read','content:read','content:write','reports:read','support:read','support:write','reviews:read','reviews:write'))
        or (role = 'support' and required_permission in ('dashboard:read','users:read','support:read','support:write','reviews:read'))
      )
      and coalesce(permissions ->> required_permission, 'true') <> 'false'
  );
$$;

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null default '',
  entity_id text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  ip_address text not null default '',
  user_agent text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.admin_settings (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'system',
  setting_key text not null,
  setting_value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category, setting_key)
);

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  message text not null default '',
  channel text not null default 'in-app' check (channel in ('push', 'email', 'in-app')),
  scheduled_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'sent', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  assigned_admin_id uuid references auth.users(id) on delete set null,
  title text not null,
  message text not null default '',
  status text not null default 'open' check (status in ('open', 'pending', 'resolved', 'closed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  category text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  sender_role text not null default 'user',
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  trip_id uuid references public.trips(id) on delete set null,
  destination_id uuid references public.destinations(id) on delete set null,
  rating numeric not null default 5 check (rating >= 1 and rating <= 5),
  comment text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'reported')),
  moderation_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  content_type text not null default 'guide' check (content_type in ('guide', 'blog', 'faq', 'testimonial', 'promotion', 'banner', 'category')),
  title text not null,
  body text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  trip_id uuid references public.trips(id) on delete set null,
  session_id uuid references public.ai_chat_sessions(id) on delete set null,
  request_type text not null default 'chat',
  prompt text not null default '',
  response_summary text not null default '',
  token_estimate integer not null default 0,
  status text not null default 'success' check (status in ('success', 'failed')),
  latency_ms integer not null default 0,
  error text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_status_idx on public.profiles(role, status);
create index if not exists admin_audit_logs_created_idx on public.admin_audit_logs(created_at desc);
create index if not exists admin_settings_category_idx on public.admin_settings(category);
create index if not exists admin_notifications_status_idx on public.admin_notifications(status, scheduled_at);
create index if not exists support_tickets_status_idx on public.support_tickets(status, priority, created_at desc);
create index if not exists reviews_status_idx on public.reviews(status, created_at desc);
create index if not exists content_items_type_status_idx on public.content_items(content_type, status);
create index if not exists ai_usage_logs_created_idx on public.ai_usage_logs(created_at desc);

create or replace trigger admin_settings_set_updated_at before update on public.admin_settings for each row execute function public.set_updated_at();
create or replace trigger admin_notifications_set_updated_at before update on public.admin_notifications for each row execute function public.set_updated_at();
create or replace trigger support_tickets_set_updated_at before update on public.support_tickets for each row execute function public.set_updated_at();
create or replace trigger reviews_set_updated_at before update on public.reviews for each row execute function public.set_updated_at();
create or replace trigger content_items_set_updated_at before update on public.content_items for each row execute function public.set_updated_at();

alter table public.admin_audit_logs enable row level security;
alter table public.admin_settings enable row level security;
alter table public.admin_notifications enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;
alter table public.reviews enable row level security;
alter table public.content_items enable row level security;
alter table public.ai_usage_logs enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['admin_audit_logs','admin_settings','admin_notifications','support_tickets','support_ticket_messages','reviews','content_items','ai_usage_logs'] loop
    execute format('drop policy if exists "Admins can read %1$s" on public.%1$I', table_name);
    execute format('create policy "Admins can read %1$s" on public.%1$I for select to authenticated using (public.is_admin_role())', table_name);
    execute format('drop policy if exists "Admins can create %1$s" on public.%1$I', table_name);
    execute format('create policy "Admins can create %1$s" on public.%1$I for insert to authenticated with check (public.is_admin_role())', table_name);
    execute format('drop policy if exists "Admins can update %1$s" on public.%1$I', table_name);
    execute format('create policy "Admins can update %1$s" on public.%1$I for update to authenticated using (public.is_admin_role()) with check (public.is_admin_role())', table_name);
    execute format('drop policy if exists "Admins can delete %1$s" on public.%1$I', table_name);
    execute format('create policy "Admins can delete %1$s" on public.%1$I for delete to authenticated using (public.is_admin_role())', table_name);
  end loop;
end;
$$;

drop policy if exists "Users can create own ai_usage_logs" on public.ai_usage_logs;
create policy "Users can create own ai_usage_logs"
on public.ai_usage_logs for insert
to authenticated
with check (auth.uid() = user_id);

create index if not exists profiles_status_created_idx on public.profiles(status, created_at desc);
create index if not exists profiles_created_idx on public.profiles(created_at desc);
create index if not exists trips_status_created_idx on public.trips(status, created_at desc);
create index if not exists trip_bookings_type_created_idx on public.trip_bookings(booking_type, created_at desc);
create index if not exists ai_usage_logs_status_created_idx on public.ai_usage_logs(status, created_at desc);

-- Admin read/write policies for user-owned operational tables shown in the admin panel.
drop policy if exists "Admins can read profiles" on public.profiles;
create policy "Admins can read profiles"
on public.profiles for select
to authenticated
using (public.has_admin_permission('users:read'));

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (public.has_admin_permission('users:write'))
with check (public.has_admin_permission('users:write'));

do $$
declare
  table_name text;
begin
  foreach table_name in array array['trips','budgets','budget_expenses','saved_trips','ai_chat_sessions','ai_chat_messages','trip_itineraries','itinerary_items','travel_checklists','travel_documents','trip_notifications','saved_locations','destination_recommendations'] loop
    execute format('drop policy if exists "Admins can read %1$s" on public.%1$I', table_name);
    execute format('create policy "Admins can read %1$s" on public.%1$I for select to authenticated using (public.is_admin_role())', table_name);
    execute format('drop policy if exists "Admins can update %1$s" on public.%1$I', table_name);
    execute format('create policy "Admins can update %1$s" on public.%1$I for update to authenticated using (public.is_admin_role()) with check (public.is_admin_role())', table_name);
    execute format('drop policy if exists "Admins can delete %1$s" on public.%1$I', table_name);
    execute format('create policy "Admins can delete %1$s" on public.%1$I for delete to authenticated using (public.has_admin_permission(''settings:write''))', table_name);
  end loop;
end;
$$;

drop policy if exists "Admins can read destinations" on public.destinations;
create policy "Admins can read destinations"
on public.destinations for select
to authenticated
using (public.has_admin_permission('content:read'));

drop policy if exists "Admins can write destinations" on public.destinations;
create policy "Admins can write destinations"
on public.destinations for all
to authenticated
using (public.has_admin_permission('content:write'))
with check (public.has_admin_permission('content:write'));

-- Milestone 4: Core non-AI travel CRUD tables.
alter table public.trips add column if not exists is_favorite boolean not null default false;

create table if not exists public.saved_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination_id uuid references public.destinations(id) on delete set null,
  name text not null,
  city text not null default '',
  country text not null default '',
  category text not null default 'Destinations',
  notes text not null default '',
  image_url text not null default '',
  rating numeric not null default 4.7 check (rating >= 0 and rating <= 5),
  budget_level text not null default 'mid-range',
  best_time text not null default '',
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, destination_id),
  unique (user_id, name, country)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete set null,
  booking_type text not null default 'activity' check (booking_type in ('flight', 'hotel', 'transport', 'activity', 'tour')),
  title text not null,
  provider text not null default '',
  reference_number text not null default '',
  start_at timestamptz,
  end_at timestamptz,
  location text not null default '',
  status text not null default 'upcoming' check (status in ('upcoming', 'completed', 'cancelled')),
  price numeric not null default 0 check (price >= 0),
  details jsonb not null default '{}'::jsonb,
  document_url text not null default '',
  image_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trips_user_favorite_idx on public.trips(user_id, is_favorite);
create index if not exists saved_places_user_saved_at_idx on public.saved_places(user_id, saved_at desc);
create index if not exists saved_places_user_category_idx on public.saved_places(user_id, category);
create index if not exists saved_places_tags_idx on public.saved_places using gin(tags);
create index if not exists bookings_user_start_idx on public.bookings(user_id, start_at);
create index if not exists bookings_user_type_status_idx on public.bookings(user_id, booking_type, status);

create or replace trigger saved_places_set_updated_at before update on public.saved_places for each row execute function public.set_updated_at();
create or replace trigger bookings_set_updated_at before update on public.bookings for each row execute function public.set_updated_at();

alter table public.saved_places enable row level security;
alter table public.bookings enable row level security;

-- Destinations are public-readable for Milestone 4 discovery pages.
drop policy if exists "Public can read active destinations" on public.destinations;
create policy "Public can read active destinations"
on public.destinations for select
to anon, authenticated
using (status = 'active');

do $$
declare
  table_name text;
begin
  foreach table_name in array array['saved_places','bookings'] loop
    execute format('drop policy if exists "Users can read own %1$s" on public.%1$I', table_name);
    execute format('create policy "Users can read own %1$s" on public.%1$I for select to authenticated using (auth.uid() = user_id)', table_name);
    execute format('drop policy if exists "Users can create own %1$s" on public.%1$I', table_name);
    execute format('create policy "Users can create own %1$s" on public.%1$I for insert to authenticated with check (auth.uid() = user_id)', table_name);
    execute format('drop policy if exists "Users can update own %1$s" on public.%1$I', table_name);
    execute format('create policy "Users can update own %1$s" on public.%1$I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', table_name);
    execute format('drop policy if exists "Users can delete own %1$s" on public.%1$I', table_name);
    execute format('create policy "Users can delete own %1$s" on public.%1$I for delete to authenticated using (auth.uid() = user_id)', table_name);
  end loop;
end;
$$;

-- Booking trip relation guard: booking can be linked only to user's own trip.
drop policy if exists "Users can create own bookings" on public.bookings;
create policy "Users can create own bookings"
on public.bookings for insert
to authenticated
with check (
  auth.uid() = user_id
  and (trip_id is null or exists (select 1 from public.trips where trips.id = bookings.trip_id and trips.user_id = auth.uid()))
);

drop policy if exists "Users can update own bookings" on public.bookings;
create policy "Users can update own bookings"
on public.bookings for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and (trip_id is null or exists (select 1 from public.trips where trips.id = bookings.trip_id and trips.user_id = auth.uid()))
);

-- Optional seed rows for local/manual testing. Uncomment and customize if needed.
-- insert into public.destinations (name, country, region, description, cost_level, tags, popular_attractions)
-- values
--   ('Goa', 'India', 'West India', 'Beach destination with nightlife, food, and heritage areas.', 'mid-range', array['beach','food','nightlife'], array['Baga Beach','Fort Aguada']),
--   ('Jaipur', 'India', 'Rajasthan', 'Historic pink city with forts, markets, and palaces.', 'budget', array['history','culture','food'], array['Amber Fort','City Palace'])
-- on conflict do nothing;

-- Milestone 7: Real admin data, reporting, and review policies.
alter table public.profiles add column if not exists email text not null default '';

create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists bookings_created_idx on public.bookings(created_at desc);
create index if not exists budgets_created_idx on public.budgets(created_at desc);
create index if not exists budget_expenses_created_idx on public.budget_expenses(created_at desc);
create index if not exists reviews_user_created_idx on public.reviews(user_id, created_at desc);
create index if not exists trip_notifications_created_idx on public.trip_notifications(created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), coalesce(new.email, ''))
  on conflict (id) do update set
    name = coalesce(nullif(public.profiles.name, ''), excluded.name),
    email = coalesce(nullif(excluded.email, ''), public.profiles.email),
    updated_at = now();
  return new;
end;
$$;

-- Users can create and read their own reviews. Admins moderate all review rows from the admin panel.
drop policy if exists "Users can read approved reviews" on public.reviews;
create policy "Users can read approved reviews"
on public.reviews for select
to authenticated
using (status = 'approved' or auth.uid() = user_id or public.has_admin_permission('reviews:read'));

drop policy if exists "Users can create own reviews" on public.reviews;
create policy "Users can create own reviews"
on public.reviews for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own pending reviews" on public.reviews;
create policy "Users can update own pending reviews"
on public.reviews for update
to authenticated
using (auth.uid() = user_id and status in ('pending', 'reported'))
with check (auth.uid() = user_id and status in ('pending', 'reported'));

-- Admin permission-specific policies for admin-managed profiles.
drop policy if exists "Admins can create profiles" on public.profiles;
create policy "Admins can create profiles"
on public.profiles for insert
to authenticated
with check (public.has_admin_permission('users:write'));

drop policy if exists "Admins can delete profiles" on public.profiles;
create policy "Admins can delete profiles"
on public.profiles for delete
to authenticated
using (public.has_admin_permission('users:delete'));

-- Operational user-owned tables exposed in admin screens/reports.
do $$
declare
  policy_row record;
begin
  for policy_row in
    select * from (values
      ('trips','trips:read','trips:write'),
      ('bookings','bookings:read','bookings:write'),
      ('budgets','reports:read','reports:read'),
      ('budget_expenses','reports:read','reports:read'),
      ('saved_trips','trips:read','trips:write'),
      ('ai_chat_sessions','ai:read','ai:write'),
      ('ai_chat_messages','ai:read','ai:write'),
      ('trip_itineraries','trips:read','trips:write'),
      ('itinerary_items','trips:read','trips:write'),
      ('trip_bookings','bookings:read','bookings:write'),
      ('travel_checklists','trips:read','trips:write'),
      ('travel_documents','trips:read','trips:write'),
      ('trip_notifications','notifications:read','notifications:write'),
      ('saved_locations','trips:read','trips:write'),
      ('destination_recommendations','ai:read','ai:write'),
      ('saved_places','content:read','content:write')
    ) as policies(table_name, read_permission, write_permission)
  loop
    execute format('drop policy if exists "Admins can read %1$s" on public.%1$I', policy_row.table_name);
    execute format('create policy "Admins can read %1$s" on public.%1$I for select to authenticated using (public.has_admin_permission(%2$L))', policy_row.table_name, policy_row.read_permission);
    execute format('drop policy if exists "Admins can create %1$s" on public.%1$I', policy_row.table_name);
    execute format('create policy "Admins can create %1$s" on public.%1$I for insert to authenticated with check (public.has_admin_permission(%2$L))', policy_row.table_name, policy_row.write_permission);
    execute format('drop policy if exists "Admins can update %1$s" on public.%1$I', policy_row.table_name);
    execute format('create policy "Admins can update %1$s" on public.%1$I for update to authenticated using (public.has_admin_permission(%2$L)) with check (public.has_admin_permission(%2$L))', policy_row.table_name, policy_row.write_permission);
    execute format('drop policy if exists "Admins can delete %1$s" on public.%1$I', policy_row.table_name);
    execute format('create policy "Admins can delete %1$s" on public.%1$I for delete to authenticated using (public.has_admin_permission(%2$L))', policy_row.table_name, policy_row.write_permission);
  end loop;
end;
$$;

drop policy if exists "Admins can read admin_audit_logs" on public.admin_audit_logs;
create policy "Admins can read admin_audit_logs"
on public.admin_audit_logs for select
to authenticated
using (public.has_admin_permission('audit:read'));

drop policy if exists "Admins can create admin_audit_logs" on public.admin_audit_logs;
create policy "Admins can create admin_audit_logs"
on public.admin_audit_logs for insert
to authenticated
with check (public.is_admin_role());

drop policy if exists "Admins can update admin_audit_logs" on public.admin_audit_logs;
create policy "Admins can update admin_audit_logs"
on public.admin_audit_logs for update
to authenticated
using (public.has_admin_permission('audit:read'))
with check (public.has_admin_permission('audit:read'));

drop policy if exists "Admins can delete admin_audit_logs" on public.admin_audit_logs;
create policy "Admins can delete admin_audit_logs"
on public.admin_audit_logs for delete
to authenticated
using (public.has_admin_permission('audit:read'));

-- Keep content/settings/notifications/AI/reviews permission-specific even if older broad admin policies exist above.
do $$
declare
  policy_row record;
begin
  for policy_row in
    select * from (values
      ('admin_settings','settings:read','settings:write'),
      ('admin_notifications','notifications:read','notifications:write'),
      ('content_items','content:read','content:write'),
      ('reviews','reviews:read','reviews:write'),
      ('support_tickets','support:read','support:write'),
      ('support_ticket_messages','support:read','support:write'),
      ('ai_usage_logs','ai:read','ai:write')
    ) as policies(table_name, read_permission, write_permission)
  loop
    execute format('drop policy if exists "Admins can read %1$s" on public.%1$I', policy_row.table_name);
    execute format('create policy "Admins can read %1$s" on public.%1$I for select to authenticated using (public.has_admin_permission(%2$L))', policy_row.table_name, policy_row.read_permission);
    execute format('drop policy if exists "Admins can create %1$s" on public.%1$I', policy_row.table_name);
    execute format('create policy "Admins can create %1$s" on public.%1$I for insert to authenticated with check (public.has_admin_permission(%2$L))', policy_row.table_name, policy_row.write_permission);
    execute format('drop policy if exists "Admins can update %1$s" on public.%1$I', policy_row.table_name);
    execute format('create policy "Admins can update %1$s" on public.%1$I for update to authenticated using (public.has_admin_permission(%2$L)) with check (public.has_admin_permission(%2$L))', policy_row.table_name, policy_row.write_permission);
    execute format('drop policy if exists "Admins can delete %1$s" on public.%1$I', policy_row.table_name);
    execute format('create policy "Admins can delete %1$s" on public.%1$I for delete to authenticated using (public.has_admin_permission(%2$L))', policy_row.table_name, policy_row.write_permission);
  end loop;
end;
$$;
