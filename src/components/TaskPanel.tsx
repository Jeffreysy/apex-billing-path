import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight, CalendarClock, ExternalLink } from "lucide-react";

type Department = "collections" | "legal" | "ar" | "admin";

type ActivityTask = {
  id: string;
  source: "activity" | "escalation";
  title: string;
  clientName: string;
  collector?: string | null;
  dueDate: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "escalated";
  department: Department;
  targetDepartment: Department;
  description?: string | null;
  clientId?: string | null;
  contractId?: string | null;
};

const priorityVariant: Record<ActivityTask["priority"], "default" | "destructive" | "secondary" | "outline"> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  urgent: "destructive",
};

const statusVariant: Record<ActivityTask["status"], "default" | "destructive" | "secondary" | "outline"> = {
  open: "outline",
  in_progress: "secondary",
  escalated: "destructive",
};

interface TaskPanelProps {
  department: Department;
  showAll?: boolean;
}

function addDays(dateValue: string, days: number) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function parseExpectedPaymentDue(activityDate: string, expected: string | null) {
  const value = (expected || "").trim();
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const normalized = value.toLowerCase();
  if (normalized.includes("today")) return activityDate;
  if (normalized.includes("tomorrow")) return addDays(activityDate, 1);
  if (normalized.includes("1-3") || normalized.includes("1 to 3")) return addDays(activityDate, 14);
  if (normalized.includes("week")) return addDays(activityDate, 7);
  if (normalized.includes("next month") || normalized.includes("month")) return addDays(activityDate, 30);
  if (normalized.includes("uncertain")) return addDays(activityDate, 7);
  return addDays(activityDate, 3);
}

function noteLooksActionable(notes: string | null, outcome: string | null, escalatedTo: string | null) {
  const haystack = `${notes || ""} ${outcome || ""} ${escalatedTo || ""}`.toLowerCase();
  return [
    "follow",
    "fup",
    "call back",
    "callback",
    "promise",
    "commit",
    "next payment",
    "pending",
    "escalat",
    "refund",
  ].some((term) => haystack.includes(term));
}

function priorityForTask(dueDate: string, source: ActivityTask["source"], escalatedTo?: string | null): ActivityTask["priority"] {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const due = new Date(`${dueDate}T00:00:00`);
  const daysUntilDue = Math.ceil((due.getTime() - todayStart.getTime()) / 86_400_000);

  if (source === "escalation") return daysUntilDue < 0 || escalatedTo ? "urgent" : "high";
  if (daysUntilDue < 0) return "urgent";
  if (daysUntilDue <= 1) return "high";
  if (daysUntilDue <= 7) return "medium";
  return "low";
}

function departmentForEscalation(row: any): Department {
  const queue = String(row.handoff_queue || row.assigned_to || row.handoff_target || "").toLowerCase();
  if (queue.includes("legal") || queue.includes("attorney") || queue.includes("case")) return "legal";
  if (queue.includes("billing") || queue.includes("ar") || queue.includes("finance")) return "ar";
  if (queue.includes("management") || queue.includes("admin") || queue.includes("stephen") || queue.includes("jeffrey")) return "admin";
  return "collections";
}

function isRelevantTask(task: ActivityTask) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const due = new Date(`${task.dueDate}T00:00:00`);
  const daysFromToday = Math.ceil((due.getTime() - todayStart.getTime()) / 86_400_000);

  // Keep overdue items visible for a short operational window, but avoid surfacing stale sheet noise.
  return daysFromToday >= -14 && daysFromToday <= 45;
}

const TaskPanel = ({ department, showAll = false }: TaskPanelProps) => {
  const navigate = useNavigate();

  const { data: activityRows = [], isLoading: loadingActivities } = useQuery({
    queryKey: ["activity-derived-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collection_activities")
        .select("*")
        .order("activity_date", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const { data: escalationRows = [], isLoading: loadingEscalations } = useQuery({
    queryKey: ["task-panel-escalations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("escalations")
        .select("*")
        .in("status", ["open", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const tasks = useMemo(() => {
    const activityTasks: ActivityTask[] = activityRows
      .map((row: any): ActivityTask | null => {
        const dueDate = parseExpectedPaymentDue(row.activity_date, row.next_payment_expected);
        const actionable = Boolean(dueDate) || noteLooksActionable(row.notes, row.outcome, row.escalated_to);
        if (!actionable || !row.activity_date) return null;

        const resolvedDueDate = dueDate || addDays(row.activity_date, 2);
        const isEscalated = Boolean(row.escalated_to);
        return {
          id: `activity-${row.id}`,
          source: "activity",
          title: row.next_payment_expected
            ? `Follow up on next payment: ${row.next_payment_expected}`
            : isEscalated
              ? `Review escalation note for ${row.escalated_to}`
              : "Follow up from activity note",
          clientName: row.client_name || "Unknown client",
          collector: row.collector,
          dueDate: resolvedDueDate,
          priority: priorityForTask(resolvedDueDate, "activity", row.escalated_to),
          status: isEscalated ? "escalated" : "open",
          department: "collections",
          targetDepartment: isEscalated ? departmentForEscalation({ handoff_queue: row.escalated_to }) : "collections",
          description: row.notes || row.outcome || null,
          clientId: row.client_id,
          contractId: null,
        };
      })
      .filter(Boolean) as ActivityTask[];

    const escalationTasks: ActivityTask[] = escalationRows.map((row: any): ActivityTask => {
      const targetDepartment = departmentForEscalation(row);
      const dueDate = row.follow_up_date || String(row.created_at || "").slice(0, 10) || new Date().toISOString().slice(0, 10);
      return {
        id: `escalation-${row.id}`,
        source: "escalation",
        title: row.trigger_reason || "Escalation requires follow-up",
        clientName: row.handoff_target || row.client_name || "Escalated account",
        collector: row.raised_by,
        dueDate,
        priority: row.priority === "urgent" || row.priority === "high" ? row.priority : priorityForTask(dueDate, "escalation"),
        status: "escalated",
        department: "collections",
        targetDepartment,
        description: row.notes || row.outcome_snapshot || row.trigger_reason || null,
        clientId: row.client_id,
        contractId: row.contract_id,
      };
    });

    return [...escalationTasks, ...activityTasks]
      .filter(isRelevantTask)
      .filter((task) => showAll || task.targetDepartment === department || task.department === department)
      .sort((a, b) => {
        const urgentDiff = (b.priority === "urgent" ? 1 : 0) - (a.priority === "urgent" ? 1 : 0);
        if (urgentDiff) return urgentDiff;
        return a.dueDate.localeCompare(b.dueDate);
      })
      .slice(0, showAll ? 12 : 10);
  }, [activityRows, escalationRows, department, showAll]);

  const escalated = tasks.filter((task) => task.status === "escalated" || task.targetDepartment !== department);
  const isLoading = loadingActivities || loadingEscalations;

  const openTask = (task: ActivityTask) => {
    const id = task.contractId || task.clientId;
    if (id) navigate(`/collections/workspace/${id}`);
  };

  return (
    <div className="dashboard-section">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {showAll ? "Live Tasks & Reminders" : "Tasks & Reminders"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Built from collector activity notes, next-payment fields, and unresolved escalations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {escalated.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <ArrowUpRight className="h-3 w-3" />
              {escalated.length} escalated
            </Badge>
          )}
          <Badge variant="outline" className="gap-1">
            <CalendarClock className="h-3 w-3" />
            {tasks.length} live
          </Badge>
        </div>
      </div>
      <div className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading live reminders...</p>}
        {!isLoading && tasks.map((task) => (
          <div key={task.id} className="flex items-start justify-between rounded-md border p-3">
            <div className="flex-1">
              <p className="text-sm font-medium">{task.title}</p>
              <p className="text-xs text-muted-foreground">
                {task.clientName} · Due: {task.dueDate}{task.collector ? ` · ${task.collector}` : ""}
              </p>
              {task.description && (
                <p className="mt-1 max-w-xl truncate text-xs text-muted-foreground">{task.description}</p>
              )}
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge variant={priorityVariant[task.priority]} className="text-xs capitalize">{task.priority}</Badge>
                <Badge variant={statusVariant[task.status]} className="text-xs capitalize">{task.status.replace(/_/g, " ")}</Badge>
                {task.targetDepartment !== department && (
                  <Badge variant="outline" className="text-xs">To: {task.targetDepartment}</Badge>
                )}
              </div>
            </div>
            {(task.clientId || task.contractId) && (
              <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => openTask(task)}>
                <ExternalLink className="h-3 w-3" />
                Open
              </Button>
            )}
          </div>
        ))}
        {!isLoading && tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No relevant live reminders right now.</p>
        )}
      </div>
    </div>
  );
};

export default TaskPanel;
