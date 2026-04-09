export const ESCALATION_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const ESCALATION_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
export const ESCALATION_ASSIGNEES = ["Alejandro A", "Patricio D", "Maritza V", "Management", "Legal"] as const;
export const ESCALATION_SOURCE_CONTEXTS = ["inbound_call", "outbound_call", "pending_task", "admin_follow_up", "attorney_request", "customer_care_request", "refund_follow_up", "compliance_review", "other"] as const;
export const ESCALATION_HANDOFF_QUEUES = ["legal", "case_management", "compliance", "customer_care", "management", "sales", "billing_ops", "other"] as const;

export type EscalationInbox = "all" | "legal" | "management";
export type EscalationSourceContext = (typeof ESCALATION_SOURCE_CONTEXTS)[number];
export type EscalationHandoffQueue = (typeof ESCALATION_HANDOFF_QUEUES)[number];

interface EscalationInboxCandidate {
  assigned_to?: string | null;
  handoff_target?: string | null;
  handoff_queue?: string | null;
}

export function getEscalationPriorityBadgeVariant(priority: string): "default" | "destructive" | "secondary" | "outline" {
  switch (priority) {
    case "urgent":
      return "destructive";
    case "high":
      return "default";
    case "medium":
      return "secondary";
    default:
      return "outline";
  }
}

export function getEscalationStatusBadgeVariant(status: string): "default" | "destructive" | "secondary" | "outline" {
  switch (status) {
    case "resolved":
      return "default";
    case "in_progress":
      return "secondary";
    case "closed":
      return "outline";
    default:
      return "destructive";
  }
}

export function formatEscalationStatus(status: string): string {
  return status.replace(/_/g, " ");
}

export function formatEscalationValue(value: string): string {
  return value.replace(/_/g, " ");
}

export function isEscalationUnresolved(status: string): boolean {
  return status === "open" || status === "in_progress";
}

export function escalationNeedsAttention(priority: string, status: string): boolean {
  return isEscalationUnresolved(status) && (priority === "urgent" || priority === "high");
}

function normalizeEscalationValue(value: string | null | undefined): string {
  return (value || "").toLowerCase().trim();
}

export function matchesEscalationInbox(escalation: EscalationInboxCandidate, inbox: EscalationInbox): boolean {
  if (inbox === "all") return true;

  const queue = normalizeEscalationValue(escalation.handoff_queue);
  const target = normalizeEscalationValue(escalation.handoff_target || escalation.assigned_to);

  if (inbox === "legal") {
    if (["legal", "case_management", "compliance"].includes(queue)) return true;
    return ["legal", "attorney", "case manager", "paralegal", "compliance"].some(token => target.includes(token));
  }

  if (!queue && !target) return true;
  if (["management", "billing_ops"].includes(queue)) return true;
  return ["management", "stephen", "jeffrey"].some(token => target.includes(token));
}

export function getEscalationFollowUpUrgency(followUpDate: string | null | undefined): number {
  if (!followUpDate) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const followUp = new Date(`${followUpDate}T00:00:00`);
  if (Number.isNaN(followUp.getTime())) return 0;

  if (followUp < today) return 2;
  if (followUp.getTime() === today.getTime()) return 1;
  return 0;
}

export function getDefaultHandoffQueue(assignedTo: string | null | undefined): EscalationHandoffQueue {
  const target = (assignedTo || "").toLowerCase();
  if (["legal", "attorney"].some(token => target.includes(token))) return "legal";
  if (["case manager", "paralegal"].some(token => target.includes(token))) return "case_management";
  if (target.includes("compliance")) return "compliance";
  if (["cc/", "customer care", "nidiana"].some(token => target.includes(token))) return "customer_care";
  if (["management", "stephen", "jeffrey"].some(token => target.includes(token))) return "management";
  if (target.includes("sales")) return "sales";
  return "other";
}
