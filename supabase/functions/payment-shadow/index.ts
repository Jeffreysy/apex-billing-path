import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const internalToken = Deno.env.get("PAYMENT_SHADOW_INTERNAL_TOKEN");
const ruleVersion = "repeat-email-two-signal-v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-shadow-internal-token",
};

type JsonObject = Record<string, unknown>;
type LawPayRow = {
  id: string;
  lawpay_transaction_id: string | null;
  lawpay_payer_email: string | null;
  lawpay_payer_name: string | null;
  lawpay_card_fingerprint: string | null;
  card_last_four: string | null;
  description: string | null;
  payment_date: string | null;
  contract_id: string | null;
  client_id: string | null;
  raw_payload: unknown;
};

function respond(body: JsonObject, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return normalized.includes("@") ? normalized : null;
}

function normalizeName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
  return normalized || null;
}

function escapePostgrestLike(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function payloadString(payload: unknown, key: string): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const record = payload as JsonObject;
  const direct = record[key];
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  for (const value of Object.values(record)) {
    const nested = payloadString(value, key);
    if (nested) return nested;
  }
  return null;
}

function signalValues(row: LawPayRow): Record<string, string | null> {
  const email = normalizeEmail(row.lawpay_payer_email);
  const name = normalizeName(row.lawpay_payer_name);
  const last4 = row.card_last_four?.trim() || null;
  return {
    reference: payloadString(row.raw_payload, "reference")?.toLowerCase() ?? null,
    description: row.description?.trim().toLowerCase() || null,
    card_fingerprint: row.lawpay_card_fingerprint?.trim() || null,
    name_last4: name && last4 ? `${name}|${last4}` : null,
    email_last4: email && last4 ? `${email}|${last4}` : null,
  };
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function authorize(request: Request): Promise<{ actorId: string | null } | Response> {
  const presentedInternalToken = request.headers.get("x-shadow-internal-token");
  if (internalToken && presentedInternalToken === internalToken) return { actorId: null };

  const authorization = request.headers.get("Authorization");
  if (!authorization) return respond({ error: "Missing authorization header" }, 401);
  if (authorization === `Bearer ${serviceRoleKey}`) return { actorId: null };

  const client = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return respond({ error: "Unauthorized" }, 401);
  const { data: role, error: roleError } = await client.rpc("current_user_role");
  if (roleError || !["admin", "partner", "billing_clerk"].includes(role ?? "")) {
    return respond({ error: "Finance staff access required" }, 403);
  }
  return { actorId: user.id };
}

async function predictOne(admin: ReturnType<typeof createClient>, row: LawPayRow, actorId: string | null) {
  if (row.contract_id) return { outcome: "already_linked" };
  const email = normalizeEmail(row.lawpay_payer_email);
  if (!email || !row.payment_date) return { outcome: "insufficient_identity" };

  const { data: prior, error: priorError } = await admin.from("lawpay_transactions")
    .select("id, lawpay_transaction_id, lawpay_payer_email, lawpay_payer_name, lawpay_card_fingerprint, card_last_four, description, payment_date, contract_id, client_id, raw_payload")
    .eq("status", "COMPLETED")
    .ilike("lawpay_payer_email", escapePostgrestLike(email))
    .not("contract_id", "is", null)
    .lt("payment_date", row.payment_date)
    .limit(1000);
  if (priorError) throw priorError;
  if (!prior?.length) return { outcome: "no_prior_payment_history" };

  const contractIds = [...new Set(prior.map((item) => item.contract_id).filter(Boolean))] as string[];
  if (contractIds.length !== 1) return { outcome: "historical_email_conflict", contract_count: contractIds.length };
  const proposedContractId = contractIds[0];

  const { data: contract, error: contractError } = await admin.from("contracts")
    .select("id, client_id").eq("id", proposedContractId).single();
  if (contractError) throw contractError;
  if (!contract.client_id) return { outcome: "contract_has_no_client" };

  const currentSignals = signalValues(row);
  const agreeingSignals: string[] = [];
  for (const [signal, currentValue] of Object.entries(currentSignals)) {
    if (!currentValue) continue;
    const matchingContracts = new Set(
      (prior as LawPayRow[])
        .filter((item) => signalValues(item)[signal] === currentValue)
        .map((item) => item.contract_id)
        .filter(Boolean) as string[],
    );
    if (matchingContracts.size === 1 && matchingContracts.has(proposedContractId)) agreeingSignals.push(signal);
  }
  if (!agreeingSignals.length) return { outcome: "email_only_manual_review", proposed_contract_id: proposedContractId };

  const evidenceHashes: Record<string, string> = { payer_email: await sha256(email) };
  for (const signal of agreeingSignals) evidenceHashes[signal] = await sha256(currentSignals[signal]!);
  const evidence = {
    rule_version: ruleVersion,
    evaluated_at: new Date().toISOString(),
    strictly_prior_payment_count: prior.length,
    prior_contract_count: contractIds.length,
    hashed_keys: evidenceHashes,
    raw_identity_stored: false,
    financial_mutation_performed: false,
  };

  const { data: prediction, error: insertError } = await admin.from("payment_shadow_predictions")
    .upsert({
      lawpay_transaction_id: row.id,
      rule_version: ruleVersion,
      status: "awaiting_mycase_validation",
      proposed_client_id: contract.client_id,
      proposed_contract_id: proposedContractId,
      confidence_tier: "shadow_high_confidence",
      matched_signals: ["payer_email", ...agreeingSignals].sort(),
      evidence,
      prediction_created_by: actorId,
    }, { onConflict: "lawpay_transaction_id,rule_version", ignoreDuplicates: true })
    .select("id, status").maybeSingle();
  if (insertError) throw insertError;
  if (!prediction) return { outcome: "already_predicted" };

  const { error: eventError } = await admin.from("payment_shadow_events").insert({
    prediction_id: prediction.id,
    event_type: "prediction_created",
    event_data: { rule_version: ruleVersion, matched_signals: ["payer_email", ...agreeingSignals].sort() },
    actor_id: actorId,
  });
  if (eventError) throw eventError;
  return { outcome: "shadow_prediction_created", prediction_id: prediction.id };
}

async function runPrediction(admin: ReturnType<typeof createClient>, body: JsonObject, actorId: string | null) {
  const limit = Math.min(Math.max(Number(body.limit ?? 50), 1), 200);
  let query = admin.from("lawpay_transactions")
    .select("id, lawpay_transaction_id, lawpay_payer_email, lawpay_payer_name, lawpay_card_fingerprint, card_last_four, description, payment_date, contract_id, client_id, raw_payload")
    .eq("status", "COMPLETED").is("contract_id", null).order("payment_date").limit(limit);
  if (typeof body.lawpay_row_id === "string") query = query.eq("id", body.lawpay_row_id);
  const { data, error } = await query;
  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as LawPayRow[]) {
    const result = await predictOne(admin, row, actorId);
    counts[result.outcome] = (counts[result.outcome] ?? 0) + 1;
  }
  return { examined: data?.length ?? 0, outcomes: counts, mutation_performed: false };
}

async function runReconciliation(admin: ReturnType<typeof createClient>, body: JsonObject, actorId: string | null) {
  const limit = Math.min(Math.max(Number(body.limit ?? 200), 1), 500);
  const { data: predictions, error } = await admin.from("payment_shadow_predictions")
    .select("id, lawpay_transaction_id, proposed_client_id, proposed_contract_id, status, reconciliation_attempt_count")
    .in("status", ["awaiting_mycase_validation", "still_unresolved"])
    .order("predicted_at").limit(limit);
  if (error) throw error;

  const counts = { confirmed: 0, disagreed: 0, still_unresolved: 0 };
  for (const prediction of predictions ?? []) {
    const { data: lawpay, error: lawpayError } = await admin.from("lawpay_transactions")
      .select("contract_id, client_id, processed_at, match_confidence, match_reason")
      .eq("id", prediction.lawpay_transaction_id).single();
    if (lawpayError) throw lawpayError;

    let outcome: "confirmed" | "disagreed" | "still_unresolved" = "still_unresolved";
    if (lawpay.contract_id) {
      outcome = lawpay.contract_id === prediction.proposed_contract_id &&
          (!lawpay.client_id || lawpay.client_id === prediction.proposed_client_id)
        ? "confirmed"
        : "disagreed";
    }
    const now = new Date().toISOString();
    const details = {
      checked_at: now,
      match_confidence: lawpay.match_confidence,
      mycase_link_present: !!lawpay.contract_id,
      financial_mutation_performed: false,
    };
    const { error: updateError } = await admin.from("payment_shadow_predictions").update({
      status: outcome === "still_unresolved" ? "still_unresolved" : outcome,
      reconciliation_status: outcome,
      reconciliation_details: details,
      reconciliation_attempt_count: prediction.reconciliation_attempt_count + 1,
      last_reconciliation_at: now,
      reconciled_at: outcome === "still_unresolved" ? null : now,
      mycase_client_id: lawpay.client_id,
      mycase_contract_id: lawpay.contract_id,
    }).eq("id", prediction.id);
    if (updateError) throw updateError;

    const { error: eventError } = await admin.from("payment_shadow_events").insert({
      prediction_id: prediction.id,
      event_type: outcome === "still_unresolved" ? "mycase_unresolved" : `mycase_${outcome}`,
      event_data: details,
      actor_id: actorId,
    });
    if (eventError) throw eventError;
    counts[outcome]++;
  }
  return { examined: predictions?.length ?? 0, outcomes: counts, mutation_performed: false };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return respond({ error: "Method not allowed" }, 405);
  try {
    const authorized = await authorize(request);
    if (authorized instanceof Response) return authorized;
    const body = await request.json() as JsonObject;
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const action = body.action ?? "predict";
    const result = action === "predict"
      ? await runPrediction(admin, body, authorized.actorId)
      : action === "reconcile"
        ? await runReconciliation(admin, body, authorized.actorId)
        : null;
    return result ? respond(result) : respond({ error: "action must be predict or reconcile" }, 400);
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : String(error) }, 400);
  }
});
