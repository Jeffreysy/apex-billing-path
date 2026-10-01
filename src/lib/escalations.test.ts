import { describe, expect, it } from "vitest";
import { ESCALATION_TARGETS } from "@/config/firmProfile";
import { getDefaultHandoffQueue, matchesEscalationInbox } from "./escalations";

// The routing rules before staff names moved into the firm profile; the new version must agree.
function legacyDefaultHandoffQueue(assignedTo: string | null | undefined) {
  const target = (assignedTo || "").toLowerCase();
  if (["legal", "attorney"].some(token => target.includes(token))) return "legal";
  if (["case manager", "paralegal"].some(token => target.includes(token))) return "case_management";
  if (target.includes("compliance")) return "compliance";
  if (["cc/", "customer care", "nidiana"].some(token => target.includes(token))) return "customer_care";
  if (["management", "stephen", "jeffrey"].some(token => target.includes(token))) return "management";
  if (target.includes("sales")) return "sales";
  return "other";
}

const ASSIGNEES = [
  ...ESCALATION_TARGETS.map(t => t.label),
  "Management",
  "Legal",
  "Sales",
  "Nidiana",
  "Jeffrey",
  "stephen (ops)",
  "Customer Care",
  "Alejandro A",
  "Maritza V",
  "",
  null,
  undefined,
];

describe("getDefaultHandoffQueue", () => {
  it.each(ASSIGNEES.filter(a => a !== "Case Manager/Paralegal"))("routes %j the same as before", assignee => {
    expect(getDefaultHandoffQueue(assignee)).toBe(legacyDefaultHandoffQueue(assignee));
  });

  it("sends case managers to case management (keyword matching sent them to legal)", () => {
    expect(legacyDefaultHandoffQueue("Case Manager/Paralegal")).toBe("legal");
    expect(getDefaultHandoffQueue("Case Manager/Paralegal")).toBe("case_management");
  });

  it("routes every firm escalation target to its configured queue", () => {
    for (const target of ESCALATION_TARGETS) {
      expect(getDefaultHandoffQueue(target.label)).toBe(target.queue);
    }
  });
});

describe("matchesEscalationInbox", () => {
  it("keeps older records addressed to management staff in the management inbox", () => {
    expect(matchesEscalationInbox({ handoff_target: "Stephen/Jeffrey" }, "management")).toBe(true);
    expect(matchesEscalationInbox({ assigned_to: "Jeffrey" }, "management")).toBe(true);
  });

  it("keeps other records out of the management inbox", () => {
    expect(matchesEscalationInbox({ assigned_to: "Alejandro A", handoff_queue: "legal" }, "management")).toBe(false);
  });
});
