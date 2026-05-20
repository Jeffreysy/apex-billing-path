import { ReactNode } from "react";
import { ChevronDown, Download } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/csv";

interface Props {
  id: string;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  csv?: { filename: string; headers: string[]; rows: (string | number)[][] };
  children: ReactNode;
}

const CollapsibleSection = ({ id, title, subtitle, defaultOpen = true, csv, children }: Props) => (
  <section id={id} className="rounded-lg border bg-card shadow-sm scroll-mt-24">
    <Collapsible defaultOpen={defaultOpen}>
      <header className="flex items-center justify-between border-b px-4 py-2.5">
        <CollapsibleTrigger className="group flex flex-1 items-center gap-2 text-left">
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground">{title}</h2>
            {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </CollapsibleTrigger>
        {csv && (
          <Button
            variant="ghost"
            size="sm"
            className="print-hide h-7 gap-1 text-[11px]"
            onClick={() => downloadCsv(csv.filename, csv.headers, csv.rows)}
          >
            <Download className="h-3 w-3" />
            CSV
          </Button>
        )}
      </header>
      <CollapsibleContent>
        <div className="p-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  </section>
);

export default CollapsibleSection;