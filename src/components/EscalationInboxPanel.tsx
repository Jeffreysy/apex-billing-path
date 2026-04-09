import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  escalationNeedsAttention,
  formatEscalationStatus,
  formatEscalationValue,
  getEscalationFollowUpUrgency,
  getEscalationPriorityBadgeVariant,
  getEscalationStatusBadgeVariant,
  matchesEscalationInbox,
  type EscalationInbox,
} from "@/lib/escalations";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  escalations: any[];
  title: string;
  inbox: EscalationInbox;
  maxItems?: number;
  emptyMessage?: string;
  showViewAll?: boolean;
}

const EscalationInboxPanel = ({
  escalations,
  title,
  inbox,
  maxItems = 6,
  emptyMessage = "No unresolved escalations.",
  showViewAll = true,
}: Props) => {
  const items = escalations
    .filter((row) => matchesEscalationInbox(row, inbox))
    .sort((a, b) => {
      const followUpUrgencyDiff = getEscalationFollowUpUrgency(b.follow_up_date) - getEscalationFollowUpUrgency(a.follow_up_date);
      if (followUpUrgencyDiff !== 0) return followUpUrgencyDiff;
      const attentionDiff = Number(escalationNeedsAttention(b.priority, b.status)) - Number(escalationNeedsAttention(a.priority, a.status));
      if (attentionDiff !== 0) return attentionDiff;
      return (b.created_at || "").localeCompare(a.created_at || "");
    })
    .slice(0, maxItems);

  return (
    <div className="dashboard-section">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{items.length} visible unresolved escalation{items.length === 1 ? "" : "s"}</p>
        </div>
        {showViewAll && (
          <Button asChild variant="outline" size="sm" className="gap-1 text-xs">
            <Link to="/collections/escalations">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {items.map((row) => {
            const needsAttention = escalationNeedsAttention(row.priority, row.status);
            return (
              <div
                key={row.id}
                className={`rounded-lg border p-3 ${needsAttention ? "border-destructive/40 bg-destructive/5" : "bg-card"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{row.trigger_reason}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {`Raised by ${row.raised_by || "Unknown"}`}
                      {row.handoff_target || row.assigned_to ? ` | Assigned to ${row.handoff_target || row.assigned_to}` : " | Unassigned"}
                      {row.handoff_queue ? ` | Queue ${formatEscalationValue(row.handoff_queue)}` : ""}
                      {row.created_at ? ` | ${new Date(row.created_at).toLocaleDateString()}` : ""}
                    </p>
                    {(row.outcome_snapshot || row.follow_up_date) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.outcome_snapshot ? `Outcome: ${row.outcome_snapshot}` : ""}
                        {row.outcome_snapshot && row.follow_up_date ? " | " : ""}
                        {row.follow_up_date ? `Follow-up: ${row.follow_up_date}${getEscalationFollowUpUrgency(row.follow_up_date) === 2 ? " (overdue)" : getEscalationFollowUpUrgency(row.follow_up_date) === 1 ? " (today)" : ""}` : ""}
                      </p>
                    )}
                  </div>
                  {needsAttention && <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant={getEscalationPriorityBadgeVariant(row.priority)} className="text-[10px] capitalize">
                    {row.priority}
                  </Badge>
                  <Badge variant={getEscalationStatusBadgeVariant(row.status)} className="text-[10px] capitalize">
                    {formatEscalationStatus(row.status)}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EscalationInboxPanel;
