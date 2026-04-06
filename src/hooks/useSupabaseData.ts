import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Client, Payment, CallLog, Collector, CaseStage } from "@/data/mockData";
import { format, subDays, addWeeks, addMonths, startOfWeek } from "date-fns";

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
    staleTime: 5 * 60 * 1000,
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

// ========================
// TABLE-BASED HOOKS (kept for components that still need them)
// ========================

export function useMergedClients() {
  return useQuery({
    queryKey: ["merged-clients"],
    queryFn: async () => {
      const [contractsRes, clientsRes] = await Promise.all([
        supabase.from("contracts").select("*").range(0, 4999),
        supabase.from("clients").select("*").range(0, 4999),
      ]);
      if (contractsRes.error) throw contractsRes.error;
      if (clientsRes.error) throw clientsRes.error;

      const clientsById = new Map((clientsRes.data || []).map(c => [c.id, c]));
      const clientsByName = new Map((clientsRes.data || []).map(c => [c.name?.toLowerCase().trim(), c]));

      return (contractsRes.data || []).map((contract): Client => {
        const client = contract.client_id
          ? clientsById.get(contract.client_id)
          : clientsByName.get(contract.client?.toLowerCase().trim());

        const totalOwed = Number(contract.value) || 0;
        const totalPaid = Number(contract.collected) || 0;
        const downPayment = Number(contract.down_payment) || 0;
        const monthlyPayment = Number(contract.monthly_installment) || 0;
        const installmentMonths = contract.total_installments || 18;
        const daysAging = contract.days_out || 0;

        return {
          id: contract.id,
          name: contract.client || client?.name || "Unknown",
          email: client?.email || "",
          phone: contract.phone || client?.phone || "",
          contractStart: contract.start_date || "",
          contractEnd: contract.maturity_date || "",
          totalOwed,
          totalPaid,
          monthlyPayment,
          downPayment,
          installmentMonths,
          status: mapStatus(contract.status, contract.delinquency_status),
          assignedCollector: contract.collector || client?.assigned_collector || "",
          lastContact: "",
          nextPaymentDue: contract.next_due_date || client?.next_payment_date || "",
          caseNumber: contract.case_number || client?.client_number || "",
          caseType: contract.practice_area || client?.practice_area || "",
          caseStage: mapCaseStage(client?.case_stage),
          daysAging,
          tags: [],
          notes: [],
          retainerDate: contract.start_date || "",
          downPaymentPaid: contract.down_payment_paid || false,
          filevineId: client?.filevine_project_id || undefined,
          mycaseId: client?.mycase_id ? Number(client.mycase_id) : undefined,
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
  const start = monthStart || format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");
  return useQuery({
    queryKey: ["collection-activities", start],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collection_activities")
        .select("*")
        .gte("activity_date", start)
        .order("activity_date", { ascending: false })
        .limit(5000);
      if (error) throw error;

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

/** 6. Collectors — from collector_performance view, current month only */
export function useCollectors(monthStart?: string) {
  const start = monthStart || format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");
  return useQuery({
    queryKey: ["collectors-aggregated", start],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("collector_performance")
        .select("*")
        .gte("month", start);
      if (error) throw error;

      const knownCollectors = new Set(["Alejandro A", "Patricio D", "Maritza V"]);
      const collectorMap = new Map<string, { totalCollected: number; totalCommission: number; callsMade: number; paymentsTaken: number }>();

      for (const row of (rows || [])) {
        if (!row.collector || !knownCollectors.has(row.collector)) continue;
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

export function computeTransactionsByType(payments: Payment[], clients: Client[]) {
  const downPaymentTotal = clients.filter(c => c.downPaymentPaid).reduce((s, c) => s + c.downPayment, 0);
  const completed = payments.filter(p => p.status === "completed");
  const totalCompleted = completed.reduce((s, p) => s + p.amount, 0);

  return [
    { type: "down_payment" as const, label: "Down Payment", total: Math.round(downPaymentTotal), count: clients.filter(c => c.downPaymentPaid).length },
    { type: "monthly_installment" as const, label: "Monthly Installment", total: Math.round(totalCompleted * 0.6), count: Math.floor(completed.length * 0.6) },
    { type: "consult_fee" as const, label: "Consult Fee", total: Math.round(totalCompleted * 0.12), count: Math.floor(completed.length * 0.1) },
    { type: "retainer_fee" as const, label: "Retainer Fee", total: Math.round(totalCompleted * 0.15), count: clients.filter(c => c.status !== "new").length },
    { type: "court_filing" as const, label: "Court Filing", total: Math.round(totalCompleted * 0.08), count: Math.floor(completed.length * 0.05) },
    { type: "settlement" as const, label: "Settlement", total: Math.round(totalCompleted * 0.05), count: clients.filter(c => c.caseStage === "settlement" || c.caseStage === "closed").length },
  ];
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

    const matured = clients.filter(c => c.status === "completed").length;
    const delinquent = clients.filter(c => c.status === "delinquent").length;

    months.push({ month: monthStr, started, matured: Math.floor(matured / 6), delinquent: Math.floor(delinquent / 6) });
  }
  return months;
}

export function computeForecastData(clients: Client[]) {
  const activeClients = clients.filter(c => c.status === "active" || c.status === "delinquent");
  const weeklyScheduled = activeClients.reduce((s, c) => s + c.monthlyPayment, 0) / 4;

  return Array.from({ length: 8 }, (_, i) => ({
    period: format(addWeeks(new Date(), i + 1), "MMM dd"),
    projected: Math.round(weeklyScheduled * (0.85 + Math.random() * 0.3)),
    pessimistic: Math.round(weeklyScheduled * 0.6),
    optimistic: Math.round(weeklyScheduled * 1.2),
  }));
}

export function computeMonthlyForecast(clients: Client[]) {
  const activeClients = clients.filter(c => c.status === "active" || c.status === "delinquent");
  const monthlyScheduled = activeClients.reduce((s, c) => s + c.monthlyPayment, 0);

  return Array.from({ length: 6 }, (_, i) => ({
    month: format(addMonths(new Date(), i + 1), "MMM yyyy"),
    projected: Math.round(monthlyScheduled * (0.85 + Math.random() * 0.3)),
    pessimistic: Math.round(monthlyScheduled * 0.6),
    optimistic: Math.round(monthlyScheduled * 1.2),
  }));
}

export function computeWeeklyCollections(payments: Payment[]) {
  const weekMap = new Map<string, number>();
  for (const p of payments) {
    if (!p.date) continue;
    const d = new Date(p.date);
    const ws = startOfWeek(d, { weekStartsOn: 1 });
    const key = format(ws, "MMM dd");
    weekMap.set(key, (weekMap.get(key) || 0) + p.amount);
  }
  return Array.from(weekMap, ([week, collected]) => ({
    week,
    collected: Math.round(collected),
    target: 80000,
  })).slice(-12);
}

export function computeMonthlyCollections(payments: Payment[]) {
  const monthMap = new Map<string, number>();
  for (const p of payments) {
    if (!p.date) continue;
    const d = new Date(p.date);
    const key = format(d, "MMM yyyy");
    monthMap.set(key, (monthMap.get(key) || 0) + p.amount);
  }
  return Array.from(monthMap, ([month, collected]) => ({
    month,
    collected: Math.round(collected),
    target: 300000,
  })).slice(-6);
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
