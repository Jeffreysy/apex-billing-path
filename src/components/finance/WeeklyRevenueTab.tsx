import { useState } from "react";
import StatCard from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePaymentsClean, usePaymentsData, useMergedClients } from "@/hooks/useSupabaseData";
import {
  DollarSign, CreditCard, Briefcase, Receipt, FileText, Landmark, Calculator,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { format, startOfWeek, endOfWeek, addWeeks, isWithinInterval } from "date-fns";
import type { DateRange } from "react-day-picker";

type TxnClass = "DownPayment" | "Consult" | "BookedOther";

interface Props { dateRange?: DateRange }

const isExplicitFilevinePayment = (payment: {
  notes?: string | null;
  payment_type?: string | null;
  reference_number?: string | null;
}) => {
  const notes = (payment.notes || "").toLowerCase();
  const paymentType = (payment.payment_type || "").toLowerCase();
  const reference = (payment.reference_number || "").toLowerCase();
  return notes.startsWith("filevine:") || paymentType.includes("filevine") || reference.startsWith("fv-");
};

const isExplicitLawPayPayment = (payment: {
  notes?: string | null;
  payment_type?: string | null;
  reference_number?: string | null;
}) => {
  const notes = (payment.notes || "").toLowerCase();
  const paymentType = (payment.payment_type || "").toLowerCase();
  const reference = (payment.reference_number || "").toLowerCase();
  return paymentType.includes("lawpay") || notes.includes("lawpay") || reference.startsWith("#");
};

const WeeklyRevenueTab = ({ dateRange }: Props) => {
  const { data: payments = [], isLoading: paymentsLoading } = usePaymentsData();
  const { data: paymentRows = [], isLoading: rowLoading } = usePaymentsClean();
  const { data: clients = [], isLoading: clientsLoading } = useMergedClients();
  const [weekOffset, setWeekOffset] = useState(0);

  if (paymentsLoading || rowLoading || clientsLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading weekly revenue...</div>;
  }

  const currentWeekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  function classifyTransaction(payment: typeof payments[0]): TxnClass {
    const client = clients.find((candidate) => candidate.name.toLowerCase() === payment.clientName.toLowerCase());
    if (!client) return "BookedOther";
    if (
      client.downPayment > 0
      && payment.amount >= client.downPayment * 0.8
      && payment.amount <= client.downPayment * 1.2
    ) {
      return "DownPayment";
    }
    if (payment.amount < 500) return "Consult";
    return "BookedOther";
  }

  const weekPayments = payments.filter((payment) => {
    const paymentDate = new Date(payment.date);
    return isWithinInterval(paymentDate, { start: currentWeekStart, end: currentWeekEnd });
  });

  const classifiedPayments = weekPayments.map((payment) => ({
    ...payment,
    classification: classifyTransaction(payment),
  }));
  const completedPayments = classifiedPayments.filter((payment) => payment.status === "completed");

  const rawWeekPayments = paymentRows.filter((payment) => {
    if (!payment.payment_date) return false;
    const paymentDate = new Date(payment.payment_date);
    return isWithinInterval(paymentDate, { start: currentWeekStart, end: currentWeekEnd });
  });

  const downPaymentTotal = completedPayments
    .filter((payment) => payment.classification === "DownPayment")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const consultTotal = completedPayments
    .filter((payment) => payment.classification === "Consult")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const bookedOtherTotal = completedPayments
    .filter((payment) => payment.classification === "BookedOther")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const transactionsTotal = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const filevineTagged = rawWeekPayments
    .filter(isExplicitFilevinePayment)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const lawPayTagged = rawWeekPayments
    .filter(isExplicitLawPayPayment)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const unclassifiedBooked = Math.max(0, transactionsTotal - filevineTagged - lawPayTagged);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((offset) => offset - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              {format(currentWeekStart, "MMM dd")} - {format(currentWeekEnd, "MMM dd, yyyy")}
            </p>
            <p className="text-xs text-muted-foreground">
              {weekOffset === 0
                ? "Current Week"
                : weekOffset === -1
                  ? "Last Week"
                  : `${Math.abs(weekOffset)} weeks ${weekOffset < 0 ? "ago" : "ahead"}`}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((offset) => offset + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {weekOffset !== 0 && (
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
              Today
            </Button>
          )}
        </div>
        <Badge variant="outline" className="text-xs">{classifiedPayments.length} transactions</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Down Payments" value={`$${downPaymentTotal.toLocaleString()}`} icon={<DollarSign className="h-4 w-4" />} />
        <StatCard label="Other Booked" value={`$${bookedOtherTotal.toLocaleString()}`} icon={<CreditCard className="h-4 w-4" />} />
        <StatCard label="Consults" value={`$${consultTotal.toLocaleString()}`} icon={<Briefcase className="h-4 w-4" />} />
        <StatCard label="Transactions Total" value={`$${transactionsTotal.toLocaleString()}`} icon={<Receipt className="h-4 w-4" />} />
        <StatCard label="Filevine Tagged" value={`$${filevineTagged.toLocaleString()}`} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="LawPay Tagged" value={`$${lawPayTagged.toLocaleString()}`} icon={<Landmark className="h-4 w-4" />} />
        <StatCard label="Unclassified" value={`$${unclassifiedBooked.toLocaleString()}`} icon={<Calculator className="h-4 w-4" />} />
      </div>

      <div className="dashboard-section">
        <h3 className="mb-2 text-sm font-semibold text-foreground">Classification Logic</h3>
        <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground md:grid-cols-2">
          <p>• <strong>Transactions Total</strong> is all completed booked payments in the selected week.</p>
          <p>• <strong>Filevine Tagged</strong> only counts rows explicitly marked with Filevine notes, type, or reference.</p>
          <p>• <strong>LawPay Tagged</strong> only counts rows explicitly marked as LawPay or with a LawPay-style reference.</p>
          <p>• <strong>Unclassified</strong> means the payment is booked but not explicitly tagged yet.</p>
        </div>
      </div>

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
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No transactions this week
                  </TableCell>
                </TableRow>
              ) : (
                classifiedPayments
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-xs">{payment.date}</TableCell>
                      <TableCell className="font-medium">{payment.clientName}</TableCell>
                      <TableCell className="font-semibold">${payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.classification === "DownPayment"
                              ? "default"
                              : payment.classification === "Consult"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {payment.classification}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize text-xs">{payment.method}</TableCell>
                      <TableCell className="text-xs">{payment.collectorName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={payment.status === "completed" ? "default" : payment.status === "failed" ? "destructive" : "secondary"}
                          className="text-xs capitalize"
                        >
                          {payment.status}
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
