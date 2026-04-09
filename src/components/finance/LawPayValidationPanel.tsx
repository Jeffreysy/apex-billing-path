import { AlertTriangle, CheckCircle2, CreditCard, Link2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/StatCard";
import { useLawPayReconciliationSummary } from "@/hooks/useSupabaseData";

const formatMoney = (value: number | null | undefined) => `$${Number(value || 0).toLocaleString()}`;

const LawPayValidationPanel = () => {
  const { data, isLoading, error } = useLawPayReconciliationSummary();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>LawPay Validation</CardTitle>
          <CardDescription>Checking captured transactions and reconciliation health...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>LawPay Validation</CardTitle>
          <CardDescription>Unable to load LawPay reconciliation data right now.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const unresolvedIssues = Number(data.unresolved_validation_issues) || 0;
  const unmatchedTransactions = Number(data.unmatched_transactions) || 0;
  const latestTransactionDate = data.latest_transaction_date
    ? new Date(data.latest_transaction_date).toLocaleDateString()
    : "No LawPay transactions";
  const latestPaymentDate = data.latest_payment_date
    ? new Date(data.latest_payment_date).toLocaleDateString()
    : "No linked payment rows";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              LawPay Validation
            </CardTitle>
            <CardDescription>
              Reconciles LawPay capture activity against matched payments and open validation issues.
            </CardDescription>
          </div>
          <Badge variant={unresolvedIssues > 0 || unmatchedTransactions > 0 ? "destructive" : "outline"}>
            {unresolvedIssues > 0 || unmatchedTransactions > 0 ? "Needs review" : "Healthy"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="LawPay Captured"
            value={String(Number(data.total_transactions) || 0)}
            icon={<CreditCard className="h-5 w-5" />}
          />
          <StatCard
            label="Matched"
            value={String(Number(data.matched_transactions) || 0)}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <StatCard
            label="Unmatched"
            value={String(unmatchedTransactions)}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <StatCard
            label="Open Validation"
            value={String(unresolvedIssues)}
            icon={<ShieldCheck className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">LawPay Dollars</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Total captured</span>
                <span className="font-semibold">{formatMoney(data.total_lawpay_amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Matched amount</span>
                <span className="font-semibold">{formatMoney(data.matched_lawpay_amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Unmatched amount</span>
                <span className="font-semibold text-destructive">{formatMoney(data.unmatched_lawpay_amount)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Payment Linkage</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Link2 className="h-4 w-4" /> Linked payment rows</span>
                <span className="font-semibold">{Number(data.linked_payment_rows) || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Linked payment amount</span>
                <span className="font-semibold">{formatMoney(data.linked_payment_amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Open validation difference</span>
                <span className="font-semibold text-destructive">{formatMoney(data.unresolved_validation_difference)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <div className="rounded-lg bg-muted/40 p-3">
            Latest LawPay transaction date: <span className="font-medium text-foreground">{latestTransactionDate}</span>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            Latest linked Supabase payment date: <span className="font-medium text-foreground">{latestPaymentDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LawPayValidationPanel;
