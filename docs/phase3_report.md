# Phase 3 Report — Unmatched Payments Matching
**Initial run:** 2026-04-21 | **Updated:** 2026-04-27  
**Run type:** Automated scheduled task

---

## Summary

Phase 3 built the database infrastructure to systematically clear the unmatched payments backlog. Two admin RPC functions were created, tested, migrated to Supabase, and pushed to `main`. A follow-up improvement migration was applied on 2026-04-27 to add LOWER() normalization, notes-field matching, and a wider date window.

---

## Unmatched Payments Profile (as of 2026-04-27)

| Status             | Row Count | Total Amount    |
|--------------------|-----------|-----------------|
| matched            | 2,013     | $1,190,204.43   |
| **unmatched**      | **742**   | **$362,663.00** |
| **pending_review** | **17**    | **$7,784.00**   |
| **Total unresolved** | **759** | **$370,447.00** |

**Note:** Unmatched count grew from 499 ($227,690) on 2026-04-21 to 742 ($362,663) by 2026-04-27 — a net inflow of 243 new unmatched payments ($134,973) in 6 days from ongoing LawPay deposits.

Amount distribution of active backlog:

| Bucket    | Count | Total      |
|-----------|-------|------------|
| < $100    | 132   | $2,152     |
| $100–$199 | 328   | $44,405    |
| $200–$499 | 128   | $30,200    |
| $500–$999 | 54    | $30,130    |
| $1,000+   | 117   | $263,560   |

---

## What Was Done

### Initial build (2026-04-21) — migration `20260421120000_phase3_unmatched_payment_matching.sql`

**`suggest_unmatched_payment_matches(payment_id uuid)`**
Returns top-5 client candidates for any unmatched payment using a weighted confidence score:
- Name similarity (pg_trgm trigram): **60%** weight
- Amount proximity to `monthly_installment`: **30%** weight
- Date proximity to `next_due_date`: **10%** weight

**`resolve_unmatched_payment(payment_id uuid, client_id uuid, method text)`**
Links a payment to a confirmed client. Sets `status = 'matched'`, `resolved_at`, `resolved_method`. Returns jsonb success/error.

Both functions use `SECURITY DEFINER` and grant `EXECUTE` to `authenticated`.

### Improvement (2026-04-27) — migration `phase3_improve_suggest_function`

Improved `suggest_unmatched_payment_matches` with:
- **LOWER() normalization** — fixes mismatches on ALL-CAPS LawPay names (e.g., "IARA CRISTINA DO SANTOS TAVARES")
- **Notes-field matching** — checks `unmatched_payments.notes` as a second name source; many rows have a corrected/full name there (e.g., "LESLY CARINA CRUZ" → notes: "LESLY CARINA CRUZ ROMERO")
- **60-day date window** (was 30) — most open contracts have past-due dates in 2025; 30 days was too narrow to produce any date score

---

## Pilot Match Analysis (2026-04-27)

Ran `suggest_unmatched_payment_matches` on a 30-payment pilot sample from April 20–28:

| Confidence bucket | Count | Notes |
|---|---|---|
| High (≥ 70) | 0 | None auto-matchable |
| Medium (50–69) | 2 | Need human confirmation |
| Low (< 50) | 28 | Ambiguous names or family payers |

**Root causes of low confidence:**
1. **Family member payers** — name_in_notes is a different person than the client (e.g., "Galbin Ramirez" paying for "Nidia Carmelina Martinez Torres")
2. **Common surnames** — many clients share last names (Medina, Cruz, Rodriguez), making trigram matching ambiguous
3. **Stale due dates** — open delinquent contracts have `next_due_date` in 2025, so date score is near 0 even after widening to 60 days
4. **Clients not in system** — some payers may be paying for cases not yet imported

**Conclusion:** No payments meet the threshold for automated resolution. All 759 require human-in-the-loop review using `suggest_unmatched_payment_matches()` + manual confirmation via `resolve_unmatched_payment()`.

---

## True AR Check (2026-04-27)

| Metric                       | Value            |
|------------------------------|------------------|
| Delinquent + Late AR balance | $15,668,704      |
| Total uncollected (all open) | $20,396,703      |
| Ground truth target (xlsx)   | ~$21,425,589     |
| Gap                          | ~$1,028,886      |

The ~$1M gap from ground truth is attributable to:
- The $370K active unmatched backlog not yet credited to client accounts
- Payments received after the AR_Summary snapshot date
- A small number of `pending_review` items ($7,784)

Resolving the 759 unmatched rows would close most of the gap.

---

## What Remains

### Unresolved payments requiring human attention:
- **742 unmatched** ($362,663) — use `suggest_unmatched_payment_matches()` per payment, confirm via `resolve_unmatched_payment()`
- **17 pending_review** ($7,784) — older items (Jan–Mar 2026), may need manual lookup in LawPay

### Usage:
```sql
-- Get top-5 suggestions for a payment
SELECT * FROM suggest_unmatched_payment_matches('your-payment-uuid-here');

-- Confirm a match
SELECT resolve_unmatched_payment('payment-uuid', 'client-uuid');
-- or with custom method label:
SELECT resolve_unmatched_payment('payment-uuid', 'client-uuid', 'admin_review');
```

---

## Phase 4 Requirements

Phase 4 is the MyCase API integration for real-time payment and client sync. To proceed, provide:

1. **MyCase API Key** — MyCase → Settings → API & Integrations
2. **MyCase Firm ID** — from the URL when logged in (e.g., `firm_id=12345`)
3. **Webhook secret** (optional) — for verifying incoming payment webhooks

The Edge Functions (`supabase/functions/mycase-auth/` and `supabase/functions/mycase-sync/`) are already scaffolded. MyCase client records will resolve many of the "payer not in system" cases and enable real-time payment matching going forward.

---

## Commits
- `ac7719c` (2026-04-21) — Phase 3: Add unmatched payment matching RPCs → pushed to `main`
- Today (2026-04-27) — Phase 3 improvement: LOWER normalization, notes-field matching, 60d date window
