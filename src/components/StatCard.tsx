import { ReactNode } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  icon?: ReactNode;
  caption?: string;
}

const StatCard = ({ label, value, change, icon, caption }: StatCardProps) => {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <p className="metric-label">{label}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <p className="metric-value mt-2">{value}</p>
      {caption && <p className="mt-2 text-xs text-muted-foreground">{caption}</p>}
      {change !== undefined && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${change >= 0 ? "text-success" : "text-destructive"}`}>
          {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {Math.abs(change)}% vs last period
        </div>
      )}
    </div>
  );
};

export default StatCard;
