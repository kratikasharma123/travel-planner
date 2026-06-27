# System Architecture — TravelAI Planner

Ye document TravelAI Planner ka high-level architecture define karta hai. Milestone 1 mein architecture plan kiya ja raha hai; code implementation later milestones mein hogi.

## Architecture Overview

TravelAI Planner separated frontend/backend MERN architecture follow karega. Frontend user experience handle karega, backend business logic and secure integrations handle karega, MongoDB data persist karega, aur OpenAI API AI recommendations generate karegi.

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
          | HTTPS REST API
          v
+-------------------+
| Node + Express    |
| API Server        |
+----+---------+----+
     |         |
     |         |
     v         v
+---------+   +----------------+
| MongoDB |   | OpenAI API     |
| Atlas   |   | AI Generation  |
+---------+   +----------------+
```

## Frontend Architecture

### Responsibilities

- Landing page and marketing UX
- Authentication screens
- Dashboard and navigation
- AI planner form
- Destination discovery interface
- Budget planner interface
- Saved trips UI
- AI assistant chat UI
- Profile and admin pages
- API communication through Axios

### Planned Frontend Flow

```txt
Pages → Components → Hooks/Services → Backend API
```

### Frontend Security Rule

AI API key, JWT secret, database URL, and other secrets frontend mein expose nahi honge.

## Backend Architecture

### Responsibilities

- REST API endpoints
- Authentication and authorization
- User, trip, destination, budget, saved trip operations
- AI prompt orchestration
- OpenAI API communication
- Input validation
- Error handling
- Usage tracking

### Planned Backend Layers

```txt
Routes
  ↓
Middleware
  ↓
Controllers
  ↓
Services
  ↓
Models / External APIs
```

## Database Architecture

### MongoDB Responsibilities

- User records
- Trip records
- Destination records
- Budget estimates
- Saved trip mappings
- AI conversation history
- AI request usage logs

```txt
MongoDB Collections
├── users
├── trips
├── destinations
├── budgets
├── savedTrips
├── aiConversations
└── aiRequests
```

## AI Service Architecture

OpenAI API calls backend service layer se honge.

```txt
User Input
  ↓
Frontend Form
  ↓
Backend Validation
  ↓
AI Prompt Builder
  ↓
OpenAI API
  ↓
Response Normalizer
  ↓
Frontend Result UI
```

### AI Safety Planning

- Prompt templates controlled by backend
- User input validated before AI call
- AI response normalized before storing/displaying
- AI failures handled with retry/error UX
- Usage tracked for SaaS limits

## Authentication Architecture

JWT-based auth planned hai.

```txt
Register/Login
  ↓
Backend validates credentials
  ↓
JWT generated
  ↓
Frontend stores session token according to final security strategy
  ↓
Protected API requests send token
  ↓
Backend middleware verifies token
  ↓
Controller returns user-scoped data
```

## Authorization Planning

| Role | Access |
|---|---|
| Guest | Landing, login, register, public destination preview |
| User | Dashboard, planner, budget, saved trips, assistant, profile |
| Admin | Admin dashboard, platform usage, user/trip overview |

## Deployment Architecture on Render

```txt
GitHub Repository
      ↓
Render Frontend Service / Static Site
      ↓
React App served to users

GitHub Repository
      ↓
Render Backend Web Service
      ↓
Express API connects to MongoDB Atlas and OpenAI

MongoDB Atlas
      ↑
Backend only

OpenAI API
      ↑
Backend only
```

## Environment Planning

Future deployment will need:

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Runtime environment |
| `PORT` | Backend server port |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing secret |
| `OPENAI_API_KEY` | OpenAI API access |
| `CLIENT_URL` | Frontend URL for CORS |

## Request Lifecycle Example

```txt
User clicks Generate Itinerary
  ↓
React sends POST /api/ai/itinerary
  ↓
Express auth middleware verifies JWT
  ↓
Validation checks request body
  ↓
AI service builds prompt
  ↓
OpenAI returns itinerary
  ↓
Backend formats response
  ↓
Trip optionally saved in MongoDB
  ↓
React displays itinerary cards
```

## Non-Functional Requirements Planning

| Area | Plan |
|---|---|
| Security | JWT, validation, rate limiting, no frontend secrets |
| Scalability | Separate client/server, service layer, usage tracking |
| Reliability | Consistent error response, retries for AI failure planning |
| Maintainability | Feature-based frontend, layered backend |
| Performance | Lazy loading pages, optimized API responses in future |
| Observability | AI request logs, error logs, admin usage metrics |

## Milestone 1 Boundary

No architecture code, deployment config, routes, or services are implemented in this milestone. Ye document future implementation ko guide karega.
