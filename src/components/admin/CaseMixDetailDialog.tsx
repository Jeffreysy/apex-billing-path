import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Download, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useExecCaseMixDetail, type ExecCaseMixDetailRow } from "@/hooks/useSupabaseData";

/** Case Mix drill-down (Jeff 2026-10-16): every invoice on the month's revenue cases with client, case number
 *  and invoice number, sorted into the four piles the tile uses, filterable, exportable to CSV. Rows come from
 *  v_exec_case_mix_detail and add up to the tile. */

export const FUNDING_LABEL: Record<string, { label: string; tone: string; note: string }> = {
  sold: { label: "Sold", tone: "bg-success/10 text-success", note: "Money came in (paid or still going through)" },
  call_first: { label: "Call first", tone: "bg-warning/10 text-warning", note: "Tried to pay - down payment failed or eCheck bounced" },
  unfunded: { label: "Delete", tone: "bg-destructive/10 text-destructive", note: "No money and no payment attempt - invoice to delete" },
  awaiting: { label: "Too new", tone: "bg-muted text-muted-foreground", note: "Opened in the last week - waiting for a first payment" },
};
const PILE_ORDER = ["sold", "call_first", "unfunded", "awaiting"];

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const day = (d: string | null) => (d ? format(new Date(`${d.slice(0, 10)}T00:00:00`), "MMM d, yyyy") : "");

/** CSV for Excel: 19-digit invoice numbers and ids are written as ="..." so Excel keeps them as text instead of
 *  rounding them into scientific notation (the big-integer trap that corrupts the bank-rule key). */
export function caseMixCsv(rows: ExecCaseMixDetailRow[]): string {
  const asText = (v: string | null) => (v ? `="${v.replace(/"/g, '""')}"` : "");
  const q = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = ["Status", "Case type", "Case opened", "Client", "Case #", "Case name", "Invoice #", "Invoice amount",
    "Paid at signing", "Collected to date", "Pending", "Failed attempts", "Bounced eChecks", "Last attempt",
    "Case contract value", "Case collected to date", "MyCase case id", "MyCase invoice id", "Client id", "Payments through"];
  const lines = [head.join(",")];
  for (const r of rows) {
    lines.push([
      q(FUNDING_LABEL[r.funding_status]?.label ?? r.funding_status), q(r.reporting_family), q(r.open_date?.slice(0, 10)),
      q(r.client_name), q(r.case_number), q(r.case_name), asText(r.invoice_number), r.invoice_amount.toFixed(2),
      r.invoice_paid_at_signing.toFixed(2), r.invoice_collected_to_date.toFixed(2), r.invoice_pending_usd.toFixed(2),
      r.invoice_failed_usd.toFixed(2), r.invoice_bounced_usd.toFixed(2), q(r.last_attempt_date?.slice(0, 10)),
      r.case_contract_value.toFixed(2), r.case_collected_to_date.toFixed(2), asText(r.mycase_case_id),
      asText(r.mycase_invoice_id), q(r.client_id), q(r.payments_through?.slice(0, 10)),
    ].join(","));
  }
  return "﻿" + lines.join("\r\n") + "\r\n";
}

function downloadCsv(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CaseMixDetailDialog({
  open, onOpenChange, monthVal, monthLabel,
}: { open: boolean; onOpenChange: (o: boolean) => void; monthVal: string; monthLabel: string }) {
  const q = useExecCaseMixDetail(open ? monthVal : null);
  const [pile, setPile] = useState<string>("all");
  const [family, setFamily] = useState<string>("all");
  const [term, setTerm] = useState("");

  const all = q.data ?? [];
  const families = useMemo(() => [...new Set(all.map((r) => r.reporting_family))].sort(), [all]);
  const pileTotals = useMemo(() => {
    const t: Record<string, { cases: Set<string>; value: number }> = {};
    for (const r of all) {
      const k = r.funding_status;
      t[k] ??= { cases: new Set(), value: 0 };
      t[k].cases.add(r.mycase_case_id ?? r.case_number ?? "");
      t[k].value += r.invoice_amount;
    }
    return t;
  }, [all]);
  const rows = useMemo(() => {
    const s = term.trim().toLowerCase();
    return all
      .filter((r) => (pile === "all" || r.funding_status === pile) && (family === "all" || r.reporting_family === family))
      .filter((r) => !s || [r.client_name, r.case_number, r.case_name, r.invoice_number].some((v) => (v ?? "").toLowerCase().includes(s)))
      .sort((a, b) => PILE_ORDER.indexOf(a.funding_status) - PILE_ORDER.indexOf(b.funding_status)
        || (b.open_date ?? "").localeCompare(a.open_date ?? "") || (a.case_number ?? "").localeCompare(b.case_number ?? ""));
  }, [all, pile, family, term]);
  const shownCases = new Set(rows.map((r) => r.mycase_case_id ?? r.case_number)).size;
  const shownValue = rows.reduce((s, r) => s + r.invoice_amount, 0);
  const shownPaid = rows.reduce((s, r) => s + r.invoice_paid_at_signing, 0);
  const paymentsThrough = all.find((r) => r.payments_through)?.payments_through ?? null;

  const exportName = `case_mix_${monthVal}${pile !== "all" ? "_" + (FUNDING_LABEL[pile]?.label ?? pile).toLowerCase().replace(/\s+/g, "_") : ""}${family !== "all" ? "_" + family.toLowerCase().replace(/[^a-z0-9]+/g, "_") : ""}.csv`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[min(1200px,95vw)] overflow-hidden p-0">
        <DialogHeader className="border-b px-6 pb-4 pt-6">
          <DialogTitle>Case Mix breakdown · {monthLabel}</DialogTitle>
          <DialogDescription>
            Every invoice on the cases opened this month, with client, case and invoice number.
            {paymentsThrough ? ` Payments counted through ${day(paymentsThrough)}.` : ""}
          </DialogDescription>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => setPile("all")}
              className={`rounded-full border px-3 py-1 text-xs ${pile === "all" ? "border-foreground font-semibold" : "border-border/70 text-muted-foreground"}`}>
              All · {new Set(all.map((r) => r.mycase_case_id ?? r.case_number)).size} cases
            </button>
            {PILE_ORDER.filter((k) => pileTotals[k]).map((k) => (
              <button key={k} type="button" onClick={() => setPile(k)} title={FUNDING_LABEL[k]?.note}
                className={`rounded-full border px-3 py-1 text-xs tabular-nums ${pile === k ? "border-foreground font-semibold" : "border-border/70"} ${FUNDING_LABEL[k]?.tone ?? ""}`}>
                {FUNDING_LABEL[k]?.label ?? k} · {pileTotals[k].cases.size} · ${Math.round(pileTotals[k].value).toLocaleString()}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Select value={family} onValueChange={setFamily}>
              <SelectTrigger className="h-8 w-[220px] text-xs"><SelectValue placeholder="All case types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All case types</SelectItem>
                {families.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Client, case # or invoice #" className="h-8 w-[240px] pl-7 text-xs" />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {rows.length} invoices · {shownCases} cases · {usd(shownValue)} contract · {usd(shownPaid)} paid at signing
            </span>
            <Button size="sm" variant="outline" className="ml-auto h-8 gap-1.5 text-xs" disabled={!rows.length}
              onClick={() => downloadCsv(caseMixCsv(rows), exportName)}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto px-2 pb-4">
          {q.isLoading ? (
            <div className="py-10 text-center text-xs text-muted-foreground">Loading breakdown…</div>
          ) : q.isError ? (
            <div className="py-10 text-center text-xs text-destructive">
              Couldn&apos;t load the breakdown. <button className="underline" onClick={() => q.refetch()}>Retry</button>
            </div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">No invoices match.</div>
          ) : (
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead><TableHead>Case type</TableHead><TableHead>Opened</TableHead>
                  <TableHead>Client (or case name)</TableHead><TableHead>Case #</TableHead><TableHead>Invoice #</TableHead>
                  <TableHead className="text-right">Invoice</TableHead><TableHead className="text-right">Paid at signing</TableHead>
                  <TableHead className="text-right">Collected</TableHead><TableHead className="text-right">Failed / bounced</TableHead>
                  <TableHead>Last attempt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={`${r.mycase_invoice_id ?? r.invoice_number}-${i}`}>
                    <TableCell>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${FUNDING_LABEL[r.funding_status]?.tone ?? ""}`}>
                        {FUNDING_LABEL[r.funding_status]?.label ?? r.funding_status}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate" title={r.reporting_family}>{r.reporting_family}</TableCell>
                    <TableCell className="whitespace-nowrap">{day(r.open_date)}</TableCell>
                    {/* New cases are often not linked to a client record yet (VP 10-16: 102 of Oct's 115 rows); the MyCase
                        case name carries the client's name, so show it instead of a blank. */}
                    <TableCell className="max-w-[200px] truncate" title={r.client_name ?? r.case_name ?? ""}>
                      {r.client_name ?? (r.case_name ? <span className="text-muted-foreground">{r.case_name}</span> : "—")}
                    </TableCell>
                    <TableCell className="whitespace-nowrap" title={r.case_name ?? ""}>{r.case_number ?? "—"}</TableCell>
                    <TableCell className="font-mono text-[11px]">{r.invoice_number ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{usd(r.invoice_amount)}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.invoice_paid_at_signing ? usd(r.invoice_paid_at_signing) : "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.invoice_collected_to_date ? usd(r.invoice_collected_to_date) : "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.invoice_failed_usd || r.invoice_bounced_usd ? usd(r.invoice_failed_usd + r.invoice_bounced_usd) : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{day(r.last_attempt_date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
