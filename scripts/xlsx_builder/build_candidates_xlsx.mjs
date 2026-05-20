import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve("..", "..");
const csvPath = path.join(root, "scripts", "output", "mycase_unlinked_invoice_candidates_20260505.csv");
const outputDir = path.join(root, "scripts", "output");
const outputPath = path.join(outputDir, "MyCase_Unlinked_Invoice_Candidates_May5_2026.xlsx");

const csvText = await fs.readFile(csvPath, "utf8");
const workbook = await Workbook.fromCSV(csvText, { sheetName: "Candidate Detail" });

const detail = workbook.worksheets.getItem("Candidate Detail");

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

const rows = parseCSV(csvText);
const headers = rows.shift();
const records = rows
  .filter((row) => row.length === headers.length)
  .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])));
const topRank = records.filter((row) => row.candidate_rank === "1");
const bucketOrder = [
  "medium_name_contract",
  "low_review_contract",
  "client_candidate_no_contract",
  "no_client_candidate",
  "review_exclude_not_hired",
];
const meanings = {
  medium_name_contract: ["Plausible name/contract match", "Review next; do not bulk-link without spot checks"],
  low_review_contract: ["Weak name signal or common-name ambiguity", "Manual review, prioritize LawPay amount"],
  client_candidate_no_contract: ["Client candidate exists but no contract candidate", "Check whether contract should be created"],
  no_client_candidate: ["No good current client candidate", "Research or exclude"],
  review_exclude_not_hired: ["Description says NOT/NO HIRED", "Do not auto-link"],
};
const bucketRows = bucketOrder.map((bucket) => {
  const subset = topRank.filter((row) => row.confidence_bucket === bucket);
  return [
    bucket,
    subset.length,
    subset.reduce((sum, row) => sum + Number(row.amount_due || 0), 0),
    subset.reduce((sum, row) => sum + Number(row.lawpay_unmatched_amount || 0), 0),
    meanings[bucket][0],
    meanings[bucket][1],
  ];
});

const summary = workbook.worksheets.add("Summary");
summary.getRange("A1:F1").values = [["Bucket", "Top-Rank Invoices", "Amount Due", "LawPay Waiting", "Meaning", "Action"]];
summary.getRange(`A2:F${bucketRows.length + 2}`).values = [
  ...bucketRows,
  [
    "Total",
    topRank.length,
    topRank.reduce((sum, row) => sum + Number(row.amount_due || 0), 0),
    topRank.reduce((sum, row) => sum + Number(row.lawpay_unmatched_amount || 0), 0),
    "Remaining unlinked MyCase invoices after high-confidence connection",
    "Start with medium and LawPay-heavy low rows",
  ],
];

const notes = workbook.worksheets.add("Notes");
notes.getRange("A1:B1").values = [["Field", "Notes"]];
notes.getRange("A2:B8").values = [
  ["Source", "MyCase AR export loaded into Supabase on 2026-05-05"],
  ["Scope", "Only MyCase invoices with no matched_contract_id after high-confidence connection"],
  ["Scoring", "Name-token match against active clients, then best contract for that client"],
  ["High priority", "Rows with lawpay_unmatched_amount greater than 0"],
  ["Do not auto-link", "Rows flagged review_exclude_not_hired"],
  ["Next step", "Review medium rows first, then LawPay-heavy low rows"],
  ["Backup", "mycase_invoice_links_backup_20260505_pre_contract_link"],
];

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const check = await workbook.inspect({
  kind: "table",
  range: `Summary!A1:F${bucketRows.length + 2}`,
  include: "values",
  tableMaxRows: 12,
  tableMaxCols: 6,
});

console.log(check.ndjson);
console.log(JSON.stringify({ outputPath }, null, 2));
