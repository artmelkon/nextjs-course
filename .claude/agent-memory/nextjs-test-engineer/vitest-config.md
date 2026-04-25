---
name: Vitest Config
description: Project requires a vitest.config.ts and vitest.setup.ts to be created — neither exists by default
type: project
---

This project had no vitest config when testing was first set up (2026-04-19). Two files were created:

- `vitest.config.ts` — uses `@vitejs/plugin-react`, `environment: 'jsdom'`, `globals: true`, `setupFiles: ['./vitest.setup.ts']`, and a resolve alias mapping `@` → project root.
- `vitest.setup.ts` — imports `@testing-library/jest-dom` for custom matchers.

`@testing-library/user-event` is NOT installed. Use `fireEvent` from `@testing-library/react` for interactions.

**Why:** No vitest config means `@/` imports don't resolve and jsdom isn't configured, causing all tests to fail on import.

**How to apply:** Always verify these files exist before writing tests. If missing, create them first.
