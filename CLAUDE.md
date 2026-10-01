# LexCollect - Apex Billing Path

## Tech Stack

- **Frontend**: React 18, TypeScript 5.8, Vite 5.4
- **Styling**: TailwindCSS 3.4, shadcn/ui (Radix primitives)
- **Routing**: React Router v6
- **State**: TanStack React Query v5, React Hook Form + Zod
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Testing**: Vitest, Playwright
- **Origin**: Generated with Lovable, now developed directly in this repo (no Lovable sync)

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives (60+ components) - DO NOT manually edit
│   ├── finance/         # Financial dashboard tabs (AR, transactions, forecasting, KPIs)
│   └── collector/       # Collector-specific views (activity, commitments, escalations)
├── pages/               # Route-level components (11 dashboards)
├── hooks/
│   └── useSupabaseData.ts  # ALL Supabase query hooks and computed data helpers
├── integrations/supabase/
│   ├── client.ts        # Supabase client init
│   └── types.ts         # Auto-generated types from Supabase schema - DO NOT manually edit
├── config/firmProfile.ts # Firm-specific settings (staff names, escalation contacts)
├── data/mockData.ts     # TypeScript interfaces for domain entities
├── lib/utils.ts         # Utility functions
└── App.tsx              # Route config and providers
```

## Supabase

- **Project ID**: `qbrufeewsisljtoegops`
- **Config**: `supabase/config.toml`
- **Migrations**: `supabase/migrations/`
- **MCP**: copy `.mcp.example.json` to `.mcp.json` (gitignored, holds local credentials); keep `read_only=true` except for schema changes
- **Edge function deploys**: `npx supabase functions deploy <name>`; `config.toml` holds each function's `verify_jwt`, so keep it in sync when adding functions

### Key Database Views (used by dashboards)

- `admin_kpi` - Firm-wide KPI snapshot
- `ar_dashboard` - AR portfolio with client details
- `collections_dashboard` - Collections queue by priority
- `payments_clean` - Normalized payment data

### Core Tables

clients, contracts, payments, collection_activities, payment_commitments, escalations, invoices, matters, billing_rates, time_entries, immigration_cases, case_events, case_milestones, activity_log, audit_log, ar_monthly_summary

## Configuration

- Supabase connection comes from `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` (`.env.local`, see `.env.example`); never hardcode project URLs or keys
- The web app deploys as a static site (`netlify.toml`); see README for deployment steps
- Branded auth email templates live in `supabase/templates/` and are pasted into the Supabase dashboard

## Commands

```bash
npm run dev          # Dev server on port 8080
npm run build        # Production build
npm run lint         # ESLint (must pass with 0 errors)
npm run typecheck    # TypeScript (must pass)
npm run test         # Vitest
npx supabase         # Supabase CLI (run via PowerShell on Windows if bash access denied)
```

## Conventions

- All Supabase data hooks go in `src/hooks/useSupabaseData.ts`
- Use TanStack Query with 5-minute stale time
- Domain components live alongside their pages, UI primitives in `components/ui/`
- Use existing shadcn/ui components before creating custom ones
- Supabase types in `src/integrations/supabase/types.ts` are auto-generated; regenerate with `npx supabase gen types`
- Firm-specific values (people, teams, firm names, integration IDs) go in `src/config/firmProfile.ts`, never inline in components
- Never commit client data (exports, CSV/XLSX, reports with client names) or credentials; `.gitignore` blocks the common cases
- Make schema changes as migration files in `supabase/migrations/`, not directly in the dashboard

## Database Best Practices (Supabase Agent Skills)

- Always use Row Level Security (RLS) on user-facing tables
- Prefer database views for dashboard aggregation queries
- Use `read_only=true` MCP mode for exploration; write mode only for migrations
- Never run destructive SQL without explicit user review
- Use database branching for schema experiments
- Prefer server-side filtering/pagination over client-side for large datasets
