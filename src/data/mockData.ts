import { format, subDays, addDays, addWeeks, addMonths } from "date-fns";

export interface ClientNote {
  id: string;
  collectorId: string;
  collectorName: string;
  date: string;
  note: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  contractStart: string;
  contractEnd: string;
  totalOwed: number;
  totalPaid: number;
  monthlyPayment: number;
  downPayment: number;
  installmentMonths: number;
  status: "active" | "delinquent" | "completed" | "new";
  assignedCollector: string;
  lastContact: string;
  nextPaymentDue: string;
  caseNumber: string;
  caseType: string;
  daysAging: number;
  tags: string[];
  notes: ClientNote[];
}

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  method: "card" | "ach" | "check" | "cash";
  collectorId: string;
  collectorName: string;
  status: "completed" | "pending" | "failed";
}

export interface CallLog {
  id: string;
  clientId: string;
  clientName: string;
  collectorId: string;
  collectorName: string;
  date: string;
  duration: number; // seconds
  outcome: "payment_taken" | "promise_to_pay" | "no_answer" | "left_voicemail" | "callback_scheduled" | "disputed";
  notes: string;
}

export interface Collector {
  id: string;
  name: string;
  avatar: string;
  totalCollected: number;
  callsMade: number;
  paymentsTaken: number;
}

export const collectors: Collector[] = [
  { id: "c1", name: "Sarah Mitchell", avatar: "SM", totalCollected: 47850, callsMade: 342, paymentsTaken: 89 },
  { id: "c2", name: "James Rodriguez", avatar: "JR", totalCollected: 38200, callsMade: 298, paymentsTaken: 72 },
  { id: "c3", name: "Aisha Patel", avatar: "AP", totalCollected: 52100, callsMade: 410, paymentsTaken: 98 },
];

const clientNames = [
  "Thompson Industries", "Greenfield Holdings", "Apex Solutions LLC", "Rivera & Associates",
  "Northstar Properties", "Cascade Financial", "BluePeak Ventures", "Sterling Group",
  "Meridian Corp", "Vanguard Services", "Oakwood Partners", "Summit Legal Group",
  "Pacific Trade Co", "Harbor Point LLC", "Crestview Enterprises", "Ironbridge Capital",
  "Zenith Manufacturing", "Pinnacle Health", "Redwood Analytics", "Frontier Logistics",
];

export const clients: Client[] = clientNames.map((name, i) => {
  const statuses: Client["status"][] = ["active", "active", "active", "delinquent", "completed", "new", "active", "delinquent", "active", "active"];
  const status = statuses[i % statuses.length];
  const totalOwed = Math.floor(Math.random() * 50000) + 5000;
  const paidRatio = status === "completed" ? 1 : status === "new" ? 0 : Math.random() * 0.8;
  const totalPaid = Math.floor(totalOwed * paidRatio);
  const monthlyPayment = Math.floor(totalOwed / 12);

  return {
    id: `cl-${i + 1}`,
    name,
    email: `billing@${name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
    phone: `(${200 + i}) 555-${String(1000 + i).slice(-4)}`,
    contractStart: format(subDays(new Date(), Math.floor(Math.random() * 365) + 30), "yyyy-MM-dd"),
    contractEnd: format(addMonths(new Date(), Math.floor(Math.random() * 12) + 1), "yyyy-MM-dd"),
    totalOwed,
    totalPaid,
    monthlyPayment,
    status,
    assignedCollector: collectors[i % 3].id,
    lastContact: format(subDays(new Date(), Math.floor(Math.random() * 14)), "yyyy-MM-dd"),
    nextPaymentDue: format(addDays(new Date(), Math.floor(Math.random() * 30)), "yyyy-MM-dd"),
  };
});

export const payments: Payment[] = Array.from({ length: 60 }, (_, i) => {
  const client = clients[i % clients.length];
  const collector = collectors[i % 3];
  const methods: Payment["method"][] = ["card", "ach", "check", "cash"];
  return {
    id: `pay-${i + 1}`,
    clientId: client.id,
    clientName: client.name,
    amount: Math.floor(Math.random() * 3000) + 200,
    date: format(subDays(new Date(), Math.floor(Math.random() * 90)), "yyyy-MM-dd"),
    method: methods[i % 4],
    collectorId: collector.id,
    collectorName: collector.name,
    status: i % 10 === 0 ? "failed" : i % 7 === 0 ? "pending" : "completed",
  };
});

export const callLogs: CallLog[] = Array.from({ length: 80 }, (_, i) => {
  const client = clients[i % clients.length];
  const collector = collectors[i % 3];
  const outcomes: CallLog["outcome"][] = ["payment_taken", "promise_to_pay", "no_answer", "left_voicemail", "callback_scheduled", "disputed"];
  return {
    id: `call-${i + 1}`,
    clientId: client.id,
    clientName: client.name,
    collectorId: collector.id,
    collectorName: collector.name,
    date: format(subDays(new Date(), Math.floor(Math.random() * 30)), "yyyy-MM-dd"),
    duration: Math.floor(Math.random() * 600) + 30,
    outcome: outcomes[i % outcomes.length],
    notes: ["Discussed payment plan", "Client requested invoice copy", "Left message with receptionist", "Set up auto-pay", "Client will pay by Friday", "Needs to speak with manager"][i % 6],
  };
});

// Chart data generators
export function getWeeklyCollections(weeks: number) {
  return Array.from({ length: weeks }, (_, i) => {
    const weekStart = subDays(new Date(), (weeks - i) * 7);
    return {
      week: format(weekStart, "MMM dd"),
      collected: Math.floor(Math.random() * 25000) + 8000,
      target: 20000,
    };
  });
}

export function getMonthlyCollections(months: number) {
  return Array.from({ length: months }, (_, i) => {
    const month = subDays(new Date(), (months - i) * 30);
    return {
      month: format(month, "MMM yyyy"),
      collected: Math.floor(Math.random() * 95000) + 40000,
      target: 80000,
    };
  });
}

export function getForecastData() {
  const weeks = Array.from({ length: 8 }, (_, i) => ({
    period: format(addWeeks(new Date(), i + 1), "MMM dd"),
    projected: Math.floor(Math.random() * 30000) + 15000,
    pessimistic: Math.floor(Math.random() * 20000) + 8000,
    optimistic: Math.floor(Math.random() * 40000) + 25000,
  }));
  return weeks;
}

export function getContractAnalytics() {
  return Array.from({ length: 6 }, (_, i) => {
    const month = subDays(new Date(), (5 - i) * 30);
    return {
      month: format(month, "MMM"),
      started: Math.floor(Math.random() * 8) + 2,
      matured: Math.floor(Math.random() * 5) + 1,
      delinquent: Math.floor(Math.random() * 3),
    };
  });
}

export function getARAgingData() {
  return [
    { range: "Current", amount: 45000, count: 8 },
    { range: "1-30 days", amount: 32000, count: 6 },
    { range: "31-60 days", amount: 18000, count: 4 },
    { range: "61-90 days", amount: 12000, count: 3 },
    { range: "90+ days", amount: 8500, count: 2 },
  ];
}
