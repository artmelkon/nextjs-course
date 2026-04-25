---
name: Async Submit Gotcha
description: jsdom unhandled rejection problem when testing async onSubmit handlers that call fetch — and the workaround
type: feedback
---

When a component's `onSubmit` handler is `async` and calls `await fetch(...)`, React does NOT await the handler. If `mockFetch.mockRejectedValueOnce(...)` is used, the rejection propagates as an unhandled promise rejection in jsdom before the component's `catch` block runs. Vitest catches this as a global error and fails the test even if the assertion eventually passes.

**Why:** jsdom's microtask scheduling means the rejection escapes to `globalThis.onunhandledrejection` before the component's internal `try/catch` can claim it.

**How to apply:** Never use `mockRejectedValueOnce` for fetch in component tests. Instead:
- Simulate failures via `mockResolvedValueOnce({ ok: false, statusText: 'Error message' })` — this keeps the promise resolved but the component's own logic throws synchronously, caught by the component's catch block.
- Use `await act(async () => { fireEvent.submit(...) })` to flush all pending microtasks before asserting.
- The `ok: false` path is equivalent to a network error for test purposes since the component throws on non-OK responses.
