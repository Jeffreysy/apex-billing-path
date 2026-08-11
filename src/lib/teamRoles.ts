// Team roster, role mapping, and value normalizers for the Collections KPI dashboard.
//
// SOURCE OF TRUTH = Supabase `collector_roster` (active rows), read live via
// `useCollectorRoster()` in src/hooks/useSupabaseData.ts. The constants below are the
// RESILIENT FALLBACK used when that read is loading/empty/RLS-blocked — keep them in sync
// with `collector_roster WHERE active` so a fallback render is never itself drifted.
// (Live read certified by supabase-auditor — migration 20260729175949, 2026-07-29.)

export type TeamRole = "Collector" | "Intake";

export const TEAM_ROLES: Record<string, TeamRole> = {
  // Active collectors (collector_roster.active = true) — core three, then the Jun-2026
  // and Jul-2026 additions. Keep in sync with `collector_roster WHERE active` (7 as of 2026-08).
  "Alejandro A": "Collector",
  "Maritza V": "Collector",
  "Patricio D": "Collector",
  "Emilio Suarez": "Collector",
  "Aida Lino": "Collector",
  "Ximena G": "Collector",
  "Hiram Perez": "Collector", // Jul-2026 add; was missing here → fallback team totals dropped his ~$17K/8wk
  // Intake
  "Roy Ramos": "Intake",
  "Lizbeth Castrillón": "Intake",
  // NOTE: Monica Ramirez is collector_roster.active = false (retired 2026-06-25) — intentionally omitted.
};

export const COLLECTORS = Object.entries(TEAM_ROLES)
  .filter(([, r]) => r === "Collector")
  .map(([n]) => n);

export const INTAKE = Object.entries(TEAM_ROLES)
  .filter(([, r]) => r === "Intake")
  .map(([n]) => n);

export const TEAM_MEMBERS = [...COLLECTORS, ...INTAKE];

// Fallback active-collector roster (mirrors `collector_roster WHERE active`). Prefer the
// live `useCollectorRoster()` hook inside components; use this only as its fallback or for
// non-component modules that can't call a hook.
export const ACTIVE_COLLECTORS = COLLECTORS;

// Lead collector. `collector_roster` has no `lead` column yet, so this stays declared here.
export const LEAD_COLLECTOR = "Alejandro A";

export function getRole(name: string | null | undefined): TeamRole | null {
  if (!name) return null;
  return TEAM_ROLES[name] ?? null;
}

// ---- Origin buckets ----
export const ORIGIN_BUCKETS = [
  "A/R List",
  "FUP",
  "CC/VR Transfer",
  "Attorney Req",
  "CM/Paralegal",
  "Pending Task",
  "Other/Blank",
] as const;
export type OriginBucket = (typeof ORIGIN_BUCKETS)[number];

export function normalizeOrigin(raw: string | null | undefined): OriginBucket {
  const v = (raw || "").trim().toLowerCase();
  if (!v || v === "0") return "Other/Blank";
  if (v.includes("a/r")) return "A/R List";
  if (v === "fup" || v.startsWith("fup")) return "FUP";
  if (v.includes("cc") || v.includes("vr") || v.includes("transfer")) return "CC/VR Transfer";
  if (v.includes("attorney")) return "Attorney Req";
  if (v.includes("cm") || v.includes("paralegal")) return "CM/Paralegal";
  if (v.includes("pending task") || v.includes("pending calls")) return "Pending Task";
  return "Other/Blank";
}

// ---- Outcome buckets ----
export const OUTCOME_BUCKETS = [
  "Pay Uptodate",
  "Partial Payment",
  "Overdue Payment",
  "Payment Promise",
  "No Answer / VM",
  "Collected",
  "Info Provided",
] as const;
export type OutcomeBucket = (typeof OUTCOME_BUCKETS)[number];

export function normalizeOutcome(raw: string | null | undefined): OutcomeBucket | null {
  const v = (raw || "").trim().toLowerCase();
  if (!v) return null;
  if (v.includes("uptodate") || v.includes("up to date") || v.includes("up-to-date")) return "Pay Uptodate";
  if (v.includes("partial")) return "Partial Payment";
  if (v.includes("overdue")) return "Overdue Payment";
  if (v.includes("promis") || v.includes("agreement")) return "Payment Promise";
  if (v.includes("no answer") || v.includes("noi answer") || v.includes("voice") || v.includes("vm")) return "No Answer / VM";
  if (v.includes("collected") || v.includes("payment_taken") || v.includes("paid_in_full") || v.includes("completed")) return "Collected";
  if (v.includes("info")) return "Info Provided";
  return null;
}

// ---- Call direction ----
export type Direction = "inbound" | "outbound" | "admin" | "other";
export function normalizeDirection(raw: string | null | undefined): Direction {
  const v = (raw || "").trim().toLowerCase();
  if (v === "inbound") return "inbound";
  if (v === "outbound") return "outbound";
  if (
    v === "admin" ||
    v === "administrative" ||
    v === "training" ||
    v === "meeting" ||
    v === "report" ||
    v === "update log" ||
    v === "technical issues" ||
    v === "filter list" ||
    v === "send information"
  ) return "admin";
  return "other";
}

export function isCallDirection(d: Direction): boolean {
  return d === "inbound" || d === "outbound";
}

// ---- Aging buckets ----
export const AGING_BUCKETS = ["<30 Days", "31-60 Days", "61-90 Days", ">90 Days"] as const;
export type AgingBucket = (typeof AGING_BUCKETS)[number];
export function agingBucket(days: number | null | undefined): AgingBucket {
  const d = days ?? 0;
  if (d <= 30) return "<30 Days";
  if (d <= 60) return "31-60 Days";
  if (d <= 90) return "61-90 Days";
  return ">90 Days";
}

// ---- Misc ----
export function fmtMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);
}
export function fmtPct(n: number, digits = 0): string {
  if (!isFinite(n)) return "0%";
  return `${(n * 100).toFixed(digits)}%`;
}