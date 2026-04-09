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
    const payload = await req.json();
    const sb = createClient(supabaseUrl, supabaseKey);

    // Normalize field access — supports both flat Zapier payloads and nested LawPay webhook payloads
    const get = (...keys: string[]) => {
      for (const k of keys) if (payload[k] !== undefined && payload[k] !== null && payload[k] !== "") return payload[k];
      return null;
    };

    // LawPay webhooks nest the charge data under payload.data
    const chargeData = payload?.data || {};
    const methodData = chargeData?.method || {};

    const eventType = get("event_type", "Event_Type", "eventType") || payload?.type || "";
    // Amount: try flat Zapier fields first, then nested LawPay payload.data.amount (in cents)
    const amountCents = Number(get("amount_in_cents", "Amount_in_Cents", "amountInCents"))
      || Number(chargeData?.amount)
      || 0;
    const amount = amountCents / 100;
    const reference = get("data_reference", "Data_Reference", "reference") || chargeData?.reference || "";
    const clientName = get("method_name", "Name", "name") || methodData?.name || "";
    const transactionId = get("transaction_id", "Transaction_ID", "transactionId") || chargeData?.id || payload?.id || "";
    const txStatus = get("status", "Status") || chargeData?.status || "";
    const cardType = get("card_type", "Card_Type", "cardType") || methodData?.card_type || "";
    const cardLast4 = (get("card_number", "Card_Number", "cardNumber") || methodData?.number || "").slice(-4);
    const txDate = get("transaction_created_date", "Transaction_Created_Date") || chargeData?.created || new Date().toISOString();
    const lawpayCustomerId = get("data_client_id", "Data_Client_Id") || chargeData?.client_id || null;
    const chargeId = get("data_id", "charge_id") || chargeData?.id || null;

    // Only process authorized/completed charges
    const validEvents = ["transaction.authorized", "transaction.completed"];
    if (!validEvents.includes(eventType) && txStatus !== "AUTHORIZED") {
      return new Response(JSON.stringify({ skipped: true, reason: "not a completed transaction" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduplicate: skip if this transaction_id already processed
    const { data: existing } = await sb
      .from("lawpay_transactions")
      .select("id")
      .eq("lawpay_transaction_id", transactionId)
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ skipped: true, reason: "duplicate transaction" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract invoice number from reference (e.g., "Payment for Invoice #2110000000000245398")
    const invoiceMatch = reference.match(/#(\S+)/);
    const invoiceNumber = invoiceMatch ? `#${invoiceMatch[1]}` : null;

    // Find matching contract
    let contract: { id: string; client: string; value: number; collected: number; status: string; client_id: string | null } | null = null;

    // Pass 1: Match by invoice_number
    if (invoiceNumber) {
      const { data } = await sb
        .from("contracts")
        .select("id, client, value, collected, status, client_id")
        .eq("invoice_number", invoiceNumber)
        .in("status", ["Active", "Risk"])
        .limit(1)
        .single();
      if (data) contract = data;
    }

    // Pass 2: Fallback — match by case_number
    if (!contract && invoiceNumber) {
      const { data } = await sb
        .from("contracts")
        .select("id, client, value, collected, status, client_id")
        .eq("case_number", invoiceNumber)
        .in("status", ["Active", "Risk"])
        .limit(1)
        .single();
      if (data) contract = data;
    }

    // Pass 3: Fallback — fuzzy match by client name (first two words)
    if (!contract && clientName) {
      const nameParts = clientName.trim().split(/\s+/).slice(0, 2);
      if (nameParts.length >= 2) {
        const { data } = await sb
          .from("contracts")
          .select("id, client, value, collected, status, client_id")
          .ilike("client", `%${nameParts[0]}%${nameParts[1]}%`)
          .in("status", ["Active", "Risk"])
          .order("value", { ascending: false })
          .limit(1)
          .single();
        if (data) contract = data;
      }
    }

    const matchConfidence = contract
      ? (invoiceNumber ? "invoice_match" : "name_fuzzy")
      : "unmatched";

    // Log to lawpay_transactions (audit trail)
    await sb.from("lawpay_transactions").insert({
      lawpay_transaction_id: transactionId,
      lawpay_charge_id: chargeId,
      client_id: contract?.client_id || null,
      contract_id: contract?.id || null,
      amount,
      currency: "USD",
      status: txStatus,
      payment_method: "card",
      card_last_four: cardLast4,
      card_brand: cardType,
      payment_date: txDate.split("T")[0],
      lawpay_customer_id: lawpayCustomerId,
      description: reference,
      matched_to_payment: !!contract,
      match_confidence: matchConfidence,
      raw_payload: payload,
      processed_at: new Date().toISOString(),
    });

    if (!contract) {
      // Log unmatched for manual review
      await sb.from("unmatched_payments").insert({
        name_in_notes: clientName,
        amount,
        payment_date: txDate.split("T")[0],
        reference_number: transactionId,
        status: "unmatched",
        notes: reference,
      });

      return new Response(JSON.stringify({
        success: true, matched: false,
        reason: "no matching contract",
        invoice_number: invoiceNumber,
        client_name: clientName,
        amount,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Update contract: increment collected
    const newCollected = (contract.collected || 0) + amount;
    const newBalance = (contract.value || 0) - newCollected;
    const isPaidOff = newBalance <= 0;

    const updateData: Record<string, unknown> = { collected: newCollected };
    if (isPaidOff) {
      updateData.status = "Paid";
      updateData.delinquency_status = "Paid";
      updateData.excel_status = "Paid";
    }

    await sb.from("contracts").update(updateData).eq("id", contract.id);

    // Log to payments table
    await sb.from("payments").insert({
      client_id: contract.client_id,
      amount,
      payment_date: txDate.split("T")[0],
      payment_method: "credit_card",
      reference_number: transactionId,
      notes: `LawPay: ${reference} | ${clientName}`,
      payment_type: "lawpay_auto",
    });

    // Log collection activity
    await sb.from("collection_activities").insert({
      client_id: contract.client_id,
      contract_id: contract.id,
      activity_type: "payment_received",
      notes: `LawPay $${amount.toFixed(2)} - ${cardType} *${cardLast4} - ${reference}`,
      outcome: isPaidOff ? "paid_in_full" : "partial_payment",
    });

    return new Response(JSON.stringify({
      success: true, matched: true,
      contract_id: contract.id,
      client: contract.client,
      amount,
      new_collected: newCollected,
      remaining: newBalance,
      status: isPaidOff ? "Paid" : contract.status,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
