import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export interface MonthOption {
  label: string;
  value: string; // "YYYY-MM" or "all"
  from: Date | null;
  to: Date | null;
}

export function getMonthOptions(count = 6): MonthOption[] {
  const now = new Date();
  const options: MonthOption[] = [];
  for (let i = 0; i < count; i++) {
    const d = subMonths(now, i);
    options.push({
      label: format(d, "MMMM yyyy"),
      value: format(d, "yyyy-MM"),
      from: startOfMonth(d),
      to: endOfMonth(d),
    });
  }
  options.push({ label: "All Time", value: "all", from: null, to: null });
  return options;
}

export function filterByMonth<T>(items: T[], dateKey: string, monthValue: string): T[] {
  if (monthValue === "all") return items;
  return items.filter((item: any) => {
    const val = item[dateKey];
    if (!val) return false;
    return String(val).startsWith(monthValue);
  });
}

interface MonthFilterProps {
  value: string;
  onChange: (value: string) => void;
  options?: MonthOption[];
}

const MonthFilter = ({ value, onChange, options }: MonthFilterProps) => {
  const opts = options || getMonthOptions();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {opts.map(o => (
          <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MonthFilter;
