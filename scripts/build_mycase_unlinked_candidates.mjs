import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function loadDotEnv(filePath = ".env") {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

loadDotEnv();

const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://qbrufeewsisljtoegops.supabase.co";
const supabaseKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseKey) throw new Error("Missing VITE_SUPABASE_PUBLISHABLE_KEY in .env");

const sb = createClient(supabaseUrl, supabaseKey);
const supabaseCli = path.resolve("node_modules", "supabase", "bin", "supabase.exe");

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
    .filter((token) => token.length >= 3 && !["NOT", "HIRED", "THE"].includes(token));
}

function invoiceNameTokens(description) {
  const clean = String(description || "").replace(/\b(NO|NOT)\s+HIRED\b/gi, "");
  const [beforeComma, afterComma = ""] = clean.split(",", 2);
  const combined = `${afterComma} ${beforeComma}`;
  return [...new Set(tokens(combined))];
}

function scoreName(invoiceTokens, candidateName) {
  const candidateTokens = new Set(tokens(candidateName));
  if (invoiceTokens.length === 0 || candidateTokens.size === 0) return 0;

  let exact = 0;
  for (const token of invoiceTokens) {
    if (candidateTokens.has(token)) exact += 1;
  }

  const coverage = exact / Math.max(invoiceTokens.length, 1);
  const weighted = exact * 22 + coverage * 45;
  return Math.round(Math.min(100, weighted));
}

function balance(contract) {
  return Number(contract.value || 0) - Number(contract.collected || 0);
}

function classify({ invoice, candidate, lawpayAmount }) {
  const notHired = /(?:^|\s)(?:NO|NOT)\s+HIRED(?:\s|$)/i.test(invoice.description || "");
  if (notHired) return "review_exclude_not_hired";
  if (!candidate) return "no_client_candidate";
  if (!candidate.contract_id) return "client_candidate_no_contract";
  if (lawpayAmount > 0 && candidate.score >= 78) return "high_lawpay_name_contract";
  if (candidate.score >= 78) return "high_name_contract";
  if (candidate.score >= 58) return "medium_name_contract";
  return "low_review_contract";
}

async function fetchAll(table, select, filter) {
  const rows = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    let query = sb.from(table).select(select).range(from, from + pageSize - 1);
    if (filter) query = filter(query);
    const { data, error } = await query;
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

function fetchViaCli(sql) {
  const stdout = execFileSync(
    supabaseCli,
    ["db", "query", "--linked", "-o", "json", sql],
    { encoding: "utf8", maxBuffer: 1024 * 1024 * 80 }
  );
  const parsed = JSON.parse(stdout);
  return parsed.rows || [];
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(filePath, rows) {
  const headers = Object.keys(rows[0] || {});
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ];
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

const invoices = fetchViaCli(
  "select id, invoice_number, mycase_internal_id, description, status, amount_due, due_date from public.mycase_invoices where matched_contract_id is null order by amount_due desc;"
);

const clients = fetchViaCli(
  "select id, name, client_number, case_number, is_active from public.clients where is_active = true;"
);

const contracts = fetchViaCli(
  "select id, client_id, client, status, value, collected, case_number, invoice_number, created_at from public.contracts where client_id is not null;"
);

const lawpay = fetchViaCli(
  "select id, amount, description, matched_to_payment from public.lawpay_transactions where coalesce(matched_to_payment,false) = false;"
);

const contractsByClient = new Map();
for (const contract of contracts) {
  if (!contractsByClient.has(contract.client_id)) contractsByClient.set(contract.client_id, []);
  contractsByClient.get(contract.client_id).push(contract);
}

for (const list of contractsByClient.values()) {
  list.sort((a, b) => {
    const activeA = ["Active", "Risk"].includes(a.status) ? 1 : 0;
    const activeB = ["Active", "Risk"].includes(b.status) ? 1 : 0;
    if (activeA !== activeB) return activeB - activeA;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });
}

const lawpayByDigits = new Map();
for (const row of lawpay) {
  const digits = String(row.description || "").replace(/\D/g, "");
  if (!digits) continue;
  lawpayByDigits.set(digits, (lawpayByDigits.get(digits) || 0) + Number(row.amount || 0));
}

const output = [];
for (const invoice of invoices) {
  const invTokens = invoiceNameTokens(invoice.description);
  const invoiceDigits = String(invoice.mycase_internal_id || invoice.invoice_number || "").replace(/\D/g, "");
  const lawpayAmount = lawpayByDigits.get(invoiceDigits) || 0;

  const candidates = clients
    .map((client) => {
      const score = scoreName(invTokens, client.name);
      if (score < 28) return null;
      const clientContracts = contractsByClient.get(client.id) || [];
      const bestContract =
        clientContracts
          .map((contract) => ({
            contract,
            balanceGap: Math.abs(balance(contract) - Number(invoice.amount_due || 0)),
          }))
          .sort((a, b) => {
            const activeA = ["Active", "Risk"].includes(a.contract.status) ? 1 : 0;
            const activeB = ["Active", "Risk"].includes(b.contract.status) ? 1 : 0;
            if (activeA !== activeB) return activeB - activeA;
            return a.balanceGap - b.balanceGap;
          })[0]?.contract || null;
      return { client, score, contract: bestContract };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const activeA = a.contract && ["Active", "Risk"].includes(a.contract.status) ? 1 : 0;
      const activeB = b.contract && ["Active", "Risk"].includes(b.contract.status) ? 1 : 0;
      if (activeA !== activeB) return activeB - activeA;
      return b.score - a.score;
    })
    .slice(0, 5);

  if (candidates.length === 0) {
    output.push({
      confidence_bucket: classify({ invoice, candidate: null, lawpayAmount }),
      candidate_rank: 1,
      invoice_row_id: invoice.id,
      invoice_number: invoice.invoice_number,
      mycase_internal_id: invoice.mycase_internal_id,
      invoice_status: invoice.status,
      amount_due: invoice.amount_due,
      due_date: invoice.due_date,
      description: invoice.description,
      lawpay_unmatched_amount: lawpayAmount,
      score: 0,
      client_id: "",
      client_name: "",
      client_number: "",
      client_case_number: "",
      contract_id: "",
      contract_status: "",
      contract_value: "",
      contract_collected: "",
      contract_balance: "",
      contract_case_number: "",
      contract_invoice_number: "",
    });
    continue;
  }

  candidates.forEach((candidate, index) => {
    output.push({
      confidence_bucket: classify({ invoice, candidate: { ...candidate, contract_id: candidate.contract?.id }, lawpayAmount }),
      candidate_rank: index + 1,
      invoice_row_id: invoice.id,
      invoice_number: invoice.invoice_number,
      mycase_internal_id: invoice.mycase_internal_id,
      invoice_status: invoice.status,
      amount_due: invoice.amount_due,
      due_date: invoice.due_date,
      description: invoice.description,
      lawpay_unmatched_amount: lawpayAmount,
      score: candidate.score,
      client_id: candidate.client.id,
      client_name: candidate.client.name,
      client_number: candidate.client.client_number,
      client_case_number: candidate.client.case_number,
      contract_id: candidate.contract?.id || "",
      contract_status: candidate.contract?.status || "",
      contract_value: candidate.contract?.value || "",
      contract_collected: candidate.contract?.collected || "",
      contract_balance: candidate.contract ? balance(candidate.contract) : "",
      contract_case_number: candidate.contract?.case_number || "",
      contract_invoice_number: candidate.contract?.invoice_number || "",
    });
  });
}

const outDir = path.resolve("scripts", "output");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "mycase_unlinked_invoice_candidates_20260505.csv");
writeCsv(outPath, output);

const summary = output.reduce((acc, row) => {
  if (row.candidate_rank !== 1) return acc;
  acc[row.confidence_bucket] = (acc[row.confidence_bucket] || 0) + 1;
  return acc;
}, {});

console.log(
  JSON.stringify(
    {
      invoices: invoices.length,
      clients: clients.length,
      contracts: contracts.length,
      lawpay: lawpay.length,
      candidateRows: output.length,
      summary,
      outPath,
    },
    null,
    2
  )
);
