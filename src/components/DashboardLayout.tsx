import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import ClientSearchBar from "./ClientSearchBar";

const DashboardLayout = ({ children, title }: { children: ReactNode; title?: string }) => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="ml-64 min-h-screen">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-6">
          <p className="text-sm font-semibold text-foreground">{title || "LexCollect"}</p>
          <ClientSearchBar />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
