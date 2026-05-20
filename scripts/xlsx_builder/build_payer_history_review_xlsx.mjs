import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve("..", "..");
const csvPath = path.join(root, "scripts", "output", "lawpay_name_only_large_payer_history_20260505.csv");
const outputPath = path.join(root, "scripts", "output", "LawPay_Name_Only_Large_Payer_History_May5_2026.xlsx");

const csvText = await fs.readFile(csvPath, "utf8");
const workbook = await Workbook.fromCSV(csvText, { sheetName: "Payer History" });

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

const buckets = [
  "strong_confirmed_invoice_history",
  "medium_missing_invoice_history",
  "consultation_history_only",
  "other_history_only",
  "no_prior_history",
];

const summaryRows = buckets.map((bucket) => {
  const subset = records.filter((row) => row.payer_history_bucket === bucket);
  return [
    bucket,
    subset.length,
    subset.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    subset.reduce((sum, row) => sum + Number(row.history_rows || 0), 0),
  ];
});

const summary = workbook.worksheets.add("Summary");
summary.getRange("A1:D1").values = [["Payer History Bucket", "Rows", "Amount", "Linked History Rows"]];
summary.getRange("A2:D6").values = summaryRows;

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const check = await workbook.inspect({
  kind: "table",
  range: "Summary!A1:D6",
  include: "values",
  tableMaxRows: 8,
  tableMaxCols: 4,
});
console.log(check.ndjson);
console.log(JSON.stringify({ outputPath }, null, 2));
