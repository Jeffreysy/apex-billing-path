import { useMemo, useState } from "react";
import { useCollectorWeeklyCoverage, type CollectorWeeklyCoverage } from "@/hooks/useSupabaseData";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";

function pctBadge(pct: number | null) {
  if (pct === null) return <Badge variant="outline" className="text-xs">—</Badge>;
  if (pct >= 5) return <Badge className="bg-green-600 text-white text-xs">{pct}%</Badge>;
  if (pct >= 2) return <Badge className="bg-amber-500 text-white text-xs">{pct}%</Badge>;
  return <Badge variant="destructive" className="text-xs">{pct}%</Badge>;
}

function shareBadge(pct: number | null) {
  if (pct === null) return <Badge variant="outline" className="text-xs">—</Badge>;
  if (pct >= 30) return <Badge className="bg-blue-600 text-white text-xs">{pct}%</Badge>;
  if (pct >= 15) return <Badge className="bg-blue-400 text-white text-xs">{pct}%</Badge>;
  return <Badge variant="secondary" className="text-xs">{pct}%</Badge>;
}

const ALL = "All Collectors";

export default function CollectorCoverageTab() {
  const { data: rows = [], isLoading } = useCollectorWeeklyCoverage(16);
  const [selectedCollector, setSelectedCollector] = useState<string>(ALL);

  // Unique collectors from data (excluding System)
  const collectors = useMemo(() => {
    const names = [...new Set(rows.map(r => r.collector))].sort();
    return [ALL, ...names];
  }, [rows]);

  // Unique weeks for the grid header
  const weeks = useMemo(() => {
    const ws = [...new Set(rows.map(r => r.week_start))].sort((a, b) => b.localeCompare(a));
    return ws.slice(0, 12);
  }, [rows]);

  // Build lookup: collector → week → row
  const lookup = useMemo(() => {
    const m: Record<string, Record<string, CollectorWeeklyCoverage>> = {};
    for (const r of rows) {
      if (!m[r.collector]) m[r.collector] = {};
      m[r.collector][r.week_start] = r;
    }
    return m;
  }, [rows]);

  // Filtered collectors for the table
  const displayCollectors = useMemo(() => {
    if (selectedCollector === ALL) return Object.keys(lookup).sort();
    return [selectedCollector];
  }, [selectedCollector, lookup]);

  // Total AR clients (same for all rows)
  const totalARClients = rows[0]?.total_ar_clients ?? 0;

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading coverage data…</div>;
  }

  if (rows.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No activity data found.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header + filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Collector Coverage</h2>
          <p className="text-xs text-muted-foreground">
            Unique clients contacted per week ÷ {totalARClients.toLocaleString()} total AR accounts
          </p>
        </div>
        <Select value={selectedCollector} onValueChange={setSelectedCollector}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {collectors.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Coverage grid */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium w-36">Collector</th>
              {weeks.map(w => (
                <th key={w} className="px-2 py-2 text-center font-medium whitespace-nowrap">
                  {format(parseISO(w), "MMM d")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayCollectors.map(collector => (
              <tr key={collector} className="border-t hover:bg-muted/20">
                <td className="px-3 py-2 font-medium truncate max-w-[140px]">{collector}</td>
                {weeks.map(w => {
                  const row = lookup[collector]?.[w];
                  return (
                    <td key={w} className="px-2 py-2 text-center">
                      {row ? (
                        <div className="flex flex-col items-center gap-0.5">
                          {pctBadge(Number(row.coverage_pct))}
                          <span className="text-[10px] text-muted-foreground">
                            {row.unique_clients_contacted} clients
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Weekly detail cards for selected collector */}
      {selectedCollector !== ALL && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {selectedCollector} — Weekly Detail
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {weeks.map(w => {
              const row = lookup[selectedCollector]?.[w];
              if (!row) return null;
              return (
                <div key={w} className="rounded-lg border p-3 space-y-1">
                  <p className="text-xs font-medium">{format(parseISO(w), "MMM d")} – {format(parseISO(row.week_end), "MMM d")}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Coverage</span>
                    {pctBadge(Number(row.coverage_pct))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Team share</span>
                    {shareBadge(Number(row.team_share_pct))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Productive</span>
                    <span className="text-xs font-medium">{row.productivity_pct ?? 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Activities</span>
                    <span className="text-xs font-medium">{row.total_activities}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground pt-1">
        <span>Coverage: <span className="text-green-600 font-medium">≥5%</span> good · <span className="text-amber-500 font-medium">2–5%</span> ok · <span className="text-destructive font-medium">&lt;2%</span> low</span>
        <span>Coverage = unique clients contacted ÷ total AR accounts</span>
      </div>
    </div>
  );
}
