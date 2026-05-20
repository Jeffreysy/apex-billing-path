import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve("..", "..");
const csvPath = path.join(root, "scripts", "output", "mycase_low_lawpay_review_20260505.csv");
const outputDir = path.join(root, "scripts", "output");
const outputPath = path.join(outputDir, "MyCase_Low_LawPay_Review_May5_2026.xlsx");

const csvText = await fs.readFile(csvPath, "utf8");
const workbook = await Workbook.fromCSV(csvText, { sheetName: "LawPay Review" });

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

const summary = workbook.worksheets.add("Summary");
const p1 = records.filter((row) => row.priority === "P1");
const p2 = records.filter((row) => row.priority === "P2");
const blankBetter = records.filter((row) => row.better_path === "blank_contract_candidate_is_better_but_still_review");
summary.getRange("A1:D1").values = [["Segment", "Invoices", "LawPay Waiting", "Amount Due"]];
summary.getRange("A2:D5").values = [
  ["P1: LawPay >= 3000", p1.length, p1.reduce((s, r) => s + Number(r.lawpay_unmatched_amount || 0), 0), p1.reduce((s, r) => s + Number(r.amount_due || 0), 0)],
  ["P2: LawPay < 3000", p2.length, p2.reduce((s, r) => s + Number(r.lawpay_unmatched_amount || 0), 0), p2.reduce((s, r) => s + Number(r.amount_due || 0), 0)],
  ["Blank contract candidate looks better", blankBetter.length, blankBetter.reduce((s, r) => s + Number(r.lawpay_unmatched_amount || 0), 0), blankBetter.reduce((s, r) => s + Number(r.amount_due || 0), 0)],
  ["Total", records.length, records.reduce((s, r) => s + Number(r.lawpay_unmatched_amount || 0), 0), records.reduce((s, r) => s + Number(r.amount_due || 0), 0)],
];

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const check = await workbook.inspect({
  kind: "table",
  range: "Summary!A1:D5",
  include: "values",
  tableMaxRows: 8,
  tableMaxCols: 4,
});
console.log(check.ndjson);
console.log(JSON.stringify({ outputPath }, null, 2));
