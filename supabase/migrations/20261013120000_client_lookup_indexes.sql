-- Client Lookup performance indexes.
--
-- The client profile page filters these tables per selected client (client_id / matched_client_id /
-- invoice_number) and the header search runs ILIKE over ar_dashboard's underlying columns. None of
-- those columns were indexed, so every profile load was a set of sequential scans (the MyCase
-- transaction history alone is ~150K rows). Each index is created only if its table exists, because
-- several of these tables were created outside the migration history.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$
DECLARE
  spec record;
BEGIN
  FOR spec IN
    SELECT * FROM (VALUES
      -- Per-client lookups on the profile page
      ('public.collection_activities',      'idx_collection_activities_client_id',        '(client_id)',                       'btree'),
      ('public.collection_activities',      'idx_collection_activities_client_name_trgm', '(client_name gin_trgm_ops)',        'gin'),
      ('public.mycase_contacts',            'idx_mycase_contacts_matched_client_id',      '(matched_client_id)',               'btree'),
      ('public.mycase_cases',               'idx_mycase_cases_matched_client_id',         '(matched_client_id)',               'btree'),
      ('public.mycase_invoices',            'idx_mycase_invoices_matched_client_id',      '(matched_client_id)',               'btree'),
      ('public.mycase_transaction_history', 'idx_mycase_txn_history_invoice_number',      '(invoice_number)',                  'btree'),
      ('public.mycase_payment_plans',       'idx_mycase_payment_plans_invoice_number',    '(invoice_number)',                  'btree'),
      ('public.lawpay_transactions',        'idx_lawpay_transactions_client_status',      '(client_id, status)',               'btree'),
      ('public.immigration_cases',          'idx_immigration_cases_client_id',            '(client_id)',                       'btree'),
      ('public.immigration_cases',          'idx_immigration_cases_case_number',          '(case_number)',                     'btree'),
      ('public.case_milestones',            'idx_case_milestones_immigration_case_id',    '(immigration_case_id)',             'btree'),
      ('public.payments',                   'idx_payments_client_id',                     '(client_id)',                       'btree'),
      -- Server-side client search (ar_dashboard = contracts LEFT JOIN clients; ILIKE '%term%')
      ('public.contracts',                  'idx_contracts_client_trgm',                  '(client gin_trgm_ops)',             'gin'),
      ('public.contracts',                  'idx_contracts_case_number_trgm',             '(case_number gin_trgm_ops)',        'gin'),
      ('public.contracts',                  'idx_contracts_client_id',                    '(client_id)',                       'btree'),
      ('public.clients',                    'idx_clients_email_trgm',                     '(email gin_trgm_ops)',              'gin')
    ) AS t(table_name, index_name, columns, method)
  LOOP
    IF to_regclass(spec.table_name) IS NULL THEN
      RAISE NOTICE 'Skipping %: table % does not exist', spec.index_name, spec.table_name;
      CONTINUE;
    END IF;
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %s USING %s %s',
                   spec.index_name, spec.table_name, spec.method, spec.columns);
  END LOOP;
END $$;
