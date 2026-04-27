import { useMemo, useRef, useState } from "react";
import { Client } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Image as ImageIcon, Search } from "lucide-react";
import { downloadCSV, downloadJPEG } from "./contractsExport";
import { format } from "date-fns";

const statusBadge = (status: string) => {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    delinquent: "destructive",
    completed: "secondary",
    new: "outline",
  };
  return <Badge variant={map[status] || "default"} className="text-xs capitalize">{status}</Badge>;
};

const ContractsListTab = ({ clients }: { clients: Client[] }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const tableRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const order: Record<string, number> = { delinquent: 0, active: 1, new: 2, completed: 3 };
    return clients
      .filter((c) => statusFilter === "all" || c.status === statusFilter)
      .filter((c) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.caseNumber.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.assignedCollector || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (order[a.status] ?? 4) - (order[b.status] ?? 4));
  }, [clients, search, statusFilter]);

  const exportCSV = () => {
    const rows = filtered.map((c) => ({
      client: c.name,
      case_number: c.caseNumber,
      email: c.email,
      phone: c.phone,
      status: c.status,
      total_owed: c.totalOwed,
      total_paid: c.totalPaid,
      remaining_balance: Math.max(0, c.totalOwed - c.totalPaid),
      progress_pct: c.totalOwed > 0 ? Math.round((c.totalPaid / c.totalOwed) * 100) : 0,
      monthly_payment: c.monthlyPayment,
      next_payment_due: c.nextPaymentDue || "",
      days_aging: c.daysAging,
      collector: c.assignedCollector || "",
      practice_area: c.caseType || "",
      contract_start: c.contractStart || "",
    }));
    downloadCSV(`contracts_${format(new Date(), "yyyy-MM-dd")}.csv`, rows);
  };

  const exportJPEG = async () => {
    if (!tableRef.current) return;
    await downloadJPEG(`contracts_${format(new Date(), "yyyy-MM-dd")}.jpeg`, tableRef.current);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search client, case #, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="delinquent">Delinquent</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportJPEG}>
            <ImageIcon className="h-4 w-4" /> JPEG
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length.toLocaleString()} of {clients.length.toLocaleString()} contracts
      </p>

      <div ref={tableRef} className="dashboard-section overflow-x-auto bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">Client</th>
              <th className="pb-3 font-medium">Contact</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Total Owed</th>
              <th className="pb-3 font-medium">Paid</th>
              <th className="pb-3 font-medium">Progress</th>
              <th className="pb-3 font-medium">Monthly</th>
              <th className="pb-3 font-medium">Next Due</th>
              <th className="pb-3 font-medium">Collector</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 500).map((c) => {
              const pct = c.totalOwed > 0 ? Math.round((c.totalPaid / c.totalOwed) * 100) : 0;
              return (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.caseNumber || "—"}</div>
                  </td>
                  <td className="py-3 text-xs">
                    <div>{c.phone || "—"}</div>
                    <div className="text-muted-foreground">{c.email || "—"}</div>
                  </td>
                  <td className="py-3">{statusBadge(c.status)}</td>
                  <td className="py-3">${c.totalOwed.toLocaleString()}</td>
                  <td className="py-3">${c.totalPaid.toLocaleString()}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="h-2 w-20" />
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                    </div>
                  </td>
                  <td className="py-3">${c.monthlyPayment.toLocaleString()}</td>
                  <td className="py-3 text-muted-foreground">{c.nextPaymentDue || "—"}</td>
                  <td className="py-3 text-muted-foreground">{c.assignedCollector || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length > 500 && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Displaying first 500 rows. Export CSV to see all {filtered.length.toLocaleString()}.
          </p>
        )}
      </div>
    </div>
  );
};

export default ContractsListTab;