import { Link, useLocation } from "react-router-dom";
import {
  Phone,
  DollarSign,
  TrendingUp,
  LayoutDashboard,
  FileText,
  Search,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Admin Dashboard", icon: LayoutDashboard },
  { path: "/reporting", label: "Reporting & Forecast", icon: TrendingUp },
  { path: "/contracts", label: "Contracts & AR", icon: FileText },
  { path: "/clients", label: "Client Lookup", icon: Search },
  { path: "/collector/c1", label: "Sarah Mitchell", icon: Phone },
  { path: "/collector/c2", label: "James Rodriguez", icon: Phone },
  { path: "/collector/c3", label: "Aisha Patel", icon: Phone },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <DollarSign className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-sidebar-primary-foreground">LexCollect</h1>
          <p className="text-xs text-sidebar-foreground/60">Billing & Collections</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Admin
        </p>
        {navItems.slice(0, 3).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Collectors
        </p>
        {navItems.slice(3).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-sidebar-foreground/50">v1.0 Prototype</p>
      </div>
    </aside>
  );
};

export default AppSidebar;
