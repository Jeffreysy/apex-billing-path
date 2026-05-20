import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve("..", "..");
const csvPath = path.join(root, "scripts", "output", "mycase_low_confidence_deepdive_20260505.csv");
const outputDir = path.join(root, "scripts", "output");
const outputPath = path.join(outputDir, "MyCase_Low_Confidence_DeepDive_May5_2026.xlsx");

const csvText = await fs.readFile(csvPath, "utf8");
const workbook = await Workbook.fromCSV(csvText, { sheetName: "Low Review Detail" });

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

const reasonOrder = [
  "candidate_contract_already_has_other_invoice",
  "single_token_common_name_match",
  "draft_or_small_status_review",
];

const reasonText = {
  candidate_contract_already_has_other_invoice: [
    "Proposed contract already has a different invoice number",
    "Do not link without manual verification; likely same-name collision",
  ],
  single_token_common_name_match: [
    "Only one meaningful name token overlaps",
    "Needs external/client review before linking",
  ],
  draft_or_small_status_review: [
    "Sent/Unsent or small companion invoice",
    "Review after active Partial/Overdue accounts",
  ],
};

const summaryRows = reasonOrder.map((reason) => {
  const subset = records.filter((row) => row.review_reason === reason);
  return [
    reason,
    subset.length,
    subset.reduce((sum, row) => sum + Number(row.amount_due || 0), 0),
    subset.reduce((sum, row) => sum + Number(row.lawpay_unmatched_amount || 0), 0),
    reasonText[reason][0],
    reasonText[reason][1],
  ];
});

const summary = workbook.worksheets.add("Summary");
summary.getRange("A1:F1").values = [["Review Reason", "Invoices", "Amount Due", "LawPay Waiting", "Meaning", "Action"]];
summary.getRange("A2:F5").values = [
  ...summaryRows,
  [
    "Total",
    records.length,
    records.reduce((sum, row) => sum + Number(row.amount_due || 0), 0),
    records.reduce((sum, row) => sum + Number(row.lawpay_unmatched_amount || 0), 0),
    "Low-confidence remaining MyCase invoices",
    "Prioritize LawPay Waiting and high Amount Due",
  ],
];

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const check = await workbook.inspect({
  kind: "table",
  range: "Summary!A1:F5",
  include: "values",
  tableMaxRows: 8,
  tableMaxCols: 6,
});
console.log(check.ndjson);
console.log(JSON.stringify({ outputPath }, null, 2));
