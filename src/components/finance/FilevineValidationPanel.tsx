import { Database, FileText, Link2, RefreshCw, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/StatCard";
import { useFilevineReconciliationSummary } from "@/hooks/useSupabaseData";

const formatMoney = (value: number | null | undefined) => `$${Number(value || 0).toLocaleString()}`;

const FilevineValidationPanel = () => {
  const { data, isLoading, error } = useFilevineReconciliationSummary();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Filevine Validation</CardTitle>
          <CardDescription>Checking direct Filevine payment sync health...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Filevine Validation</CardTitle>
          <CardDescription>Unable to load Filevine reconciliation data right now.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const unmatchedEvents = Number(data.unmatched_events) || 0;
  const lastSuccessAt = data.last_success_at
    ? new Date(data.last_success_at).toLocaleString()
    : "No successful historical sync yet";
  const latestFilevineDate = data.latest_filevine_payment_date
    ? new Date(data.latest_filevine_payment_date).toLocaleDateString()
    : "No Filevine payments recorded";
  const latestLinkedDate = data.latest_linked_payment_date
    ? new Date(data.latest_linked_payment_date).toLocaleDateString()
    : "No linked payments yet";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Filevine Validation
            </CardTitle>
            <CardDescription>
              Tracks direct Filevine payment events, booking success, and historical sync state.
            </CardDescription>
          </div>
          <Badge variant={unmatchedEvents > 0 ? "destructive" : "outline"}>
            {unmatchedEvents > 0 ? "Needs review" : "Healthy"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Filevine Events"
            value={String(Number(data.total_events) || 0)}
            icon={<FileText className="h-5 w-5" />}
          />
          <StatCard
            label="Matched"
            value={String(Number(data.matched_events) || 0)}
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <StatCard
            label="Unmatched"
            value={String(unmatchedEvents)}
            icon={<RefreshCw className="h-5 w-5" />}
          />
          <StatCard
            label="Linked Payments"
            value={String(Number(data.linked_payment_rows) || 0)}
            icon={<Link2 className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Filevine Dollars</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Total seen</span>
                <span className="font-semibold">{formatMoney(data.total_filevine_amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Matched amount</span>
                <span className="font-semibold">{formatMoney(data.matched_filevine_amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Unmatched amount</span>
                <span className="font-semibold text-destructive">{formatMoney(data.unmatched_filevine_amount)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Sync Health</p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Last Filevine payment</span>
                <span className="font-semibold text-foreground">{latestFilevineDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last linked payment</span>
                <span className="font-semibold text-foreground">{latestLinkedDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last history sync</span>
                <span className="font-semibold text-foreground">{lastSuccessAt}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilevineValidationPanel;
