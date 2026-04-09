ALTER TABLE public.escalations
  ADD COLUMN IF NOT EXISTS source_context text,
  ADD COLUMN IF NOT EXISTS handoff_queue text,
  ADD COLUMN IF NOT EXISTS handoff_target text,
  ADD COLUMN IF NOT EXISTS outcome_snapshot text,
  ADD COLUMN IF NOT EXISTS follow_up_date date,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS call_activity_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'escalations_call_activity_id_fkey'
  ) THEN
    ALTER TABLE public.escalations
      ADD CONSTRAINT escalations_call_activity_id_fkey
      FOREIGN KEY (call_activity_id)
      REFERENCES public.collection_activities(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;
