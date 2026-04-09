import { Link, useLocation } from "react-router-dom";
import {
  Phone, DollarSign, TrendingUp, LayoutDashboard, FileText, Search,
  Scale, Eye, Users, ChevronDown, ChevronRight, ListOrdered, AlertTriangle, Settings,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import {
  canAccessAdmin,
  canAccessClients,
  canAccessCollections,
  canAccessContracts,
  canAccessFinancial,
  canAccessLegal,
  canAccessReporting,
  canAccessSettings,
} from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sections = [
  {
    label: "Admin",
    items: [
      { path: "/", label: "Admin Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Departments",
    items: [
      { path: "/collections", label: "Collections", icon: Phone },
      { path: "/collections/queue", label: "Call Queue", icon: ListOrdered },
      { path: "/collections/escalations", label: "Escalations", icon: AlertTriangle },
      { path: "/legal", label: "Legal", icon: Scale },
      { path: "/financial-oversight", label: "Financial Oversight", icon: Eye },
      { path: "/reporting", label: "Reporting & Forecast", icon: TrendingUp },
      { path: "/contracts", label: "Contracts & AR", icon: FileText },
      { path: "/clients", label: "Client Lookup", icon: Search },
      { path: "/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    label: "Collectors",
    items: [
      { path: "/collector/Alejandro A", label: "Alejandro A", icon: Users },
      { path: "/collector/Patricio D", label: "Patricio D", icon: Phone },
      { path: "/collector/Maritza V", label: "Maritza V", icon: Phone },
    ],
  },
];

const AppSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { profile, role } = useAuth();

  const toggle = (label: string) => setCollapsed((previous) => ({ ...previous, [label]: !previous[label] }));

  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.path === "/") return canAccessAdmin(role);
        if (item.path === "/collections" || item.path === "/collections/queue" || item.path === "/collections/escalations") {
          return canAccessCollections(role);
        }
        if (item.path === "/legal") return canAccessLegal(role);
        if (item.path === "/financial-oversight") return canAccessFinancial(role);
        if (item.path === "/reporting") return canAccessReporting(role);
        if (item.path === "/contracts") return canAccessContracts(role);
        if (item.path === "/clients") return canAccessClients(role);
        if (item.path === "/settings") return canAccessSettings(role);
        if (item.path.startsWith("/collector/")) return canAccessCollections(role);
        return false;
      }),
    }))
    .filter((section) => section.items.length > 0);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message || "Unable to sign out");
      return;
    }
    window.location.href = "/login";
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <DollarSign className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-sidebar-primary-foreground">LexCollect</h1>
          <p className="text-[10px] text-sidebar-foreground/60">Billing &amp; Collections</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {filteredSections.map((section) => {
          const isCollapsed = collapsed[section.label];
          return (
            <div key={section.label} className="mb-1">
              <button
                onClick={() => toggle(section.label)}
                className="mb-1 flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
              >
                {section.label}
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {!isCollapsed && section.items.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== "/" && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="truncate text-xs">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="mb-3 rounded-lg border border-sidebar-border/60 px-3 py-2">
          <p className="truncate text-xs font-medium text-sidebar-primary-foreground">
            {profile?.full_name || profile?.email || "Authenticated user"}
          </p>
          <p className="truncate text-[10px] uppercase tracking-wide text-sidebar-foreground/50">
            {role ? role.replace("_", " ") : "No role assigned"}
          </p>
        </div>
        <Button variant="outline" size="sm" className="mb-3 w-full justify-start text-xs" onClick={handleSignOut}>
          Sign Out
        </Button>
        <p className="text-[10px] text-sidebar-foreground/50">v2.0 - Role-Based Platform</p>
      </div>
    </aside>
  );
};

export default AppSidebar;
