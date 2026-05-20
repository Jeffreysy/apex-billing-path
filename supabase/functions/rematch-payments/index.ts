import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * rematch-payments — Periodic re-evaluation of unmatched LawPay transactions.
 *
 * Catches transactions that were missed due to:
 * 1. Timing: invoice/contract data wasn't synced yet when the webhook fired
 * 2. Silent query failures during high-throughput bursts (now fixed in v34)
 * 3. Backfilled contract links on mycase_invoices
 *
 * Designed to run as a cron (pg_cron or external scheduler).
 * Only promotes transactions where the invoice→contract path is fully resolved.
 * Does NOT auto-credit payments — sets matched_to_payment = false with
 * match_confidence = 'mycase_invoice_contract' for the live webhook to
 * handle on next occurrence, or for batch crediting.
 *
 * Invoke: POST /functions/v1/rematch-payments
 * Optional body: { "dry_run": true } to preview without writing.
 */

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body?.dry_run === true;
    const sb = createClient(supabaseUrl, supabaseKey);

    // ── PASS A: Re-match via mycase_invoices (invoice ID → contract) ──
    // Find lawpay_transactions that:
    //   - Are COMPLETED but not matched to a payment
    //   - Have an invoice reference in the description
    //   - The referenced invoice now exists in mycase_invoices WITH a contract link
    const { data: invoiceRematches, error: passAErr } = await sb.rpc("rematch_invoice_payments", {
      p_dry_run: dryRun,
    });

    if (passAErr) {
      console.error("Pass A (invoice rematch) failed:", passAErr.message);
      // Fall through — try Pass B even if A fails
    }

    // ── PASS B: Re-match stuck mycase_invoice → mycase_invoice_contract ──
    // Transactions already tagged as mycase_invoice that now have a contract link
    const { data: upgradeRematches, error: passBErr } = await sb.rpc("rematch_upgrade_mycase_invoice", {
      p_dry_run: dryRun,
    });

    if (passBErr) {
      console.error("Pass B (upgrade mycase_invoice) failed:", passBErr.message);
    }

    const passACount = invoiceRematches?.[0]?.rematched_count ?? 0;
    const passBCount = upgradeRematches?.[0]?.upgraded_count ?? 0;
    const totalRematched = passACount + passBCount;

    // Log to audit_log
    if (!dryRun && totalRematched > 0) {
      await sb.from("audit_log").insert({
        action: "rematch_payments_batch",
        details: {
          pass_a_invoice_rematches: passACount,
          pass_b_upgrade_rematches: passBCount,
          total: totalRematched,
          timestamp: new Date().toISOString(),
        },
        performed_by: "system-rematcher",
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        dry_run: dryRun,
        pass_a_invoice_rematches: passACount,
        pass_b_upgrade_rematches: passBCount,
        total_rematched: totalRematched,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
