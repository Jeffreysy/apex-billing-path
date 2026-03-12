import { useState } from "react";
import { clients } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

const ARPortfolioTab = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => (b.totalOwed - b.totalPaid) - (a.totalOwed - a.totalPaid));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search clients or case numbers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="delinquent">Delinquent</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="new">New</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="dashboard-section overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Case #</TableHead>
              <TableHead>Case Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Owed</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Next Due</TableHead>
              <TableHead>Install. Left</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Days Past Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => {
              const pct = c.totalOwed > 0 ? Math.round((c.totalPaid / c.totalOwed) * 100) : 0;
              const paidInstallments = c.downPaymentPaid
                ? Math.min(c.installmentMonths, Math.floor((c.totalPaid - c.downPayment) / c.monthlyPayment))
                : 0;
              const remaining = Math.max(0, c.installmentMonths - Math.max(0, paidInstallments));
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-xs">{c.caseNumber}</TableCell>
                  <TableCell className="text-xs">{c.caseType}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "delinquent" ? "destructive" : c.status === "completed" ? "secondary" : "default"} className="text-xs capitalize">
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${c.totalOwed.toLocaleString()}</TableCell>
                  <TableCell>${c.totalPaid.toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">${(c.totalOwed - c.totalPaid).toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{c.nextPaymentDue}</TableCell>
                  <TableCell className="text-center">{remaining}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="h-2 w-16" />
                      <span className="text-xs">{pct}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.daysAging > 0
                      ? <Badge variant="destructive" className="text-xs">{c.daysAging}d</Badge>
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ARPortfolioTab;
