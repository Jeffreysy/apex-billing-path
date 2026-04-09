import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const sb = createClient(supabaseUrl, supabaseKey);

    const [summaryRpc, candidateRpc, eventStats, paymentSyncState, projectSummaryRpc, projectSyncState] = await Promise.all([
      sb.rpc("admin_filevine_case_reconciliation_summary"),
      sb.rpc("admin_filevine_case_reconciliation_candidates", { p_limit: 10 }),
      sb
        .from("filevine_payment_events")
        .select("processing_status, amount, payment_id", { count: "exact" }),
      sb
        .from("filevine_sync_state")
        .select("*")
        .eq("sync_key", "payments")
        .limit(1)
        .maybeSingle(),
      sb.rpc("admin_filevine_project_snapshot_summary"),
      sb
        .from("filevine_sync_state")
        .select("*")
        .eq("sync_key", "projects")
        .limit(1)
        .maybeSingle(),
    ]);

    if (summaryRpc.error) throw summaryRpc.error;
    if (candidateRpc.error) throw candidateRpc.error;
    if (eventStats.error) throw eventStats.error;
    if (paymentSyncState.error) throw paymentSyncState.error;
    if (projectSummaryRpc.error) throw projectSummaryRpc.error;
    if (projectSyncState.error) throw projectSyncState.error;

    const summary = Array.isArray(summaryRpc.data) ? summaryRpc.data[0] || null : summaryRpc.data;
    const candidates = candidateRpc.data || [];
    const events = eventStats.data || [];
    const projectSummary = Array.isArray(projectSummaryRpc.data) ? projectSummaryRpc.data[0] || null : projectSummaryRpc.data;

    const paymentLedger = {
      total_events: events.length,
      matched_events: events.filter((event) => event.processing_status === "processed" && event.payment_id).length,
      unmatched_events: events.filter((event) => event.processing_status !== "processed" || !event.payment_id).length,
      total_amount: events.reduce((sum, event) => sum + Number(event.amount || 0), 0),
    };

    return new Response(JSON.stringify({
      summary,
      top_candidates: candidates,
      payment_ledger: paymentLedger,
      project_summary: projectSummary,
      sync_state: {
        payments: paymentSyncState.data || null,
        projects: projectSyncState.data || null,
      },
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
