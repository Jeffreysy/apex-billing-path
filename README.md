# LexCollect

Billing, accounts receivable, and collections workspace for law firms. LexCollect gives
partners, billing staff, collectors, and attorneys one place to see AR, work the collections
queue, document calls and payment commitments, escalate accounts, and reconcile payments
coming in from LawPay, MyCase, Filevine, and HubSpot.

## Tech stack

- React 18, TypeScript, Vite
- Tailwind CSS with shadcn/ui (Radix) components
- TanStack Query, React Router, React Hook Form + Zod, Recharts
- Supabase: Postgres, Auth, Edge Functions (Deno)
- Vitest for tests, ESLint for linting

## Getting started

Requires Node.js 22 (LTS) and npm.

```sh
git clone https://github.com/Jeffreysy/apex-billing-path.git lexcollect
cd lexcollect
cp .env.example .env.local     # then fill in your Supabase URL and publishable key
npm install
npm run dev                    # http://localhost:8080
```

The two values in `.env.local` come from the Supabase dashboard under
**Project Settings → API**. The app refuses to start without them.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server on port 8080 |
| `npm run build` | Production build into `dist/` |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (Vitest) |

CI runs lint, typecheck, tests, and build on every pull request (`.github/workflows/ci.yml`).

## Project structure

```
src/
  pages/              Route-level screens (dashboards, queue, workspace, settings)
  components/         Feature components; components/ui/ holds generated shadcn/ui primitives
  hooks/              Supabase query hooks (useSupabaseData.ts)
  config/firmProfile.ts  Firm-specific settings: staff, escalation contacts
  lib/                Shared helpers (auth roles, escalations, team roles)
  integrations/supabase/ Supabase client and generated database types
supabase/
  functions/          Edge functions (webhooks, integrations, syncs)
  migrations/         Database migrations
  templates/          Branded auth email templates (pasted into the Supabase dashboard)
  config.toml         Supabase CLI settings, including each function's JWT setting
scripts/              Data-maintenance scripts run outside the app
```

## Configuration for a firm

Today each LexCollect deployment serves one firm and has its own Supabase project.

- **Supabase connection**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, set in
  `.env.local` locally and in the hosting provider's environment settings in production.
- **Firm profile**: `src/config/firmProfile.ts` holds staff names and escalation contacts.
  The live collector roster comes from the `collector_roster` table.
- **Integrations**: API keys for LawPay, MyCase, Filevine, HubSpot, and Zoom are Supabase
  Edge Function secrets (**Edge Functions → Secrets** in the dashboard), never committed.
- **Auth emails**: see `supabase/templates/README.md` for sender name, branded templates,
  and redirect URLs.

## Deploying

**Web app.** Any static host works; `netlify.toml` is set up for Netlify. Connect the repo,
use build command `npm run build` and publish directory `dist`, and set the two `VITE_`
environment variables. Then set the Supabase **Site URL** to the deployed address.

**Edge functions.** Deploy with the Supabase CLI:

```sh
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase functions deploy <function-name>
```

`supabase/config.toml` records whether each function requires a signed-in caller
(`verify_jwt`), so CLI deploys keep the current behavior. Webhook endpoints called by
LawPay, Filevine, or Zapier must stay `verify_jwt = false`.

**Database.** Schema changes go through migrations in `supabase/migrations/`. Make every
schema change as a migration file in this repo rather than directly in the dashboard, so a new
firm's database can be built from the repo.

## Data handling

LexCollect handles confidential client and payment information. Never commit client data:
exports, spreadsheets, and CSV files are ignored by `.gitignore`, and the `scripts/` output
belongs on the firm's own storage, not in git. Keep credentials in Supabase secrets or local
`.env.local` files.
