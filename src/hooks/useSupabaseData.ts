import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Client, Payment, CallLog, Collector, CaseStage } from "@/data/mockData";
import { format, subDays, addWeeks, addMonths, startOfWeek } from "date-fns";
import { ESCALATION_STATUSES, isEscalationUnresolved } from "@/lib/escalations";

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

// --- Paginated fetch helper ---
export async function fetchAllRows<T>(table: any, options?: { filter?: (q: any) => any; orderBy?: string; ascending?: boolean }): Promise<T[]> {
  const allData: T[] = [];
  const pageSize = 1000;
  let from = 0;
  let hasMore = true;
  while (hasMore) {
    let query = supabase.from(table).select("*").range(from, from + pageSize - 1);
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

/** 2. AR Dashboard view — for AR Portfolio tab */
export function useARDashboard() {
  return useQuery({
    queryKey: ["ar-dashboard"],
    queryFn: async () => {
      return fetchAllRows<any>("ar_dashboard");
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

/** 4. Payments Clean view — for transactions tab */
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

export function useMergedClients() {
  return useQuery({
    queryKey: ["merged-clients"],
    queryFn: async () => {
      const rawRows = await fetchAllRows<any>("ar_dashboard");
      // Exclude "Paid" contracts — these have bad remaining balances and aren't collectible
      const rows = rawRows.filter((r) => r.delinquency_status !== "Paid");

      return rows.map((row): Client => {
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
          tags: [],
          notes: [],
          retainerDate: row.start_date || "",
          downPaymentPaid: row.down_payment_paid || false,
          filevineId: undefined,
          mycaseId: undefined,
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

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
    queryKey: ["collection-activity-rows"],
    queryFn: async () => {
      return fetchAllRows<any>("collection_activities", {
        orderBy: "activity_date",
        ascending: false,
      });
    },
    staleTime: 5 * 60 * 1000,
  });
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

export function computeWeeklyCollections(payments: Payment[], weeklyTarget?: number) {
  const weekMap = new Map<string, number>();
  for (const p of payments) {
    if (!p.date) continue;
    const d = new Date(p.date);
    const ws = startOfWeek(d, { weekStartsOn: 1 });
    const key = format(ws, "MMM dd");
    weekMap.set(key, (weekMap.get(key) || 0) + p.amount);
  }
  const entries = Array.from(weekMap, ([week, collected]) => ({
    week,
    collected: Math.round(collected),
  })).slice(-12);
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
  const dayMap = new Map<string, { collector: number; crm: number }>();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  days.forEach(d => dayMap.set(d, { collector: 0, crm: 0 }));

  for (const p of payments) {
    if (!p.date) continue;
    const d = new Date(p.date);
    const dayOfWeek = d.getDay();
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek];
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
  const weekMap = new Map<string, { collector: number; crm: number }>();
  for (const p of payments) {
    if (!p.date) continue;
    const d = new Date(p.date);
    const ws = startOfWeek(d, { weekStartsOn: 1 });
    const key = format(ws, "MMM dd");
    const entry = weekMap.get(key) || { collector: 0, crm: 0 };
    if (p.collectorName && p.collectorName !== "CRM") {
      entry.collector += p.amount;
    } else {
      entry.crm += p.amount;
    }
    weekMap.set(key, entry);
  }
  return Array.from(weekMap, ([week, { collector, crm }]) => ({
    week,
    collector: Math.round(collector),
    crm: Math.round(crm),
    total: Math.round(collector + crm),
  })).slice(-12);
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
// CONTROLLER AR OVERSIGHT HOOKS
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

export function useControllerArchivedReview() {
  return useQuery({
    queryKey: ["controller-archived-review"],
    queryFn: async () => fetchAllRows<any>("v_controller_archived_review"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useControllerMonthlyTrend() {
  return useQuery({
    queryKey: ["controller-monthly-trend"],
    queryFn: async () => fetchAllRows<any>("v_controller_monthly_trend"),
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
