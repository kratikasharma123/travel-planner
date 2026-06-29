# System Architecture — TravelAI Planner

Ye document TravelAI Planner ka current high-level architecture define karta hai after moving from custom Express/Mongo backend to Supabase.

## Architecture Overview

TravelAI Planner React frontend directly Supabase Auth and Supabase Postgres se connect karta hai through `@supabase/supabase-js`. Supabase RLS user-owned data protect karti hai.

```txt
+-------------------+
|    User Browser   |
+---------+---------+
          |
          v
+-------------------+
| React + Vite App  |
| Tailwind UI       |
+---------+---------+
          |
          | Supabase JS client
          v
+-----------------------------+
| Supabase                    |
| Auth + Postgres + RLS       |
+-----------------------------+
```

## Frontend Architecture

### Responsibilities

- Landing page and marketing UX
- Authentication screens
- Dashboard and navigation
- AI planner shell
- Destination discovery interface
- Budget planner interface
- Saved trips UI
- AI assistant shell
- Profile and admin pages
- Supabase communication through service modules

### Frontend Flow

```txt
Pages → Hooks → Services → Supabase Auth/Postgres
```

## Supabase Architecture

### Responsibilities

- Auth registration/login/logout/session
- Profile persistence
- User-owned trip, budget, and saved-trip data
- Destination records
- Row Level Security authorization
- Hosted Postgres queries

### Current Tables

```txt
Supabase Postgres
├── profiles
├── trips
├── destinations
├── budgets
└── saved_trips
```

## AI Service Architecture

AI features are planned for future milestones. Because AI provider keys must not be exposed in the browser, AI calls should be implemented later with a secure server-side layer such as Supabase Edge Functions.

```txt
User Input
  ↓
Frontend Form
  ↓
Secure Function Layer (future)
  ↓
OpenAI API
  ↓
Frontend Result UI
```

## Authentication Architecture

Supabase Auth handles sessions.

```txt
Register/Login
  ↓
Supabase Auth creates browser session
  ↓
React AuthProvider reads session/profile
  ↓
Protected routes allow authenticated users
  ↓
Supabase RLS enforces row ownership
```

## Authorization Planning

| Role | Access |
|---|---|
| Guest | Landing, login, register |
| User | Dashboard, planner, destinations, budget, saved trips, assistant, profile |
| Admin | Admin dashboard placeholder; deeper admin policies planned later |

## Deployment Architecture

```txt
GitHub Repository
      ↓
Static Frontend Hosting
      ↓
React App served to users
      ↓
Supabase Auth/Postgres/RLS
```

## Environment Planning

Frontend needs:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon or publishable key |

`VITE_SUPABASE_PUBLISHABLE_KEY` is also supported.

## Request Lifecycle Example

```txt
User creates trip
  ↓
React form calls useTrips hook
  ↓
tripService inserts row into Supabase `trips`
  ↓
RLS checks auth.uid() = user_id
  ↓
Supabase returns created row
  ↓
React refreshes My Trips UI
```

## Non-Functional Requirements Planning

| Area | Plan |
|---|---|
| Security | Supabase Auth, RLS, no service-role key in frontend |
| Scalability | Hosted Supabase database and static frontend |
| Reliability | Service-layer error normalization for UI fallbacks |
| Maintainability | Route pages, hooks, services, and schema SQL kept separate |
| Performance | Query pagination and indexed ownership/filter columns |
| Observability | Future Supabase logs and AI usage tracking |
