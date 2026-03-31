# Madastore B2B SSR (Nuxt)

This folder contains the SSR migration of the existing Vue + Vite project.

## What was migrated

- Existing UI/components/stores/services moved into Nuxt `app/` structure.
- Route mapping converted to Nuxt pages:
  - `/` -> `home`
  - `/category/:id` -> `category`
  - `/search` -> `search`
  - `/product/:id` -> `product-details`
  - `/cart` -> `cart`
  - `/price-list-request` -> `price-list-request`
  - `/login` -> `login`
  - `/register` -> `register`
- Auth access rules migrated using global route middleware:
  - `requiresAuth` pages redirect to login.
  - `guestOnly` pages redirect authenticated users.
- Tailwind and Pinia integrated with Nuxt.
- API base URL moved to Nuxt runtime config.

## Environment

Copy `.env.example` to `.env` and update if needed:

```bash
NUXT_PUBLIC_API_BASE_URL=https://madastore.net/api/v4
```

## Auth Security (Updated)

Authentication now uses a **server-managed HttpOnly cookie** instead of storing JWT in localStorage.

- Login/register calls go through Nuxt server routes under `server/api/auth/*`.
- Backend token is stored in `b2b_auth_token` cookie with `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Profile/logout/update and protected requests (such as price-list requests) are proxied through Nuxt server routes so the token is never read by browser JavaScript.

This reduces XSS token-exfiltration risk and enables SSR-aware auth checks in route middleware.

## Run

Install:

```bash
npm install
```

Dev server:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview production:

```bash
npm run preview
```
