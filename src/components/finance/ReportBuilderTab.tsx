import { useState, useMemo } from "react";
import { usePaymentsData, useMergedClients, useCollectors } from "@/hooks/useSupabaseData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Download, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

const agingBuckets = ["Current", "1-30 days", "31-60 days", "61-90 days", "90+ days"];

const ReportBuilderTab = () => {
  const { data: payments = [], isLoading: pl } = usePaymentsData();
  const { data: clients = [], isLoading: cl } = useMergedClients();
  const { data: collectors = [], isLoading: col } = useCollectors();

  const [reportDateRange, setReportDateRange] = useState<DateRange | undefined>();
  const [paymentType, setPaymentType] = useState("all");
  const [paymentSource, setPaymentSource] = useState("all");
  const [collector, setCollector] = useState("all");
  const [clientSearch, setClientSearch] = useState("");
  const [caseType, setCaseType] = useState("all");
  const [contractStatus, setContractStatus] = useState("all");
  const [delinquencyStatus, setDelinquencyStatus] = useState("all");
  const [agingBucket, setAgingBucket] = useState("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  if (pl || cl || col) return <div className="p-8 text-center text-muted-foreground">Loading report builder...</div>;

  const caseTypes = [...new Set(clients.map(c => c.caseType).filter(Boolean))].sort();

  const filteredPayments = payments.filter(p => {
    const client = clients.find(c => c.name.toLowerCase() === p.clientName.toLowerCase());
    if (reportDateRange?.from) {
      const d = new Date(p.date);
      if (d < reportDateRange.from) return false;
      if (reportDateRange.to && d > reportDateRange.to) return false;
    }
    if (paymentType !== "all" && p.method !== paymentType) return false;
    if (collector !== "all" && p.collectorName !== collector) return false;
    if (clientSearch && !p.clientName.toLowerCase().includes(clientSearch.toLowerCase())) return false;
    if (caseType !== "all" && client?.caseType !== caseType) return false;
    if (contractStatus !== "all" && client?.status !== contractStatus) return false;
    if (delinquencyStatus === "delinquent" && (!client || client.daysAging === 0)) return false;
    if (delinquencyStatus === "current" && client && client.daysAging > 0) return false;
    if (agingBucket !== "all" && client) {
      const d = client.daysAging;
      if (agingBucket === "Current" && d > 0) return false;
      if (agingBucket === "1-30 days" && (d < 1 || d > 30)) return false;
      if (agingBucket === "31-60 days" && (d < 31 || d > 60)) return false;
      if (agingBucket === "61-90 days" && (d < 61 || d > 90)) return false;
      if (agingBucket === "90+ days" && d < 91) return false;
    }
    if (minAmount && p.amount < Number(minAmount)) return false;
    if (maxAmount && p.amount > Number(maxAmount)) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const totalFiltered = filteredPayments.reduce((s, p) => s + p.amount, 0);

  const clearFilters = () => {
    setReportDateRange(undefined); setPaymentType("all"); setPaymentSource("all");
    setCollector("all"); setClientSearch(""); setCaseType("all");
    setContractStatus("all"); setDelinquencyStatus("all"); setAgingBucket("all");
    setMinAmount(""); setMaxAmount("");
  };

  const dateLabel = reportDateRange?.from
    ? reportDateRange.to ? `${format(reportDateRange.from, "MMM dd")} — ${format(reportDateRange.to, "MMM dd")}` : format(reportDateRange.from, "MMM dd, yyyy")
    : "Any date";

  return (
    <div className="space-y-6">
      <div className="dashboard-section">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Filter className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold text-foreground">Report Builder</h2></div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-4 w-4 mr-1" /> Clear</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Export CSV</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <div className="space-y-1">
            <Label className="text-xs">Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("w-full justify-start text-left text-xs", !reportDateRange && "text-muted-foreground")}>
                  <CalendarIcon className="mr-1 h-3 w-3" />{dateLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" selected={reportDateRange} onSelect={setReportDateRange} numberOfMonths={2} className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Payment Method</Label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="card">Card</SelectItem><SelectItem value="ach">ACH</SelectItem><SelectItem value="check">Check</SelectItem><SelectItem value="cash">Cash</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Payment Source</Label>
            <Select value={paymentSource} onValueChange={setPaymentSource}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Sources</SelectItem><SelectItem value="collector">Collector</SelectItem><SelectItem value="crm">CRM / Auto-Pay</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Collector</Label>
            <Select value={collector} onValueChange={setCollector}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All</SelectItem>{collectors.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Client</Label>
            <Input placeholder="Search client..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Case Type</Label>
            <Select value={caseType} onValueChange={setCaseType}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All</SelectItem>{caseTypes.map(ct => <SelectItem key={ct} value={ct}>{ct}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Contract Status</Label>
            <Select value={contractStatus} onValueChange={setContractStatus}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="delinquent">Delinquent</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="new">New</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Delinquency</Label>
            <Select value={delinquencyStatus} onValueChange={setDelinquencyStatus}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="current">Current</SelectItem><SelectItem value="delinquent">Delinquent</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Aging Bucket</Label>
            <Select value={agingBucket} onValueChange={setAgingBucket}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All</SelectItem>{agingBuckets.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Amount Range</Label>
            <div className="flex gap-1">
              <Input placeholder="Min" value={minAmount} onChange={e => setMinAmount(e.target.value)} className="h-8 text-xs w-1/2" type="number" />
              <Input placeholder="Max" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} className="h-8 text-xs w-1/2" type="number" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground"><strong className="text-foreground">{filteredPayments.length}</strong> transactions totaling <strong className="text-foreground">${totalFiltered.toLocaleString()}</strong></p>
      </div>

      <div className="dashboard-section overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead><TableHead>Client</TableHead><TableHead>Case Type</TableHead><TableHead>Amount</TableHead>
              <TableHead>Method</TableHead><TableHead>Collector</TableHead><TableHead>Status</TableHead><TableHead>Client Status</TableHead><TableHead>Days Aging</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.slice(0, 50).map(p => {
              const client = clients.find(c => c.name.toLowerCase() === p.clientName.toLowerCase());
              return (
                <TableRow key={p.id}>
                  <TableCell className="text-xs">{p.date}</TableCell>
                  <TableCell className="font-medium">{p.clientName}</TableCell>
                  <TableCell className="text-xs">{client?.caseType ?? "—"}</TableCell>
                  <TableCell className="font-semibold">${p.amount.toLocaleString()}</TableCell>
                  <TableCell className="capitalize text-xs">{p.method}</TableCell>
                  <TableCell className="text-xs">{p.collectorName}</TableCell>
                  <TableCell><Badge variant={p.status === "completed" ? "default" : p.status === "failed" ? "destructive" : "secondary"} className="text-xs capitalize">{p.status}</Badge></TableCell>
                  <TableCell><Badge variant={client?.status === "delinquent" ? "destructive" : "outline"} className="text-xs capitalize">{client?.status ?? "—"}</Badge></TableCell>
                  <TableCell>{client && client.daysAging > 0 ? <Badge variant="destructive" className="text-xs">{client.daysAging}d</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredPayments.length > 50 && <p className="mt-2 text-xs text-muted-foreground text-center">Showing first 50 of {filteredPayments.length} results</p>}
      </div>
    </div>
  );
};

export default ReportBuilderTab;
