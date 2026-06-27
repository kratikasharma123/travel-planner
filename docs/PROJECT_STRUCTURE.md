# Project Structure — TravelAI Planner

Ye document TravelAI Planner ke professional MERN SaaS folder structure ko define karta hai. Milestone 1 mein folders planning ke liye create kiye gaye hain; production code later milestones mein add hoga.

## Recommended GitHub Folder Structure

```txt
TravelAI-Planner/
├── client/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── features/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── store/
│       ├── styles/
│       └── utils/
├── server/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── validators/
├── docs/
├── assets/
│   ├── brand/
│   └── wireframes/
├── scripts/
├── .github/
│   └── workflows/
├── .gitignore
└── README.md
```

## Root Level

| Path | Purpose |
|---|---|
| `README.md` | Project overview, setup, roadmap, and documentation index |
| `.gitignore` | Ignore dependencies, build outputs, env files, logs, editor files |
| `docs/` | Product, UX, architecture, database, API, and milestone documentation |
| `assets/` | Non-code brand assets and planning wireframes |
| `scripts/` | Future automation scripts |
| `.github/workflows/` | Future CI/CD workflow files |

## Client Structure

`client/` future React + Vite frontend ke liye reserved hai.

| Path | Purpose |
|---|---|
| `client/src/assets/` | UI images, icons, illustrations, logo files |
| `client/src/components/` | Reusable presentational components like Button, Card, Modal |
| `client/src/features/` | Feature-specific modules like trip planner, budget planner, assistant |
| `client/src/hooks/` | Custom React hooks like `useAuth`, `useTrips`, `useBudget` |
| `client/src/layouts/` | Page shells like PublicLayout, AuthLayout, DashboardLayout |
| `client/src/pages/` | Route-level pages like Landing, Login, Dashboard, MyTrips |
| `client/src/routes/` | Route definitions and protected route planning |
| `client/src/services/` | Axios clients and API service functions |
| `client/src/store/` | Global state management planning |
| `client/src/styles/` | Tailwind/global styles and design tokens |
| `client/src/utils/` | Frontend utility functions |

## Server Structure

`server/` future Node.js + Express backend ke liye reserved hai.

| Path | Purpose |
|---|---|
| `server/src/config/` | Environment, database, JWT, OpenAI, app config planning |
| `server/src/controllers/` | Request-response handlers in future implementation |
| `server/src/middleware/` | Auth, validation, error handling, rate limit middleware |
| `server/src/models/` | MongoDB/Mongoose models in future implementation |
| `server/src/routes/` | Express route files in future implementation |
| `server/src/services/` | Business logic, AI service, budget service, trip service |
| `server/src/utils/` | Backend helpers like token, logger, response formatter |
| `server/src/validators/` | Request validation schemas in future implementation |

## Docs Structure

| File | Purpose |
|---|---|
| `docs/PRD_SUMMARY.md` | Product requirements summary |
| `docs/PROJECT_ROADMAP.md` | Milestone-wise roadmap |
| `docs/MILESTONES.md` | Milestone scope and completion criteria |
| `docs/TECH_STACK.md` | Planned technical stack |
| `docs/FEATURES.md` | Feature planning and priorities |
| `docs/USER_FLOW.md` | User journeys and flows |
| `docs/DATABASE_PLANNING.md` | MongoDB collections and relationships planning |
| `docs/API_PLANNING.md` | Future REST API endpoint planning |
| `docs/UI_UX_DESIGN.md` | Page-level UI/UX planning |
| `docs/DESIGN_SYSTEM.md` | Visual design system planning |
| `docs/SYSTEM_ARCHITECTURE.md` | Architecture diagrams and component responsibilities |

## Why Client/Server Naming?

Production MERN projects mein `client/` and `server/` naming clean separation provide karti hai:

- `client/` browser-facing React application
- `server/` backend API and business logic
- Root docs and config project-level concerns ke liye

## Future Scalability Notes

- `features/` frontend ko feature-based architecture support karega.
- `services/` backend and frontend dono mein logic separation maintain karega.
- `validators/` input safety and API consistency ke liye useful hoga.
- `docs/` project decisions ko traceable banayega.

## Milestone 1 Boundary

Ye folders placeholders ke saath create hain. Full React components, Express APIs, database schemas, and business logic later milestones mein implement honge.
