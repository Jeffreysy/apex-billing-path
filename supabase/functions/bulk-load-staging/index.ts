import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  if (req.method === "GET") {
    const sb = createClient(supabaseUrl, serviceRoleKey);
    const { count } = await sb.from("lawpay_export_staging").select("*", { count: "exact", head: true });
    return new Response(JSON.stringify({ rows_loaded: count }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: cors });
  }

  const sb = createClient(supabaseUrl, serviceRoleKey);
  const body = await req.json();
  const rows: Record<string, unknown>[] = body.rows || [];

  if (!rows.length) {
    return new Response(JSON.stringify({ error: "No rows" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const mapped = rows.map((r) => ({
    transaction_id: String(r.transaction_id || ""),
    account: String(r.account || ""),
    charge_ref: String(r.charge || ""),
    txn_type: String(r.type || ""),
    user_name: String(r.user_name || ""),
    payment_page: String(r.payment_page || ""),
    status: String(r.status || ""),
    currency: String(r.currency || ""),
    authorized_amount: Number(String(r.authorized_amount || "0").replace(/[$,]/g, "")) || 0,
    amount: Number(String(r.amount || "0").replace(/[$,]/g, "")) || 0,
    cliente: String(r.cliente || ""),
    payor: String(r.payor || ""),
    email: String(r.email || ""),
    phone: String(r.phone || ""),
    method: String(r.method || ""),
    card_type: String(r.card_type || ""),
    city: String(r.city || ""),
    state: String(r.state || ""),
    postal_code: String(r.postal_code || ""),
    country: String(r.country || ""),
    subtotal_amount: Number(String(r.subtotal_amount || "0").replace(/[$,]/g, "")) || 0,
    surcharge_amount: Number(String(r.surcharge_amount || "0").replace(/[$,]/g, "")) || 0,
    ip_address: String(r.ip_address || ""),
  }));

  const { error, count } = await sb.from("lawpay_export_staging").insert(mapped, { count: "exact" });

  if (error) {
    return new Response(JSON.stringify({ error: error.message, detail: error.details }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ inserted: count, batch_size: rows.length }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
