---
name: Test coverage and mock patterns
description: Which API routes have test coverage and what mocks/patterns they use
type: project
---

## API Routes with Test Coverage

- `POST /api/newsletter` — `__tests__/api/newsletter.test.ts` (9 tests). Mocks `@/utils/db-utils` (connectDatabase, insertDocument). Uses makeClient()/makeReqRes() helpers.
- `GET /api/comments/[eventId]` — `__tests__/api/comments.test.ts` (16 tests). Mocks `@/utils/db-utils` (connectDatabase, insertDocument, getAllDocuments).
- `POST /api/comments/[eventId]` — covered in same file above.

## Standard Mock Pattern

```ts
vi.mock('@/utils/db-utils', () => ({
  connectDatabase: vi.fn(),
  insertDocument: vi.fn(),
  getAllDocuments: vi.fn(),
}));
// import after mock declaration
import { connectDatabase, ... } from '@/utils/db-utils';
const mockConnect = connectDatabase as ReturnType<typeof vi.fn>;
```

## NextApiResponse Mock Shape

```ts
const res = {
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  end: vi.fn().mockReturnThis(),
};
```

## client.close() Verification Pattern

Always make a `makeClient()` that returns `{ close: vi.fn() }`, assert `client.close` was called once after every code path (success, 422, 500, wrong method).

**Why:** The comments and newsletter API routes must call client.close() in a finally block in all code paths to avoid connection leaks.
**How to apply:** For every new API route test, add a dedicated `client.close()` verification section.
