# Tech Stack — TravelAI Planner

Ye document TravelAI Planner ke planned production tech stack ko define karta hai. Milestone 1 mein sirf stack planning hai; packages install ya app initialize nahi kiya gaya.

## Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | Interactive SPA UI |
| Build Tool | Vite | Fast dev server and optimized builds |
| Styling | Tailwind CSS | Utility-first responsive design |
| Routing | React Router | Client-side page routing |
| HTTP Client | Axios | Frontend to backend API calls |
| Backend | Node.js | JavaScript runtime for server |
| API Framework | Express.js | REST API layer |
| Database | MongoDB | Flexible document database |
| Auth | JWT | Stateless authentication |
| AI | OpenAI API | Itinerary, recommendation, assistant features |
| Deployment | Render | Hosting frontend/backend services |

## Frontend Plan

### React

React future UI components, pages, state, and interactive product experience ke liye use hoga.

### Vite

Vite fast local development and production build ke liye selected hai.

### Tailwind CSS

Tailwind rapid, consistent, responsive UI build karne ke liye use hoga.

### React Router

Planned routes:

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

### Axios

Axios backend API calls ke liye use hoga, including auth headers and error interceptors in future.

## Backend Plan

### Node.js

Backend JavaScript runtime.

### Express.js

REST APIs ke liye lightweight and flexible framework.

### Planned Backend Responsibilities

- Auth APIs
- User APIs
- Trip APIs
- Budget APIs
- Destination APIs
- AI APIs
- Admin APIs
- Validation and error handling
- Security middleware

## Database Plan

### MongoDB

MongoDB selected hai because AI-generated travel content and preferences flexible structure require karte hain.

### Planned Collections

- users
- trips
- destinations
- budgets
- savedTrips
- aiConversations
- aiRequests

## Authentication Plan

### JWT

JWT user session and protected routes ke liye planned hai.

```txt
Login/Register → JWT issued → Frontend sends token → Backend verifies token
```

## AI Plan

### OpenAI API

OpenAI API backend service layer se call hogi.

### AI Use Cases

- Generate itinerary
- Suggest destinations
- Refine travel plans
- Estimate planning notes
- AI assistant chat

## Deployment Plan

### Render

Render par frontend and backend deploy honge.

```txt
GitHub → Render Frontend Service
GitHub → Render Backend Service
Backend → MongoDB Atlas
Backend → OpenAI API
```

## Security Planning

- Secrets backend environment variables mein rahenge.
- OpenAI key frontend mein expose nahi hogi.
- JWT secret frontend mein expose nahi hoga.
- MongoDB URI frontend mein expose nahi hogi.
- CORS controlled hoga.
- Input validation future implementation mein mandatory hogi.

## Future Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
CLIENT_URL=http://localhost:5173
```

## Milestone 1 Boundary

No package installation, app initialization, API implementation, React code, Express code, or AI integration is done in this milestone.
