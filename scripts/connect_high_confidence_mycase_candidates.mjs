import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const csvPath = path.resolve("scripts", "output", "mycase_unlinked_invoice_candidates_20260505.csv");
const supabaseCli = path.resolve("node_modules", "supabase", "bin", "supabase.exe");
const sqlPath = path.resolve("scripts", "output", "connect_high_confidence_mycase_candidates_20260505.sql");

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (quoted) {
      if (c === '"' && n === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        cur += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(cur);
      cur = "";
    } else if (c === "\n") {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else if (c !== "\r") {
      cur += c;
    }
  }
  if (cur || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function sqlString(value) {
  if (value === null || value === undefined || value === "") return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

const csv = fs.readFileSync(csvPath, "utf8");
const rows = parseCSV(csv);
const headers = rows.shift();
const records = rows
  .filter((row) => row.length === headers.length)
  .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])));

const selected = records.filter(
  (row) =>
    row.candidate_rank === "1" &&
    ["high_lawpay_name_contract", "high_name_contract"].includes(row.confidence_bucket) &&
    row.invoice_row_id &&
    row.client_id &&
    row.contract_id
);

if (selected.length === 0) throw new Error("No high-confidence rows found.");

const values = selected
  .map(
    (row) =>
      `(${sqlString(row.invoice_row_id)}::uuid, ${sqlString(row.client_id)}::uuid, ${sqlString(
        row.contract_id
      )}::uuid, ${sqlString(row.confidence_bucket)}, ${Number(row.score || 0)}, ${sqlString(row.invoice_number)})`
  )
  .join(",\n");

const sql = `
begin;

create table if not exists public.mycase_invoice_links_backup_20260505_pre_high_confidence_connect as
with target(invoice_row_id, client_id, contract_id, confidence_bucket, score, invoice_number) as (
  values
  ${values}
)
select mi.*
from public.mycase_invoices mi
join target t on t.invoice_row_id = mi.id;

with target(invoice_row_id, client_id, contract_id, confidence_bucket, score, invoice_number) as (
  values
  ${values}
)
update public.mycase_invoices mi
set matched_client_id = target.client_id,
    matched_contract_id = target.contract_id,
    match_type = target.confidence_bucket,
    updated_at = now()
from target
where mi.id = target.invoice_row_id
  and mi.matched_contract_id is null;

with target(invoice_row_id, client_id, contract_id, confidence_bucket, score, invoice_number) as (
  values
  ${values}
)
update public.contracts c
set invoice_number = target.invoice_number
from target
where c.id = target.contract_id
  and nullif(trim(coalesce(c.invoice_number, '')), '') is null;

commit;

select
  count(*) filter (where mi.match_type in ('high_lawpay_name_contract','high_name_contract')) as connected_high_confidence,
  count(*) filter (where mi.match_type = 'high_lawpay_name_contract') as connected_lawpay_high,
  count(*) filter (where mi.match_type = 'high_name_contract') as connected_name_high,
  count(*) filter (where mi.matched_contract_id is null) as remaining_unlinked,
  coalesce(sum(mi.amount_due) filter (where mi.matched_contract_id is null),0) as remaining_unlinked_due
from public.mycase_invoices mi;
`;

fs.mkdirSync(path.dirname(sqlPath), { recursive: true });
fs.writeFileSync(sqlPath, sql, "utf8");

const stdout = execFileSync(supabaseCli, ["db", "query", "--linked", "-f", sqlPath], {
  encoding: "utf8",
  maxBuffer: 1024 * 1024 * 20,
});

console.log(stdout);
