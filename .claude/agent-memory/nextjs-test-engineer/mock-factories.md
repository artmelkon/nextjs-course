---
name: Mock Factories & Setup
description: Reusable mock patterns for db-utils, NotificationContext wrapper, and global fetch in this project
type: reference
---

## db-utils mock

```ts
vi.mock('@/utils/db-utils', () => ({
  connectDatabase: vi.fn(),
  insertDocument: vi.fn(),
  getAllDocuments: vi.fn(),
}));

function makeClient() {
  return { close: vi.fn() };
}
```

Always call `mockConnect.mockResolvedValueOnce(makeClient())` — never forget `client.close()` is in a `finally` block.

## NotificationContext wrapper

```tsx
function renderWithNotification(showNotification = vi.fn(), hideNotification = vi.fn()) {
  const contextValue: NotificationType = { notification: null, showNotification, hideNotification };
  return {
    showNotification,
    ...render(
      <NotificationContext.Provider value={contextValue}>
        <ComponentUnderTest />
      </NotificationContext.Provider>
    ),
  };
}
```

## Global fetch mock

```ts
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);
```

For success: `mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({...}) })`
For failure: `mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Error msg' })`

## API route req/res factory

```ts
function makeReqRes(method: string, body: Record<string, unknown> = {}) {
  const req = { method, body };
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  return { req, res };
}
```
