import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from "recharts";
import {
  CreditCard, Users, PhoneCall, Briefcase, Globe, TrendingUp,
} from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  auto_pay: "#3b82f6",
  collections: "#ef4444",
  client_care: "#22c55e",
  sales: "#f59e0b",
  client_selfpay: "#8b5cf6",
};

const CATEGORY_LABELS: Record<string, string> = {
  auto_pay: "Auto-Pay",
  collections: "Collections",
  client_care: "Client Care",
  sales: "Sales",
  client_selfpay: "Client Self-Pay",
};

const CATEGORIES = ["auto_pay", "collections", "client_care", "sales", "client_selfpay"] as const;
type Category = (typeof CATEGORIES)[number];

const ICONS: Record<Category, React.ElementType> = {
  auto_pay: CreditCard,
  collections: PhoneCall,
  client_care: Users,
  sales: Briefcase,
  client_selfpay: Globe,
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

type FlowRow = {
  month: string;
  auto_pay: number;
  collections: number;
  client_care: number;
  sales: number;
  client_selfpay: number;
  total: number;
};

const CollectionFlowTab = () => {
  const { data: rows = [], isLoading } = useQuery<FlowRow[]>({
    queryKey: ["collection-flow-monthly"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collection_flow_monthly" as any)
        .select("month, auto_pay, collections, client_care, sales, client_selfpay, total")
        .order("month", { ascending: true });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        month: r.month,
        auto_pay: Number(r.auto_pay),
        collections: Number(r.collections),
        client_care: Number(r.client_care),
        sales: Number(r.sales),
        client_selfpay: Number(r.client_selfpay),
        total: Number(r.total),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const latest = rows[rows.length - 1];
  const prev = rows.length >= 2 ? rows[rows.length - 2] : null;

  const chartData = useMemo(
    () => rows.map((r) => ({ ...r, label: r.month.slice(2) })),
    [rows]
  );

  if (isLoading)
    return (
      <div className="text-sm text-muted-foreground p-4">
        Loading collection flow data…
      </div>
    );

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">
        Collection Flow by Department
      </h2>

      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = ICONS[cat];
            const val = latest[cat];
            const prevVal = prev ? prev[cat] : 0;
            const change =
              prev && prevVal > 0
                ? ((val - prevVal) / prevVal) * 100
                : 0;
            return (
              <div key={cat} className="rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {CATEGORY_LABELS[cat]}
                  </span>
                </div>
                <p className="text-lg font-bold text-foreground">{fmt(val)}</p>
                {prev && prevVal > 0 && (
                  <p
                    className={`text-[10px] ${
                      change >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}% vs
                    prev
                  </p>
                )}
              </div>
            );
          })}
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Total
              </span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {fmt(latest.total)}
            </p>
            {prev && prev.total > 0 && (
              <p
                className={`text-[10px] ${
                  latest.total >= prev.total
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {latest.total >= prev.total ? "▲" : "▼"}{" "}
                {Math.abs(
                  ((latest.total - prev.total) / prev.total) * 100
                ).toFixed(1)}
                % vs prev
              </p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Monthly Revenue by Department
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />
            <XAxis dataKey="label" tick={{ fontSize: 9 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{ fontSize: 11 }}
              formatter={(value: number, name: string) => [
                fmt(value),
                CATEGORY_LABELS[name] || name,
              ]}
              labelFormatter={(label: string) => `20${label}`}
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value: string) => CATEGORY_LABELS[value] || value}
            />
            <Bar
              dataKey="auto_pay"
              stackId="a"
              fill={CATEGORY_COLORS.auto_pay}
            />
            <Bar
              dataKey="client_care"
              stackId="a"
              fill={CATEGORY_COLORS.client_care}
            />
            <Bar
              dataKey="collections"
              stackId="a"
              fill={CATEGORY_COLORS.collections}
            />
            <Bar
              dataKey="sales"
              stackId="a"
              fill={CATEGORY_COLORS.sales}
            />
            <Bar
              dataKey="client_selfpay"
              stackId="a"
              fill={CATEGORY_COLORS.client_selfpay}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border bg-card overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/50 text-muted-foreground">
              <th className="px-3 py-2 text-left font-medium">Month</th>
              <th className="px-3 py-2 text-right font-medium">Auto-Pay</th>
              <th className="px-3 py-2 text-right font-medium">Collections</th>
              <th className="px-3 py-2 text-right font-medium">Client Care</th>
              <th className="px-3 py-2 text-right font-medium">Sales</th>
              <th className="px-3 py-2 text-right font-medium">Self-Pay</th>
              <th className="px-3 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {[...rows].reverse().map((r) => (
              <tr key={r.month} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 font-medium">{r.month}</td>
                {CATEGORIES.map((cat) => (
                  <td key={cat} className="px-3 py-2 text-right font-mono">
                    {fmt(r[cat])}
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-mono font-semibold">
                  {fmt(r.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CollectionFlowTab;
