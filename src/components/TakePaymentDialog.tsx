import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useFirmSettings } from "@/hooks/useSupabaseData";
import { toast } from "sonner";
import { CreditCard, ExternalLink, Loader2, CheckCircle2, AlertTriangle, Copy, Link as LinkIcon } from "lucide-react";

/**
 * Generic payment target — any surface that shows a client can pass one of these.
 * client_id / contract_id / invoice_number are optional; as many as possible should
 * be supplied so the LawPay webhook can auto-match the return transaction.
 */
export type PaymentTarget = {
  clientId: string | null;
  contractId?: string | null;
  clientName: string;
  email?: string | null;
  invoiceNumber?: string | null;
  caseNumber?: string | null;
  defaultAmount?: number | null;
  collectorName?: string | null;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: PaymentTarget | null;
}

type PollStatus = "idle" | "waiting" | "matched" | "failed";

function buildLawpayUrl(baseUrl: string, amount: number, reference: string, email?: string | null, name?: string | null) {
  // LawPay hosted payment pages accept amount (in dollars), reference, and optional
  // customer_name / customer_email query params. We stay on the documented surface.
  const u = new URL(baseUrl);
  u.searchParams.set("amount", amount.toFixed(2));
  u.searchParams.set("reference", reference);
  if (email) u.searchParams.set("email", email);
  if (name) u.searchParams.set("name", name);
  return u.toString();
}

export default function TakePaymentDialog({ open, onOpenChange, target }: Props) {
  const { data: firmSettings, isLoading: settingsLoading } = useFirmSettings();

  const [amount, setAmount] = useState("");
  const [accountType, setAccountType] = useState<"operating" | "trust">("operating");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [launching, setLaunching] = useState(false);
  const [pollStatus, setPollStatus] = useState<PollStatus>("idle");
  const [matchedTxn, setMatchedTxn] = useState<{ amount: number; date: string; id: string } | null>(null);
  const [launchedUrl, setLaunchedUrl] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  // Reset local state whenever the dialog opens for a new target
  useEffect(() => {
    if (!open || !target) return;
    setAmount(target.defaultAmount ? target.defaultAmount.toFixed(2) : "");
    setReference(target.invoiceNumber || target.caseNumber || `LX-${(target.clientId || "").slice(0, 8).toUpperCase()}`);
    setAccountType((firmSettings?.lawpay_default_account as "operating" | "trust") || "operating");
    setNotes("");
    setPollStatus("idle");
    setMatchedTxn(null);
    setLaunchedUrl(null);
  }, [open, target, firmSettings]);

  // Stop polling when the dialog closes
  useEffect(() => {
    if (!open && pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [open]);

  const operatingUrl = firmSettings?.lawpay_operating_url || null;
  const trustUrl = firmSettings?.lawpay_trust_url || null;
  const enabled = !!firmSettings?.lawpay_enabled && !!(operatingUrl || trustUrl);
  const activeUrl = accountType === "trust" ? trustUrl : operatingUrl;

  const amountNum = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  const canLaunch = enabled && !!activeUrl && amountNum > 0 && reference.trim().length > 0 && !!target;

  const startPolling = (ref: string) => {
    // Poll lawpay_transactions for a matching reference every 4s, up to 3 minutes.
    // The payment-received webhook writes the row; we find it by lawpay_transaction_id or reference.
    setPollStatus("waiting");
    const startedAt = Date.now();
    const maxMs = 3 * 60 * 1000;

    const tick = async () => {
      try {
        if (Date.now() - startedAt > maxMs) {
          setPollStatus((prev) => (prev === "matched" ? "matched" : "idle"));
          if (pollRef.current) window.clearInterval(pollRef.current);
          pollRef.current = null;
          return;
        }

        // Look for a lawpay_transactions row containing our reference in the raw_payload
        // or a client_id match on the recent interval (last 5 minutes).
        const { data } = await supabase
          .from("lawpay_transactions")
          .select("id, amount, payment_date, client_id, description, processed_at")
          .order("processed_at", { ascending: false })
          .limit(25);

        const found = (data || []).find((row: any) => {
          const desc = (row.description || "").toString().toLowerCase();
          const refLower = ref.toLowerCase();
          const matchesRef = desc.includes(refLower);
          const matchesClient = target?.clientId && row.client_id === target.clientId;
          const recent = row.processed_at && new Date(row.processed_at).getTime() > startedAt - 60_000;
          return recent && (matchesRef || matchesClient);
        });

        if (found) {
          setMatchedTxn({ amount: Number(found.amount) || 0, date: found.payment_date, id: found.id });
          setPollStatus("matched");
          if (pollRef.current) window.clearInterval(pollRef.current);
          pollRef.current = null;
          toast.success(`LawPay confirmed $${(Number(found.amount) || 0).toFixed(2)}`);
        }
      } catch {
        /* keep polling silently */
      }
    };

    tick();
    pollRef.current = window.setInterval(tick, 4000);
  };

  const handleLaunch = async () => {
    if (!canLaunch || !target || !activeUrl) return;
    setLaunching(true);
    try {
      const url = buildLawpayUrl(activeUrl, amountNum, reference.trim(), target.email, target.clientName);
      setLaunchedUrl(url);

      // Log a collection_activity so the collector dashboard shows "Payment initiated" immediately.
      await supabase.from("collection_activities").insert({
        client_id: target.clientId || null,
        contract_id: target.contractId || null,
        client_name: target.clientName,
        collector: target.collectorName || "System",
        activity_date: new Date().toISOString().slice(0, 10),
        activity_type: "payment_initiated",
        outcome: "lawpay_launched",
        notes: [
          `LawPay ${accountType} link generated for $${amountNum.toFixed(2)}`,
          `Ref: ${reference.trim()}`,
          notes,
        ].filter(Boolean).join(" | "),
        origin: "LexCollect Take Payment",
      });

      // Open LawPay in a new tab — collector stays in LexCollect
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success("LawPay opened in new tab. Complete the charge there.");
      startPolling(reference.trim());
    } catch (err: any) {
      toast.error(err?.message || "Unable to launch LawPay");
    } finally {
      setLaunching(false);
    }
  };

  const handleCopyLink = async () => {
    if (!launchedUrl) return;
    try {
      await navigator.clipboard.writeText(launchedUrl);
      toast.success("Payment link copied — paste to client via SMS or email");
    } catch {
      toast.error("Copy failed — browser blocked clipboard access");
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Take Payment via LawPay
          </DialogTitle>
          <DialogDescription>
            {target ? `Charge ${target.clientName} — card never touches LexCollect.` : "Select a client first."}
          </DialogDescription>
        </DialogHeader>

        {!settingsLoading && !enabled && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>LawPay not configured</AlertTitle>
            <AlertDescription>
              Go to <strong>Settings → LawPay</strong> and paste your hosted payment page URL(s) before taking payments.
            </AlertDescription>
          </Alert>
        )}

        {enabled && target && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={pollStatus === "waiting" || pollStatus === "matched"}
                />
              </div>
              <div>
                <Label>Account</Label>
                <Select
                  value={accountType}
                  onValueChange={(v) => setAccountType(v as "operating" | "trust")}
                  disabled={pollStatus === "waiting" || pollStatus === "matched"}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operating" disabled={!operatingUrl}>Operating {!operatingUrl && "(not configured)"}</SelectItem>
                    <SelectItem value="trust" disabled={!trustUrl}>Trust / IOLTA {!trustUrl && "(not configured)"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Reference (invoice or case #)</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="#12345"
                disabled={pollStatus === "waiting" || pollStatus === "matched"}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                This tag travels with the charge so the webhook auto-matches it to the contract.
              </p>
            </div>

            <div>
              <Label>Internal note (optional)</Label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Down payment, partial, etc."
                disabled={pollStatus === "waiting" || pollStatus === "matched"}
              />
            </div>

            {pollStatus === "waiting" && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Waiting for LawPay confirmation</AlertTitle>
                <AlertDescription className="text-xs">
                  Complete the card entry in the LawPay tab. This window will update automatically the moment the charge posts.
                </AlertDescription>
              </Alert>
            )}

            {pollStatus === "matched" && matchedTxn && (
              <Alert className="border-green-500/40 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-700 dark:text-green-400">Payment received</AlertTitle>
                <AlertDescription className="text-xs">
                  ${matchedTxn.amount.toFixed(2)} posted on {matchedTxn.date}. Contract balance updated.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 flex-wrap">
          {launchedUrl && pollStatus !== "matched" && (
            <Button type="button" variant="outline" size="sm" onClick={handleCopyLink} className="gap-1">
              <Copy className="h-3 w-3" /> Copy Link
            </Button>
          )}
          {pollStatus === "matched" ? (
            <Button type="button" onClick={() => handleClose(false)}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Done
            </Button>
          ) : (
            <Button type="button" onClick={handleLaunch} disabled={!canLaunch || launching}>
              {launching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
              {launchedUrl ? "Re-open LawPay" : "Proceed to LawPay"}
            </Button>
          )}
        </DialogFooter>

        {enabled && launchedUrl && pollStatus === "waiting" && (
          <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground border-t pt-3">
            <LinkIcon className="h-3 w-3" />
            <span className="truncate">{launchedUrl}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
