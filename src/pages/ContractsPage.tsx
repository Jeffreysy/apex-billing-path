import DashboardLayout from "@/components/DashboardLayout";
import { useMergedClients, usePaymentsData } from "@/hooks/useSupabaseData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContractsListTab from "@/components/contracts/ContractsListTab";
import WeeklyReportingTab from "@/components/contracts/WeeklyReportingTab";
import AgingAutomationTab from "@/components/contracts/AgingAutomationTab";

const ContractsPage = () => {
  const { data: clients = [], isLoading } = useMergedClients();
  const { data: payments = [], isLoading: payLoading } = usePaymentsData();

  if (isLoading || payLoading) {
    return (
      <DashboardLayout title="Contracts & AR">
        <div className="p-8 text-center text-muted-foreground">Loading contracts...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Contracts & AR">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Contracts & Accounts Receivable</h1>
        <p className="text-muted-foreground">
          All contracts, weekly performance, and aging-bucket follow-up
        </p>
      </div>

      <Tabs defaultValue="contracts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Reporting</TabsTrigger>
          <TabsTrigger value="aging">Automation / Aging</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts">
          <ContractsListTab clients={clients} />
        </TabsContent>
        <TabsContent value="weekly">
          <WeeklyReportingTab clients={clients} payments={payments} />
        </TabsContent>
        <TabsContent value="aging">
          <AgingAutomationTab clients={clients} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ContractsPage;
