# Tech Stack — TravelAI Planner

Ye document TravelAI Planner ke current Supabase-based stack ko define karta hai.

## Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | Interactive SPA UI |
| Build Tool | Vite | Fast dev server and optimized builds |
| Styling | Tailwind CSS | Utility-first responsive design |
| Routing | React Router | Client-side page routing |
| Backend/BaaS | Supabase | Auth, Postgres database, RLS, hosted APIs |
| Database | Supabase Postgres | Structured app data and relationships |
| Auth | Supabase Auth | Email/password auth and browser sessions |
| Authorization | Supabase Row Level Security | User-owned data access rules |
| AI | OpenAI API | Planned itinerary, recommendation, assistant features |
| Deployment | Static frontend hosting + Supabase | Planned production deployment |

## Frontend

React + Vite + Tailwind CSS app lives in `client/`.

Planned/current routes:

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/planner`
- `/destinations`
- `/budget`
- `/my-trips`
- `/assistant`
- `/profile`
- `/admin`

Frontend data access flow:

```txt
Pages → Hooks → Supabase service functions → Supabase Auth/Postgres
```

## Supabase Responsibilities

Supabase replaces the previous Express/Mongo backend for the current app data layer.

- Email/password registration and login
- Browser session management
- `profiles` rows linked to Auth users
- `trips`, `destinations`, `budgets`, and `saved_trips` data
- Row Level Security for user-owned data
- Hosted Postgres REST API via `@supabase/supabase-js`

## Database Tables

- `profiles`
- `trips`
- `destinations`
- `budgets`
- `saved_trips`

Schema and policies are stored in `supabase/schema.sql`.

## Authentication

```txt
Register/Login → Supabase Auth session → React protected routes → Supabase RLS protects data
```

## AI Plan

AI features are still planned for later milestones. OpenAI keys must not be exposed in the frontend. When AI is implemented, use a secure server-side runtime such as Supabase Edge Functions or another backend function layer.

## Environment Variables

Client:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

`VITE_SUPABASE_PUBLISHABLE_KEY` is also supported for Supabase projects that provide publishable keys.

## Security Planning

- Supabase anon/publishable key is allowed in frontend; database access is protected by RLS.
- Service role keys must never be committed or exposed in frontend code.
- OpenAI API keys must stay server-side in a future secure function layer.
- User-owned tables use `auth.uid()` RLS policies.
