import fs from "node:fs";
import path from "node:path";

const deepDivePath = path.resolve("scripts", "output", "mycase_low_confidence_deepdive_20260505.csv");
const rescorePath = path.resolve("scripts", "output", "mycase_192_blank_contract_rescore_20260505.csv");
const outPath = path.resolve("scripts", "output", "mycase_low_lawpay_review_20260505.csv");

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
      } else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cur);
      cur = "";
    } else if (c === "\n") {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else if (c !== "\r") cur += c;
  }
  if (cur || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function readObjects(filePath) {
  const rows = parseCSV(fs.readFileSync(filePath, "utf8"));
  const headers = rows.shift();
  return rows
    .filter((row) => row.length === headers.length)
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])));
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const deepRows = readObjects(deepDivePath)
  .filter(
    (row) =>
      row.review_reason === "candidate_contract_already_has_other_invoice" &&
      Number(row.lawpay_unmatched_amount || 0) > 0
  )
  .sort((a, b) => Number(b.lawpay_unmatched_amount || 0) - Number(a.lawpay_unmatched_amount || 0));

const rescoreRows = readObjects(rescorePath);
const bestBlankByInvoice = new Map();
for (const row of rescoreRows) {
  if (row.candidate_rank !== "1") continue;
  bestBlankByInvoice.set(row.invoice_number, row);
}

const output = deepRows.map((row) => {
  const blank = bestBlankByInvoice.get(row.invoice_number) || {};
  const betterPath =
    blank.recommendation === "review_blank_contract_candidate" &&
    Number(blank.rescore || 0) > Number(row.top_score || 0)
      ? "blank_contract_candidate_is_better_but_still_review"
      : "existing_invoice_contract_candidate_only";
  return {
    priority: Number(row.lawpay_unmatched_amount || 0) >= 3000 ? "P1" : "P2",
    better_path: betterPath,
    invoice_number: row.invoice_number,
    description: row.description,
    invoice_status: row.invoice_status,
    amount_due: row.amount_due,
    lawpay_unmatched_amount: row.lawpay_unmatched_amount,
    original_shared_tokens: row.shared_name_tokens,
    original_score: row.top_score,
    original_candidate_client: row.top_client_name,
    original_contract_invoice: row.top_contract_invoice_number,
    original_contract_balance: row.top_contract_balance,
    blank_candidate_score: blank.rescore || "",
    blank_shared_tokens: blank.shared_tokens || "",
    blank_candidate_client: blank.contract_client || "",
    blank_contract_case_number: blank.contract_case_number || "",
    blank_contract_balance: blank.contract_balance || "",
    blank_balance_gap: blank.balance_gap || "",
    invoice_row_id: row.invoice_row_id,
    original_contract_id: row.contract_id,
    blank_contract_id: blank.contract_id || "",
  };
});

const headers = Object.keys(output[0] || {});
fs.writeFileSync(
  outPath,
  [headers.join(","), ...output.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n") + "\n",
  "utf8"
);

const summary = output.reduce((acc, row) => {
  acc[row.priority] ??= { count: 0, lawpay: 0, due: 0 };
  acc[row.priority].count += 1;
  acc[row.priority].lawpay += Number(row.lawpay_unmatched_amount || 0);
  acc[row.priority].due += Number(row.amount_due || 0);
  return acc;
}, {});

console.log(JSON.stringify({ rows: output.length, summary, outPath, top10: output.slice(0, 10) }, null, 2));
