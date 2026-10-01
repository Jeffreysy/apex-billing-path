// Settings specific to the firm running this LexCollect deployment: staff names, escalation
// contacts, and similar workflow details. Keep firm-specific values here rather than in
// components, so onboarding another firm means editing (and later, loading) one profile.

import type { EscalationHandoffQueue } from "@/lib/escalations";

/**
 * Collectors shown while the live `collector_roster` read is loading, empty, or blocked.
 * Keep in sync with `collector_roster WHERE active`.
 */
export const FALLBACK_COLLECTORS: readonly string[] = [
  "Alejandro A",
  "Maritza V",
  "Patricio D",
  "Emilio Suarez",
  "Aida Lino",
  "Ximena G",
  "Hiram Perez",
];

/** Intake staff on the Collections KPI dashboard (`collector_roster` has no intake rows). */
export const INTAKE_TEAM: readonly string[] = ["Roy Ramos", "Lizbeth Castrillón"];

/** Lead collector, badged on collector views (`collector_roster` has no `lead` column yet). */
export const LEAD_COLLECTOR = "Alejandro A";

/** People and teams a collector can escalate to, with the handoff queue each one feeds. */
export const ESCALATION_TARGETS: readonly { label: string; queue: EscalationHandoffQueue }[] = [
  { label: "Attorney", queue: "legal" },
  { label: "Case Manager/Paralegal", queue: "case_management" },
  { label: "Compliance", queue: "compliance" },
  { label: "CC/Nidiana", queue: "customer_care" },
  { label: "Stephen/Jeffrey", queue: "management" },
];

/**
 * Staff first names that appear in escalation targets (including older records saved as free
 * text), mapped to the queue they belong to, so those records route to the right inbox.
 */
export const ESCALATION_NAME_ALIASES: Readonly<Record<string, EscalationHandoffQueue>> = {
  nidiana: "customer_care",
  stephen: "management",
  jeffrey: "management",
};
