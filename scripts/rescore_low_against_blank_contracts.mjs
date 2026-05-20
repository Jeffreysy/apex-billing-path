import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const lowCsvPath = path.resolve("scripts", "output", "mycase_low_confidence_deepdive_20260505.csv");
const outPath = path.resolve("scripts", "output", "mycase_192_blank_contract_rescore_20260505.csv");
const supabaseCli = path.resolve("node_modules", "supabase", "bin", "supabase.exe");

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

function fetchRows(sql) {
  const stdout = execFileSync(supabaseCli, ["db", "query", "--linked", "-o", "json", sql], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 80,
  });
  return JSON.parse(stdout).rows || [];
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

const stop = new Set(["NOT", "HIRED", "VISA", "THE", "AND", "DEL", "DE", "LA", "LOS", "LAS"]);
function tokens(value) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !stop.has(token) && !/^\d+$/.test(token));
}

function invoiceTokens(description) {
  const clean = String(description || "").replace(/\b(NO|NOT)\s+HIRED\b/gi, "");
  const [beforeComma, afterComma = ""] = clean.split(",", 2);
  return [...new Set(tokens(`${afterComma} ${beforeComma}`))];
}

function suffixYear(description) {
  const match = String(description || "").match(/\b(2[0-9])\s*$/);
  return match ? match[1] : "";
}

function scoreCandidate(invoice, contract) {
  const invTokens = invoiceTokens(invoice.description);
  const haystack = tokens(`${contract.client || ""} ${contract.case_number || ""}`);
  const hay = new Set(haystack);
  const shared = invTokens.filter((token) => hay.has(token));
  const sharedUnique = [...new Set(shared)];
  const coverage = invTokens.length ? sharedUnique.length / invTokens.length : 0;
  const bal = Number(contract.value || 0) - Number(contract.collected || 0);
  const amount = Number(invoice.amount_due || 0);
  const balanceGap = Math.abs(bal - amount);
  const balanceScore = amount > 0 ? Math.max(0, 25 - Math.min(25, (balanceGap / amount) * 25)) : 0;
  const activeScore = ["Active", "Risk", "Outstanding"].includes(contract.status) ? 10 : 0;
  const year = suffixYear(invoice.description);
  const yearScore = year && String(contract.case_number || "").includes(`${year}-`) ? 15 : 0;
  const tokenScore = sharedUnique.length * 24 + coverage * 30;
  const score = Math.round(tokenScore + balanceScore + activeScore + yearScore);
  return { score, shared: sharedUnique.join(" "), balanceGap, contractBalance: bal, year };
}

const rows = parseCSV(fs.readFileSync(lowCsvPath, "utf8"));
const headers = rows.shift();
const lows = rows
  .filter((row) => row.length === headers.length)
  .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])))
  .filter((row) => row.review_reason === "candidate_contract_already_has_other_invoice");

const blankContracts = fetchRows(`
  select id, client_id, client, status, value, collected, case_number, invoice_number, created_at
  from public.contracts
  where client_id is not null
    and nullif(trim(coalesce(invoice_number,'')), '') is null;
`);

const output = [];
for (const invoice of lows) {
  const candidates = blankContracts
    .map((contract) => ({ contract, ...scoreCandidate(invoice, contract) }))
    .filter((item) => item.score >= 55 || item.shared.split(" ").filter(Boolean).length >= 2)
    .sort((a, b) => b.score - a.score || a.balanceGap - b.balanceGap)
    .slice(0, 5);

  if (candidates.length === 0) {
    output.push({
      recommendation: "no_blank_contract_candidate",
      invoice_number: invoice.invoice_number,
      description: invoice.description,
      invoice_status: invoice.invoice_status,
      amount_due: invoice.amount_due,
      lawpay_unmatched_amount: invoice.lawpay_unmatched_amount,
      year_suffix: suffixYear(invoice.description),
      candidate_rank: "",
      rescore: "",
      shared_tokens: "",
      contract_id: "",
      contract_client: "",
      contract_status: "",
      contract_value: "",
      contract_collected: "",
      contract_balance: "",
      balance_gap: "",
      contract_case_number: "",
      invoice_row_id: invoice.invoice_row_id,
    });
    continue;
  }

  candidates.forEach((candidate, index) => {
    const strong =
      candidate.shared.split(" ").filter(Boolean).length >= 2 &&
      candidate.score >= 85 &&
      candidate.balanceGap <= Math.max(500, Number(invoice.amount_due || 0) * 0.2);
    output.push({
      recommendation: strong ? "possible_blank_contract_match" : "review_blank_contract_candidate",
      invoice_number: invoice.invoice_number,
      description: invoice.description,
      invoice_status: invoice.invoice_status,
      amount_due: invoice.amount_due,
      lawpay_unmatched_amount: invoice.lawpay_unmatched_amount,
      year_suffix: suffixYear(invoice.description),
      candidate_rank: index + 1,
      rescore: candidate.score,
      shared_tokens: candidate.shared,
      contract_id: candidate.contract.id,
      contract_client: candidate.contract.client,
      contract_status: candidate.contract.status,
      contract_value: candidate.contract.value,
      contract_collected: candidate.contract.collected,
      contract_balance: candidate.contractBalance,
      balance_gap: candidate.balanceGap,
      contract_case_number: candidate.contract.case_number,
      invoice_row_id: invoice.invoice_row_id,
    });
  });
}

const outHeaders = Object.keys(output[0] || {});
fs.writeFileSync(
  outPath,
  [outHeaders.join(","), ...output.map((row) => outHeaders.map((header) => csvEscape(row[header])).join(","))].join("\n") + "\n",
  "utf8"
);

const top = output.filter((row) => row.candidate_rank === 1 || row.candidate_rank === "");
const summary = top.reduce((acc, row) => {
  acc[row.recommendation] ??= { count: 0, amount_due: 0, lawpay: 0 };
  acc[row.recommendation].count += 1;
  acc[row.recommendation].amount_due += Number(row.amount_due || 0);
  acc[row.recommendation].lawpay += Number(row.lawpay_unmatched_amount || 0);
  return acc;
}, {});

console.log(JSON.stringify({ low192: lows.length, blankContracts: blankContracts.length, rows: output.length, summary, outPath }, null, 2));
