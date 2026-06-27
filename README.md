# TravelAI Planner

TravelAI Planner ek production-quality AI SaaS web application hai jo users ko personalized travel itineraries, destination discovery, travel budget planning, AI travel assistant, saved trips, user profiles, aur admin operations provide karega.

> **Current Milestone:** Milestone 2 — Project Initialization & App Shell  
> **Important:** Is milestone mein runnable React + Vite client shell aur Express server shell add hua hai. Full authentication, database, AI integration, trip CRUD, budget logic, and admin analytics abhi implement nahi hue.

## Project Overview

Travel planning normally multiple tabs, websites, notes, budget calculations, aur manual research require karta hai. TravelAI Planner is process ko simplify karega by combining AI itinerary generation, destination recommendations, budget planning, saved trips, and assistant-style follow-up support in one SaaS platform.

## Target Users

| User Type | Primary Need |
|---|---|
| Solo Travelers | Fast personalized itinerary, safety tips, budget control |
| Families | Family-friendly plans, comfortable pace, budget visibility |
| Couples | Romantic destinations, curated experiences, trip saving |
| Business Travelers | Efficient schedule, quick recommendations, short-trip planning |
| Travel Agencies | Faster itinerary drafts, client-specific recommendations |

## Core Features Planned

- AI Trip Planner
- Destination Discovery
- Budget Planner
- AI Travel Assistant
- Saved Trips
- User Profiles
- Admin Dashboard
- SaaS-ready account and usage planning

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB planned for later milestone |
| Authentication | JWT planned for later milestone |
| AI | OpenAI API planned for later milestone |
| Deployment | Render planned for later milestone |

## Folder Structure

```txt
travel/
├── client/                  # React + Vite frontend app shell
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── assets/          # Frontend images, icons, illustrations
│       ├── components/      # Reusable UI shell components
│       ├── features/        # Future feature-based modules
│       ├── hooks/           # Future custom React hooks
│       ├── layouts/         # Public, auth, dashboard, admin layouts
│       ├── pages/           # Route-level placeholder pages
│       ├── routes/          # React Router route definitions
│       ├── services/        # Axios API client
│       ├── store/           # Future global state planning
│       ├── styles/          # Tailwind/global styles
│       └── utils/           # Future frontend utilities
├── server/                  # Express backend app shell
│   ├── package.json
│   └── src/
│       ├── config/          # Environment config
│       ├── controllers/     # Health controller only for Milestone 2
│       ├── middleware/      # Error and not-found middleware
│       ├── models/          # Future MongoDB models
│       ├── routes/          # Health route only for Milestone 2
│       ├── services/        # Future business and AI service layer
│       ├── utils/           # Response helpers
│       └── validators/      # Future request validation
├── docs/                    # Product, UX, architecture, API, DB docs
├── assets/                  # Brand and wireframe planning assets
├── scripts/                 # Future automation scripts
└── .github/workflows/       # Future CI/CD workflows
```

## Documentation Index

- [Project Roadmap](docs/PROJECT_ROADMAP.md)
- [Features](docs/FEATURES.md)
- [User Flow](docs/USER_FLOW.md)
- [Database Planning](docs/DATABASE_PLANNING.md)
- [API Planning](docs/API_PLANNING.md)
- [Project Structure](docs/PROJECT_STRUCTURE.md)
- [UI/UX Design Plan](docs/UI_UX_DESIGN.md)
- [Design System](docs/DESIGN_SYSTEM.md)
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Tech Stack](docs/TECH_STACK.md)
- [Milestones](docs/MILESTONES.md)
- [PRD Summary](docs/PRD_SUMMARY.md)

## Installation

Root dependencies:

```bash
npm install
```

Client dependencies:

```bash
npm install --prefix client
```

Server dependencies:

```bash
npm install --prefix server
```

## Environment Setup

Copy example env files before local development:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Client env:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Server env:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
```

## Run the App

Run client and server together:

```bash
npm run dev
```

Run only frontend:

```bash
npm run dev:client
```

Run only backend:

```bash
npm run dev:server
```

## Verification URLs

Frontend:

```txt
http://localhost:5173
```

Server health endpoint:

```txt
http://localhost:5000/api/health
```

## Available Routes in Milestone 2

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

These routes render placeholder pages only. Real feature logic comes in later milestones.

## Scripts

```bash
npm run dev
npm run dev:client
npm run dev:server
npm run build
npm run lint
npm run format
npm run format:check
```

## Roadmap

| Milestone | Focus | Status |
|---|---|---|
| Milestone 1 | Discovery, planning, UI/UX, architecture, documentation | Complete |
| Milestone 2 | Project initialization and app shell | Current |
| Milestone 3 | Authentication and user profiles | Planned |
| Milestone 4 | Trip and destination data layer | Planned |
| Milestone 5 | AI itinerary generation | Planned |
| Milestone 6 | Budget planner and recommendations | Planned |
| Milestone 7 | Dashboard and saved trips experience | Planned |
| Milestone 8 | Admin dashboard and SaaS controls | Planned |
| Milestone 9 | Testing, security, production hardening | Planned |
| Milestone 10 | Render deployment and release | Planned |

## Milestone 2 Deliverables

- React + Vite client initialized
- Tailwind CSS configured
- React Router app routes created
- Public, auth, dashboard, and admin layouts created
- Placeholder pages for planned product screens
- Axios base client created
- Express server initialized
- `GET /api/health` endpoint created
- Environment example files added
- Root scripts, lint, and formatting setup added

## Out of Scope for Milestone 2

- JWT authentication implementation
- MongoDB connection or schemas
- OpenAI API integration
- Trip CRUD APIs
- Budget calculation logic
- Saved trips persistence
- Admin analytics logic
- Payment or subscription implementation

## Git Details

Recommended branch:

```bash
milestone-2-app-shell
```

Recommended commit message:

```bash
git commit -m "chore: initialize milestone 2 app shell"
```
