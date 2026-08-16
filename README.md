# Subscription Tracker

A SaaS subscription and cloud-cost tracker. Track recurring SaaS/cloud
subscriptions, see an accurate monthly/annual burn rate (annual costs are
pro-rated to a monthly equivalent), view spend by category, and get warned
about renewals coming up in the next 7 and 30 days — so nothing renews as a
surprise. Free trials can be tracked separately from paid subscriptions, with
a color-coded warning as the trial's end date (and first real charge)
approaches.

## Tech stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **PostgreSQL** via **Prisma 7** (with the `@prisma/adapter-pg` driver
  adapter — Prisma 7's client generator requires an explicit driver adapter,
  it no longer ships an embedded query engine binary)
- **NextAuth.js v4** — JWT sessions, credentials (email/password) login, plus
  optional GitHub OAuth
- **Tailwind CSS v4** + **shadcn/ui**
- **Recharts** for the category spend chart
- **React Hook Form + Zod** for validation (one shared schema, used on both
  the client form and the API routes)
- **Vitest** for unit tests

## Prerequisites

- Node.js 20+ and npm
- A PostgreSQL database. Either:
  - **Docker** (`docker-compose.yml` is included), or
  - a free hosted Postgres instance (e.g. [Neon](https://neon.tech),
    Supabase, Railway) — useful if Docker isn't available locally

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in:
   - `DATABASE_URL` — either the local Docker connection string (already
     filled in `.env.example` to match `docker-compose.yml`) or your hosted
     Postgres connection string.
   - `NEXTAUTH_SECRET` — generate one with `openssl rand -base64 32`.
   - `NEXTAUTH_URL` — `http://localhost:3000` for local dev.
   - `GITHUB_ID` / `GITHUB_SECRET` — **optional**. Leave both blank to run
     with credentials (email/password) login only. To enable GitHub OAuth,
     create an OAuth App at
     [github.com/settings/developers](https://github.com/settings/developers)
     with callback URL `http://localhost:3000/api/auth/callback/github`.

3. **Start Postgres** (skip if you're using a hosted database)

   ```bash
   docker-compose up -d
   ```

4. **Run migrations and seed demo data**

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

   This creates a demo account (`demo@example.com` / `password123`) with 8
   sample subscriptions spanning different categories, billing cycles, and
   renewal windows.

5. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type-check |
| `npm run test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run format` | Prettier (writes) |
| `npx prisma studio` | Browse the database |
| `npx prisma migrate dev` | Apply schema migrations |
| `npx prisma db seed` | Re-seed demo data |

## Project structure

```
prisma/
  schema.prisma        # User, Subscription models
  seed.ts               # Demo user + sample subscriptions
src/
  app/
    api/                # REST route handlers (auth, subscriptions CRUD)
    login/, register/    # Auth pages
    dashboard/           # Main app (protected by src/proxy.ts)
  components/
    ui/                  # shadcn/ui primitives
    auth/                # Login/register forms
    dashboard/            # Summary cards, category chart, renewals, free trials
    subscriptions/         # Subscription form, table, delete dialog
    layout/                # Navbar, session provider
  lib/
    calculations.ts       # Pure financial math (pro-rating, burn rate, renewals)
    validations/           # Zod schemas (shared client + server)
    data/subscriptions.ts   # Ownership-scoped Prisma queries
    auth.ts                  # NextAuth config + requireUserId()
    prisma.ts                 # Prisma client singleton
  proxy.ts                    # Route protection (Next.js 16's middleware convention)
tests/
  calculations.test.ts        # Pro-rating / burn-rate / renewal-window tests
  validations.test.ts          # Zod schema tests
```

## How the financial calculations work

Money is stored as `Decimal(10,2)` in Postgres (never `Float`). All arithmetic
happens in **integer cents** to avoid floating-point drift: a $120/yr
subscription pro-rates to *exactly* $10.00/mo, and summing many subscriptions
never produces `0.1 + 0.2`-style rounding errors. See
`src/lib/calculations.ts` and `tests/calculations.test.ts`.

## Wallet (estimated total spend)

The dashboard's Wallet card estimates how much you've spent in total across
your active subscriptions, with a per-app breakdown you can expand. There's
no real payment ledger, so the figure is an estimate: `getTotalSpentCents()`
(`src/lib/calculations.ts`) counts one charge per billing period completed
since the subscription's `createdAt`, including the initial charge at
signup — it assumes every cycle since has been paid in full. Free trials are
excluded (nothing's been charged yet), and deleted subscriptions aren't
counted, since deletes are hard deletes with no retained history.

## Free trial tracking

A subscription can be flagged as a free trial (`isFreeTrial` on the
`Subscription` model). This changes how it's treated throughout the app:

- The form's "Cost" and "Next renewal" fields relabel to "Cost after trial"
  and "Trial ends" — the date entered is when the trial converts to a paid
  charge, not a renewal of an existing charge.
- Trial subscriptions are excluded from every spend calculation (burn rate,
  category breakdown, spend forecast, upcoming-renewals list, insights) since
  they aren't costing anything yet.
- They're shown in their own "Free Trials" dashboard section instead, with a
  color-coded urgency badge based on days left before the trial ends: green
  (10+ days), yellow (4–9 days), red (3 days or fewer, including trials that
  have already converted). See `getTrialUrgency()` in `src/lib/calculations.ts`.

## Ownership enforcement

There's no database-level Postgres RLS. Instead, every subscription
query/mutation goes through `src/lib/data/subscriptions.ts`, and every
function there scopes its Prisma `where` clause by the authenticated
`userId` — a subscription can never be read, edited, or deleted by anyone
other than its owner. `src/proxy.ts` additionally blocks unauthenticated
requests to `/dashboard` at the routing layer, and every API route calls
`requireUserId()` independently (defense in depth, not just UI-level gating).

## Known limitations (V1, by design)

- No email notifications — renewals are surfaced in-app only.
- No historical spend tracking — the dashboard reflects current subscriptions
  only.
- Billing cycles: `MONTHLY` and `YEARLY` only.
- No rate limiting on the API routes.
- Demo/local `.env` ships a NextAuth secret and Docker Postgres password
  for convenience — replace both before any real deployment.

## Deployment

The app is structured to deploy the Next.js frontend to **Vercel** and the
database to **Railway** or **Supabase** (or Neon). Set the same environment
variables from `.env.example` in your hosting provider, run
`npx prisma migrate deploy` against the production database, and set
`NEXTAUTH_URL` to your production URL.
