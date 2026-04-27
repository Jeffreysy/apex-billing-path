import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import { ALL_USER_ROLES, getDefaultRouteForRole, type UserRole } from "./lib/auth";
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
import EscalationManagementPage from "./pages/EscalationManagementPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ADMIN_ROLES: UserRole[] = ["admin", "partner"];
const COLLECTIONS_ROLES: UserRole[] = ["admin", "partner", "billing_clerk"];
const LEGAL_ROLES: UserRole[] = ["admin", "partner", "attorney", "paralegal"];
const FINANCIAL_ROLES: UserRole[] = ["admin", "partner", "billing_clerk", "read_only"];
const CLIENT_ROLES: UserRole[] = ALL_USER_ROLES;
const SETTINGS_ROLES: UserRole[] = ALL_USER_ROLES;

const RoleLanding = () => {
  const { role } = useAuth();
  return <Navigate to={getDefaultRouteForRole(role)} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><RoleLanding /></ProtectedRoute>} />
            <Route path="/collections" element={<ProtectedRoute allowedRoles={COLLECTIONS_ROLES}><CollectionsDashboard /></ProtectedRoute>} />
            <Route path="/legal" element={<ProtectedRoute allowedRoles={LEGAL_ROLES}><LegalDashboard /></ProtectedRoute>} />
            <Route path="/ar-oversight" element={<ProtectedRoute allowedRoles={FINANCIAL_ROLES}><FinancialOversightDashboard /></ProtectedRoute>} />
            <Route path="/financial-oversight" element={<ProtectedRoute allowedRoles={FINANCIAL_ROLES}><FinancialOversightDashboard /></ProtectedRoute>} />
            <Route path="/reporting" element={<ProtectedRoute allowedRoles={FINANCIAL_ROLES}><ReportingPage /></ProtectedRoute>} />
            <Route path="/contracts" element={<ProtectedRoute allowedRoles={FINANCIAL_ROLES}><ContractsPage /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute allowedRoles={CLIENT_ROLES}><ClientLookup /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={SETTINGS_ROLES}><SettingsPage /></ProtectedRoute>} />
            <Route path="/collections/queue" element={<ProtectedRoute allowedRoles={COLLECTIONS_ROLES}><CallQueuePage /></ProtectedRoute>} />
            <Route path="/collections/escalations" element={<ProtectedRoute allowedRoles={COLLECTIONS_ROLES}><EscalationManagementPage /></ProtectedRoute>} />
            <Route path="/collections/workspace/:accountId" element={<ProtectedRoute allowedRoles={COLLECTIONS_ROLES}><CollectorWorkspace /></ProtectedRoute>} />
            <Route path="/collector/:collectorId" element={<ProtectedRoute allowedRoles={COLLECTIONS_ROLES}><CollectorDashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
