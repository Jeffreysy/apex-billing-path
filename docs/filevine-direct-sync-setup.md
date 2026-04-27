# Filevine Direct Sync Setup

This project now supports a direct Filevine-to-Supabase payment pipeline without Zapier.

## Live webhook endpoint

Point Filevine payment webhooks to:

```text
https://qbrufeewsisljtoegops.supabase.co/functions/v1/crm2-payment-received
```

This endpoint:

- accepts Filevine payment webhook payloads
- matches by `invoice_number` first
- falls back to `contracts.invoice_number`
- creates a `payments` row
- updates invoice and contract balances
- logs a `collection_activities` row with `origin = Filevine Webhook`
- stores every event in `filevine_payment_events`

## Historical backfill function

Historical payment backfill is handled by:

```text
https://qbrufeewsisljtoegops.supabase.co/functions/v1/filevine-payments-backfill
```

This function can:

- fetch from a Filevine payments history endpoint using secrets, or
- accept an array of payment records directly in the request body

Each record is pushed through the same booking pipeline as the live webhook.

## Required Supabase secrets

Set these secrets in the linked Supabase project:

```powershell
npx.cmd supabase secrets set FILEVINE_API_TOKEN="YOUR_FILEVINE_PAT"
npx.cmd supabase secrets set FILEVINE_PAYMENTS_URL="YOUR_FILEVINE_PAYMENTS_HISTORY_URL"
```

Recommended values:

- `FILEVINE_API_TOKEN`
  - your Filevine personal access token
- `FILEVINE_PAYMENTS_URL`
  - the Filevine API endpoint that returns payment history

## Test the webhook manually

You can post a sample Filevine payment like this:

```powershell
$body = @{
  "Payment Id" = "1537259"
  "Invoice Number" = "6333"
  "Payment Total" = 4000
  "Payment Date" = "2026-02-17T00:00:00Z"
  "Payment Source" = "Cash"
  "Created By User Name" = "Robert Sapp"
  "Filevine Event Type" = "Created"
  "Filevine Object Type" = "Payment"
  "Project Id" = "13635843"
  "Project Name" = "Unknown"
  "Invoices ID" = "530626"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "https://qbrufeewsisljtoegops.supabase.co/functions/v1/crm2-payment-received" `
  -ContentType "application/json" `
  -Body $body
```

## Test a historical backfill

If the Filevine history secrets are configured:

```powershell
$body = @{
  from_date = "2026-02-01"
  to_date = "2026-02-29"
  page_size = 100
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "https://qbrufeewsisljtoegops.supabase.co/functions/v1/filevine-payments-backfill" `
  -ContentType "application/json" `
  -Body $body
```

If you want to pass records directly:

```powershell
$body = @{
  records = @(
    @{
      "Payment Id" = "1537259"
      "Invoice Number" = "6333"
      "Payment Total" = 4000
      "Payment Date" = "2026-02-17T00:00:00Z"
      "Payment Source" = "Cash"
      "Created By User Name" = "Robert Sapp"
      "Filevine Event Type" = "Created"
      "Filevine Object Type" = "Payment"
      "Project Id" = "13635843"
      "Invoices ID" = "530626"
    }
  )
} | ConvertTo-Json -Depth 6

Invoke-RestMethod `
  -Method Post `
  -Uri "https://qbrufeewsisljtoegops.supabase.co/functions/v1/filevine-payments-backfill" `
  -ContentType "application/json" `
  -Body $body
```

## Where to validate in the app

Open Financial Oversight and review:

- Filevine Validation
- LawPay Validation
- Cash Validation

These panels help compare:

- booked payments
- collector logs
- Filevine event ledger
- LawPay event ledger

## Remaining dependency

The final missing piece is the real Filevine history endpoint URL and PAT.
Once those are configured, the Zapier dependency can be retired.
