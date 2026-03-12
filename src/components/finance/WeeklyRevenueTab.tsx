import { useState, useMemo } from "react";
import StatCard from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { payments, clients, collectors } from "@/data/mockData";
import {
  DollarSign, CreditCard, Briefcase, Receipt, FileText, Landmark, Calculator,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval } from "date-fns";
import type { DateRange } from "react-day-picker";

type TxnClass = "DownPayment" | "Consult" | "LawPayOther";

function classifyTransaction(payment: typeof payments[0], client: typeof clients[0] | undefined): TxnClass {
  if (!client) return "LawPayOther";
  if (payment.amount >= client.downPayment * 0.8 && payment.amount <= client.downPayment * 1.2) return "DownPayment";
  if (payment.amount < 500) return "Consult";
  return "LawPayOther";
}

interface Props { dateRange?: DateRange }

const WeeklyRevenueTab = ({ dateRange }: Props) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const currentWeekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  const weekPayments = useMemo(() => {
    return payments.filter(p => {
      const d = new Date(p.date);
      return isWithinInterval(d, { start: currentWeekStart, end: currentWeekEnd });
    });
  }, [weekOffset]);

  const classifiedPayments = useMemo(() => {
    return weekPayments.map(p => {
      const client = clients.find(c => c.id === p.clientId);
      return { ...p, classification: classifyTransaction(p, client) };
    });
  }, [weekPayments]);

  const completedPayments = classifiedPayments.filter(p => p.status === "completed");

  const downPaymentTotal = completedPayments.filter(p => p.classification === "DownPayment").reduce((s, p) => s + p.amount, 0);
  const consultTotal = completedPayments.filter(p => p.classification === "Consult").reduce((s, p) => s + p.amount, 0);
  const lawPayOtherTotal = completedPayments.filter(p => p.classification === "LawPayOther").reduce((s, p) => s + p.amount, 0);
  const transactionsTotal = completedPayments.reduce((s, p) => s + p.amount, 0);

  // FilevineApplied = amounts that map to active client contracts (simulated as 92% of total)
  const filevineApplied = Math.round(transactionsTotal * 0.92);
  // LawPayNet = transactionsTotal minus processing fees (simulated 2.9%)
  const lawPayNet = Math.round(transactionsTotal * 0.971);
  // CombinedTotal = lawPayNet (net after fees is the real combined intake)
  const combinedTotal = lawPayNet;

  return (
    <div className="space-y-6">
      {/* Week Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset(o => o - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              {format(currentWeekStart, "MMM dd")} — {format(currentWeekEnd, "MMM dd, yyyy")}
            </p>
            <p className="text-xs text-muted-foreground">
              {weekOffset === 0 ? "Current Week" : weekOffset === -1 ? "Last Week" : `${Math.abs(weekOffset)} weeks ${weekOffset < 0 ? "ago" : "ahead"}`}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset(o => o + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {weekOffset !== 0 && (
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>Today</Button>
          )}
        </div>
        <Badge variant="outline" className="text-xs">
          {classifiedPayments.length} transactions
        </Badge>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Down Payments" value={`$${downPaymentTotal.toLocaleString()}`} icon={<DollarSign className="h-4 w-4" />} />
        <StatCard label="LawPay Other" value={`$${lawPayOtherTotal.toLocaleString()}`} icon={<CreditCard className="h-4 w-4" />} />
        <StatCard label="Consults" value={`$${consultTotal.toLocaleString()}`} icon={<Briefcase className="h-4 w-4" />} />
        <StatCard label="Transactions Total" value={`$${transactionsTotal.toLocaleString()}`} icon={<Receipt className="h-4 w-4" />} />
        <StatCard label="Filevine Applied" value={`$${filevineApplied.toLocaleString()}`} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="LawPay Net" value={`$${lawPayNet.toLocaleString()}`} icon={<Landmark className="h-4 w-4" />} />
        <StatCard label="Combined Total" value={`$${combinedTotal.toLocaleString()}`} icon={<Calculator className="h-4 w-4" />} />
      </div>

      {/* Formula Logic */}
      <div className="dashboard-section">
        <h3 className="text-sm font-semibold text-foreground mb-2">Formula Logic</h3>
        <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground md:grid-cols-2">
          <p>• <strong>TransactionsTotal</strong> = DownPayment + Consult + LawPayOther</p>
          <p>• <strong>FilevineApplied</strong> = Transactions matched to active contracts (~92%)</p>
          <p>• <strong>LawPayNet</strong> = TransactionsTotal − Processing Fees (2.9%)</p>
          <p>• <strong>CombinedTotal</strong> = LawPayNet (net revenue intake)</p>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="dashboard-section">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Transaction Log</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Collector</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classifiedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No transactions this week
                  </TableCell>
                </TableRow>
              ) : (
                classifiedPayments.sort((a, b) => b.date.localeCompare(a.date)).map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs">{p.date}</TableCell>
                    <TableCell className="font-medium">{p.clientName}</TableCell>
                    <TableCell className="font-semibold">${p.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={p.classification === "DownPayment" ? "default" : p.classification === "Consult" ? "secondary" : "outline"} className="text-xs">
                        {p.classification}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-xs">{p.method}</TableCell>
                    <TableCell className="text-xs">{p.collectorName}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "completed" ? "default" : p.status === "failed" ? "destructive" : "secondary"} className="text-xs capitalize">
                        {p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default WeeklyRevenueTab;
