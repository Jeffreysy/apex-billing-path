import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * MyCase → Zapier → Supabase webhook receiver.
 *
 * Zapier sends POST requests here whenever a MyCase event fires.
 * Supports entity types detected from the payload:
 *   - contact  → upserts mycase_contacts, backfills clients.mycase_id
 *   - case     → upserts mycase_cases, links to clients/contracts
 *   - invoice  → upserts mycase_invoices
 *
 * Security: optional MYCASE_ZAPIER_SECRET header check.
 * Set MYCASE_ZAPIER_SECRET in Supabase secrets and configure Zapier
 * to send it as X-Webhook-Secret header.
 */

const supabaseUrl    = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const webhookSecret  = Deno.env.get("MYCASE_ZAPIER_SECRET") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

const normalizeName = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, "").trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  // Optional secret validation
  if (webhookSecret) {
    const incoming = req.headers.get("x-webhook-secret") ?? "";
    if (incoming !== webhookSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const sb = createClient(supabaseUrl, serviceRoleKey);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const entityType = detectEntityType(body);

  let result: unknown;
  switch (entityType) {
    case "contact":  result = await handleContact(sb, body);  break;
    case "case":     result = await handleCase(sb, body);     break;
    case "invoice":  result = await handleInvoice(sb, body);  break;
    default:
      await sb.from("mycase_sync_state").upsert(
        { sync_key: "zapier_unknown", meta: body, updated_at: new Date().toISOString() },
        { onConflict: "sync_key" }
      );
      return new Response(JSON.stringify({ received: true, entity_type: "unknown", body }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
  }

  return new Response(JSON.stringify({ success: true, entity_type: entityType, result }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

function detectEntityType(body: Record<string, unknown>): string {
  if (body.entity_type) return String(body.entity_type).toLowerCase();
  if (body.case_number !== undefined || body.case_stage !== undefined || body.case_name !== undefined) return "case";
  if (body.invoice_number !== undefined || body.amount_due !== undefined || body.balance !== undefined) return "invoice";
  if (body.first_name !== undefined || body.last_name !== undefined || body.contact_type !== undefined) return "contact";
  return "unknown";
}

async function handleContact(sb: ReturnType<typeof createClient>, data: Record<string, unknown>) {
  const contactId   = Number(data.id || data.mycase_id || 0) || null;
  const firstName   = String(data.first_name || "").trim();
  const lastName    = String(data.last_name  || "").trim();
  const fullName    = String(data.name || data.full_name || `${firstName} ${lastName}`).trim();
  const email       = String(data.email || "").trim() || null;
  const phone       = String(data.phone || data.phone_number || "").trim() || null;
  const contactType = String(data.type || data.contact_type || "").trim() || null;

  let matchedClientId: string | null = null;
  let matchType = "unmatched";

  if (contactId) {
    const { data: byId } = await sb.from("clients").select("id")
      .eq("mycase_id", contactId).eq("is_active", true).limit(1).maybeSingle();
    if (byId) { matchedClientId = byId.id; matchType = "mycase_id"; }
  }

  if (!matchedClientId && fullName.length > 3) {
    const normTarget = normalizeName(fullName);
    const { data: candidates } = await sb.from("clients").select("id, name")
      .eq("is_active", true).ilike("name", `%${(lastName || firstName).slice(0, 10)}%`).limit(50);
    const matches = (candidates || []).filter(c => normalizeName(c.name) === normTarget);
    if (matches.length === 1) {
      matchedClientId = matches[0].id;
      matchType = "name_exact";
      if (contactId) await sb.from("clients").update({ mycase_id: contactId })
        .eq("id", matchedClientId).is("mycase_id", null);
    }
  }

  if (!matchedClientId && email) {
    const { data: byEmail } = await sb.from("clients").select("id")
      .ilike("email", email).eq("is_active", true).limit(1).maybeSingle();
    if (byEmail) { matchedClientId = byEmail.id; matchType = "email"; }
  }

  const row: Record<string, unknown> = {
    full_name: fullName || null, first_name: firstName || null, last_name: lastName || null,
    email, phone, contact_type: contactType,
    matched_client_id: matchedClientId, match_type: matchType,
    raw_payload: data, synced_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  if (contactId) row.mycase_contact_id = contactId;
  if (contactId) await sb.from("mycase_contacts").upsert(row, { onConflict: "mycase_contact_id" });
  else           await sb.from("mycase_contacts").insert(row);

  return { contact_id: contactId, matched_client_id: matchedClientId, match_type: matchType };
}

async function handleCase(sb: ReturnType<typeof createClient>, data: Record<string, unknown>) {
  const mycaseCaseId = Number(data.id || data.mycase_id || data.case_id || 0) || null;
  const caseNumber   = String(data.case_number || "").trim() || null;
  const caseName     = String(data.name || data.case_name || data.title || "").trim() || null;
  const caseStage    = String(data.case_stage || data.status || data.stage || "").trim() || null;
  const isClosed     = data.closed === true || caseStage?.toLowerCase() === "closed";

  let matchedClientId: string | null = null;
  let matchedContractId: string | null = null;
  let matchType = "unmatched";

  if (mycaseCaseId) {
    const { data: byId } = await sb.from("clients").select("id")
      .eq("mycase_id", mycaseCaseId).eq("is_active", true).limit(1).maybeSingle();
    if (byId) { matchedClientId = byId.id; matchType = "mycase_id"; }
  }
  if (!matchedClientId && caseNumber) {
    const { data: byCaseNum } = await sb.from("clients").select("id")
      .eq("case_number", caseNumber).eq("is_active", true).limit(1).maybeSingle();
    if (byCaseNum) { matchedClientId = byCaseNum.id; matchType = "case_number"; }
  }
  if (!matchedClientId && caseName && caseName.length > 3) {
    const normTarget = normalizeName(caseName);
    const { data: candidates } = await sb.from("clients").select("id, name")
      .eq("is_active", true).ilike("name", `%${caseName.split(" ")[0]}%`).limit(50);
    const matches = (candidates || []).filter(c => normalizeName(c.name) === normTarget);
    if (matches.length === 1) { matchedClientId = matches[0].id; matchType = "name_exact"; }
  }
  if (matchedClientId) {
    const { data: contract } = await sb.from("contracts").select("id")
      .eq("client_id", matchedClientId).in("status", ["Active", "Risk"]).limit(1).maybeSingle();
    if (contract) matchedContractId = contract.id;
  }

  const row: Record<string, unknown> = {
    case_number: caseNumber, case_name: caseName,
    case_type: String(data.case_type || "").trim() || null,
    case_stage: caseStage, practice_area: String(data.practice_area || "").trim() || null,
    lead_attorney: String(data.lead_attorney || "").trim() || null,
    status: isClosed ? "closed" : "open", is_closed: isClosed,
    open_date: parseDate(data.open_date || data.created_at), closed_date: parseDate(data.closed_date),
    matched_client_id: matchedClientId, matched_contract_id: matchedContractId, match_type: matchType,
    raw_payload: data, synced_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  if (mycaseCaseId) row.mycase_case_id = mycaseCaseId;
  if (mycaseCaseId) await sb.from("mycase_cases").upsert(row, { onConflict: "mycase_case_id" });
  else              await sb.from("mycase_cases").insert(row);

  return { case_id: mycaseCaseId, matched_client_id: matchedClientId, match_type: matchType };
}

async function handleInvoice(sb: ReturnType<typeof createClient>, data: Record<string, unknown>) {
  const invoiceId    = Number(data.id || data.invoice_id || 0) || null;
  const mycaseCaseId = Number(data.case_id || 0) || null;
  const amount       = Number(data.total || data.amount || 0);
  const amountPaid   = Number(data.amount_paid || data.paid || 0);

  let matchedClientId: string | null = null;
  let matchedContractId: string | null = null;
  let matchType = "unmatched";

  if (mycaseCaseId) {
    const { data: syncedCase } = await sb.from("mycase_cases")
      .select("matched_client_id, matched_contract_id")
      .eq("mycase_case_id", mycaseCaseId).limit(1).maybeSingle();
    if (syncedCase?.matched_client_id) {
      matchedClientId = syncedCase.matched_client_id;
      matchedContractId = syncedCase.matched_contract_id;
      matchType = "via_case";
    }
  }

  const row: Record<string, unknown> = {
    mycase_case_id: mycaseCaseId,
    invoice_number: String(data.invoice_number || data.number || "").trim() || null,
    status: String(data.status || "").trim().toLowerCase() || null,
    amount, amount_paid: amountPaid,
    amount_due: Number(data.balance || data.amount_due || amount - amountPaid),
    issue_date: parseDate(data.issue_date || data.created_at),
    due_date: parseDate(data.due_date), paid_date: parseDate(data.paid_date),
    matched_client_id: matchedClientId, matched_contract_id: matchedContractId, match_type: matchType,
    raw_payload: data, synced_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  if (invoiceId) row.mycase_invoice_id = invoiceId;
  if (invoiceId) await sb.from("mycase_invoices").upsert(row, { onConflict: "mycase_invoice_id" });
  else           await sb.from("mycase_invoices").insert(row);

  return { invoice_id: invoiceId, matched_client_id: matchedClientId, match_type: matchType };
}

function parseDate(value: unknown): string | null {
  if (!value) return null;
  const str = String(value).trim();
  if (!str || str === "null") return null;
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[1].padStart(2,"0")}-${m[2].padStart(2,"0")}`;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
}
