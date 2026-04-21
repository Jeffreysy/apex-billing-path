import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * MyCase Sync Edge Function
 *
 * Incrementally pulls cases, contacts, and invoices from MyCase API
 * and upserts into mycase_cases, mycase_contacts, mycase_invoices.
 *
 * POST body: { "entity": "cases" | "contacts" | "invoices", "page": 1, "per_page": 50 }
 * Or POST { "entity": "all" } to sync everything.
 */

const MYCASE_DOMAIN = "grand-rapids-law-group.mycase.com";
const API_BASE = `https://${MYCASE_DOMAIN}/api/v2`;

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const normalizeName = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .trim();

type SyncEntity = "cases" | "contacts" | "invoices" | "all";

interface SyncRequest {
  entity: SyncEntity;
  page?: number;
  per_page?: number;
  full_sync?: boolean; // if true, re-sync everything instead of incremental
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  const sb = createClient(supabaseUrl, serviceRoleKey);

  try {
    const body = (await req.json().catch(() => ({}))) as SyncRequest;
    const entity = body.entity || "all";
    const perPage = body.per_page || 50;

    // Get access token (auto-refresh if expired)
    const accessToken = await getValidToken(sb);
    if (!accessToken) {
      return new Response(
        JSON.stringify({
          error: "No valid access token. Run OAuth flow first.",
          authorize_url: `${supabaseUrl}/functions/v1/mycase-auth`,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const results: Record<string, unknown> = {};

    if (entity === "cases" || entity === "all") {
      results.cases = await syncCases(sb, accessToken, perPage, body.page);
    }
    if (entity === "contacts" || entity === "all") {
      results.contacts = await syncContacts(sb, accessToken, perPage, body.page);
    }
    if (entity === "invoices" || entity === "all") {
      results.invoices = await syncInvoices(sb, accessToken, perPage, body.page);
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// ── Token management ────────────────────────────────────────────

async function getValidToken(
  sb: ReturnType<typeof createClient>
): Promise<string | null> {
  const { data: state } = await sb
    .from("mycase_sync_state")
    .select("access_token, refresh_token, token_expires_at")
    .eq("sync_key", "oauth")
    .single();

  if (!state) return null;

  // If token expires within 5 minutes, refresh it
  const expiresAt = new Date(state.token_expires_at || 0);
  if (expiresAt.getTime() - Date.now() > 5 * 60 * 1000) {
    return state.access_token;
  }

  // Refresh the token
  if (!state.refresh_token) return null;

  const refreshResp = await fetch(
    `${supabaseUrl}/functions/v1/mycase-auth`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    }
  );

  if (!refreshResp.ok) return null;

  // Re-read the updated token
  const { data: updated } = await sb
    .from("mycase_sync_state")
    .select("access_token")
    .eq("sync_key", "oauth")
    .single();

  return updated?.access_token || null;
}

// ── API helpers ─────────────────────────────────────────────────

async function mycaseGet(
  path: string,
  token: string,
  params?: Record<string, string>
): Promise<unknown> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  const resp = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (resp.status === 401) {
    throw new Error("MyCase API returned 401 — token may be expired");
  }

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`MyCase API ${resp.status}: ${text.slice(0, 300)}`);
  }

  return await resp.json();
}

// ── Sync: Cases ─────────────────────────────────────────────────

async function syncCases(
  sb: ReturnType<typeof createClient>,
  token: string,
  perPage: number,
  startPage?: number
) {
  let page = startPage || 1;
  let totalProcessed = 0;
  let totalMatched = 0;
  let totalPages = 1;

  do {
    const data = (await mycaseGet("/cases", token, {
      page: String(page),
      per_page: String(perPage),
    })) as { cases?: unknown[]; total_pages?: number; current_page?: number };

    const cases = data.cases || [];
    totalPages = data.total_pages || 1;

    for (const c of cases as Record<string, unknown>[]) {
      const mycaseCaseId = Number(c.id);
      const caseNumber = String(c.case_number || "").trim();
      const caseName = String(c.name || c.case_name || "").trim();
      const caseType = String(c.case_type?.name || c.case_type || "").trim();
      const caseStage = String(c.case_stage || c.status || "").trim();
      const practiceArea = String(
        c.practice_area?.name || c.practice_area || ""
      ).trim();
      const isClosed = c.closed === true || c.is_closed === true;
      const leadAttorney = String(
        c.lead_attorney?.name ||
          c.lead_attorney ||
          c.responsible_attorney?.name ||
          ""
      ).trim();
      const description = String(c.description || "").trim();

      // Try to match to existing client
      let matchedClientId: string | null = null;
      let matchedContractId: string | null = null;
      let matchType = "unmatched";

      // Match 1: by mycase_id on clients table
      const { data: clientByMycaseId } = await sb
        .from("clients")
        .select("id")
        .eq("mycase_id", mycaseCaseId)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (clientByMycaseId) {
        matchedClientId = clientByMycaseId.id;
        matchType = "mycase_id";
      }

      // Match 2: by case_number on immigration_cases
      if (!matchedClientId && caseNumber) {
        const { data: immCase } = await sb
          .from("immigration_cases")
          .select("client_id")
          .eq("mycase_case_id", String(mycaseCaseId))
          .limit(1)
          .maybeSingle();
        if (immCase?.client_id) {
          matchedClientId = immCase.client_id;
          matchType = "immigration_case";
        }
      }

      // Match 3: by case_number on clients
      if (!matchedClientId && caseNumber) {
        const { data: clientByCaseNum } = await sb
          .from("clients")
          .select("id")
          .eq("case_number", caseNumber)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();
        if (clientByCaseNum) {
          matchedClientId = clientByCaseNum.id;
          matchType = "case_number";
        }
      }

      // Match 4: by normalized name
      if (!matchedClientId && caseName) {
        const normTarget = normalizeName(caseName);
        if (normTarget.length > 3) {
          const { data: nameCandidates } = await sb
            .from("clients")
            .select("id, name")
            .eq("is_active", true)
            .ilike("name", `%${caseName.split(" ")[0]}%`)
            .limit(50);

          const exactMatches = (nameCandidates || []).filter(
            (cl) => normalizeName(cl.name) === normTarget
          );
          if (exactMatches.length === 1) {
            matchedClientId = exactMatches[0].id;
            matchType = "name_exact";
          }
        }
      }

      // If we matched a client, try to find their contract
      if (matchedClientId) {
        const { data: contract } = await sb
          .from("contracts")
          .select("id")
          .eq("client_id", matchedClientId)
          .in("status", ["Active", "Risk"])
          .limit(1)
          .maybeSingle();
        if (contract) matchedContractId = contract.id;
        totalMatched++;
      }

      // Upsert
      await sb.from("mycase_cases").upsert(
        {
          mycase_case_id: mycaseCaseId,
          case_number: caseNumber || null,
          case_name: caseName || null,
          case_type: caseType || null,
          case_stage: caseStage || null,
          practice_area: practiceArea || null,
          status: isClosed ? "closed" : "open",
          is_closed: isClosed,
          open_date: parseDate(c.open_date || c.created_at),
          closed_date: parseDate(c.closed_date),
          lead_attorney: leadAttorney || null,
          description: description || null,
          matched_client_id: matchedClientId,
          matched_contract_id: matchedContractId,
          match_type: matchType,
          raw_payload: c,
          synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "mycase_case_id" }
      );

      totalProcessed++;
    }

    // Update sync state cursor
    await sb.from("mycase_sync_state").upsert(
      {
        sync_key: "cases",
        last_cursor: String(page),
        last_success_at: new Date().toISOString(),
        last_error: null,
        meta: { page, totalPages, totalProcessed, totalMatched },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "sync_key" }
    );

    page++;
  } while (page <= totalPages && !startPage); // if startPage given, only do that one page

  return { processed: totalProcessed, matched: totalMatched, pages: totalPages };
}

// ── Sync: Contacts ──────────────────────────────────────────────

async function syncContacts(
  sb: ReturnType<typeof createClient>,
  token: string,
  perPage: number,
  startPage?: number
) {
  let page = startPage || 1;
  let totalProcessed = 0;
  let totalMatched = 0;
  let totalPages = 1;

  do {
    const data = (await mycaseGet("/contacts", token, {
      page: String(page),
      per_page: String(perPage),
    })) as { contacts?: unknown[]; total_pages?: number };

    const contacts = data.contacts || [];
    totalPages = data.total_pages || 1;

    for (const ct of contacts as Record<string, unknown>[]) {
      const contactId = Number(ct.id);
      const firstName = String(ct.first_name || "").trim();
      const lastName = String(ct.last_name || "").trim();
      const fullName = String(ct.name || `${firstName} ${lastName}`).trim();
      const email = String(ct.email || "").trim();
      const phone = String(ct.phone || ct.phone_number || "").trim();
      const company = String(ct.company || "").trim();
      const contactType = String(ct.type || ct.contact_type || "").trim();

      let matchedClientId: string | null = null;
      let matchType = "unmatched";

      // Match by mycase_id
      const { data: byMycaseId } = await sb
        .from("clients")
        .select("id")
        .eq("mycase_id", contactId)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (byMycaseId) {
        matchedClientId = byMycaseId.id;
        matchType = "mycase_id";
      }

      // Match by normalized name
      if (!matchedClientId && fullName) {
        const normTarget = normalizeName(fullName);
        if (normTarget.length > 3) {
          const { data: candidates } = await sb
            .from("clients")
            .select("id, name")
            .eq("is_active", true)
            .ilike("name", `%${(lastName || firstName).slice(0, 10)}%`)
            .limit(50);

          const matches = (candidates || []).filter(
            (cl) => normalizeName(cl.name) === normTarget
          );
          if (matches.length === 1) {
            matchedClientId = matches[0].id;
            matchType = "name_exact";

            // Backfill mycase_id on client if missing
            await sb
              .from("clients")
              .update({ mycase_id: contactId })
              .eq("id", matchedClientId)
              .is("mycase_id", null);
          }
        }
      }

      if (matchedClientId) totalMatched++;

      await sb.from("mycase_contacts").upsert(
        {
          mycase_contact_id: contactId,
          first_name: firstName || null,
          last_name: lastName || null,
          full_name: fullName || null,
          email: email || null,
          phone: phone || null,
          company: company || null,
          contact_type: contactType || null,
          matched_client_id: matchedClientId,
          match_type: matchType,
          raw_payload: ct,
          synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "mycase_contact_id" }
      );

      totalProcessed++;
    }

    await sb.from("mycase_sync_state").upsert(
      {
        sync_key: "contacts",
        last_cursor: String(page),
        last_success_at: new Date().toISOString(),
        last_error: null,
        meta: { page, totalPages, totalProcessed, totalMatched },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "sync_key" }
    );

    page++;
  } while (page <= totalPages && !startPage);

  return { processed: totalProcessed, matched: totalMatched, pages: totalPages };
}

// ── Sync: Invoices ──────────────────────────────────────────────

async function syncInvoices(
  sb: ReturnType<typeof createClient>,
  token: string,
  perPage: number,
  startPage?: number
) {
  let page = startPage || 1;
  let totalProcessed = 0;
  let totalMatched = 0;
  let totalPages = 1;

  do {
    const data = (await mycaseGet("/invoices", token, {
      page: String(page),
      per_page: String(perPage),
    })) as { invoices?: unknown[]; total_pages?: number };

    const invoices = data.invoices || [];
    totalPages = data.total_pages || 1;

    for (const inv of invoices as Record<string, unknown>[]) {
      const invoiceId = Number(inv.id);
      const mycaseCaseId = Number(inv.case_id || inv.case?.id || 0) || null;
      const mycaseContactId =
        Number(inv.contact_id || inv.contact?.id || 0) || null;
      const invoiceNumber = String(inv.invoice_number || inv.number || "").trim();
      const status = String(inv.status || "").trim().toLowerCase();
      const amount = Number(inv.total || inv.amount || 0);
      const amountPaid = Number(inv.amount_paid || inv.paid || 0);
      const amountDue = Number(inv.balance || inv.amount_due || amount - amountPaid);

      let matchedClientId: string | null = null;
      let matchedContractId: string | null = null;
      let matchType = "unmatched";

      // Match via the case we already synced
      if (mycaseCaseId) {
        const { data: syncedCase } = await sb
          .from("mycase_cases")
          .select("matched_client_id, matched_contract_id")
          .eq("mycase_case_id", mycaseCaseId)
          .limit(1)
          .maybeSingle();
        if (syncedCase?.matched_client_id) {
          matchedClientId = syncedCase.matched_client_id;
          matchedContractId = syncedCase.matched_contract_id;
          matchType = "via_case";
        }
      }

      // Match via contact
      if (!matchedClientId && mycaseContactId) {
        const { data: syncedContact } = await sb
          .from("mycase_contacts")
          .select("matched_client_id")
          .eq("mycase_contact_id", mycaseContactId)
          .limit(1)
          .maybeSingle();
        if (syncedContact?.matched_client_id) {
          matchedClientId = syncedContact.matched_client_id;
          matchType = "via_contact";
        }
      }

      if (matchedClientId) totalMatched++;

      await sb.from("mycase_invoices").upsert(
        {
          mycase_invoice_id: invoiceId,
          mycase_case_id: mycaseCaseId,
          mycase_contact_id: mycaseContactId,
          invoice_number: invoiceNumber || null,
          status: status || null,
          amount,
          amount_paid: amountPaid,
          amount_due: amountDue,
          issue_date: parseDate(inv.issue_date || inv.created_at),
          due_date: parseDate(inv.due_date),
          paid_date: parseDate(inv.paid_date),
          description: String(inv.description || inv.notes || "").trim() || null,
          matched_client_id: matchedClientId,
          matched_contract_id: matchedContractId,
          match_type: matchType,
          raw_payload: inv,
          synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "mycase_invoice_id" }
      );

      totalProcessed++;
    }

    await sb.from("mycase_sync_state").upsert(
      {
        sync_key: "invoices",
        last_cursor: String(page),
        last_success_at: new Date().toISOString(),
        last_error: null,
        meta: { page, totalPages, totalProcessed, totalMatched },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "sync_key" }
    );

    page++;
  } while (page <= totalPages && !startPage);

  return { processed: totalProcessed, matched: totalMatched, pages: totalPages };
}

// ── Utilities ───────────────────────────────────────────────────

function parseDate(value: unknown): string | null {
  if (!value) return null;
  const str = String(value).trim();
  if (!str || str === "null" || str === "undefined") return null;

  // Handle MM/DD/YYYY format
  const mdyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyMatch) {
    return `${mdyMatch[3]}-${mdyMatch[1].padStart(2, "0")}-${mdyMatch[2].padStart(2, "0")}`;
  }

  // Try ISO parse
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];

  return null;
}
