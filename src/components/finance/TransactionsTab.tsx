import { useState, useMemo } from "react";
import { usePaymentsClean } from "@/hooks/useSupabaseData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Search } from "lucide-react";
import type { DateRange } from "react-day-picker";

const PIE_COLORS = ["hsl(220 70% 22%)", "hsl(174 60% 40%)", "hsl(152 60% 40%)", "hsl(38 92% 50%)", "hsl(280 60% 50%)", "hsl(0 72% 51%)"];

interface Props { dateRange?: DateRange }

const TransactionsTab = ({ dateRange }: Props) => {
  const { data: payments = [], isLoading } = usePaymentsClean();
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Compute transaction type breakdown from payments_clean
  const transactionTypes = useMemo(() => {
    const typeMap = new Map<string, { total: number; count: number }>();
    for (const p of payments) {
      const type = p.payment_type || "Other";
      const existing = typeMap.get(type) || { total: 0, count: 0 };
      existing.total += Number(p.amount) || 0;
      existing.count += 1;
      typeMap.set(type, existing);
    }
    return Array.from(typeMap, ([label, stats]) => ({
      type: label,
      label,
      total: Math.round(stats.total),
      count: stats.count,
    })).sort((a, b) => b.total - a.total);
  }, [payments]);

  const totalTxnAmount = transactionTypes.reduce((s, t) => s + t.total, 0);

  const filtered = useMemo(() => {
    return payments.filter((p: any) => {
      const matchSearch = (p.client_name || "").toLowerCase().includes(search.toLowerCase());
      const matchMethod = methodFilter === "all" || (p.payment_method || "") === methodFilter;
      const matchType = typeFilter === "all" || (p.payment_type || "") === typeFilter;
      let matchDate = true;
      if (dateRange?.from) {
        const d = new Date(p.payment_date);
        matchDate = d >= dateRange.from && (!dateRange.to || d <= dateRange.to);
      }
      return matchSearch && matchMethod && matchType && matchDate;
    });
  }, [search, methodFilter, typeFilter, dateRange, payments]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Breakdown by Type</h2>
          <div className="space-y-3">
            {transactionTypes.map(t => (
              <div key={t.type} className="flex items-center gap-3">
                <span className="w-36 text-sm font-medium text-foreground">{t.label}</span>
                <div className="flex-1"><Progress value={totalTxnAmount > 0 ? (t.total / totalTxnAmount) * 100 : 0} className="h-2" /></div>
                <span className="w-20 text-right text-sm font-semibold text-foreground">${Math.round(t.total).toLocaleString()}</span>
                <Badge variant="outline" className="text-[10px] w-10 justify-center">{t.count}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Revenue by Type</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={transactionTypes} dataKey="total" nameKey="label" cx="50%" cy="50%" outerRadius={95} innerRadius={55} paddingAngle={2}
                label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}>
                {transactionTypes.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by client..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Method" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="credit_card">Card</SelectItem>
            <SelectItem value="ach">ACH</SelectItem>
            <SelectItem value="check">Check</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {transactionTypes.map(t => (
              <SelectItem key={t.type} value={t.type}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="dashboard-section overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Collector</TableHead>
              <TableHead>Case #</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 100).map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="text-xs">{p.payment_date}</TableCell>
                <TableCell className="font-medium">{p.client_name}</TableCell>
                <TableCell className="font-semibold">${(Number(p.amount) || 0).toLocaleString()}</TableCell>
                <TableCell className="text-xs">{p.payment_type || "—"}</TableCell>
                <TableCell className="capitalize text-xs">{(p.payment_method || "").replace("_", " ")}</TableCell>
                <TableCell className="text-xs">{p.collector_name || p.contract_collector || "—"}</TableCell>
                <TableCell className="font-mono text-xs">{p.case_number || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionsTab;
