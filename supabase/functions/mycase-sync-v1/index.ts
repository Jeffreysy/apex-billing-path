import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * MyCase Sync (v1 API) — external-integrations.mycase.com/v1
 *
 * Pulls invoices and invoice_payments and upserts into
 * mycase_invoices / mycase_invoice_payments.
 *
 * POST body:
 *   { "entity": "ping" }                       -> connectivity check (1 record)
 *   { "entity": "invoices" | "invoice_payments" | "all", "page"?: n, "per_page"?: n }
 *
 * Reads the OAuth token from mycase_sync_state (sync_key='oauth') and
 * auto-refreshes via the mycase-auth POST endpoint when near expiry.
 */

const API_BASE = "https://external-integrations.mycase.com/v1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const shadowInternalToken = Deno.env.get("PAYMENT_SHADOW_INTERNAL_TOKEN") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Entity = "ping" | "invoices" | "invoice_payments" | "all";

interface SyncRequest {
  entity?: Entity;
  page?: number;
  per_page?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  const sb = createClient(supabaseUrl, serviceRoleKey);
  let entity: Entity = "all";

  try {
    const body = (await req.json().catch(() => ({}))) as SyncRequest;
    entity = body.entity || "all";
    const perPage = Math.min(body.per_page || 100, 100);

    const token = await getValidToken(sb);
    if (!token) {
      return json(
        {
          error:
            "No valid access token in mycase_sync_state (sync_key='oauth'). Complete OAuth handoff first.",
        },
        401
      );
    }

    if (entity === "ping") {
      const probe = (await mycaseGet("/invoices", token, {
        page: "1",
        per_page: "1",
      })) as ApiList;
      return json({
        success: true,
        connectivity: "ok",
        sample_total_count: probe?.meta?.pagination?.total_count ?? null,
        sample_record_keys: probe?.data?.[0] ? Object.keys(probe.data[0]) : [],
      });
    }

    const results: Record<string, unknown> = {};
    if (entity === "invoices" || entity === "all") {
      results.invoices = await syncInvoices(sb, token, perPage, body.page);
      results.payment_rematch = await runPaymentRematch();
    }
    if (entity === "invoice_payments" || entity === "all") {
      results.invoice_payments = await syncPayments(sb, token, perPage, body.page);
    }

    return json({ success: true, results });
  } catch (err) {
    const msg = (err as Error).message;
    try {
      await sb.from("mycase_sync_state").upsert(
        {
          sync_key: entity === "all" ? "v1_sync_error" : `v1_${entity}`,
          last_error: msg,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "sync_key" }
      );
    } catch (_) { /* best-effort */ }
    return json({ error: msg }, 500);
  }
});

async function runPaymentRematch(): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/rematch-payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "x-shadow-internal-token": shadowInternalToken,
      },
      body: JSON.stringify({ dry_run: false }),
    });
    const payload = await response.json().catch(() => ({}));
    return response.ok
      ? { status: "completed", ...payload }
      : { status: "failed", http_status: response.status, error: payload?.error ?? "Unknown response" };
  } catch (error) {
    return { status: "failed", error: error instanceof Error ? error.message : String(error) };
  }
}

// ── helpers ─────────────────────────────────────────────────────

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface ApiList {
  data?: Record<string, unknown>[];
  meta?: { pagination?: { current_page?: number; total_pages?: number; total_count?: number } };
}

async function getValidToken(
  sb: ReturnType<typeof createClient>
): Promise<string | null> {
  const { data: state } = await sb
    .from("mycase_sync_state")
    .select("access_token, refresh_token, token_expires_at")
    .eq("sync_key", "oauth")
    .maybeSingle();

  if (!state) return null;

  const expiresAt = new Date(state.token_expires_at || 0).getTime();
  if (state.access_token && expiresAt - Date.now() > 5 * 60 * 1000) {
    return state.access_token;
  }

  if (!state.refresh_token) return state.access_token || null;

  // Refresh via mycase-auth POST (uses stored client_id/secret).
  const resp = await fetch(`${supabaseUrl}/functions/v1/mycase-auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Token refresh failed (${resp.status}): ${t.slice(0, 300)}`);
  }

  const { data: updated } = await sb
    .from("mycase_sync_state")
    .select("access_token")
    .eq("sync_key", "oauth")
    .maybeSingle();
  return updated?.access_token || null;
}

async function mycaseGet(
  path: string,
  token: string,
  params?: Record<string, string>
): Promise<unknown> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const resp = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (resp.status === 401) throw new Error("MyCase API 401 — token rejected");
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`MyCase API ${resp.status}: ${text.slice(0, 300)}`);
  }
  return await resp.json();
}

function num(v: unknown): number {
  if (v == null) return 0;
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

function dateOnly(v: unknown): string | null {
  if (!v) return null;
  const s = String(v).trim();
  if (!s || s === "null") return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
}

async function setCursor(
  sb: ReturnType<typeof createClient>,
  key: string,
  page: number,
  meta: Record<string, unknown>
) {
  await sb.from("mycase_sync_state").upsert(
    {
      sync_key: key,
      last_cursor: String(page),
      last_success_at: new Date().toISOString(),
      last_error: null,
      meta,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "sync_key" }
  );
}

// ── invoices ────────────────────────────────────────────────────

async function syncInvoices(
  sb: ReturnType<typeof createClient>,
  token: string,
  perPage: number,
  onlyPage?: number
) {
  let page = onlyPage || 1;
  let totalPages = 1;
  let processed = 0;

  do {
    const resp = (await mycaseGet("/invoices", token, {
      page: String(page),
      per_page: String(perPage),
    })) as ApiList;

    const rows = resp.data || [];
    totalPages = resp.meta?.pagination?.total_pages || 1;

    for (const inv of rows) {
      const client = (inv.client || {}) as Record<string, unknown>;
      const kase = (inv.case || {}) as Record<string, unknown>;
      await sb.from("mycase_invoices").upsert(
        {
          mycase_invoice_id: Number(inv.id),
          mycase_case_id: kase.id ? Number(kase.id) : null,
          mycase_contact_id: client.id ? Number(client.id) : null,
          invoice_number: inv.invoice_number != null ? String(inv.invoice_number) : null,
          status: inv.status ? String(inv.status) : null,
          amount: num(inv.total_amount),
          amount_paid: num(inv.payments_applied),
          amount_due: num(inv.balance_remaining),
          issue_date: dateOnly(inv.invoice_date),
          due_date: dateOnly(inv.due_date),
          raw_payload: inv,
          synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "mycase_invoice_id" }
      );
      processed++;
    }

    await setCursor(sb, "invoices", page, { page, totalPages, processed });
    page++;
  } while (page <= totalPages && !onlyPage);

  return { processed, pages: totalPages };
}

// ── invoice_payments ────────────────────────────────────────────

async function syncPayments(
  sb: ReturnType<typeof createClient>,
  token: string,
  perPage: number,
  onlyPage?: number
) {
  let page = onlyPage || 1;
  let totalPages = 1;
  let processed = 0;

  do {
    const resp = (await mycaseGet("/invoice_payments", token, {
      page: String(page),
      per_page: String(perPage),
    })) as ApiList;

    const rows = resp.data || [];
    totalPages = resp.meta?.pagination?.total_pages || 1;

    for (const p of rows) {
      const client = (p.client || {}) as Record<string, unknown>;
      await sb.from("mycase_invoice_payments").upsert(
        {
          mycase_payment_id: Number(p.id),
          mycase_invoice_id: p.invoice_id ? Number(p.invoice_id) : null,
          amount: num(p.amount),
          payment_date: dateOnly(p.payment_date),
          payment_method: p.payment_method ? String(p.payment_method) : null,
          reference_number: p.reference_number ? String(p.reference_number) : null,
          client_name: client.name ? String(client.name) : null,
          mycase_client_id: client.id ? Number(client.id) : null,
          raw_payload: p,
          synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "mycase_payment_id" }
      );
      processed++;
    }

    await setCursor(sb, "invoice_payments", page, { page, totalPages, processed });
    page++;
  } while (page <= totalPages && !onlyPage);

  return { processed, pages: totalPages };
}
