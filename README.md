# TravelAI Planner

TravelAI Planner ek production-quality AI SaaS web application hai jo users ko personalized travel itineraries, destination discovery, travel budget planning, AI travel assistant, saved trips, user profiles, aur admin operations provide karega.

> **Current Milestone:** Milestone 3 — Authentication & User Profiles  
> **Important:** Is milestone mein real authentication foundation add hua hai: register, login, logout, protected routes, HttpOnly JWT cookie session, MongoDB-backed user model, and basic profile management. AI, trip CRUD, budget logic, saved trips persistence, and admin analytics abhi implement nahi hue.

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

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose for user auth foundation |
| Authentication | JWT in HttpOnly cookie |
| Password Security | bcryptjs password hashing |
| Validation | Zod |
| AI | OpenAI API planned for later milestone |
| Deployment | Render planned for later milestone |

## Current Features

### Milestone 2 App Shell

- React + Vite client
- Tailwind CSS
- React Router routes
- Public/auth/dashboard/admin layouts
- Express app shell
- Health endpoint

### Milestone 3 Auth Foundation

- User registration
- User login
- User logout
- Current user endpoint
- MongoDB-backed User model
- Password hashing
- HttpOnly JWT cookie
- Protected backend middleware
- Protected frontend routes
- Public-only auth routes
- Basic admin route guard
- User profile view/update
- Travel preferences update

## Folder Structure

```txt
travel/
├── client/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── store/
│       └── styles/
├── server/
│   ├── package.json
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
├── scripts/
└── .github/workflows/
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

```bash
npm install
npm install --prefix client
npm install --prefix server
```

## Environment Setup

Copy example env files:

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
MONGO_URI=mongodb://127.0.0.1:27017/travelai_planner
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=7d
JWT_COOKIE_NAME=travelai_token
```

MongoDB local ya MongoDB Atlas available hona chahiye before running the backend.

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

## Auth API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login and set HttpOnly cookie |
| POST | `/api/auth/logout` | Clear auth cookie |
| GET | `/api/auth/me` | Get current authenticated user |
| GET | `/api/users/profile` | Get user profile |
| PATCH | `/api/users/profile` | Update name and preferences |
| PATCH | `/api/users/preferences` | Update travel preferences |

## Frontend Routes

Public:

- `/`
- `/login`
- `/register`

Protected user routes:

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
| Milestone 2 | Project initialization and app shell | Complete |
| Milestone 3 | Authentication and user profiles | Current |
| Milestone 4 | Trip and destination data layer | Planned |
| Milestone 5 | AI itinerary generation | Planned |
| Milestone 6 | Budget planner and recommendations | Planned |
| Milestone 7 | Dashboard and saved trips experience | Planned |
| Milestone 8 | Admin dashboard and SaaS controls | Planned |
| Milestone 9 | Testing, security, production hardening | Planned |
| Milestone 10 | Render deployment and release | Planned |

## Out of Scope for Milestone 3

- OpenAI API integration
- Trip CRUD APIs
- Destination CRUD APIs
- Budget calculation logic
- Saved trips persistence
- Admin analytics logic
- Refresh token rotation
- Password reset/email verification
- Payment or subscription implementation

## Git Details

Recommended branch:

```bash
milestone-3-auth-profiles
```

Recommended commit message:

```bash
git commit -m "feat: add milestone 3 authentication and profiles"
```
