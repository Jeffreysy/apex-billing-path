import DashboardLayout from "@/components/DashboardLayout";
import { useMergedClients, usePaymentsData, computeForecastData, computeWeeklyCollections, computeMonthlyCollections, computeContractAnalytics } from "@/hooks/useSupabaseData";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ReportingPage = () => {
  const { data: clients = [], isLoading: cl } = useMergedClients();
  const { data: agingRaw = [], isLoading: al } = useCollectionsByAging();

  if (cl || al) return <DashboardLayout><div className="p-8 text-center text-muted-foreground">Loading reports...</div></DashboardLayout>;

  const forecastData = computeForecastData(clients);
  const weeklyData = computeWeeklyCollections(agingRaw);
  const monthlyData = computeMonthlyCollections(agingRaw);
  const contractData = computeContractAnalytics(clients);

  return (
    <DashboardLayout>
      <div className="mb-6"><h1 className="text-2xl font-bold">Reporting & Forecasting</h1><p className="text-muted-foreground">Revenue projections, historical collections, and contract analytics</p></div>
      <div className="dashboard-section mb-6">
        <h2 className="mb-1 text-lg font-semibold">Revenue Forecast — Next 8 Weeks</h2>
        <p className="mb-4 text-sm text-muted-foreground">Projected incoming payments with optimistic and pessimistic bands</p>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
            <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Legend />
            <Area type="monotone" dataKey="optimistic" stroke="hsl(152 60% 40%)" fill="hsl(152 60% 40%)" fillOpacity={0.1} name="Optimistic" />
            <Area type="monotone" dataKey="projected" stroke="hsl(174 60% 40%)" fill="hsl(174 60% 40%)" fillOpacity={0.2} name="Projected" strokeWidth={2} />
            <Area type="monotone" dataKey="pessimistic" stroke="hsl(38 92% 50%)" fill="hsl(38 92% 50%)" fillOpacity={0.1} name="Pessimistic" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="dashboard-section mb-6">
        <h2 className="mb-4 text-lg font-semibold">Historical Collections</h2>
        <Tabs defaultValue="weekly">
          <TabsList><TabsTrigger value="weekly">Weekly</TabsTrigger><TabsTrigger value="monthly">Monthly</TabsTrigger></TabsList>
          <TabsContent value="weekly">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="collected" fill="hsl(174 60% 40%)" radius={[4, 4, 0, 0]} name="Collected" />
                <Bar dataKey="target" fill="hsl(220 70% 22%)" radius={[4, 4, 0, 0]} name="Target" opacity={0.25} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="monthly">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="collected" fill="hsl(174 60% 40%)" radius={[4, 4, 0, 0]} name="Collected" />
                <Bar dataKey="target" fill="hsl(220 70% 22%)" radius={[4, 4, 0, 0]} name="Target" opacity={0.25} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </div>
      <div className="dashboard-section">
        <h2 className="mb-1 text-lg font-semibold">Contract Analytics</h2>
        <p className="mb-4 text-sm text-muted-foreground">New contracts started vs contracts reaching full maturity each month</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={contractData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
            <Tooltip /><Legend />
            <Line type="monotone" dataKey="started" stroke="hsl(174 60% 40%)" strokeWidth={2} name="Contracts Started" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="matured" stroke="hsl(152 60% 40%)" strokeWidth={2} name="Fully Matured" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="delinquent" stroke="hsl(0 72% 51%)" strokeWidth={2} name="Delinquent" dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardLayout>
  );
};

export default ReportingPage;
