# Database Planning — TravelAI Planner

Ye document TravelAI Planner ke current Supabase Postgres database plan ko define karta hai.

## Database Choice

TravelAI Planner ab Supabase Postgres use karta hai. Supabase Auth identity manage karta hai, Postgres relational app data store karta hai, aur Row Level Security user-owned access enforce karti hai.

## Current Tables

| Table | Purpose |
|---|---|
| `profiles` | Account profile, role, status, preferences linked to `auth.users` |
| `trips` | User-created travel plans and itinerary metadata |
| `destinations` | Destination discovery data and recommendation metadata |
| `budgets` | Trip-level budget estimates and category breakdowns |
| `saved_trips` | User saved/organized trip references |

Future AI tables may include `ai_conversations` and `ai_requests`.

## Entity: Profiles

### Purpose

Supabase Auth user ka app-level profile record.

### Data

- `id` references `auth.users(id)`
- `name`
- `role`: user/admin
- `status`: active/disabled
- `travel_preferences` JSON
- `last_login_at`
- timestamps

## Entity: Trips

### Purpose

Generated ya manually saved travel plan ka main record.

### Data

- Owner `user_id`
- Optional `destination_id`
- `custom_destination` JSON
- Title
- Dates or duration
- Traveler count
- Travel style
- Interests
- Notes
- Status: draft/saved/archived
- timestamps

## Entity: Destinations

### Purpose

Destination Discovery feature ke liye curated destination information.

### Data

- Name
- Country/region
- Description
- Best time to visit
- Cost level
- Tags/interests
- Popular attractions
- Safety/family suitability notes
- Image URL
- Status

## Entity: Budgets

### Purpose

Trip ke cost estimate ko category-wise store karna.

### Data

- Owner `user_id`
- `trip_id`
- Currency
- Category estimates JSON
- Total estimate
- Confidence level
- Notes

## Entity: Saved Trips

### Purpose

User ke saved/organized travel plans ko manage karna.

### Data

- Owner `user_id`
- `trip_id`
- Saved title
- Notes
- Tags
- Folder/category optional
- Saved date

## Relationship Diagram

```txt
auth.users 1 ──── 1 profiles
     |
     | 1
     |      *
     +──────── trips ──────── * destinations optional
     |          |
     |          | 1
     |          | 1
     |       budgets
     |
     | 1
     |      *
     +──────── saved_trips ─── * trips
```

## Ownership and RLS Rules

- Users can select/update only their own `profiles` row.
- Users can create/read/update/delete only their own `trips`.
- Users can create/read/update/delete only their own `budgets` for trips they own.
- Users can create/read/update/delete only their own `saved_trips` for trips they own.
- Authenticated users can read active `destinations`.
- Service role keys are not used in frontend code.

## Schema Source

The executable schema, indexes, triggers, and RLS policies live in:

```txt
supabase/schema.sql
```

Dummy destination records with image URLs live in:

```txt
supabase/seed.sql
```
