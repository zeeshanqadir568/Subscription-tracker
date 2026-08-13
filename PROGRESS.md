# Progress Log — Subscription Tracker

Purpose of this file: if you lose this conversation (restart, power off, new
chat), read this to know exactly what's been built, what state it's in, and
how to pick back up. Update it as work continues.

**Last updated:** 2026-08-13 (visual + functional redesign pass)
**Project location:** `D:\subscription-tracker` (separate from the ML
service at `D:\FYP\ml-service`)
**Status:** Working app, fully functional, running locally against a real
Neon Postgres database. Not yet committed to git (see "Not done yet" below).

---

## How to resume right now

```
cd D:\subscription-tracker
npm run dev
```

Open http://localhost:3000 — log in with `demo@example.com` / `password123`
(already seeded), or register a new account. Full setup steps (if starting
from a totally fresh machine) are in `README.md`.

Your database connection is already saved in `.env` (`DATABASE_URL` points
at your Neon Postgres project) — nothing to reconfigure.

---

## What this app does

A SaaS subscription/cloud-cost tracker: add your recurring subscriptions,
see an accurate monthly/annual burn rate (annual costs auto pro-rated to a
monthly equivalent), view spend broken down by category, and get warned
about renewals coming up in 7 / 30 days.

---

## What's been built (all working, verified)

- **Auth:** register + login with email/password (NextAuth v4, JWT
  sessions), GitHub OAuth wired but optional (only activates if
  `GITHUB_ID`/`GITHUB_SECRET` are set in `.env`)
- **Database:** Postgres via Prisma 7, schema = `User` + `Subscription`
  models, migrations applied, seeded with a demo account + 8 sample
  subscriptions
- **Subscription CRUD:** add / edit / delete, every request scoped to the
  logged-in user only (one user can never see or touch another user's data)
- **Dashboard:**
  - Total Monthly Spend, Projected Annual Cost, Active Subscriptions count
  - Category spend chart (bar chart, Recharts)
  - Upcoming Renewals: "next 7 days" and "next 8-30 days" sections
  - Add/edit subscription via a dialog form (validated — no negative costs,
    no empty names, no invalid dates)
- **Validation:** shared Zod schemas used on both the form and the API
- **Error handling:** failed requests show a toast notification; real
  errors are logged to the server console
- **Tests:** 25 automated tests (Vitest) covering the money math and
  validation rules — all passing
- **Login/register pages:** redesigned with a marketing panel (headline,
  feature highlights, mini preview card) alongside the form, not just a bare
  login box

---

## Chronological build log

1. Scaffolded a fresh Next.js 16 + TypeScript + Tailwind v4 project in
   `D:\subscription-tracker` (separate repo from the ML service)
2. Installed the full stack: Prisma, NextAuth v4, Zod, React Hook Form,
   Recharts, shadcn/ui, Vitest, etc. — each dependency justified against
   what the spec required
3. **Prisma 7 surprise:** npm installed Prisma 7 (genuinely "latest
   stable"), which turned out to require an explicit database driver
   adapter (`@prisma/adapter-pg` + `pg`) instead of the old embedded query
   engine. Wired that in correctly in `src/lib/prisma.ts` and
   `prisma/seed.ts`.
4. Built the Prisma schema (money stored as `Decimal`, never `Float`) and
   seed script
5. Built the financial math as pure, unit-tested functions
   (`src/lib/calculations.ts`) — everything computed in integer cents
   internally to avoid floating-point rounding errors, so a $120/yr
   subscription is *exactly* $10.00/mo, not $9.999999
6. Built auth (`src/lib/auth.ts`), the register API route, and route
   protection (`src/proxy.ts` — renamed from `middleware.ts` because
   Next.js 16 deprecated that file name)
7. Built the subscription CRUD API routes with consistent JSON error
   responses and per-user ownership checks
8. Built the dashboard UI: summary cards, category chart, renewals list,
   subscription table, add/edit/delete dialogs
9. Wrote the README with setup instructions
10. **Full verification pass:** `tsc --noEmit`, `npm run lint`,
    `npm run test` (25/25 passing), `npm run build` — all clean. Then ran
    real migrations + seed against your live Neon database and smoke-tested
    the entire flow via direct HTTP requests (register → login → create/
    edit/delete a subscription → dashboard totals correct → negative cost
    rejected → cross-user access blocked) since no browser automation tool
    was available in that session
11. Fixed a mislabeled stat: "Total Annual Spend" renamed to **"Projected
    Annual Cost"** since it's a forward-looking estimate, not historical
    spend
12. Removed the default Next.js favicon (was showing the Next.js logo in
    the browser tab)
13. Disabled the Next.js Dev Tools indicator (the floating badge you saw
    was that, not the favicon) via `devIndicators: false` in
    `next.config.ts`
14. Fixed a React hydration warning caused by a Chrome extension injecting
    attributes into the page (added `suppressHydrationWarning` to `<html>`
    — this is the standard fix for that specific situation, not a bug in
    the app)
15. Redesigned the login/register pages: added a marketing panel (headline
    "Every subscription. One dashboard. Zero surprises.", feature
    highlights, mini dashboard preview) next to the form, using a route
    group (`src/app/(auth)/`) so both pages share the same layout
16. **UI polish pass** — added ambient/interactive motion so the app feels
    alive instead of static, all pure CSS/rAF, no new dependencies:
    - `src/components/effects/cursor-glow.tsx`: soft radial glow that
      trails the mouse app-wide (rAF-lerped, skipped on touch devices and
      `prefers-reduced-motion`), mounted in `src/app/layout.tsx`
    - `src/components/effects/animated-background.tsx`: drifting blurred
      gradient orbs + a faint panning grid (CSS keyframes only), used
      behind the `(auth)` layout and the dashboard layout
    - `src/components/ui/spotlight-card.tsx`: a `Card` drop-in that
      renders a glow following the cursor on hover; now used by the 3
      summary cards, the category chart card, and the upcoming-renewals
      card
    - `src/hooks/use-count-up.ts`: animates stat numbers toward their
      target value (eased, rAF-driven) whenever the underlying data
      changes — used in `summary-cards.tsx`
    - Pulsing "Live" indicators added to the Total Monthly Spend card,
      the navbar (next to the signed-in email), and the auth marketing
      panel's preview card
    - Staggered fade/slide-in entrance animations on dashboard sections
      via `tw-animate-css` utilities (already a dependency)
    - New keyframes/utilities in `globals.css`: `drift-a/b/c`,
      `grid-pan`, `pulse-ring` — all respect `prefers-reduced-motion`
    - Verified: `tsc --noEmit`, `npm run lint`, `npm run build`, and the
      25 Vitest tests all still pass; manually checked in a real browser
      via claude-in-chrome (dashboard + server-rendered login markup)
17. **Visual + functional redesign** — the ask was "don't be boring, take
    inspiration from Stripe"; this replaced the grayscale theme with a
    real color system and added genuinely new dashboard functionality
    (not just paint), using the `dataviz` skill's validated palette
    throughout so every chart color is CVD/contrast-checked rather than
    eyeballed:
    - **Design tokens** (`globals.css`): swapped the oklch grayscale
      theme for the dataviz skill's validated palette — blue `#2a78d6`
      brand primary, warm near-white/near-black ink/surface tokens, the
      validated 5-slot categorical set for charts, and a status palette
      (`--success/--warning/--serious/--critical`) registered as Tailwind
      utilities. Ran `scripts/validate_palette.js` against the categorical
      set actually in use — passes every gate (contrast WARN is expected
      and already mitigated by direct labels, per the skill's own
      guidance)
    - **Auth pages**: `auth-marketing-panel.tsx` now has a Stripe-style
      animated gradient-mesh hero (`.gradient-mesh` + `.animate-gradient-shift`
      in `globals.css`) replacing the flat dark panel, a gradient
      headline (`.text-gradient-brand`), and per-feature colored icon
      chips. `login-form.tsx`/`register-form.tsx` got a gradient logo
      badge, larger inputs, and entrance animation
    - **New: Spend Forecast chart** (`spend-forecast-chart.tsx` +
      `getSpendForecast()` in `calculations.ts`, unit-tested) — a
      6-month projected cash-outflow area chart. Monthly subscriptions
      count every month; yearly subscriptions count only in the month
      their real `nextRenewalDate` lands (found by walking ±12 months).
      No fabricated/historical data — the app still doesn't log past
      spend, so this is a forward projection from real active
      subscriptions only, not a trend line
    - **New: Insights row** (`insights.tsx`) — priciest subscription, top
      spending category, average cost per subscription, derived from
      real data
    - **New: search + sort on the subscriptions table**
      (`subscription-table.tsx`) — filter by name/category, click any of
      Name/Cost/Next renewal to sort, direction indicator
    - **Status-colored renewal badges** (`upcoming-renewals.tsx`) — the
      "Next 7 days" / "Next 8-30 days" badges and overdue rows now use
      the validated critical/warning colors with an icon, not a bare
      destructive/secondary badge
    - Recolored summary cards (per-stat icon accent), navbar (gradient
      logo mark, sticky + backdrop-blur), and dashboard chrome to match
    - Verified: `tsc --noEmit`, `npm run lint`, 31 Vitest tests (25
      original + 6 new forecast tests), `npm run build`, and a live
      browser pass via claude-in-chrome (signed in with the real account,
      confirmed the forecast chart/insights/search all work, no console
      errors)

---

## Not done yet / known gaps

- **Nothing has been committed to git.** All work exists only on disk in
  `D:\subscription-tracker`. If you want a safety net, ask to have an
  initial commit made.
- No visual/pixel browser testing was done (no browser automation tool was
  available in that session) — verification was functional, via direct API
  requests against the real database instead.
- `docker-compose up` (local Postgres via Docker) has never been run —
  Docker isn't installed on this machine. The app is running against your
  hosted Neon database instead, which works fine, but the Docker path is
  unverified.
- No email notifications (in-app only, by design for V1)
- No historical spend tracking — dashboard reflects current subscriptions
  only, not a log of past charges
- No rate limiting on the API

---

## Key files if you need to find something

| What | Where |
|---|---|
| Setup instructions | `README.md` |
| Money math + tests | `src/lib/calculations.ts`, `tests/calculations.test.ts` |
| Database schema | `prisma/schema.prisma` |
| Auth config | `src/lib/auth.ts` |
| API routes | `src/app/api/` |
| Dashboard UI | `src/app/dashboard/`, `src/components/dashboard/` |
| Login/register pages | `src/app/(auth)/` |
| Environment variables | `.env` (real values, not committed) / `.env.example` (template) |
