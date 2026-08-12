import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { CreditCard, DollarSign, CheckCircle, TrendingUp, Users } from "lucide-react";

type Row = {
  motion: string;
  cohort_date: string;
  cohort_size: number;
  emailable: number;
  at_risk_dollars: number;
  recovered_clients: number;
  recovered_dollars: number;
  recovery_rate_pct: number;
};

function usd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
}

const KPI = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
    </CardContent>
  </Card>
);

const CardRecoveryTab = () => {
  const { data: rows = [], isLoading } = useQuery<Row[]>({
    queryKey: ["card-recovery-effectiveness"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("v_card_recovery_effectiveness")
        .select("*")
        .order("cohort_date", { ascending: false });
      return (data as Row[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const latest = rows[0];
  const chartData = [...rows]
    .reverse()
    .map((r) => ({ date: r.cohort_date, recovered: Number(r.recovered_dollars), atRisk: Number(r.at_risk_dollars) }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Card Recovery Effectiveness</h2>
          <Badge variant="outline" className="text-[10px]">willing payers · broken auto-draft</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Willing payers on an autopay plan whose most recent scheduled draft did not go through — a
          billing-nudge segment (&ldquo;update your card&rdquo;), <span className="font-medium">not a delinquency list</span>.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Context (client-ar-agent, 2026-07-20 book): the firm&rsquo;s autopay-collected decline is ~86% healthy plan
          <span className="font-medium"> graduation</span> (paid-in-full), <span className="font-medium">not</span> a card leak.
          The genuine recoverable failed-card balance is <span className="font-medium">~$928K / 228 clients</span> (current AR).
          The cohort below is broader and includes some abandonment — do not read the cohort plan balance as the size of the card leak.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !latest ? (
        <p className="text-sm text-muted-foreground">No cohort snapshots yet.</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-5">
            <KPI icon={Users} label="Targeted (latest cohort)" value={String(latest.cohort_size)} sub={`${latest.emailable} emailable · ${latest.cohort_date}`} />
            <KPI icon={DollarSign} label="Cohort plan balance" value={usd(latest.at_risk_dollars)} sub="full remaining plan balance — larger than the current failed-card leak (~$928K)" />
            <KPI icon={CheckCircle} label="Recovered clients" value={String(latest.recovered_clients)} />
            <KPI icon={DollarSign} label="Recovered $" value={usd(latest.recovered_dollars)} />
            <KPI icon={TrendingUp} label="Recovery rate" value={`${latest.recovery_rate_pct ?? 0}%`} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recovered $ by cohort</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => usd(v)} tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={(v: number) => usd(v)} />
                  <Bar dataKey="recovered" fill="hsl(var(--primary))" name="Recovered $" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cohorts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-4">Cohort date</th>
                      <th className="py-2 pr-4 text-right">Targeted</th>
                      <th className="py-2 pr-4 text-right">Plan balance</th>
                      <th className="py-2 pr-4 text-right">Recovered</th>
                      <th className="py-2 pr-4 text-right">$ Recovered</th>
                      <th className="py-2 pr-4 text-right">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.cohort_date + r.motion} className="border-b last:border-0">
                        <td className="py-2 pr-4">{r.cohort_date}</td>
                        <td className="py-2 pr-4 text-right">{r.cohort_size}</td>
                        <td className="py-2 pr-4 text-right">{usd(r.at_risk_dollars)}</td>
                        <td className="py-2 pr-4 text-right">{r.recovered_clients}</td>
                        <td className="py-2 pr-4 text-right">{usd(r.recovered_dollars)}</td>
                        <td className="py-2 pr-4 text-right">{r.recovery_rate_pct ?? 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CardRecoveryTab;
