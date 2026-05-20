import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ContractRow = {
  id: string;
  client: string;
  value: number | null;
  collected: number | null;
  status: string | null;
  client_id: string | null;
};

type MyCaseInvoiceRow = {
  id: string;
  invoice_number: string | null;
  mycase_internal_id: string | null;
  description: string | null;
  status: string | null;
  amount_due: number | null;
  matched_client_id: string | null;
  matched_contract_id: string | null;
};

type MatchConfidence =
  | "invoice_number"
  | "mycase_invoice"
  | "mycase_invoice_contract"
  | "case_number"
  | "name_trgm"
  | "name_trgm_paid"
  | "unmatched";

function normalizeName(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .toUpperCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+\d{2}-\d{3,5}\s*$/g, "")
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickFirst<T>(...values: T[]): T | null {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return null;
}

function normalizeStatus(value: unknown): string {
  return String(value || "").trim().toUpperCase();
}

function invoiceDigits(value: string | null | undefined): string | null {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = await req.json();
    const sb = createClient(supabaseUrl, supabaseKey);

    // Normalize field access — supports flat Zapier payloads and nested LawPay webhook payloads
    const get = (...keys: string[]) => {
      for (const k of keys) {
        if (payload[k] !== undefined && payload[k] !== null && payload[k] !== "") return payload[k];
      }
      return null;
    };

    const chargeData = payload?.data || {};
    const methodData = chargeData?.method || {};

    const eventType =
      get("event_type", "Event_Type", "eventType") || payload?.type || "";

    const amountCents =
      [
        get("amount_in_cents", "Amount_in_Cents", "amountInCents"),
        chargeData?.amount,
        chargeData?.data?.amount,
        payload?.amount,
      ]
        .map((value) => Number(value))
        .find((value) => Number.isFinite(value) && value > 0) || 0;
    const amount = amountCents / 100;

    const reference =
      (get("data_reference", "Data_Reference", "reference") as string | null) ||
      chargeData?.reference ||
      "";
    const cardholderName =
      (get("method_name", "Name", "name") as string | null) || methodData?.name || "";
    const transactionId =
      get("transaction_id", "Transaction_ID", "transactionId") || chargeData?.id || payload?.id || "";
    const txStatus = get("status", "Status") || chargeData?.status || "";
    const cardType = get("card_type", "Card_Type", "cardType") || methodData?.card_type || "";
    const cardLast4 = (
      (get("card_number", "Card_Number", "cardNumber") as string | null) ||
      methodData?.number ||
      ""
    ).slice(-4);
    const txDate =
      get("transaction_created_date", "Transaction_Created_Date") ||
      chargeData?.created ||
      new Date().toISOString();
    const lawpayCustomerId =
      get("data_client_id", "Data_Client_Id") || chargeData?.client_id || null;
    const lawpayPayerName =
      (get("method_name", "Name", "name") as string | null) || methodData?.name || null;
    const lawpayPayerEmail =
      (get("method_email", "Email", "email") as string | null) || methodData?.email || null;
    const lawpayCardFingerprint =
      (get("method_fingerprint", "Fingerprint", "fingerprint") as string | null) ||
      methodData?.fingerprint ||
      null;
    const lawpayPaymentPageId =
      payload?.data?.data?.payment_page_id || chargeData?.data?.payment_page_id || null;
    const chargeId = get("data_id", "charge_id") || chargeData?.id || null;

    // Only book settled/completed charges. Authorization is not cash received yet.
    const normalizedEventType = String(eventType || "").trim().toLowerCase();
    const normalizedStatus = normalizeStatus(txStatus);
    const settledEvents = new Set(["transaction.completed", "transaction.captured", "charge.succeeded"]);
    const settledStatuses = new Set(["COMPLETED", "CAPTURED", "SUCCEEDED", "SETTLED"]);
    if (!settledEvents.has(normalizedEventType) && !settledStatuses.has(normalizedStatus)) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "transaction not settled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (amount <= 0) {
      return new Response(
        JSON.stringify({
          error: "LawPay transaction amount was missing or zero.",
          transaction_id: transactionId,
          event_type: eventType,
          status: txStatus,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Deduplicate
    const { data: existing, error: dedupErr } = await sb
      .from("lawpay_transactions")
      .select("id")
      .eq("lawpay_transaction_id", transactionId)
      .limit(1);
    if (dedupErr) console.error("Dedup query failed:", dedupErr.message);

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "duplicate transaction" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── MATCHER ──
    // Extract invoice number from reference (e.g. "Payment for Invoice #2110000000000245398")
    const invoiceMatch = (reference || "").match(/#(\S+)/);
    const invoiceNumber = invoiceMatch ? `#${invoiceMatch[1]}` : null;
    const invoiceNumberDigits = invoiceDigits(invoiceNumber);

    let contract: ContractRow | null = null;
    let mycaseInvoice: MyCaseInvoiceRow | null = null;
    let matchConfidence: MatchConfidence = "unmatched";
    let matchReason = "";
    let candidateClientId: string | null = null;
    let candidateContractId: string | null = null;

    // Pass 1: invoice_number (NO status filter — recover Paid/Overdue/Defaulted)
    if (invoiceNumber) {
      const { data, error: p1Err } = await sb
        .from("contracts")
        .select("id, client, value, collected, status, client_id")
        .eq("invoice_number", invoiceNumber)
        .order("created_at", { ascending: false })
        .limit(1);
      if (p1Err) console.error("Pass 1 (invoice_number) query failed:", p1Err.message);
      if (data && data.length > 0) {
        contract = data[0] as ContractRow;
        candidateClientId = contract.client_id;
        candidateContractId = contract.id;
        matchConfidence = "invoice_number";
        matchReason = `invoice=${invoiceNumber}`;
      }
    }

    // Pass 2: MyCase invoice number / internal ID from the refreshed MyCase AR export.
    // Only auto-post when this path can safely resolve to a contract. Otherwise,
    // keep it in review as a valid MyCase invoice that needs client/contract linking.
    if (!contract && invoiceNumberDigits) {
      const orFilters = [
        `mycase_internal_id.eq.${invoiceNumberDigits}`,
        `invoice_number.eq.${invoiceNumberDigits}`,
      ];
      if (invoiceNumber) orFilters.push(`invoice_number.eq.${invoiceNumber}`);
      const { data, error: p2Err } = await sb
        .from("mycase_invoices")
        .select("id, invoice_number, mycase_internal_id, description, status, amount_due, matched_client_id, matched_contract_id")
        .or(orFilters.join(","))
        .order("synced_at", { ascending: false })
        .limit(1);
      if (p2Err) console.error("Pass 2 (mycase_invoices) query failed:", p2Err.message);

      if (data && data.length > 0) {
        mycaseInvoice = data[0] as MyCaseInvoiceRow;
        candidateClientId = mycaseInvoice.matched_client_id;
        candidateContractId = mycaseInvoice.matched_contract_id;
        matchConfidence = "mycase_invoice";
        matchReason = `mycase_invoice=${invoiceNumberDigits} status=${mycaseInvoice.status || "unknown"}`;

        if (mycaseInvoice.matched_contract_id) {
          const { data: contractByMyCase, error: p2cErr } = await sb
            .from("contracts")
            .select("id, client, value, collected, status, client_id")
            .eq("id", mycaseInvoice.matched_contract_id)
            .limit(1);
          if (p2cErr) console.error("Pass 2 (contract by mycase) query failed:", p2cErr.message);

          if (contractByMyCase && contractByMyCase.length > 0) {
            contract = contractByMyCase[0] as ContractRow;
            candidateClientId = contract.client_id;
            candidateContractId = contract.id;
            matchConfidence = "mycase_invoice_contract";
            matchReason = `mycase_invoice=${invoiceNumberDigits} contract=${contract.id}`;
          }
        }

        if (!contract && mycaseInvoice.matched_client_id) {
          const { data: contractByClient, error: p2clErr } = await sb
            .from("contracts")
            .select("id, client, value, collected, status, client_id")
            .eq("client_id", mycaseInvoice.matched_client_id)
            .not("status", "eq", "Paid")
            .order("created_at", { ascending: false })
            .limit(1);
          if (p2clErr) console.error("Pass 2 (contract by client) query failed:", p2clErr.message);

          if (contractByClient && contractByClient.length > 0) {
            contract = contractByClient[0] as ContractRow;
            candidateClientId = contract.client_id;
            candidateContractId = contract.id;
            matchConfidence = "mycase_invoice_contract";
            matchReason = `mycase_invoice=${invoiceNumberDigits} client=${mycaseInvoice.matched_client_id} contract=${contract.id}`;
          }
        }
      }
    }

    // Pass 3: case_number
    if (!contract && invoiceNumber) {
      const stripped = invoiceNumber.replace(/^#/, "");
      const { data, error: p3Err } = await sb
        .from("contracts")
        .select("id, client, value, collected, status, client_id")
        .or(`case_number.eq.${invoiceNumber},case_number.eq.${stripped}`)
        .order("created_at", { ascending: false })
        .limit(1);
      if (p3Err) console.error("Pass 3 (case_number) query failed:", p3Err.message);
      if (data && data.length > 0) {
        contract = data[0] as ContractRow;
        candidateClientId = contract.client_id;
        candidateContractId = contract.id;
        matchConfidence = "case_number";
        matchReason = `case=${invoiceNumber}`;
      }
    }

    // Pass 4: card fingerprint — if this card previously paid a matched transaction,
    // resolve to the same client (review-only, not auto-credit)
    if (!contract && lawpayCardFingerprint) {
      try {
        const { data: fpData, error: fpErr } = await sb
          .from("lawpay_transactions")
          .select("client_id, contract_id")
          .eq("lawpay_card_fingerprint", lawpayCardFingerprint)
          .eq("matched_to_payment", true)
          .not("contract_id", "is", null)
          .order("payment_date", { ascending: false })
          .limit(1);
        if (fpErr) console.error("Pass 4 (card_fingerprint) query failed:", fpErr.message);
        if (fpData && fpData.length > 0) {
          candidateClientId = fpData[0].client_id;
          candidateContractId = fpData[0].contract_id;
          matchReason = `card_fingerprint=${lawpayCardFingerprint}`;
          // Don't set contract — this is a candidate only, not an exact match.
          // The payer might be a family member paying for a different client.
        }
      } catch (fpErr) {
        console.error("Pass 4 (card_fingerprint) threw:", fpErr);
      }
    }

    // Pass 5: normalized trigram name match via RPC — active contracts only
    if (!contract) {
      const searchName = normalizeName(reference) || normalizeName(cardholderName);
      if (searchName && searchName.length >= 6) {
        try {
          const { data, error: rpcErr } = await sb.rpc("match_contract_by_normalized_name", {
            p_name: searchName,
            p_amount: amount,
            p_active_only: true,
          });
          if (rpcErr) console.error("Pass 5 (name_trgm active) failed:", rpcErr.message);
          if (data && Array.isArray(data) && data.length > 0) {
            const row = data[0];
            candidateClientId = row.client_id;
            candidateContractId = row.id;
            contract = {
              id: row.id,
              client: row.client,
              value: row.value,
              collected: row.collected,
              status: row.status,
              client_id: row.client_id,
            };
            matchConfidence = "name_trgm";
            matchReason = `name=${searchName} sim=${row.similarity}`;
          }
        } catch (rpcErr) {
          console.error("Pass 5 (name_trgm active) threw:", rpcErr);
        }
      }
    }

    // Pass 6: trigram name match — include Paid/Overdue contracts
    if (!contract) {
      const searchName = normalizeName(reference) || normalizeName(cardholderName);
      if (searchName && searchName.length >= 6) {
        try {
          const { data, error: rpcErr } = await sb.rpc("match_contract_by_normalized_name", {
            p_name: searchName,
            p_amount: amount,
            p_active_only: false,
          });
          if (rpcErr) console.error("Pass 6 (name_trgm all) failed:", rpcErr.message);
          if (data && Array.isArray(data) && data.length > 0) {
            const row = data[0];
            candidateClientId = row.client_id;
            candidateContractId = row.id;
            contract = {
              id: row.id,
              client: row.client,
              value: row.value,
              collected: row.collected,
              status: row.status,
              client_id: row.client_id,
            };
            matchConfidence = "name_trgm_paid";
            matchReason = `name=${searchName} sim=${row.similarity} (paid)`;
          }
        } catch (rpcErr) {
          console.error("Pass 6 (name_trgm all) threw:", rpcErr);
        }
      }
    }

    // Log to lawpay_transactions (audit trail) — always, matched or not
    const exactMatch =
      matchConfidence === "invoice_number" ||
      matchConfidence === "mycase_invoice_contract" ||
      matchConfidence === "case_number";
    const reviewOnlyMatch = !exactMatch && !!candidateContractId;

    const { error: lawpayInsertError } = await sb.from("lawpay_transactions").insert({
      lawpay_transaction_id: transactionId,
      lawpay_charge_id: chargeId,
      client_id: exactMatch ? contract?.client_id || null : candidateClientId,
      contract_id: exactMatch ? contract?.id || null : candidateContractId,
      amount,
      currency: "USD",
      status: txStatus,
      payment_method: "card",
      card_last_four: cardLast4,
      card_brand: cardType,
      payment_date: txDate.split("T")[0],
      lawpay_customer_id: lawpayCustomerId,
      lawpay_payer_name: lawpayPayerName,
      lawpay_payer_email: lawpayPayerEmail,
      lawpay_card_fingerprint: lawpayCardFingerprint,
      lawpay_payment_page_id: lawpayPaymentPageId,
      description: reference,
      matched_to_payment: exactMatch,
      match_confidence: matchConfidence,
      match_reason: matchReason,
      raw_payload: payload,
      processed_at: new Date().toISOString(),
    });
    if (lawpayInsertError) throw lawpayInsertError;

    if (!exactMatch) {
      const { error: unmatchedInsertError } = await sb.from("unmatched_payments").insert({
        name_in_notes: pickFirst(mycaseInvoice?.description, reference, cardholderName) || "",
        amount,
        payment_date: txDate.split("T")[0],
        matched_client_id: candidateClientId,
        payment_number: transactionId ? `LP-${transactionId}` : null,
        reference_number: transactionId,
        status: reviewOnlyMatch || mycaseInvoice ? "pending_review" : "unmatched",
        notes: mycaseInvoice
          ? `Valid MyCase invoice ${invoiceNumber}; ${reference}; invoice_status=${mycaseInvoice.status || "unknown"}; invoice_balance=${mycaseInvoice.amount_due ?? ""}`
          : reference,
      });
      if (unmatchedInsertError) throw unmatchedInsertError;

      return new Response(
        JSON.stringify({
          success: true,
          matched: false,
          reason: mycaseInvoice
            ? "valid MyCase invoice; client/contract link required"
            : reviewOnlyMatch
              ? "candidate match requires review"
              : "no matching contract",
          invoice_number: invoiceNumber,
          mycase_invoice_id: mycaseInvoice?.id || null,
          mycase_invoice_status: mycaseInvoice?.status || null,
          client_name: reference || cardholderName,
          amount,
          candidate_client_id: candidateClientId,
          candidate_contract_id: candidateContractId,
          match_confidence: matchConfidence,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Insert payment with contract_id — trigger sync_contract_collected handles collected totals
    const paymentInsert = await sb.from("payments").insert({
      payment_number: `LP-${transactionId}`,
      client_id: contract.client_id,
      contract_id: contract.id,
      amount,
      payment_date: txDate.split("T")[0],
      payment_method: "credit_card",
      reference_number: transactionId,
      notes: `LawPay: ${reference} | ${cardholderName}`,
      payment_type: "lawpay_auto",
      collector_name: "System-Auto",
    });
    if (paymentInsert.error) throw paymentInsert.error;

    // Update contract metadata + check paid-off status (collected is maintained by trigger)
    const { data: refreshedContract } = await sb
      .from("contracts")
      .select("collected, value")
      .eq("id", contract.id)
      .single();

    const newCollected = refreshedContract?.collected ?? (contract.collected || 0) + amount;
    const newBalance = (contract.value || 0) - newCollected;
    const isPaidOff = newBalance <= 0;

    const updateData: Record<string, unknown> = {
      last_transaction_date: txDate.split("T")[0],
      last_transaction_amount: amount,
      last_transaction_source: "lawpay",
    };
    if (isPaidOff) {
      updateData.status = "Paid";
      updateData.delinquency_status = "Paid";
      updateData.excel_status = "Paid";
    }

    const contractUpdate = await sb.from("contracts").update(updateData).eq("id", contract.id);
    if (contractUpdate.error) throw contractUpdate.error;

    // Log collection activity
    const activityInsert = await sb.from("collection_activities").insert({
      client_id: contract.client_id,
      contract_id: contract.id,
      client_name: contract.client,
      collector: "System-Auto",
      activity_date: txDate.split("T")[0],
      activity_type: "payment_received",
      notes: `LawPay $${amount.toFixed(2)} - ${cardType} *${cardLast4} - ${reference}`,
      outcome: isPaidOff ? "paid_in_full" : "payment_taken",
      collected_amount: amount,
      transaction_id: transactionId,
      origin: "LawPay Webhook",
    });
    if (activityInsert.error) throw activityInsert.error;

    // Refresh the materialized view so the Transactions tab reflects this payment.
    // Non-blocking: failure is logged to audit_log so admins can see it.
    sb.rpc("refresh_payments_clean_mv").then((res) => {
      if (res.error) {
        console.error("refresh_payments_clean_mv error", res.error);
        sb.from("audit_log").insert({
          action: "mv_refresh_failed",
          details: { view: "payments_clean", error: res.error.message, transaction_id: transactionId },
          performed_by: "system",
        }).then(() => {});
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        matched: true,
        match_confidence: matchConfidence,
        contract_id: contract.id,
        client: contract.client,
        amount,
        new_collected: newCollected,
        remaining: newBalance,
        status: isPaidOff ? "Paid" : contract.status,
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
