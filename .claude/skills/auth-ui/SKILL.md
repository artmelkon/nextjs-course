---
name: auth-ui
description: Build auth pages (SignUp, SignIn, SignOut) for the Next.js app using Tailwind CSS, httpOnly JWT cookies, bcrypt, react-day-picker, and AuthContext
---

# Frontend Auth Pages

This skill defines the patterns for building authentication UI in this Next.js 13 (Pages Router) app.

## Stack

- **Styling**: Tailwind CSS + CSS variables from `styles/globals.css`
- **Auth state**: `store/auth-context.tsx` — `AuthContextProvider`, `useAuth()` hook
- **JWT**: httpOnly cookie (`token`), set by `/api/auth/signin`, cleared by `/api/auth/signout`
- **Password hashing**: `bcrypt` (12 salt rounds)
- **DOB calendar**: `react-day-picker` + custom year `<select>` overlay

## Auth Context Pattern

`AuthContextProvider` receives `initialLoggedIn` as a prop (read from cookie server-side in `_app.tsx`).

```tsx
// _app.tsx
App.getInitialProps = async ({ ctx }) => {
  const cookies = ctx.req?.headers.cookie ?? "";
  return { initialLoggedIn: cookies.includes("token=") };
};
```

Use `useAuth()` anywhere to access `{ isLoggedIn, login }`.

## API Routes

| Route               | Method | Description                                                                     |
| ------------------- | ------ | ------------------------------------------------------------------------------- |
| `/api/auth/signup`  | POST   | Hash password, store `{ fullName, email, password, dob }` in `users` collection |
| `/api/auth/signin`  | POST   | Verify password, sign JWT, set `HttpOnly; SameSite=Strict` cookie               |
| `/api/auth/signout` | POST   | Clear cookie with `Max-Age=0`, redirect `303` to `/`                            |

Always call `client.close()` in `finally` block after DB operations.

## Form Patterns

- Collect field values in a single `useState` object (`form`)
- Use a named `handleChange` that spreads by field name
- Call `login()` from `useAuth()` after successful signin — do NOT reload the page
- Redirect with `router.push('/')` after success

```tsx
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
}
```

## DOB Picker (`components/input/DobPicker.tsx`)

- Wraps `react-day-picker` in a popover triggered by a styled `<button>`
- Year: `<select>` rendered above the calendar (scrollable, range 1920–current year)
- Month: left/right arrows from `react-day-picker`'s default navigation
- Closes on outside click via `useEffect` + `mousedown` listener
- Returns `Date | undefined` via `onChange` prop

## Styling Conventions

Use Tailwind utilities with CSS variable references for theme colors:

```tsx
className =
  "border border-[var(--color-base-200)] rounded-m focus:ring-[var(--color-base-500)]";
```

Key color tokens:

- Primary: `--color-base-500` (#043891 blue)
- Error: `--color-error-600` (#d34728 red-orange)
- Background: `--color-base-50` (light blue-grey)

## Header SignOut

- Render the Sign Out button only when `isLoggedIn` is true
- It submits a `<form action="/api/auth/signout" method="POST">` — no JS needed
- The API route clears the cookie and redirects `303` to `/`, so the page re-renders server-side with the session already gone
- Style the button with `Header.module.css` (`.signOutBtn` class)

## Conditional Nav Links

```tsx
{!isLoggedIn && (
  <li>
    <Link href="/auth/signin">Sign In</Link>
  </li>
)}
{isLoggedIn && (
  <li>
    <form action="/api/auth/signout" method="POST">
      <button type="submit" className={classes.signOutBtn}>Sign Out</button>
    </form>
  </li>
)}
```
