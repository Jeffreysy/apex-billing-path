import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeDcmRow, normalizePlanLoadRow, type DcmKpiRow, type DcmPlanLoadRow } from "@/lib/delinquentCollections";
import type { Client, Payment, CallLog, Collector, CaseStage } from "@/data/mockData";
import { format, subDays, addWeeks, addMonths, startOfWeek } from "date-fns";
import { ESCALATION_STATUSES, isEscalationUnresolved } from "@/lib/escalations";
import { ACTIVE_COLLECTORS, LEAD_COLLECTOR } from "@/lib/teamRoles";

// --- Status/field mapping helpers ---

function mapStatus(contractStatus: string | null, delinquencyStatus: string | null): Client["status"] {
  const s = (contractStatus || "").toLowerCase();
  const d = (delinquencyStatus || "").toLowerCase();
  if (s === "completed" || s === "paid off" || s === "paid" || s === "fulfilled") return "completed";
  if (s === "new" || s === "pending") return "new";
  if (d === "delinquent" || s === "risk" || s === "default" || s === "collections") return "delinquent";
  return "active";
}

function mapPaymentMethod(method: string | null): Payment["method"] {
  if (!method) return "card";
  const m = method.toLowerCase();
  if (m === "credit_card") return "card";
  if (m === "ach" || m === "wire") return "ach";
  if (m === "check") return "check";
  if (m === "cash") return "cash";
  return "card";
}

function mapCaseStage(stage: string | null): CaseStage {
  if (!stage) return "intake";
  const s = stage.toLowerCase();
  if (["intake", "discovery", "negotiation", "litigation", "settlement", "closed"].includes(s)) return s as CaseStage;
  return "intake";
}

function mapOutcome(outcome: string | null): CallLog["outcome"] {
  if (!outcome) return "no_answer";
  const o = outcome.toLowerCase();
  if (o.includes("payment") && (o.includes("taken") || o.includes("collected"))) return "payment_taken";
  if (o.includes("promise")) return "promise_to_pay";
  if (o.includes("no answer") || o.includes("voice")) return "no_answer";
  if (o.includes("voicemail") || o.includes("left message")) return "left_voicemail";
  if (o.includes("callback") || o.includes("schedule") || o.includes("follow")) return "callback_scheduled";
  if (o.includes("dispute")) return "disputed";
  if (o.includes("completed") || o.includes("success")) return "payment_taken";
  return "no_answer";
}

// --- Collector roster (live source of truth) ---
// Reads the ACTIVE roster from Supabase `collector_roster` — the certified canonical source
// (supabase-auditor migration 20260729175949) — and falls back to the static ACTIVE_COLLECTORS
// when the read is loading, empty, or RLS-blocked, so the UI never renders an empty roster.
// NOTE: `collector_roster` isn't in the generated types.ts yet, hence the scoped `any` cast;
// regenerate types (`npx supabase gen types`) to drop it.
export function useCollectorRoster() {
  const query = useQuery({
    queryKey: ["collector-roster"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("collector_roster")
        .select("collector_name, active")
        .eq("active", true)
        .order("collector_name");
      if (error) throw error;
      return ((data ?? []) as Array<{ collector_name: string | null }>)
        .map((r) => (r.collector_name || "").trim())
        .filter(Boolean);
    },
    staleTime: 5 * 60 * 1000,
  });

  const hasLive = Array.isArray(query.data) && query.data.length > 0;
  return {
    collectors: hasLive ? (query.data as string[]) : ACTIVE_COLLECTORS,
    lead: LEAD_COLLECTOR,
    isLoading: query.isLoading,
    isFallback: !hasLive,
  };
}

// --- Paginated fetch helper ---
export async function fetchAllRows<T>(table: any, options?: { filter?: (q: any) => any; orderBy?: string; ascending?: boolean; /** PostgREST column projection, default "*". */ columns?: string }): Promise<T[]> {
  const allData: T[] = [];
  const pageSize = 1000;
  let from = 0;
  let hasMore = true;
  while (hasMore) {
    let query = supabase.from(table).select(options?.columns ?? "*").range(from, from + pageSize - 1);
    if (options?.filter) query = options.filter(query);
    if (options?.orderBy) query = query.order(options.orderBy, { ascending: options.ascending ?? true });
    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length > 0) {
      allData.push(...(data as T[]));
      from += pageSize;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }
  return allData;
}

// ========================
// VIEW-BASED HOOKS
// ========================

/** Firm settings (LawPay URLs, defaults, branding). Single-row table. */
export type FirmSettings = {
  id: string;
  firm_name: string;
  lawpay_enabled: boolean;
  lawpay_operating_url: string | null;
  lawpay_trust_url: string | null;
  lawpay_default_account: "operating" | "trust";
};

export function useFirmSettings() {
  return useQuery<FirmSettings | null>({
    queryKey: ["firm-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("firm_settings")
        .select("id, firm_name, lawpay_enabled, lawpay_operating_url, lawpay_trust_url, lawpay_default_account")
        .limit(1);
      if (error) throw error;
      if (!data || data.length === 0) return null;
      return data[0] as FirmSettings;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** 1. Admin KPI — single-row view */
export function useAdminKPI() {
  return useQuery({
    queryKey: ["admin-kpi"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_kpi").select("*").limit(1);
      if (error) throw error;
      return (data && data[0]) || null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** 1a. Contract status — one row per status from the per-invoice AR clock (mv_ar_invoice_clock),
 *  contract/invoice grain, ties to Total AR to the penny. Replaces admin_kpi's status columns,
 *  which read the legacy contracts table (975 invoices / $4.6M had no status, "Paid" rows fell
 *  off the tiles). Returns null when the view is unavailable so the page can fall back. */
export type AdminContractStatusRow = {
  status_key: "current" | "paying_but_behind" | "delinquent" | "never_paid";
  label: string;
  sort_order: number;
  contracts: number;
  clients: number;
  ar: number;
  unlinked_contracts: number;
  snapshot_date: string | null;
  clock_as_of: string | null;
  payments_through: string | null;
};

export function useAdminContractStatus() {
  return useQuery<AdminContractStatusRow[] | null>({
    queryKey: ["admin-contract-status"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("v_admin_contract_status")
        .select("status_key, label, sort_order, contracts, clients, ar, unlinked_contracts, snapshot_date, clock_as_of, payments_through")
        .order("sort_order");
      if (error || !data || data.length === 0) return null;
      return (data as any[]).map((r) => ({
        ...r,
        contracts: Number(r.contracts) || 0,
        clients: Number(r.clients) || 0,
        ar: Number(r.ar) || 0,
        unlinked_contracts: Number(r.unlinked_contracts) || 0,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** 1b. Firm-wide certified financial summary — single-row pinned snapshot.
 *  Source of truth for canonical Total AR (ar_total) and month movement
 *  (ar_additions / ar_reductions / ar_net_movement). VP-certified. */
export function useFirmFinancialSummary() {
  return useQuery({
    queryKey: ["firm-financial-summary"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("v_firm_financial_summary").select("*").limit(1);
      if (error) throw error;
      return (data && data[0]) || null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Legal KPI — normalized pipeline stages, practice areas, attorney loads. Optional year filter. */
export function useLegalKPI(year?: number) {
  return useQuery({
    queryKey: ["legal-kpi", year ?? "all"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_legal_kpi", { p_year: year ?? null });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** 2. AR Dashboard view — for AR Portfolio tab. Only the columns ARPortfolioTab reads, ORDER BY the
 *  unique contract_id: unsorted select=* pages got a slow plan (6.4–8.2 s, half timed out at 8 s, so the
 *  tab never loaded) and unsorted offset paging can skip/duplicate rows. 2026-10-13. */
export const AR_PORTFOLIO_COLUMNS =
  "contract_id, client_name, case_number, practice_area, contract_status, total_contract_value, amount_collected, remaining_balance, collection_pct, days_past_due, installments_remaining, next_due_date";

export function useARDashboard() {
  return useQuery({
    queryKey: ["ar-dashboard", "portfolio-cols"],
    queryFn: async () => {
      return fetchAllRows<any>("ar_dashboard", { columns: AR_PORTFOLIO_COLUMNS, orderBy: "contract_id" });
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** 3. Collections Dashboard view — pre-sorted by priority_score */
export function useCollectionsDashboard() {
  return useQuery({
    queryKey: ["collections-dashboard"],
    queryFn: async () => {
      return fetchAllRows<any>("collections_dashboard");
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

/** payments_clean = LawPay charges LINKED to a client contract only (Jul 2026: $286,820 of $1,768,833.95 certified firm
 *  cash). Use it for per-client / per-contract payment detail, NEVER as firm collections — firm cash is
 *  useCertifiedMonthlyCollections (mv_collections_certified_monthly). Screens that show it must say "client-linked". */
export function usePaymentsClean() {
  return useQuery({
    queryKey: ["payments-clean"],
    queryFn: async () => {
      return fetchAllRows<any>("payments_clean", {
        orderBy: "payment_date",
        ascending: false,
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useEscalations(unresolvedOnly = false) {
  return useQuery({
    queryKey: ["escalations", unresolvedOnly ? "unresolved" : "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("escalations")
        .select("*")
        .in("status", unresolvedOnly ? ESCALATION_STATUSES.filter(isEscalationUnresolved) : [...ESCALATION_STATUSES])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
  });
}

export function useLawPayReconciliationSummary() {
  return useQuery({
    queryKey: ["lawpay-reconciliation-summary"],
    queryFn: async () => {
      const sb = supabase as any;
      const { data, error } = await sb.rpc("admin_lawpay_reconciliation_summary");
      if (error) throw error;
      return Array.isArray(data) ? data[0] || null : data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useFilevineReconciliationSummary() {
  return useQuery({
    queryKey: ["filevine-reconciliation-summary"],
    queryFn: async () => {
      const sb = supabase as any;
      const { data, error } = await sb.rpc("admin_filevine_reconciliation_summary");
      if (error) throw error;
      return Array.isArray(data) ? data[0] || null : data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useFilevineCaseReconciliationSummary() {
  return useQuery({
    queryKey: ["filevine-case-reconciliation-summary"],
    queryFn: async () => {
      const sb = supabase as any;
      const { data, error } = await sb.rpc("admin_filevine_case_reconciliation_summary");
      if (error) throw error;
      return Array.isArray(data) ? data[0] || null : data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useFilevineCaseReconciliationCandidates(limit = 50) {
  return useQuery({
    queryKey: ["filevine-case-reconciliation-candidates", limit],
    queryFn: async () => {
      const sb = supabase as any;
      const { data, error } = await sb.rpc("admin_filevine_case_reconciliation_candidates", {
        p_limit: limit,
      });
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ========================
// TABLE-BASED HOOKS (kept for components that still need them)
// ========================

/** ar_dashboard row (CONTRACT grain) -> Client. Shared by the full list (useMergedClients) and the single-
 *  contract fetch the Client Lookup profile uses (useArDashboardContract), so both map identically. */
export function mapArDashboardRow(row: any): Client {
  const totalOwed = Number(row.total_contract_value) || 0;
  const totalPaid = Number(row.amount_collected) || 0;
  const downPayment = Number(row.down_payment) || 0;
  const monthlyPayment = Number(row.monthly_installment) || 0;
  const installmentMonths = row.total_installments || 18;
  const daysAging = row.days_past_due || 0;

  return {
    id: row.contract_id,
    name: row.client_name || "Unknown",
    email: row.email || "",
    phone: row.phone || "",
    contractStart: row.start_date || "",
    contractEnd: "",
    totalOwed,
    totalPaid,
    monthlyPayment,
    downPayment,
    installmentMonths,
    status: mapStatus(row.contract_status, row.delinquency_status),
    assignedCollector: row.collector || "Unassigned",
    lastContact: "",
    nextPaymentDue: row.next_due_date || "",
    caseNumber: row.case_number || "",
    caseType: row.practice_area || "",
    caseStage: mapCaseStage(row.case_stage),
    daysAging,
    // Carry the canonical client_id so downstream joins (MyCase 360, payments, activities)
    // key on the client — NOT the contract_id in `id`. `id` stays the contract_id (row grain).
    clientId: row.client_id || undefined,
    retainerDate: row.start_date || "",
    downPaymentPaid: row.down_payment_paid || false,
    filevineId: undefined,
    mycaseId: undefined,
  };
}

export function useMergedClients() {
  return useQuery({
    queryKey: ["merged-clients"],
    queryFn: async () => {
      // Keep ALL ar_dashboard rows — do NOT drop delinquency_status = 'Paid'. The 08-04 client-ar + VP
      // ruling LOCKED that those "Paid"-but-open rows are REAL AR (~$104K; "Paid" is a stale contracts
      // label bled via the unreliable invoice_number join). Matches ExecutiveInsights + the certified book.
      // ORDER BY the unique contract_id: stable offset paging AND a fast plan (unsorted pages took
      // ~6.5 s and timed out under load; sorted ~0.5 s each). 2026-10-13.
      const rows = await fetchAllRows<any>("ar_dashboard", { orderBy: "contract_id" });

      return rows.map(mapArDashboardRow);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Same client-linked LawPay rows as usePaymentsClean, mapped to Payment. NOT firm cash (see usePaymentsClean). */
export function usePaymentsData() {
  return useQuery({
    queryKey: ["payments-data"],
    queryFn: async () => {
      const rows = await fetchAllRows<any>("payments_clean", {
        orderBy: "payment_date",
        ascending: false,
      });

      return rows.map((p): Payment => ({
        id: p.id,
        clientId: p.client_id || "",
        clientName: p.client_name || "Unknown",
        amount: Number(p.amount) || 0,
        date: p.payment_date,
        method: mapPaymentMethod(p.payment_method),
        collectorId: "",
        collectorName: p.collector_name || "CRM",
        status: "completed" as const,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCollectionActivities(monthStart?: string) {
  const currentMonthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");
  const start = monthStart || currentMonthStart;
  return useQuery({
    queryKey: ["collection-activities", start],
    queryFn: async () => {
      // Try requested month first
      let { data, error } = await supabase
        .from("collection_activities")
        .select("*")
        .gte("activity_date", start)
        .order("activity_date", { ascending: false })
        .limit(5000);
      if (error) throw error;

      // If current month is empty, fall back to most recent month with data
      if ((!data || data.length === 0) && start === currentMonthStart) {
        const { data: latest } = await supabase
          .from("collection_activities")
          .select("activity_date")
          .order("activity_date", { ascending: false })
          .limit(1);
        if (latest && latest.length > 0) {
          const latestDate = new Date(latest[0].activity_date);
          const fallbackStart = format(new Date(latestDate.getFullYear(), latestDate.getMonth(), 1), "yyyy-MM-dd");
          const res = await supabase
            .from("collection_activities")
            .select("*")
            .gte("activity_date", fallbackStart)
            .order("activity_date", { ascending: false })
            .limit(5000);
          if (!res.error) data = res.data;
        }
      }

      return (data || []).map((a): CallLog => ({
        id: a.id,
        clientId: a.client_id || "",
        clientName: a.client_name,
        collectorId: "",
        collectorName: a.collector,
        date: a.activity_date,
        duration: (Number(a.duration_minutes) || 0) * 60,
        outcome: mapOutcome(a.outcome),
        notes: a.notes || "",
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCollectionActivityRows() {
  return useQuery({
    queryKey: ["collection-activity-rows", "current-month"],
    queryFn: async () => {
      // Finance Overview only calculates current-week/current-month collector totals.
      // Loading the full activity history (tens of thousands of rows) blocked the
      // entire tab even though older rows were immediately discarded in the UI.
      const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("collection_activities")
        .select("id, activity_date, collected_amount")
        .gte("activity_date", monthStart)
        .order("activity_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** FULL per-client interaction history from collection_activities for the client profile.
 *  Keys on the canonical client_id first, then unions exact-name matches (dedup by id) so activities
 *  logged with only a name still surface. Deliberately NOT month-capped (the firm-wide
 *  useCollectionActivities is capped to the latest month for dashboards; a client profile must show the
 *  whole relationship). Refetched when CallDocumentationDialog invalidates ["client-activity-history"]. */
export function useClientActivityHistory(clientId: string | null, clientName?: string | null) {
  return useQuery({
    queryKey: ["client-activity-history", clientId, clientName],
    enabled: !!clientId || !!clientName,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const byId = new Map<string, any>();
      if (clientId) {
        const { data, error } = await supabase
          .from("collection_activities").select("*")
          .eq("client_id", clientId)
          .order("activity_date", { ascending: false })
          .limit(2000);
        if (error) throw error;
        (data ?? []).forEach((r: any) => byId.set(r.id, r));
      }
      if (clientName && clientName.trim()) {
        const { data, error } = await supabase
          .from("collection_activities").select("*")
          .ilike("client_name", clientName.trim())
          .order("activity_date", { ascending: false })
          .limit(2000);
        if (error) throw error;
        (data ?? []).forEach((r: any) => byId.set(r.id, r));
      }
      return Array.from(byId.values())
        .sort((a, b) => String(b.activity_date).localeCompare(String(a.activity_date)))
        .map((a): CallLog => ({
          id: a.id,
          clientId: a.client_id || "",
          clientName: a.client_name,
          collectorId: "",
          collectorName: a.collector,
          date: a.activity_date,
          duration: (Number(a.duration_minutes) || 0) * 60,
          outcome: mapOutcome(a.outcome),
          notes: a.notes || "",
        }));
    },
  });
}

// --- Certified weekly collected cash (de-duplicated source of record) ---
// Reads public.v_activity_collected_weekly — the VP-certified SoR that counts each payment ONCE.
// The raw client-side SUM(collection_activities.collected_amount) double-counts collector "Collected"
// call logs against the canonical LawPay payment_received rows (re-ingested with jittered start_times);
// recent weeks ran 25-33% inflated. `certified_collected` is the firm-wide de-duplicated weekly cash
// to display; `certified_collector` / `certified_auto_payment` split it (collector vs auto-pay).
// The view is granted SELECT to authenticated + anon (not security_invoker), so the app reads it
// directly. It is NOT in the generated types.ts yet, hence the scoped `any` cast — regenerate types
// (`npx supabase gen types`) to drop it. Rows come back ascending by week_start. On a read failure the
// series is empty (the UI shows a "certified data unavailable" note) — it deliberately does NOT fall
// back to the inflated raw sum: the UI must agree with the certified SoR, never re-introduce the drift.
export interface ActivityCollectedWeek {
  week_start: string;
  raw_collected: number;
  certified_collected: number;
  certified_auto_payment: number;
  certified_collector: number;
  duplication_excess: number;
  duplication_pct: number;
  payment_events: number;
  money_rows: number;
}

export function useActivityCollectedWeekly() {
  return useQuery<ActivityCollectedWeek[]>({
    queryKey: ["activity-collected-weekly"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("v_activity_collected_weekly")
        .select(
          "week_start, raw_collected, certified_collected, certified_auto_payment, certified_collector, duplication_excess, duplication_pct, payment_events, money_rows",
        )
        .order("week_start", { ascending: true });
      if (error) throw error;
      return ((data ?? []) as any[]).map((r) => ({
        week_start: String(r.week_start),
        raw_collected: Number(r.raw_collected) || 0,
        certified_collected: Number(r.certified_collected) || 0,
        certified_auto_payment: Number(r.certified_auto_payment) || 0,
        certified_collector: Number(r.certified_collector) || 0,
        duplication_excess: Number(r.duplication_excess) || 0,
        duplication_pct: Number(r.duplication_pct) || 0,
        payment_events: Number(r.payment_events) || 0,
        money_rows: Number(r.money_rows) || 0,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

// --- Certified weekly collected, split BY collector (de-duplicated) ---
// Reads public.v_activity_collected_by_collector_weekly — the VP-certified per-collector companion to
// v_activity_collected_weekly. Each payment is counted ONCE and credited to the HUMAN collector who
// logged it; pure auto-pay events with no human touch are held under collector 'System-Auto' with
// is_autopay_credit=true. VERIFIED to tie to the firm view every week (per-week SUM = certified_collected;
// is_autopay_credit=false sum = certified_collector; =true sum = certified_auto_payment; diff 0.00).
// Same grant profile (authenticated/anon SELECT), not security_invoker. Not in types.ts yet (scoped
// `any` cast). Empty on read failure — callers must NOT fall back to the raw collected_amount sum.
export interface ActivityCollectedByCollectorWeek {
  week_start: string;
  collector: string;
  is_autopay_credit: boolean;
  payment_events: number;
  certified_collected: number;
}

export function useActivityCollectedByCollectorWeekly() {
  return useQuery<ActivityCollectedByCollectorWeek[]>({
    queryKey: ["activity-collected-by-collector-weekly"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("v_activity_collected_by_collector_weekly")
        .select("week_start, collector, is_autopay_credit, payment_events, certified_collected")
        .order("week_start", { ascending: true });
      if (error) throw error;
      return ((data ?? []) as any[]).map((r) => ({
        week_start: String(r.week_start),
        collector: String(r.collector ?? "").trim(),
        is_autopay_credit: r.is_autopay_credit === true,
        payment_events: Number(r.payment_events) || 0,
        certified_collected: Number(r.certified_collected) || 0,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Build a { collectorKey -> certified $ } map from the by-collector rows, summing the weeks a caller
// scopes in (a selected month, the last N weeks, etc.). `keyFn` lets callers normalize the collector
// name to match their own roster keying (default: the trimmed name as stored in the view). Set
// `humanOnly` to drop the System-Auto auto-pay bucket for human-collector tables.
export function certifiedCollectedByCollector(
  rows: ActivityCollectedByCollectorWeek[] | undefined,
  weekInScope: (weekStart: string) => boolean,
  opts?: { humanOnly?: boolean; keyFn?: (collector: string) => string },
): Map<string, number> {
  const keyFn = opts?.keyFn ?? ((c: string) => c);
  const out = new Map<string, number>();
  for (const r of rows ?? []) {
    if (opts?.humanOnly && r.is_autopay_credit) continue;
    if (!weekInScope(r.week_start)) continue;
    const k = keyFn(r.collector);
    out.set(k, (out.get(k) ?? 0) + r.certified_collected);
  }
  return out;
}

/** 6. Collectors — from collector_performance view, current month (falls back to latest).
 *  Dynamic: all collectors except System-Auto are included automatically. */
export function useCollectors(monthStart?: string) {
  const currentMonthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");
  const start = monthStart || currentMonthStart;
  return useQuery({
    queryKey: ["collectors-aggregated", start],
    queryFn: async () => {
      let { data: rows, error } = await supabase
        .from("collector_performance")
        .select("*")
        .gte("month", start);
      if (error) throw error;

      // Fall back to latest month if current month is empty
      if ((!rows || rows.length === 0) && start === currentMonthStart) {
        const res = await supabase
          .from("collector_performance")
          .select("*")
          .order("month", { ascending: false })
          .limit(10);
        if (!res.error && res.data && res.data.length > 0) {
          const latestMonth = res.data[0].month;
          const fallback = await supabase
            .from("collector_performance")
            .select("*")
            .eq("month", latestMonth);
          if (!fallback.error) rows = fallback.data;
        }
      }

      const collectorMap = new Map<string, { totalCollected: number; totalCommission: number; callsMade: number; paymentsTaken: number }>();

      for (const row of (rows || [])) {
        // Exclude automated/system entries
        if (!row.collector || row.collector.toLowerCase().startsWith("system")) continue;
        const existing = collectorMap.get(row.collector) || { totalCollected: 0, totalCommission: 0, callsMade: 0, paymentsTaken: 0 };
        existing.totalCollected += Number(row.total_collected) || 0;
        existing.totalCommission += Number(row.total_commission) || 0;
        existing.callsMade += Number(row.total_activities) || 0;
        existing.paymentsTaken += Number(row.collected_calls) || 0;
        collectorMap.set(row.collector, existing);
      }

      const collectors: Collector[] = [];
      let i = 0;
      for (const [name, stats] of collectorMap) {
        collectors.push({
          id: `c${i + 1}`,
          name,
          avatar: name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
          totalCollected: Math.round(stats.totalCollected),
          totalCommission: Math.round(stats.totalCommission),
          callsMade: stats.callsMade,
          paymentsTaken: stats.paymentsTaken,
          isLead: name === "Alejandro A",
        });
        i++;
      }
      return collectors.sort((a, b) => b.totalCollected - a.totalCollected);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** 7. Collector Weekly Coverage — unique clients contacted per week vs AR universe */
export type CollectorWeeklyCoverage = {
  collector: string;
  week_start: string;
  week_end: string;
  unique_clients_contacted: number;
  total_activities: number;
  productive_contacts: number;
  team_unique_clients: number;
  total_ar_clients: number;
  coverage_pct: number;
  team_share_pct: number;
  productivity_pct: number;
};

export function useCollectorWeeklyCoverage(weeksBack = 12) {
  return useQuery({
    queryKey: ["collector-weekly-coverage", weeksBack],
    queryFn: async () => {
      const since = format(
        new Date(Date.now() - weeksBack * 7 * 24 * 60 * 60 * 1000),
        "yyyy-MM-dd"
      );
      const { data, error } = await supabase
        .from("collector_weekly_coverage" as any)
        .select("*")
        .gte("week_start", since)
        .order("week_start", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as CollectorWeeklyCoverage[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** 8. Collector Client Status — per-collector view of each client: last contact, days since, this-week flag */
export type CollectorClientStatus = {
  collector: string;
  client_id: string;
  client_name: string;
  practice_area: string | null;
  delinquency_status: string | null;
  remaining_ar: number;
  last_contact_date: string | null;
  days_since_contact: number | null;
  total_contacts: number;
  contacts_last_30d: number;
  contacted_this_week: boolean;
};

export function useCollectorClientStatus(collectorName?: string) {
  return useQuery({
    queryKey: ["collector-client-status", collectorName ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("collector_client_status" as any)
        .select("*")
        .order("remaining_ar", { ascending: false });
      if (collectorName) query = (query as any).eq("collector", collectorName);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as CollectorClientStatus[];
    },
    staleTime: 5 * 60 * 1000,
  });
}


// Helper: extract client name from notes by removing "Filevine: " prefix
export function extractClientNameFromNotes(notes: string | null): string {
  if (!notes) return "";
  const prefix = "Filevine: ";
  if (notes.startsWith(prefix)) return notes.slice(prefix.length).trim();
  return notes.trim();
}

/** 5. Immigration cases — all or filtered by is_closed */
export function useImmigrationCases(activeOnly = false) {
  return useQuery({
    queryKey: ["immigration-cases", activeOnly],
    queryFn: async () => {
      return fetchAllRows<any>("immigration_cases", {
        filter: activeOnly ? (q: any) => q.eq("is_closed", false) : undefined,
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCaseMilestones() {
  return useQuery({
    queryKey: ["case-milestones"],
    queryFn: async () => {
      return fetchAllRows<any>("case_milestones");
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** MyCase invoice numbers are TEXT (up to 19 digits) and are written two ways: `mycase_invoices` /
 *  `mycase_payment_plans` store digits only ("1234567"), the rich payment feed (`mycase_transactions_rich.reference`,
 *  surfaced as v_financial_ledger_canonical.invoice_number) and the AR clock store "#1234567". Never parse them as
 *  numbers (19 digits round). Match on the digits-only key and query both spellings. */
export function invoiceDigitsKey(inv: string | null | undefined): string {
  return String(inv ?? "").replace(/\D/g, "");
}
export function invoiceNumberSpellings(invoiceNumbers: Array<string | null | undefined>): string[] {
  const out = new Set<string>();
  for (const inv of invoiceNumbers) {
    const k = invoiceDigitsKey(inv);
    if (k.length < 5) continue; // too short to be a MyCase invoice number; would over-match
    out.add(k);
    out.add(`#${k}`);
  }
  return [...out].sort();
}

// Explicit columns only: never select * on client-bearing tables (raw_payload carries the full MyCase record).
const MYCASE_CONTACT_COLS =
  "mycase_contact_id, full_name, first_name, last_name, email, phone, cell_phone_number, work_phone_number, home_phone_number, contact_group, company, birthdate, matched_client_id, match_type, synced_at";
const MYCASE_INVOICE_COLS = "invoice_number, status, amount, amount_paid, amount_due, issue_date, due_date, mycase_case_id, synced_at";
const MYCASE_PLAN_COLS =
  "id, invoice_number, case_name, total, paid, amount_due, installments_paid, total_installments, next_due_date, next_due_date_norm, next_amount, final_date, final_date_norm, autopay, retired_at, last_synced_at";
const MYCASE_CASE_COLS =
  "id, mycase_case_id, case_number, case_name, case_type, case_stage, practice_area, status, is_closed, open_date, closed_date, lead_attorney, flat_fee, billing_type, outstanding_balance, sol_date, matched_client_id, synced_at";
const LAWPAY_RECENT_COLS = "id, payment_date, amount, status, payment_method, card_brand, card_last_four, client_id";

/** MyCase records for one client: contact, cases, invoices, payment plans, and recent LawPay card payments.
 *  Fetched per-selected-client (server-side filter by matched_client_id).
 *  Payments are NOT read here: the profile's payment history is the certified cash ledger (useClientLedger →
 *  v_financial_ledger_canonical = mycase_transactions_rich, current to the latest rich load). 2026-10-14: this hook used
 *  to also pull the plain-scrape `mycase_transaction_history` (frozen 2026-09-29) with select *; nothing rendered it. */
export function useMyCaseClient360(clientId: string | null) {
  return useQuery({
    queryKey: ["mycase-client-360", "v2", clientId],
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!clientId) return null;
      const [contactsRes, casesRes, invoicesRes, lawpayRes] = await Promise.all([
        supabase.from("mycase_contacts").select(MYCASE_CONTACT_COLS).eq("matched_client_id", clientId),
        supabase.from("mycase_cases").select(MYCASE_CASE_COLS).eq("matched_client_id", clientId).order("open_date", { ascending: false }),
        supabase.from("mycase_invoices").select(MYCASE_INVOICE_COLS).eq("matched_client_id", clientId),
        supabase.from("lawpay_transactions").select(LAWPAY_RECENT_COLS).eq("client_id", clientId).eq("status", "COMPLETED").order("payment_date", { ascending: false }),
      ]);
      const contacts = (contactsRes.data ?? []) as any[];
      const cases = (casesRes.data ?? []) as any[];
      const invoices = (invoicesRes.data ?? []) as any[];
      const lawpay = (lawpayRes.data ?? []) as any[];
      // mycase_invoices is a separate, slower feed (see v_feed_freshness 'invoices'); expose its sync date so the
      // page can say how current the invoice list is.
      const invoicesSyncedAt = invoices.reduce(
        (m: string | null, i: any) => (i.synced_at && (!m || i.synced_at > m) ? i.synced_at : m), null as string | null);
      const planKeys = invoiceNumberSpellings(invoices.map((i: any) => i.invoice_number)).filter((s) => !s.startsWith("#"));
      let plans: any[] = [];
      if (planKeys.length > 0) {
        const planRes = await supabase.from("mycase_payment_plans").select(MYCASE_PLAN_COLS).in("invoice_number", planKeys);
        plans = planRes.data ?? [];
      }
      // LawPay card payments for this client; the page shows only those newer than the client's latest ledger payment.
      return { contact: contacts[0] ?? null, contacts, cases, invoices, invoicesSyncedAt, plans, lawpayRecent: lawpay };
    },
  });
}

/** SOL / filing-deadline watch — OPEN MyCase cases that carry a statute-of-limitations date.
 *  Reads mycase_cases directly (same access the client-detail MyCase sections already use). */
export function useSolDeadlineWatch() {
  return useQuery({
    queryKey: ["sol-deadline-watch"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mycase_cases")
        .select("mycase_case_id, case_number, case_name, practice_area, case_stage, status, lead_attorney, sol_date, outstanding_balance, matched_client_id")
        .eq("is_closed", false)
        .not("sol_date", "is", null)
        .order("sol_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Best MyCase contact for one client — verified client_id match first, then exact-name fallback (flagged).
 *  Used to surface dial-able phones in the collector workspace where contracts.phone is mostly null. */
export function useClientContact(clientId: string | null, clientName?: string | null) {
  return useQuery({
    queryKey: ["client-contact", clientId, clientName],
    enabled: !!clientId || !!clientName,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (clientId) {
        const { data } = await supabase.from("mycase_contacts").select(MYCASE_CONTACT_COLS).eq("matched_client_id", clientId).limit(1);
        if (data && data.length) return { contact: data[0] as any, source: "client_id" as const };
      }
      if (clientName && clientName.trim()) {
        const { data } = await supabase.from("mycase_contacts").select(MYCASE_CONTACT_COLS).ilike("full_name", clientName.trim()).limit(1);
        if (data && data.length) return { contact: data[0] as any, source: "name_match" as const };
      }
      return { contact: null as any, source: "none" as const };
    },
  });
}

/** AR roll-forward per snapshot period (penny-exact) */
// 2026-10-14: the live view v_ar_waterfall takes ~7 s and returns HTTP 500 (statement timeout) for signed-in users.
// Read the materialized copy (mv_ar_waterfall, same columns, requested from the VP) first; fall back to the view
// only if the MV does not exist yet. Callers MUST treat isError as "roll-forward unavailable", never as "no snapshot".
const AR_WATERFALL_COLS = "prior_date, period_date, beginning, additions, reductions, ending, mycase_cash_all_methods, lawpay_card_cash";
export function useArWaterfall() {
  return useQuery({
    queryKey: ["ar-waterfall", "v2"],
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      const mv = await (supabase as any).from("mv_ar_waterfall").select(AR_WATERFALL_COLS).order("period_date", { ascending: true });
      if (!mv.error) return (mv.data ?? []) as any[];
      const { data, error } = await (supabase as any).from("v_ar_waterfall").select(AR_WATERFALL_COLS).order("period_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

/** Expected collections per future month from payment plans */
export function useArForwardProjection() {
  return useQuery({
    queryKey: ["ar-forward-projection"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.from("v_ar_forward_projection").select("*").order("proj_month", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** 12-month AR landscape trend (total AR, MoM change, collected %, 180+ aging share) */
export function useArLandscapeTrend() {
  return useQuery({
    queryKey: ["ar-landscape-trend"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.from("v_ar_landscape_trend").select("*").order("month", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Latest-period per-client AR movement (top movers) */
export function useArClientMovement() {
  return useQuery({
    queryKey: ["ar-client-movement"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.from("v_ar_client_movement").select("*").neq("movement", "UNCHANGED").order("delta", { ascending: true }).limit(40);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Payment-plan data freshness (scrape date + age + stale flag) */
export function useArPlanFreshness() {
  return useQuery({
    queryKey: ["ar-plan-freshness"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.from("v_payment_plan_freshness").select("*").maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
}

// --- Computation helpers (work on hook data) ---

export function computeARAgingData(clients: Client[]) {
  const buckets = [
    { range: "Current", min: -Infinity, max: 0, amount: 0, count: 0 },
    { range: "1-30 days", min: 1, max: 30, amount: 0, count: 0 },
    { range: "31-60 days", min: 31, max: 60, amount: 0, count: 0 },
    { range: "61-90 days", min: 61, max: 90, amount: 0, count: 0 },
    { range: "90+ days", min: 91, max: Infinity, amount: 0, count: 0 },
  ];
  for (const c of clients) {
    const balance = Math.max(0, c.totalOwed - c.totalPaid);
    if (balance <= 0) continue;
    const d = c.daysAging;
    for (const b of buckets) {
      if (d >= b.min && d <= b.max) {
        b.amount += balance;
        b.count++;
        break;
      }
    }
  }
  return buckets.map(b => ({ range: b.range, amount: Math.round(b.amount), count: b.count }));
}

export function computeTransactionsByType(_payments: Payment[], _clients: Client[], paymentRows?: any[]) {
  const rows = paymentRows || [];
  const typeMap = new Map<string, { total: number; count: number }>();
  for (const p of rows) {
    const type = p.payment_type || "Other";
    const existing = typeMap.get(type) || { total: 0, count: 0 };
    existing.total += Number(p.amount) || 0;
    existing.count += 1;
    typeMap.set(type, existing);
  }
  return Array.from(typeMap, ([type, stats]) => ({
    type,
    label: type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
    total: Math.round(stats.total),
    count: stats.count,
  })).sort((a, b) => b.total - a.total);
}

export function computeCaseTypeBilling(clients: Client[]) {
  const caseTypeMap = new Map<string, { totalBilled: number; totalCollected: number; count: number }>();
  for (const c of clients) {
    if (!c.caseType) continue;
    const existing = caseTypeMap.get(c.caseType) || { totalBilled: 0, totalCollected: 0, count: 0 };
    existing.totalBilled += c.totalOwed;
    existing.totalCollected += c.totalPaid;
    existing.count++;
    caseTypeMap.set(c.caseType, existing);
  }
  return Array.from(caseTypeMap, ([caseType, stats]) => ({
    caseType,
    totalBilled: Math.round(stats.totalBilled),
    totalCollected: Math.round(stats.totalCollected),
    count: stats.count,
  })).filter(d => d.count > 0).sort((a, b) => b.totalBilled - a.totalBilled);
}

export function computeContractAnalytics(clients: Client[]) {
  const months: { month: string; started: number; matured: number; delinquent: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = subDays(new Date(), i * 30);
    const monthStr = format(d, "MMM");
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

    const started = clients.filter(c => {
      if (!c.contractStart) return false;
      const sd = new Date(c.contractStart);
      return sd >= monthStart && sd <= monthEnd;
    }).length;

    const matured = clients.filter(c => {
      if (c.status !== "completed" || !c.contractStart) return false;
      const pctPaid = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0;
      if (pctPaid < 0.95) return false;
      const endEst = new Date(c.contractStart);
      endEst.setMonth(endEst.getMonth() + c.installmentMonths);
      return endEst >= monthStart && endEst <= monthEnd;
    }).length;

    const delinquent = clients.filter(c => {
      if (c.status !== "delinquent" || c.daysAging <= 0) return false;
      const becameDelinquentEst = new Date();
      becameDelinquentEst.setDate(becameDelinquentEst.getDate() - c.daysAging);
      return becameDelinquentEst >= monthStart && becameDelinquentEst <= monthEnd;
    }).length;

    months.push({ month: monthStr, started, matured, delinquent });
  }
  return months;
}

export function computeForecastData(clients: Client[], collectionRatePct?: number) {
  const activeClients = clients.filter(c => c.status === "active" || c.status === "delinquent");
  const weeklyScheduled = activeClients.reduce((s, c) => s + c.monthlyPayment, 0) / 4;
  const rate = (collectionRatePct ?? 60) / 100;

  return Array.from({ length: 8 }, (_, i) => ({
    period: format(addWeeks(new Date(), i + 1), "MMM dd"),
    projected: Math.round(weeklyScheduled * rate),
    pessimistic: Math.round(weeklyScheduled * rate * 0.7),
    optimistic: Math.round(weeklyScheduled * rate * 1.3),
  }));
}

export function computeMonthlyForecast(clients: Client[], collectionRatePct?: number) {
  const activeClients = clients.filter(c => c.status === "active" || c.status === "delinquent");
  const monthlyScheduled = activeClients.reduce((s, c) => s + c.monthlyPayment, 0);
  const rate = (collectionRatePct ?? 60) / 100;

  return Array.from({ length: 6 }, (_, i) => ({
    month: format(addMonths(new Date(), i + 1), "MMM yyyy"),
    projected: Math.round(monthlyScheduled * rate),
    pessimistic: Math.round(monthlyScheduled * rate * 0.7),
    optimistic: Math.round(monthlyScheduled * rate * 1.3),
  }));
}

/** Parse a DATE string ("yyyy-mm-dd") as a LOCAL calendar day. new Date("yyyy-mm-dd") is UTC midnight, which is the
 *  previous evening in US time zones and pushes the 1st of a month / a Monday into the prior month / week. */
export function localDay(d: string | null | undefined): Date | null {
  if (!d) return null;
  const s = String(d).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const dt = new Date(`${s}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}
/** Monday-start week key that carries the YEAR (sortable). The old "MMM dd" key merged the same week across years. */
function weekKey(d: Date): string {
  return format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
}
function weekLabel(key: string): string {
  return format(new Date(`${key}T00:00:00`), "MMM dd");
}

export function computeWeeklyCollections(payments: Payment[], weeklyTarget?: number) {
  // Last 12 Monday-start weeks up to today, oldest first. 2026-10-14: keyed "MMM dd" (no year) and sliced the OLDEST 12
  // of a newest-first list, so the chart showed Jan-Mar weeks merged across years.
  const weekMap = new Map<string, number>();
  for (const p of payments) {
    const d = localDay(p.date);
    if (!d) continue;
    const key = weekKey(d);
    weekMap.set(key, (weekMap.get(key) || 0) + p.amount);
  }
  const thisWeek = weekKey(new Date());
  const entries = [...weekMap.keys()].filter((k) => k <= thisWeek).sort().slice(-12)
    .map((k) => ({ week: weekLabel(k), collected: Math.round(weekMap.get(k) || 0) }));
  const avgWeekly = entries.length > 0 ? Math.round(entries.reduce((s, e) => s + e.collected, 0) / entries.length) : 0;
  const target = weeklyTarget ?? avgWeekly;
  return entries.map(e => ({ ...e, target }));
}

export function computeMonthlyCollections(payments: Payment[], monthlyTarget?: number) {
  const monthMap = new Map<string, number>();
  for (const p of payments) {
    if (!p.date) continue;
    const d = new Date(p.date);
    const key = format(d, "MMM yyyy");
    monthMap.set(key, (monthMap.get(key) || 0) + p.amount);
  }
  const entries = Array.from(monthMap, ([month, collected]) => ({
    month,
    collected: Math.round(collected),
  })).slice(-6);
  const avgMonthly = entries.length > 0 ? Math.round(entries.reduce((s, e) => s + e.collected, 0) / entries.length) : 0;
  const target = monthlyTarget ?? avgMonthly;
  return entries.map(e => ({ ...e, target }));
}

export function computeDailyCollections(payments: Payment[]) {
  // THIS week (Mon-Fri) only. 2026-10-14: it summed every payment ever recorded by weekday under a "This Week" title.
  const dayMap = new Map<string, { collector: number; crm: number }>();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  days.forEach(d => dayMap.set(d, { collector: 0, crm: 0 }));
  const thisWeek = weekKey(new Date());

  for (const p of payments) {
    const d = localDay(p.date);
    if (!d || weekKey(d) !== thisWeek) continue;
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    if (!dayMap.has(dayName)) continue;
    const entry = dayMap.get(dayName)!;
    if (p.collectorName && p.collectorName !== "CRM") {
      entry.collector += p.amount;
    } else {
      entry.crm += p.amount;
    }
  }

  return days.map(day => {
    const d = dayMap.get(day) || { collector: 0, crm: 0 };
    return { day, collector: Math.round(d.collector), crm: Math.round(d.crm), total: Math.round(d.collector + d.crm) };
  });
}

export function computeWeeklyPastCollections(payments: Payment[]) {
  // Last 12 Monday-start weeks up to today, oldest first (same fix as computeWeeklyCollections).
  const weekMap = new Map<string, { collector: number; crm: number }>();
  for (const p of payments) {
    const d = localDay(p.date);
    if (!d) continue;
    const key = weekKey(d);
    const entry = weekMap.get(key) || { collector: 0, crm: 0 };
    if (p.collectorName && p.collectorName !== "CRM") {
      entry.collector += p.amount;
    } else {
      entry.crm += p.amount;
    }
    weekMap.set(key, entry);
  }
  const thisWeek = weekKey(new Date());
  return [...weekMap.keys()].filter((k) => k <= thisWeek).sort().slice(-12).map((k) => {
    const { collector, crm } = weekMap.get(k)!;
    return { week: weekLabel(k), collector: Math.round(collector), crm: Math.round(crm), total: Math.round(collector + crm) };
  });
}

export function computeMonthlyPastCollections(payments: Payment[]) {
  const monthMap = new Map<string, { collector: number; crm: number }>();
  for (const p of payments) {
    if (!p.date) continue;
    const d = new Date(p.date);
    const key = format(d, "MMM yyyy");
    const entry = monthMap.get(key) || { collector: 0, crm: 0 };
    if (p.collectorName && p.collectorName !== "CRM") {
      entry.collector += p.amount;
    } else {
      entry.crm += p.amount;
    }
    monthMap.set(key, entry);
  }
  return Array.from(monthMap, ([month, { collector, crm }]) => ({
    month,
    collector: Math.round(collector),
    crm: Math.round(crm),
    total: Math.round(collector + crm),
  })).slice(-6);
}

export type ClassifiedMonthlyCollection = {
  month: string;
  current: number;
  delinquent: number;
  unknown: number;
  total: number;
  currentCount: number;
  delinquentCount: number;
  unknownCount: number;
};

/** Certified monthly cash (mv_collections_certified_monthly, refreshed daily, bank-supported
 *  ONLINE+OFFLINE basis). 10-13 VP: get_classified_monthly_collections reads `payments`, which only
 *  holds LawPay charges linked to a client (Jul: 578 of 3,476) — $286,820 vs $1,768,833.95 real cash.
 *  Do NOT read the live v_collections_certified_monthly here (~75 s). */
export type CertifiedMonthlyCollection = {
  monthKey: string;
  month: string;
  total: number;
  onPlan: number;
  delinquent: number;
  from180: number;
  autopayEnrolled: number;
  basis: string;
  /** Unrounded real_cash_total — sum THIS across months (summing the whole-dollar `total` drifts by cents). */
  totalExact: number;
};

export function useCertifiedMonthlyCollections(months = 5) {
  return useQuery<CertifiedMonthlyCollection[]>({
    queryKey: ["certified-monthly-collections", months],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("mv_collections_certified_monthly")
        .select("mon, real_cash_total, delinquent_recovery, recovery_from_180plus, cash_from_autopay_enrolled_payers, basis")
        .order("mon", { ascending: false })
        .limit(months);
      if (error) throw error;
      return ((data ?? []) as any[]).reverse().map((r) => {
        const total = Math.round(Number(r.real_cash_total) || 0);
        const delinquent = Math.round(Number(r.delinquent_recovery) || 0);
        const d = new Date(`${String(r.mon).slice(0, 10)}T00:00:00`);
        return {
          monthKey: String(r.mon).slice(0, 7),
          month: format(d, "MMM yyyy"),
          total,
          onPlan: total - delinquent,
          delinquent,
          from180: Math.round(Number(r.recovery_from_180plus) || 0),
          autopayEnrolled: Math.round(Number(r.cash_from_autopay_enrolled_payers) || 0),
          basis: String(r.basis || ""),
          totalExact: Number(r.real_cash_total) || 0,
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** AR roll-forward by calendar month, from v_ar_waterfall (one row per MyCase AR snapshot period, beginning →
 *  additions/reductions → ending). A month = every snapshot period whose period_date falls in it: beginning of the
 *  first, ending of the last, additions/reductions summed. SNAPSHOT grain, whole dollars. Before May 2026 the
 *  snapshots were monthly-or-sparser and the basis changed (Jan/Feb 2026 show ~$18-20M gross churn), so the
 *  additions/reductions columns are only meaningful from 2026-05 on; ending/net change are valid throughout. */
export type ArMonthMovement = {
  monthKey: string;
  month: string;
  periods: number;
  firstSnapshot: string;
  lastSnapshot: string;
  beginning: number;
  additions: number;
  reductions: number;
  ending: number;
  net: number;
};

export function aggregateArWaterfallByMonth(rows: any[]): ArMonthMovement[] {
  const byMonth = new Map<string, any[]>();
  for (const r of rows ?? []) {
    const k = String(r.period_date ?? "").slice(0, 7);
    if (!k) continue;
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k)!.push(r);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, list]) => {
      const sorted = [...list].sort((a, b) => String(a.period_date).localeCompare(String(b.period_date)));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const beginning = Number(first.beginning) || 0;
      const ending = Number(last.ending) || 0;
      return {
        monthKey: k,
        month: format(new Date(`${k}-01T00:00:00`), "MMM yyyy"),
        periods: sorted.length,
        firstSnapshot: String(first.prior_date ?? "").slice(0, 10),
        lastSnapshot: String(last.period_date ?? "").slice(0, 10),
        beginning,
        additions: sorted.reduce((s, r) => s + (Number(r.additions) || 0), 0),
        reductions: sorted.reduce((s, r) => s + (Number(r.reductions) || 0), 0),
        ending,
        net: ending - beginning,
      };
    });
}

/** CLIENT-grain AR headcount: v_client_ar_front_door (one row per linked client on the active MyCase snapshot).
 *  On 2026-10-14 = 3,321 clients / $15,772,665.52 (snapshot 734dedb0, 2026-10-12); the remaining $1,730,220 of the
 *  $17,502,885.52 book sits on 259 invoices with no client link. Use this, not admin_kpi.total_clients (ar_dashboard's
 *  own client join: 3,304). */
export function useArClientGrain() {
  return useQuery({
    queryKey: ["ar-client-grain"],
    queryFn: async () => {
      const [countRes, snapRes] = await Promise.all([
        (supabase as any).from("v_client_ar_front_door").select("client_id", { count: "exact", head: true }),
        (supabase as any).from("v_ar_active_snapshot").select("snapshot_date").limit(1),
      ]);
      if (countRes.error) throw countRes.error;
      return {
        clients: Number(countRes.count) || 0,
        snapshotDate: ((snapRes.data ?? [])[0]?.snapshot_date as string | undefined) ?? null,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Monthly collections classified by contract schedule: current vs delinquent at time of payment. */
export function useClassifiedMonthlyCollections(monthsBack = 4) {
  return useQuery<ClassifiedMonthlyCollection[]>({
    queryKey: ["classified-monthly-collections", monthsBack],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_classified_monthly_collections", {
        months_back: monthsBack,
      });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        month: r.month,
        current: Math.round(Number(r.current_total) || 0),
        delinquent: Math.round(Number(r.delinquent_total) || 0),
        unknown: Math.round(Number(r.unknown_total) || 0),
        total: Math.round(
          (Number(r.current_total) || 0) +
          (Number(r.delinquent_total) || 0) +
          (Number(r.unknown_total) || 0)
        ),
        currentCount: Number(r.current_count) || 0,
        delinquentCount: Number(r.delinquent_count) || 0,
        unknownCount: Number(r.unknown_count) || 0,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ========================
// HARDSHIP REQUESTS
// ========================

export type HardshipRequest = {
  id: string;
  client_id: string;
  contract_id: string | null;
  requested_by: string;
  reason: string;
  hardship_type: "extended_term" | "reduced_payment" | "temporary_pause" | "settlement_offer" | "other";
  current_monthly_payment: number | null;
  proposed_monthly_payment: number | null;
  current_term_remaining: number | null;
  proposed_term_months: number | null;
  notes: string | null;
  status: "pending" | "approved" | "denied" | "counter_offered";
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
};

/** Hardship requests for a specific client/contract (used in CollectorWorkspace). */
export function useHardshipRequests(clientId: string | null | undefined, contractId?: string | null) {
  return useQuery<HardshipRequest[]>({
    queryKey: ["hardship-requests", clientId, contractId],
    queryFn: async () => {
      if (!clientId) return [];
      let query = supabase
        .from("hardship_requests")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (contractId) query = query.eq("contract_id", contractId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as HardshipRequest[];
    },
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
  });
}

// ═══════════════════════════════════════════════════════════
// AR Origination / Portfolio Growth hooks (powered by database views)
// ═══════════════════════════════════════════════════════════

/** AR portfolio growth by year — cohort analysis */
export function useARPortfolioYearly() {
  return useQuery({
    queryKey: ["ar-portfolio-yearly"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_ar_portfolio_yearly")
        .select("*")
        .order("cohort_year", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** AR portfolio growth by month — new cases, cumulative AR, collection rates */
export function useARPortfolioMonthly() {
  return useQuery({
    queryKey: ["ar-portfolio-monthly"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_ar_portfolio_monthly")
        .select("*")
        .order("cohort_month", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Monthly cashflow — AR created vs collected, net AR change */
export function useARMonthlyCashflow() {
  return useQuery({
    queryKey: ["ar-monthly-cashflow"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_ar_monthly_cashflow")
        .select("*")
        .order("month", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Payment staleness summary — aggregated by bucket and status */
export function useARStalenessSummary() {
  return useQuery({
    queryKey: ["ar-staleness-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_ar_staleness_summary")
        .select("*");
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** All pending hardship requests (used in admin/management views). */
export function useAllHardshipRequests(statusFilter?: string) {
  return useQuery<HardshipRequest[]>({
    queryKey: ["hardship-requests-all", statusFilter ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("hardship_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as HardshipRequest[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ========================
// CONTROLLER AR MANAGEMENT HOOKS
// ========================

export function useControllerBucketAging() {
  return useQuery({
    queryKey: ["controller-bucket-aging"],
    queryFn: async () => fetchAllRows<any>("v_controller_bucket_ar_aging", { orderBy: "snapshot_date", ascending: false }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerMonthlyCollections() {
  return useQuery({
    queryKey: ["controller-monthly-collections"],
    queryFn: async () => fetchAllRows<any>("v_controller_monthly_collections"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerCollectorMonthly() {
  return useQuery({
    queryKey: ["controller-collector-monthly"],
    queryFn: async () => fetchAllRows<any>("v_controller_collector_monthly"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerDelinquentExposure() {
  return useQuery({
    queryKey: ["controller-delinquent-exposure"],
    queryFn: async () => fetchAllRows<any>("v_controller_delinquent_exposure"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerAutopayForecast() {
  return useQuery({
    queryKey: ["controller-autopay-forecast"],
    queryFn: async () => fetchAllRows<any>("v_controller_autopay_forecast"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerSnapshotDelta() {
  return useQuery({
    queryKey: ["controller-snapshot-delta"],
    queryFn: async () => fetchAllRows<any>("v_controller_ar_snapshot_delta", { orderBy: "snapshot_date", ascending: false }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerInstallmentRate() {
  return useQuery({
    queryKey: ["controller-installment-rate"],
    queryFn: async () => fetchAllRows<any>("v_controller_installment_rate"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerBucketCollections() {
  return useQuery({
    queryKey: ["controller-bucket-collections"],
    queryFn: async () => fetchAllRows<any>("v_controller_bucket_collections"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerBucketContracts() {
  return useQuery({
    queryKey: ["controller-bucket-contracts"],
    queryFn: async () => fetchAllRows<any>("v_controller_bucket_contracts"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerInstallmentCompletion() {
  return useQuery({
    queryKey: ["controller-installment-completion"],
    queryFn: async () => fetchAllRows<any>("v_controller_installment_completion"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerInstallmentMaturity() {
  return useQuery({
    queryKey: ["controller-installment-maturity"],
    queryFn: async () => fetchAllRows<any>("v_controller_installment_maturity"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerInstallmentGap() {
  return useQuery({
    queryKey: ["controller-installment-gap"],
    queryFn: async () => fetchAllRows<any>("v_controller_installment_gap"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerInstallmentTiers() {
  return useQuery({
    queryKey: ["controller-installment-tiers"],
    queryFn: async () => fetchAllRows<any>("v_controller_installment_tiers"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerAutomationClients() {
  return useQuery({
    queryKey: ["controller-automation-clients"],
    queryFn: async () => fetchAllRows<any>("v_controller_automation_clients"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerAutomationSummary() {
  return useQuery({
    queryKey: ["controller-automation-summary"],
    queryFn: async () => fetchAllRows<any>("v_controller_automation_summary"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerGrowthVsCollections() {
  return useQuery({
    queryKey: ["controller-growth-vs-collections"],
    queryFn: async () => fetchAllRows<any>("v_controller_growth_vs_collections"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerTrueExposure() {
  return useQuery({
    queryKey: ["controller-true-exposure"],
    queryFn: async () => {
      const rows = await fetchAllRows<any>("v_controller_true_ar_exposure");
      return rows[0] || null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerARCashflow() {
  return useQuery({
    queryKey: ["controller-ar-cashflow"],
    queryFn: async () => fetchAllRows<any>("v_controller_ar_cashflow"),
    staleTime: 5 * 60 * 1000,
  });
}

// Live AR right now: latest MyCase snapshot baseline net of LawPay payments since (de-duplicated).
// Single-row view; caller reads [0].
export function useARLiveMovement() {
  return useQuery({
    queryKey: ["ar-live-movement"],
    queryFn: async () => fetchAllRows<any>("v_ar_live_movement"),
    staleTime: 5 * 60 * 1000,
  });
}

// Daily-stamped AR trend log (one row per day, written by the ar-live-trend-daily cron).
export function useARLiveTrend() {
  return useQuery({
    queryKey: ["ar-live-trend"],
    queryFn: async () => fetchAllRows<any>("ar_live_trend"),
    staleTime: 5 * 60 * 1000,
  });
}

// ========================
// EXECUTIVE INSIGHTS HERO BAND (2026-10-13)
// ========================
// One VP-certified view per tile, aggregated server-side. Drift, Case Mix and AR at Risk read
// hourly caches (refresh_exec_insights_cache; refreshed_at shown on the tile) because the live
// logic timed out under a full Admin page load. Each hook THROWS on error so its tile gets its
// own error/retry state; a slow or failed tile never blanks the rest of the band.

/** v_exec_collected_split_monthly — GRAIN: one row per month. Firm cash actually collected
 *  (canonical ledger), split clients vs non-clients (consult fees). nonclient/client are null
 *  before 2026-02 (no consult ledger) — display a dash, never 0. */
export interface ExecCollectedMonth {
  month: string; // yyyy-MM-dd (1st of month)
  total_collected: number;
  completed_amount: number;
  offline_amount: number;
  payment_count: number;
  total_mtd_comparable: number;
  mtd_cutoff_day: number;
  nonclient_consult_cash: number | null;
  nonclient_consult_payments: number | null;
  client_collected: number | null;
  consult_source_status: string | null;
  ledger_through: string | null;
  consult_through: string | null;
  is_current_month: boolean;
}

const numOrNull = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v));

export function useExecCollectedSplitMonthly() {
  return useQuery<ExecCollectedMonth[]>({
    queryKey: ["exec-collected-split-monthly"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("v_exec_collected_split_monthly")
        .select(
          "month, total_collected, completed_amount, offline_amount, payment_count, total_mtd_comparable, mtd_cutoff_day, nonclient_consult_cash, nonclient_consult_payments, client_collected, consult_source_status, ledger_through, consult_through, is_current_month",
        )
        .order("month");
      if (error) throw error;
      return ((data ?? []) as any[]).map((r) => ({
        ...r,
        total_collected: Number(r.total_collected) || 0,
        completed_amount: Number(r.completed_amount) || 0,
        offline_amount: Number(r.offline_amount) || 0,
        payment_count: Number(r.payment_count) || 0,
        total_mtd_comparable: Number(r.total_mtd_comparable) || 0,
        mtd_cutoff_day: Number(r.mtd_cutoff_day) || 0,
        nonclient_consult_cash: numOrNull(r.nonclient_consult_cash),
        nonclient_consult_payments: numOrNull(r.nonclient_consult_payments),
        client_collected: numOrNull(r.client_collected),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** v_exec_client_bucket_drift (hourly cache) — GRAIN: one row per (month, from_ord, to_ord).
 *  CLIENT-grain counts of clients whose worst MyCase aging bucket moved between the snapshot
 *  on/before the 1st (within 31 days) and the latest snapshot in the month. ord -1 = not on that
 *  snapshot's book. */
export type ExecDriftMovement = "worse" | "recovered" | "same" | "new" | "left";
export interface ExecDriftCell {
  month: string;
  base_snapshot_date: string;
  end_snapshot_date: string;
  window_days: number | null;
  from_ord: number;
  to_ord: number;
  from_bucket: string | null;
  to_bucket: string | null;
  movement: ExecDriftMovement;
  clients: number;
  base_balance: number;
  end_balance: number;
  refreshed_at: string | null;
}

export function useExecClientBucketDrift() {
  return useQuery<ExecDriftCell[]>({
    queryKey: ["exec-client-bucket-drift"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("v_exec_client_bucket_drift")
        .select("month, base_snapshot_date, end_snapshot_date, window_days, from_ord, to_ord, from_bucket, to_bucket, movement, clients, base_balance, end_balance, refreshed_at")
        .order("month")
        .order("from_ord")
        .order("to_ord");
      if (error) throw error;
      return ((data ?? []) as any[]).map((r) => ({
        ...r,
        window_days: numOrNull(r.window_days),
        from_ord: Number(r.from_ord),
        to_ord: Number(r.to_ord),
        clients: Number(r.clients) || 0,
        base_balance: Number(r.base_balance) || 0,
        end_balance: Number(r.end_balance) || 0,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** v_exec_case_mix_monthly (hourly cache) — GRAIN: one row per (month, reporting_family).
 *  Revenue cases opened in the month (invoiced > 0) and the contract value they bring.
 *  cases_loaded_through / invoices_synced_at = MyCase feed freshness (a month past it is
 *  partial, not a collapse); refreshed_at = cache build time. */
export interface ExecCaseMixRow {
  month: string;
  reporting_family: string;
  family_sort: number;
  revenue_cases: number;
  contract_value: number;
  avg_per_case: number;
  cases_loaded_through: string | null;
  invoices_synced_at: string | null;
  refreshed_at: string | null;
  /** Cash columns (VP 2026-10-16, ddl 3ad778e9): settled operating money on the case's own invoices
   *  (digits-only invoice key -> MyCase transaction report). At signing = open_date - 3 .. + 7 days.
   *  Bounced eChecks are kept OUT of paid (rejected_at_signing); failed/pending never count as cash. */
  paid_at_signing: number;
  collected_to_date: number;
  cases_with_cash: number;
  pending_at_signing: number;
  failed_at_signing: number;
  rejected_at_signing: number;
  /** Cases that had their own invoice by open_date + 7 -- Jan/Feb 2026 invoices were re-issued in April,
   *  so at-signing cash cannot be measured there; the tile caveats it instead of showing a false $0. */
  cases_invoiced_at_signing: number;
  payments_through: string | null;
  /** Jeff 2026-10-16: "if there is no cash to account for lets not count that as a service sold its just
   *  an invoice that has to be deleted". sold = settled or pending money on the case; unfunded = no money
   *  and a week of payment data has passed (invoice to delete); awaiting = no money yet, opened in the last week.
   *  sold + unfunded + awaiting = revenue_cases / contract_value. Null when the columns are not deployed. */
  sold_cases: number | null;
  sold_contract_value: number | null;
  unfunded_cases: number | null;
  unfunded_contract_value: number | null;
  /** Jeff 2026-10-16 "put failed and bounced on a separate call list first": no money in, but the client
   *  tried (failed down payment / bounced eCheck) -> call before deleting. Not counted as sold. */
  call_first_cases: number | null;
  call_first_contract_value: number | null;
  awaiting_cases: number | null;
  awaiting_contract_value: number | null;
}

export function useExecCaseMixMonthly() {
  return useQuery<ExecCaseMixRow[]>({
    queryKey: ["exec-case-mix-monthly"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("v_exec_case_mix_monthly")
        .select("month, reporting_family, family_sort, revenue_cases, contract_value, avg_per_case, cases_loaded_through, invoices_synced_at, refreshed_at, paid_at_signing, collected_to_date, cases_with_cash, pending_at_signing, failed_at_signing, rejected_at_signing, cases_invoiced_at_signing, payments_through, sold_cases, sold_contract_value, unfunded_cases, unfunded_contract_value, call_first_cases, call_first_contract_value, awaiting_cases, awaiting_contract_value")
        .order("month")
        .order("contract_value", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as any[]).map((r) => ({
        ...r,
        family_sort: Number(r.family_sort) || 0,
        revenue_cases: Number(r.revenue_cases) || 0,
        contract_value: Number(r.contract_value) || 0,
        avg_per_case: Number(r.avg_per_case) || 0,
        paid_at_signing: Number(r.paid_at_signing) || 0,
        collected_to_date: Number(r.collected_to_date) || 0,
        cases_with_cash: Number(r.cases_with_cash) || 0,
        pending_at_signing: Number(r.pending_at_signing) || 0,
        failed_at_signing: Number(r.failed_at_signing) || 0,
        rejected_at_signing: Number(r.rejected_at_signing) || 0,
        cases_invoiced_at_signing: Number(r.cases_invoiced_at_signing) || 0,
        sold_cases: r.sold_cases == null ? null : Number(r.sold_cases),
        sold_contract_value: r.sold_contract_value == null ? null : Number(r.sold_contract_value),
        unfunded_cases: r.unfunded_cases == null ? null : Number(r.unfunded_cases),
        unfunded_contract_value: r.unfunded_contract_value == null ? null : Number(r.unfunded_contract_value),
        call_first_cases: r.call_first_cases == null ? null : Number(r.call_first_cases),
        call_first_contract_value: r.call_first_contract_value == null ? null : Number(r.call_first_contract_value),
        awaiting_cases: r.awaiting_cases == null ? null : Number(r.awaiting_cases),
        awaiting_contract_value: r.awaiting_contract_value == null ? null : Number(r.awaiting_contract_value),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** v_exec_ar_at_risk (hourly cache) — GRAIN: one row. INVOICE-CLOCK basis (Jeff 2026-10-13):
 *  ar_at_risk_60 = SUM(v_ar_invoice_clock.amount_due) where effective_aging_days > 60 on the active AR
 *  snapshot. invoices_at_risk_60 = invoice grain; clients_at_risk_60 = client grain (distinct client_id);
 *  ar_total ties to v_firm_financial_summary.ar_total. legacy_contract_dpd_at_risk_60 = the previous
 *  basis (ar_dashboard days_past_due > 60), shown only in the tooltip so the switch is visible. */
export interface ExecArAtRisk {
  ar_at_risk_60: number;
  ar_total: number;
  invoices_at_risk_60: number;
  clients_at_risk_60: number;
  unlinked_invoices_at_risk_60: number;
  invoices: number;
  snapshot_date: string | null;
  basis: string | null;
  legacy_contract_dpd_at_risk_60: number | null;
  refreshed_at: string | null;
}

export function useExecArAtRisk() {
  return useQuery<ExecArAtRisk | null>({
    queryKey: ["exec-ar-at-risk-clock"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("v_exec_ar_at_risk")
        .select(
          "ar_at_risk_60, ar_total, invoices_at_risk_60, clients_at_risk_60, unlinked_invoices_at_risk_60, invoices, snapshot_date, basis, legacy_contract_dpd_at_risk_60, refreshed_at",
        )
        .limit(1);
      if (error) throw error;
      const r = (data ?? [])[0];
      if (!r) return null;
      return {
        ...r,
        ar_at_risk_60: Number(r.ar_at_risk_60) || 0,
        ar_total: Number(r.ar_total) || 0,
        invoices_at_risk_60: Number(r.invoices_at_risk_60) || 0,
        clients_at_risk_60: Number(r.clients_at_risk_60) || 0,
        unlinked_invoices_at_risk_60: Number(r.unlinked_invoices_at_risk_60) || 0,
        invoices: Number(r.invoices) || 0,
        legacy_contract_dpd_at_risk_60: numOrNull(r.legacy_contract_dpd_at_risk_60),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}



// ========================
// EXECUTIVE INSIGHTS — COLLECTOR ACTIVITY (2026-10-13)
// ========================
/** v_exec_collector_activity_monthly — GRAIN: one row per (calendar month, collector); ACTIVITY-grain counts
 *  (non-junk). Replaces paging every collection_activities row for 6 months into the browser. Month is the
 *  calendar month of activity_date (the old browser code counted every activity dated the 1st in the previous
 *  month). is_system_actor = System-* (autopay/system postings, not human collector work). VP cert 6b600cd2. */
export interface ExecCollectorActivityRow {
  month: string;
  collector: string;
  activities: number;
  minutes: number;
  payments: number;
  commission: number;
  failed: number;
  is_system_actor: boolean;
}

export function useExecCollectorActivityMonthly(month: string) {
  return useQuery<ExecCollectorActivityRow[]>({
    queryKey: ["exec-collector-activity-monthly", month],
    enabled: !!month,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("v_exec_collector_activity_monthly")
        .select("month, collector, activities, minutes, payments, commission, failed, is_system_actor")
        .eq("month", `${month}-01`);
      if (error) throw error;
      return ((data ?? []) as any[]).map((r) => ({
        ...r,
        activities: Number(r.activities) || 0,
        minutes: Number(r.minutes) || 0,
        payments: Number(r.payments) || 0,
        commission: Number(r.commission) || 0,
        failed: Number(r.failed) || 0,
        is_system_actor: Boolean(r.is_system_actor),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** The 10 most recent FAILED-outcome activities in a month (same outcome rule as the view's `failed`:
 *  failed / refund / disputed / disconnected / no collection; non-junk), fetched server-side. */
export const FAILED_OUTCOME_PATTERNS = ["failed", "refund", "disputed", "disconnected", "no collection"] as const;

export function useExecFailedActivities(month: string) {
  return useQuery<any[]>({
    queryKey: ["exec-failed-activities", month],
    enabled: !!month,
    queryFn: async () => {
      const [y, m] = month.split("-").map(Number);
      const from = format(new Date(y, m - 1, 1), "yyyy-MM-dd");
      const to = format(new Date(y, m, 1), "yyyy-MM-dd");
      const { data, error } = await (supabase as any)
        .from("collection_activities")
        .select("id, activity_date, client_name, collector, outcome, collected_amount")
        .gte("activity_date", from)
        .lt("activity_date", to)
        .not("is_junk", "is", true)
        .or(FAILED_OUTCOME_PATTERNS.map((p) => `outcome.ilike.*${p}*`).join(","))
        .order("activity_date", { ascending: false })
        .order("id", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ========================
// CLIENT LOOKUP + PROMISE-TO-PAY — targeted fetches (2026-10-13)
// ========================
// The Client Lookup page used to preload the whole AR book, every payment (23 pages), every immigration
// case (12) and every milestone before it could show one client; the Promise-to-Pay tab paged every
// collection_activities row (45) and every payment (23) to find a handful of promises. These hooks fetch
// only what the screen shows, with the SAME matching rules as before.

/** Escape LIKE/ILIKE wildcards so a name is matched literally. */
const likeLiteral = (s: string) => s.replace(/[\%_]/g, (m) => "\\" + m);

/** One ar_dashboard contract (the Client Lookup profile), mapped exactly like useMergedClients. */
export function useArDashboardContract(contractId: string | null) {
  return useQuery<Client | null>({
    queryKey: ["ar-dashboard-contract", contractId],
    enabled: !!contractId,
    queryFn: async () => {
      // .order("contract_id") is load-bearing: without it the planner picks a slow plan for this view
      // (5-6.6 s for ONE row); with it ~0.3 s. Measured 2026-10-13.
      const { data, error } = await (supabase as any)
        .from("ar_dashboard")
        .select("*")
        .eq("contract_id", contractId)
        .order("contract_id");
      if (error) throw error;
      const row = (data ?? [])[0];
      return row ? mapArDashboardRow(row) : null;
    },
    staleTime: 5 * 60 * 1000,
  });
}


/** One client's immigration cases, same rule as before: case_number equals the client's case number, OR the
 *  case has no client_id and its notes name ("Filevine: <name>") equals the client name. */
export function useClientImmigrationCases(caseNumber: string | null | undefined, clientName: string | null | undefined) {
  const cn = (caseNumber || "").trim();
  const name = (clientName || "").trim();
  return useQuery<any[]>({
    queryKey: ["client-immigration-cases", cn, name.toLowerCase()],
    enabled: !!cn || !!name,
    queryFn: async () => {
      const reqs: Promise<any>[] = [];
      if (cn) reqs.push((supabase as any).from("immigration_cases").select("*").eq("case_number", cn));
      if (name) reqs.push((supabase as any).from("immigration_cases").select("*").is("client_id", null).ilike("notes", `%${likeLiteral(name)}%`));
      const results = await Promise.all(reqs);
      const lname = name.toLowerCase();
      const seen = new Set<string>();
      const out: any[] = [];
      results.forEach((r, i) => {
        if (r.error) throw r.error;
        const byName = cn ? i === 1 : true;
        for (const ic of r.data ?? []) {
          if (seen.has(ic.id)) continue;
          if (byName && extractClientNameFromNotes(ic.notes).toLowerCase().trim() !== lname) continue;
          seen.add(ic.id);
          out.push(ic);
        }
      });
      return out;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Milestones for a set of immigration cases (newest first). */
export function useCaseMilestonesFor(caseIds: string[]) {
  const ids = [...caseIds].sort();
  return useQuery<any[]>({
    queryKey: ["case-milestones-for", ids.join(",")],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("case_milestones").select("*").in("immigration_case_id", ids);
      if (error) throw error;
      return (data ?? []).sort((a: any, b: any) => (b.milestone_date || "").localeCompare(a.milestone_date || ""));
    },
    staleTime: 5 * 60 * 1000,
  });
}



// ========================
// CLIENT MASTER SEARCH + PROFILE SOURCES (2026-10-13)
// ========================
// Jeff: "can I use the search bar to look up clients now? please be sure that the front end is feeding from the
// supabase tables that carries all client info". Search covers the CLIENT MASTER (every canonical client + every
// open AR contract with no client), not only the open AR book; the profile reads the certified cash ledger and shows
// each feed's freshness.

export type ClientMasterStatus =
  | "open_ar" | "open_ar_unlinked" | "paid_off" | "closed" | "consult_only" | "no_open_ar" | "excluded";

export const CLIENT_STATUS_LABEL: Record<ClientMasterStatus, string> = {
  open_ar: "Open AR",
  open_ar_unlinked: "Open AR · no client link",
  paid_off: "Has paid · no open AR",
  closed: "Closed",
  consult_only: "Consult only",
  no_open_ar: "No open AR",
  excluded: "Excluded (test)",
};

/** One search hit / client card from mv_client_master_search (CLIENT grain; unlinked AR contracts are their own rows). */
export interface ClientMasterRow {
  rowKey: string;
  clientId: string | null;
  name: string;
  email: string;
  phone: string;
  caseNumber: string;
  qualityStatus: string | null;
  collector: string | null;
  openAr: number;
  openContracts: number;
  bestContractId: string | null;
  ledgerPayments: number;
  lastPaymentDate: string | null;
  mycaseCases: number;
  latestCaseStage: string | null;
  status: ClientMasterStatus;
  offDial: boolean;
  /** "dnc_decline" (client-keyed do-not-call) or "queue_exclusion_name_key" (name match; display only). */
  offDialSource: string | null;
  matchField?: string;
  refreshedAt?: string | null;
}

const toClientMasterRow = (r: any): ClientMasterRow => ({
  rowKey: r.row_key,
  clientId: r.client_id ?? null,
  name: r.display_name || "Unknown",
  email: r.email || "",
  phone: r.phone || "",
  caseNumber: r.case_number || "",
  qualityStatus: r.quality_status ?? null,
  collector: r.collector ?? null,
  openAr: Number(r.open_ar) || 0,
  openContracts: Number(r.open_contracts) || 0,
  bestContractId: r.best_contract_id ?? null,
  ledgerPayments: Number(r.ledger_payments) || 0,
  lastPaymentDate: r.last_payment_date ?? null,
  mycaseCases: Number(r.mycase_cases) || 0,
  latestCaseStage: r.latest_case_stage ?? null,
  status: (r.status_key || "no_open_ar") as ClientMasterStatus,
  offDial: Boolean(r.off_dial),
  offDialSource: r.off_dial_source ?? null,
  matchField: r.match_field,
  refreshedAt: r.refreshed_at ?? null,
});

/** Server-side client-master search (public.search_clients: active users, >= 2 chars, max 20). Pass a debounced term. */
export function useClientMasterSearch(term: string) {
  const q = term.trim();
  return useQuery<ClientMasterRow[]>({
    queryKey: ["client-master-search", q.toLowerCase()],
    enabled: q.length >= 2,
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("search_clients", { p_term: q, p_limit: 20 });
      if (error) throw error;
      return ((data ?? []) as any[]).map(toClientMasterRow);
    },
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

/** One client card (status badge, open AR, best open contract) by canonical or merged-duplicate client id. */
export function useClientMasterCard(clientId: string | null | undefined) {
  return useQuery<ClientMasterRow | null>({
    queryKey: ["client-master-card", clientId ?? null],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("client_master_card", { p_client_id: clientId });
      if (error) throw error;
      const r = (data ?? [])[0];
      return r ? toClientMasterRow(r) : null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Payments from the CERTIFIED cash ledger (v_financial_ledger_canonical: MyCase Completed + Offline, plain history +
 *  rich feed; ties to bank/QBO) by client_id, plus ledger rows with no client_id on the client's own MyCase invoice
 *  numbers. Newest first. Replaces payments_clean (LawPay-matched contract payments only). */
export interface LedgerPayment {
  id: string;
  date: string;
  amount: number;
  status: string;
  method: string;
  invoiceNumber: string | null;
  enteredBy: string | null;
}

export function useClientLedger(clientId: string | null | undefined, invoiceNumbers: string[] = []) {
  // 2026-10-14: the ledger's invoice_number is the rich feed's "#1234567"; mycase_invoices hands us "1234567". The old
  // exact .in() never matched, so every no-client ledger row on a client's own invoice was missing from the profile
  // (1,595 rows / $1,688,968.42 across 1,030 clients on 10-14). Query both spellings of the digits-only key.
  const invs = invoiceNumberSpellings(invoiceNumbers);
  return useQuery<LedgerPayment[]>({
    queryKey: ["client-ledger", clientId ?? null, invs.join(",")],
    enabled: !!clientId || invs.length > 0,
    queryFn: async () => {
      const cols = "txn_id, payment_date, amount, status, method, invoice_number, entered_by, client_id";
      const reqs: Promise<any>[] = [];
      if (clientId) reqs.push((supabase as any).from("v_financial_ledger_canonical").select(cols).eq("client_id", clientId));
      if (invs.length > 0) reqs.push((supabase as any).from("v_financial_ledger_canonical").select(cols).is("client_id", null).in("invoice_number", invs));
      const results = await Promise.all(reqs);
      const seen = new Set<string>();
      const out: LedgerPayment[] = [];
      for (const r of results) {
        if (r.error) throw r.error;
        for (const t of r.data ?? []) {
          const id = String(t.txn_id);
          if (seen.has(id)) continue;
          seen.add(id);
          out.push({
            id,
            date: t.payment_date,
            amount: Number(t.amount) || 0,
            status: t.status || "",
            method: t.method || "",
            invoiceNumber: t.invoice_number ?? null,
            enteredBy: t.entered_by ?? null,
          });
        }
      }
      return out.sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.id.localeCompare(a.id));
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Feed freshness for "data as of" labels: v_feed_freshness (one row per source feed, certified), the active AR
 *  snapshot date, and the collector-activity feed's latest date. */
export interface FeedFreshness {
  feed: string;
  sourceTable: string;
  asOf: string | null;
  ageDays: number | null;
  status: string;
  isRed: boolean;
}

export function useFeedFreshness() {
  return useQuery({
    queryKey: ["feed-freshness"],
    queryFn: async () => {
      const [ff, ar, act] = await Promise.all([
        (supabase as any).from("v_feed_freshness").select("feed, source_table, max_as_of, age_days, status, is_red"),
        (supabase as any).from("v_ar_active_snapshot").select("snapshot_date").limit(1),
        (supabase as any).from("v_activity_feed_health").select("latest_activity_date, feed_age_days, feed_status").limit(1),
      ]);
      const feeds: Record<string, FeedFreshness> = {};
      for (const r of ff.data ?? []) {
        feeds[r.feed] = {
          feed: r.feed,
          sourceTable: r.source_table,
          asOf: r.max_as_of ?? null,
          ageDays: r.age_days == null ? null : Number(r.age_days),
          status: r.status || "",
          isRed: Boolean(r.is_red),
        };
      }
      const a = (act.data ?? [])[0];
      return {
        feeds,
        arSnapshotDate: ((ar.data ?? [])[0]?.snapshot_date as string | undefined) ?? null,
        activity: a
          ? { asOf: (a.latest_activity_date as string | null) ?? null, ageDays: a.feed_age_days == null ? null : Number(a.feed_age_days), status: String(a.feed_status || "") }
          : null,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Certified promise tracker (v_promise_to_pay_tracker): OPEN promises from outbound calls with an "agreement" outcome
 *  in the last 30 days, one row per client NAME (the promise is a collector-typed name; AR is matched by client_id),
 *  dropped once the client pays after promising. Explicit columns (never select * on client views). */
export interface PromiseTrackerRow {
  collector: string | null;
  clientName: string;
  ptpDate: string | null;
  promiseDate: string | null;
  windowHint: string | null;
  status: string;
  daysUntilDue: number | null;
  liveAr: number | null;
  agingBucket: string | null;
  arLinkStatus: string | null;
  lastPaymentDate: string | null;
  lastPaymentAmount: number | null;
  lastCallDate: string | null;
  lastCallBy: string | null;
  clientId: string | null;
}

export function usePromiseTracker() {
  return useQuery<PromiseTrackerRow[]>({
    queryKey: ["promise-tracker"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("v_promise_to_pay_tracker")
        .select("promised_to_collector, client_name, ptp_date, promise_date, window_hint, ptp_status, days_until_due, live_ar, aging_bucket, ar_link_status, last_payment_date, last_payment_amount, last_call_date, last_call_by, client_id");
      if (error) throw error;
      return ((data ?? []) as any[]).map((r) => ({
        collector: r.promised_to_collector ?? null,
        clientName: r.client_name || "—",
        ptpDate: r.ptp_date ?? null,
        promiseDate: r.promise_date ?? null,
        windowHint: r.window_hint ?? null,
        status: r.ptp_status,
        daysUntilDue: r.days_until_due == null ? null : Number(r.days_until_due),
        liveAr: r.live_ar == null ? null : Number(r.live_ar),
        agingBucket: r.aging_bucket ?? null,
        arLinkStatus: r.ar_link_status ?? null,
        lastPaymentDate: r.last_payment_date ?? null,
        lastPaymentAmount: r.last_payment_amount == null ? null : Number(r.last_payment_amount),
        lastCallDate: r.last_call_date ?? null,
        lastCallBy: r.last_call_by ?? null,
        clientId: r.client_id ?? null,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Delinquent Collections KEY METRIC (Jeff 2026-10-14). Cached rows of delinquent_collections_metrics()
 *  over the delinquent-cash spine: MTD (cut at the ledger's complete-through day), the same day range of
 *  the prior month, and monthly + weekly trend. Cash = transaction grain; payers = client grain.
 *  No fallback figures: if the view cannot be read the panel says so instead of showing a number. */
export function useDelinquentCollectionsKpi() {
  return useQuery<DcmKpiRow[]>({
    queryKey: ["delinquent-collections-kpi"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("v_delinquent_collections_kpi")
        .select("*")
        .order("period_kind")
        .order("period_start");
      if (error) throw error;
      return ((data as Record<string, unknown>[]) ?? []).map(normalizeDcmRow);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** New payment plans first seen per plan-feed load (dcm.new_plan_seen.v2) — newest first. Dated by feed load. */
export function useDelinquentCollectionsPlanLoads(limit = 4) {
  return useQuery<DcmPlanLoadRow[]>({
    queryKey: ["delinquent-collections-plan-loads", limit],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("v_delinquent_collections_plan_loads")
        .select("*")
        .order("load_as_of", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return ((data as Record<string, unknown>[]) ?? []).map(normalizePlanLoadRow);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Certification status of the delinquent-cash spine + KPI objects, from ar_object_basis_registry.
 *  The registry is RLS-protected; when it returns nothing (blocked / loading) the result is the
 *  conservative "derived" status, so the panel never claims a certification it cannot see. */
export function useDelinquentCollectionsBasis() {
  const objects = ["mv_delinquent_cash_txn", "v_delinquent_collections_kpi"];
  return useQuery<{ certified: boolean; statuses: Record<string, string> }>({
    queryKey: ["delinquent-collections-basis"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("ar_object_basis_registry")
        .select("object_name, status")
        .in("object_name", objects);
      const statuses: Record<string, string> = {};
      for (const r of (data as { object_name: string; status: string }[]) ?? []) statuses[r.object_name] = r.status;
      return { certified: objects.every((o) => statuses[o] === "certified"), statuses };
    },
    staleTime: 5 * 60 * 1000,
  });
}
