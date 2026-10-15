# Delinquent Collections — key metric spec

> Jeff Soto-Gil, 2026-10-14: "lets circle back to this and make sure that we track this metric in lex collect to for any firm that I work with and especialy for ERL, we should know delquent dollars collected that should be a key metrick for as along with willing payers and if we have added any new payers manualy or automaticaly should be baked in there please have the agents work on this and wiring it into the lexcollect app"

This page defines the three numbers on the **Delinquent Collections** panel (Admin Dashboard → Executive Insights → "Delinquent $"). It also lists the inputs a firm's data must provide so the same definitions can run for another firm.

The app computes none of these. It reads `v_delinquent_collections_kpi` and shows the rows. Every definition lives in SQL, in `delinquent_collections_metrics(p_start, p_end, p_silence_days)`.

## 1. Windows and the cutoff

| Term | Definition |
|---|---|
| **complete_through** | The last day the payment ledger fully covers: `least(max(txn_date), firm-local date of the latest load that touched max(txn_date) − 1); a later backfill of an older window does not move it` (`dcm_ledger_cutoff(p_tz)`). A load at 1:40 PM on Oct 13 covers only the morning of Oct 13, so Oct 13 is left out. |
| **MTD** (`period_kind = 'mtd'`) | Day 1 of the month that contains complete_through, up to complete_through. |
| **Comparison** (`'mtd_prior'`) | The same day range of the prior month, capped at that month's last day. Example: Oct 1–12 vs Sep 1–12. A partial day is never compared with a full one. |
| **Trend** (`'month'`, `'week'`) | Calendar months and Monday weeks. The current period is cut at complete_through and flagged `is_partial`. |

## 2. Metrics and cohort keys

Cohort keys are published per CLAUDE.md gate 6. Reference them by key, never by re-deriving a boundary. client-ar-agent reviewed all six on 2026-10-14, and those changes are in.

| Cohort key | Grain | Definition |
|---|---|---|
| `dcm.delinquent_cash.v1` | **transaction** | Settled payments whose payer resolves to a client who had an open invoice **already past due on the AR snapshot in force at the payment date**. Spine: `mv_delinquent_cash_txn`, `cash_class = 'delinquent'`.<br>**Manual** = not an autopay draft. **31+** = more than 30 days past due at payment.<br>**Headline = manual.** Autopay drafts run as one mid-month batch, so a month-to-date autopay figure swings with the batch date. Compare autopay only on full months. |
| `dcm.willing_payer.v1` | **client** (AR-snapshot client key `resolved_client_key`) | Distinct clients with ≥ 1 `dcm.delinquent_cash.v1` payment in the window. The headline is the *manual* variant; the variants (all channels, autopay, 31+) overlap and are not additive.<br>Do **not** use `coalesce(matched_client_id, resolved_client_key)`: that mixed key double-counts (186 / 259 vs the correct 185 / 257 manual for Oct 1–12 / Sep 1–12). |
| `dcm.resumed_payer.v2` | **client** (`resolved_client_key`), a subset of willing payers | A delinquent payment in the window **with no spine payment of any class by the same client key or payer key in the prior `p_silence_days` (default 60) days**, using a strict window. The earliest qualifying payment decides manual or automatic.<br>NULL when the window starts within `p_silence_days` of the spine floor. Show it as a subset of willing payers; never add the two. |
| `dcm.intake_payer.v1` | **payer** (`payer_key`) | Payers whose earliest spine payment is a `new_client_not_in_snapshot` row in the window: a first-ever payment by someone not yet on the AR book. This is mostly consultation intake.<br>Split: consult-size (first payment ≤ `p_consult_max`, default $300) vs larger, plus how many are on the latest AR snapshot now. All of them are manual, so there is no manual/automatic split. Never add these to willing payers (different key). |
| `dcm.new_plan_seen.v2` | **plan → client** (`tokenset_key(normalized_contact)`) | Payment plans (`invoice_number`) that first appear in the append-only `payment_plan_state_history`, **reported per feed load with the days that load covers**.<br>They are dated by feed load, not by when the plan was created in MyCase, so loads are **never compared month over month**. *Automatic* = autopay on; *manual* = no autopay. Autopay is the first non-null observation (the 2026-09-01 load wrote NULL), otherwise *unknown*. |
| `dcm.broken_autodraft.v2` | **plan → client**, point in time | "Autopay on, plan past due": live plans with autopay ON, `amount_due > 0`, and `next_due_date_norm` more than `p_grace_days` (default 7) before the plan feed's as-of date.<br>Split by the ledger's failed autopay drafts (matched on `tokenset_key` of the plan contact):<br>• **failed after the due date** (real card failure)<br>• **failed only before the due date**<br>• **no failed draft**: a clean stop, which is **DO-NOT-DUN**. Never send these clients a "card failed" message.<br>The plan balance is a **subset of AR**: VP r3 found 468 of 468 plans on the 2026-10-12 AR snapshot. Show it as "of AR", never "plus AR". This is a count KPI, not an outreach list. |

**Manual vs automatic.** *Automatic* means an autopay draft (resumed payers) or a new plan with autopay on. *Manual* means a person acted: a payment taken by staff or in the office, a client paying online, or a new plan without autopay.

## 3. Data-quality line

| Field | Meaning |
|---|---|
| `unresolved_pct` | Share of settled cash in the window whose payer could not be matched to a client. That cash cannot be tested for delinquency, so a high value means the delinquent figures read **low**. |
| `quality` | `DEGRADED` when the AR snapshot in force is more than 35 days old. `WARN` when more than 15 % of cash is unresolved. Otherwise `OK`. |
| `snapshot_in_force_latest`, `complete_through`, `ledger_last_loaded_at`, `refreshed_at` | Shown on the panel so a low number is not misread. |

## 4. Not shown, and why

**Collections team vs other staff.** The spine labels a payment taker "collections" by matching first name and last initial against `collector_roster`. That roster has `started_at` but **no end date**, so the label is not time-bounded. The October figures are correct: no roster-matched taker appears after 2026-09-15. A future hire who shares a former collector's name would still be labelled wrongly. The split stays off the panel until the roster carries effective dates. Collector activity in `collection_activities` also stops on 09-15.

## 5. Mapping another firm's data (tenant-ready inputs)

The definitions need only the inputs below. A firm whose data fills them gets the same panel; the frontend has no firm-specific values; even the 60-day and $300 thresholds come back as columns.

| Input | Contract |
|---|---|
| Payment ledger | One row per settled payment: `txn_date`, `amount > 0`, `status` (settled / offline), payer name, invoice reference, `is_autopay`, entry channel, and `loaded_at` per load. In ERL this is `mycase_transactions_rich` → `v_mycase_txn_settlement_key`. |
| AR snapshots | Dated, immutable snapshots of open invoices: invoice key, client key, `due_date`, `amount_due`. In ERL: `ar_source_snapshots` + `ar_source_rows`, with a denylist for degraded snapshots. |
| Payment plans | A current plan list plus an append-only history: plan key, client, `autopay`, `amount_due`, `next_due_date`, `as_of`. In ERL: `mycase_payment_plans` + `payment_plan_state_history`. |
| Firm parameters | Local time zone (`p_tz`, default `America/New_York`), silence threshold (`p_silence_days`, default 60), consult-size ceiling (`p_consult_max`, default 300), broken-draft grace (`p_grace_days`, default 7), and the spine start date. |

**Out of scope here.** There is no `firm_id` yet. Multi-tenancy (per-firm row isolation and per-firm credentials) is a separate build. These objects are written so a tenant key can be added as one more filter column without changing any definition.

## 6. Objects

| Object | Role |
|---|---|
| `mv_delinquent_cash_txn` | Spine, transaction grain. Unchanged. |
| `dcm_ledger_cutoff(p_tz)` | The complete-through date. |
| `delinquent_collections_metrics(p_start, p_end, p_silence_days, p_consult_max)` | Every metric for any window. **The one definition.** |
| `dcm_broken_autodraft(p_tz, p_grace_days)` | Point-in-time cohort. |
| `dcm_new_plans_by_load()` | New plans per plan-feed load. |
| `mv_delinquent_collections_kpi` | Cached rows: mtd, mtd_prior, month, week. Refreshed by `refresh_delinquent_cash_spine()`. |
| `v_delinquent_collections_kpi` | App read surface: `security_invoker = true`, SELECT for `authenticated` only, no `anon`. |
| `mv_delinquent_collections_plan_loads` / `v_delinquent_collections_plan_loads` | Cached per-load plan rows, with the same grants. |

**Tie rule.** For every closed month and closed week, the cash columns, `n_delinquent_txns`, `willing_payers` and `unresolved_cash` equal the existing spine views `v_delinquent_cash_monthly` / `v_delinquent_cash_weekly` **to the cent**. The MTD row equals the spine's transaction rows filtered to `[period_start, complete_through]`. `scripts/tie_delinquent_collections_kpi.sql` re-derives both checks.

## 7. Certification

The VP (supabase-auditor) certified this layer on 2026-10-14:

- **Certification:** `ddl_migration_audit` `b794d259-c376-4c7d-abd1-ad7ed967e6e2`, key `vp_20261014_delinquent_collections_kpi`.
- **Migration:** `20261014205646_delinquent_collections_kpi.sql`, applied, anchored to AR snapshot `734dedb0` (2026-10-12).
- **Cohort keys:** all six are in `cohort_registry` with executable SQL; each measure reproduced its figure.
- **Tie script:** 52 of 52 checks tie.
- **Status:** `derived`. The KPI inherits the delinquent-cash spine's certification, which has been pending since 2026-09-18. The panel badge reads `ar_object_basis_registry` and shows "derived · spine certification pending" until both the spine and the KPI are `certified`. The registry is RLS-protected with no read policy, so the app falls back to that conservative label.
