# LexCollect

Billing, collections, and AR dashboards for the firm: admin KPIs, AR aging, the collections queue, collector activity and commitments, payments, and financial forecasting.

## Tech stack

- React 18, TypeScript, Vite
- Tailwind CSS and shadcn/ui
- TanStack Query, React Hook Form + Zod, Recharts
- Supabase (Postgres, Auth, Realtime, Edge Functions)
- Vitest and Playwright

## Local development

Requires Node.js and npm.

```sh
npm install
npm run dev      # http://localhost:8080
npm run build    # production build into dist/
npm run test     # Vitest
npm run lint
```

The Supabase connection is read from `.env`.

## Project layout

```
src/
├── components/        # app components; ui/ holds shadcn/ui primitives
├── pages/             # route-level dashboards
├── hooks/             # Supabase data hooks (useSupabaseData.ts)
└── integrations/      # Supabase client and generated types
supabase/
├── migrations/        # database schema
└── functions/         # edge functions (MyCase, Filevine, HubSpot, payments)
```

## Editing

The repo stays in two-way sync with the Lovable editor: commits pushed here show up there, and edits made there are committed here.
