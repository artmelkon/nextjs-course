# CLAUDE.md

I'm building an app described in @SPEC.md. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extrimly concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

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

| Route                    | File                               | Notes                                             |
| ------------------------ | ---------------------------------- | ------------------------------------------------- |
| `/`                      | `pages/index.tsx`                  | Featured events via `getStaticProps`              |
| `/events`                | `pages/events/index.tsx`           | All events + date search; ISR revalidate 60s      |
| `/events/[eventId]`      | `pages/events/[eventId]/index.tsx` | Event detail with comments; ISR revalidate 18000s |
| `/events/[year]/[month]` | `pages/events/[...slug].tsx`       | Client-side filtered events using SWR             |

### API Routes

- `GET/POST /api/comments/[eventId]` — fetch/add comments for an event (MongoDB)
- `POST /api/newsletter` — save email to newsletter collection (MongoDB)

### Global State

`store/notification-context.tsx` provides a `NotificationContext` wrapping the entire app (via `_app.tsx`). It exposes `showNotification(data)` and `hideNotification()`. Notifications with `status: 'success'` or `status: 'error'` auto-dismiss after 3 seconds.

### Key Types

The `Event` type is defined and exported from `pages/index.tsx`:

```ts
type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  isFeatured: boolean;
  image: string; // path relative to /public, prefixed with "/" when used in <Image>
}
```

The `CommentType` shape (used in `/api/comments/[eventId].ts`):

```ts
type CommentType = {
  email: string;
  name: string;
  text: string;
  eventId: string;
  _id?: any; // assigned after MongoDB insert
}
```

### Path Alias

`@/` maps to the project root (configured in `tsconfig.json`). Used throughout all imports.

### Layout & Document

- `components/layout/index.tsx` — wraps every page: renders `<Header>`, page `children`, and conditionally `<Notification>` (driven by `NotificationContext`).
- `pages/_document.tsx` — includes `<div id="overlay" />` in `<body>` before `<Main>`. Portal target for notification/modal overlays.

### Data Fetching Details

- `pages/events/[...slug].tsx` — does **not** use `getFilteredEvents` from `api-utils`. Instead it imports `url` directly and fetches raw Firebase JSON via SWR client-side, then filters in-browser. This is intentionally client-side only (no SSR/ISR).
- `pages/events/[eventId]/index.tsx` — `getStaticPaths` only pre-generates paths for **featured** events. Non-featured events are rendered on first request via `fallback: "blocking"`.
- `components/input/comments.tsx` — comments are fetched lazily: only when the user toggles "Show Comments", and re-fetched when `eventId` changes.

### MongoDB Collections

| Collection   | Written by                     | Shape                            |
| ------------ | ------------------------------ | -------------------------------- |
| `comments`   | `POST /api/comments/[eventId]` | `{ email, name, text, eventId }` |
| `newsletter` | `POST /api/newsletter`         | `{ email }`                      |

`getAllDocuments(client, collection, sort, filter?)` — `sort` is required, `filter` is optional. Comments are queried with `sort: { _id: -1 }` and `filter: { eventId }`.

Always call `client.close()` in all code paths (success and error) after DB operations in API routes.

## Claude Code

The **TypeScript LSP** plugin is enabled — Claude Code can read live diagnostics,
hover types, and go-to-definition data directly from the language server.
Run `npm run dev` or `npm run build` so the TS server stays warm.
