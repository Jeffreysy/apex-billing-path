const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const filevineHistoryUrl = Deno.env.get("FILEVINE_PAYMENTS_URL") || "";
const filevineApiToken = Deno.env.get("FILEVINE_API_TOKEN") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type BackfillBody = {
  records?: Record<string, unknown>[];
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
  next_cursor?: string | null;
};

const crm2Endpoint = `${supabaseUrl}/functions/v1/crm2-payment-received`;

const coerceRecords = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (payload && typeof payload === "object") {
    const source = payload as Record<string, unknown>;
    for (const key of ["results", "items", "data", "payments"]) {
      const value = source[key];
      if (Array.isArray(value)) return value as Record<string, unknown>[];
    }
  }
  return [];
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json().catch(() => ({}))) as BackfillBody;
    let records = body.records || [];
    let cursor = body.next_cursor ?? null;

    if (!records.length) {
      if (!filevineHistoryUrl || !filevineApiToken) {
        return new Response(JSON.stringify({
          error: "FILEVINE_PAYMENTS_URL and FILEVINE_API_TOKEN must be configured, or provide records in the request body.",
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const url = new URL(filevineHistoryUrl);
      if (body.from_date) url.searchParams.set("from_date", body.from_date);
      if (body.to_date) url.searchParams.set("to_date", body.to_date);
      if (body.page) url.searchParams.set("page", String(body.page));
      if (body.page_size) url.searchParams.set("page_size", String(body.page_size));
      if (cursor) url.searchParams.set("cursor", cursor);

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${filevineApiToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return new Response(JSON.stringify({
          error: `Filevine history request failed: ${response.status} ${response.statusText}`,
        }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const remotePayload = await response.json();
      records = coerceRecords(remotePayload);
      if (remotePayload && typeof remotePayload === "object") {
        const payloadObj = remotePayload as Record<string, unknown>;
        cursor = typeof payloadObj.next_cursor === "string" ? payloadObj.next_cursor : cursor;
      }
    }

    let processed = 0;
    let failed = 0;
    const failures: Array<{ payment_id?: unknown; error: string }> = [];

    for (const record of records) {
      const response = await fetch(crm2Endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify(record),
      });

      const result = await response.json().catch(() => ({}));
      if (response.ok && result?.success !== false) {
        processed += 1;
      } else {
        failed += 1;
        failures.push({
          payment_id: record["Payment Id"] || record["payment_id"] || record["id"],
          error: result?.error || result?.reason || `HTTP ${response.status}`,
        });
      }
    }

    await fetch(`${supabaseUrl}/rest/v1/filevine_sync_state?on_conflict=sync_key`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        sync_key: "payments",
        last_success_at: new Date().toISOString(),
        last_cursor: cursor,
        last_payment_date: body.to_date || body.from_date || null,
        meta: {
          processed,
          failed,
        },
      }),
    });

    return new Response(JSON.stringify({
      success: true,
      processed,
      failed,
      next_cursor: cursor,
      failures,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
