import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 min-h-screen p-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
