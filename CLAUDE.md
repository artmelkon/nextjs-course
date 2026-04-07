# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Environment Variables

Requires `.env.local` with:
- `MONGODB` — MongoDB connection string (e.g. `mongodb://localhost/events`)
- `FIREBASE_SECRET` — Firebase Realtime Database auth token

## Architecture

This is a **Next.js 13 (Pages Router)** app for browsing and filtering events.

### Data Sources

Two separate backends:
- **Firebase Realtime Database** — stores event data (read-only from the app's perspective). All event fetching goes through `utils/api-utils.ts`, which hits the Firebase REST API with `FIREBASE_SECRET`.
- **MongoDB** — stores user-generated data (comments, newsletter signups). All DB access goes through `utils/db-utils.ts` (`connectDatabase`, `insertDocument`, `getAllDocuments`).

### Pages & Routing

| Route | File | Notes |
|---|---|---|
| `/` | `pages/index.tsx` | Featured events via `getStaticProps` |
| `/events` | `pages/events/index.tsx` | All events + date search; ISR revalidate 60s |
| `/events/[eventId]` | `pages/events/[eventId]/index.tsx` | Event detail with comments; ISR revalidate 18000s |
| `/events/[year]/[month]` | `pages/events/[...slug].tsx` | Client-side filtered events using SWR |

### API Routes

- `GET/POST /api/comments/[eventId]` — fetch/add comments for an event (MongoDB)
- `POST /api/newsletter` — save email to newsletter collection (MongoDB)

### Global State

`store/notification-context.tsx` provides a `NotificationContext` wrapping the entire app (via `_app.tsx`). It exposes `showNotification(data)` and `hideNotification()`. Notifications with `status: 'success'` or `status: 'error'` auto-dismiss after 3 seconds.

### Key Type

The `Event` type is defined and exported from `pages/index.tsx`:
```ts
{ id, title, description, location, date, isFeatured }
```
