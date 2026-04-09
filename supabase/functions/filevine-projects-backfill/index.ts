import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cleanSecret = (value: string | undefined | null) =>
  String(value || "")
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1");

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const filevineProjectsUrl = cleanSecret(Deno.env.get("FILEVINE_PROJECTS_URL"));
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
  page?: number;
  page_size?: number;
  offset?: number;
  limit?: number;
  next_cursor?: string | null;
};

const normalizeName = (value: unknown) =>
  String(value || "")
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/\./g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const coerceRecords = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (payload && typeof payload === "object") {
    const source = payload as Record<string, unknown>;
    for (const key of ["results", "items", "data", "projects"]) {
      const value = source[key];
      if (Array.isArray(value)) return value as Record<string, unknown>[];
    }
  }
  return [];
};

const parseBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.trim().toLowerCase() === "true";
  return null;
};

const getValue = (record: Record<string, unknown>, ...keys: string[]) => {
  const lookup = new Map<string, unknown>();
  for (const [key, value] of Object.entries(record)) {
    lookup.set(key.toLowerCase().replace(/[^a-z0-9]/g, ""), value);
  }
  for (const key of keys) {
    const value = lookup.get(key.toLowerCase().replace(/[^a-z0-9]/g, ""));
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
};

const unwrapScalar = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object") {
    const source = value as Record<string, unknown>;
    for (const key of ["native", "partner", "id", "value"]) {
      const candidate = source[key];
      if (candidate !== null && candidate !== undefined && candidate !== "") return String(candidate);
    }
  }
  return "";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json().catch(() => ({}))) as BackfillBody;
    const sb = createClient(supabaseUrl, serviceRoleKey);

    let records = body.records || [];
    let cursor = body.next_cursor ?? null;

    if (!records.length) {
      if (!filevineProjectsUrl || !filevineApiToken || !filevineClientId || !filevineClientSecret || !filevineOrgId || !filevineUserId) {
        return new Response(JSON.stringify({
          error: "FILEVINE_PROJECTS_URL, FILEVINE_API_TOKEN, FILEVINE_CLIENT_ID, FILEVINE_CLIENT_SECRET, FILEVINE_ORG_ID, and FILEVINE_USER_ID must be configured, or provide records in the request body.",
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

      const apiOrigin = new URL(filevineProjectsUrl).origin;
      const url = cursor && /^https?:\/\//i.test(cursor)
        ? new URL(cursor)
        : cursor && cursor.startsWith("/")
          ? new URL(`/fv-app/v2${cursor}`, apiOrigin)
          : new URL(filevineProjectsUrl);

      if (!cursor) {
        const limit = body.limit ?? body.page_size ?? 50;
        const offset = body.offset ?? (body.page && body.page_size ? Math.max(body.page - 1, 0) * body.page_size : 0);
        url.searchParams.set("limit", String(limit));
        url.searchParams.set("offset", String(offset));
      }

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
          error: `Filevine projects request failed: ${response.status} ${response.statusText}`,
        }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const remotePayload = await response.json();
      records = coerceRecords(remotePayload);
      if (remotePayload && typeof remotePayload === "object") {
        const payloadObj = remotePayload as Record<string, unknown>;
        if (typeof payloadObj.next_cursor === "string") {
          cursor = payloadObj.next_cursor;
        } else if (payloadObj.links && typeof payloadObj.links === "object") {
          const links = payloadObj.links as Record<string, unknown>;
          cursor = typeof links.next === "string" ? links.next : null;
        } else {
          cursor = null;
        }
      }
    }

    let processed = 0;
    let linked = 0;
    let unmatched = 0;
    const failures: Array<{ project_id?: string; error: string }> = [];

    for (const record of records) {
      try {
        const projectId = unwrapScalar(getValue(record, "project id", "projectid", "project id native", "projectidnative", "id") ?? record.projectId).trim();
        if (!projectId) {
          failures.push({ error: "Missing project id" });
          continue;
        }

        const projectName = unwrapScalar(getValue(record, "project name", "name", "projectname") ?? record.projectName ?? record.projectOrClientName).trim();
        const clientName = unwrapScalar(getValue(record, "client name", "contact name", "full name", "fullname") ?? record.clientName ?? record.projectOrClientName).trim();
        const projectPhase = unwrapScalar(getValue(record, "phase name", "phase", "filevine phase") ?? record.phaseName).trim();
        const projectType = unwrapScalar(getValue(record, "project type", "type") ?? record.projectTypeCode).trim();
        const isActive = parseBoolean(getValue(record, "is active", "active"));

        let matchedClient:
          | { id: string; name: string; filevine_project_id: string | null }
          | null = null;
        let matchedCase:
          | { id: string; case_name: string | null; client_id: string | null; filevine_project_id: string | null }
          | null = null;
        let matchType: string | null = null;

        const { data: clientByProject } = await sb
          .from("clients")
          .select("id, name, filevine_project_id")
          .eq("filevine_project_id", projectId)
          .limit(1)
          .maybeSingle();
        if (clientByProject) {
          matchedClient = clientByProject;
          matchType = "project_id_existing";
        }

        const { data: caseByProject } = await sb
          .from("immigration_cases")
          .select("id, case_name, client_id, filevine_project_id")
          .eq("filevine_project_id", projectId)
          .limit(1)
          .maybeSingle();
        if (caseByProject) {
          matchedCase = caseByProject;
          matchType = matchType || "project_id_existing";
        }

        if (!matchedClient && clientName) {
          const { data: clientCandidates } = await sb
            .from("clients")
            .select("id, name, filevine_project_id")
            .ilike("name", clientName)
            .limit(2);
          if (clientCandidates && clientCandidates.length === 1) {
            matchedClient = clientCandidates[0];
            matchType = "client_name_exact";
          }
        }

        if (!matchedCase && clientName) {
          const { data: caseCandidates } = await sb
            .from("immigration_cases")
            .select("id, case_name, client_id, filevine_project_id")
            .ilike("case_name", clientName)
            .limit(2);
          if (caseCandidates && caseCandidates.length === 1) {
            matchedCase = caseCandidates[0];
            matchType = matchType || "case_name_exact";
          }
        }

        if (!matchedClient && !matchedCase && clientName) {
          const normalizedTarget = normalizeName(clientName || projectName);
          if (normalizedTarget) {
            const { data: allClients } = await sb
              .from("clients")
              .select("id, name, filevine_project_id")
              .limit(5000);
            const normalizedMatches = (allClients || []).filter((client) => normalizeName(client.name) === normalizedTarget);
            if (normalizedMatches.length === 1) {
              matchedClient = normalizedMatches[0];
              matchType = "client_name_normalized";
            }
          }
        }

        if (matchedClient && !matchedClient.filevine_project_id) {
          const clientUpdate = await sb
            .from("clients")
            .update({ filevine_project_id: projectId })
            .eq("id", matchedClient.id);
          if (clientUpdate.error) throw clientUpdate.error;
        }

        if (matchedCase && !matchedCase.filevine_project_id) {
          const caseUpdate = await sb
            .from("immigration_cases")
            .update({ filevine_project_id: projectId })
            .eq("id", matchedCase.id);
          if (caseUpdate.error) throw caseUpdate.error;
        }

        if (!matchedCase && matchedClient) {
          const { data: linkedCase } = await sb
            .from("immigration_cases")
            .select("id, case_name, client_id, filevine_project_id")
            .eq("client_id", matchedClient.id)
            .limit(1)
            .maybeSingle();
          if (linkedCase) {
            matchedCase = linkedCase;
            if (!linkedCase.filevine_project_id) {
              const caseUpdate = await sb
                .from("immigration_cases")
                .update({ filevine_project_id: projectId })
                .eq("id", linkedCase.id);
              if (caseUpdate.error) throw caseUpdate.error;
            }
            matchType = matchType || "client_linked_case";
          }
        }

        const snapshotUpsert = await sb
          .from("filevine_project_snapshots")
          .upsert({
            filevine_project_id: projectId,
            project_name: projectName || null,
            client_name: clientName || null,
            project_type: projectType || null,
            project_phase: projectPhase || null,
            is_active: isActive,
            matched_client_id: matchedClient?.id || null,
            matched_case_id: matchedCase?.id || null,
            match_type: matchType,
            sync_source: records === body.records ? "manual" : "api",
            processing_status: matchedClient || matchedCase ? "processed" : "unmatched",
            error_message: matchedClient || matchedCase ? null : "No strong client or case match found",
            raw_payload: record,
          }, { onConflict: "filevine_project_id" });
        if (snapshotUpsert.error) throw snapshotUpsert.error;

        processed += 1;
        if (matchedClient || matchedCase) linked += 1;
        else unmatched += 1;
      } catch (error) {
        failures.push({
          project_id: String(getValue(record, "project id", "projectid", "id") || ""),
          error: (error as Error).message,
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
        sync_key: "projects",
        last_success_at: new Date().toISOString(),
        last_cursor: cursor,
        meta: {
          processed,
          linked,
          unmatched,
          failed: failures.length,
        },
      }),
    });

    return new Response(JSON.stringify({
      success: true,
      processed,
      linked,
      unmatched,
      failed: failures.length,
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
