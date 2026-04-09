ALTER TABLE public.escalations
  ADD COLUMN IF NOT EXISTS source_context text
    CHECK (source_context IN ('inbound_call', 'outbound_call', 'pending_task', 'admin_follow_up', 'attorney_request', 'customer_care_request', 'refund_follow_up', 'compliance_review', 'other')),
  ADD COLUMN IF NOT EXISTS handoff_queue text
    CHECK (handoff_queue IN ('legal', 'case_management', 'compliance', 'customer_care', 'management', 'sales', 'billing_ops', 'other')),
  ADD COLUMN IF NOT EXISTS handoff_target text,
  ADD COLUMN IF NOT EXISTS outcome_snapshot text,
  ADD COLUMN IF NOT EXISTS follow_up_date date,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS call_activity_id uuid REFERENCES public.collection_activities(id);

CREATE INDEX IF NOT EXISTS idx_escalations_handoff_queue ON public.escalations(handoff_queue);
CREATE INDEX IF NOT EXISTS idx_escalations_follow_up_date ON public.escalations(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_escalations_call_activity ON public.escalations(call_activity_id);
