import { format, subDays, addDays } from "date-fns";

// ---- Interfaces (kept for type compatibility) ----

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
  assignedTo: string;
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
  filevineId?: string;
  mycaseId?: number;
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

// ---- Tasks (no Supabase table yet — kept as mock) ----

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
  const fromDept = departments[i % 4];
  const toDept = departments[(i + 1) % 4];
  const priorities: Task["priority"][] = ["low", "medium", "high", "urgent"];
  const statuses: Task["status"][] = ["open", "in_progress", "completed", "escalated"];
  return {
    id: `task-${i + 1}`,
    title: taskTitles[i % taskTitles.length],
    description: `Action required`,
    assignedTo: toDept,
    assignedToName: toDept.charAt(0).toUpperCase() + toDept.slice(1),
    assignedBy: fromDept,
    assignedByName: fromDept.charAt(0).toUpperCase() + fromDept.slice(1),
    department: fromDept,
    targetDepartment: toDept,
    clientName: "Client",
    priority: priorities[i % 4],
    status: statuses[i % 4],
    createdDate: format(subDays(new Date(), Math.floor(Math.random() * 30)), "yyyy-MM-dd"),
    dueDate: format(addDays(new Date(), Math.floor(Math.random() * 14) + 1), "yyyy-MM-dd"),
    notes: `Created by ${fromDept} department for ${toDept} review.`,
  };
});
