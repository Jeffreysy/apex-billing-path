import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Phone, DollarSign, AlertTriangle, Calendar, CheckCircle, ArrowRight,
} from "lucide-react";

const OUTCOMES = [
  { value: "payment_taken", label: "Payment Taken" },
  { value: "promise_to_pay", label: "Promise to Pay" },
  { value: "no_answer", label: "No Answer" },
  { value: "left_voicemail", label: "Left Voicemail" },
  { value: "callback_scheduled", label: "Callback Scheduled" },
  { value: "disputed", label: "Disputed" },
  { value: "wrong_number", label: "Wrong Number / Disconnected" },
  { value: "client_satisfied", label: "Client Satisfied" },
];

const COLLECTORS = ["Alejandro A", "Patricio D", "Maritza V"];

type Step = "call" | "commitment" | "escalation" | "done";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: any;
}

const CallDocumentationDialog = ({ open, onOpenChange, account }: Props) => {
  const qc = useQueryClient();
  const [step, setStep] = useState<Step>("call");
  const [saving, setSaving] = useState(false);

  // Call fields
  const [callDate, setCallDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [callTime, setCallTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [callOutcome, setCallOutcome] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [callDuration, setCallDuration] = useState("");
  const [contactReached, setContactReached] = useState(true);
  const [wrongNumber, setWrongNumber] = useState(false);
  const [promiseMade, setPromiseMade] = useState(false);
  const [escalationNeeded, setEscalationNeeded] = useState(false);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");

  // Commitment fields
  const [commitAmount, setCommitAmount] = useState("");
  const [commitDate, setCommitDate] = useState("");
  const [commitFollowUp, setCommitFollowUp] = useState("");
  const [commitNotes, setCommitNotes] = useState("");

  // Escalation fields
  const [escReason, setEscReason] = useState("");
  const [escPriority, setEscPriority] = useState("medium");
  const [escAssign, setEscAssign] = useState("");

  const collector = account?.collector || account?.assigned_collector || "Unknown";

  const resetAll = () => {
    setStep("call");
    setCallDate(new Date().toISOString().slice(0, 10));
    setCallTime(new Date().toTimeString().slice(0, 5));
    setCallOutcome("");
    setCallNotes("");
    setCallDuration("");
    setContactReached(true);
    setWrongNumber(false);
    setPromiseMade(false);
    setEscalationNeeded(false);
    setFollowUpRequired(false);
    setFollowUpDate("");
    setCommitAmount("");
    setCommitDate("");
    setCommitFollowUp("");
    setCommitNotes("");
    setEscReason("");
    setEscPriority("medium");
    setEscAssign("");
    setSaving(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) resetAll();
    onOpenChange(v);
  };

  // Step 1: Save call activity
  const handleSaveCall = async () => {
    if (!callOutcome) { toast.error("Select a call outcome"); return; }
    if (followUpRequired && !followUpDate) { toast.error("Follow-up date is required"); return; }

    setSaving(true);
    try {
      const notes = [
        callNotes,
        !contactReached ? "[Contact not reached]" : "",
        wrongNumber ? "[Wrong number / disconnected]" : "",
        followUpRequired && followUpDate ? `[Follow-up: ${followUpDate}]` : "",
      ].filter(Boolean).join(" ");

      const { error } = await supabase.from("collection_activities").insert({
        client_id: account?.client_id || null,
        client_name: account?.client_name || "Unknown",
        collector,
        activity_date: callDate,
        start_time: callTime || null,
        activity_type: "outbound_call",
        outcome: callOutcome,
        duration_minutes: Number(callDuration) || null,
        notes: notes || null,
        next_payment_expected: followUpRequired ? followUpDate : null,
      });
      if (error) throw error;

      // Invalidate activities so workspace refreshes
      qc.invalidateQueries({ queryKey: ["collection-activities"] });

      toast.success("Call documented successfully");

      // Route to next step
      if (promiseMade) {
        setStep("commitment");
      } else if (escalationNeeded) {
        setStep("escalation");
      } else {
        setStep("done");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save call");
    } finally {
      setSaving(false);
    }
  };

  // Step 2a: Save commitment
  const handleSaveCommitment = async () => {
    if (!commitAmount || !commitDate) { toast.error("Amount and date required"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("payment_commitments").insert({
        client_id: account?.client_id,
        contract_id: account?.contract_id,
        collector,
        promised_amount: Number(commitAmount),
        promised_date: commitDate,
        follow_up_date: commitFollowUp || followUpDate || null,
        notes: commitNotes || null,
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["commitments", account?.contract_id || account?.client_id] });
      toast.success("Payment commitment created");

      if (escalationNeeded) {
        setStep("escalation");
      } else {
        setStep("done");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create commitment");
    } finally {
      setSaving(false);
    }
  };

  // Step 2b: Save escalation
  const handleSaveEscalation = async () => {
    if (!escReason) { toast.error("Reason required"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("escalations").insert({
        client_id: account?.client_id,
        contract_id: account?.contract_id || null,
        raised_by: collector,
        assigned_to: escAssign || null,
        trigger_reason: escReason,
        priority: escPriority,
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["escalations", account?.contract_id || account?.client_id] });
      toast.success("Escalation created");
      setStep("done");
    } catch (err: any) {
      toast.error(err.message || "Failed to create escalation");
    } finally {
      setSaving(false);
    }
  };

  // Auto-set outcome hints
  const onOutcomeChange = (v: string) => {
    setCallOutcome(v);
    if (v === "promise_to_pay") setPromiseMade(true);
    if (v === "wrong_number") { setWrongNumber(true); setContactReached(false); }
    if (v === "no_answer" || v === "left_voicemail") setContactReached(false);
    if (v === "callback_scheduled") setFollowUpRequired(true);
    if (v === "disputed") setEscalationNeeded(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-1">
          <StepDot active={step === "call"} done={step !== "call"} label="1. Call" />
          {promiseMade && (
            <>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <StepDot active={step === "commitment"} done={step === "escalation" || step === "done"} label="2. Commitment" />
            </>
          )}
          {escalationNeeded && (
            <>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <StepDot active={step === "escalation"} done={step === "done"} label={promiseMade ? "3. Escalation" : "2. Escalation"} />
            </>
          )}
        </div>

        {/* === STEP: CALL === */}
        {step === "call" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Document Call — {account?.client_name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Date / Time / Duration row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Call Date</Label>
                  <Input type="date" value={callDate} onChange={e => setCallDate(e.target.value)} className="text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Time</Label>
                  <Input type="time" value={callTime} onChange={e => setCallTime(e.target.value)} className="text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Duration (min)</Label>
                  <Input type="number" value={callDuration} onChange={e => setCallDuration(e.target.value)} placeholder="5" className="text-xs" />
                </div>
              </div>

              {/* Collector */}
              <div>
                <Label className="text-xs">Collector</Label>
                <Input value={collector} disabled className="text-xs bg-muted" />
              </div>

              {/* Outcome */}
              <div>
                <Label className="text-xs">Call Outcome</Label>
                <Select value={callOutcome} onValueChange={onOutcomeChange}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Select outcome" /></SelectTrigger>
                  <SelectContent>
                    {OUTCOMES.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-xs">Note Summary</Label>
                <Textarea
                  value={callNotes}
                  onChange={e => setCallNotes(e.target.value)}
                  placeholder="Summarize the call..."
                  rows={3}
                  className="text-xs"
                  maxLength={2000}
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3 rounded-md border p-3 bg-muted/30">
                <ToggleRow
                  id="contact-reached"
                  label="Contact reached?"
                  checked={contactReached}
                  onChange={setContactReached}
                />
                <ToggleRow
                  id="wrong-number"
                  label="Wrong number / disconnected?"
                  checked={wrongNumber}
                  onChange={setWrongNumber}
                />
                <ToggleRow
                  id="promise-made"
                  label="Promise to pay made?"
                  checked={promiseMade}
                  onChange={setPromiseMade}
                  hint={promiseMade ? "→ Will create payment commitment next" : undefined}
                />
                <ToggleRow
                  id="escalation-needed"
                  label="Escalation needed?"
                  checked={escalationNeeded}
                  onChange={setEscalationNeeded}
                  hint={escalationNeeded ? "→ Will create escalation next" : undefined}
                />
                <ToggleRow
                  id="follow-up"
                  label="Follow-up required?"
                  checked={followUpRequired}
                  onChange={setFollowUpRequired}
                />
                {followUpRequired && (
                  <div className="ml-7">
                    <Label className="text-xs">Follow-Up Date</Label>
                    <Input
                      type="date"
                      value={followUpDate}
                      onChange={e => setFollowUpDate(e.target.value)}
                      className="text-xs w-[180px]"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
              <Button onClick={handleSaveCall} disabled={saving || !callOutcome}>
                {saving ? "Saving..." : promiseMade || escalationNeeded ? "Save & Continue" : "Save Call"}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* === STEP: COMMITMENT === */}
        {step === "commitment" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Payment Commitment — {account?.client_name}
              </DialogTitle>
            </DialogHeader>

            <p className="text-xs text-muted-foreground mb-2">
              A promise to pay was indicated. Record the commitment details below.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Promised Amount</Label>
                  <Input type="number" step="0.01" value={commitAmount} onChange={e => setCommitAmount(e.target.value)} placeholder="0.00" className="text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Promised Date</Label>
                  <Input type="date" value={commitDate} onChange={e => setCommitDate(e.target.value)} className="text-xs" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Follow-Up Date</Label>
                <Input type="date" value={commitFollowUp || followUpDate} onChange={e => setCommitFollowUp(e.target.value)} className="text-xs" />
              </div>
              <div>
                <Label className="text-xs">Notes</Label>
                <Textarea value={commitNotes} onChange={e => setCommitNotes(e.target.value)} placeholder="Commitment details..." rows={2} className="text-xs" maxLength={1000} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                if (escalationNeeded) setStep("escalation"); else setStep("done");
              }}>
                Skip
              </Button>
              <Button onClick={handleSaveCommitment} disabled={saving}>
                {saving ? "Saving..." : escalationNeeded ? "Save & Continue" : "Save Commitment"}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* === STEP: ESCALATION === */}
        {step === "escalation" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Create Escalation — {account?.client_name}
              </DialogTitle>
            </DialogHeader>

            <p className="text-xs text-muted-foreground mb-2">
              An escalation was flagged. Provide details below.
            </p>

            <div className="space-y-4">
              <div>
                <Label className="text-xs">Trigger Reason</Label>
                <Textarea value={escReason} onChange={e => setEscReason(e.target.value)} placeholder="Why is this being escalated?" rows={2} className="text-xs" maxLength={1000} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Priority</Label>
                  <Select value={escPriority} onValueChange={setEscPriority}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low" className="text-xs">Low</SelectItem>
                      <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                      <SelectItem value="high" className="text-xs">High</SelectItem>
                      <SelectItem value="urgent" className="text-xs">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Assign To</Label>
                  <Select value={escAssign} onValueChange={setEscAssign}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {COLLECTORS.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                      <SelectItem value="Management" className="text-xs">Management</SelectItem>
                      <SelectItem value="Legal" className="text-xs">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("done")}>Skip</Button>
              <Button onClick={handleSaveEscalation} disabled={saving}>
                {saving ? "Saving..." : "Save Escalation"}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* === STEP: DONE === */}
        {step === "done" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" /> Call Documented
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-2 py-2">
              <p className="text-sm">All records saved for <span className="font-medium">{account?.client_name}</span>.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="text-xs gap-1"><Phone className="h-3 w-3" /> Call logged</Badge>
                {promiseMade && <Badge variant="secondary" className="text-xs gap-1"><DollarSign className="h-3 w-3" /> Commitment</Badge>}
                {escalationNeeded && <Badge variant="destructive" className="text-xs gap-1"><AlertTriangle className="h-3 w-3" /> Escalation</Badge>}
                {followUpRequired && followUpDate && <Badge variant="outline" className="text-xs gap-1"><Calendar className="h-3 w-3" /> Follow-up {followUpDate}</Badge>}
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => handleClose(false)}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

// --- Small helpers ---
const StepDot = ({ active, done, label }: { active: boolean; done: boolean; label: string }) => (
  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
    active ? "bg-primary text-primary-foreground" :
    done ? "bg-muted text-muted-foreground" :
    "text-muted-foreground"
  }`}>
    {label}
  </span>
);

const ToggleRow = ({
  id, label, checked, onChange, hint,
}: {
  id: string; label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string;
}) => (
  <div className="flex items-start gap-2">
    <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(!!v)} className="mt-0.5" />
    <div>
      <label htmlFor={id} className="text-xs font-medium cursor-pointer">{label}</label>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  </div>
);

export default CallDocumentationDialog;
