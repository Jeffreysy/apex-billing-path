import { useState } from "react";
import { useARDashboard } from "@/hooks/useSupabaseData";
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
  const { data: rows = [], isLoading } = useARDashboard();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading AR portfolio...</div>;

  const filtered = rows.filter((c: any) => {
    const matchesSearch = (c.client_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.case_number || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || (c.contract_status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }).sort((a: any, b: any) => (Number(b.remaining_balance) || 0) - (Number(a.remaining_balance) || 0));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search clients or case numbers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Risk">Risk</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="New">New</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="dashboard-section overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Case #</TableHead>
              <TableHead>Practice Area</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Collected</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Next Due</TableHead>
              <TableHead>Install. Left</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Days Past Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 100).map((c: any) => {
              const pct = Number(c.collection_pct) || 0;
              const remaining = Number(c.installments_remaining) || 0;
              const status = c.contract_status || "";
              const daysOut = Number(c.days_past_due) || 0;
              return (
                <TableRow key={c.contract_id}>
                  <TableCell className="font-medium">{c.client_name}</TableCell>
                  <TableCell className="font-mono text-xs">{c.case_number}</TableCell>
                  <TableCell className="text-xs">{c.practice_area}</TableCell>
                  <TableCell>
                    <Badge variant={status === "Risk" ? "destructive" : status === "Completed" ? "secondary" : "default"} className="text-xs">
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell>${(Number(c.total_contract_value) || 0).toLocaleString()}</TableCell>
                  <TableCell>${(Number(c.amount_collected) || 0).toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">${(Number(c.remaining_balance) || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{c.next_due_date || "—"}</TableCell>
                  <TableCell className="text-center">{remaining}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="h-2 w-16" />
                      <span className="text-xs">{Math.round(pct)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {daysOut > 0
                      ? <Badge variant="destructive" className="text-xs">{daysOut}d</Badge>
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filtered.length > 100 && <p className="mt-2 text-xs text-muted-foreground text-center">Showing first 100 of {filtered.length} contracts</p>}
      </div>
    </div>
  );
};

export default ARPortfolioTab;
