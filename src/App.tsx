import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminDashboard from "./pages/AdminDashboard";
import CollectionsDashboard from "./pages/CollectionsDashboard";
import LegalDashboard from "./pages/LegalDashboard";
import FinancialOversightDashboard from "./pages/FinancialOversightDashboard";
import ReportingPage from "./pages/ReportingPage";
import ContractsPage from "./pages/ContractsPage";
import CollectorDashboard from "./pages/CollectorDashboard";
import ClientLookup from "./pages/ClientLookup";
import CallQueuePage from "./pages/CallQueuePage";
import CollectorWorkspace from "./pages/CollectorWorkspace";
import PaymentCommitmentsPage from "./pages/PaymentCommitmentsPage";
import EscalationManagementPage from "./pages/EscalationManagementPage";
import CollectionsKPIPage from "./pages/CollectionsKPIPage";
import DailyActivityLogPage from "./pages/DailyActivityLogPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/collections" element={<CollectionsDashboard />} />
          <Route path="/legal" element={<LegalDashboard />} />
          <Route path="/ar-oversight" element={<FinancialOversightDashboard />} />
          <Route path="/financial-oversight" element={<FinancialOversightDashboard />} />
          <Route path="/reporting" element={<ReportingPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/clients" element={<ClientLookup />} />
          <Route path="/collections/queue" element={<CallQueuePage />} />
          <Route path="/collections/workspace/:accountId" element={<CollectorWorkspace />} />
          <Route path="/collections/commitments" element={<PaymentCommitmentsPage />} />
          <Route path="/collections/escalations" element={<EscalationManagementPage />} />
          <Route path="/collections/kpi" element={<CollectionsKPIPage />} />
          <Route path="/collections/activity-log" element={<DailyActivityLogPage />} />
          <Route path="/collector/:collectorId" element={<CollectorDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
