# Phase 3 Report — Unmatched Payments Matching
**Date:** 2026-04-21  
**Run type:** Automated scheduled task

---

## Summary

Phase 3 built the database infrastructure to systematically clear the unmatched payments backlog. Two admin RPC functions were created, tested, migrated to Supabase, and pushed to `main`.

---

## Unmatched Payments Profile

| Status          | Row Count | Total Amount    |
|-----------------|-----------|-----------------|
| matched         | 2,013     | $1,190,204.43   |
| **unmatched**   | **499**   | **$227,690.00** |
| **pending_review** | **17** | **$7,784.00**   |
| **Total unresolved** | **516** | **$235,474.00** |

Date range of unmatched: 2026-04-06 → 2026-04-21 (recent inflows)  
Date range of pending_review: 2026-01-01 → 2026-03-03 (older backlog)

---

## What Was Done

### 1. Profiled the unmatched_payments table
- Confirmed columns: `id`, `name_in_notes`, `amount`, `payment_date`, `notes`, `status`, `matched_client_id`, `resolved_at`, `resolved_method`
- Identified `name_in_notes` as the primary matching signal
- Confirmed `pg_trgm` extension is available for fuzzy name matching

### 2. Built matching RPCs (migration `20260421120000_phase3_unmatched_payment_matching.sql`)

**`suggest_unmatched_payment_matches(payment_id uuid)`**  
Returns top-5 client candidates for any unmatched payment using a weighted confidence score:
- Name similarity (trigram): **60%** weight
- Amount proximity to `monthly_installment`: **30%** weight  
- Date proximity to `next_due_date`: **10%** weight

**`resolve_unmatched_payment(payment_id uuid, client_id uuid, method text)`**  
Links a payment to a confirmed client. Sets `status = 'matched'`, `resolved_at`, and `resolved_method`. Returns jsonb success/error response.

### 3. Applied migration to Supabase (project: qbrufeewsisljtoegops)
- Both functions live in the `public` schema
- Granted `EXECUTE` to `authenticated` role

### 4. Pilot match test
Ran `suggest_unmatched_payment_matches` across 20 recent unmatched payments:
- **Highest confidence found: 49.1%** (Reyna Martinez Munoz → Elvira Munoz Martinez — same last names, different person)
- **No payments exceeded 60% confidence threshold**
- This is expected: these payments are unmatched precisely because name data is ambiguous or differs from the client record (nicknames, middle names, family members paying on behalf of clients)

**No automated resolutions were applied.** All matches require human review via the suggest RPC + manual confirmation via resolve RPC.

---

## True AR Check

| Metric                    | Value            |
|---------------------------|------------------|
| total_ar_value (contracts)| $52,373,213      |
| total_collected           | $31,855,212      |
| **total_remaining (AR)**  | **$20,518,001**  |
| overdue_ar                | $16,007,555      |
| Ground truth target       | ~$21,425,589     |
| Gap                       | ~$907,588        |

The ~$907K gap from ground truth is likely attributable to:
- Payments received after the AR_Summary snapshot date
- The `pending_review` and remaining `unmatched` payments not yet linked to contracts

---

## What Remains

### Unresolved payments requiring human attention:
- **499 unmatched** ($227,690) — use `suggest_unmatched_payment_matches()` per payment, confirm via `resolve_unmatched_payment()`
- **17 pending_review** ($7,784) — older items (Jan–Mar 2026), may need manual lookup

### Usage example:
```sql
-- Get top-5 suggestions for a payment
SELECT * FROM suggest_unmatched_payment_matches('your-payment-uuid-here');

-- Confirm a match
SELECT resolve_unmatched_payment('payment-uuid', 'client-uuid');
```

---

## Phase 4 Requirements

Phase 4 is the MyCase API integration for real-time payment sync. To proceed, Jeffrey needs to provide:

1. **MyCase API Key** — from MyCase → Settings → API & Integrations
2. **MyCase Firm ID** — from the URL when logged in (e.g., `firm_id=12345`)
3. **Webhook secret** (optional) — for verifying incoming payment webhooks

The Edge Functions (`supabase/functions/mycase-auth/` and `supabase/functions/mycase-sync/`) are already scaffolded and waiting for credentials.

---

## Commit
`ac7719c` — Phase 3: Add unmatched payment matching RPCs → pushed to `main`
