# Project Structure — TravelAI Planner

Ye document TravelAI Planner ke current React + Supabase folder structure ko define karta hai.

## Current GitHub Folder Structure

```txt
TravelAI-Planner/
├── client/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── store/
│       ├── styles/
│       └── utils/
├── supabase/
│   └── schema.sql
├── docs/
├── assets/
├── scripts/
├── .gitignore
└── README.md
```

## Root Level

| Path | Purpose |
|---|---|
| `README.md` | Project overview, setup, roadmap, and documentation index |
| `.gitignore` | Ignore dependencies, build outputs, env files, logs, editor files |
| `docs/` | Product, UX, architecture, database, API, and milestone documentation |
| `supabase/schema.sql` | Supabase tables, triggers, indexes, and RLS policies |
| `assets/` | Non-code brand assets and planning wireframes |
| `scripts/` | Future automation scripts |

## Client Structure

`client/` React + Vite frontend ke liye hai.

| Path | Purpose |
|---|---|
| `client/src/assets/` | UI images, icons, illustrations, logo files |
| `client/src/components/` | Reusable presentational components |
| `client/src/hooks/` | Custom React hooks like `useAuth`, `useTrips`, `useBudget` |
| `client/src/layouts/` | Page shells like PublicLayout, AuthLayout, DashboardLayout |
| `client/src/pages/` | Route-level pages like Landing, Login, Dashboard, MyTrips |
| `client/src/routes/` | Route definitions and protected route guards |
| `client/src/services/` | Supabase client and data service functions |
| `client/src/store/` | Global state/context such as AuthProvider |
| `client/src/styles/` | Tailwind/global styles and design tokens |
| `client/src/utils/` | Frontend utility functions |

## Supabase Structure

| Path | Purpose |
|---|---|
| `supabase/schema.sql` | SQL to create `profiles`, `destinations`, `trips`, `budgets`, `saved_trips`, triggers, indexes, and RLS policies |

## Docs Structure

| File | Purpose |
|---|---|
| `docs/PRD_SUMMARY.md` | Product requirements summary |
| `docs/PROJECT_ROADMAP.md` | Milestone-wise roadmap |
| `docs/MILESTONES.md` | Milestone scope and completion criteria |
| `docs/TECH_STACK.md` | Technical stack |
| `docs/FEATURES.md` | Feature planning and priorities |
| `docs/USER_FLOW.md` | User journeys and flows |
| `docs/DATABASE_PLANNING.md` | Supabase Postgres tables and relationships |
| `docs/API_PLANNING.md` | Supabase service/data access planning |
| `docs/UI_UX_DESIGN.md` | Page-level UI/UX planning |
| `docs/DESIGN_SYSTEM.md` | Visual design system planning |
| `docs/SYSTEM_ARCHITECTURE.md` | Architecture diagrams and component responsibilities |

## Why No `server/` Folder?

The project now uses Supabase as the backend. Supabase provides Auth, Postgres, hosted APIs, and Row Level Security, so the previous Express/Mongo backend source has been removed.

## Future Scalability Notes

- AI features should use Supabase Edge Functions or another secure backend function layer so API keys are not exposed in frontend code.
- `client/src/services/` keeps Supabase queries centralized.
- `supabase/schema.sql` keeps database rules reviewable and reproducible.
