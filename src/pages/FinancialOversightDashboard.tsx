import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinanceOverviewTab from "@/components/finance/FinanceOverviewTab";
import WeeklyRevenueTab from "@/components/finance/WeeklyRevenueTab";
import ARPortfolioTab from "@/components/finance/ARPortfolioTab";
import TransactionsTab from "@/components/finance/TransactionsTab";
import ForecastingTab from "@/components/finance/ForecastingTab";
import ReportBuilderTab from "@/components/finance/ReportBuilderTab";
import TaskPanel from "@/components/TaskPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Wallet } from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

const FinancialOversightDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 90),
    to: new Date(),
  });

  const dateLabel = useMemo(() => {
    if (!dateRange?.from) return "Select date range";
    if (!dateRange.to) return format(dateRange.from, "MMM dd, yyyy");
    return `${format(dateRange.from, "MMM dd")} — ${format(dateRange.to, "MMM dd, yyyy")}`;
  }, [dateRange]);

  return (
    <DashboardLayout title="Financial Oversight">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financial Oversight</h1>
          <p className="text-muted-foreground text-sm">
            Finance command center — AR, revenue, forecasting, and reporting
          </p>
          <div className="mt-1.5 flex gap-2">
            <Badge variant="outline" className="text-[10px] gap-1">
              <Wallet className="h-3 w-3" /> Collector + CRM = unified source of truth
            </Badge>
          </div>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[260px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Revenue</TabsTrigger>
          <TabsTrigger value="portfolio">AR Portfolio</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <FinanceOverviewTab dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="weekly">
          <WeeklyRevenueTab dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="portfolio">
          <ARPortfolioTab />
        </TabsContent>
        <TabsContent value="transactions">
          <TransactionsTab dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="forecasting">
          <ForecastingTab />
        </TabsContent>
        <TabsContent value="reports">
          <ReportBuilderTab />
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <TaskPanel department="ar" />
      </div>
    </DashboardLayout>
  );
};

export default FinancialOversightDashboard;
