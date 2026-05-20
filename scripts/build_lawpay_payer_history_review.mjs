import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const supabaseCli = path.resolve("node_modules", "supabase", "bin", "supabase.exe");
const outPath = path.resolve("scripts", "output", "lawpay_name_only_large_payer_history_20260505.csv");

function fetchRows(sql) {
  const stdout = execFileSync(supabaseCli, ["db", "query", "--linked", "-o", "json", sql], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 80,
  });
  return JSON.parse(stdout).rows || [];
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const rows = fetchRows(`
  with target as (
    select *
    from public.lawpay_payment_matching_review
    where review_reason = 'name_only_large_payment_review'
  ),
  history as (
    select
      t.lawpay_transaction_id as target_transaction_id,
      h.lawpay_transaction_id as history_transaction_id,
      h.payment_date,
      h.amount,
      h.lawpay_reference,
      h.review_reason,
      h.reference_digits,
      h.lawpay_payer_name,
      h.lawpay_payer_email,
      h.lawpay_card_fingerprint,
      h.match_confidence,
      h.match_reason,
      case
        when h.lawpay_card_fingerprint is not null and h.lawpay_card_fingerprint = t.lawpay_card_fingerprint then 'fingerprint'
        when h.lawpay_payer_email is not null and lower(h.lawpay_payer_email) = lower(t.lawpay_payer_email) then 'email'
        when h.lawpay_payer_name is not null and lower(h.lawpay_payer_name) = lower(t.lawpay_payer_name) then 'payer_name'
        else 'unknown'
      end as link_type
    from target t
    join public.lawpay_payment_matching_review h
      on h.lawpay_row_id <> t.lawpay_row_id
     and (
       (h.lawpay_card_fingerprint is not null and h.lawpay_card_fingerprint = t.lawpay_card_fingerprint)
       or (h.lawpay_payer_email is not null and t.lawpay_payer_email is not null and lower(h.lawpay_payer_email) = lower(t.lawpay_payer_email))
       or (h.lawpay_payer_name is not null and t.lawpay_payer_name is not null and lower(h.lawpay_payer_name) = lower(t.lawpay_payer_name))
     )
  ),
  hist_summary as (
    select
      target_transaction_id,
      count(*) as history_rows,
      count(*) filter (where review_reason = 'invoice_confirmed') as confirmed_invoice_history,
      count(*) filter (where review_reason = 'lawpay_invoice_missing_from_mycase_export') as missing_invoice_history,
      count(*) filter (where review_reason = 'consultation_like') as consultation_history,
      count(*) filter (where review_reason = 'small_payment_review') as small_payment_history,
      coalesce(sum(amount),0) as history_amount_total,
      string_agg(distinct link_type, ', ' order by link_type) as link_types,
      string_agg(
        concat(payment_date, ' | $', amount, ' | ', review_reason, ' | ', coalesce(lawpay_reference,'')),
        ' || '
        order by payment_date desc, amount desc
      ) as history_timeline
    from history
    group by target_transaction_id
  )
  select
    case
      when hs.confirmed_invoice_history > 0 then 'strong_confirmed_invoice_history'
      when hs.missing_invoice_history > 0 then 'medium_missing_invoice_history'
      when hs.consultation_history > 0 then 'consultation_history_only'
      when hs.history_rows > 0 then 'other_history_only'
      else 'no_prior_history'
    end as payer_history_bucket,
    t.lawpay_transaction_id,
    t.payment_date,
    t.amount,
    t.lawpay_reference,
    t.lawpay_payer_name,
    t.lawpay_payer_email,
    t.lawpay_card_fingerprint,
    t.card_last_four,
    t.card_brand,
    coalesce(hs.history_rows,0) as history_rows,
    coalesce(hs.confirmed_invoice_history,0) as confirmed_invoice_history,
    coalesce(hs.missing_invoice_history,0) as missing_invoice_history,
    coalesce(hs.consultation_history,0) as consultation_history,
    coalesce(hs.small_payment_history,0) as small_payment_history,
    coalesce(hs.history_amount_total,0) as history_amount_total,
    hs.link_types,
    hs.history_timeline
  from target t
  left join hist_summary hs on hs.target_transaction_id = t.lawpay_transaction_id
  order by
    case
      when hs.confirmed_invoice_history > 0 then 1
      when hs.missing_invoice_history > 0 then 2
      when hs.consultation_history > 0 then 3
      when hs.history_rows > 0 then 4
      else 5
    end,
    t.amount desc,
    t.payment_date desc;
`);

const headers = Object.keys(rows[0] || {});
fs.writeFileSync(
  outPath,
  [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n") + "\n",
  "utf8"
);

const summary = rows.reduce((acc, row) => {
  acc[row.payer_history_bucket] ??= { count: 0, amount: 0 };
  acc[row.payer_history_bucket].count += 1;
  acc[row.payer_history_bucket].amount += Number(row.amount || 0);
  return acc;
}, {});

console.log(JSON.stringify({ rows: rows.length, summary, outPath, topRows: rows.slice(0, 10) }, null, 2));
