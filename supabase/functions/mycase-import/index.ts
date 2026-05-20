import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * MyCase CSV Import — bulk ingest contacts, cases, or invoices from MyCase exports.
 *
 * POST /mycase-import
 *   Content-Type: multipart/form-data OR application/json
 *
 *   multipart fields:
 *     file  — CSV file
 *     type  — "contacts" | "cases" | "invoices"
 *
 *   JSON body (alternative):
 *     { type: "contacts"|"cases"|"invoices", rows: [...] }
 *
 * GET /mycase-import  — returns supported types and column mappings
 */

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const normalizeName = (v: string) =>
  v
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const sb = createClient(supabaseUrl, serviceRoleKey);

  if (req.method === "GET") {
    return json({
      supported_types: ["contacts", "cases", "invoices"],
      contacts_columns:
        "id (or mycase_id), first_name, last_name, name (or full_name), email, phone, company, type (or contact_type)",
      cases_columns:
        "id (or case_id), case_number, name (or case_name), case_type, case_stage (or status), practice_area, lead_attorney, open_date, closed_date",
      invoices_columns:
        "id (or invoice_id), case_id, invoice_number, status, amount (or total), amount_paid (or paid), amount_due (or balance), issue_date, due_date, paid_date, description",
      usage:
        "POST multipart/form-data with fields: file (CSV), type (contacts|cases|invoices). Or POST JSON: { type, rows: [...] }",
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    let importType: string;
    let rows: Record<string, unknown>[];

    const ct = req.headers.get("content-type") || "";

    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      importType = String(form.get("type") || "").trim().toLowerCase();
      const file = form.get("file") as File | null;
      if (!file) return json({ error: "No file provided" }, 400);
      const text = await file.text();
      rows = parseCSV(text);
    } else {
      const body = await req.json();
      importType = String(body.type || "").trim().toLowerCase();
      rows = body.rows || [];
    }

    if (!["contacts", "cases", "invoices"].includes(importType)) {
      return json(
        {
          error: `Invalid type "${importType}". Use: contacts, cases, invoices`,
        },
        400
      );
    }

    if (!rows.length) return json({ error: "No rows parsed from input" }, 400);

    let result: ImportResult;
    switch (importType) {
      case "contacts":
        result = await importContacts(sb, rows);
        break;
      case "cases":
        result = await importCases(sb, rows);
        break;
      case "invoices":
        result = await importInvoices(sb, rows);
        break;
      default:
        return json({ error: "Unknown type" }, 400);
    }

    // Run post-import refresh (contract statuses, client backfills, contact matching)
    let refreshResult: unknown = null;
    try {
      const { data } = await sb.rpc("refresh_after_import");
      refreshResult = data;
    } catch (_) {
      // Non-fatal — import already succeeded
    }

    await sb.from("mycase_sync_state").upsert(
      {
        sync_key: `import_${importType}`,
        meta: {
          last_import: new Date().toISOString(),
          rows_received: rows.length,
          ...result,
          refresh: refreshResult,
        },
        updated_at: new Date().toISOString(),
        last_error: null,
      },
      { onConflict: "sync_key" }
    );

    return json({ success: true, type: importType, ...result, refresh: refreshResult });
  } catch (err) {
    const message = (err as Error).message;
    return json({ error: message, stack: (err as Error).stack }, 500);
  }
});

interface ImportResult {
  total: number;
  upserted: number;
  matched: number;
  unmatched: number;
  errors: string[];
}

// ── Contacts ──────────────────────────────────────────────────────────────────

async function importContacts(
  sb: ReturnType<typeof createClient>,
  rows: Record<string, unknown>[]
): Promise<ImportResult> {
  const result: ImportResult = {
    total: rows.length,
    upserted: 0,
    matched: 0,
    unmatched: 0,
    errors: [],
  };

  // Pre-load all clients for matching
  const { data: allClients } = await sb
    .from("clients")
    .select("id, name, email, mycase_id, is_active")
    .eq("is_active", true);
  const clients = allClients || [];
  const clientsByMycaseId = new Map(
    clients.filter((c) => c.mycase_id).map((c) => [Number(c.mycase_id), c])
  );
  const clientsByNormName = new Map<string, typeof clients>();
  for (const c of clients) {
    if (!c.name) continue;
    const n = normalizeName(c.name);
    if (!clientsByNormName.has(n)) clientsByNormName.set(n, []);
    clientsByNormName.get(n)!.push(c);
  }
  const clientsByEmail = new Map(
    clients
      .filter((c) => c.email)
      .map((c) => [c.email!.toLowerCase().trim(), c])
  );

  for (const raw of rows) {
    try {
      const contactId =
        Number(raw.id || raw.mycase_id || raw.mycase_contact_id || 0) || null;
      if (!contactId) {
        result.errors.push(
          `Row skipped: no id/mycase_id found (name: ${raw.name || raw.first_name || "?"})`
        );
        continue;
      }

      const firstName = str(raw.first_name);
      const lastName = str(raw.last_name);
      const fullName =
        str(raw.name || raw.full_name) ||
        `${firstName} ${lastName}`.trim();
      const email = str(raw.email) || null;
      const phone = str(raw.phone || raw.phone_number) || null;
      const contactType = str(raw.type || raw.contact_type) || null;
      const company = str(raw.company || raw.firm_name) || null;

      let matchedClientId: string | null = null;
      let matchType = "unmatched";

      // Match by mycase_id
      const byId = clientsByMycaseId.get(contactId);
      if (byId) {
        matchedClientId = byId.id;
        matchType = "mycase_id";
      }

      // Match by name
      if (!matchedClientId && fullName.length > 3) {
        const normTarget = normalizeName(fullName);
        const nameMatches = clientsByNormName.get(normTarget) || [];
        if (nameMatches.length === 1) {
          matchedClientId = nameMatches[0].id;
          matchType = "name_exact";
        }
      }

      // Match by email
      if (!matchedClientId && email) {
        const byEmail = clientsByEmail.get(email.toLowerCase().trim());
        if (byEmail) {
          matchedClientId = byEmail.id;
          matchType = "email";
        }
      }

      const row = {
        mycase_contact_id: contactId,
        first_name: firstName || null,
        last_name: lastName || null,
        full_name: fullName || null,
        email,
        phone,
        company,
        contact_type: contactType,
        matched_client_id: matchedClientId,
        match_type: matchType,
        raw_payload: raw,
        synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await sb
        .from("mycase_contacts")
        .upsert(row, { onConflict: "mycase_contact_id" });
      if (error) {
        result.errors.push(`Contact ${contactId}: ${error.message}`);
        continue;
      }

      result.upserted++;
      if (matchedClientId) {
        result.matched++;
        // Backfill mycase_id on client if missing
        if (matchType === "name_exact" || matchType === "email") {
          await sb
            .from("clients")
            .update({ mycase_id: contactId })
            .eq("id", matchedClientId)
            .is("mycase_id", null);
        }
        // Backfill email/phone on client if missing
        if (email) {
          await sb
            .from("clients")
            .update({ email })
            .eq("id", matchedClientId)
            .is("email", null);
        }
        if (phone) {
          await sb
            .from("clients")
            .update({ phone })
            .eq("id", matchedClientId)
            .is("phone", null);
        }
      } else {
        result.unmatched++;
      }
    } catch (e) {
      result.errors.push(`Row error: ${(e as Error).message}`);
    }
  }

  return result;
}

// ── Cases ─────────────────────────────────────────────────────────────────────

async function importCases(
  sb: ReturnType<typeof createClient>,
  rows: Record<string, unknown>[]
): Promise<ImportResult> {
  const result: ImportResult = {
    total: rows.length,
    upserted: 0,
    matched: 0,
    unmatched: 0,
    errors: [],
  };

  const { data: allClients } = await sb
    .from("clients")
    .select("id, name, case_number, mycase_id, is_active")
    .eq("is_active", true);
  const clients = allClients || [];
  const clientsByMycaseId = new Map(
    clients.filter((c) => c.mycase_id).map((c) => [Number(c.mycase_id), c])
  );
  const clientsByCaseNum = new Map(
    clients
      .filter((c) => c.case_number)
      .map((c) => [c.case_number!.trim(), c])
  );
  const clientsByNormName = new Map<string, typeof clients>();
  for (const c of clients) {
    if (!c.name) continue;
    const n = normalizeName(c.name);
    if (!clientsByNormName.has(n)) clientsByNormName.set(n, []);
    clientsByNormName.get(n)!.push(c);
  }

  for (const raw of rows) {
    try {
      const caseId =
        Number(raw.id || raw.mycase_id || raw.case_id || raw.mycase_case_id || 0) || null;
      const caseNumber = str(raw.case_number || raw.number) || null;
      const caseName =
        str(raw.name || raw.case_name || raw.title || raw.client_name) || null;
      const caseStage = str(raw.case_stage || raw.status || raw.stage) || null;
      const caseType = str(raw.case_type || raw.type) || null;
      const practiceArea = str(raw.practice_area) || null;
      const leadAttorney =
        str(raw.lead_attorney || raw.attorney || raw.assigned_to) || null;
      const isClosed =
        raw.closed === true ||
        raw.is_closed === true ||
        caseStage?.toLowerCase() === "closed";

      if (!caseId && !caseNumber) {
        result.errors.push(
          `Row skipped: no id or case_number (name: ${caseName || "?"})`
        );
        continue;
      }

      let matchedClientId: string | null = null;
      let matchedContractId: string | null = null;
      let matchType = "unmatched";

      if (caseId) {
        const byId = clientsByMycaseId.get(caseId);
        if (byId) {
          matchedClientId = byId.id;
          matchType = "mycase_id";
        }
      }
      if (!matchedClientId && caseNumber) {
        const byCn = clientsByCaseNum.get(caseNumber);
        if (byCn) {
          matchedClientId = byCn.id;
          matchType = "case_number";
        }
      }
      if (!matchedClientId && caseName && caseName.length > 3) {
        const normTarget = normalizeName(caseName);
        const matches = clientsByNormName.get(normTarget) || [];
        if (matches.length === 1) {
          matchedClientId = matches[0].id;
          matchType = "name_exact";
        }
      }

      if (matchedClientId) {
        const { data: contract } = await sb
          .from("contracts")
          .select("id")
          .eq("client_id", matchedClientId)
          .in("status", ["Active", "Risk"])
          .limit(1)
          .maybeSingle();
        if (contract) matchedContractId = contract.id;
      }

      const row: Record<string, unknown> = {
        case_number: caseNumber,
        case_name: caseName,
        case_type: caseType,
        case_stage: caseStage,
        practice_area: practiceArea,
        lead_attorney: leadAttorney,
        status: isClosed ? "closed" : "open",
        is_closed: isClosed,
        open_date: parseDate(raw.open_date || raw.created_at || raw.opened),
        closed_date: parseDate(raw.closed_date || raw.closed),
        matched_client_id: matchedClientId,
        matched_contract_id: matchedContractId,
        match_type: matchType,
        raw_payload: raw,
        synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (caseId) {
        row.mycase_case_id = caseId;
        const { error } = await sb
          .from("mycase_cases")
          .upsert(row, { onConflict: "mycase_case_id" });
        if (error) {
          result.errors.push(`Case ${caseId}: ${error.message}`);
          continue;
        }
      } else {
        const { error } = await sb.from("mycase_cases").insert(row);
        if (error) {
          result.errors.push(`Case ${caseNumber}: ${error.message}`);
          continue;
        }
      }

      result.upserted++;
      if (matchedClientId) result.matched++;
      else result.unmatched++;
    } catch (e) {
      result.errors.push(`Row error: ${(e as Error).message}`);
    }
  }

  return result;
}

// ── Invoices ──────────────────────────────────────────────────────────────────

async function importInvoices(
  sb: ReturnType<typeof createClient>,
  rows: Record<string, unknown>[]
): Promise<ImportResult> {
  const result: ImportResult = {
    total: rows.length,
    upserted: 0,
    matched: 0,
    unmatched: 0,
    errors: [],
  };

  // Pre-load case→client mapping
  const { data: cases } = await sb
    .from("mycase_cases")
    .select("mycase_case_id, matched_client_id, matched_contract_id");
  const caseMap = new Map(
    (cases || [])
      .filter((c) => c.mycase_case_id)
      .map((c) => [
        Number(c.mycase_case_id),
        {
          client_id: c.matched_client_id,
          contract_id: c.matched_contract_id,
        },
      ])
  );

  // Pre-load clients by name for invoice-level matching
  const { data: allClients } = await sb
    .from("clients")
    .select("id, name, is_active")
    .eq("is_active", true);
  const clientsByNormName = new Map<
    string,
    { id: string; name: string }[]
  >();
  for (const c of allClients || []) {
    if (!c.name) continue;
    const n = normalizeName(c.name);
    if (!clientsByNormName.has(n)) clientsByNormName.set(n, []);
    clientsByNormName.get(n)!.push(c);
  }

  for (const raw of rows) {
    try {
      const invoiceId =
        Number(
          raw.id || raw.invoice_id || raw.mycase_invoice_id || 0
        ) || null;
      const mycaseCaseId =
        Number(raw.case_id || raw.mycase_case_id || 0) || null;
      const amount = parseNum(raw.total || raw.amount || raw.invoice_total);
      const amountPaid = parseNum(raw.amount_paid || raw.paid);
      const amountDue = parseNum(
        raw.balance || raw.amount_due || amount - amountPaid
      );
      const clientName =
        str(raw.client_name || raw.client || raw.contact_name) || null;

      let matchedClientId: string | null = null;
      let matchedContractId: string | null = null;
      let matchType = "unmatched";

      // Match via case
      if (mycaseCaseId && caseMap.has(mycaseCaseId)) {
        const linked = caseMap.get(mycaseCaseId)!;
        if (linked.client_id) {
          matchedClientId = linked.client_id;
          matchedContractId = linked.contract_id;
          matchType = "via_case";
        }
      }

      // Match via client name on the invoice
      if (!matchedClientId && clientName && clientName.length > 3) {
        const normTarget = normalizeName(clientName);
        const matches = clientsByNormName.get(normTarget) || [];
        if (matches.length === 1) {
          matchedClientId = matches[0].id;
          matchType = "name_exact";
        }
      }

      const row: Record<string, unknown> = {
        mycase_case_id: mycaseCaseId,
        invoice_number:
          str(raw.invoice_number || raw.number) || null,
        status:
          str(raw.status || raw.invoice_status)?.toLowerCase() || null,
        amount,
        amount_paid: amountPaid,
        amount_due: amountDue,
        issue_date: parseDate(
          raw.issue_date || raw.invoice_date || raw.created_at
        ),
        due_date: parseDate(raw.due_date),
        paid_date: parseDate(raw.paid_date || raw.payment_date),
        description: str(raw.description || raw.memo) || null,
        matched_client_id: matchedClientId,
        matched_contract_id: matchedContractId,
        match_type: matchType,
        raw_payload: raw,
        synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (invoiceId) {
        row.mycase_invoice_id = invoiceId;
        const { error } = await sb
          .from("mycase_invoices")
          .upsert(row, { onConflict: "mycase_invoice_id" });
        if (error) {
          result.errors.push(`Invoice ${invoiceId}: ${error.message}`);
          continue;
        }
      } else {
        const { error } = await sb.from("mycase_invoices").insert(row);
        if (error) {
          result.errors.push(
            `Invoice ${raw.invoice_number || "?"}: ${error.message}`
          );
          continue;
        }
      }

      result.upserted++;
      if (matchedClientId) result.matched++;
      else result.unmatched++;
    } catch (e) {
      result.errors.push(`Row error: ${(e as Error).message}`);
    }
  }

  return result;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function parseNum(v: unknown): number {
  if (v === null || v === undefined) return 0;
  const s = String(v).replace(/[$,]/g, "").trim();
  const n = Number(s);
  return isNaN(n) ? 0 : n;
}

function parseDate(value: unknown): string | null {
  if (!value) return null;
  const s = String(value).trim();
  if (!s || s === "null" || s === "N/A" || s === "-") return null;
  // MM/DD/YYYY
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m)
    return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  // YYYY-MM-DD already
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
}

function parseCSV(text: string): Record<string, unknown>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) =>
    h
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
  );

  const rows: Record<string, unknown>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;
    const row: Record<string, unknown> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? "";
    }
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
