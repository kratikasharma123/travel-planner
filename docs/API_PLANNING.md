# API Planning — TravelAI Planner

Ye document future REST API surface plan karta hai. Milestone 1 mein koi API implement nahi ki ja rahi. Endpoints sirf planning ke liye list kiye gaye hain.

## API Principles

- RESTful endpoints use honge.
- Protected routes JWT authentication require karenge.
- Admin routes role-based authorization require karenge.
- AI API calls backend se honge, frontend se direct nahi.
- All API responses consistent format follow karenge in future implementation.

## Base URL Planning

```txt
Development: http://localhost:5000/api
Production:  https://travelai-planner-api.onrender.com/api
```

## Authentication APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/auth/register` | New user register karna | Public |
| POST | `/api/auth/login` | User login karna | Public |
| POST | `/api/auth/logout` | User logout/session cleanup | Private |
| GET | `/api/auth/me` | Current logged-in user fetch karna | Private |
| POST | `/api/auth/refresh` | Token refresh planning | Private |

## User Profile APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/users/profile` | User profile get karna | Private |
| PATCH | `/api/users/profile` | Profile update karna | Private |
| PATCH | `/api/users/preferences` | Travel preferences update karna | Private |
| DELETE | `/api/users/account` | Account delete request | Private |

## Trip APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/trips` | User ke trips list karna | Private |
| POST | `/api/trips` | New trip create/save karna | Private |
| GET | `/api/trips/:tripId` | Single trip detail fetch karna | Private |
| PATCH | `/api/trips/:tripId` | Trip update karna | Private |
| DELETE | `/api/trips/:tripId` | Trip delete/archive karna | Private |

## AI Trip Planner APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/ai/itinerary` | AI itinerary generate karna | Private |
| POST | `/api/ai/destination-suggestions` | AI destination recommendations generate karna | Private |
| POST | `/api/ai/trip-refine` | Existing itinerary refine karna | Private |
| GET | `/api/ai/requests` | User AI request history | Private |

## Destination APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/destinations` | Destination list/filter fetch karna | Public/Private planned |
| GET | `/api/destinations/:destinationId` | Destination detail fetch karna | Public/Private planned |
| GET | `/api/destinations/popular` | Popular destinations fetch karna | Public |
| POST | `/api/destinations` | Destination create karna | Admin |
| PATCH | `/api/destinations/:destinationId` | Destination update karna | Admin |
| DELETE | `/api/destinations/:destinationId` | Destination remove/archive karna | Admin |

## Budget APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/budgets/estimate` | Trip budget estimate generate karna | Private |
| GET | `/api/budgets/:tripId` | Trip budget fetch karna | Private |
| PATCH | `/api/budgets/:budgetId` | Budget assumptions update karna | Private |
| DELETE | `/api/budgets/:budgetId` | Budget delete karna | Private |

## Saved Trip APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/saved-trips` | Saved trips list fetch karna | Private |
| POST | `/api/saved-trips` | Trip save karna | Private |
| PATCH | `/api/saved-trips/:savedTripId` | Saved trip note/tags update karna | Private |
| DELETE | `/api/saved-trips/:savedTripId` | Saved trip remove karna | Private |

## AI Assistant Chat APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/ai-conversations` | User conversations list karna | Private |
| POST | `/api/ai-conversations` | New conversation start karna | Private |
| GET | `/api/ai-conversations/:conversationId` | Conversation detail fetch karna | Private |
| POST | `/api/ai-conversations/:conversationId/messages` | Message send and AI reply generate karna | Private |
| DELETE | `/api/ai-conversations/:conversationId` | Conversation delete karna | Private |

## Admin APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/admin/overview` | Admin dashboard metrics | Admin |
| GET | `/api/admin/users` | Users list | Admin |
| GET | `/api/admin/trips` | Trips overview | Admin |
| GET | `/api/admin/ai-usage` | AI usage analytics | Admin |
| PATCH | `/api/admin/users/:userId/status` | User status update | Admin |

## System APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/health` | Server health check | Public |
| GET | `/api/version` | API version info | Public |

## Future Response Shape Planning

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {},
  "error": null
}
```

## Future Error Shape Planning

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  }
}
```

## Milestone 1 Boundary

Ye file sirf API planning ke liye hai. No Express routes, controllers, middleware, validation, auth, or business logic is implemented in this milestone.
