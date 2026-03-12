import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminDashboard from "./pages/AdminDashboard";
import CollectionsDashboard from "./pages/CollectionsDashboard";
import LegalDashboard from "./pages/LegalDashboard";
import AROversightDashboard from "./pages/AROversightDashboard";
import ReportingPage from "./pages/ReportingPage";
import ContractsPage from "./pages/ContractsPage";
import CollectorDashboard from "./pages/CollectorDashboard";
import ClientLookup from "./pages/ClientLookup";
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
          <Route path="/ar-oversight" element={<AROversightDashboard />} />
          <Route path="/reporting" element={<ReportingPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/clients" element={<ClientLookup />} />
          <Route path="/collector/:collectorId" element={<CollectorDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
