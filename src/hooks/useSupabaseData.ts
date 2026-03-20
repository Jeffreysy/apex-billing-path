import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Client, Payment, CallLog, Collector, CaseStage } from "@/data/mockData";
import { format, subDays, addWeeks, addMonths } from "date-fns";

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

// --- Data fetching hooks ---

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
      const [paymentsRes, clientsRes] = await Promise.all([
        supabase.from("payments").select("*").order("payment_date", { ascending: false }).limit(1000),
        supabase.from("clients").select("id, name").range(0, 4999),
      ]);
      if (paymentsRes.error) throw paymentsRes.error;
      if (clientsRes.error) throw clientsRes.error;

      const clientsMap = new Map((clientsRes.data || []).map(c => [c.id, c.name]));

      return (paymentsRes.data || []).map((p): Payment => ({
        id: p.id,
        clientId: p.client_id || "",
        clientName: p.client_id ? (clientsMap.get(p.client_id) || "Unknown") : "Unknown",
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

export function useCollectionActivities() {
  return useQuery({
    queryKey: ["collection-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collection_activities")
        .select("*")
        .order("activity_date", { ascending: false })
        .limit(1000);
      if (error) throw error;

      return (data || []).map((a): CallLog => ({
        id: a.id,
        clientId: "",
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

export function useCollectors() {
  return useQuery({
    queryKey: ["collectors-aggregated"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_performance")
        .select("*");
      if (error) throw error;

      const collectorMap = new Map<string, { totalCollected: number; callsMade: number; paymentsTaken: number }>();
      for (const row of data || []) {
        if (!row.collector || row.collector === "0" || row.collector === "System-Auto") continue;
        const existing = collectorMap.get(row.collector) || { totalCollected: 0, callsMade: 0, paymentsTaken: 0 };
        existing.totalCollected += Number(row.total_collected) || 0;
        existing.callsMade += row.collected_calls || 0;
        existing.paymentsTaken += row.collected_calls || 0;
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
          callsMade: stats.callsMade,
          paymentsTaken: stats.paymentsTaken,
          isLead: i === 0,
        });
        i++;
      }
      return collectors;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCollectionsByAging() {
  return useQuery({
    queryKey: ["collections-by-aging"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections_by_aging")
        .select("*")
        .order("week_start", { ascending: true })
        .limit(52);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCollectorPerformance() {
  return useQuery({
    queryKey: ["collector-performance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collector_performance")
        .select("*")
        .order("month", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
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

export function useImmigrationCases() {
  return useQuery({
    queryKey: ["immigration-cases"],
    queryFn: async () => {
      // Paginate to fetch all cases (Supabase max 1000 per request)
      const allData: any[] = [];
      const pageSize = 1000;
      let from = 0;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabase
          .from("immigration_cases")
          .select("*")
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (data && data.length > 0) {
          allData.push(...data);
          from += pageSize;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }
      return allData;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCaseMilestones() {
  return useQuery({
    queryKey: ["case-milestones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_milestones")
        .select("*")
        .range(0, 4999);
      if (error) throw error;
      return data || [];
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

export function computeWeeklyCollections(agingData: { week_start: string | null; total_collected: number | null }[]) {
  return agingData
    .filter(d => d.week_start && d.total_collected)
    .map(d => ({
      week: format(new Date(d.week_start!), "MMM dd"),
      collected: Math.round(Number(d.total_collected) || 0),
      target: 80000,
    }))
    .slice(-12);
}

export function computeMonthlyCollections(agingData: { month_start: string | null; total_collected: number | null }[]) {
  const monthMap = new Map<string, number>();
  for (const d of agingData) {
    if (!d.month_start) continue;
    const key = format(new Date(d.month_start), "MMM yyyy");
    monthMap.set(key, (monthMap.get(key) || 0) + (Number(d.total_collected) || 0));
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

export function computeWeeklyPastCollections(agingData: { week_start: string | null; total_collected: number | null }[]) {
  return agingData
    .filter(d => d.week_start && Number(d.total_collected) > 0)
    .map(d => {
      const total = Math.round(Number(d.total_collected) || 0);
      const collector = Math.round(total * 0.65);
      const crm = total - collector;
      return {
        week: format(new Date(d.week_start!), "MMM dd"),
        collector,
        crm,
        total,
      };
    })
    .slice(-12);
}

export function computeMonthlyPastCollections(agingData: { month_start: string | null; total_collected: number | null }[]) {
  const monthMap = new Map<string, number>();
  for (const d of agingData) {
    if (!d.month_start) continue;
    const key = format(new Date(d.month_start), "MMM yyyy");
    monthMap.set(key, (monthMap.get(key) || 0) + (Number(d.total_collected) || 0));
  }
  return Array.from(monthMap, ([month, total]) => ({
    month,
    collector: Math.round(total * 0.65),
    crm: Math.round(total * 0.35),
    total: Math.round(total),
  })).slice(-6);
}
