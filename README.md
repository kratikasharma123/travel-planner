# TravelAI Planner

TravelAI Planner ek production-quality AI SaaS web application hai jo users ko personalized travel itineraries, destination discovery, travel budget planning, saved trips, user profiles, aur admin operations provide karega.

> **Current Milestone:** Milestone 4 — Supabase Trip Data Layer  
> **Important:** Project ab Express/Mongo backend ki jagah Supabase Auth + Supabase Postgres use karta hai. AI itinerary generation, OpenAI integration, advanced budget estimation, dashboard polish, and admin analytics abhi implement nahi hue.

## Project Overview

Travel planning normally multiple tabs, websites, notes, budget calculations, aur manual research require karta hai. TravelAI Planner is process ko simplify karega by combining AI itinerary generation, destination recommendations, budget planning, saved trips, and assistant-style follow-up support in one SaaS platform.

## Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Frontend       | React, Vite, Tailwind CSS, React Router             |
| Backend/BaaS   | Supabase                                            |
| Database       | Supabase Postgres                                   |
| Authentication | Supabase Auth                                       |
| Authorization  | Supabase Row Level Security                         |
| AI             | OpenAI API planned for later milestone              |
| Deployment     | Static frontend hosting planned for later milestone |

## Current Features

### Milestone 1

- Product discovery and PRD summary
- Roadmap, features, user flow, architecture, UI/UX, design system docs

### Milestone 2

- React + Vite client shell
- Tailwind CSS
- React Router routes
- Frontend app shell

### Milestone 3

- Supabase Auth registration/login/logout
- Session-backed protected frontend routes
- User profile and preferences via Supabase `profiles` table

### Milestone 4

- Trip table and user-owned trip create/list/update/archive flows
- Destination table, reusable seed data, filters, images, and active destination reads
- Budget table with manual save, reload, and delete/reset flows
- Saved trip table with save/list/update metadata/remove flows
- Supabase RLS ownership rules
- Minimal My Trips, Destinations, Saved Trips, and Budget frontend data UI

## Installation

```bash
npm install
npm install --prefix client
```

## Environment Setup

Copy the client example env file:

```bash
cp client/.env.example client/.env
```

Client env:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

If your Supabase project gives a publishable key, `VITE_SUPABASE_PUBLISHABLE_KEY` is also supported by the app.

### AI Trip Generation Setup

AI trip generation runs in a Supabase Edge Function so the Gemini key is never exposed to the browser.

Set the secrets in Supabase:

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
supabase secrets set GEMINI_MODEL=gemini-1.5-flash
supabase secrets set AI_DAILY_LIMIT=100
```

For local Edge Function testing, also provide Supabase function env values (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `GEMINI_API_KEY`) in your local function env file, then run:

```bash
supabase functions serve generate-ai-trip --env-file ./supabase/.env.local
```

Deploy the function:

```bash
supabase functions deploy generate-ai-trip
```

Do not put `GEMINI_API_KEY` or any private AI key in `client/.env`; only browser-safe `VITE_*` values belong there.

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run the SQL from `supabase/schema.sql`.
4. Run `supabase/seed.sql` to add dummy destination cards with images.
5. Put your Supabase URL and anon/publishable key in `client/.env`.

## Run the App

```bash
npm run dev
```

Frontend:

```txt
http://localhost:5173
```

## Supabase Data Model

| Table          | Purpose                                                                          |
| -------------- | -------------------------------------------------------------------------------- |
| `profiles`     | User profile, role, status, and travel preferences linked to Supabase Auth users |
| `destinations` | Destination discovery records                                                    |
| `trips`        | User-created travel plans                                                        |
| `budgets`      | Trip-level manual budget categories and totals                                   |
| `saved_trips`  | User saved/organized trip references                                             |

RLS policies in `supabase/schema.sql` make profiles, trips, budgets, and saved trips user-owned. Authenticated users can read active destinations.

## Frontend Routes

Public:

- `/`
- `/login`
- `/register`

Protected:

- `/dashboard`
- `/planner`
- `/destinations`
- `/budget`
- `/my-trips`
- `/assistant`
- `/profile`

Admin guarded placeholder:

- `/admin`

## Scripts

```bash
npm run dev
npm run dev:client
npm run build
npm run lint
npm run test
npm run test:e2e
npm run audit
npm run format
npm run format:check
```

## Admin, Testing, and Deployment Readiness

- Admin setup and manual Super Admin bootstrap: [docs/ADMIN.md](docs/ADMIN.md)
- Testing commands and QA checklist: [docs/TESTING.md](docs/TESTING.md)
- Deployment readiness without live deployment: [docs/DEPLOYMENT_READINESS.md](docs/DEPLOYMENT_READINESS.md)
- Backup and recovery procedures: [docs/BACKUP_RECOVERY.md](docs/BACKUP_RECOVERY.md)

## Roadmap

| Milestone    | Focus                                                   | Status                 |
| ------------ | ------------------------------------------------------- | ---------------------- |
| Milestone 1  | Discovery, planning, UI/UX, architecture, documentation | Complete               |
| Milestone 2  | Project initialization and app shell                    | Complete               |
| Milestone 3  | Authentication and user profiles                        | Complete with Supabase |
| Milestone 4  | Trip data layer                                         | Complete with Supabase |
| Milestone 5  | AI itinerary generation                                 | Planned                |
| Milestone 6  | Budget planner and recommendations                      | Planned                |
| Milestone 7  | Dashboard and saved trips experience                    | Planned                |
| Milestone 8  | AI assistant and destination discovery                  | Planned                |
| Milestone 9  | Admin dashboard and SaaS controls                       | Planned                |
| Milestone 10 | Testing, security, and deployment                       | Planned                |

## Out of Scope for Current Version

- OpenAI API integration
- AI-generated itinerary endpoint
- Advanced budget estimation algorithm
- Polished trip detail UI
- Admin analytics
- Payment or subscription implementation
