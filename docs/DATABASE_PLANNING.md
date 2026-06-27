# Database Planning — TravelAI Planner

Ye document MongoDB database planning ke liye hai. Milestone 1 mein schemas implement nahi kiye ja rahe; sirf entities, relationships, and data ownership define kiye gaye hain.

## Database Choice

TravelAI Planner MongoDB use karega because travel plans, AI outputs, user preferences, and assistant conversations semi-structured ho sakte hain. MongoDB flexible documents ke liye suitable hai.

## Planned Collections

| Collection | Purpose |
|---|---|
| Users | Account, authentication identity, preferences, role |
| Trips | User-created travel plans and itinerary metadata |
| Destinations | Destination discovery data and recommendation metadata |
| Budgets | Trip-level budget estimates and category breakdowns |
| Saved Trips | User saved/archived trip references and organization |
| AI Conversations | Trip-specific AI assistant chat history |
| AI Requests | AI usage tracking, request metadata, cost monitoring |

## Entity: Users

### Purpose

Platform users ka core account record.

### Planned Data

- Name
- Email
- Password hash in future implementation
- Role: user/admin
- Travel preferences
- Preferred budget range
- Account status
- Created date
- Last login date

### Relationships

```txt
User 1 ──── many Trips
User 1 ──── many Saved Trips
User 1 ──── many AI Conversations
User 1 ──── many AI Requests
```

## Entity: Trips

### Purpose

Generated or manually saved travel plan ka main record.

### Planned Data

- Owner user reference
- Destination reference or custom destination
- Trip title
- Dates or duration
- Traveler count
- Travel style
- Interests
- AI-generated itinerary content
- Trip status: draft/saved/archived
- Created and updated dates

### Relationships

```txt
Trip many ──── 1 User
Trip 1 ──── 1 Budget
Trip 1 ──── many AI Conversations
Trip many ──── 1 Destination optional
```

## Entity: Destinations

### Purpose

Destination Discovery feature ke liye curated or AI-assisted destination information.

### Planned Data

- Name
- Country/region
- Description
- Best time to visit
- Estimated cost level
- Tags/interests
- Popular attractions
- Safety/family suitability notes
- Image metadata or placeholder

### Relationships

```txt
Destination 1 ──── many Trips
Destination 1 ──── many recommendation results
```

## Entity: Budgets

### Purpose

Trip ke cost estimate ko category-wise store karna.

### Planned Data

- Trip reference
- User reference
- Currency
- Accommodation estimate
- Food estimate
- Transport estimate
- Activities estimate
- Miscellaneous estimate
- Emergency buffer
- Total estimate
- Budget confidence level

### Relationships

```txt
Budget many ──── 1 User
Budget 1 ──── 1 Trip
```

## Entity: Saved Trips

### Purpose

User ke saved/organized travel plans ko manage karna. Ye trips ke around user-specific saved state maintain karega.

### Planned Data

- User reference
- Trip reference
- Saved title
- Notes
- Tags
- Folder/category optional
- Saved date

### Relationships

```txt
Saved Trip many ──── 1 User
Saved Trip many ──── 1 Trip
```

## Entity: AI Conversations

### Purpose

AI Travel Assistant ke chat sessions store karna, especially trip-specific context ke saath.

### Planned Data

- User reference
- Trip reference optional
- Conversation title
- Messages
- AI model metadata
- Created and updated dates

### Relationships

```txt
AI Conversation many ──── 1 User
AI Conversation many ──── 1 Trip optional
```

## Entity: AI Requests

### Purpose

AI usage, monitoring, rate limits, and SaaS usage tracking ke liye metadata.

### Planned Data

- User reference
- Request type: itinerary/destination/budget/chat
- Token usage estimate in future
- Status: success/failed
- Error category optional
- Created date

### Relationships

```txt
AI Request many ──── 1 User
AI Request many ──── 1 Trip optional
```

## Relationship Diagram

```txt
+---------+        +--------+        +----------+
| Users   | 1    * | Trips  | 1    1 | Budgets  |
+---------+--------+--------+--------+----------+
     |                 |
     |                 | *
     |                 |
     |            +--------------+
     |            | Destinations |
     |            +--------------+
     |
     | 1    * +-------------+
     +--------| SavedTrips  |
     |        +-------------+
     |
     | 1    * +------------------+
     +--------| AI Conversations |
     |        +------------------+
     |
     | 1    * +-------------+
     +--------| AI Requests |
              +-------------+
```

## Data Ownership Rules

- Har trip ek user se linked hoga.
- User sirf apne trips dekh paayega.
- Admin aggregate metrics dekh paayega.
- AI conversations user-owned honge.
- AI API secrets database mein store nahi honge.

## Index Planning

Future implementation mein likely indexes:

| Collection | Index Need |
|---|---|
| Users | email unique |
| Trips | userId, destination, status, createdAt |
| Saved Trips | userId + tripId |
| AI Conversations | userId, tripId |
| AI Requests | userId, requestType, createdAt |
| Destinations | tags, region, costLevel |

## Security Planning

- Password plain text kabhi store nahi hoga.
- User-owned records access control ke through protect honge.
- Admin data access role-based hoga.
- AI conversations may contain sensitive travel preferences, so access strictly user-scoped hoga.

## Milestone 1 Boundary

Is document mein schemas, Mongoose models, indexes, ya database connection code implement nahi kiya gaya hai. Ye sirf architecture-level planning hai.
