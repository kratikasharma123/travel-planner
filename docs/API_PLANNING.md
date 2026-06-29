# API Planning — TravelAI Planner

Ye document current Supabase-based data access surface ko describe karta hai. Custom Express REST APIs remove kar diye gaye hain; frontend Supabase client ke through Auth and Postgres tables access karta hai.

## Data Access Principles

- Supabase Auth handles login/register/logout/session.
- Supabase Postgres stores app data.
- Row Level Security protects user-owned rows.
- Frontend service modules keep page/hook code clean.
- AI API calls must use a future secure server-side function layer, not direct browser calls.

## Supabase Client Setup

Environment:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

Client entry point:

```txt
client/src/services/supabaseClient.js
```

## Auth Operations

| Service Function | Supabase Operation | Access |
|---|---|---|
| `register` | `supabase.auth.signUp` | Public |
| `login` | `supabase.auth.signInWithPassword` | Public |
| `logout` | `supabase.auth.signOut` | Authenticated |
| `getCurrentUser` | `supabase.auth.getSession/getUser` + `profiles` select | Authenticated |

## Profile Operations

| Service Function | Table | Purpose | Access |
|---|---|---|---|
| `getProfile` | `profiles` | Current user profile get karna | Own row |
| `updateProfile` | `profiles` | Name/preferences update karna | Own row |
| `updatePreferences` | `profiles` | Travel preferences update karna | Own row |

## Trip Operations

| Service Function | Table | Purpose | Access |
|---|---|---|---|
| `listTrips` | `trips` | User ke trips list karna | Own rows |
| `createTrip` | `trips` | New trip create karna | Own row |
| `getTrip` | `trips` | Single trip detail fetch karna | Own row |
| `updateTrip` | `trips` | Trip update karna | Own row |
| `archiveTrip` | `trips` | Trip status archived karna | Own row |

## Destination Operations

| Service Function | Table | Purpose | Access |
|---|---|---|---|
| `listDestinations` | `destinations` | Active destinations list/filter karna | Authenticated |
| `getDestination` | `destinations` | Active destination detail fetch karna | Authenticated |

## Budget Operations

| Service Function | Table | Purpose | Access |
|---|---|---|---|
| `getBudget` | `budgets` | Own trip budget fetch karna | Own row |
| `updateBudget` | `budgets` | Own trip budget upsert karna | Own row |
| `deleteBudget` | `budgets` | Own budget delete karna | Own row |

## Saved Trip Operations

| Service Function | Table | Purpose | Access |
|---|---|---|---|
| `listSavedTrips` | `saved_trips` | Saved trips list fetch karna | Own rows |
| `saveTrip` | `saved_trips` | Own trip save karna | Own row |
| `updateSavedTrip` | `saved_trips` | Saved trip metadata update karna | Own row |
| `removeSavedTrip` | `saved_trips` | Saved trip remove karna | Own row |

## Future AI APIs

AI features should be implemented later via Supabase Edge Functions or another secure backend function layer.

Planned operations:

- Generate itinerary
- Destination suggestions
- Trip refinement
- Assistant chat
- AI usage tracking

## Error Shape

Supabase service errors are normalized in frontend services to keep existing UI fallback logic working:

```js
apiError?.response?.data?.message
```

## Schema Source

Executable table definitions and RLS policies:

```txt
supabase/schema.sql
```
