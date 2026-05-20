import fs from "node:fs";
import path from "node:path";

const inputPath = path.resolve("scripts", "output", "mycase_unlinked_invoice_candidates_20260505.csv");
const outputPath = path.resolve("scripts", "output", "mycase_low_confidence_deepdive_20260505.csv");

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

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function normalize(value) {
  return String(value || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !["NOT", "HIRED", "VISA"].includes(token));
}

function invoiceTokens(description) {
  const clean = String(description || "").replace(/\b(NO|NOT)\s+HIRED\b/gi, "");
  const [beforeComma, afterComma = ""] = clean.split(",", 2);
  return [...new Set(tokens(`${afterComma} ${beforeComma}`))];
}

function sharedTokens(description, clientName) {
  const invoiceSet = new Set(invoiceTokens(description));
  return tokens(clientName).filter((token) => invoiceSet.has(token));
}

function reason(top, allCandidates) {
  const score = Number(top.score || 0);
  const lawpay = Number(top.lawpay_unmatched_amount || 0);
  const topShared = sharedTokens(top.description, top.client_name);
  const sameScoreCount = allCandidates.filter((row) => Number(row.score || 0) === score).length;
  if (top.invoice_status === "Unsent" || top.invoice_status === "Sent") return "draft_or_small_status_review";
  if (top.contract_invoice_number) return "candidate_contract_already_has_other_invoice";
  if (topShared.length <= 1) return "single_token_common_name_match";
  if (sameScoreCount >= 3) return "many_candidates_same_score";
  if (lawpay > 0 && !top.contract_invoice_number) return "lawpay_present_blank_contract_invoice";
  return "manual_review";
}

const rows = parseCSV(fs.readFileSync(inputPath, "utf8"));
const headers = rows.shift();
const records = rows
  .filter((row) => row.length === headers.length)
  .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])));

const lowTopInvoiceIds = new Set(
  records
    .filter((row) => row.candidate_rank === "1" && row.confidence_bucket === "low_review_contract")
    .map((row) => row.invoice_row_id)
);
const byInvoice = new Map();
for (const row of records.filter((item) => lowTopInvoiceIds.has(item.invoice_row_id))) {
  if (!byInvoice.has(row.invoice_row_id)) byInvoice.set(row.invoice_row_id, []);
  byInvoice.get(row.invoice_row_id).push(row);
}

const output = [];
for (const candidates of byInvoice.values()) {
  candidates.sort((a, b) => Number(a.candidate_rank || 0) - Number(b.candidate_rank || 0));
  const top = candidates[0];
  const topShared = sharedTokens(top.description, top.client_name);
  const altSummary = candidates
    .slice(1, 5)
    .map((row) => `${row.candidate_rank}. ${row.client_name} [${row.score}] ${row.contract_status || ""} ${row.contract_invoice_number || ""}`)
    .join(" | ");
  output.push({
    review_reason: reason(top, candidates),
    invoice_number: top.invoice_number,
    description: top.description,
    invoice_status: top.invoice_status,
    amount_due: top.amount_due,
    due_date: top.due_date,
    lawpay_unmatched_amount: top.lawpay_unmatched_amount,
    top_score: top.score,
    shared_name_tokens: topShared.join(" "),
    top_client_name: top.client_name,
    top_client_number: top.client_number,
    top_client_case_number: top.client_case_number,
    top_contract_status: top.contract_status,
    top_contract_value: top.contract_value,
    top_contract_collected: top.contract_collected,
    top_contract_balance: top.contract_balance,
    top_contract_case_number: top.contract_case_number,
    top_contract_invoice_number: top.contract_invoice_number,
    alternate_candidates: altSummary,
    invoice_row_id: top.invoice_row_id,
    client_id: top.client_id,
    contract_id: top.contract_id,
  });
}

output.sort((a, b) => {
  const lawpayDelta = Number(b.lawpay_unmatched_amount || 0) - Number(a.lawpay_unmatched_amount || 0);
  if (lawpayDelta) return lawpayDelta;
  return Number(b.amount_due || 0) - Number(a.amount_due || 0);
});

const outHeaders = Object.keys(output[0] || {});
fs.writeFileSync(
  outputPath,
  [outHeaders.join(","), ...output.map((row) => outHeaders.map((header) => csvEscape(row[header])).join(","))].join("\n") + "\n",
  "utf8"
);

const summary = output.reduce((acc, row) => {
  acc[row.review_reason] ??= { count: 0, amount_due: 0, lawpay: 0 };
  acc[row.review_reason].count += 1;
  acc[row.review_reason].amount_due += Number(row.amount_due || 0);
  acc[row.review_reason].lawpay += Number(row.lawpay_unmatched_amount || 0);
  return acc;
}, {});

console.log(JSON.stringify({ rows: output.length, summary, outputPath }, null, 2));
