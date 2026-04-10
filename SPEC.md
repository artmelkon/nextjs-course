# Next Events — Project Specification

## Project Overview

Next Events is a full-stack event browsing application built with Next.js 13 (Pages Router) and TypeScript. Users can browse all events, filter events by year and month, view individual event details, leave comments on events, and subscribe to a newsletter.

### Data Architecture

- **Firebase Realtime Database** — read-only source for all event data. Rules are set to `.read: true, .write: false` (public reads enabled, writes locked).
- **MongoDB** — stores user-generated data only: newsletter email signups and event comments.

---

## Technical Requirements

### Stack

| Layer         | Technology                          |
| ------------- | ----------------------------------- |
| Framework     | Next.js 13.4.19 (Pages Router)      |
| Language      | TypeScript 5.1.6                    |
| UI Library    | React 18.2.0                        |
| Database      | MongoDB 6.x (newsletter, comments)  |
| External API  | Firebase Realtime Database (events) |
| Data Fetching | SWR 2.x (client-side filtered view) |
| Styling       | CSS Modules                         |

### Environment Variables

| Variable  | Description               | Dev Default                  |
| --------- | ------------------------- | ---------------------------- |
| `MONGODB` | MongoDB connection string | `mongodb://localhost/events` |

Environment is set in `next.config.js` per phase — no `.env` file required.

### Node/NPM Scripts

```bash
npm run dev     # Start dev server
npm run build   # Production build
npm run start   # Start production server
npm run lint    # ESLint check
```

---

## Pages & Routing

| Route                    | File                               | Data Strategy                | Description                              |
| ------------------------ | ---------------------------------- | ---------------------------- | ---------------------------------------- |
| `/`                      | `pages/index.tsx`                  | `getStaticProps`             | Home — featured events + newsletter form |
| `/events`                | `pages/events/index.tsx`           | `getStaticProps` + ISR (60s) | All events + search form                 |
| `/events/[eventId]`      | `pages/events/[eventId]/index.tsx` | `getStaticProps` + ISR (5h)  | Single event detail + comments           |
| `/events/[year]/[month]` | `pages/events/[...slug].tsx`       | Client-side (SWR)            | Events filtered by year and month        |

---

## API Endpoints

### `POST /api/newsletter`

Subscribes an email to the newsletter.

#### Request Body

```json
{ "email": "user@example.com" }
```

#### Responses

| Status | Body                                        | Condition                |
| ------ | ------------------------------------------- | ------------------------ |
| 201    | `{ "message": "Success!" }`                 | Email saved to MongoDB   |
| 422    | `{ "message": "Invalid email address!" }`   | Email missing or invalid |
| 500    | `{ "message": "Connection to DB failed!" }` | MongoDB connect error    |
| 500    | `{ "message": "Writing data failed!" }`     | MongoDB insert error     |

---

### `GET /api/comments/[eventId]`

Returns all comments for a specific event, sorted by `_id` descending (newest first).

#### Response

```json
{
  "comments": [
    {
      "_id": "...",
      "email": "...",
      "name": "...",
      "text": "...",
      "eventId": "..."
    }
  ]
}
```

---

### `POST /api/comments/[eventId]`

Adds a new comment to a specific event.

#### Request Body

```json
{ "email": "user@example.com", "name": "John", "text": "Great event!" }
```

#### Response

| Status | Body                                                | Condition              |
| ------ | --------------------------------------------------- | ---------------------- |
| 201    | `{ "message": "Comment added!", "comment": {...} }` | Comment saved          |
| 422    | `{ "message": "Invalid input!" }`                   | Missing/invalid fields |
| 500    | `{ "message": "Connection to DB failed!" }`         | MongoDB connect error  |
| 500    | `{ "message": "Writing data failed!" }`             | MongoDB insert error   |

---

## Database Schema

### MongoDB Database: `events` (default db in connection string)

#### Collection: `newsletter`

| Field   | Type   | Required | Validation       |
| ------- | ------ | -------- | ---------------- |
| `email` | String | Yes      | Must contain `@` |

#### Collection: `comments`

| Field     | Type     | Required | Validation                 |
| --------- | -------- | -------- | -------------------------- |
| `_id`     | ObjectId | Auto     | MongoDB generated          |
| `email`   | String   | Yes      | Must contain `@`           |
| `name`    | String   | Yes      | Non-empty after trim       |
| `text`    | String   | Yes      | Non-empty after trim       |
| `eventId` | String   | Yes      | Matches Firebase event key |

---

## External Data Source

### Firebase Realtime Database

**Base URL:** `https://nextjs-course-6e2ac-default-rtdb.firebaseio.com/events.json`

**Rules:** `.read: true, .write: false` — public reads are required for unauthenticated server-side fetches (`getStaticProps`) and client-side SWR. Writes are permanently locked.

Events are fetched server-side (via `getStaticProps`) or client-side (via SWR on the filtered page). The response is a key-value object that gets transformed into an array with the key as `id`.

#### Event Object Shape

| Field         | Type    | Description                            |
| ------------- | ------- | -------------------------------------- |
| `id`          | String  | Firebase key (e.g., `e1`)              |
| `title`       | String  | Event title                            |
| `description` | String  | Full event description                 |
| `location`    | String  | Street address                         |
| `date`        | String  | ISO date string (e.g., `2021-05-12`)   |
| `image`       | String  | Relative path (e.g., `images/foo.jpg`) |
| `isFeatured`  | Boolean | Whether to show on home page           |

---

## Component Architecture

```
Layout (Header + Notification)
├── pages/index.tsx
│   ├── NewsletterRegistration     — email form → POST /api/newsletter
│   └── EventList → EventItem      — featured events grid
│
├── pages/events/index.tsx
│   ├── Search                     — year/month picker → navigates to /events/[year]/[month]
│   └── EventList → EventItem
│
├── pages/events/[eventId]/index.tsx
│   ├── EventSummary               — event title hero
│   ├── EventLogistics             — date, address, image
│   ├── EventContent               — description body
│   └── Comments                   — toggle + list + new comment form
│       ├── NewComment             — form → POST /api/comments/[eventId]
│       └── CommentList            — fetched via GET /api/comments/[eventId]
│
└── pages/events/[...slug].tsx
    ├── ResultsTitle               — displays filtered month/year heading
    ├── EventList → EventItem
    └── ErrorAlert                 — invalid date range or no results
```

**EventList (`components/events/EventList.tsx`)** filters out any events missing `id`, `title`, or `date` before rendering. If no valid events remain, renders `"No events found."` instead of an empty list.

**EventItem (`components/events/EventItem.tsx`)** renders `"Location not available"` if the `location` field is missing — it never crashes on incomplete event data.

### Global State

`NotificationContext` (`store/notification-context.tsx`) provides app-wide toast notifications:

| State field     | Shape                                   |
| --------------- | --------------------------------------- |
| `notification`  | `{ title, message, status }` or `null`  |
| `status` values | `"pending"` \| `"success"` \| `"error"` |

Success/error notifications auto-dismiss after **3 seconds**.

---

## Development Guidelines

### Adding New API Routes

- Place handlers under `pages/api/`.
- Always use `connectDatabase()` from `utils/db-utils.ts` — it reads `process.env.MONGODB`.
- Close the client with `client.close()` in all code paths (success and error).
- Return structured JSON with a `message` field on all responses.

### Adding New Pages

- Use `getStaticProps` + ISR (`revalidate`) for data that changes infrequently.
- Use SWR for client-side fetching when URL params are only available at runtime (e.g., slug-based filters).
- Export the `Event` type from `pages/index.tsx` and import it in other pages to keep the type consistent.

### Styling

- Use CSS Modules (`.module.css`) co-located with each component.
- Global styles live in `styles/globals.css`.
- No external CSS framework — keep styles scoped.

### TypeScript

- Avoid `any` — use it only as a last resort for third-party data with unknown shapes.
- Define prop interfaces directly above the component that uses them.
- The shared `Event` type is exported from `pages/index.tsx`:

```ts
export type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  isFeatured: boolean;
};
```

### Date Filtering Validation

Filtered events route (`/events/[year]/[month]`) validates:

- Year: integer, 2021–2030
- Month: integer, 1–12

Invalid ranges show an `ErrorAlert` with a link back to `/events`.

### Image Handling

- Event images are served from the `public/` directory.
- Firebase returns paths like `images/foo.jpg` — prefix with `/` when passing to `next/image`.
- Image dimensions: `width={250} height={160}` (defined in `EventItem`).

---

## Scripts

### `scripts/seed-db.js`

Seeds the local MongoDB `events` database with test data. Safe to re-run (clears existing data first).

```bash
node scripts/seed-db.js
```

Inserts into:

- `newsletter` — 3 test email addresses
- `comments` — 5 test comments across events `e1`, `e2`, `e3`

### `scripts/seed-firebase.js`

Seeds the Firebase Realtime Database with 5 events (`e1`–`e5`).

```bash
node scripts/seed-firebase.js
```

Requires Firebase rules to temporarily allow writes (`.write: true`). Revert rules to `.write: false` after seeding.

---

## Codebase Notes

### `dummy-data.ts` — Legacy, Unused

This file exports `getAllEvents`, `getFeaturedEvents`, `getFilteredEvents`, and `getEventById` using hardcoded data. It predates the Firebase integration and is **not imported anywhere** in the codebase. Do not use it — all event data comes from Firebase via `utils/api-utils.ts`.
