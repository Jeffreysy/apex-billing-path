import { useMemo } from "react";
import { Client, Payment } from "@/data/mockData";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Flag, FilePlus, Download } from "lucide-react";
import { downloadCSV } from "./contractsExport";
import { format, subDays, parseISO, differenceInDays, isValid } from "date-fns";

const safeDate = (d?: string) => {
  if (!d) return null;
  const parsed = parseISO(d);
  return isValid(parsed) ? parsed : null;
};

const WeeklyReportingTab = ({ clients, payments }: { clients: Client[]; payments: Payment[] }) => {
  const today = new Date();
  const weekAgo = subDays(today, 7);

  const data = useMemo(() => {
    // Clients whose nextPaymentDue was in the last 7 days
    const dueLastWeek = clients.filter((c) => {
      const due = safeDate(c.nextPaymentDue);
      return due && due >= weekAgo && due <= today;
    });

    // Met deadline: a payment recorded within 3 days of due date
    const met: Client[] = [];
    const missed: Client[] = [];
    for (const c of dueLastWeek) {
      const due = safeDate(c.nextPaymentDue)!;
      const paidNearby = payments.some((p) => {
        if (p.clientId !== c.id) return false;
        const pd = safeDate(p.date);
        if (!pd) return false;
        const diff = Math.abs(differenceInDays(pd, due));
        return diff <= 3;
      });
      if (paidNearby) met.push(c);
      else missed.push(c);
    }

    // Finishing soon: < 2 monthly payments remaining
    const finishingSoon = clients.filter((c) => {
      const remaining = Math.max(0, c.totalOwed - c.totalPaid);
      if (remaining <= 0 || c.monthlyPayment <= 0) return false;
      const monthsLeft = remaining / c.monthlyPayment;
      return monthsLeft > 0 && monthsLeft <= 2 && c.status !== "completed";
    });

    // New contracts started in last 7 days
    const newContracts = clients.filter((c) => {
      const start = safeDate(c.contractStart);
      return start && start >= weekAgo && start <= today;
    });

    return { met, missed, finishingSoon, newContracts };
  }, [clients, payments]);

  const exportContacts = (label: string, list: Client[]) => {
    const rows = list.map((c) => ({
      client: c.name,
      case_number: c.caseNumber,
      phone: c.phone,
      email: c.email,
      status: c.status,
      next_payment_due: c.nextPaymentDue || "",
      monthly_payment: c.monthlyPayment,
      remaining_balance: Math.max(0, c.totalOwed - c.totalPaid),
      collector: c.assignedCollector || "",
    }));
    downloadCSV(`${label}_${format(new Date(), "yyyy-MM-dd")}.csv`, rows);
  };

  const Section = ({
    title,
    list,
    exportKey,
    emptyMsg,
  }: { title: string; list: Client[]; exportKey: string; emptyMsg: string }) => (
    <div className="dashboard-section">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{list.length} clients</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => exportContacts(exportKey, list)} disabled={list.length === 0}>
          <Download className="h-4 w-4" /> Contacts CSV
        </Button>
      </div>
      {list.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{emptyMsg}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Client</th>
                <th className="pb-2 font-medium">Phone</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Next Due</th>
                <th className="pb-2 font-medium">Monthly</th>
                <th className="pb-2 font-medium">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {list.slice(0, 25).map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{c.name}</td>
                  <td className="py-2 text-muted-foreground">{c.phone || "—"}</td>
                  <td className="py-2 text-muted-foreground">{c.email || "—"}</td>
                  <td className="py-2 text-muted-foreground">{c.nextPaymentDue || "—"}</td>
                  <td className="py-2">${c.monthlyPayment.toLocaleString()}</td>
                  <td className="py-2">${Math.max(0, c.totalOwed - c.totalPaid).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length > 25 && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Showing 25 of {list.length}. Export CSV for full list.
            </p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Last 7 Days</h2>
          <p className="text-xs text-muted-foreground">
            {format(weekAgo, "MMM d")} – {format(today, "MMM d, yyyy")}
          </p>
        </div>
        <Badge variant="outline" className="text-xs">Rolling 7-day window</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Met Deadline"
          value={data.met.length.toString()}
          icon={<CheckCircle2 className="h-4 w-4 text-success" />}
          caption="Paid within 3 days of due date"
        />
        <StatCard
          label="Missed Deadline"
          value={data.missed.length.toString()}
          icon={<XCircle className="h-4 w-4 text-destructive" />}
          caption="Due last 7 days, no payment recorded"
        />
        <StatCard
          label="Finishing Soon"
          value={data.finishingSoon.length.toString()}
          icon={<Flag className="h-4 w-4 text-warning" />}
          caption="≤ 2 payments remaining"
        />
        <StatCard
          label="New Contracts"
          value={data.newContracts.length.toString()}
          icon={<FilePlus className="h-4 w-4 text-primary" />}
          caption="Started in last 7 days"
        />
      </div>

      <Section title="Missed Deadline" list={data.missed} exportKey="missed_deadline" emptyMsg="No missed deadlines this week 🎉" />
      <Section title="Met Deadline" list={data.met} exportKey="met_deadline" emptyMsg="No payments matched a recent due date." />
      <Section title="Finishing Soon" list={data.finishingSoon} exportKey="finishing_soon" emptyMsg="No contracts wrapping up soon." />
      <Section title="New Contracts" list={data.newContracts} exportKey="new_contracts" emptyMsg="No new contracts in the last 7 days." />
    </div>
  );
};

export default WeeklyReportingTab;