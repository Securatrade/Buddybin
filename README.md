# BuddyBin

BuddyBin is a production-oriented Next.js application for organising recurring UK wheelie-bin cleaning through independent local cleaning partners.

Tagline: **We sort it. You don't.**

## What Is Built

- Public website: `/`, `/how-it-works`, `/for-cleaners`, `/help`, `/login`, legal pages.
- Mobile-first signup flow with address, bin selection, independent collection schedules, customer details, review and Stripe Checkout handoff.
- Server-side Zod validation and server-side price recalculation from Supabase pricing rules.
- Stripe Checkout subscriptions, billing price IDs, webhook verification and idempotent event storage.
- Supabase PostgreSQL schema, RLS policies, migrations and seed pricing.
- Supabase passwordless magic-link login and minimal customer portal at `/account`.
- Contact message storage, rate limiting and Resend email notifications.
- Admin PIN login at `/admin`, signed HTTP-only session cookie, lockout/rate limiting, dashboard, customer table/detail, messages and pricing management.
- PM2, Nginx and Ubuntu 24.04 deployment documentation.

## Local Launch

```bash
npm install
cp .env.example .env.local
npm run hash:admin-pin -- 1722
npm run dev
```

Open `http://localhost:3000`.

External services are required for real checkout, login and email:

- Supabase project URL, anon key and service-role key.
- Stripe secret key, publishable key, webhook secret, products and recurring monthly Price IDs.
- Resend API key and verified sending domain/email.

## Quality Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Playwright E2E tests mock Stripe Checkout creation so they can run locally without live Stripe credentials.

## File Structure

```text
src/app                 App Router pages and route handlers
src/components          UI, signup, account and admin components
src/lib                 pricing, validation, Supabase, Stripe, email and security helpers
supabase/migrations     PostgreSQL schema, RLS and seed pricing
docs                    setup and deployment guides
deploy/nginx            Nginx site example
scripts                 admin PIN hash and environment checks
ecosystem.config.cjs    PM2 production process config
```

## Service Setup

Read:

- `docs/supabase.md`
- `docs/stripe.md`
- `docs/resend.md`
- `docs/deployment.md`

Legal pages include launch placeholders marked for legal review. Do not publish without legal review.
