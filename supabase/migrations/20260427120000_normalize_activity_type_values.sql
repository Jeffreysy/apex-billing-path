-- Normalize all activity_type variants to consistent snake_case values.
-- Root cause: data was imported from the Future Collections Report Excel across
-- many months with inconsistent casing/spacing, producing 6+ spellings of
-- "outbound_call" and "inbound_call". CollectorDashboard.buildStats() only
-- recognises the exact string "outbound_call", so ~92% of logged calls were
-- invisible on every collector's dashboard.

-- Disable statement timeout for this bulk normalization
SET LOCAL statement_timeout = 0;

UPDATE collection_activities
SET activity_type = 'outbound_call'
WHERE lower(trim(activity_type)) IN ('outbound', 'outbound call')
  AND activity_type IS DISTINCT FROM 'outbound_call';

UPDATE collection_activities
SET activity_type = 'inbound_call'
WHERE lower(trim(activity_type)) IN ('inbound', 'inbound call')
  AND activity_type IS DISTINCT FROM 'inbound_call';

UPDATE collection_activities
SET activity_type = 'administrative'
WHERE lower(trim(activity_type)) IN ('admin / report', 'admin/report')
  AND activity_type IS DISTINCT FROM 'administrative';

UPDATE collection_activities
SET activity_type = 'filter_list'
WHERE lower(trim(activity_type)) IN ('filter list', 'filter lists')
  AND activity_type IS DISTINCT FROM 'filter_list';

UPDATE collection_activities
SET activity_type = 'update_log'
WHERE lower(trim(activity_type)) IN ('update log', 'update logs')
  AND activity_type IS DISTINCT FROM 'update_log';

UPDATE collection_activities
SET activity_type = 'technical_issues'
WHERE lower(trim(activity_type)) = 'technical issues'
  AND activity_type IS DISTINCT FROM 'technical_issues';

UPDATE collection_activities
SET activity_type = 'send_information'
WHERE lower(trim(activity_type)) = 'send information'
  AND activity_type IS DISTINCT FROM 'send_information';

UPDATE collection_activities
SET activity_type = 'pending_tasks_review'
WHERE lower(trim(activity_type)) = 'pending tasks review'
  AND activity_type IS DISTINCT FROM 'pending_tasks_review';

-- Offline/manual payments logged under this label
UPDATE collection_activities
SET activity_type = 'payment_received'
WHERE lower(trim(activity_type)) = 'offlinepayment'
  AND activity_type IS DISTINCT FROM 'payment_received';

-- Junk values — zero, blank, collector name accidentally stored as type
UPDATE collection_activities
SET activity_type = 'unknown'
WHERE trim(coalesce(activity_type, '')) IN ('0', '', ' ')
   OR activity_type ILIKE 'patricio%';

-- Verify final distribution
SELECT activity_type, count(*) AS cnt
FROM collection_activities
GROUP BY activity_type
ORDER BY cnt DESC;
