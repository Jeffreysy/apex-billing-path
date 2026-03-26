
CREATE TABLE public.payment_commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  collector text NOT NULL,
  promised_amount numeric(12,2) NOT NULL,
  promised_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'kept', 'broken', 'rescheduled', 'partial')),
  follow_up_date date,
  call_activity_id uuid REFERENCES public.collection_activities(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_commitments_collector ON public.payment_commitments(collector);
CREATE INDEX idx_commitments_status ON public.payment_commitments(status);
CREATE INDEX idx_commitments_promised_date ON public.payment_commitments(promised_date);
CREATE INDEX idx_commitments_follow_up ON public.payment_commitments(follow_up_date);
CREATE INDEX idx_commitments_client ON public.payment_commitments(client_id);
CREATE INDEX idx_commitments_contract ON public.payment_commitments(contract_id);

CREATE TRIGGER set_updated_at_payment_commitments
  BEFORE UPDATE ON public.payment_commitments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.payment_commitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read_payment_commitments" ON public.payment_commitments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_insert_payment_commitments" ON public.payment_commitments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_update_payment_commitments" ON public.payment_commitments
  FOR UPDATE USING (auth.uid() IS NOT NULL);


CREATE TABLE public.escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE,
  raised_by text NOT NULL,
  assigned_to text,
  trigger_reason text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_escalations_status ON public.escalations(status);
CREATE INDEX idx_escalations_priority ON public.escalations(priority);
CREATE INDEX idx_escalations_raised_by ON public.escalations(raised_by);
CREATE INDEX idx_escalations_assigned_to ON public.escalations(assigned_to);
CREATE INDEX idx_escalations_client ON public.escalations(client_id);

CREATE TRIGGER set_updated_at_escalations
  BEFORE UPDATE ON public.escalations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read_escalations" ON public.escalations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_insert_escalations" ON public.escalations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_update_escalations" ON public.escalations
  FOR UPDATE USING (auth.uid() IS NOT NULL);
