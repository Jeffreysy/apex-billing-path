const cleanSecret = (value: string | undefined | null) =>
  String(value || "")
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1");

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const filevineHistoryUrl = cleanSecret(Deno.env.get("FILEVINE_PAYMENTS_URL"));
const filevineApiToken = cleanSecret(Deno.env.get("FILEVINE_API_TOKEN"));
const filevineClientId = cleanSecret(Deno.env.get("FILEVINE_CLIENT_ID"));
const filevineClientSecret = cleanSecret(Deno.env.get("FILEVINE_CLIENT_SECRET"));
const filevineOrgId = cleanSecret(Deno.env.get("FILEVINE_ORG_ID"));
const filevineUserId = cleanSecret(Deno.env.get("FILEVINE_USER_ID"));

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
      if (!filevineHistoryUrl || !filevineApiToken || !filevineClientId || !filevineClientSecret || !filevineOrgId || !filevineUserId) {
        return new Response(JSON.stringify({
          error: "FILEVINE_PAYMENTS_URL, FILEVINE_API_TOKEN, FILEVINE_CLIENT_ID, FILEVINE_CLIENT_SECRET, FILEVINE_ORG_ID, and FILEVINE_USER_ID must be configured, or provide records in the request body.",
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tokenBody =
        `client_id=${encodeURIComponent(filevineClientId)}`
        + `&client_secret=${encodeURIComponent(filevineClientSecret)}`
        + `&grant_type=personal_access_token`
        + `&scope=${encodeURIComponent("fv.api.gateway.access tenant filevine.v2.api.* openid email fv.auth.tenant.read")}`
        + `&token=${encodeURIComponent(filevineApiToken)}`;

      const tokenResponse = await fetch("https://identity.filevine.com/connect/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: tokenBody,
      });

      if (!tokenResponse.ok) {
        const failureText = (await tokenResponse.text()).slice(0, 500);
        return new Response(JSON.stringify({
          error: `Filevine auth failed: ${tokenResponse.status} ${tokenResponse.statusText}`,
          diagnostics: {
            client_id_length: filevineClientId.length,
            client_secret_length: filevineClientSecret.length,
            api_token_length: filevineApiToken.length,
            org_id: filevineOrgId,
            user_id: filevineUserId,
            token_url: "https://identity.filevine.com/connect/token",
            response_body: failureText,
          },
        }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tokenPayload = await tokenResponse.json();
      const bearer = tokenPayload.access_token;

      const url = new URL(filevineHistoryUrl);
      if (body.from_date) url.searchParams.set("from_date", body.from_date);
      if (body.to_date) url.searchParams.set("to_date", body.to_date);
      if (body.page) url.searchParams.set("page", String(body.page));
      if (body.page_size) url.searchParams.set("page_size", String(body.page_size));
      if (cursor) url.searchParams.set("cursor", cursor);

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${bearer}`,
          "x-fv-orgid": filevineOrgId,
          "x-fv-userid": filevineUserId,
          Accept: "application/json",
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
