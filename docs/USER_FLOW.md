# User Flow — TravelAI Planner

Ye document TravelAI Planner ke complete user journeys ko define karta hai. Milestone 1 mein ye sirf planning hai; actual implementation later milestones mein hogi.

## High-Level Journey

```txt
Guest
  ↓
Landing Page
  ↓
Register / Login
  ↓
Dashboard
  ↓
AI Planner / Destination Discovery / Budget Planner
  ↓
Generated Trip Plan
  ↓
Save Trip
  ↓
My Trips
  ↓
AI Assistant Follow-up
```

## Guest → Register

```txt
Guest lands on homepage
  ↓
Reads value proposition
  ↓
Clicks "Start Planning"
  ↓
Register page opens
  ↓
User enters name, email, password
  ↓
Account created
  ↓
Redirect to dashboard
```

### UX Notes

- Landing page clear CTA show karegi.
- Register form simple and trustworthy hona chahiye.
- Guest ko product value samajh aani chahiye before signup.

## Register → Dashboard

```txt
Registration successful
  ↓
User session created
  ↓
Dashboard opens
  ↓
User sees welcome state
  ↓
Primary CTA: Create New Trip
```

### Dashboard First-Time State

- Welcome card
- “Create your first AI trip” CTA
- Popular destinations teaser
- Budget planner shortcut

## Dashboard → AI Planner

```txt
User clicks "Create New Trip"
  ↓
AI Trip Planner page opens
  ↓
User enters trip preferences
  ↓
User clicks "Generate Itinerary"
  ↓
System processes request
  ↓
Itinerary result displayed
```

### Planner Inputs

- Destination
- Duration
- Travel dates
- Budget
- Travelers
- Travel style
- Interests
- Food preference
- Pace

## Planner → Budget

```txt
Itinerary generated
  ↓
User reviews travel plan
  ↓
User clicks "Estimate Budget"
  ↓
Budget Planner opens with trip context
  ↓
Budget categories displayed
  ↓
User adjusts budget assumptions
```

### Budget UX Notes

- Budget should feel advisory, not exact booking price.
- Clear disclaimer: estimates are approximate.
- Categories should be editable in future.

## Budget → Save Trip

```txt
User reviews budget
  ↓
Clicks "Save Trip"
  ↓
System saves itinerary + budget under user account
  ↓
Success confirmation shown
  ↓
User can open My Trips
```

### Save Trip UX Notes

- Save button should be visible on itinerary and budget pages.
- User should see confirmation toast/modal.
- If not logged in, user should be asked to login/register.

## Saved Trip → AI Assistant

```txt
User opens My Trips
  ↓
Selects saved trip
  ↓
Trip detail page opens
  ↓
User clicks "Ask AI Assistant"
  ↓
Chat opens with trip context
  ↓
User asks follow-up questions
```

### Assistant Example Questions

- “Make this trip cheaper”
- “Add kid-friendly activities”
- “Suggest local food for Day 2”
- “Replace museums with outdoor activities”

## Destination Discovery Flow

```txt
User opens Destination Discovery
  ↓
Selects filters: budget, season, interests
  ↓
Views recommended destination cards
  ↓
Clicks destination
  ↓
Destination detail opens
  ↓
Starts AI planner with destination prefilled
```

## User Profile Flow

```txt
User opens Profile
  ↓
Views account details
  ↓
Updates travel preferences
  ↓
Saves profile
  ↓
Future AI plans use preferences
```

## Admin Flow

```txt
Admin logs in
  ↓
Admin Dashboard opens
  ↓
Views platform metrics
  ↓
Checks users, trips, AI usage
  ↓
Reviews popular destinations and usage trends
```

### Admin Permissions Planning

- Admin routes protected rahenge.
- Normal users admin dashboard access nahi kar paayenge.
- Role-based authorization future implementation mein add hoga.

## Error and Empty States

| Situation | Planned UX |
|---|---|
| No saved trips | Empty state with “Create First Trip” CTA |
| AI request fails | Friendly error + retry button |
| Budget unavailable | Show manual input option |
| User not logged in | Redirect or prompt to login |
| Admin unauthorized | Access denied screen |

## Mobile Journey Notes

- Bottom-friendly CTAs use honge.
- Forms step-wise ho sakte hain.
- Cards stack vertically.
- Chat assistant full-screen mobile layout use karega.
