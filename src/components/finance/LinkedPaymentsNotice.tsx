import { Info } from "lucide-react";
import { useCertifiedMonthlyCollections } from "@/hooks/useSupabaseData";

/** Banner for any screen that lists payments_clean rows (LawPay charges LINKED to a client contract). Those rows are a
 *  subset of firm cash (Jul 2026: $286,820 of $1,768,833.95), so the screen must not read as "collections". The banner
 *  names the basis and shows the certified firm cash for the current month next to it. */
const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export default function LinkedPaymentsNotice({ linkedMonthTotal, className = "" }: { linkedMonthTotal?: number; className?: string }) {
  const { data: months = [] } = useCertifiedMonthlyCollections(2);
  const now = new Date();
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const cur = months.find((m) => m.monthKey === key);
  const share = cur && cur.total > 0 && linkedMonthTotal != null ? Math.round((linkedMonthTotal / cur.total) * 100) : null;
  return (
    <div className={`flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 ${className}`}>
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p>
        <span className="font-semibold">Client-linked LawPay payments only — not firm cash.</span>{" "}
        These are LawPay charges matched to a client contract (payments_clean).
        {cur ? (
          <> Certified firm cash for {cur.month} to date is <span className="font-semibold">{money(cur.total)}</span> (online + offline, bank-supported)
            {share != null ? <>; linked payments are {share}% of it</> : null}.</>
        ) : null}
      </p>
    </div>
  );
}
