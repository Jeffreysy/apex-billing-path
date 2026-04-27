import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type JsonRecord = Record<string, unknown>;

const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const parseBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.trim().toLowerCase() === "true";
  return false;
};

const parseNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[$,]/g, "").trim();
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const parseDate = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString().slice(0, 10) : parsed.toISOString().slice(0, 10);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = (await req.json()) as JsonRecord;
    const sb = createClient(supabaseUrl, supabaseKey);

    const normalized = new Map<string, unknown>();
    for (const [key, value] of Object.entries(payload)) {
      normalized.set(normalizeKey(key), value);
    }

    const get = (...keys: string[]) => {
      for (const key of keys) {
        const normalizedKey = normalizeKey(key);
        if (normalized.has(normalizedKey)) {
          const value = normalized.get(normalizedKey);
          if (value !== undefined && value !== null && value !== "") return value;
        }
      }
      return null;
    };

    const paymentId = String(get("payment id", "paymentid", "id") || "").trim();
    const invoiceNumberRaw = String(get("invoice number", "invoices invoice number") || "").trim();
    const invoiceNumber = invoiceNumberRaw.replace(/^#/, "");
    const amount = parseNumber(get("payment total", "payment total amount", "amount", "payment payment applied invoices amount"));
    const paymentDate = parseDate(get("payment date", "date applied", "webhook received at"));
    const description = String(get("description", "payment reference number", "payment source") || "").trim();
    const sourceMethod = String(get("payment source", "method") || "").trim().toLowerCase();
    const createdBy = String(get("created by user name") || "").trim();
    const eventType = String(get("filevine event type") || "").trim().toLowerCase();
    const objectType = String(get("filevine object type") || "").trim().toLowerCase();
    const isVoid = parseBoolean(get("payment is void"));
    const isWriteOff = parseBoolean(get("payment is write off"));
    const projectId = String(get("project id", "payment project id", "invoices project id") || "").trim();
    const projectName = String(get("project name", "payment project name", "invoices project name") || "").trim();
    const invoiceId = String(get("invoices id") || "").trim();

    if (eventType && eventType !== "created") {
      return new Response(JSON.stringify({ skipped: true, reason: "event not handled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (objectType && objectType !== "payment") {
      return new Response(JSON.stringify({ skipped: true, reason: "object type not handled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!paymentId || amount <= 0 || isVoid || isWriteOff) {
      return new Response(JSON.stringify({ skipped: true, reason: "void, write-off, or missing payment data" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const existingPayment = await sb
      .from("payments")
      .select("id")
      .eq("reference_number", paymentId)
      .limit(1)
      .maybeSingle();

    if (existingPayment.data?.id) {
      return new Response(JSON.stringify({ skipped: true, reason: "duplicate payment" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const invoiceCandidates = Array.from(new Set([invoiceNumber, `#${invoiceNumber}`].filter(Boolean)));

    let projectClient:
      | { id: string; filevine_project_id: string | null }
      | null = null;

    let projectCase:
      | { id: string; client_id: string | null; filevine_project_id: string | null }
      | null = null;

    if (projectId) {
      const { data: clientByProject } = await sb
        .from("clients")
        .select("id, filevine_project_id")
        .eq("filevine_project_id", projectId)
        .limit(1)
        .maybeSingle();
      if (clientByProject) {
        projectClient = clientByProject;
      }

      if (!projectClient) {
        const { data: caseByProject } = await sb
          .from("immigration_cases")
          .select("id, client_id, filevine_project_id")
          .eq("filevine_project_id", projectId)
          .limit(1)
          .maybeSingle();
        if (caseByProject) {
          projectCase = caseByProject;
        }
      }
    }

    let invoice:
      | { id: string; client_id: string; matter_id: string; invoice_number: string; total_amount: number; amount_paid: number; balance_due: number | null; status: string }
      | null = null;

    for (const candidate of invoiceCandidates) {
      const { data } = await sb
        .from("invoices")
        .select("id, client_id, matter_id, invoice_number, total_amount, amount_paid, balance_due, status")
        .eq("invoice_number", candidate)
        .limit(1)
        .maybeSingle();
      if (data) {
        invoice = data;
        break;
      }
    }

    let contract:
      | { id: string; client_id: string | null; client: string; value: number; collected: number | null; status: string | null; invoice_number: string | null }
      | null = null;

    for (const candidate of invoiceCandidates) {
      const { data } = await sb
        .from("contracts")
        .select("id, client_id, client, value, collected, status, invoice_number")
        .eq("invoice_number", candidate)
        .limit(1)
        .maybeSingle();
      if (data) {
        contract = data;
        break;
      }
    }

    if (!contract && (projectClient?.id || projectCase?.client_id)) {
      const projectClientId = projectClient?.id || projectCase?.client_id || null;
      const { data } = await sb
        .from("contracts")
        .select("id, client_id, client, value, collected, status, invoice_number")
        .eq("client_id", projectClientId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        contract = data;
      }
    }

    const clientId = invoice?.client_id || contract?.client_id || projectClient?.id || projectCase?.client_id || null;
    if (!clientId) {
      await sb.from("filevine_payment_events").upsert({
        filevine_payment_id: paymentId,
        filevine_project_id: projectId || null,
        filevine_project_name: projectName || null,
        filevine_invoice_id: invoiceId || null,
        filevine_invoice_number: invoiceNumber || null,
        filevine_event_type: eventType || null,
        filevine_object_type: objectType || null,
        payment_date: paymentDate,
        date_applied: typeof get("date applied") === "string" ? String(get("date applied")) : null,
        amount,
        payment_source: sourceMethod || null,
        description: description || null,
        created_by_user_name: createdBy || null,
        sync_source: "webhook",
        processing_status: "unmatched",
        error_message: "No matching invoice or contract",
        raw_payload: payload,
      }, { onConflict: "filevine_payment_id" });

      return new Response(JSON.stringify({
        success: true,
        accepted: true,
        matched: false,
        reason: "no matching invoice or contract; queued for reconciliation",
        payment_id: paymentId,
        invoice_number: invoiceNumber,
        project_id: projectId,
        project_name: projectName,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: clientRecord } = await sb
      .from("clients")
      .select("name")
      .eq("id", clientId)
      .limit(1)
      .maybeSingle();

    const resolvedClientName = clientRecord?.name || contract?.client || projectName || "Unknown Filevine Client";

    const paymentMethod =
      sourceMethod === "cash"
        ? "cash"
        : sourceMethod.includes("check")
          ? "check"
          : sourceMethod.includes("ach") || sourceMethod.includes("wire")
            ? "ach"
            : "credit_card";

    const paymentNumber = `FV-${paymentId}`;
    const noteParts = [
      "Filevine",
      invoiceNumber ? `Invoice ${invoiceNumber}` : null,
      invoiceId ? `InvoiceId ${invoiceId}` : null,
      projectId ? `Project ${projectId}` : null,
      projectName || null,
      description || null,
      createdBy ? `By ${createdBy}` : null,
    ].filter(Boolean);

    const insertedPayment = await sb
      .from("payments")
      .insert({
        client_id: clientId,
        amount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        payment_number: paymentNumber,
        reference_number: paymentId,
        payment_type: "filevine_payment",
        notes: noteParts.join(" | "),
      })
      .select("id")
      .single();

    if (insertedPayment.error) throw insertedPayment.error;

    if (invoice) {
      const nextPaid = Number(invoice.amount_paid || 0) + amount;
      const invoiceTotal = Number(invoice.total_amount || 0);
      const nextBalance = Math.max(0, invoiceTotal - nextPaid);
      const nextStatus = nextBalance <= 0 ? "paid" : nextPaid > 0 ? "partially_paid" : invoice.status;

      const invoiceUpdate = await sb
        .from("invoices")
        .update({
          amount_paid: nextPaid,
          balance_due: nextBalance,
          status: nextStatus,
          paid_at: nextBalance <= 0 ? paymentDate : null,
        })
        .eq("id", invoice.id);
      if (invoiceUpdate.error) throw invoiceUpdate.error;
    }

    if (contract) {
      const nextCollected = Number(contract.collected || 0) + amount;
      const nextBalance = Math.max(0, Number(contract.value || 0) - nextCollected);
      const contractUpdate: Record<string, unknown> = {
        collected: nextCollected,
        last_transaction_date: paymentDate,
        last_transaction_amount: amount,
        last_transaction_source: "filevine",
      };
      if (nextBalance <= 0) {
        contractUpdate.status = "Paid";
        contractUpdate.delinquency_status = "Paid";
        contractUpdate.excel_status = "Paid";
      }
      const contractResult = await sb.from("contracts").update(contractUpdate).eq("id", contract.id);
      if (contractResult.error) throw contractResult.error;
    }

    const activityInsert = await sb.from("collection_activities").insert({
      client_id: clientId,
      contract_id: contract?.id || null,
      client_name: resolvedClientName,
      activity_type: "payment_received",
      outcome: "payment_taken",
      activity_date: paymentDate,
      collected_amount: amount,
      notes: `Filevine: ${noteParts.join(" | ")}`,
      origin: "Filevine Webhook",
      collector: createdBy || "System-Auto",
      transaction_id: paymentId,
    });
    if (activityInsert.error) throw activityInsert.error;

    const ledgerInsert = await sb.from("filevine_payment_events").upsert({
      filevine_payment_id: paymentId,
      filevine_project_id: projectId || null,
      filevine_project_name: projectName || null,
      filevine_invoice_id: invoiceId || null,
      filevine_invoice_number: invoiceNumber || null,
      filevine_event_type: eventType || null,
      filevine_object_type: objectType || null,
      payment_date: paymentDate,
      date_applied: typeof get("date applied") === "string" ? String(get("date applied")) : null,
      amount,
      payment_source: sourceMethod || null,
      description: description || null,
      created_by_user_name: createdBy || null,
      matched_client_id: clientId,
      matched_contract_id: contract?.id || null,
      matched_invoice_id: invoice?.id || null,
      payment_id: insertedPayment.data.id,
      sync_source: "webhook",
      processing_status: "processed",
      raw_payload: payload,
    }, { onConflict: "filevine_payment_id" });
    if (ledgerInsert.error) throw ledgerInsert.error;

    return new Response(JSON.stringify({
      success: true,
      matched: true,
      client_id: clientId,
      contract_id: contract?.id || null,
      invoice_id: invoice?.id || null,
      payment_id: insertedPayment.data.id,
      amount,
      payment_date: paymentDate,
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
