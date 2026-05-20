## Rework Collections Dashboard — Monthly KPI View

Replace the current `/collections` landing with a new monthly KPI report modeled exactly on your spreadsheet. Data source: `collection_activities` (already has collector, origin, call_direction, outcome, collected_amount, commission, duration_minutes, delinquency_days, activity_date). All sections respect a single month dropdown at top (defaults to current month).

### Sections (in order)

1. **Header** — "Collections Team — Monthly View" + month dropdown (last 12 months).
2. **Full Team — MTD Performance** (5 KPI cards)
   Total Activities • $ Collected • Avg $/Call • Commission Earned • Collection Rate (= collected / activities ratio, configurable formula).
3. **Collectors — MTD Scorecard** — table with Calls, $ Collected, Avg $/Call, Avg Duration, Commission, Coll. Rate %, $ Today, Calls/Day, Connected/Day (over days worked). Rows = Alejandro A, Maritza V, Patricio D (collector role).
4. **Intake Team — MTD Scorecard** — Roy Ramos, Lizbeth Castrillón: Calls, Outbound, Inbound, Admin, Connected, Escalated, Avg Duration, Calls/Day, Connected/Day, Commission, $ Collected.
5. **Team Comparison — MTD** — normalized cross-role view (Activities, Outbound, Inbound, Connected, Contact Rate %, Avg Duration, $ Collected).
6. **Today's Activity** — date-stamped row per team member (Activities, $ Collected, Inbound, Outbound, Total Calls, Top Outcome).
7. **Outcome Distribution — MTD** — matrix: team × outcome buckets (Pay Up-to-date, Partial, Overdue, Payment Promise, No Answer/VM, Collected, Info Provided). Includes outcome-normalization map to merge dirty values ("noi answer" → "No Answer/VM", etc.).
8. **Aging Breakdown — MTD** — collectors only: <30 / 31–60 / 61–90 / >90 days × $ collected. Source: `delinquency_days` on each collected activity.
9. **New Client Contacts — Month** — per team member, day-of-week grid (Mon–Sun) + total unique. Logic: outbound call to a `client_id` NOT contacted by that same collector in prior 30 days.
10. **Collection Origin Breakdown — Count** — team × origin (A/R List, FUP, CC/VR Transfer, Attorney Req, CM/Paralegal, Pending Task, Other/Blank), count of collected activities, with % breakdown footer row.
11. **Collection $ by Origin** — same matrix, dollar sums + %.
12. **All Calls by Origin** — same matrix, inbound+outbound counts + %.

### Role config

Add `COLLECTOR_ROLES` map in a new `src/lib/teamRoles.ts`:
```
{ "Alejandro A": "Collector", "Maritza V": "Collector", "Patricio D": "Collector",
  "Roy Ramos": "Intake", "Lizbeth Castrillón": "Intake" }
```
Easy to extend; System-Auto excluded.

### Origin & outcome normalization

A small mapper in the new file converts raw values to the 7 origin buckets and 7 outcome buckets shown above. Unknown/blank → "Other/Blank".

### File plan

- `src/lib/teamRoles.ts` — roles, origin map, outcome map, helpers.
- `src/pages/CollectionsDashboard.tsx` — replace contents with new monthly report; existing queue/CRM features move to `/collections/queue` (already exists) and remain reachable from the sidebar.
- All data fetched in one query (`collection_activities` filtered by month, plus an "all-time-for-prior-30-day window" slice for New Contacts) via `fetchAllRows`.

### Out of scope (ask before touching)

- Existing Call Queue, Escalations, CRM Workspace pages — untouched.
- No DB migration needed; views unchanged.

Confirm and I'll build it.