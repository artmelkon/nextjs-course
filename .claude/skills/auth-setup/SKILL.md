---
name: auth-setup
description: Set up authentication (signup, signin, signout) and seed users in MongoDB for this Next.js / bcrypt / JWT stack
---

# Auth Setup

This project uses **Next.js Pages Router** API routes, **MongoDB** for persistence, **bcrypt** for password hashing, and **JWT stored in an `httpOnly` cookie**.

## Environment Variables

Add to `.env.local`:

```
JWT_SECRET=<long random string>
```

Never expose `JWT_SECRET` client-side.

## MongoDB User Shape

Collection: `users`

```ts
{ email: string; password: string; } // password is bcrypt hash
```

## API Routes

All auth routes live under `pages/api/auth/`.

### POST /api/auth/signup

1. Validate `email` (regex) and `password` (min 8 chars)
2. Check for existing user with `db.collection('users').findOne({ email })`
3. Hash password: `await bcrypt.hash(password, 12)`
4. Insert user: `await insertDocument(client, 'users', { email, hashedPassword })`
5. Return `201`

### POST /api/auth/signin

1. Find user by email — return `401` with a generic message if not found (avoid leaking whether email exists)
2. Compare: `await bcrypt.compare(password, user.password)`— return `401` on mismatch
3. Sign token: `jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' })`
4. Set cookie:
   ```ts
   res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`);
   ```
5. Return `200`

### POST /api/auth/signout

Clear the cookie — no DB call needed:

```ts
res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
res.status(200).json({ message: 'Signed out.' });
```

## Error Handling Rules

- Always use generic `'Invalid credentials.'` for both "user not found" and "wrong password" — never reveal which one failed
- Separate `try/catch` for DB connection vs. DB operations (same pattern as existing API routes)
- Always call `client.close()` in `finally` in all DB paths

## Seeding Users

Use `scripts/seed-users.ts` for local dev seeding:

```ts
import { connectDatabase } from '@/utils/db-utils';
import bcrypt from 'bcrypt';

async function seed() {
  const client = await connectDatabase();
  const db = client.db();
  const hashedPassword = await bcrypt.hash('password123', 12);
  await db.collection('users').insertOne({ email: 'test@example.com', password: hashedPassword });
  await client.close();
}

seed();
```

Run with: `npx ts-node --project tsconfig.json scripts/seed-users.ts`

## React Auth Form Guidelines

Follow `modern-best-practice-react-components` for all auth UI. Key points:

- Use **controlled inputs** (`useState`) for email/password fields — not `useRef`
- **No `useEffect`** for auth state — derive from cookie/session via TanStack Query or server props
- Named `function` components, not arrow functions
- Handler naming: `handleSubmit`, `handleEmailChange`, `handlePasswordChange`
- Show `isSubmitting` state to disable the submit button during the request
- Show field-level validation errors derived during submit, not synced via effect
