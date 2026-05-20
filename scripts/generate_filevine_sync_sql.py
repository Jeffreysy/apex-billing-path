"""
Generate SQL UPDATE statements to sync Filevine April payments into LexCollect contracts.
Produces two files:
  1. preview_filevine_sync.sql  — SELECT showing before/after for review
  2. apply_filevine_sync.sql    — UPDATE statements to run after review
"""
import pandas as pd
from datetime import date

df = pd.read_csv(r'C:\Users\JeffreySoto-Gil\Downloads\filevine_matched_contracts.csv')

# Only update contracts where delinquency is NOT current, OR where last_txn_date
# predates April (meaning the April payment definitely hasn't been credited yet)
df['sb_last_txn_date'] = pd.to_datetime(df['sb_last_txn_date'], errors='coerce')
df['last_txn_date'] = pd.to_datetime(df['last_txn_date'], errors='coerce')

# Skip rows where LexCollect already recorded a transaction on or after the Filevine last txn date
# (means payment already synced via another path)
already_synced = df[
    df['sb_last_txn_date'].notna() &
    (df['sb_last_txn_date'] >= df['last_txn_date'])
]
to_update = df[~df.index.isin(already_synced.index)].copy()

print(f"Total matched: {len(df)}")
print(f"Already synced (skip): {len(already_synced)}")
print(f"Need update: {len(to_update)}")

preview_lines = [
    "-- ============================================================",
    "-- PREVIEW: Filevine April 2026 Payment Sync into LexCollect",
    "-- Run this SELECT first to review before applying UPDATEs",
    "-- Generated: 2026-05-03",
    "-- ============================================================",
    "",
    "SELECT",
    "  co.id as contract_id,",
    "  c.name as client_name,",
    "  co.status,",
    "  co.delinquency_status as current_delinquency,",
    "  co.collected as current_collected,",
    "  co.value as current_remaining,",
    "  co.last_transaction_date as current_last_txn_date,",
    "  -- What will change:",
    "  fv.apr_paid as filevine_apr_amount,",
    "  (co.collected + fv.apr_paid) as new_collected,",
    "  (co.value - fv.apr_paid) as new_remaining,",
    "  fv.last_txn_date as new_last_txn_date,",
    "  fv.last_txn_amount as new_last_txn_amount",
    "FROM contracts co",
    "JOIN clients c ON c.id = co.client_id",
    "JOIN (VALUES"
]

value_lines = []
for _, row in to_update.iterrows():
    cid = row['contract_id']
    apr_paid = float(row['apr_paid'])
    last_date = row['last_txn_date'].strftime('%Y-%m-%d') if pd.notna(row['last_txn_date']) else '2026-04-28'
    last_amt = float(row['last_txn_amount']) if pd.notna(row['last_txn_amount']) else apr_paid
    value_lines.append(f"  ('{cid}', {apr_paid:.2f}, '{last_date}', {last_amt:.2f})")

preview_lines.append(',\n'.join(value_lines))
preview_lines += [
    ") AS fv(contract_id, apr_paid, last_txn_date, last_txn_amount)",
    "  ON co.id = fv.contract_id::uuid",
    "ORDER BY co.delinquency_status, c.name;",
]

# Generate UPDATE statements
update_lines = [
    "-- ============================================================",
    "-- APPLY: Filevine April 2026 Payment Sync into LexCollect",
    "-- REVIEW preview_filevine_sync.sql BEFORE running this file",
    "-- Generated: 2026-05-03",
    "-- ============================================================",
    "",
    "BEGIN;",
    "",
    "-- Step 1: Credit April Filevine payments to each contract",
    "",
]

for _, row in to_update.iterrows():
    cid = row['contract_id']
    client = str(row['supabase_name']).replace("'", "''")
    apr_paid = float(row['apr_paid'])
    last_date = row['last_txn_date'].strftime('%Y-%m-%d') if pd.notna(row['last_txn_date']) else '2026-04-28'
    last_amt = float(row['last_txn_amount']) if pd.notna(row['last_txn_amount']) else apr_paid
    fv_project = str(row['filevine_project']).replace("'", "''")

    update_lines += [
        f"-- {client}  |  Filevine: {fv_project}  |  Apr paid: ${apr_paid:,.2f}",
        f"UPDATE contracts SET",
        f"  collected = collected + {apr_paid:.2f},",
        f"  value = GREATEST(0, value - {apr_paid:.2f}),",
        f"  last_transaction_date = '{last_date}',",
        f"  last_transaction_amount = {last_amt:.2f},",
        f"  last_transaction_source = 'Filevine'",
        f"WHERE id = '{cid}';",
        "",
    ]

all_ids = ",\n  ".join([f"'{r['contract_id']}'" for _, r in df.iterrows()])

update_lines += [
    "",
    "-- Step 2: Recalculate delinquency_status for ALL 109 matched contracts",
    "-- (85 already had the txn date recorded but status was never cleared)",
    "-- Current = next_due_date >= today or value <= 0",
    "-- Late    = next_due_date between 1 and 30 days ago",
    "-- Delinquent = next_due_date > 30 days ago",
    "",
    "UPDATE contracts SET",
    "  delinquency_status = CASE",
    "    WHEN value <= 0 THEN 'Paid'",
    "    WHEN next_due_date IS NULL THEN delinquency_status",
    "    WHEN next_due_date >= CURRENT_DATE THEN 'Current'",
    "    WHEN next_due_date >= CURRENT_DATE - INTERVAL '30 days' THEN 'Late'",
    "    ELSE 'Delinquent'",
    "  END",
    "WHERE id IN (",
    f"  {all_ids}",
    ");",
    "",
    "-- Step 3: Verify — count by new delinquency status (all 109 matched contracts)",
    "SELECT delinquency_status, COUNT(*) FROM contracts",
    "WHERE id IN (",
    f"  {all_ids}",
    ")",
    "GROUP BY delinquency_status;",
    "",
    "-- If results look correct, run: COMMIT;",
    "-- If anything looks wrong, run:  ROLLBACK;",
    "",
    "-- COMMIT;",
]

out_dir = r'C:\Users\JeffreySoto-Gil\Downloads'
with open(f'{out_dir}\\preview_filevine_sync.sql', 'w') as f:
    f.write('\n'.join(preview_lines))
with open(f'{out_dir}\\apply_filevine_sync.sql', 'w') as f:
    f.write('\n'.join(update_lines))

print(f"\nFiles saved to {out_dir}:")
print("  preview_filevine_sync.sql  — run this first to review")
print("  apply_filevine_sync.sql    — apply after review (ends with COMMIT commented out)")
print(f"\nUpdate summary:")
print(to_update.groupby(['contract_status','delinquency_status']).size().reset_index(name='count').to_string(index=False))
print(f"\nTotal April credits to apply: ${to_update['apr_paid'].sum():,.2f}")
print(f"Already synced / skip:        ${already_synced['apr_paid'].sum():,.2f}")
