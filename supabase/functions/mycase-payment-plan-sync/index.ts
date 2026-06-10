import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MYCASE_DOMAIN = "grand-rapids-law-group.mycase.com";
const BASE_URL = `https://${MYCASE_DOMAIN}`;

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Name normalization ─────────────────────────────────────────
// Matches build_contract_fixes.py and payment-received/index.ts:
// uppercase, strip parenthetical markers, strip case numbers, strip punctuation, collapse whitespace

function normalizeName(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .toUpperCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b\d{2}-\d{3,5}\b/g, "")
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMoney(val: string | number | null | undefined): number {
  if (val === null || val === undefined) return 0;
  const n = Number(String(val).replace(/[$,]/g, "").trim());
  return isNaN(n) ? 0 : n;
}

function parseInstallmentString(val: string): { paid: number; total: number } {
  const m = String(val || "").match(/(\d+)\s+of\s+(\d+)/i);
  return m ? { paid: parseInt(m[1]), total: parseInt(m[2]) } : { paid: 0, total: 0 };
}

function stripHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

// ── Types ──────────────────────────────────────────────────────

interface PaymentPlan {
  invoice_number: string;
  contact: string;
  case_name: string;
  total: number;
  paid: number;
  amount_due: number;
  installments_paid: number;
  total_installments: number;
  next_due: string;
  next_amount: number;
  final_date: string;
}

interface ContractRow {
  id: string;
  client_id: string | null;
  client_name: string;
  value: number;
  collected: number;
  monthly_installment: number;
  installments_paid: number;
  total_installments: number;
  status: string;
  delinquency_status: string | null;
  normalized_name: string;
}

interface FieldChange {
  field: string;
  old_value: number;
  new_value: number;
}

interface UpdateDetail {
  contract_id: string;
  client_name: string;
  invoice_number: string;
  changes: FieldChange[];
}

// ── HTML parsing ───────────────────────────────────────────────

function parsePaymentPlansFromHTML(html: string): PaymentPlan[] {
  const plans: PaymentPlan[] = [];

  // Extract table body rows — look for <tbody> first, fall back to all <tr>
  const tbodyMatch = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
  const tableContent = tbodyMatch ? tbodyMatch[1] : html;

  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
    const rowHTML = rowMatch[1];
    if (/<th[\s>]/i.test(rowHTML)) continue;

    const cells: string[] = [];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowHTML)) !== null) {
      cells.push(stripHTML(cellMatch[1]));
    }

    if (cells.length < 8) continue;

    // Column order: Invoice#, Contact, Case, Total, Paid, AmountDue,
    //               InstPaid/InstTotal ("X of Y payments"), NextDue, NextAmt, FinalDate
    const inst = parseInstallmentString(cells[6]);

    plans.push({
      invoice_number: cells[0].trim(),
      contact: cells[1].trim(),
      case_name: cells[2].trim(),
      total: parseMoney(cells[3]),
      paid: parseMoney(cells[4]),
      amount_due: parseMoney(cells[5]),
      installments_paid: inst.paid,
      total_installments: inst.total,
      next_due: cells[7]?.trim() || "",
      next_amount: parseMoney(cells[8]),
      final_date: cells[9]?.trim() || "",
    });
  }

  return plans;
}

function detectTotalPages(html: string): number {
  // Look for pagination: "Page X of Y", or last page link
  const pageOfMatch = html.match(/page\s+\d+\s+of\s+(\d+)/i);
  if (pageOfMatch) return parseInt(pageOfMatch[1]);

  // Look for pagination links with page numbers
  const pageLinks = html.match(/current_page=(\d+)/g) || [];
  let maxPage = 1;
  for (const link of pageLinks) {
    const m = link.match(/current_page=(\d+)/);
    if (m) maxPage = Math.max(maxPage, parseInt(m[1]));
  }
  return maxPage;
}

// ── Scraper ────────────────────────────────────────────────────

async function scrapePaymentPlans(
  sessionCookie: string
): Promise<{ plans: PaymentPlan[]; pagesFetched: number }> {
  const allPlans: PaymentPlan[] = [];
  let page = 1;
  const perPage = 100;
  let totalPages = 1;
  let pagesFetched = 0;

  do {
    const url = `${BASE_URL}/payment_plans?current_page=${page}&per_page=${perPage}`;

    const resp = await fetch(url, {
      headers: {
        Cookie: sessionCookie,
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "LexCollect-Sync/1.0",
      },
      redirect: "manual",
    });

    if (resp.status === 302 || resp.status === 301) {
      throw new Error(
        `MyCase redirected (likely auth expired). Location: ${resp.headers.get("location") || "unknown"}`
      );
    }

    if (!resp.ok) {
      throw new Error(`MyCase returned ${resp.status} on page ${page}`);
    }

    const html = await resp.text();
    pagesFetched++;

    if (page === 1) {
      totalPages = detectTotalPages(html);
    }

    const pagePlans = parsePaymentPlansFromHTML(html);
    allPlans.push(...pagePlans);

    if (pagePlans.length < perPage) break;
    page++;
  } while (page <= totalPages);

  return { plans: allPlans, pagesFetched };
}

// ── Contract matching & updating ───────────────────────────────

async function syncPlansToContracts(
  sb: ReturnType<typeof createClient>,
  plans: PaymentPlan[],
  logId: string,
  source: string
): Promise<{
  matched: number;
  updated: number;
  skipped: number;
  unmatched: number;
  fieldChanges: Record<string, number>;
  updateDetails: UpdateDetail[];
  errors: string[];
}> {
  const errors: string[] = [];

  // Load all contracts with client names for matching
  const { data: contractRows, error: contractErr } = await sb
    .from("contracts")
    .select(
      "id, client_id, value, collected, monthly_installment, installments_paid, total_installments, status, delinquency_status, clients!inner(name)"
    )
    .in("status", ["Active", "Risk", "Overdue", "Delinquent"]);

  if (contractErr) {
    throw new Error(`Failed to load contracts: ${contractErr.message}`);
  }

  const contracts: ContractRow[] = (contractRows || []).map(
    (r: Record<string, unknown>) => {
      const clientObj = r.clients as { name: string } | null;
      const clientName = clientObj?.name || "";
      return {
        id: r.id as string,
        client_id: r.client_id as string | null,
        client_name: clientName,
        value: Number(r.value || 0),
        collected: Number(r.collected || 0),
        monthly_installment: Number(r.monthly_installment || 0),
        installments_paid: Number(r.installments_paid || 0),
        total_installments: Number(r.total_installments || 0),
        status: r.status as string,
        delinquency_status: r.delinquency_status as string | null,
        normalized_name: normalizeName(clientName),
      };
    }
  );

  // Build lookup by normalized name. When multiple contracts share a name,
  // keep the one with the highest value (primary contract).
  const contractByNormName = new Map<string, ContractRow>();
  for (const c of contracts) {
    if (!c.normalized_name) continue;
    const existing = contractByNormName.get(c.normalized_name);
    if (!existing || c.value > existing.value) {
      contractByNormName.set(c.normalized_name, c);
    }
  }

  let matched = 0;
  let updated = 0;
  let skipped = 0;
  let unmatched = 0;
  const fieldChanges: Record<string, number> = {};
  const updateDetails: UpdateDetail[] = [];

  for (const plan of plans) {
    const normContact = normalizeName(plan.contact);

    // Upsert into mycase_payment_plans
    const ppRow = {
      invoice_number: plan.invoice_number,
      contact: plan.contact,
      case_name: plan.case_name,
      total: plan.total,
      paid: plan.paid,
      amount_due: plan.amount_due,
      installments_paid: plan.installments_paid,
      total_installments: plan.total_installments,
      next_due_date: plan.next_due,
      next_amount: plan.next_amount,
      final_date: plan.final_date,
      normalized_contact: normContact,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const contract = contractByNormName.get(normContact);

    if (!contract) {
      unmatched++;
      await sb
        .from("mycase_payment_plans")
        .upsert(
          { ...ppRow, match_type: "unmatched", matched_contract_id: null },
          { onConflict: "invoice_number" }
        );
      continue;
    }

    matched++;

    await sb
      .from("mycase_payment_plans")
      .upsert(
        {
          ...ppRow,
          matched_contract_id: contract.id,
          match_type: "name_exact",
        },
        { onConflict: "invoice_number" }
      );

    // Compare fields and build update
    const changes: FieldChange[] = [];

    if (Math.abs(contract.collected - plan.paid) > 1) {
      changes.push({
        field: "collected",
        old_value: contract.collected,
        new_value: plan.paid,
      });
    }

    if (contract.installments_paid !== plan.installments_paid) {
      changes.push({
        field: "installments_paid",
        old_value: contract.installments_paid,
        new_value: plan.installments_paid,
      });
    }

    if (contract.total_installments !== plan.total_installments) {
      changes.push({
        field: "total_installments",
        old_value: contract.total_installments,
        new_value: plan.total_installments,
      });
    }

    if (Math.abs(contract.monthly_installment - plan.next_amount) > 1) {
      changes.push({
        field: "monthly_installment",
        old_value: contract.monthly_installment,
        new_value: plan.next_amount,
      });
    }

    if (Math.abs(contract.value - plan.total) > 1) {
      changes.push({
        field: "value",
        old_value: contract.value,
        new_value: plan.total,
      });
    }

    if (changes.length === 0) {
      skipped++;
      continue;
    }

    // Apply updates
    const updateData: Record<string, unknown> = {};
    for (const ch of changes) {
      updateData[ch.field] = ch.new_value;
      fieldChanges[ch.field] = (fieldChanges[ch.field] || 0) + 1;
    }

    const { error: updateErr } = await sb
      .from("contracts")
      .update(updateData)
      .eq("id", contract.id);

    if (updateErr) {
      errors.push(
        `Update failed for ${contract.client_name} (${contract.id}): ${updateErr.message}`
      );
      continue;
    }

    updated++;
    updateDetails.push({
      contract_id: contract.id,
      client_name: contract.client_name,
      invoice_number: plan.invoice_number,
      changes,
    });
  }

  return { matched, updated, skipped, unmatched, fieldChanges, updateDetails, errors };
}

// ── Main handler ───────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const sb = createClient(supabaseUrl, serviceRoleKey);
  const startTime = Date.now();

  // Create sync log entry
  const { data: logRow, error: logErr } = await sb
    .from("payment_plan_sync_log")
    .insert({ status: "running", source: "unknown" })
    .select("id")
    .single();

  if (logErr || !logRow) {
    return json(
      { error: `Failed to create sync log: ${logErr?.message}` },
      500
    );
  }
  const logId = logRow.id;

  try {
    let plans: PaymentPlan[];
    let pagesFetched = 0;
    let source: string;
    let body: Record<string, unknown> = {};

    try {
      body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    } catch {
      // no body is fine — default to scrape mode
    }

    const dryRun = body.dry_run === true;

    if (body.plans && Array.isArray(body.plans)) {
      // ── Push mode: accept pre-scraped data ──
      source = "push";
      plans = (body.plans as Record<string, unknown>[]).map((r) => ({
        invoice_number: String(r.invoice_number || r.Invoice || "").trim(),
        contact: String(r.contact || r.Contact || "").trim(),
        case_name: String(r.case_name || r.Case || "").trim(),
        total: parseMoney(r.total ?? r.Total),
        paid: parseMoney(r.paid ?? r.Paid),
        amount_due: parseMoney(r.amount_due ?? r.AmountDue),
        installments_paid: Number(r.installments_paid ?? r.InstPaid ?? 0),
        total_installments: Number(r.total_installments ?? r.InstTotal ?? 0),
        next_due: String(r.next_due ?? r.NextDue ?? "").trim(),
        next_amount: parseMoney(r.next_amount ?? r.NextAmt),
        final_date: String(r.final_date ?? r.FinalDate ?? "").trim(),
      }));
    } else {
      // ── Scrape mode: fetch from MyCase ──
      source = "scrape";
      const sessionCookie = Deno.env.get("MYCASE_SESSION_COOKIE") || "";

      if (!sessionCookie) {
        await failLog(sb, logId, startTime, source, "MYCASE_SESSION_COOKIE secret is not set");
        return json(
          {
            error:
              "MYCASE_SESSION_COOKIE not configured. Set it in Supabase secrets, or POST with { plans: [...] } for push mode.",
          },
          400
        );
      }

      const result = await scrapePaymentPlans(sessionCookie);
      plans = result.plans;
      pagesFetched = result.pagesFetched;
    }

    if (plans.length === 0) {
      await failLog(sb, logId, startTime, source, "No payment plans found");
      return json({ error: "No payment plans found", source }, 400);
    }

    // Update log with scrape count
    await sb
      .from("payment_plan_sync_log")
      .update({ plans_scraped: plans.length, pages_fetched: pagesFetched, source })
      .eq("id", logId);

    if (dryRun) {
      // Dry run: show what would change without updating
      const preview = await previewChanges(sb, plans);
      const durationMs = Date.now() - startTime;
      await sb
        .from("payment_plan_sync_log")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          plans_scraped: plans.length,
          plans_matched: preview.matched,
          contracts_updated: 0,
          contracts_skipped: preview.skipped,
          unmatched_plans: preview.unmatched,
          field_changes: preview.fieldChanges,
          update_details: preview.wouldUpdate.slice(0, 100),
          source,
          duration_ms: durationMs,
        })
        .eq("id", logId);

      return json({
        dry_run: true,
        plans_scraped: plans.length,
        pages_fetched: pagesFetched,
        matched: preview.matched,
        would_update: preview.wouldUpdate.length,
        skipped: preview.skipped,
        unmatched: preview.unmatched,
        field_changes: preview.fieldChanges,
        sample_updates: preview.wouldUpdate.slice(0, 20),
        source,
        duration_ms: durationMs,
      });
    }

    // Full sync: match and update
    const result = await syncPlansToContracts(sb, plans, logId, source);
    const durationMs = Date.now() - startTime;

    // Finalize log
    await sb
      .from("payment_plan_sync_log")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        plans_matched: result.matched,
        contracts_updated: result.updated,
        contracts_skipped: result.skipped,
        unmatched_plans: result.unmatched,
        field_changes: result.fieldChanges,
        update_details: result.updateDetails.slice(0, 200),
        errors: result.errors,
        duration_ms: durationMs,
      })
      .eq("id", logId);

    return json({
      success: true,
      sync_log_id: logId,
      plans_scraped: plans.length,
      pages_fetched: pagesFetched,
      matched: result.matched,
      contracts_updated: result.updated,
      contracts_skipped_no_changes: result.skipped,
      unmatched: result.unmatched,
      field_changes: result.fieldChanges,
      errors: result.errors.length > 0 ? result.errors : undefined,
      sample_updates: result.updateDetails.slice(0, 10),
      source,
      duration_ms: durationMs,
    });
  } catch (err) {
    const msg = (err as Error).message;
    await failLog(sb, logId, startTime, "unknown", msg);
    return json({ error: msg, sync_log_id: logId }, 500);
  }
});

// ── Dry-run preview ────────────────────────────────────────────

async function previewChanges(
  sb: ReturnType<typeof createClient>,
  plans: PaymentPlan[]
): Promise<{
  matched: number;
  skipped: number;
  unmatched: number;
  fieldChanges: Record<string, number>;
  wouldUpdate: UpdateDetail[];
}> {
  const { data: contractRows } = await sb
    .from("contracts")
    .select(
      "id, client_id, value, collected, monthly_installment, installments_paid, total_installments, status, delinquency_status, clients!inner(name)"
    )
    .in("status", ["Active", "Risk", "Overdue", "Delinquent"]);

  const contractByNormName = new Map<string, ContractRow>();
  for (const r of contractRows || []) {
    const clientObj = (r as Record<string, unknown>).clients as {
      name: string;
    } | null;
    const name = clientObj?.name || "";
    const norm = normalizeName(name);
    if (!norm) continue;
    const c: ContractRow = {
      id: (r as Record<string, unknown>).id as string,
      client_id: (r as Record<string, unknown>).client_id as string | null,
      client_name: name,
      value: Number((r as Record<string, unknown>).value || 0),
      collected: Number((r as Record<string, unknown>).collected || 0),
      monthly_installment: Number(
        (r as Record<string, unknown>).monthly_installment || 0
      ),
      installments_paid: Number(
        (r as Record<string, unknown>).installments_paid || 0
      ),
      total_installments: Number(
        (r as Record<string, unknown>).total_installments || 0
      ),
      status: (r as Record<string, unknown>).status as string,
      delinquency_status: (r as Record<string, unknown>)
        .delinquency_status as string | null,
      normalized_name: norm,
    };
    const existing = contractByNormName.get(norm);
    if (!existing || c.value > existing.value) {
      contractByNormName.set(norm, c);
    }
  }

  let matched = 0;
  let skipped = 0;
  let unmatched = 0;
  const fieldChanges: Record<string, number> = {};
  const wouldUpdate: UpdateDetail[] = [];

  for (const plan of plans) {
    const contract = contractByNormName.get(normalizeName(plan.contact));
    if (!contract) {
      unmatched++;
      continue;
    }
    matched++;

    const changes: FieldChange[] = [];
    if (Math.abs(contract.collected - plan.paid) > 1)
      changes.push({ field: "collected", old_value: contract.collected, new_value: plan.paid });
    if (contract.installments_paid !== plan.installments_paid)
      changes.push({ field: "installments_paid", old_value: contract.installments_paid, new_value: plan.installments_paid });
    if (contract.total_installments !== plan.total_installments)
      changes.push({ field: "total_installments", old_value: contract.total_installments, new_value: plan.total_installments });
    if (Math.abs(contract.monthly_installment - plan.next_amount) > 1)
      changes.push({ field: "monthly_installment", old_value: contract.monthly_installment, new_value: plan.next_amount });
    if (Math.abs(contract.value - plan.total) > 1)
      changes.push({ field: "value", old_value: contract.value, new_value: plan.total });

    if (changes.length === 0) {
      skipped++;
      continue;
    }

    for (const ch of changes) {
      fieldChanges[ch.field] = (fieldChanges[ch.field] || 0) + 1;
    }
    wouldUpdate.push({
      contract_id: contract.id,
      client_name: contract.client_name,
      invoice_number: plan.invoice_number,
      changes,
    });
  }

  return { matched, skipped, unmatched, fieldChanges, wouldUpdate };
}

// ── Helpers ────────────────────────────────────────────────────

async function failLog(
  sb: ReturnType<typeof createClient>,
  logId: string,
  startTime: number,
  source: string,
  errorMsg: string
) {
  await sb
    .from("payment_plan_sync_log")
    .update({
      status: "failed",
      completed_at: new Date().toISOString(),
      errors: [errorMsg],
      source,
      duration_ms: Date.now() - startTime,
    })
    .eq("id", logId);
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
