import { format, subDays, addDays, addWeeks, addMonths } from "date-fns";

export interface ClientNote {
  id: string;
  collectorId: string;
  collectorName: string;
  date: string;
  note: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // department or person id
  assignedToName: string;
  assignedBy: string;
  assignedByName: string;
  department: "collections" | "legal" | "ar" | "admin";
  targetDepartment: "collections" | "legal" | "ar" | "admin";
  clientId?: string;
  clientName?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "completed" | "escalated";
  createdDate: string;
  dueDate: string;
  notes: string;
}

export type CaseStage = "intake" | "discovery" | "negotiation" | "litigation" | "settlement" | "closed";

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
  caseStage: CaseStage;
  daysAging: number;
  tags: string[];
  notes: ClientNote[];
  retainerDate: string;
  downPaymentPaid: boolean;
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
  duration: number;
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
  isLead: boolean;
}

export const collectors: Collector[] = [
  { id: "c1", name: "Sarah Mitchell", avatar: "SM", totalCollected: 47850, callsMade: 342, paymentsTaken: 89, isLead: true },
  { id: "c2", name: "James Rodriguez", avatar: "JR", totalCollected: 38200, callsMade: 298, paymentsTaken: 72, isLead: false },
  { id: "c3", name: "Aisha Patel", avatar: "AP", totalCollected: 52100, callsMade: 410, paymentsTaken: 98, isLead: false },
];

const clientNames = [
  "Thompson Industries", "Greenfield Holdings", "Apex Solutions LLC", "Rivera & Associates",
  "Northstar Properties", "Cascade Financial", "BluePeak Ventures", "Sterling Group",
  "Meridian Corp", "Vanguard Services", "Oakwood Partners", "Summit Legal Group",
  "Pacific Trade Co", "Harbor Point LLC", "Crestview Enterprises", "Ironbridge Capital",
  "Zenith Manufacturing", "Pinnacle Health", "Redwood Analytics", "Frontier Logistics",
];

const caseTypes = [
  "Personal Injury", "Medical Malpractice", "Workers' Compensation", "Family Law",
  "Immigration", "Criminal Defense", "Estate Planning", "Business Litigation",
  "Real Estate", "Employment Law",
];

const caseStages: CaseStage[] = ["intake", "discovery", "negotiation", "litigation", "settlement", "closed"];

const tagOptions = [
  "VIP", "Payment Plan", "Auto-Pay", "Hardship", "Dispute", "Priority",
  "New Client", "Referred", "Corporate", "Pro Bono", "Settlement Pending", "Litigation Hold",
];

const noteTemplates = [
  "Client confirmed receipt of invoice. Will process payment this week.",
  "Left voicemail regarding overdue balance. Client has not returned calls in 5 days.",
  "Client requested payment plan modification due to financial hardship.",
  "Spoke with client's assistant — payment is being processed through their AP department.",
  "Client disputes charges for consultation on 3/15. Escalated to billing manager.",
  "Auto-pay setup confirmed. Next draft scheduled for the 1st.",
  "Client called to confirm address change. Updated records accordingly.",
  "Payment received via check. Cleared and applied to account.",
  "Client requested itemized statement. Sent via email.",
  "Discussed remaining balance. Client committed to paying in full by end of month.",
];

export const clients: Client[] = clientNames.map((name, i) => {
  const statuses: Client["status"][] = ["active", "active", "active", "delinquent", "completed", "new", "active", "delinquent", "active", "active"];
  const status = statuses[i % statuses.length];
  const totalOwed = Math.floor(Math.random() * 50000) + 5000;
  const paidRatio = status === "completed" ? 1 : status === "new" ? 0 : Math.random() * 0.8;
  const totalPaid = Math.floor(totalOwed * paidRatio);
  const installmentMonths = 18 + (i % 4);
  const downPayment = Math.floor(totalOwed * (0.15 + (i % 3) * 0.05));
  const monthlyPayment = Math.floor((totalOwed - downPayment) / installmentMonths);
  const daysAging = status === "delinquent" ? Math.floor(Math.random() * 90) + 7 : 0;

  const clientNotes: ClientNote[] = Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, j) => ({
    id: `note-${i}-${j}`,
    collectorId: collectors[j % 3].id,
    collectorName: collectors[j % 3].name,
    date: format(subDays(new Date(), Math.floor(Math.random() * 60) + 1), "yyyy-MM-dd"),
    note: noteTemplates[(i + j) % noteTemplates.length],
  }));

  const clientTags: string[] = [];
  const tagCount = Math.floor(Math.random() * 3) + 1;
  for (let t = 0; t < tagCount; t++) {
    const tag = tagOptions[(i + t * 3) % tagOptions.length];
    if (!clientTags.includes(tag)) clientTags.push(tag);
  }

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
    downPayment,
    installmentMonths,
    status,
    assignedCollector: collectors[i % 3].id,
    lastContact: format(subDays(new Date(), Math.floor(Math.random() * 14)), "yyyy-MM-dd"),
    nextPaymentDue: format(addDays(new Date(), Math.floor(Math.random() * 30)), "yyyy-MM-dd"),
    caseNumber: `CASE-2024-${String(1000 + i).slice(-4)}`,
    caseType: caseTypes[i % caseTypes.length],
    caseStage: caseStages[i % caseStages.length],
    daysAging,
    tags: clientTags,
    notes: clientNotes.sort((a, b) => b.date.localeCompare(a.date)),
    retainerDate: format(subDays(new Date(), Math.floor(Math.random() * 300) + 30), "yyyy-MM-dd"),
    downPaymentPaid: status !== "new",
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

const taskTitles = [
  "Follow up on disputed invoice",
  "Client requesting payment plan modification",
  "Escalate delinquent account for legal review",
  "Verify settlement terms with attorney",
  "Process refund for overpayment",
  "Update client contact information",
  "Schedule mediation hearing",
  "Review retainer agreement terms",
  "Send demand letter — 90+ days past due",
  "Confirm client identity for compliance",
  "Prepare case summary for court filing",
  "Negotiate reduced settlement amount",
];

const departments: Task["department"][] = ["collections", "legal", "ar", "admin"];

export const tasks: Task[] = Array.from({ length: 24 }, (_, i) => {
  const client = clients[i % clients.length];
  const fromDept = departments[i % 4];
  const toDept = departments[(i + 1) % 4];
  const priorities: Task["priority"][] = ["low", "medium", "high", "urgent"];
  const statuses: Task["status"][] = ["open", "in_progress", "completed", "escalated"];
  return {
    id: `task-${i + 1}`,
    title: taskTitles[i % taskTitles.length],
    description: `Action required for ${client.name} — ${client.caseNumber}`,
    assignedTo: toDept,
    assignedToName: toDept.charAt(0).toUpperCase() + toDept.slice(1),
    assignedBy: fromDept,
    assignedByName: fromDept.charAt(0).toUpperCase() + fromDept.slice(1),
    department: fromDept,
    targetDepartment: toDept,
    clientId: client.id,
    clientName: client.name,
    priority: priorities[i % 4],
    status: statuses[i % 4],
    createdDate: format(subDays(new Date(), Math.floor(Math.random() * 30)), "yyyy-MM-dd"),
    dueDate: format(addDays(new Date(), Math.floor(Math.random() * 14) + 1), "yyyy-MM-dd"),
    notes: `Created by ${fromDept} department for ${toDept} review.`,
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

export function getMonthlyForecast() {
  return Array.from({ length: 6 }, (_, i) => ({
    month: format(addMonths(new Date(), i + 1), "MMM yyyy"),
    projected: Math.floor(Math.random() * 120000) + 60000,
    pessimistic: Math.floor(Math.random() * 80000) + 30000,
    optimistic: Math.floor(Math.random() * 160000) + 90000,
  }));
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

export function getCaseTypeBilling() {
  return caseTypes.map((ct) => {
    const caseClients = clients.filter((c) => c.caseType === ct);
    return {
      caseType: ct,
      totalBilled: caseClients.reduce((s, c) => s + c.totalOwed, 0),
      totalCollected: caseClients.reduce((s, c) => s + c.totalPaid, 0),
      count: caseClients.length,
    };
  }).filter((d) => d.count > 0);
}
