export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      _vp_bak_v_ar_kpi_monthly_20260731: {
        Row: {
          backed_up_at: string | null
          prior_def: string | null
        }
        Insert: {
          backed_up_at?: string | null
          prior_def?: string | null
        }
        Update: {
          backed_up_at?: string | null
          prior_def?: string | null
        }
        Relationships: []
      }
      activity_dedup_cleanup_log: {
        Row: {
          activity_date: string | null
          activity_type: string | null
          client_name: string | null
          collected_amount: number | null
          collector: string | null
          id: string
          log_id: number
          outcome: string | null
          prev_is_junk: boolean | null
          reason: string | null
          run_at: string
          run_id: string
          transaction_id: string | null
        }
        Insert: {
          activity_date?: string | null
          activity_type?: string | null
          client_name?: string | null
          collected_amount?: number | null
          collector?: string | null
          id: string
          log_id?: never
          outcome?: string | null
          prev_is_junk?: boolean | null
          reason?: string | null
          run_at?: string
          run_id: string
          transaction_id?: string | null
        }
        Update: {
          activity_date?: string | null
          activity_type?: string | null
          client_name?: string | null
          collected_amount?: number | null
          collector?: string | null
          id?: string
          log_id?: never
          outcome?: string | null
          prev_is_junk?: boolean | null
          reason?: string | null
          run_at?: string
          run_id?: string
          transaction_id?: string | null
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          action: string
          client: string
          collector: string
          contract_id: string | null
          created_at: string | null
          id: string
          note: string | null
          outcome: string | null
        }
        Insert: {
          action: string
          client: string
          collector: string
          contract_id?: string | null
          created_at?: string | null
          id?: string
          note?: string | null
          outcome?: string | null
        }
        Update: {
          action?: string
          client?: string
          collector?: string
          contract_id?: string | null
          created_at?: string | null
          id?: string
          note?: string | null
          outcome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "activity_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "activity_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "activity_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "activity_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "activity_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "activity_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "activity_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "activity_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "activity_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "activity_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      agent_all_hands_log: {
        Row: {
          anchor_snapshot_id: string | null
          created_by: string | null
          held_at: string
          id: string
          invariants_ok: boolean | null
          open_handoffs: number | null
          operating_ar: number | null
          reports: Json | null
          summary: string | null
          week_of: string
        }
        Insert: {
          anchor_snapshot_id?: string | null
          created_by?: string | null
          held_at?: string
          id?: string
          invariants_ok?: boolean | null
          open_handoffs?: number | null
          operating_ar?: number | null
          reports?: Json | null
          summary?: string | null
          week_of?: string
        }
        Update: {
          anchor_snapshot_id?: string | null
          created_by?: string | null
          held_at?: string
          id?: string
          invariants_ok?: boolean | null
          open_handoffs?: number | null
          operating_ar?: number | null
          reports?: Json | null
          summary?: string | null
          week_of?: string
        }
        Relationships: []
      }
      ar_anchor_history: {
        Row: {
          delta_ar: number | null
          event: string
          from_ar_dollars: number | null
          from_content_md5: string | null
          from_snapshot_date: string | null
          from_snapshot_id: string | null
          id: string
          notes: string | null
          pinned_by: string | null
          repinned_at: string
          reversible_via: string | null
          to_ar_dollars: number | null
          to_content_md5: string | null
          to_snapshot_date: string | null
          to_snapshot_id: string | null
        }
        Insert: {
          delta_ar?: number | null
          event?: string
          from_ar_dollars?: number | null
          from_content_md5?: string | null
          from_snapshot_date?: string | null
          from_snapshot_id?: string | null
          id?: string
          notes?: string | null
          pinned_by?: string | null
          repinned_at?: string
          reversible_via?: string | null
          to_ar_dollars?: number | null
          to_content_md5?: string | null
          to_snapshot_date?: string | null
          to_snapshot_id?: string | null
        }
        Update: {
          delta_ar?: number | null
          event?: string
          from_ar_dollars?: number | null
          from_content_md5?: string | null
          from_snapshot_date?: string | null
          from_snapshot_id?: string | null
          id?: string
          notes?: string | null
          pinned_by?: string | null
          repinned_at?: string
          reversible_via?: string | null
          to_ar_dollars?: number | null
          to_content_md5?: string | null
          to_snapshot_date?: string | null
          to_snapshot_id?: string | null
        }
        Relationships: []
      }
      ar_anchor_snapshot: {
        Row: {
          content_md5: string | null
          pinned_at: string
          pinned_by: string
          row_count: number
          singleton_id: number
          snapshot_date: string
          snapshot_id: string
          total_ar_dollars: number
        }
        Insert: {
          content_md5?: string | null
          pinned_at?: string
          pinned_by?: string
          row_count: number
          singleton_id?: number
          snapshot_date: string
          snapshot_id: string
          total_ar_dollars: number
        }
        Update: {
          content_md5?: string | null
          pinned_at?: string
          pinned_by?: string
          row_count?: number
          singleton_id?: number
          snapshot_date?: string
          snapshot_id?: string
          total_ar_dollars?: number
        }
        Relationships: [
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "ar_source_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_active_rows"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_active_snapshot"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_freshness_guard"
            referencedColumns: ["feeding_snapshot_id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_invoice_client_map_current"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_purpose_classified_v1"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_snapshot_series"
            referencedColumns: ["snapshot_id"]
          },
        ]
      }
      ar_cashflow_monthly: {
        Row: {
          ar_created: number | null
          auto_pay_collected: number | null
          avg_contract: number | null
          avg_down_payment: number | null
          contract_value: number | null
          created_at: string | null
          data_quality: string | null
          down_payments: number | null
          dp_match_count: number | null
          dp_match_pct: number | null
          dp_pct: number | null
          ending_firm_ar: number | null
          id: string
          manual_collected: number | null
          methodology: string | null
          month: string
          net_ar_movement: number | null
          new_cases: number | null
          notes: string | null
          source: string | null
          total_collected: number | null
          updated_at: string | null
        }
        Insert: {
          ar_created?: number | null
          auto_pay_collected?: number | null
          avg_contract?: number | null
          avg_down_payment?: number | null
          contract_value?: number | null
          created_at?: string | null
          data_quality?: string | null
          down_payments?: number | null
          dp_match_count?: number | null
          dp_match_pct?: number | null
          dp_pct?: number | null
          ending_firm_ar?: number | null
          id?: string
          manual_collected?: number | null
          methodology?: string | null
          month: string
          net_ar_movement?: number | null
          new_cases?: number | null
          notes?: string | null
          source?: string | null
          total_collected?: number | null
          updated_at?: string | null
        }
        Update: {
          ar_created?: number | null
          auto_pay_collected?: number | null
          avg_contract?: number | null
          avg_down_payment?: number | null
          contract_value?: number | null
          created_at?: string | null
          data_quality?: string | null
          down_payments?: number | null
          dp_match_count?: number | null
          dp_match_pct?: number | null
          dp_pct?: number | null
          ending_firm_ar?: number | null
          id?: string
          manual_collected?: number | null
          methodology?: string | null
          month?: string
          net_ar_movement?: number | null
          new_cases?: number | null
          notes?: string | null
          source?: string | null
          total_collected?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ar_change_log: {
        Row: {
          amount_after: number | null
          amount_before: number | null
          amount_delta: number | null
          change_type: string
          client_id: string | null
          created_at: string | null
          id: string
          invoice_number: string | null
          lawpay_txn_id: string | null
          notes: string | null
          raw_payload: Json | null
          source: string | null
        }
        Insert: {
          amount_after?: number | null
          amount_before?: number | null
          amount_delta?: number | null
          change_type: string
          client_id?: string | null
          created_at?: string | null
          id?: string
          invoice_number?: string | null
          lawpay_txn_id?: string | null
          notes?: string | null
          raw_payload?: Json | null
          source?: string | null
        }
        Update: {
          amount_after?: number | null
          amount_before?: number | null
          amount_delta?: number | null
          change_type?: string
          client_id?: string | null
          created_at?: string | null
          id?: string
          invoice_number?: string | null
          lawpay_txn_id?: string | null
          notes?: string | null
          raw_payload?: Json | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ar_change_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "ar_change_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "ar_change_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_change_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "ar_change_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "ar_change_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "ar_change_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "ar_change_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "ar_change_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "ar_change_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "ar_change_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "ar_change_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      ar_daily_heartbeat: {
        Row: {
          aging_days_old: number | null
          aging_snapshot_date: string | null
          aging_snapshot_id: string | null
          aging_status: string | null
          ar_90plus: number | null
          as_of_date: string
          behind_plans: number | null
          created_at: string | null
          feeds_fresh: number | null
          feeds_missing: number | null
          feeds_stale: number | null
          gross_ar: number | null
          no_plan: number | null
          notes: string | null
          on_track_plans: number | null
          plan_due: number | null
          plans_behind: number | null
          plans_total: number | null
        }
        Insert: {
          aging_days_old?: number | null
          aging_snapshot_date?: string | null
          aging_snapshot_id?: string | null
          aging_status?: string | null
          ar_90plus?: number | null
          as_of_date: string
          behind_plans?: number | null
          created_at?: string | null
          feeds_fresh?: number | null
          feeds_missing?: number | null
          feeds_stale?: number | null
          gross_ar?: number | null
          no_plan?: number | null
          notes?: string | null
          on_track_plans?: number | null
          plan_due?: number | null
          plans_behind?: number | null
          plans_total?: number | null
        }
        Update: {
          aging_days_old?: number | null
          aging_snapshot_date?: string | null
          aging_snapshot_id?: string | null
          aging_status?: string | null
          ar_90plus?: number | null
          as_of_date?: string
          behind_plans?: number | null
          created_at?: string | null
          feeds_fresh?: number | null
          feeds_missing?: number | null
          feeds_stale?: number | null
          gross_ar?: number | null
          no_plan?: number | null
          notes?: string | null
          on_track_plans?: number | null
          plan_due?: number | null
          plans_behind?: number | null
          plans_total?: number | null
        }
        Relationships: []
      }
      ar_kpi_heartbeat: {
        Row: {
          findings: Json | null
          n_alert: number
          n_break: number
          n_green: number
          n_warn: number
          notes: string[] | null
          overall_status: string
          publish_blocked: boolean
          publish_month: string | null
          publish_month_drift_days: number | null
          run_at: string
          run_id: string
          source_view_versions: Json | null
        }
        Insert: {
          findings?: Json | null
          n_alert?: number
          n_break?: number
          n_green?: number
          n_warn?: number
          notes?: string[] | null
          overall_status: string
          publish_blocked?: boolean
          publish_month?: string | null
          publish_month_drift_days?: number | null
          run_at?: string
          run_id?: string
          source_view_versions?: Json | null
        }
        Update: {
          findings?: Json | null
          n_alert?: number
          n_break?: number
          n_green?: number
          n_warn?: number
          notes?: string[] | null
          overall_status?: string
          publish_blocked?: boolean
          publish_month?: string | null
          publish_month_drift_days?: number | null
          run_at?: string
          run_id?: string
          source_view_versions?: Json | null
        }
        Relationships: []
      }
      ar_live_trend: {
        Row: {
          ar_paid_down_since: number | null
          baseline_ar: number | null
          baseline_date: string | null
          capture_date: string
          captured_at: string
          days_since_baseline: number | null
          id: string
          lawpay_gross_inflow_since: number | null
          lawpay_payments_since: number | null
          live_ar: number | null
        }
        Insert: {
          ar_paid_down_since?: number | null
          baseline_ar?: number | null
          baseline_date?: string | null
          capture_date?: string
          captured_at?: string
          days_since_baseline?: number | null
          id?: string
          lawpay_gross_inflow_since?: number | null
          lawpay_payments_since?: number | null
          live_ar?: number | null
        }
        Update: {
          ar_paid_down_since?: number | null
          baseline_ar?: number | null
          baseline_date?: string | null
          capture_date?: string
          captured_at?: string
          days_since_baseline?: number | null
          id?: string
          lawpay_gross_inflow_since?: number | null
          lawpay_payments_since?: number | null
          live_ar?: number | null
        }
        Relationships: []
      }
      ar_monthly_snapshots: {
        Row: {
          active_contracts: number | null
          ar_change: number | null
          auto_pay_collected: number | null
          auto_pay_count: number | null
          auto_pay_dollars: number | null
          auto_pay_fail_rate: number | null
          avg_collection_rate: number | null
          bucket_1_30: number | null
          bucket_180_plus: number | null
          bucket_31_60: number | null
          bucket_61_90: number | null
          bucket_91_180: number | null
          bucket_current: number | null
          collection_activities: number | null
          contract_count: number | null
          created_at: string | null
          current_collected: number | null
          current_contracts: number | null
          current_outstanding: number | null
          delinquent_collected: number | null
          delinquent_contracts: number | null
          delinquent_outstanding: number | null
          down_payments_received: number | null
          filevine_gap_ar: number | null
          firm_ar: number
          id: string
          invoice_count: number | null
          late_collected: number | null
          late_contracts: number | null
          late_outstanding: number | null
          manual_collected: number | null
          manual_collection_count: number | null
          manual_collection_dollars: number | null
          missing_plans_ar: number | null
          mycase_ar: number
          net_collections: number | null
          new_cases_filevine: number | null
          new_cases_mycase: number | null
          new_client_ar: number | null
          new_contract_value: number | null
          new_invoicing: number | null
          notes: string | null
          plans_complete_count: number | null
          plans_complete_still_owe: number | null
          risk_contracts: number | null
          snapshot_date: string
          snapshot_month: string
          source: string | null
          total_collected: number | null
        }
        Insert: {
          active_contracts?: number | null
          ar_change?: number | null
          auto_pay_collected?: number | null
          auto_pay_count?: number | null
          auto_pay_dollars?: number | null
          auto_pay_fail_rate?: number | null
          avg_collection_rate?: number | null
          bucket_1_30?: number | null
          bucket_180_plus?: number | null
          bucket_31_60?: number | null
          bucket_61_90?: number | null
          bucket_91_180?: number | null
          bucket_current?: number | null
          collection_activities?: number | null
          contract_count?: number | null
          created_at?: string | null
          current_collected?: number | null
          current_contracts?: number | null
          current_outstanding?: number | null
          delinquent_collected?: number | null
          delinquent_contracts?: number | null
          delinquent_outstanding?: number | null
          down_payments_received?: number | null
          filevine_gap_ar?: number | null
          firm_ar: number
          id?: string
          invoice_count?: number | null
          late_collected?: number | null
          late_contracts?: number | null
          late_outstanding?: number | null
          manual_collected?: number | null
          manual_collection_count?: number | null
          manual_collection_dollars?: number | null
          missing_plans_ar?: number | null
          mycase_ar: number
          net_collections?: number | null
          new_cases_filevine?: number | null
          new_cases_mycase?: number | null
          new_client_ar?: number | null
          new_contract_value?: number | null
          new_invoicing?: number | null
          notes?: string | null
          plans_complete_count?: number | null
          plans_complete_still_owe?: number | null
          risk_contracts?: number | null
          snapshot_date?: string
          snapshot_month: string
          source?: string | null
          total_collected?: number | null
        }
        Update: {
          active_contracts?: number | null
          ar_change?: number | null
          auto_pay_collected?: number | null
          auto_pay_count?: number | null
          auto_pay_dollars?: number | null
          auto_pay_fail_rate?: number | null
          avg_collection_rate?: number | null
          bucket_1_30?: number | null
          bucket_180_plus?: number | null
          bucket_31_60?: number | null
          bucket_61_90?: number | null
          bucket_91_180?: number | null
          bucket_current?: number | null
          collection_activities?: number | null
          contract_count?: number | null
          created_at?: string | null
          current_collected?: number | null
          current_contracts?: number | null
          current_outstanding?: number | null
          delinquent_collected?: number | null
          delinquent_contracts?: number | null
          delinquent_outstanding?: number | null
          down_payments_received?: number | null
          filevine_gap_ar?: number | null
          firm_ar?: number
          id?: string
          invoice_count?: number | null
          late_collected?: number | null
          late_contracts?: number | null
          late_outstanding?: number | null
          manual_collected?: number | null
          manual_collection_count?: number | null
          manual_collection_dollars?: number | null
          missing_plans_ar?: number | null
          mycase_ar?: number
          net_collections?: number | null
          new_cases_filevine?: number | null
          new_cases_mycase?: number | null
          new_client_ar?: number | null
          new_contract_value?: number | null
          new_invoicing?: number | null
          notes?: string | null
          plans_complete_count?: number | null
          plans_complete_still_owe?: number | null
          risk_contracts?: number | null
          snapshot_date?: string
          snapshot_month?: string
          source?: string | null
          total_collected?: number | null
        }
        Relationships: []
      }
      ar_monthly_summary: {
        Row: {
          created_at: string | null
          days_31_60: number | null
          days_61_90: number | null
          id: string
          month: string
          over_90: number | null
          total: number | null
          under_30: number | null
        }
        Insert: {
          created_at?: string | null
          days_31_60?: number | null
          days_61_90?: number | null
          id?: string
          month: string
          over_90?: number | null
          total?: number | null
          under_30?: number | null
        }
        Update: {
          created_at?: string | null
          days_31_60?: number | null
          days_61_90?: number | null
          id?: string
          month?: string
          over_90?: number | null
          total?: number | null
          under_30?: number | null
        }
        Relationships: []
      }
      ar_motion_log: {
        Row: {
          aging_bucket: string | null
          autopay_status: string | null
          client_name: string | null
          days_overdue: number | null
          dedup_version: string
          id: string
          last_worked_date: string | null
          logged_at: string
          matched_client_id: string | null
          motion: string | null
          never_worked: boolean | null
          on_plan: boolean | null
          open_balance: number | null
          plan_overdue_amount: number | null
          savable_tier: string | null
          snapshot_date: string
          snapshot_id: string
          worked_recency_bucket: string | null
        }
        Insert: {
          aging_bucket?: string | null
          autopay_status?: string | null
          client_name?: string | null
          days_overdue?: number | null
          dedup_version: string
          id?: string
          last_worked_date?: string | null
          logged_at?: string
          matched_client_id?: string | null
          motion?: string | null
          never_worked?: boolean | null
          on_plan?: boolean | null
          open_balance?: number | null
          plan_overdue_amount?: number | null
          savable_tier?: string | null
          snapshot_date: string
          snapshot_id: string
          worked_recency_bucket?: string | null
        }
        Update: {
          aging_bucket?: string | null
          autopay_status?: string | null
          client_name?: string | null
          days_overdue?: number | null
          dedup_version?: string
          id?: string
          last_worked_date?: string | null
          logged_at?: string
          matched_client_id?: string | null
          motion?: string | null
          never_worked?: boolean | null
          on_plan?: boolean | null
          open_balance?: number | null
          plan_overdue_amount?: number | null
          savable_tier?: string | null
          snapshot_date?: string
          snapshot_id?: string
          worked_recency_bucket?: string | null
        }
        Relationships: []
      }
      ar_reconciliation_runs: {
        Row: {
          error: string | null
          finished_at: string | null
          id: string
          inputs: Json | null
          notes: string | null
          output_counts: Json | null
          started_at: string
          status: string
          triggered_by: string
          triggered_by_user_id: string | null
        }
        Insert: {
          error?: string | null
          finished_at?: string | null
          id?: string
          inputs?: Json | null
          notes?: string | null
          output_counts?: Json | null
          started_at?: string
          status?: string
          triggered_by?: string
          triggered_by_user_id?: string | null
        }
        Update: {
          error?: string | null
          finished_at?: string | null
          id?: string
          inputs?: Json | null
          notes?: string | null
          output_counts?: Json | null
          started_at?: string
          status?: string
          triggered_by?: string
          triggered_by_user_id?: string | null
        }
        Relationships: []
      }
      ar_snapshot_certification: {
        Row: {
          anchor_content_md5: string
          ar_total: number
          certified_at: string
          certified_by: string
          content_md5_matches: boolean
          id: string
          inv_closure: string
          inv_one_delinquency: string
          inv_subset: string
          inv_subset_detail: Json | null
          inv_tie_out: string
          notes: string | null
          recomputed_content_md5: string
          section_c_abs_delta: number | null
          section_c_behind_plan_balance: number | null
          section_c_overdue_ar: number | null
          section_c_pass: boolean | null
          snapshot_date: string
          snapshot_id: string
          source_row_count: number
          source_rows_ar_sum: number
          status: string
          ties_to_source: boolean
        }
        Insert: {
          anchor_content_md5: string
          ar_total: number
          certified_at?: string
          certified_by?: string
          content_md5_matches: boolean
          id?: string
          inv_closure: string
          inv_one_delinquency: string
          inv_subset: string
          inv_subset_detail?: Json | null
          inv_tie_out: string
          notes?: string | null
          recomputed_content_md5: string
          section_c_abs_delta?: number | null
          section_c_behind_plan_balance?: number | null
          section_c_overdue_ar?: number | null
          section_c_pass?: boolean | null
          snapshot_date: string
          snapshot_id: string
          source_row_count: number
          source_rows_ar_sum: number
          status: string
          ties_to_source: boolean
        }
        Update: {
          anchor_content_md5?: string
          ar_total?: number
          certified_at?: string
          certified_by?: string
          content_md5_matches?: boolean
          id?: string
          inv_closure?: string
          inv_one_delinquency?: string
          inv_subset?: string
          inv_subset_detail?: Json | null
          inv_tie_out?: string
          notes?: string | null
          recomputed_content_md5?: string
          section_c_abs_delta?: number | null
          section_c_behind_plan_balance?: number | null
          section_c_overdue_ar?: number | null
          section_c_pass?: boolean | null
          snapshot_date?: string
          snapshot_id?: string
          source_row_count?: number
          source_rows_ar_sum?: number
          status?: string
          ties_to_source?: boolean
        }
        Relationships: []
      }
      ar_snapshot_denylist: {
        Row: {
          certified_at: string
          certified_by: string
          month: string
          reason: string
          snapshot_id: string | null
        }
        Insert: {
          certified_at?: string
          certified_by: string
          month: string
          reason: string
          snapshot_id?: string | null
        }
        Update: {
          certified_at?: string
          certified_by?: string
          month?: string
          reason?: string
          snapshot_id?: string | null
        }
        Relationships: []
      }
      ar_source_rows: {
        Row: {
          aging_bucket: string | null
          amount_due: number | null
          amount_paid: number | null
          client_case_text: string | null
          due_date: string | null
          excluded_from_ar: boolean | null
          id: string
          imported_at: string
          invoice_number: string | null
          invoice_total: number | null
          practice_area: string | null
          raw_payload: Json | null
          review_flag: string | null
          review_reason: string | null
          risk_tier: string | null
          snapshot_id: string
          source_invoice_id: string | null
          status: string | null
        }
        Insert: {
          aging_bucket?: string | null
          amount_due?: number | null
          amount_paid?: number | null
          client_case_text?: string | null
          due_date?: string | null
          excluded_from_ar?: boolean | null
          id?: string
          imported_at?: string
          invoice_number?: string | null
          invoice_total?: number | null
          practice_area?: string | null
          raw_payload?: Json | null
          review_flag?: string | null
          review_reason?: string | null
          risk_tier?: string | null
          snapshot_id: string
          source_invoice_id?: string | null
          status?: string | null
        }
        Update: {
          aging_bucket?: string | null
          amount_due?: number | null
          amount_paid?: number | null
          client_case_text?: string | null
          due_date?: string | null
          excluded_from_ar?: boolean | null
          id?: string
          imported_at?: string
          invoice_number?: string | null
          invoice_total?: number | null
          practice_area?: string | null
          raw_payload?: Json | null
          review_flag?: string | null
          review_reason?: string | null
          risk_tier?: string | null
          snapshot_id?: string
          source_invoice_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ar_source_rows_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "ar_source_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_source_rows_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_active_rows"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_source_rows_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_active_snapshot"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_source_rows_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_freshness_guard"
            referencedColumns: ["feeding_snapshot_id"]
          },
          {
            foreignKeyName: "ar_source_rows_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_invoice_client_map_current"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_source_rows_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_purpose_classified_v1"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_source_rows_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_snapshot_series"
            referencedColumns: ["snapshot_id"]
          },
        ]
      }
      ar_source_snapshots: {
        Row: {
          id: string
          imported_at: string
          imported_by: string | null
          notes: string | null
          raw_metadata: Json | null
          row_count: number | null
          snapshot_date: string
          source_filename: string | null
          source_system: string
          total_ar_dollars: number | null
          total_invoiced: number | null
          total_paid: number | null
        }
        Insert: {
          id?: string
          imported_at?: string
          imported_by?: string | null
          notes?: string | null
          raw_metadata?: Json | null
          row_count?: number | null
          snapshot_date: string
          source_filename?: string | null
          source_system: string
          total_ar_dollars?: number | null
          total_invoiced?: number | null
          total_paid?: number | null
        }
        Update: {
          id?: string
          imported_at?: string
          imported_by?: string | null
          notes?: string | null
          raw_metadata?: Json | null
          row_count?: number | null
          snapshot_date?: string
          source_filename?: string | null
          source_system?: string
          total_ar_dollars?: number | null
          total_invoiced?: number | null
          total_paid?: number | null
        }
        Relationships: []
      }
      ar_unattributed_link_review: {
        Row: {
          amount_due: number | null
          candidate_client_id: string | null
          candidate_client_name: string | null
          client_case_text: string | null
          confidence: string | null
          created_at: string | null
          invoice_number: string | null
          match_type: string | null
          n_candidates: number | null
          status: string | null
        }
        Insert: {
          amount_due?: number | null
          candidate_client_id?: string | null
          candidate_client_name?: string | null
          client_case_text?: string | null
          confidence?: string | null
          created_at?: string | null
          invoice_number?: string | null
          match_type?: string | null
          n_candidates?: number | null
          status?: string | null
        }
        Update: {
          amount_due?: number | null
          candidate_client_id?: string | null
          candidate_client_name?: string | null
          client_case_text?: string | null
          confidence?: string | null
          created_at?: string | null
          invoice_number?: string | null
          match_type?: string | null
          n_candidates?: number | null
          status?: string | null
        }
        Relationships: []
      }
      ar_understanding_rubric: {
        Row: {
          category: string | null
          coverage_pct: number | null
          current_value: string | null
          dimension: string
          gap: string | null
          priority: number | null
          source_object: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          coverage_pct?: number | null
          current_value?: string | null
          dimension: string
          gap?: string | null
          priority?: number | null
          source_object?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          coverage_pct?: number | null
          current_value?: string | null
          dimension?: string
          gap?: string | null
          priority?: number | null
          source_object?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ar_watch_heartbeat: {
        Row: {
          alerts: string | null
          delinquent_180_ar: number | null
          delinquent_180_clients: number | null
          delinquent_90_ar: number | null
          id: string
          lawpay_age_hours: number | null
          mycase_inv_age_hours: number | null
          mycase_txn_age_hours: number | null
          prior_month_lawpay_gap: number | null
          ran_at: string
          stalled_plan_ar: number | null
          status: string
        }
        Insert: {
          alerts?: string | null
          delinquent_180_ar?: number | null
          delinquent_180_clients?: number | null
          delinquent_90_ar?: number | null
          id?: string
          lawpay_age_hours?: number | null
          mycase_inv_age_hours?: number | null
          mycase_txn_age_hours?: number | null
          prior_month_lawpay_gap?: number | null
          ran_at?: string
          stalled_plan_ar?: number | null
          status: string
        }
        Update: {
          alerts?: string | null
          delinquent_180_ar?: number | null
          delinquent_180_clients?: number | null
          delinquent_90_ar?: number | null
          id?: string
          lawpay_age_hours?: number | null
          mycase_inv_age_hours?: number | null
          mycase_txn_age_hours?: number | null
          prior_month_lawpay_gap?: number | null
          ran_at?: string
          stalled_plan_ar?: number | null
          status?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          performed_by: string | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          performed_by?: string | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          performed_by?: string | null
          record_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_rates: {
        Row: {
          created_at: string
          effective_date: string
          end_date: string | null
          id: string
          matter_id: string | null
          rate: number
          timekeeper_id: string
        }
        Insert: {
          created_at?: string
          effective_date: string
          end_date?: string | null
          id?: string
          matter_id?: string | null
          rate: number
          timekeeper_id: string
        }
        Update: {
          created_at?: string
          effective_date?: string
          end_date?: string | null
          id?: string
          matter_id?: string | null
          rate?: number
          timekeeper_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_rates_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_rates_timekeeper_id_fkey"
            columns: ["timekeeper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      card_recovery_campaign_cohorts: {
        Row: {
          amount_due: number | null
          client_name: string | null
          client_name_norm: string | null
          client_number: string | null
          cohort_date: string
          created_at: string | null
          days_behind: number | null
          email: string | null
          emailable: boolean | null
          id: string
          installments_paid: number | null
          motion: string
          total_installments: number | null
        }
        Insert: {
          amount_due?: number | null
          client_name?: string | null
          client_name_norm?: string | null
          client_number?: string | null
          cohort_date: string
          created_at?: string | null
          days_behind?: number | null
          email?: string | null
          emailable?: boolean | null
          id?: string
          installments_paid?: number | null
          motion?: string
          total_installments?: number | null
        }
        Update: {
          amount_due?: number | null
          client_name?: string | null
          client_name_norm?: string | null
          client_number?: string | null
          cohort_date?: string
          created_at?: string | null
          days_behind?: number | null
          email?: string | null
          emailable?: boolean | null
          id?: string
          installments_paid?: number | null
          motion?: string
          total_installments?: number | null
        }
        Relationships: []
      }
      case_events: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          immigration_case_id: string | null
          judge: string | null
          location: string | null
          matter_id: string | null
          notes: string | null
          result: string | null
          webex_or_in_person: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          event_date: string
          event_time?: string | null
          event_type: string
          id?: string
          immigration_case_id?: string | null
          judge?: string | null
          location?: string | null
          matter_id?: string | null
          notes?: string | null
          result?: string | null
          webex_or_in_person?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          immigration_case_id?: string | null
          judge?: string | null
          location?: string | null
          matter_id?: string | null
          notes?: string | null
          result?: string | null
          webex_or_in_person?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_events_immigration_case_id_fkey"
            columns: ["immigration_case_id"]
            isOneToOne: false
            referencedRelation: "immigration_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_events_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      case_milestones: {
        Row: {
          client_id: string | null
          completed: boolean | null
          created_at: string | null
          id: string
          immigration_case_id: string
          milestone_date: string | null
          milestone_type: string
          notes: string | null
        }
        Insert: {
          client_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          id?: string
          immigration_case_id: string
          milestone_date?: string | null
          milestone_type: string
          notes?: string | null
        }
        Update: {
          client_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          id?: string
          immigration_case_id?: string
          milestone_date?: string | null
          milestone_type?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_milestones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_milestones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_milestones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_milestones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_milestones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_milestones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_milestones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_milestones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_milestones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_milestones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_milestones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_milestones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "case_milestones_immigration_case_id_fkey"
            columns: ["immigration_case_id"]
            isOneToOne: false
            referencedRelation: "immigration_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cert_feed_refresh: {
        Row: {
          anchor_snapshot_id: string
          certified_at: string
          certified_by: string
          evidence: Json | null
          feed: string
          id: string
          leg1_provenance: string
          leg2_validation: string
          leg3_immutability: string
          leg4_dedup: string
          leg5_reattribution: string
          leg6_invariants: string
          refresh_as_of: string
          run_id: string | null
          verdict: string
        }
        Insert: {
          anchor_snapshot_id: string
          certified_at?: string
          certified_by?: string
          evidence?: Json | null
          feed: string
          id?: string
          leg1_provenance?: string
          leg2_validation?: string
          leg3_immutability?: string
          leg4_dedup?: string
          leg5_reattribution?: string
          leg6_invariants?: string
          refresh_as_of: string
          run_id?: string | null
          verdict?: string
        }
        Update: {
          anchor_snapshot_id?: string
          certified_at?: string
          certified_by?: string
          evidence?: Json | null
          feed?: string
          id?: string
          leg1_provenance?: string
          leg2_validation?: string
          leg3_immutability?: string
          leg4_dedup?: string
          leg5_reattribution?: string
          leg6_invariants?: string
          refresh_as_of?: string
          run_id?: string | null
          verdict?: string
        }
        Relationships: []
      }
      cert_mc_h1_manual_split: {
        Row: {
          amount: number
          anchor_snapshot_id: string
          ar_before: boolean
          as_of: string
          bucket: string
          cert_run_id: string
          certified_at: string
          cure_bias_pit_only: boolean
          has_open_ar_now: boolean
          is_recovery: boolean
          known_client: boolean
          method_family: string
          mo: string
          overdue_now: boolean
          overdue_pit: boolean
          payment_date: string
          payment_id: number
          tokenkey: string | null
        }
        Insert: {
          amount: number
          anchor_snapshot_id: string
          ar_before: boolean
          as_of: string
          bucket: string
          cert_run_id: string
          certified_at?: string
          cure_bias_pit_only: boolean
          has_open_ar_now: boolean
          is_recovery: boolean
          known_client: boolean
          method_family: string
          mo: string
          overdue_now: boolean
          overdue_pit: boolean
          payment_date: string
          payment_id: number
          tokenkey?: string | null
        }
        Update: {
          amount?: number
          anchor_snapshot_id?: string
          ar_before?: boolean
          as_of?: string
          bucket?: string
          cert_run_id?: string
          certified_at?: string
          cure_bias_pit_only?: boolean
          has_open_ar_now?: boolean
          is_recovery?: boolean
          known_client?: boolean
          method_family?: string
          mo?: string
          overdue_now?: boolean
          overdue_pit?: boolean
          payment_date?: string
          payment_id?: number
          tokenkey?: string | null
        }
        Relationships: []
      }
      client_backfill_audit_20260618: {
        Row: {
          client_id: string
          created_at: string | null
          full_name: string | null
          mycase_contact_id: number | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          full_name?: string | null
          mycase_contact_id?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          full_name?: string | null
          mycase_contact_id?: number | null
        }
        Relationships: []
      }
      client_dedup_enrich_log: {
        Row: {
          created_at: string
          field: string
          id: number
          new_value: string | null
          run_id: string
          survivor_id: string
        }
        Insert: {
          created_at?: string
          field: string
          id?: number
          new_value?: string | null
          run_id: string
          survivor_id: string
        }
        Update: {
          created_at?: string
          field?: string
          id?: number
          new_value?: string | null
          run_id?: string
          survivor_id?: string
        }
        Relationships: []
      }
      client_dedup_reindex_log: {
        Row: {
          created_at: string
          fk_col: string
          id: number
          new_client_id: string
          old_client_id: string
          pk: string
          run_id: string
          table_name: string
        }
        Insert: {
          created_at?: string
          fk_col: string
          id?: number
          new_client_id: string
          old_client_id: string
          pk: string
          run_id: string
          table_name: string
        }
        Update: {
          created_at?: string
          fk_col?: string
          id?: number
          new_client_id?: string
          old_client_id?: string
          pk?: string
          run_id?: string
          table_name?: string
        }
        Relationships: []
      }
      client_duplicate_identity_review: {
        Row: {
          classification: string
          created_at: string
          duplicate_client_id: string
          evidence: Json
          executed_at: string | null
          execution_result: Json | null
          hubspot_contact_id: string
          id: string
          live_hubspot_validated_at: string | null
          recommended_survivor_id: string
          resolved_hubspot_contact_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          score_gap: number
          status: string
          updated_at: string
        }
        Insert: {
          classification: string
          created_at?: string
          duplicate_client_id: string
          evidence?: Json
          executed_at?: string | null
          execution_result?: Json | null
          hubspot_contact_id: string
          id?: string
          live_hubspot_validated_at?: string | null
          recommended_survivor_id: string
          resolved_hubspot_contact_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score_gap: number
          status?: string
          updated_at?: string
        }
        Update: {
          classification?: string
          created_at?: string
          duplicate_client_id?: string
          evidence?: Json
          executed_at?: string | null
          execution_result?: Json | null
          hubspot_contact_id?: string
          id?: string
          live_hubspot_validated_at?: string | null
          recommended_survivor_id?: string
          resolved_hubspot_contact_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score_gap?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_duplicate_identity_review_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_recommended_survivor_id_fkey"
            columns: ["recommended_survivor_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_recommended_survivor_id_fkey"
            columns: ["recommended_survivor_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_recommended_survivor_id_fkey"
            columns: ["recommended_survivor_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_recommended_survivor_id_fkey"
            columns: ["recommended_survivor_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_recommended_survivor_id_fkey"
            columns: ["recommended_survivor_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_recommended_survivor_id_fkey"
            columns: ["recommended_survivor_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_recommended_survivor_id_fkey"
            columns: ["recommended_survivor_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_recommended_survivor_id_fkey"
            columns: ["recommended_survivor_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_recommended_survivor_id_fkey"
            columns: ["recommended_survivor_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_recommended_survivor_id_fkey"
            columns: ["recommended_survivor_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_recommended_survivor_id_fkey"
            columns: ["recommended_survivor_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_identity_review_recommended_survivor_id_fkey"
            columns: ["recommended_survivor_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      client_duplicate_merge_audit: {
        Row: {
          case_number: string | null
          created_at: string
          duplicate_client_id: string | null
          duplicate_client_number: string | null
          id: string
          merge_reason: string
          merge_run_id: string | null
          moved_activities: number
          moved_contracts: number
          moved_immigration_cases: number
          moved_payments: number
          normalized_name: string
          survivor_client_id: string
          survivor_client_number: string | null
        }
        Insert: {
          case_number?: string | null
          created_at?: string
          duplicate_client_id?: string | null
          duplicate_client_number?: string | null
          id?: string
          merge_reason: string
          merge_run_id?: string | null
          moved_activities?: number
          moved_contracts?: number
          moved_immigration_cases?: number
          moved_payments?: number
          normalized_name: string
          survivor_client_id: string
          survivor_client_number?: string | null
        }
        Update: {
          case_number?: string | null
          created_at?: string
          duplicate_client_id?: string | null
          duplicate_client_number?: string | null
          id?: string
          merge_reason?: string
          merge_run_id?: string | null
          moved_activities?: number
          moved_contracts?: number
          moved_immigration_cases?: number
          moved_payments?: number
          normalized_name?: string
          survivor_client_id?: string
          survivor_client_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_duplicate_merge_audit_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_duplicate_client_id_fkey"
            columns: ["duplicate_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_survivor_client_id_fkey"
            columns: ["survivor_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_survivor_client_id_fkey"
            columns: ["survivor_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_survivor_client_id_fkey"
            columns: ["survivor_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_survivor_client_id_fkey"
            columns: ["survivor_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_survivor_client_id_fkey"
            columns: ["survivor_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_survivor_client_id_fkey"
            columns: ["survivor_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_survivor_client_id_fkey"
            columns: ["survivor_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_survivor_client_id_fkey"
            columns: ["survivor_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_survivor_client_id_fkey"
            columns: ["survivor_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_survivor_client_id_fkey"
            columns: ["survivor_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_survivor_client_id_fkey"
            columns: ["survivor_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_duplicate_merge_audit_survivor_client_id_fkey"
            columns: ["survivor_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      client_link_review_queue: {
        Row: {
          candidate_client_ids: string[] | null
          candidate_scores: Json | null
          context: Json | null
          created_at: string
          dollar_impact: number | null
          id: string
          notes: string | null
          priority: string
          reason: string
          resolution: string | null
          resolution_client_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          source_id: string
          source_system: string
        }
        Insert: {
          candidate_client_ids?: string[] | null
          candidate_scores?: Json | null
          context?: Json | null
          created_at?: string
          dollar_impact?: number | null
          id?: string
          notes?: string | null
          priority: string
          reason: string
          resolution?: string | null
          resolution_client_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          source_id: string
          source_system: string
        }
        Update: {
          candidate_client_ids?: string[] | null
          candidate_scores?: Json | null
          context?: Json | null
          created_at?: string
          dollar_impact?: number | null
          id?: string
          notes?: string | null
          priority?: string
          reason?: string
          resolution?: string | null
          resolution_client_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          source_id?: string
          source_system?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_link_review_queue_resolution_client_id_fkey"
            columns: ["resolution_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_link_review_queue_resolution_client_id_fkey"
            columns: ["resolution_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_link_review_queue_resolution_client_id_fkey"
            columns: ["resolution_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_link_review_queue_resolution_client_id_fkey"
            columns: ["resolution_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_link_review_queue_resolution_client_id_fkey"
            columns: ["resolution_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_link_review_queue_resolution_client_id_fkey"
            columns: ["resolution_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_link_review_queue_resolution_client_id_fkey"
            columns: ["resolution_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_link_review_queue_resolution_client_id_fkey"
            columns: ["resolution_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_link_review_queue_resolution_client_id_fkey"
            columns: ["resolution_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_link_review_queue_resolution_client_id_fkey"
            columns: ["resolution_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_link_review_queue_resolution_client_id_fkey"
            columns: ["resolution_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_link_review_queue_resolution_client_id_fkey"
            columns: ["resolution_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      client_source_links: {
        Row: {
          client_id: string
          id: string
          link_confidence: number
          link_evidence: Json | null
          link_method: string
          linked_at: string
          linked_by: string | null
          source_id: string
          source_system: string
          superseded_at: string | null
          superseded_reason: string | null
        }
        Insert: {
          client_id: string
          id?: string
          link_confidence?: number
          link_evidence?: Json | null
          link_method: string
          linked_at?: string
          linked_by?: string | null
          source_id: string
          source_system: string
          superseded_at?: string | null
          superseded_reason?: string | null
        }
        Update: {
          client_id?: string
          id?: string
          link_confidence?: number
          link_evidence?: Json | null
          link_method?: string
          linked_at?: string
          linked_by?: string | null
          source_id?: string
          source_system?: string
          superseded_at?: string | null
          superseded_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      client_status_recommendations: {
        Row: {
          ar_balance_due: number | null
          auto_applied_at: string | null
          auto_apply_eligible: boolean
          client_id: string
          created_at: string
          current_status: string | null
          evidence_summary: Json
          id: string
          recommendation_category: string
          recommended_status: string | null
          reviewer_decision: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          run_id: string
        }
        Insert: {
          ar_balance_due?: number | null
          auto_applied_at?: string | null
          auto_apply_eligible?: boolean
          client_id: string
          created_at?: string
          current_status?: string | null
          evidence_summary?: Json
          id?: string
          recommendation_category: string
          recommended_status?: string | null
          reviewer_decision?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          run_id: string
        }
        Update: {
          ar_balance_due?: number | null
          auto_applied_at?: string | null
          auto_apply_eligible?: boolean
          client_id?: string
          created_at?: string
          current_status?: string | null
          evidence_summary?: Json
          id?: string
          recommendation_category?: string
          recommended_status?: string | null
          reviewer_decision?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_status_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_status_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_status_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_status_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_status_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_status_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_status_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_status_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_status_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_status_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_status_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_status_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_status_recommendations_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ar_reconciliation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          a_number: string | null
          address_line1: string | null
          address_line2: string | null
          assigned_collector: string | null
          billing_contact_email: string | null
          case_number: string | null
          case_stage: string | null
          city: string | null
          client_number: string
          client_quality_reason: string | null
          client_quality_status: string
          contact_name: string | null
          created_at: string
          created_by: string | null
          custom_fields: Json | null
          days_past_due: number | null
          delinquency_status: string | null
          detained: boolean | null
          email: string | null
          excluded_from_collections: boolean
          filevine_project_id: string | null
          hubspot_contact_id: string | null
          hubspot_deal_id: string | null
          id: string
          is_active: boolean
          last_transaction_amount: number | null
          last_transaction_date: string | null
          last_transaction_source: string | null
          mycase_id: number | null
          name: string
          nationality: string | null
          next_payment_date: string | null
          notes: string | null
          payment_terms_days: number
          phone: string | null
          practice_area: string | null
          preferred_contact_method: string | null
          preferred_language: string | null
          quality_reviewed_at: string | null
          referral_source: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          a_number?: string | null
          address_line1?: string | null
          address_line2?: string | null
          assigned_collector?: string | null
          billing_contact_email?: string | null
          case_number?: string | null
          case_stage?: string | null
          city?: string | null
          client_number: string
          client_quality_reason?: string | null
          client_quality_status?: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          days_past_due?: number | null
          delinquency_status?: string | null
          detained?: boolean | null
          email?: string | null
          excluded_from_collections?: boolean
          filevine_project_id?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          id?: string
          is_active?: boolean
          last_transaction_amount?: number | null
          last_transaction_date?: string | null
          last_transaction_source?: string | null
          mycase_id?: number | null
          name: string
          nationality?: string | null
          next_payment_date?: string | null
          notes?: string | null
          payment_terms_days?: number
          phone?: string | null
          practice_area?: string | null
          preferred_contact_method?: string | null
          preferred_language?: string | null
          quality_reviewed_at?: string | null
          referral_source?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          a_number?: string | null
          address_line1?: string | null
          address_line2?: string | null
          assigned_collector?: string | null
          billing_contact_email?: string | null
          case_number?: string | null
          case_stage?: string | null
          city?: string | null
          client_number?: string
          client_quality_reason?: string | null
          client_quality_status?: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          days_past_due?: number | null
          delinquency_status?: string | null
          detained?: boolean | null
          email?: string | null
          excluded_from_collections?: boolean
          filevine_project_id?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          id?: string
          is_active?: boolean
          last_transaction_amount?: number | null
          last_transaction_date?: string | null
          last_transaction_source?: string | null
          mycase_id?: number | null
          name?: string
          nationality?: string | null
          next_payment_date?: string | null
          notes?: string | null
          payment_terms_days?: number
          phone?: string | null
          practice_area?: string | null
          preferred_contact_method?: string | null
          preferred_language?: string | null
          quality_reviewed_at?: string | null
          referral_source?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_activities: {
        Row: {
          activity_date: string
          activity_type: string | null
          call_direction: string | null
          case_status: string | null
          client_id: string | null
          client_name: string
          collected_amount: number | null
          collector: string
          commission: number | null
          contract_id: string | null
          created_at: string | null
          delinquency_days: number | null
          duration_minutes: number | null
          end_time: string | null
          escalated_to: string | null
          id: string
          is_junk: boolean | null
          next_payment_expected: string | null
          notes: string | null
          origin: string | null
          outcome: string | null
          overdue_since: string | null
          start_time: string | null
          transaction_id: string | null
          weekday: string | null
        }
        Insert: {
          activity_date: string
          activity_type?: string | null
          call_direction?: string | null
          case_status?: string | null
          client_id?: string | null
          client_name: string
          collected_amount?: number | null
          collector: string
          commission?: number | null
          contract_id?: string | null
          created_at?: string | null
          delinquency_days?: number | null
          duration_minutes?: number | null
          end_time?: string | null
          escalated_to?: string | null
          id?: string
          is_junk?: boolean | null
          next_payment_expected?: string | null
          notes?: string | null
          origin?: string | null
          outcome?: string | null
          overdue_since?: string | null
          start_time?: string | null
          transaction_id?: string | null
          weekday?: string | null
        }
        Update: {
          activity_date?: string
          activity_type?: string | null
          call_direction?: string | null
          case_status?: string | null
          client_id?: string | null
          client_name?: string
          collected_amount?: number | null
          collector?: string
          commission?: number | null
          contract_id?: string | null
          created_at?: string | null
          delinquency_days?: number | null
          duration_minutes?: number | null
          end_time?: string | null
          escalated_to?: string | null
          id?: string
          is_junk?: boolean | null
          next_payment_expected?: string | null
          notes?: string | null
          origin?: string | null
          outcome?: string | null
          overdue_since?: string | null
          start_time?: string | null
          transaction_id?: string | null
          weekday?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "collection_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "collection_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "collection_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "collection_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "collection_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "collection_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "collection_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "collection_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "collection_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "collection_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      collection_activity_junk_log: {
        Row: {
          activity_id: string
          created_at: string
          id: number
          method: string | null
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: number
          method?: string | null
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: number
          method?: string | null
        }
        Relationships: []
      }
      collection_activity_link_log: {
        Row: {
          activity_id: string
          client_id: string | null
          client_id_preimage: string | null
          created_at: string
          dedup_version: string | null
          id: number
          method: string | null
          name_key: string | null
          reversible: boolean
          run_id: string | null
          snapshot_id: string | null
        }
        Insert: {
          activity_id: string
          client_id?: string | null
          client_id_preimage?: string | null
          created_at?: string
          dedup_version?: string | null
          id?: number
          method?: string | null
          name_key?: string | null
          reversible?: boolean
          run_id?: string | null
          snapshot_id?: string | null
        }
        Update: {
          activity_id?: string
          client_id?: string | null
          client_id_preimage?: string | null
          created_at?: string
          dedup_version?: string | null
          id?: number
          method?: string | null
          name_key?: string | null
          reversible?: boolean
          run_id?: string | null
          snapshot_id?: string | null
        }
        Relationships: []
      }
      collection_flow_monthly: {
        Row: {
          auto_pay: number
          client_care: number
          client_selfpay: number
          collections: number
          created_at: string | null
          id: string
          month: string
          sales: number
          total: number | null
        }
        Insert: {
          auto_pay?: number
          client_care?: number
          client_selfpay?: number
          collections?: number
          created_at?: string | null
          id?: string
          month: string
          sales?: number
          total?: number | null
        }
        Update: {
          auto_pay?: number
          client_care?: number
          client_selfpay?: number
          collections?: number
          created_at?: string | null
          id?: string
          month?: string
          sales?: number
          total?: number | null
        }
        Relationships: []
      }
      collections_queue: {
        Row: {
          aging_bucket: string | null
          amount_paid: number | null
          assigned_collector: string | null
          balance_due: number | null
          client_issue: string | null
          client_name: string | null
          contact_priority: number | null
          created_at: string | null
          days_aging: number | null
          days_since_call: number | null
          days_since_payment: number | null
          dedup_version: string | null
          id: string
          invoice_total: number | null
          last_call_by: string | null
          last_call_date: string | null
          last_call_outcome: string | null
          last_payment_date: string | null
          matched_client_id: string | null
          name_norm: string | null
          payment_status: string | null
          prior_note: string | null
          ptp_date: string | null
          rank_in_collector: number | null
          run_date: string
          run_id: string | null
          snapshot_id: string | null
          warmth: string | null
        }
        Insert: {
          aging_bucket?: string | null
          amount_paid?: number | null
          assigned_collector?: string | null
          balance_due?: number | null
          client_issue?: string | null
          client_name?: string | null
          contact_priority?: number | null
          created_at?: string | null
          days_aging?: number | null
          days_since_call?: number | null
          days_since_payment?: number | null
          dedup_version?: string | null
          id?: string
          invoice_total?: number | null
          last_call_by?: string | null
          last_call_date?: string | null
          last_call_outcome?: string | null
          last_payment_date?: string | null
          matched_client_id?: string | null
          name_norm?: string | null
          payment_status?: string | null
          prior_note?: string | null
          ptp_date?: string | null
          rank_in_collector?: number | null
          run_date: string
          run_id?: string | null
          snapshot_id?: string | null
          warmth?: string | null
        }
        Update: {
          aging_bucket?: string | null
          amount_paid?: number | null
          assigned_collector?: string | null
          balance_due?: number | null
          client_issue?: string | null
          client_name?: string | null
          contact_priority?: number | null
          created_at?: string | null
          days_aging?: number | null
          days_since_call?: number | null
          days_since_payment?: number | null
          dedup_version?: string | null
          id?: string
          invoice_total?: number | null
          last_call_by?: string | null
          last_call_date?: string | null
          last_call_outcome?: string | null
          last_payment_date?: string | null
          matched_client_id?: string | null
          name_norm?: string | null
          payment_status?: string | null
          prior_note?: string | null
          ptp_date?: string | null
          rank_in_collector?: number | null
          run_date?: string
          run_id?: string | null
          snapshot_id?: string | null
          warmth?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_queue_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "collections_queue_runs"
            referencedColumns: ["run_id"]
          },
        ]
      }
      collections_queue_runs: {
        Row: {
          assigned: number | null
          built_at: string
          current_payers_excluded: number | null
          notes: string | null
          params: Json | null
          pool_eligible: number | null
          run_date: string
          run_id: string
          source: string | null
          total_balance: number | null
        }
        Insert: {
          assigned?: number | null
          built_at?: string
          current_payers_excluded?: number | null
          notes?: string | null
          params?: Json | null
          pool_eligible?: number | null
          run_date: string
          run_id?: string
          source?: string | null
          total_balance?: number | null
        }
        Update: {
          assigned?: number | null
          built_at?: string
          current_payers_excluded?: number | null
          notes?: string | null
          params?: Json | null
          pool_eligible?: number | null
          run_date?: string
          run_id?: string
          source?: string | null
          total_balance?: number | null
        }
        Relationships: []
      }
      collector_assignment_audit: {
        Row: {
          assigned_collector: string
          assignment_reason: string
          assignment_score: number
          client_id: string
          collected_total: number
          contact_count: number
          created_at: string
          id: string
          last_contact: string | null
          positive_count: number
          previous_collector: string | null
        }
        Insert: {
          assigned_collector: string
          assignment_reason: string
          assignment_score?: number
          client_id: string
          collected_total?: number
          contact_count: number
          created_at?: string
          id?: string
          last_contact?: string | null
          positive_count: number
          previous_collector?: string | null
        }
        Update: {
          assigned_collector?: string
          assignment_reason?: string
          assignment_score?: number
          client_id?: string
          collected_total?: number
          contact_count?: number
          created_at?: string
          id?: string
          last_contact?: string | null
          positive_count?: number
          previous_collector?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collector_assignment_audit_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collector_assignment_audit_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collector_assignment_audit_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collector_assignment_audit_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collector_assignment_audit_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collector_assignment_audit_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collector_assignment_audit_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collector_assignment_audit_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collector_assignment_audit_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collector_assignment_audit_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collector_assignment_audit_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collector_assignment_audit_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      collector_roster: {
        Row: {
          active: boolean
          collector_name: string
          created_at: string
          layout: string
          notes: string | null
          sheet_name: string | null
          started_at: string | null
        }
        Insert: {
          active?: boolean
          collector_name: string
          created_at?: string
          layout?: string
          notes?: string | null
          sheet_name?: string | null
          started_at?: string | null
        }
        Update: {
          active?: boolean
          collector_name?: string
          created_at?: string
          layout?: string
          notes?: string | null
          sheet_name?: string | null
          started_at?: string | null
        }
        Relationships: []
      }
      collector_succession: {
        Row: {
          effective_at: string | null
          from_collector: string
          note: string | null
          to_collector: string
        }
        Insert: {
          effective_at?: string | null
          from_collector: string
          note?: string | null
          to_collector: string
        }
        Update: {
          effective_at?: string | null
          from_collector?: string
          note?: string | null
          to_collector?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          amount_paid: number | null
          card_last_four: string | null
          client_id: string | null
          converted_at: string | null
          converted_to_client: boolean | null
          created_at: string | null
          email: string | null
          id: string
          lawpay_transaction_id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          phone: string | null
          potential_client_name: string | null
          raw_payload: Json | null
          status: string | null
        }
        Insert: {
          amount_paid?: number | null
          card_last_four?: string | null
          client_id?: string | null
          converted_at?: string | null
          converted_to_client?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          lawpay_transaction_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          phone?: string | null
          potential_client_name?: string | null
          raw_payload?: Json | null
          status?: string | null
        }
        Update: {
          amount_paid?: number | null
          card_last_four?: string | null
          client_id?: string | null
          converted_at?: string | null
          converted_to_client?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          lawpay_transaction_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          phone?: string | null
          potential_client_name?: string | null
          raw_payload?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      consults: {
        Row: {
          attorney: string | null
          client_id: string | null
          consult_specialist: string | null
          consultation_date: string | null
          consultation_fee: number | null
          converted_at: string | null
          converted_contract_id: string | null
          converted_to_case: boolean | null
          created_at: string | null
          dealname: string | null
          hubspot_created_at: string | null
          hubspot_deal_id: string
          hubspot_updated_at: string | null
          id: string
          intaker: string | null
          lead_priority: string | null
          mycase_id: string | null
          payment_status: string | null
          phone_number: string | null
          pipeline: string | null
          practice_area: string | null
          stage: string | null
          stage_label: string | null
          unqualified_reason: string | null
          updated_at: string | null
        }
        Insert: {
          attorney?: string | null
          client_id?: string | null
          consult_specialist?: string | null
          consultation_date?: string | null
          consultation_fee?: number | null
          converted_at?: string | null
          converted_contract_id?: string | null
          converted_to_case?: boolean | null
          created_at?: string | null
          dealname?: string | null
          hubspot_created_at?: string | null
          hubspot_deal_id: string
          hubspot_updated_at?: string | null
          id?: string
          intaker?: string | null
          lead_priority?: string | null
          mycase_id?: string | null
          payment_status?: string | null
          phone_number?: string | null
          pipeline?: string | null
          practice_area?: string | null
          stage?: string | null
          stage_label?: string | null
          unqualified_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          attorney?: string | null
          client_id?: string | null
          consult_specialist?: string | null
          consultation_date?: string | null
          consultation_fee?: number | null
          converted_at?: string | null
          converted_contract_id?: string | null
          converted_to_case?: boolean | null
          created_at?: string | null
          dealname?: string | null
          hubspot_created_at?: string | null
          hubspot_deal_id?: string
          hubspot_updated_at?: string | null
          id?: string
          intaker?: string | null
          lead_priority?: string | null
          mycase_id?: string | null
          payment_status?: string | null
          phone_number?: string | null
          pipeline?: string | null
          practice_area?: string | null
          stage?: string | null
          stage_label?: string | null
          unqualified_reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consults_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consults_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consults_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consults_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consults_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consults_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consults_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consults_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consults_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consults_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consults_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consults_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consults_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consults_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consults_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consults_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "consults_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consults_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "consults_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "consults_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "consults_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "consults_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "consults_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "consults_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "consults_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "consults_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "consults_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      contract_client_backfill_audit_20260618: {
        Row: {
          ar: number | null
          contract_id: string
          created_at: string | null
          new_client_id: string | null
          via_invoice: string | null
        }
        Insert: {
          ar?: number | null
          contract_id: string
          created_at?: string | null
          new_client_id?: string | null
          via_invoice?: string | null
        }
        Update: {
          ar?: number | null
          contract_id?: string
          created_at?: string | null
          new_client_id?: string | null
          via_invoice?: string | null
        }
        Relationships: []
      }
      contract_collected_correction_audit: {
        Row: {
          applied: boolean | null
          applied_at: string | null
          contract_id: string
          contract_value: number | null
          direction: string | null
          id: number
          invoice_number: string | null
          new_collected: number | null
          old_collected: number | null
          source: string | null
          swing: number | null
        }
        Insert: {
          applied?: boolean | null
          applied_at?: string | null
          contract_id: string
          contract_value?: number | null
          direction?: string | null
          id?: number
          invoice_number?: string | null
          new_collected?: number | null
          old_collected?: number | null
          source?: string | null
          swing?: number | null
        }
        Update: {
          applied?: boolean | null
          applied_at?: string | null
          contract_id?: string
          contract_value?: number | null
          direction?: string | null
          id?: number
          invoice_number?: string | null
          new_collected?: number | null
          old_collected?: number | null
          source?: string | null
          swing?: number | null
        }
        Relationships: []
      }
      contract_orphan_recovery_audit: {
        Row: {
          contract_id: string
          created_client_number: string | null
          id: string
          match_method: string
          migration_name: string
          new_client_id: string
          old_client_id: string | null
          original_client_text: string | null
          parsed_client_name: string | null
          performed_at: string
        }
        Insert: {
          contract_id: string
          created_client_number?: string | null
          id?: string
          match_method: string
          migration_name?: string
          new_client_id: string
          old_client_id?: string | null
          original_client_text?: string | null
          parsed_client_name?: string | null
          performed_at?: string
        }
        Update: {
          contract_id?: string
          created_client_number?: string | null
          id?: string
          match_method?: string
          migration_name?: string
          new_client_id?: string
          old_client_id?: string | null
          original_client_text?: string | null
          parsed_client_name?: string | null
          performed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_orphan_recovery_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_orphan_recovery_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_orphan_recovery_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_orphan_recovery_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_orphan_recovery_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_orphan_recovery_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_orphan_recovery_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_orphan_recovery_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_orphan_recovery_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_orphan_recovery_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_orphan_recovery_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_orphan_recovery_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_orphan_recovery_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_orphan_recovery_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_orphan_recovery_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      contract_status_hygiene_audit: {
        Row: {
          applied: boolean | null
          applied_at: string | null
          contract_id: string | null
          id: number
          new_status: string | null
          old_status: string | null
        }
        Insert: {
          applied?: boolean | null
          applied_at?: string | null
          contract_id?: string | null
          id?: number
          new_status?: string | null
          old_status?: string | null
        }
        Update: {
          applied?: boolean | null
          applied_at?: string | null
          contract_id?: string | null
          id?: number
          new_status?: string | null
          old_status?: string | null
        }
        Relationships: []
      }
      contract_status_reclass_audit: {
        Row: {
          contract_id: string
          id: string
          migration_name: string
          new_delinquency: string | null
          new_status: string | null
          old_delinquency: string | null
          old_status: string | null
          performed_at: string
          reason: string
        }
        Insert: {
          contract_id: string
          id?: string
          migration_name: string
          new_delinquency?: string | null
          new_status?: string | null
          old_delinquency?: string | null
          old_status?: string | null
          performed_at?: string
          reason: string
        }
        Update: {
          contract_id?: string
          id?: string
          migration_name?: string
          new_delinquency?: string | null
          new_status?: string | null
          old_delinquency?: string | null
          old_status?: string | null
          performed_at?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_status_reclass_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_status_reclass_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_status_reclass_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_status_reclass_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_status_reclass_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_status_reclass_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_status_reclass_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_status_reclass_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_status_reclass_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_status_reclass_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_status_reclass_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_status_reclass_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_status_reclass_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_status_reclass_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_status_reclass_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      contracts: {
        Row: {
          case_number: string | null
          client: string
          client_id: string | null
          collected: number | null
          collector: string | null
          created_at: string | null
          days_out: number | null
          delinquency_status: string | null
          down_payment: number | null
          down_payment_paid: boolean | null
          excel_status: string | null
          hubspot_deal_id: string | null
          hubspot_pipeline: string | null
          hubspot_stage: string | null
          hubspot_validated_at: string | null
          id: string
          installments_paid: number | null
          invoice_number: string | null
          last_transaction_amount: number | null
          last_transaction_date: string | null
          last_transaction_source: string | null
          lawpay_invoice_number: string | null
          matter_id: string | null
          maturity_date: string | null
          monthly_installment: number | null
          next_due_date: string | null
          notes: string | null
          phone: string | null
          practice_area: string | null
          start_date: string | null
          status: string | null
          total_installments: number | null
          value: number
        }
        Insert: {
          case_number?: string | null
          client: string
          client_id?: string | null
          collected?: number | null
          collector?: string | null
          created_at?: string | null
          days_out?: number | null
          delinquency_status?: string | null
          down_payment?: number | null
          down_payment_paid?: boolean | null
          excel_status?: string | null
          hubspot_deal_id?: string | null
          hubspot_pipeline?: string | null
          hubspot_stage?: string | null
          hubspot_validated_at?: string | null
          id?: string
          installments_paid?: number | null
          invoice_number?: string | null
          last_transaction_amount?: number | null
          last_transaction_date?: string | null
          last_transaction_source?: string | null
          lawpay_invoice_number?: string | null
          matter_id?: string | null
          maturity_date?: string | null
          monthly_installment?: number | null
          next_due_date?: string | null
          notes?: string | null
          phone?: string | null
          practice_area?: string | null
          start_date?: string | null
          status?: string | null
          total_installments?: number | null
          value: number
        }
        Update: {
          case_number?: string | null
          client?: string
          client_id?: string | null
          collected?: number | null
          collector?: string | null
          created_at?: string | null
          days_out?: number | null
          delinquency_status?: string | null
          down_payment?: number | null
          down_payment_paid?: boolean | null
          excel_status?: string | null
          hubspot_deal_id?: string | null
          hubspot_pipeline?: string | null
          hubspot_stage?: string | null
          hubspot_validated_at?: string | null
          id?: string
          installments_paid?: number | null
          invoice_number?: string | null
          last_transaction_amount?: number | null
          last_transaction_date?: string | null
          last_transaction_source?: string | null
          lawpay_invoice_number?: string | null
          matter_id?: string | null
          maturity_date?: string | null
          monthly_installment?: number | null
          next_due_date?: string | null
          notes?: string | null
          phone?: string | null
          practice_area?: string | null
          start_date?: string | null
          status?: string | null
          total_installments?: number | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_definitions: {
        Row: {
          created_at: string | null
          created_by: string | null
          field_key: string
          field_label: string
          field_type: string
          id: string
          is_required: boolean | null
          options: Json | null
          sort_order: number | null
          table_name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          field_key: string
          field_label: string
          field_type: string
          id?: string
          is_required?: boolean | null
          options?: Json | null
          sort_order?: number | null
          table_name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          field_key?: string
          field_label?: string
          field_type?: string
          id?: string
          is_required?: boolean | null
          options?: Json | null
          sort_order?: number | null
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_definitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dedup_gate_heartbeat: {
        Row: {
          drop_feed: string | null
          drop_status: string | null
          id: number
          notes: string | null
          overlap_dollars: number | null
          ran_at: string
          rows_flagged: number | null
          rows_scanned: number | null
          threshold_dollars: number | null
          trigger_source: string | null
        }
        Insert: {
          drop_feed?: string | null
          drop_status?: string | null
          id?: number
          notes?: string | null
          overlap_dollars?: number | null
          ran_at?: string
          rows_flagged?: number | null
          rows_scanned?: number | null
          threshold_dollars?: number | null
          trigger_source?: string | null
        }
        Update: {
          drop_feed?: string | null
          drop_status?: string | null
          id?: number
          notes?: string | null
          overlap_dollars?: number | null
          ran_at?: string
          rows_flagged?: number | null
          rows_scanned?: number | null
          threshold_dollars?: number | null
          trigger_source?: string | null
        }
        Relationships: []
      }
      escalations: {
        Row: {
          assigned_to: string | null
          call_activity_id: string | null
          client_id: string
          contract_id: string | null
          created_at: string
          follow_up_date: string | null
          handoff_queue: string | null
          handoff_target: string | null
          id: string
          notes: string | null
          outcome_snapshot: string | null
          priority: string
          raised_by: string
          resolution_notes: string | null
          resolved_at: string | null
          source_context: string | null
          status: string
          trigger_reason: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          call_activity_id?: string | null
          client_id: string
          contract_id?: string | null
          created_at?: string
          follow_up_date?: string | null
          handoff_queue?: string | null
          handoff_target?: string | null
          id?: string
          notes?: string | null
          outcome_snapshot?: string | null
          priority?: string
          raised_by: string
          resolution_notes?: string | null
          resolved_at?: string | null
          source_context?: string | null
          status?: string
          trigger_reason: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          call_activity_id?: string | null
          client_id?: string
          contract_id?: string | null
          created_at?: string
          follow_up_date?: string | null
          handoff_queue?: string | null
          handoff_target?: string | null
          id?: string
          notes?: string | null
          outcome_snapshot?: string | null
          priority?: string
          raised_by?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          source_context?: string | null
          status?: string
          trigger_reason?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalations_call_activity_id_fkey"
            columns: ["call_activity_id"]
            isOneToOne: false
            referencedRelation: "collection_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_call_activity_id_fkey"
            columns: ["call_activity_id"]
            isOneToOne: false
            referencedRelation: "v_collection_activity_lawpay_link_candidates"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "escalations_call_activity_id_fkey"
            columns: ["call_activity_id"]
            isOneToOne: false
            referencedRelation: "v_collection_activity_link_candidates"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "escalations_call_activity_id_fkey"
            columns: ["call_activity_id"]
            isOneToOne: false
            referencedRelation: "v_collection_activity_link_drift"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "escalations_call_activity_id_fkey"
            columns: ["call_activity_id"]
            isOneToOne: false
            referencedRelation: "v_collection_activity_link_proposals"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "escalations_call_activity_id_fkey"
            columns: ["call_activity_id"]
            isOneToOne: false
            referencedRelation: "v_collection_activity_link_subset"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "escalations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "escalations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "escalations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "escalations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "escalations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "escalations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "escalations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "escalations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "escalations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "escalations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "escalations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      fee_schedule_rules: {
        Row: {
          case_type: string
          contract_value: number
          created_at: string
          down_payment: number
          effective_from: string | null
          effective_to: string | null
          id: string
          is_current: boolean
          monthly_installment: number
          notes: string | null
          plan_months: number
          plan_name: string
        }
        Insert: {
          case_type: string
          contract_value: number
          created_at?: string
          down_payment?: number
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_current?: boolean
          monthly_installment: number
          notes?: string | null
          plan_months: number
          plan_name: string
        }
        Update: {
          case_type?: string
          contract_value?: number
          created_at?: string
          down_payment?: number
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_current?: boolean
          monthly_installment?: number
          notes?: string | null
          plan_months?: number
          plan_name?: string
        }
        Relationships: []
      }
      feed_cert_heartbeat: {
        Row: {
          feeds_alert: number | null
          feeds_attested: number | null
          feeds_seen: number | null
          id: string
          notes: string | null
          ran_at: string
          status: string
        }
        Insert: {
          feeds_alert?: number | null
          feeds_attested?: number | null
          feeds_seen?: number | null
          id?: string
          notes?: string | null
          ran_at?: string
          status?: string
        }
        Update: {
          feeds_alert?: number | null
          feeds_attested?: number | null
          feeds_seen?: number | null
          id?: string
          notes?: string | null
          ran_at?: string
          status?: string
        }
        Relationships: []
      }
      filevine_ghost_resolution: {
        Row: {
          client_id: string | null
          confidence: number | null
          created_at: string | null
          dollars: number | null
          evidence: Json | null
          last_pay: string | null
          project_name: string
          resolution_type: string | null
          txns: number | null
        }
        Insert: {
          client_id?: string | null
          confidence?: number | null
          created_at?: string | null
          dollars?: number | null
          evidence?: Json | null
          last_pay?: string | null
          project_name: string
          resolution_type?: string | null
          txns?: number | null
        }
        Update: {
          client_id?: string | null
          confidence?: number | null
          created_at?: string | null
          dollars?: number | null
          evidence?: Json | null
          last_pay?: string | null
          project_name?: string
          resolution_type?: string | null
          txns?: number | null
        }
        Relationships: []
      }
      filevine_not_in_mycase_stage: {
        Row: {
          amount_paid: number | null
          amount_receivable: number | null
          case_number: string | null
          case_text: string | null
          client_name: string | null
          due_date: string | null
          id: number
          invoice_total: number | null
          loaded_at: string | null
          normalized_client: string | null
          source_invoice: string | null
          status: string | null
        }
        Insert: {
          amount_paid?: number | null
          amount_receivable?: number | null
          case_number?: string | null
          case_text?: string | null
          client_name?: string | null
          due_date?: string | null
          id?: number
          invoice_total?: number | null
          loaded_at?: string | null
          normalized_client?: string | null
          source_invoice?: string | null
          status?: string | null
        }
        Update: {
          amount_paid?: number | null
          amount_receivable?: number | null
          case_number?: string | null
          case_text?: string | null
          client_name?: string | null
          due_date?: string | null
          id?: number
          invoice_total?: number | null
          loaded_at?: string | null
          normalized_client?: string | null
          source_invoice?: string | null
          status?: string | null
        }
        Relationships: []
      }
      filevine_payment_events: {
        Row: {
          amount: number
          created_at: string
          created_by_user_name: string | null
          date_applied: string | null
          description: string | null
          error_message: string | null
          filevine_event_type: string | null
          filevine_invoice_id: string | null
          filevine_invoice_number: string | null
          filevine_object_type: string | null
          filevine_payment_id: string
          filevine_project_id: string | null
          filevine_project_name: string | null
          id: string
          matched_client_id: string | null
          matched_contract_id: string | null
          matched_invoice_id: string | null
          payment_date: string | null
          payment_id: string | null
          payment_source: string | null
          processed_at: string
          processing_status: string
          raw_payload: Json | null
          sync_source: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by_user_name?: string | null
          date_applied?: string | null
          description?: string | null
          error_message?: string | null
          filevine_event_type?: string | null
          filevine_invoice_id?: string | null
          filevine_invoice_number?: string | null
          filevine_object_type?: string | null
          filevine_payment_id: string
          filevine_project_id?: string | null
          filevine_project_name?: string | null
          id?: string
          matched_client_id?: string | null
          matched_contract_id?: string | null
          matched_invoice_id?: string | null
          payment_date?: string | null
          payment_id?: string | null
          payment_source?: string | null
          processed_at?: string
          processing_status?: string
          raw_payload?: Json | null
          sync_source?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by_user_name?: string | null
          date_applied?: string | null
          description?: string | null
          error_message?: string | null
          filevine_event_type?: string | null
          filevine_invoice_id?: string | null
          filevine_invoice_number?: string | null
          filevine_object_type?: string | null
          filevine_payment_id?: string
          filevine_project_id?: string | null
          filevine_project_name?: string | null
          id?: string
          matched_client_id?: string | null
          matched_contract_id?: string | null
          matched_invoice_id?: string | null
          payment_date?: string | null
          payment_id?: string | null
          payment_source?: string | null
          processed_at?: string
          processing_status?: string
          raw_payload?: Json | null
          sync_source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "filevine_payment_events_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_matched_invoice_id_fkey"
            columns: ["matched_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filevine_payment_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filevine_payment_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_clean"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filevine_payment_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_clean_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filevine_payment_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "v_eq_multi_contract_attribution"
            referencedColumns: ["payment_id"]
          },
          {
            foreignKeyName: "filevine_payment_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "v_eq_refund_reversal"
            referencedColumns: ["payment_id"]
          },
        ]
      }
      filevine_project_snapshots: {
        Row: {
          client_name: string | null
          created_at: string
          error_message: string | null
          filevine_project_id: string
          id: string
          is_active: boolean | null
          match_type: string | null
          matched_case_id: string | null
          matched_client_id: string | null
          processed_at: string
          processing_status: string
          project_name: string | null
          project_phase: string | null
          project_type: string | null
          raw_payload: Json | null
          sync_source: string
          updated_at: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          error_message?: string | null
          filevine_project_id: string
          id?: string
          is_active?: boolean | null
          match_type?: string | null
          matched_case_id?: string | null
          matched_client_id?: string | null
          processed_at?: string
          processing_status?: string
          project_name?: string | null
          project_phase?: string | null
          project_type?: string | null
          raw_payload?: Json | null
          sync_source?: string
          updated_at?: string
        }
        Update: {
          client_name?: string | null
          created_at?: string
          error_message?: string | null
          filevine_project_id?: string
          id?: string
          is_active?: boolean | null
          match_type?: string | null
          matched_case_id?: string | null
          matched_client_id?: string | null
          processed_at?: string
          processing_status?: string
          project_name?: string | null
          project_phase?: string | null
          project_type?: string | null
          raw_payload?: Json | null
          sync_source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "filevine_project_snapshots_matched_case_id_fkey"
            columns: ["matched_case_id"]
            isOneToOne: false
            referencedRelation: "immigration_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filevine_project_snapshots_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_project_snapshots_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_project_snapshots_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filevine_project_snapshots_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_project_snapshots_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_project_snapshots_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_project_snapshots_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_project_snapshots_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_project_snapshots_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_project_snapshots_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_project_snapshots_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "filevine_project_snapshots_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      filevine_sync_state: {
        Row: {
          created_at: string
          last_cursor: string | null
          last_payment_date: string | null
          last_success_at: string | null
          meta: Json
          sync_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          last_cursor?: string | null
          last_payment_date?: string | null
          last_success_at?: string | null
          meta?: Json
          sync_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          last_cursor?: string | null
          last_payment_date?: string | null
          last_success_at?: string | null
          meta?: Json
          sync_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      filevine_txn_application: {
        Row: {
          amount_applied: number | null
          applied_by: string | null
          applied_date: string | null
          id: number
          invoice_date: string | null
          invoice_number: string | null
          invoice_total: number | null
          loaded_at: string | null
          matched_client_id: string | null
          method: string | null
          org_name: string | null
          payment_id: string | null
          project_name: string | null
          source_file: string | null
          txn_amount: number | null
          txn_date: string | null
          txn_description: string | null
        }
        Insert: {
          amount_applied?: number | null
          applied_by?: string | null
          applied_date?: string | null
          id?: number
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_total?: number | null
          loaded_at?: string | null
          matched_client_id?: string | null
          method?: string | null
          org_name?: string | null
          payment_id?: string | null
          project_name?: string | null
          source_file?: string | null
          txn_amount?: number | null
          txn_date?: string | null
          txn_description?: string | null
        }
        Update: {
          amount_applied?: number | null
          applied_by?: string | null
          applied_date?: string | null
          id?: number
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_total?: number | null
          loaded_at?: string | null
          matched_client_id?: string | null
          method?: string | null
          org_name?: string | null
          payment_id?: string | null
          project_name?: string | null
          source_file?: string | null
          txn_amount?: number | null
          txn_date?: string | null
          txn_description?: string | null
        }
        Relationships: []
      }
      fin_recon_rubric: {
        Row: {
          coverage_pct: number | null
          current_value: string | null
          dimension: string
          gap: string | null
          priority: number | null
          source_object: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          coverage_pct?: number | null
          current_value?: string | null
          dimension: string
          gap?: string | null
          priority?: number | null
          source_object?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          coverage_pct?: number | null
          current_value?: string | null
          dimension?: string
          gap?: string | null
          priority?: number | null
          source_object?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      firm_finance_issue_log: {
        Row: {
          affected_objects: string[]
          anchor_snapshot_id: string | null
          category: string
          certification_requirements: Json | null
          created_by: string
          detected_at: string
          evidence: Json
          id: string
          issue_key: string
          proposed_fix: string | null
          raised_by: string
          raised_for: string | null
          resolution: string | null
          resolved_at: string | null
          root_cause: string | null
          severity: string
          status: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_objects?: string[]
          anchor_snapshot_id?: string | null
          category: string
          certification_requirements?: Json | null
          created_by?: string
          detected_at?: string
          evidence?: Json
          id?: string
          issue_key: string
          proposed_fix?: string | null
          raised_by: string
          raised_for?: string | null
          resolution?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity: string
          status?: string
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_objects?: string[]
          anchor_snapshot_id?: string | null
          category?: string
          certification_requirements?: Json | null
          created_by?: string
          detected_at?: string
          evidence?: Json
          id?: string
          issue_key?: string
          proposed_fix?: string | null
          raised_by?: string
          raised_for?: string | null
          resolution?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          status?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      firm_financial_heartbeat: {
        Row: {
          aged_180_pct: number | null
          ar_net_movement: number | null
          ar_total: number | null
          as_of: string | null
          collected_pct: number | null
          dedup_anti_fanout_overdue: number | null
          delinquent_180_ar: number | null
          delinquent_180_clients: number | null
          filevine_recognition_pct: number | null
          filevine_unresolved: number | null
          genuine_hole_offspine_noar: number | null
          id: string
          live_attributed_ar: number | null
          mom_change: number | null
          mom_change_pct: number | null
          notes: string | null
          recognized_clients: number | null
          recon_flags: Json | null
          recon_status: string | null
          run_at: string
          snapshot_vs_live_gap: number | null
        }
        Insert: {
          aged_180_pct?: number | null
          ar_net_movement?: number | null
          ar_total?: number | null
          as_of?: string | null
          collected_pct?: number | null
          dedup_anti_fanout_overdue?: number | null
          delinquent_180_ar?: number | null
          delinquent_180_clients?: number | null
          filevine_recognition_pct?: number | null
          filevine_unresolved?: number | null
          genuine_hole_offspine_noar?: number | null
          id?: string
          live_attributed_ar?: number | null
          mom_change?: number | null
          mom_change_pct?: number | null
          notes?: string | null
          recognized_clients?: number | null
          recon_flags?: Json | null
          recon_status?: string | null
          run_at?: string
          snapshot_vs_live_gap?: number | null
        }
        Update: {
          aged_180_pct?: number | null
          ar_net_movement?: number | null
          ar_total?: number | null
          as_of?: string | null
          collected_pct?: number | null
          dedup_anti_fanout_overdue?: number | null
          delinquent_180_ar?: number | null
          delinquent_180_clients?: number | null
          filevine_recognition_pct?: number | null
          filevine_unresolved?: number | null
          genuine_hole_offspine_noar?: number | null
          id?: string
          live_attributed_ar?: number | null
          mom_change?: number | null
          mom_change_pct?: number | null
          notes?: string | null
          recognized_clients?: number | null
          recon_flags?: Json | null
          recon_status?: string | null
          run_at?: string
          snapshot_vs_live_gap?: number | null
        }
        Relationships: []
      }
      firm_settings: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          collections_high_balance_threshold: number
          collections_low_balance_threshold: number
          collections_promise_grace_days: number
          collections_stale_contact_days: number
          created_at: string
          default_late_fee_percent: number | null
          default_payment_terms_days: number
          ein: string | null
          email: string | null
          firm_name: string
          id: string
          lawpay_default_account: string
          lawpay_enabled: boolean
          lawpay_operating_url: string | null
          lawpay_trust_url: string | null
          logo_url: string | null
          phone: string | null
          state: string | null
          trust_account_bank_name: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          collections_high_balance_threshold?: number
          collections_low_balance_threshold?: number
          collections_promise_grace_days?: number
          collections_stale_contact_days?: number
          created_at?: string
          default_late_fee_percent?: number | null
          default_payment_terms_days?: number
          ein?: string | null
          email?: string | null
          firm_name?: string
          id?: string
          lawpay_default_account?: string
          lawpay_enabled?: boolean
          lawpay_operating_url?: string | null
          lawpay_trust_url?: string | null
          logo_url?: string | null
          phone?: string | null
          state?: string | null
          trust_account_bank_name?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          collections_high_balance_threshold?: number
          collections_low_balance_threshold?: number
          collections_promise_grace_days?: number
          collections_stale_contact_days?: number
          created_at?: string
          default_late_fee_percent?: number | null
          default_payment_terms_days?: number
          ein?: string | null
          email?: string | null
          firm_name?: string
          id?: string
          lawpay_default_account?: string
          lawpay_enabled?: boolean
          lawpay_operating_url?: string | null
          lawpay_trust_url?: string | null
          logo_url?: string | null
          phone?: string | null
          state?: string | null
          trust_account_bank_name?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      fv_rerecord_release_backup_20260810: {
        Row: {
          amount: number | null
          backed_up_at: string | null
          client_name: string | null
          id: number | null
          invoice_number: string | null
          is_filevine_rerecord: boolean | null
          rerecord_checked_at: string | null
          rerecord_match_tier: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          backed_up_at?: string | null
          client_name?: string | null
          id?: number | null
          invoice_number?: string | null
          is_filevine_rerecord?: boolean | null
          rerecord_checked_at?: string | null
          rerecord_match_tier?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          backed_up_at?: string | null
          client_name?: string | null
          id?: number | null
          invoice_number?: string | null
          is_filevine_rerecord?: boolean | null
          rerecord_checked_at?: string | null
          rerecord_match_tier?: string | null
          status?: string | null
        }
        Relationships: []
      }
      hardship_requests: {
        Row: {
          client_id: string
          contract_id: string | null
          created_at: string
          current_monthly_payment: number | null
          current_term_remaining: number | null
          hardship_type: string
          id: string
          notes: string | null
          proposed_monthly_payment: number | null
          proposed_term_months: number | null
          reason: string
          requested_by: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          contract_id?: string | null
          created_at?: string
          current_monthly_payment?: number | null
          current_term_remaining?: number | null
          hardship_type: string
          id?: string
          notes?: string | null
          proposed_monthly_payment?: number | null
          proposed_term_months?: number | null
          reason: string
          requested_by: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          contract_id?: string | null
          created_at?: string
          current_monthly_payment?: number | null
          current_term_remaining?: number | null
          hardship_type?: string
          id?: string
          notes?: string | null
          proposed_monthly_payment?: number | null
          proposed_term_months?: number | null
          reason?: string
          requested_by?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hardship_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hardship_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hardship_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hardship_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hardship_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hardship_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hardship_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hardship_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hardship_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hardship_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hardship_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hardship_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hardship_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hardship_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hardship_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hardship_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hardship_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hardship_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hardship_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hardship_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hardship_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hardship_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hardship_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hardship_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hardship_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hardship_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hardship_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      historical_payment_attribution_review: {
        Row: {
          detected_at: string
          detected_client_id: string | null
          detected_contract_id: string
          detected_contract_owner_id: string | null
          detected_match_confidence: string | null
          detected_match_reason: string | null
          detected_payment_date: string | null
          evidence: Json
          id: number
          issue_type: string
          lawpay_transaction_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          detected_at?: string
          detected_client_id?: string | null
          detected_contract_id: string
          detected_contract_owner_id?: string | null
          detected_match_confidence?: string | null
          detected_match_reason?: string | null
          detected_payment_date?: string | null
          evidence?: Json
          id?: never
          issue_type: string
          lawpay_transaction_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          detected_at?: string
          detected_client_id?: string | null
          detected_contract_id?: string
          detected_contract_owner_id?: string | null
          detected_match_confidence?: string | null
          detected_match_reason?: string | null
          detected_payment_date?: string | null
          evidence?: Json
          id?: never
          issue_type?: string
          lawpay_transaction_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "historical_payment_attribution__detected_contract_owner_id_fkey"
            columns: ["detected_contract_owner_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution__detected_contract_owner_id_fkey"
            columns: ["detected_contract_owner_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution__detected_contract_owner_id_fkey"
            columns: ["detected_contract_owner_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_payment_attribution__detected_contract_owner_id_fkey"
            columns: ["detected_contract_owner_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution__detected_contract_owner_id_fkey"
            columns: ["detected_contract_owner_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution__detected_contract_owner_id_fkey"
            columns: ["detected_contract_owner_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution__detected_contract_owner_id_fkey"
            columns: ["detected_contract_owner_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution__detected_contract_owner_id_fkey"
            columns: ["detected_contract_owner_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution__detected_contract_owner_id_fkey"
            columns: ["detected_contract_owner_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution__detected_contract_owner_id_fkey"
            columns: ["detected_contract_owner_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution__detected_contract_owner_id_fkey"
            columns: ["detected_contract_owner_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution__detected_contract_owner_id_fkey"
            columns: ["detected_contract_owner_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_revie_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "lawpay_actual_mycase_invoice_payments"
            referencedColumns: ["lawpay_row_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_revie_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "lawpay_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_revie_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "lawpay_unmatched_resolvable"
            referencedColumns: ["lawpay_txn_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_revie_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "v_collection_activity_lawpay_link_candidates"
            referencedColumns: ["lawpay_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_revie_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "v_eq_authorized_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_revie_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "v_eq_fuzzy_match_review"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_revie_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["transaction_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_revie_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_recognition"
            referencedColumns: ["lawpay_row_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_revie_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_reversal_matched"
            referencedColumns: ["original_lawpay_row_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_revie_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_settlement_client"
            referencedColumns: ["lawpay_row_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_client_id_fkey"
            columns: ["detected_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_client_id_fkey"
            columns: ["detected_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_client_id_fkey"
            columns: ["detected_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_client_id_fkey"
            columns: ["detected_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_client_id_fkey"
            columns: ["detected_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_client_id_fkey"
            columns: ["detected_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_client_id_fkey"
            columns: ["detected_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_client_id_fkey"
            columns: ["detected_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_client_id_fkey"
            columns: ["detected_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_client_id_fkey"
            columns: ["detected_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_client_id_fkey"
            columns: ["detected_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_client_id_fkey"
            columns: ["detected_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_contract_id_fkey"
            columns: ["detected_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_contract_id_fkey"
            columns: ["detected_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_contract_id_fkey"
            columns: ["detected_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_contract_id_fkey"
            columns: ["detected_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_contract_id_fkey"
            columns: ["detected_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_contract_id_fkey"
            columns: ["detected_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_contract_id_fkey"
            columns: ["detected_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_contract_id_fkey"
            columns: ["detected_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_contract_id_fkey"
            columns: ["detected_contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_contract_id_fkey"
            columns: ["detected_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_contract_id_fkey"
            columns: ["detected_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_contract_id_fkey"
            columns: ["detected_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_contract_id_fkey"
            columns: ["detected_contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_contract_id_fkey"
            columns: ["detected_contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "historical_payment_attribution_review_detected_contract_id_fkey"
            columns: ["detected_contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      hubspot_deals_raw: {
        Row: {
          amount: number | null
          case_number: string | null
          closedate: string | null
          connector_name: string | null
          contact_email: string | null
          contact_firstname: string | null
          contact_lastname: string | null
          contact_phone: string | null
          createdate: string | null
          dealname: string | null
          dealstage: string | null
          hs_lastmodifieddate: string | null
          hubspot_deal_id: string
          match_method: string | null
          match_notes: string | null
          match_score: number | null
          match_status: string | null
          matched_at: string | null
          matched_client_id: string | null
          matched_contract_id: string | null
          mycase_case_id: string | null
          payload: Json | null
          pipeline: string
          primary_contact_id: string | null
          pulled_at: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          case_number?: string | null
          closedate?: string | null
          connector_name?: string | null
          contact_email?: string | null
          contact_firstname?: string | null
          contact_lastname?: string | null
          contact_phone?: string | null
          createdate?: string | null
          dealname?: string | null
          dealstage?: string | null
          hs_lastmodifieddate?: string | null
          hubspot_deal_id: string
          match_method?: string | null
          match_notes?: string | null
          match_score?: number | null
          match_status?: string | null
          matched_at?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_case_id?: string | null
          payload?: Json | null
          pipeline: string
          primary_contact_id?: string | null
          pulled_at?: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          case_number?: string | null
          closedate?: string | null
          connector_name?: string | null
          contact_email?: string | null
          contact_firstname?: string | null
          contact_lastname?: string | null
          contact_phone?: string | null
          createdate?: string | null
          dealname?: string | null
          dealstage?: string | null
          hs_lastmodifieddate?: string | null
          hubspot_deal_id?: string
          match_method?: string | null
          match_notes?: string | null
          match_score?: number | null
          match_status?: string | null
          matched_at?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_case_id?: string | null
          payload?: Json | null
          pipeline?: string
          primary_contact_id?: string | null
          pulled_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      hubspot_sync_log: {
        Row: {
          created_at: string | null
          event_type: string | null
          hubspot_deal_id: string
          id: string
          match_detail: string | null
          matched: boolean | null
          payload: Json | null
          pipeline: string | null
          stage: string | null
        }
        Insert: {
          created_at?: string | null
          event_type?: string | null
          hubspot_deal_id: string
          id?: string
          match_detail?: string | null
          matched?: boolean | null
          payload?: Json | null
          pipeline?: string | null
          stage?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string | null
          hubspot_deal_id?: string
          id?: string
          match_detail?: string | null
          matched?: boolean | null
          payload?: Json | null
          pipeline?: string | null
          stage?: string | null
        }
        Relationships: []
      }
      immigration_cases: {
        Row: {
          a_number: string | null
          billing_contact: string | null
          case_name: string | null
          case_number: string
          case_stage: string | null
          case_type: string | null
          client_id: string | null
          closed_date: string | null
          created_at: string | null
          date_retained: string | null
          days_in_stage: number | null
          detained: boolean | null
          fee_structure: string | null
          filevine_id: string | null
          filevine_phase: string | null
          filevine_project_id: string | null
          flat_fee: number | null
          hearing_type: string | null
          id: string
          immigration_court: string | null
          immigration_judge: string | null
          is_closed: boolean | null
          lead_attorney: string | null
          matter_id: string | null
          mycase_case_id: string | null
          nationality: string | null
          needs_review: boolean | null
          next_steps: string | null
          notes: string | null
          open_date: string | null
          paralegal: string | null
          practice_area: string | null
          retained_for: string | null
          team: string | null
          updated_at: string | null
        }
        Insert: {
          a_number?: string | null
          billing_contact?: string | null
          case_name?: string | null
          case_number: string
          case_stage?: string | null
          case_type?: string | null
          client_id?: string | null
          closed_date?: string | null
          created_at?: string | null
          date_retained?: string | null
          days_in_stage?: number | null
          detained?: boolean | null
          fee_structure?: string | null
          filevine_id?: string | null
          filevine_phase?: string | null
          filevine_project_id?: string | null
          flat_fee?: number | null
          hearing_type?: string | null
          id?: string
          immigration_court?: string | null
          immigration_judge?: string | null
          is_closed?: boolean | null
          lead_attorney?: string | null
          matter_id?: string | null
          mycase_case_id?: string | null
          nationality?: string | null
          needs_review?: boolean | null
          next_steps?: string | null
          notes?: string | null
          open_date?: string | null
          paralegal?: string | null
          practice_area?: string | null
          retained_for?: string | null
          team?: string | null
          updated_at?: string | null
        }
        Update: {
          a_number?: string | null
          billing_contact?: string | null
          case_name?: string | null
          case_number?: string
          case_stage?: string | null
          case_type?: string | null
          client_id?: string | null
          closed_date?: string | null
          created_at?: string | null
          date_retained?: string | null
          days_in_stage?: number | null
          detained?: boolean | null
          fee_structure?: string | null
          filevine_id?: string | null
          filevine_phase?: string | null
          filevine_project_id?: string | null
          flat_fee?: number | null
          hearing_type?: string | null
          id?: string
          immigration_court?: string | null
          immigration_judge?: string | null
          is_closed?: boolean | null
          lead_attorney?: string | null
          matter_id?: string | null
          mycase_case_id?: string | null
          nationality?: string | null
          needs_review?: boolean | null
          next_steps?: string | null
          notes?: string | null
          open_date?: string | null
          paralegal?: string | null
          practice_area?: string | null
          retained_for?: string | null
          team?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "immigration_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "immigration_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "immigration_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "immigration_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "immigration_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "immigration_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "immigration_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "immigration_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "immigration_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "immigration_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "immigration_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "immigration_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "immigration_cases_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      import_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_count: number
          error_log: Json | null
          field_mapping: Json | null
          file_name: string
          file_size: number | null
          id: string
          import_options: Json | null
          performed_by: string | null
          skipped_count: number
          status: string
          success_count: number
          target_table: string
          total_rows: number
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_count?: number
          error_log?: Json | null
          field_mapping?: Json | null
          file_name: string
          file_size?: number | null
          id?: string
          import_options?: Json | null
          performed_by?: string | null
          skipped_count?: number
          status?: string
          success_count?: number
          target_table: string
          total_rows?: number
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_count?: number
          error_log?: Json | null
          field_mapping?: Json | null
          file_name?: string
          file_size?: number | null
          id?: string
          import_options?: Json | null
          performed_by?: string | null
          skipped_count?: number
          status?: string
          success_count?: number
          target_table?: string
          total_rows?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_jobs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ingest_validation_log: {
        Row: {
          checks: Json | null
          control_total_actual: number | null
          control_total_expected: number | null
          feed: string
          file_mtime: string | null
          id: string
          notes: string | null
          rows_in_file: number | null
          rows_loaded: number | null
          source_file: string | null
          status: string
          validated_at: string
        }
        Insert: {
          checks?: Json | null
          control_total_actual?: number | null
          control_total_expected?: number | null
          feed: string
          file_mtime?: string | null
          id?: string
          notes?: string | null
          rows_in_file?: number | null
          rows_loaded?: number | null
          source_file?: string | null
          status: string
          validated_at?: string
        }
        Update: {
          checks?: Json | null
          control_total_actual?: number | null
          control_total_expected?: number | null
          feed?: string
          file_mtime?: string | null
          id?: string
          notes?: string | null
          rows_in_file?: number | null
          rows_loaded?: number | null
          source_file?: string | null
          status?: string
          validated_at?: string
        }
        Relationships: []
      }
      invoice_line_items: {
        Row: {
          amount: number
          created_at: string
          date: string | null
          description: string | null
          id: string
          invoice_id: string
          is_billable: boolean
          line_type: string
          quantity: number
          rate: number
          sort_order: number
          timekeeper_id: string | null
          utbms_code_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          invoice_id: string
          is_billable?: boolean
          line_type: string
          quantity?: number
          rate: number
          sort_order?: number
          timekeeper_id?: string | null
          utbms_code_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          invoice_id?: string
          is_billable?: boolean
          line_type?: string
          quantity?: number
          rate?: number
          sort_order?: number
          timekeeper_id?: string | null
          utbms_code_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_timekeeper_id_fkey"
            columns: ["timekeeper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_utbms_code_id_fkey"
            columns: ["utbms_code_id"]
            isOneToOne: false
            referencedRelation: "utbms_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          approved_by: string | null
          balance_due: number | null
          client_id: string
          created_at: string
          created_by: string | null
          custom_fields: Json | null
          discount_amount: number
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string | null
          matter_id: string
          memo: string | null
          notes: string | null
          paid_at: string | null
          payment_terms_days: number | null
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_amount: number
          tax_rate: number
          total_amount: number
          updated_at: string
          voided_at: string | null
        }
        Insert: {
          amount_paid?: number
          approved_by?: string | null
          balance_due?: number | null
          client_id: string
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string | null
          matter_id: string
          memo?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_terms_days?: number | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          updated_at?: string
          voided_at?: string | null
        }
        Update: {
          amount_paid?: number
          approved_by?: string | null
          balance_due?: number | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string | null
          matter_id?: string
          memo?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_terms_days?: number | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          updated_at?: string
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      iolta_bank_qbo: {
        Row: {
          amount: number | null
          check_no: string | null
          fitid: string | null
          id: number
          imported_at: string
          memo: string | null
          name: string | null
          txn_date: string | null
          txn_type: string | null
          year_month: string | null
        }
        Insert: {
          amount?: number | null
          check_no?: string | null
          fitid?: string | null
          id?: number
          imported_at?: string
          memo?: string | null
          name?: string | null
          txn_date?: string | null
          txn_type?: string | null
          year_month?: string | null
        }
        Update: {
          amount?: number | null
          check_no?: string | null
          fitid?: string | null
          id?: number
          imported_at?: string
          memo?: string | null
          name?: string | null
          txn_date?: string | null
          txn_type?: string | null
          year_month?: string | null
        }
        Relationships: []
      }
      iolta_client_balance_snapshot: {
        Row: {
          balance: number
          client_name: string
          client_token: string | null
          credit: number | null
          debit: number | null
          id: number
          imported_at: string
        }
        Insert: {
          balance: number
          client_name: string
          client_token?: string | null
          credit?: number | null
          debit?: number | null
          id?: number
          imported_at?: string
        }
        Update: {
          balance?: number
          client_name?: string
          client_token?: string | null
          credit?: number | null
          debit?: number | null
          id?: number
          imported_at?: string
        }
        Relationships: []
      }
      iolta_closure_roster: {
        Row: {
          case_stage: string | null
          check_is_in_bank: boolean | null
          check_no: string | null
          client_name: string
          client_token: string | null
          closed_on_filevine: string | null
          closed_on_mycase: string | null
          id: number
          imported_at: string
          mailed_date: string | null
          notes: string | null
          reason: string | null
          refund_amount: number | null
          refund_status: string | null
          refund_type: string | null
          sources: string | null
          year_lists: string | null
        }
        Insert: {
          case_stage?: string | null
          check_is_in_bank?: boolean | null
          check_no?: string | null
          client_name: string
          client_token?: string | null
          closed_on_filevine?: string | null
          closed_on_mycase?: string | null
          id?: number
          imported_at?: string
          mailed_date?: string | null
          notes?: string | null
          reason?: string | null
          refund_amount?: number | null
          refund_status?: string | null
          refund_type?: string | null
          sources?: string | null
          year_lists?: string | null
        }
        Update: {
          case_stage?: string | null
          check_is_in_bank?: boolean | null
          check_no?: string | null
          client_name?: string
          client_token?: string | null
          closed_on_filevine?: string | null
          closed_on_mycase?: string | null
          id?: number
          imported_at?: string
          mailed_date?: string | null
          notes?: string | null
          reason?: string | null
          refund_amount?: number | null
          refund_status?: string | null
          refund_type?: string | null
          sources?: string | null
          year_lists?: string | null
        }
        Relationships: []
      }
      iolta_trust_history_pdf: {
        Row: {
          bank_account: string | null
          client_name: string | null
          client_token: string | null
          details: string | null
          entered_by: string | null
          id: number
          imported_at: string
          is_disbursement: boolean | null
          is_refund_txn: boolean | null
          is_refunded: boolean | null
          method: string | null
          page: number | null
          reference: string | null
          status: string | null
          subtotal: number | null
          surcharge: number | null
          total: number | null
          txn_date: string | null
          y_pos: number | null
        }
        Insert: {
          bank_account?: string | null
          client_name?: string | null
          client_token?: string | null
          details?: string | null
          entered_by?: string | null
          id?: number
          imported_at?: string
          is_disbursement?: boolean | null
          is_refund_txn?: boolean | null
          is_refunded?: boolean | null
          method?: string | null
          page?: number | null
          reference?: string | null
          status?: string | null
          subtotal?: number | null
          surcharge?: number | null
          total?: number | null
          txn_date?: string | null
          y_pos?: number | null
        }
        Update: {
          bank_account?: string | null
          client_name?: string | null
          client_token?: string | null
          details?: string | null
          entered_by?: string | null
          id?: number
          imported_at?: string
          is_disbursement?: boolean | null
          is_refund_txn?: boolean | null
          is_refunded?: boolean | null
          method?: string | null
          page?: number | null
          reference?: string | null
          status?: string | null
          subtotal?: number | null
          surcharge?: number | null
          total?: number | null
          txn_date?: string | null
          y_pos?: number | null
        }
        Relationships: []
      }
      jeff_daily_briefings: {
        Row: {
          ar_snapshot: Json | null
          briefing_date: string
          cashflow_snapshot: Json | null
          due_today_count: number
          generated_at: string
          id: string
          overdue_tasks_count: number
          priorities_summary: string | null
          recurring_overdue: Json | null
        }
        Insert: {
          ar_snapshot?: Json | null
          briefing_date: string
          cashflow_snapshot?: Json | null
          due_today_count?: number
          generated_at?: string
          id?: string
          overdue_tasks_count?: number
          priorities_summary?: string | null
          recurring_overdue?: Json | null
        }
        Update: {
          ar_snapshot?: Json | null
          briefing_date?: string
          cashflow_snapshot?: Json | null
          due_today_count?: number
          generated_at?: string
          id?: string
          overdue_tasks_count?: number
          priorities_summary?: string | null
          recurring_overdue?: Json | null
        }
        Relationships: []
      }
      jeff_goals: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          priority: number
          status: string
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: number
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: number
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      jeff_recurring_completions: {
        Row: {
          completed_at: string
          id: string
          notes: string | null
          recurring_task_id: string
          was_late: boolean
        }
        Insert: {
          completed_at?: string
          id?: string
          notes?: string | null
          recurring_task_id: string
          was_late?: boolean
        }
        Update: {
          completed_at?: string
          id?: string
          notes?: string | null
          recurring_task_id?: string
          was_late?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "jeff_recurring_completions_recurring_task_id_fkey"
            columns: ["recurring_task_id"]
            isOneToOne: false
            referencedRelation: "jeff_recurring_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      jeff_recurring_tasks: {
        Row: {
          category: string
          created_at: string
          day_of_month: number | null
          day_of_week: number | null
          description: string | null
          frequency: string
          id: string
          is_active: boolean
          last_completed_at: string | null
          priority: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          description?: string | null
          frequency: string
          id?: string
          is_active?: boolean
          last_completed_at?: string | null
          priority?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          description?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          last_completed_at?: string | null
          priority?: string
          title?: string
        }
        Relationships: []
      }
      jeff_tasks: {
        Row: {
          blocked_reason: string | null
          category: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          goal_id: string | null
          id: string
          priority: string
          source: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          blocked_reason?: string | null
          category: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          goal_id?: string | null
          id?: string
          priority?: string
          source?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          blocked_reason?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          goal_id?: string | null
          id?: string
          priority?: string
          source?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jeff_tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "jeff_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      jeff_weekly_reports: {
        Row: {
          decisions_needed: Json | null
          generated_at: string
          id: string
          key_department_issues: Json | null
          looking_ahead: Json | null
          strategic_priorities: Json | null
          top_priorities: Json | null
          week_ending: string
        }
        Insert: {
          decisions_needed?: Json | null
          generated_at?: string
          id?: string
          key_department_issues?: Json | null
          looking_ahead?: Json | null
          strategic_priorities?: Json | null
          top_priorities?: Json | null
          week_ending: string
        }
        Update: {
          decisions_needed?: Json | null
          generated_at?: string
          id?: string
          key_department_issues?: Json | null
          looking_ahead?: Json | null
          strategic_priorities?: Json | null
          top_priorities?: Json | null
          week_ending?: string
        }
        Relationships: []
      }
      lawpay_attribution_rematch_audit: {
        Row: {
          applied_at: string | null
          contract_id: string | null
          id: number
          invoice: string | null
          lawpay_transaction_id: string | null
          method: string | null
          new_client_id: string | null
          old_client_id: string | null
        }
        Insert: {
          applied_at?: string | null
          contract_id?: string | null
          id?: number
          invoice?: string | null
          lawpay_transaction_id?: string | null
          method?: string | null
          new_client_id?: string | null
          old_client_id?: string | null
        }
        Update: {
          applied_at?: string | null
          contract_id?: string | null
          id?: number
          invoice?: string | null
          lawpay_transaction_id?: string | null
          method?: string | null
          new_client_id?: string | null
          old_client_id?: string | null
        }
        Relationships: []
      }
      lawpay_backfill_apply_log: {
        Row: {
          action: string
          applied_at: string
          id: number
          lawpay_transaction_id: string
          old_account_type: string | null
          old_client_id: string | null
          old_status: string | null
          run_id: string
        }
        Insert: {
          action: string
          applied_at?: string
          id?: number
          lawpay_transaction_id: string
          old_account_type?: string | null
          old_client_id?: string | null
          old_status?: string | null
          run_id: string
        }
        Update: {
          action?: string
          applied_at?: string
          id?: number
          lawpay_transaction_id?: string
          old_account_type?: string | null
          old_client_id?: string | null
          old_status?: string | null
          run_id?: string
        }
        Relationships: []
      }
      lawpay_backfill_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: string
          last_page: number | null
          started_at: string | null
          total_consultations: number | null
          total_duplicates: number | null
          total_inserted: number | null
          total_pages: number | null
          total_unmatched: number | null
          updated_at: string | null
          workers_completed: number | null
          workers_dispatched: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          last_page?: number | null
          started_at?: string | null
          total_consultations?: number | null
          total_duplicates?: number | null
          total_inserted?: number | null
          total_pages?: number | null
          total_unmatched?: number | null
          updated_at?: string | null
          workers_completed?: number | null
          workers_dispatched?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          last_page?: number | null
          started_at?: string | null
          total_consultations?: number | null
          total_duplicates?: number | null
          total_inserted?: number | null
          total_pages?: number | null
          total_unmatched?: number | null
          updated_at?: string | null
          workers_completed?: number | null
          workers_dispatched?: number | null
        }
        Relationships: []
      }
      lawpay_backfill_staging: {
        Row: {
          account_id: string | null
          account_type: string | null
          already_in_lawpay: boolean | null
          amount: number | null
          captured_at: string | null
          card_brand: string | null
          card_last_four: string | null
          charge_id: string | null
          class: string | null
          currency: string | null
          id: number
          invoice_number: string | null
          payment_date: string | null
          reference: string | null
          resolution: string | null
          resolved_client_id: string | null
          run_id: string
          source: string | null
          status: string | null
          transaction_id: string
          txn_type: string | null
        }
        Insert: {
          account_id?: string | null
          account_type?: string | null
          already_in_lawpay?: boolean | null
          amount?: number | null
          captured_at?: string | null
          card_brand?: string | null
          card_last_four?: string | null
          charge_id?: string | null
          class?: string | null
          currency?: string | null
          id?: number
          invoice_number?: string | null
          payment_date?: string | null
          reference?: string | null
          resolution?: string | null
          resolved_client_id?: string | null
          run_id: string
          source?: string | null
          status?: string | null
          transaction_id: string
          txn_type?: string | null
        }
        Update: {
          account_id?: string | null
          account_type?: string | null
          already_in_lawpay?: boolean | null
          amount?: number | null
          captured_at?: string | null
          card_brand?: string | null
          card_last_four?: string | null
          charge_id?: string | null
          class?: string | null
          currency?: string | null
          id?: number
          invoice_number?: string | null
          payment_date?: string | null
          reference?: string | null
          resolution?: string | null
          resolved_client_id?: string | null
          run_id?: string
          source?: string | null
          status?: string | null
          transaction_id?: string
          txn_type?: string | null
        }
        Relationships: []
      }
      lawpay_rematch_runs: {
        Row: {
          id: number
          ran_at: string | null
          result: Json | null
        }
        Insert: {
          id?: number
          ran_at?: string | null
          result?: Json | null
        }
        Update: {
          id?: number
          ran_at?: string | null
          result?: Json | null
        }
        Relationships: []
      }
      lawpay_reversals: {
        Row: {
          account_id: string | null
          amount: number
          as_of: string | null
          client_name: string | null
          ingested_at: string
          invoice_number: string
          original_transaction_id: string | null
          reversal_date: string | null
          reversal_id: string
          reversal_type: string
          run_id: string
          source: string
          source_file: string | null
          source_md5: string | null
          source_row_id: number | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          as_of?: string | null
          client_name?: string | null
          ingested_at?: string
          invoice_number: string
          original_transaction_id?: string | null
          reversal_date?: string | null
          reversal_id?: string
          reversal_type: string
          run_id: string
          source: string
          source_file?: string | null
          source_md5?: string | null
          source_row_id?: number | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          as_of?: string | null
          client_name?: string | null
          ingested_at?: string
          invoice_number?: string
          original_transaction_id?: string | null
          reversal_date?: string | null
          reversal_id?: string
          reversal_type?: string
          run_id?: string
          source?: string
          source_file?: string | null
          source_md5?: string | null
          source_row_id?: number | null
        }
        Relationships: []
      }
      lawpay_status_promotion_log: {
        Row: {
          amount: number | null
          basis: string | null
          id: string
          lawpay_row_id: string
          new_status: string
          old_status: string
          payment_date: string | null
          promoted_at: string
          reversed_at: string | null
          run_id: string
        }
        Insert: {
          amount?: number | null
          basis?: string | null
          id?: string
          lawpay_row_id: string
          new_status: string
          old_status: string
          payment_date?: string | null
          promoted_at?: string
          reversed_at?: string | null
          run_id: string
        }
        Update: {
          amount?: number | null
          basis?: string | null
          id?: string
          lawpay_row_id?: string
          new_status?: string
          old_status?: string
          payment_date?: string | null
          promoted_at?: string
          reversed_at?: string | null
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawpay_status_promotion_log_lawpay_row_id_fkey"
            columns: ["lawpay_row_id"]
            isOneToOne: false
            referencedRelation: "lawpay_actual_mycase_invoice_payments"
            referencedColumns: ["lawpay_row_id"]
          },
          {
            foreignKeyName: "lawpay_status_promotion_log_lawpay_row_id_fkey"
            columns: ["lawpay_row_id"]
            isOneToOne: false
            referencedRelation: "lawpay_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_status_promotion_log_lawpay_row_id_fkey"
            columns: ["lawpay_row_id"]
            isOneToOne: false
            referencedRelation: "lawpay_unmatched_resolvable"
            referencedColumns: ["lawpay_txn_id"]
          },
          {
            foreignKeyName: "lawpay_status_promotion_log_lawpay_row_id_fkey"
            columns: ["lawpay_row_id"]
            isOneToOne: false
            referencedRelation: "v_collection_activity_lawpay_link_candidates"
            referencedColumns: ["lawpay_id"]
          },
          {
            foreignKeyName: "lawpay_status_promotion_log_lawpay_row_id_fkey"
            columns: ["lawpay_row_id"]
            isOneToOne: false
            referencedRelation: "v_eq_authorized_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_status_promotion_log_lawpay_row_id_fkey"
            columns: ["lawpay_row_id"]
            isOneToOne: false
            referencedRelation: "v_eq_fuzzy_match_review"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_status_promotion_log_lawpay_row_id_fkey"
            columns: ["lawpay_row_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["transaction_id"]
          },
          {
            foreignKeyName: "lawpay_status_promotion_log_lawpay_row_id_fkey"
            columns: ["lawpay_row_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_recognition"
            referencedColumns: ["lawpay_row_id"]
          },
          {
            foreignKeyName: "lawpay_status_promotion_log_lawpay_row_id_fkey"
            columns: ["lawpay_row_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_reversal_matched"
            referencedColumns: ["original_lawpay_row_id"]
          },
          {
            foreignKeyName: "lawpay_status_promotion_log_lawpay_row_id_fkey"
            columns: ["lawpay_row_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_settlement_client"
            referencedColumns: ["lawpay_row_id"]
          },
        ]
      }
      lawpay_transactions: {
        Row: {
          account_type: string | null
          amount: number
          card_brand: string | null
          card_last_four: string | null
          client_id: string | null
          contract_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          lawpay_card_fingerprint: string | null
          lawpay_charge_id: string | null
          lawpay_customer_id: string | null
          lawpay_payer_email: string | null
          lawpay_payer_name: string | null
          lawpay_payment_method_id: string | null
          lawpay_payment_page_id: string | null
          lawpay_transaction_id: string | null
          match_confidence: string | null
          match_reason: string | null
          matched_to_payment: boolean | null
          payment_date: string | null
          payment_id: string | null
          payment_method: string | null
          processed_at: string | null
          raw_payload: Json | null
          status: string | null
        }
        Insert: {
          account_type?: string | null
          amount: number
          card_brand?: string | null
          card_last_four?: string | null
          client_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          lawpay_card_fingerprint?: string | null
          lawpay_charge_id?: string | null
          lawpay_customer_id?: string | null
          lawpay_payer_email?: string | null
          lawpay_payer_name?: string | null
          lawpay_payment_method_id?: string | null
          lawpay_payment_page_id?: string | null
          lawpay_transaction_id?: string | null
          match_confidence?: string | null
          match_reason?: string | null
          matched_to_payment?: boolean | null
          payment_date?: string | null
          payment_id?: string | null
          payment_method?: string | null
          processed_at?: string | null
          raw_payload?: Json | null
          status?: string | null
        }
        Update: {
          account_type?: string | null
          amount?: number
          card_brand?: string | null
          card_last_four?: string | null
          client_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          lawpay_card_fingerprint?: string | null
          lawpay_charge_id?: string | null
          lawpay_customer_id?: string | null
          lawpay_payer_email?: string | null
          lawpay_payer_name?: string | null
          lawpay_payment_method_id?: string | null
          lawpay_payment_page_id?: string | null
          lawpay_transaction_id?: string | null
          match_confidence?: string | null
          match_reason?: string | null
          matched_to_payment?: boolean | null
          payment_date?: string | null
          payment_id?: string | null
          payment_method?: string | null
          processed_at?: string | null
          raw_payload?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_clean"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_clean_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "v_eq_multi_contract_attribution"
            referencedColumns: ["payment_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "v_eq_refund_reversal"
            referencedColumns: ["payment_id"]
          },
        ]
      }
      lawpay_validation_log: {
        Row: {
          client_id: string | null
          contract_id: string | null
          created_at: string | null
          difference: number | null
          id: string
          issue_type: string
          lawpay_amount: number | null
          lawpay_data: Json | null
          lawpay_txn_id: string | null
          resolution: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          supabase_amount: number | null
          supabase_data: Json | null
        }
        Insert: {
          client_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          difference?: number | null
          id?: string
          issue_type: string
          lawpay_amount?: number | null
          lawpay_data?: Json | null
          lawpay_txn_id?: string | null
          resolution?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          supabase_amount?: number | null
          supabase_data?: Json | null
        }
        Update: {
          client_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          difference?: number | null
          id?: string
          issue_type?: string
          lawpay_amount?: number | null
          lawpay_data?: Json | null
          lawpay_txn_id?: string | null
          resolution?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          supabase_amount?: number | null
          supabase_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lawpay_validation_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_lawpay_txn_id_fkey"
            columns: ["lawpay_txn_id"]
            isOneToOne: false
            referencedRelation: "lawpay_actual_mycase_invoice_payments"
            referencedColumns: ["lawpay_row_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_lawpay_txn_id_fkey"
            columns: ["lawpay_txn_id"]
            isOneToOne: false
            referencedRelation: "lawpay_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_lawpay_txn_id_fkey"
            columns: ["lawpay_txn_id"]
            isOneToOne: false
            referencedRelation: "lawpay_unmatched_resolvable"
            referencedColumns: ["lawpay_txn_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_lawpay_txn_id_fkey"
            columns: ["lawpay_txn_id"]
            isOneToOne: false
            referencedRelation: "v_collection_activity_lawpay_link_candidates"
            referencedColumns: ["lawpay_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_lawpay_txn_id_fkey"
            columns: ["lawpay_txn_id"]
            isOneToOne: false
            referencedRelation: "v_eq_authorized_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_lawpay_txn_id_fkey"
            columns: ["lawpay_txn_id"]
            isOneToOne: false
            referencedRelation: "v_eq_fuzzy_match_review"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_lawpay_txn_id_fkey"
            columns: ["lawpay_txn_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["transaction_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_lawpay_txn_id_fkey"
            columns: ["lawpay_txn_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_recognition"
            referencedColumns: ["lawpay_row_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_lawpay_txn_id_fkey"
            columns: ["lawpay_txn_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_reversal_matched"
            referencedColumns: ["original_lawpay_row_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_lawpay_txn_id_fkey"
            columns: ["lawpay_txn_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_settlement_client"
            referencedColumns: ["lawpay_row_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lc_handoff_517: {
        Row: {
          aging_bucket: string | null
          autopay_status: string | null
          client: string | null
          days_overdue: number | null
          nn: string | null
          open_balance: number | null
          plan_autopay: string | null
          savable_tier: string | null
        }
        Insert: {
          aging_bucket?: string | null
          autopay_status?: string | null
          client?: string | null
          days_overdue?: number | null
          nn?: string | null
          open_balance?: number | null
          plan_autopay?: string | null
          savable_tier?: string | null
        }
        Update: {
          aging_bucket?: string | null
          autopay_status?: string | null
          client?: string | null
          days_overdue?: number | null
          nn?: string | null
          open_balance?: number | null
          plan_autopay?: string | null
          savable_tier?: string | null
        }
        Relationships: []
      }
      matters: {
        Row: {
          a_number: string | null
          billing_type: Database["public"]["Enums"]["billing_type"]
          budget_amount: number | null
          case_stage: string | null
          client_id: string
          close_date: string | null
          contingency_percent: number | null
          court_case_number: string | null
          created_at: string
          custom_fields: Json | null
          description: string | null
          detained: boolean | null
          filevine_id: string | null
          filevine_project_id: string | null
          flat_fee_amount: number | null
          hearing_type: string | null
          id: string
          immigration_court: string | null
          immigration_judge: string | null
          matter_number: string
          name: string
          notes: string | null
          open_date: string | null
          originating_attorney_id: string | null
          practice_area: string | null
          responsible_attorney_id: string | null
          status: Database["public"]["Enums"]["matter_status"]
          statute_of_limitations: string | null
          updated_at: string
        }
        Insert: {
          a_number?: string | null
          billing_type?: Database["public"]["Enums"]["billing_type"]
          budget_amount?: number | null
          case_stage?: string | null
          client_id: string
          close_date?: string | null
          contingency_percent?: number | null
          court_case_number?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          detained?: boolean | null
          filevine_id?: string | null
          filevine_project_id?: string | null
          flat_fee_amount?: number | null
          hearing_type?: string | null
          id?: string
          immigration_court?: string | null
          immigration_judge?: string | null
          matter_number: string
          name: string
          notes?: string | null
          open_date?: string | null
          originating_attorney_id?: string | null
          practice_area?: string | null
          responsible_attorney_id?: string | null
          status?: Database["public"]["Enums"]["matter_status"]
          statute_of_limitations?: string | null
          updated_at?: string
        }
        Update: {
          a_number?: string | null
          billing_type?: Database["public"]["Enums"]["billing_type"]
          budget_amount?: number | null
          case_stage?: string | null
          client_id?: string
          close_date?: string | null
          contingency_percent?: number | null
          court_case_number?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          detained?: boolean | null
          filevine_id?: string | null
          filevine_project_id?: string | null
          flat_fee_amount?: number | null
          hearing_type?: string | null
          id?: string
          immigration_court?: string | null
          immigration_judge?: string | null
          matter_number?: string
          name?: string
          notes?: string | null
          open_date?: string | null
          originating_attorney_id?: string | null
          practice_area?: string | null
          responsible_attorney_id?: string | null
          status?: Database["public"]["Enums"]["matter_status"]
          statute_of_limitations?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "matters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "matters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "matters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "matters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "matters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "matters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "matters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "matters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "matters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "matters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "matters_originating_attorney_id_fkey"
            columns: ["originating_attorney_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_responsible_attorney_id_fkey"
            columns: ["responsible_attorney_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_audit_log: {
        Row: {
          changed_at: string
          changed_by: string | null
          client_id: string
          field: string
          id: string
          migration_run_id: string | null
          new_value: string | null
          notes: string | null
          old_value: string | null
          recommendation_id: string | null
          rolled_back_at: string | null
          rolled_back_reason: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          client_id: string
          field: string
          id?: string
          migration_run_id?: string | null
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          recommendation_id?: string | null
          rolled_back_at?: string | null
          rolled_back_reason?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          client_id?: string
          field?: string
          id?: string
          migration_run_id?: string | null
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          recommendation_id?: string | null
          rolled_back_at?: string | null
          rolled_back_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "migration_audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "migration_audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "migration_audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "migration_audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "migration_audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "migration_audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "migration_audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "migration_audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "migration_audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "migration_audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "migration_audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "migration_audit_log_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "client_status_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      mirror_909_breakdown: {
        Row: {
          bal: number | null
          bucket: string | null
          client_id: string | null
          client_name: string | null
          client_number: string | null
          col: number | null
          contract_id: string | null
          created_at: string | null
          has_inv: boolean | null
          inv: string | null
          mc_amt: number | null
          mc_due: number | null
          mc_ninv: number | null
          mc_paid: number | null
          status: string | null
          v: number | null
        }
        Insert: {
          bal?: number | null
          bucket?: string | null
          client_id?: string | null
          client_name?: string | null
          client_number?: string | null
          col?: number | null
          contract_id?: string | null
          created_at?: string | null
          has_inv?: boolean | null
          inv?: string | null
          mc_amt?: number | null
          mc_due?: number | null
          mc_ninv?: number | null
          mc_paid?: number | null
          status?: string | null
          v?: number | null
        }
        Update: {
          bal?: number | null
          bucket?: string | null
          client_id?: string | null
          client_name?: string | null
          client_number?: string | null
          col?: number | null
          contract_id?: string | null
          created_at?: string | null
          has_inv?: boolean | null
          inv?: string | null
          mc_amt?: number | null
          mc_due?: number | null
          mc_ninv?: number | null
          mc_paid?: number | null
          status?: string | null
          v?: number | null
        }
        Relationships: []
      }
      mirror_collected_correction_20260617: {
        Row: {
          client_number: string | null
          contract_id: string | null
          corrected_collected: number | null
          name: string | null
          old_collected: number | null
          reason: string | null
          value: number | null
        }
        Insert: {
          client_number?: string | null
          contract_id?: string | null
          corrected_collected?: number | null
          name?: string | null
          old_collected?: number | null
          reason?: string | null
          value?: number | null
        }
        Update: {
          client_number?: string | null
          contract_id?: string | null
          corrected_collected?: number | null
          name?: string | null
          old_collected?: number | null
          reason?: string | null
          value?: number | null
        }
        Relationships: []
      }
      mirror_contract_installment_fill_20260618: {
        Row: {
          contract_id: string | null
          new_inst_paid: number | null
          new_monthly: number | null
          old_inst_paid: number | null
          old_monthly: number | null
        }
        Insert: {
          contract_id?: string | null
          new_inst_paid?: number | null
          new_monthly?: number | null
          old_inst_paid?: number | null
          old_monthly?: number | null
        }
        Update: {
          contract_id?: string | null
          new_inst_paid?: number | null
          new_monthly?: number | null
          old_inst_paid?: number | null
          old_monthly?: number | null
        }
        Relationships: []
      }
      mirror_credit_applied_high_20260617: {
        Row: {
          client_lawpay_settled: number | null
          contract_id: string | null
          mycase_paid: number | null
          new_collected: number | null
          old_collected: number | null
          our_value: number | null
          proposed_credit: number | null
        }
        Insert: {
          client_lawpay_settled?: number | null
          contract_id?: string | null
          mycase_paid?: number | null
          new_collected?: number | null
          old_collected?: number | null
          our_value?: number | null
          proposed_credit?: number | null
        }
        Update: {
          client_lawpay_settled?: number | null
          contract_id?: string | null
          mycase_paid?: number | null
          new_collected?: number | null
          old_collected?: number | null
          our_value?: number | null
          proposed_credit?: number | null
        }
        Relationships: []
      }
      mirror_credit_applied_medlow_20260617: {
        Row: {
          contract_id: string | null
          mth_settled: number | null
          new_collected: number | null
          old_collected: number | null
          our_value: number | null
          proven_credit: number | null
        }
        Insert: {
          contract_id?: string | null
          mth_settled?: number | null
          new_collected?: number | null
          old_collected?: number | null
          our_value?: number | null
          proven_credit?: number | null
        }
        Update: {
          contract_id?: string | null
          mth_settled?: number | null
          new_collected?: number | null
          old_collected?: number | null
          our_value?: number | null
          proven_credit?: number | null
        }
        Relationships: []
      }
      mirror_credit_preview: {
        Row: {
          client_lawpay_settled: number | null
          client_name: string | null
          client_number: string | null
          confidence: string | null
          contract_id: string | null
          inv: string | null
          mycase_paid: number | null
          our_collected: number | null
          our_value: number | null
          proposed_credit: number | null
        }
        Insert: {
          client_lawpay_settled?: number | null
          client_name?: string | null
          client_number?: string | null
          confidence?: string | null
          contract_id?: string | null
          inv?: string | null
          mycase_paid?: number | null
          our_collected?: number | null
          our_value?: number | null
          proposed_credit?: number | null
        }
        Update: {
          client_lawpay_settled?: number | null
          client_name?: string | null
          client_number?: string | null
          confidence?: string | null
          contract_id?: string | null
          inv?: string | null
          mycase_paid?: number | null
          our_collected?: number | null
          our_value?: number | null
          proposed_credit?: number | null
        }
        Relationships: []
      }
      mirror_filevine_exclusions: {
        Row: {
          client_id: string | null
          contract_id: string | null
          created_at: string | null
          filevine_project_id: string | null
          id: number
          invoice_in_mycase_snapshot: boolean | null
          is_open_ar: boolean | null
          open_balance: number | null
          project_name: string | null
          reason: string | null
        }
        Insert: {
          client_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          filevine_project_id?: string | null
          id?: number
          invoice_in_mycase_snapshot?: boolean | null
          is_open_ar?: boolean | null
          open_balance?: number | null
          project_name?: string | null
          reason?: string | null
        }
        Update: {
          client_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          filevine_project_id?: string | null
          id?: number
          invoice_in_mycase_snapshot?: boolean | null
          is_open_ar?: boolean | null
          open_balance?: number | null
          project_name?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      mirror_filevine_migration_list: {
        Row: {
          billing_source: string | null
          client_name: string | null
          filevine_project_id: string | null
          fv_case_number: string | null
          fv_type: string | null
          fv_url: string | null
          mycase_case_count: number | null
          mycase_case_numbers: string | null
          mycase_client_ref: string | null
          our_balance: number | null
          our_collected: number | null
          our_fee_value: number | null
          project_name: string | null
        }
        Insert: {
          billing_source?: string | null
          client_name?: string | null
          filevine_project_id?: string | null
          fv_case_number?: string | null
          fv_type?: string | null
          fv_url?: string | null
          mycase_case_count?: number | null
          mycase_case_numbers?: string | null
          mycase_client_ref?: string | null
          our_balance?: number | null
          our_collected?: number | null
          our_fee_value?: number | null
          project_name?: string | null
        }
        Update: {
          billing_source?: string | null
          client_name?: string | null
          filevine_project_id?: string | null
          fv_case_number?: string | null
          fv_type?: string | null
          fv_url?: string | null
          mycase_case_count?: number | null
          mycase_case_numbers?: string | null
          mycase_client_ref?: string | null
          our_balance?: number | null
          our_collected?: number | null
          our_fee_value?: number | null
          project_name?: string | null
        }
        Relationships: []
      }
      mirror_medlow_dig: {
        Row: {
          client_name: string | null
          confidence: string | null
          contract_id: string | null
          inv: string | null
          last_pmt: string | null
          mth_noncard: number | null
          mth_settled: number | null
          mth_verdict: string | null
          mycase_paid: number | null
          npmts: number | null
          our_collected: number | null
          our_value: number | null
          proposed_credit: number | null
        }
        Insert: {
          client_name?: string | null
          confidence?: string | null
          contract_id?: string | null
          inv?: string | null
          last_pmt?: string | null
          mth_noncard?: number | null
          mth_settled?: number | null
          mth_verdict?: string | null
          mycase_paid?: number | null
          npmts?: number | null
          our_collected?: number | null
          our_value?: number | null
          proposed_credit?: number | null
        }
        Update: {
          client_name?: string | null
          confidence?: string | null
          contract_id?: string | null
          inv?: string | null
          last_pmt?: string | null
          mth_noncard?: number | null
          mth_settled?: number | null
          mth_verdict?: string | null
          mycase_paid?: number | null
          npmts?: number | null
          our_collected?: number | null
          our_value?: number | null
          proposed_credit?: number | null
        }
        Relationships: []
      }
      mirror_medlow_dig2: {
        Row: {
          client_name: string | null
          confidence: string | null
          contract_id: string | null
          inv: string | null
          last_pmt: string | null
          mth_settled: number | null
          mycase_paid: number | null
          ninv_matched: number | null
          noncard: number | null
          our_collected: number | null
          our_value: number | null
          proven_credit: number | null
        }
        Insert: {
          client_name?: string | null
          confidence?: string | null
          contract_id?: string | null
          inv?: string | null
          last_pmt?: string | null
          mth_settled?: number | null
          mycase_paid?: number | null
          ninv_matched?: number | null
          noncard?: number | null
          our_collected?: number | null
          our_value?: number | null
          proven_credit?: number | null
        }
        Update: {
          client_name?: string | null
          confidence?: string | null
          contract_id?: string | null
          inv?: string | null
          last_pmt?: string | null
          mth_settled?: number | null
          mycase_paid?: number | null
          ninv_matched?: number | null
          noncard?: number | null
          our_collected?: number | null
          our_value?: number | null
          proven_credit?: number | null
        }
        Relationships: []
      }
      missing_payment_plans: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          case_name: string | null
          contact_name: string | null
          contract_value: number | null
          created_at: string | null
          final_payment_date: string | null
          id: string
          imported_at: string | null
          imported_to_contracts: boolean | null
          installments_paid: number | null
          invoice_number: string | null
          monthly_installment: number | null
          next_payment_due: string | null
          notes: string | null
          source: string
          status: string | null
          total_installments: number | null
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          case_name?: string | null
          contact_name?: string | null
          contract_value?: number | null
          created_at?: string | null
          final_payment_date?: string | null
          id?: string
          imported_at?: string | null
          imported_to_contracts?: boolean | null
          installments_paid?: number | null
          invoice_number?: string | null
          monthly_installment?: number | null
          next_payment_due?: string | null
          notes?: string | null
          source?: string
          status?: string | null
          total_installments?: number | null
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          case_name?: string | null
          contact_name?: string | null
          contract_value?: number | null
          created_at?: string | null
          final_payment_date?: string | null
          id?: string
          imported_at?: string | null
          imported_to_contracts?: boolean | null
          installments_paid?: number | null
          invoice_number?: string | null
          monthly_installment?: number | null
          next_payment_due?: string | null
          notes?: string | null
          source?: string
          status?: string | null
          total_installments?: number | null
        }
        Relationships: []
      }
      mycase_calls: {
        Row: {
          call_type: string | null
          called_at: string | null
          caller_name: string | null
          caller_phone_number: string | null
          created_at: string
          id: string
          message: string | null
          mycase_call_id: number
          mycase_case_id: number | null
          mycase_client_id: number | null
          mycase_lead_id: number | null
          mycase_staff_id: number | null
          raw_payload: Json | null
          resolved: boolean | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          call_type?: string | null
          called_at?: string | null
          caller_name?: string | null
          caller_phone_number?: string | null
          created_at?: string
          id?: string
          message?: string | null
          mycase_call_id: number
          mycase_case_id?: number | null
          mycase_client_id?: number | null
          mycase_lead_id?: number | null
          mycase_staff_id?: number | null
          raw_payload?: Json | null
          resolved?: boolean | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          call_type?: string | null
          called_at?: string | null
          caller_name?: string | null
          caller_phone_number?: string | null
          created_at?: string
          id?: string
          message?: string | null
          mycase_call_id?: number
          mycase_case_id?: number | null
          mycase_client_id?: number | null
          mycase_lead_id?: number | null
          mycase_staff_id?: number | null
          raw_payload?: Json | null
          resolved?: boolean | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mycase_case_roles: {
        Row: {
          created_at: string
          id: string
          mycase_role_id: number
          name: string
          raw_payload: Json | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mycase_role_id: number
          name: string
          raw_payload?: Json | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mycase_role_id?: number
          name?: string
          raw_payload?: Json | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mycase_case_stages: {
        Row: {
          created_at: string
          id: string
          mycase_stage_id: number
          name: string
          raw_payload: Json | null
          sort_order: number | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mycase_stage_id: number
          name: string
          raw_payload?: Json | null
          sort_order?: number | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mycase_stage_id?: number
          name?: string
          raw_payload?: Json | null
          sort_order?: number | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mycase_cases: {
        Row: {
          billing_contact: string | null
          billing_contact_id: number | null
          billing_type: string | null
          case_name: string | null
          case_number: string | null
          case_stage: string | null
          case_type: string | null
          closed_date: string | null
          created_at: string
          description: string | null
          flat_fee: number | null
          id: string
          is_closed: boolean | null
          lead_attorney: string | null
          lead_attorney_staff_id: number | null
          match_type: string | null
          matched_client_id: string | null
          matched_contract_id: string | null
          mycase_case_id: number
          open_date: string | null
          outstanding_balance: number | null
          practice_area: string | null
          raw_payload: Json | null
          sol_date: string | null
          status: string | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          billing_contact?: string | null
          billing_contact_id?: number | null
          billing_type?: string | null
          case_name?: string | null
          case_number?: string | null
          case_stage?: string | null
          case_type?: string | null
          closed_date?: string | null
          created_at?: string
          description?: string | null
          flat_fee?: number | null
          id?: string
          is_closed?: boolean | null
          lead_attorney?: string | null
          lead_attorney_staff_id?: number | null
          match_type?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_case_id: number
          open_date?: string | null
          outstanding_balance?: number | null
          practice_area?: string | null
          raw_payload?: Json | null
          sol_date?: string | null
          status?: string | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          billing_contact?: string | null
          billing_contact_id?: number | null
          billing_type?: string | null
          case_name?: string | null
          case_number?: string | null
          case_stage?: string | null
          case_type?: string | null
          closed_date?: string | null
          created_at?: string
          description?: string | null
          flat_fee?: number | null
          id?: string
          is_closed?: boolean | null
          lead_attorney?: string | null
          lead_attorney_staff_id?: number | null
          match_type?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_case_id?: number
          open_date?: string | null
          outstanding_balance?: number | null
          practice_area?: string | null
          raw_payload?: Json | null
          sol_date?: string | null
          status?: string | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      mycase_cases_backup_refresh: {
        Row: {
          billing_contact: string | null
          billing_contact_id: number | null
          billing_type: string | null
          case_name: string | null
          case_number: string | null
          case_stage: string | null
          case_type: string | null
          closed_date: string | null
          created_at: string | null
          description: string | null
          flat_fee: number | null
          id: string | null
          is_closed: boolean | null
          lead_attorney: string | null
          lead_attorney_staff_id: number | null
          match_type: string | null
          matched_client_id: string | null
          matched_contract_id: string | null
          mycase_case_id: number | null
          open_date: string | null
          outstanding_balance: number | null
          practice_area: string | null
          raw_payload: Json | null
          sol_date: string | null
          status: string | null
          synced_at: string | null
          updated_at: string | null
        }
        Insert: {
          billing_contact?: string | null
          billing_contact_id?: number | null
          billing_type?: string | null
          case_name?: string | null
          case_number?: string | null
          case_stage?: string | null
          case_type?: string | null
          closed_date?: string | null
          created_at?: string | null
          description?: string | null
          flat_fee?: number | null
          id?: string | null
          is_closed?: boolean | null
          lead_attorney?: string | null
          lead_attorney_staff_id?: number | null
          match_type?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_case_id?: number | null
          open_date?: string | null
          outstanding_balance?: number | null
          practice_area?: string | null
          raw_payload?: Json | null
          sol_date?: string | null
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_contact?: string | null
          billing_contact_id?: number | null
          billing_type?: string | null
          case_name?: string | null
          case_number?: string | null
          case_stage?: string | null
          case_type?: string | null
          closed_date?: string | null
          created_at?: string | null
          description?: string | null
          flat_fee?: number | null
          id?: string | null
          is_closed?: boolean | null
          lead_attorney?: string | null
          lead_attorney_staff_id?: number | null
          match_type?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_case_id?: number | null
          open_date?: string | null
          outstanding_balance?: number | null
          practice_area?: string | null
          raw_payload?: Json | null
          sol_date?: string | null
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mycase_companies: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          fax_phone: string | null
          id: string
          main_phone: string | null
          match_type: string | null
          matched_client_id: string | null
          mycase_company_id: number
          name: string | null
          raw_payload: Json | null
          state: string | null
          synced_at: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          fax_phone?: string | null
          id?: string
          main_phone?: string | null
          match_type?: string | null
          matched_client_id?: string | null
          mycase_company_id: number
          name?: string | null
          raw_payload?: Json | null
          state?: string | null
          synced_at?: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          fax_phone?: string | null
          id?: string
          main_phone?: string | null
          match_type?: string | null
          matched_client_id?: string | null
          mycase_company_id?: number
          name?: string | null
          raw_payload?: Json | null
          state?: string | null
          synced_at?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mycase_companies_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_companies_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_companies_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_companies_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_companies_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_companies_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_companies_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_companies_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_companies_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_companies_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_companies_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_companies_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      mycase_contacts: {
        Row: {
          birthdate: string | null
          cell_phone_number: string | null
          company: string | null
          contact_group: string | null
          contact_type: string | null
          created_at: string
          email: string | null
          fax_phone_number: string | null
          first_name: string | null
          full_name: string | null
          home_phone_number: string | null
          id: string
          last_name: string | null
          mailing_address1: string | null
          mailing_address2: string | null
          mailing_city: string | null
          mailing_state: string | null
          mailing_zip: string | null
          match_type: string | null
          matched_client_id: string | null
          middle_name: string | null
          mycase_contact_id: number
          phone: string | null
          raw_payload: Json | null
          synced_at: string
          updated_at: string
          work_phone_number: string | null
        }
        Insert: {
          birthdate?: string | null
          cell_phone_number?: string | null
          company?: string | null
          contact_group?: string | null
          contact_type?: string | null
          created_at?: string
          email?: string | null
          fax_phone_number?: string | null
          first_name?: string | null
          full_name?: string | null
          home_phone_number?: string | null
          id?: string
          last_name?: string | null
          mailing_address1?: string | null
          mailing_address2?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          match_type?: string | null
          matched_client_id?: string | null
          middle_name?: string | null
          mycase_contact_id: number
          phone?: string | null
          raw_payload?: Json | null
          synced_at?: string
          updated_at?: string
          work_phone_number?: string | null
        }
        Update: {
          birthdate?: string | null
          cell_phone_number?: string | null
          company?: string | null
          contact_group?: string | null
          contact_type?: string | null
          created_at?: string
          email?: string | null
          fax_phone_number?: string | null
          first_name?: string | null
          full_name?: string | null
          home_phone_number?: string | null
          id?: string
          last_name?: string | null
          mailing_address1?: string | null
          mailing_address2?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          match_type?: string | null
          matched_client_id?: string | null
          middle_name?: string | null
          mycase_contact_id?: number
          phone?: string | null
          raw_payload?: Json | null
          synced_at?: string
          updated_at?: string
          work_phone_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mycase_contacts_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_contacts_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_contacts_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_contacts_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_contacts_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_contacts_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_contacts_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_contacts_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_contacts_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_contacts_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_contacts_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_contacts_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      mycase_custom_fields: {
        Row: {
          applies_to: string | null
          created_at: string
          field_type: string | null
          id: string
          list_options: Json | null
          mycase_field_id: number
          name: string | null
          raw_payload: Json | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          applies_to?: string | null
          created_at?: string
          field_type?: string | null
          id?: string
          list_options?: Json | null
          mycase_field_id: number
          name?: string | null
          raw_payload?: Json | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          applies_to?: string | null
          created_at?: string
          field_type?: string | null
          id?: string
          list_options?: Json | null
          mycase_field_id?: number
          name?: string | null
          raw_payload?: Json | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mycase_documents: {
        Row: {
          content_type: string | null
          created_at: string
          description: string | null
          download_url: string | null
          file_size: number | null
          id: string
          mycase_case_id: number | null
          mycase_document_id: number
          name: string | null
          raw_payload: Json | null
          synced_at: string
          updated_at: string
          version_count: number | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          download_url?: string | null
          file_size?: number | null
          id?: string
          mycase_case_id?: number | null
          mycase_document_id: number
          name?: string | null
          raw_payload?: Json | null
          synced_at?: string
          updated_at?: string
          version_count?: number | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          download_url?: string | null
          file_size?: number | null
          id?: string
          mycase_case_id?: number | null
          mycase_document_id?: number
          name?: string | null
          raw_payload?: Json | null
          synced_at?: string
          updated_at?: string
          version_count?: number | null
        }
        Relationships: []
      }
      mycase_events: {
        Row: {
          all_day: boolean | null
          created_at: string
          description: string | null
          end_at: string | null
          event_type: string | null
          id: string
          location: string | null
          mycase_case_id: number | null
          mycase_event_id: number
          name: string | null
          raw_payload: Json | null
          start_at: string | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean | null
          created_at?: string
          description?: string | null
          end_at?: string | null
          event_type?: string | null
          id?: string
          location?: string | null
          mycase_case_id?: number | null
          mycase_event_id: number
          name?: string | null
          raw_payload?: Json | null
          start_at?: string | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean | null
          created_at?: string
          description?: string | null
          end_at?: string | null
          event_type?: string | null
          id?: string
          location?: string | null
          mycase_case_id?: number | null
          mycase_event_id?: number
          name?: string | null
          raw_payload?: Json | null
          start_at?: string | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mycase_expenses: {
        Row: {
          amount: number | null
          billable: boolean | null
          billed: boolean | null
          created_at: string
          date: string | null
          description: string | null
          id: string
          mycase_case_id: number | null
          mycase_expense_id: number
          mycase_staff_id: number | null
          raw_payload: Json | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          billable?: boolean | null
          billed?: boolean | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          mycase_case_id?: number | null
          mycase_expense_id: number
          mycase_staff_id?: number | null
          raw_payload?: Json | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          billable?: boolean | null
          billed?: boolean | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          mycase_case_id?: number | null
          mycase_expense_id?: number
          mycase_staff_id?: number | null
          raw_payload?: Json | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mycase_invoice_attribution_audit_20260618: {
        Row: {
          bridge: string | null
          mycase_invoice_id: number
          new_client_id: string | null
          ran_at: string | null
        }
        Insert: {
          bridge?: string | null
          mycase_invoice_id: number
          new_client_id?: string | null
          ran_at?: string | null
        }
        Update: {
          bridge?: string | null
          mycase_invoice_id?: number
          new_client_id?: string | null
          ran_at?: string | null
        }
        Relationships: []
      }
      mycase_invoice_payments: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          match_type: string | null
          matched_client_id: string | null
          matched_contract_id: string | null
          mycase_invoice_id: number | null
          mycase_payment_id: number
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          raw_payload: Json | null
          reference_number: string | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          match_type?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_invoice_id?: number | null
          mycase_payment_id: number
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          raw_payload?: Json | null
          reference_number?: string | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          match_type?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_invoice_id?: number | null
          mycase_payment_id?: number
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          raw_payload?: Json | null
          reference_number?: string | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mycase_invoice_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      mycase_invoices: {
        Row: {
          amount: number | null
          amount_due: number | null
          amount_paid: number | null
          bank_account_type: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          issue_date: string | null
          match_type: string | null
          matched_client_id: string | null
          matched_contract_id: string | null
          mycase_case_id: number | null
          mycase_contact_id: number | null
          mycase_internal_id: string | null
          mycase_invoice_id: number
          online_payments_enabled: boolean | null
          paid_date: string | null
          raw_payload: Json | null
          source_type: string | null
          status: string | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          amount_due?: number | null
          amount_paid?: number | null
          bank_account_type?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issue_date?: string | null
          match_type?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_case_id?: number | null
          mycase_contact_id?: number | null
          mycase_internal_id?: string | null
          mycase_invoice_id: number
          online_payments_enabled?: boolean | null
          paid_date?: string | null
          raw_payload?: Json | null
          source_type?: string | null
          status?: string | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          amount_due?: number | null
          amount_paid?: number | null
          bank_account_type?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issue_date?: string | null
          match_type?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_case_id?: number | null
          mycase_contact_id?: number | null
          mycase_internal_id?: string | null
          mycase_invoice_id?: number
          online_payments_enabled?: boolean | null
          paid_date?: string | null
          raw_payload?: Json | null
          source_type?: string | null
          status?: string | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      mycase_invoices_backup_refresh: {
        Row: {
          amount: number | null
          amount_due: number | null
          amount_paid: number | null
          bank_account_type: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string | null
          invoice_number: string | null
          issue_date: string | null
          match_type: string | null
          matched_client_id: string | null
          matched_contract_id: string | null
          mycase_case_id: number | null
          mycase_contact_id: number | null
          mycase_internal_id: string | null
          mycase_invoice_id: number | null
          online_payments_enabled: boolean | null
          paid_date: string | null
          raw_payload: Json | null
          source_type: string | null
          status: string | null
          synced_at: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          amount_due?: number | null
          amount_paid?: number | null
          bank_account_type?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string | null
          invoice_number?: string | null
          issue_date?: string | null
          match_type?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_case_id?: number | null
          mycase_contact_id?: number | null
          mycase_internal_id?: string | null
          mycase_invoice_id?: number | null
          online_payments_enabled?: boolean | null
          paid_date?: string | null
          raw_payload?: Json | null
          source_type?: string | null
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          amount_due?: number | null
          amount_paid?: number | null
          bank_account_type?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string | null
          invoice_number?: string | null
          issue_date?: string | null
          match_type?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_case_id?: number | null
          mycase_contact_id?: number | null
          mycase_internal_id?: string | null
          mycase_invoice_id?: number | null
          online_payments_enabled?: boolean | null
          paid_date?: string | null
          raw_payload?: Json | null
          source_type?: string | null
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mycase_leads: {
        Row: {
          cell_phone_number: string | null
          created_at: string
          email: string | null
          first_name: string | null
          full_name: string | null
          home_phone_number: string | null
          id: string
          last_name: string | null
          mycase_lead_id: number
          notes: string | null
          practice_area: string | null
          raw_payload: Json | null
          referral_source: string | null
          status: string | null
          synced_at: string
          updated_at: string
          work_phone_number: string | null
        }
        Insert: {
          cell_phone_number?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          home_phone_number?: string | null
          id?: string
          last_name?: string | null
          mycase_lead_id: number
          notes?: string | null
          practice_area?: string | null
          raw_payload?: Json | null
          referral_source?: string | null
          status?: string | null
          synced_at?: string
          updated_at?: string
          work_phone_number?: string | null
        }
        Update: {
          cell_phone_number?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          home_phone_number?: string | null
          id?: string
          last_name?: string | null
          mycase_lead_id?: number
          notes?: string | null
          practice_area?: string | null
          raw_payload?: Json | null
          referral_source?: string | null
          status?: string | null
          synced_at?: string
          updated_at?: string
          work_phone_number?: string | null
        }
        Relationships: []
      }
      mycase_locations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          id: string
          mycase_location_id: number
          name: string | null
          raw_payload: Json | null
          state: string | null
          synced_at: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          mycase_location_id: number
          name?: string | null
          raw_payload?: Json | null
          state?: string | null
          synced_at?: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          mycase_location_id?: number
          name?: string | null
          raw_payload?: Json | null
          state?: string | null
          synced_at?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      mycase_notes: {
        Row: {
          author_staff_id: number | null
          content: string | null
          created_at: string
          id: string
          mycase_case_id: number | null
          mycase_client_id: number | null
          mycase_company_id: number | null
          mycase_note_id: number
          note_type: string | null
          raw_payload: Json | null
          subject: string | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          author_staff_id?: number | null
          content?: string | null
          created_at?: string
          id?: string
          mycase_case_id?: number | null
          mycase_client_id?: number | null
          mycase_company_id?: number | null
          mycase_note_id: number
          note_type?: string | null
          raw_payload?: Json | null
          subject?: string | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          author_staff_id?: number | null
          content?: string | null
          created_at?: string
          id?: string
          mycase_case_id?: number | null
          mycase_client_id?: number | null
          mycase_company_id?: number | null
          mycase_note_id?: number
          note_type?: string | null
          raw_payload?: Json | null
          subject?: string | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mycase_payment_plans: {
        Row: {
          amount_due: number | null
          autopay: boolean | null
          case_name: string | null
          contact: string | null
          created_at: string | null
          final_date: string | null
          id: string
          installments_paid: number | null
          invoice_number: string
          last_synced_at: string | null
          match_type: string | null
          matched_contract_id: string | null
          next_amount: number | null
          next_due_date: string | null
          normalized_contact: string | null
          paid: number | null
          total: number | null
          total_installments: number | null
          updated_at: string | null
        }
        Insert: {
          amount_due?: number | null
          autopay?: boolean | null
          case_name?: string | null
          contact?: string | null
          created_at?: string | null
          final_date?: string | null
          id?: string
          installments_paid?: number | null
          invoice_number: string
          last_synced_at?: string | null
          match_type?: string | null
          matched_contract_id?: string | null
          next_amount?: number | null
          next_due_date?: string | null
          normalized_contact?: string | null
          paid?: number | null
          total?: number | null
          total_installments?: number | null
          updated_at?: string | null
        }
        Update: {
          amount_due?: number | null
          autopay?: boolean | null
          case_name?: string | null
          contact?: string | null
          created_at?: string | null
          final_date?: string | null
          id?: string
          installments_paid?: number | null
          invoice_number?: string
          last_synced_at?: string | null
          match_type?: string | null
          matched_contract_id?: string | null
          next_amount?: number | null
          next_due_date?: string | null
          normalized_contact?: string | null
          paid?: number | null
          total?: number | null
          total_installments?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      mycase_payment_plans_backup_refresh: {
        Row: {
          amount_due: number | null
          autopay: boolean | null
          case_name: string | null
          contact: string | null
          created_at: string | null
          final_date: string | null
          id: string | null
          installments_paid: number | null
          invoice_number: string | null
          last_synced_at: string | null
          match_type: string | null
          matched_contract_id: string | null
          next_amount: number | null
          next_due_date: string | null
          normalized_contact: string | null
          paid: number | null
          total: number | null
          total_installments: number | null
          updated_at: string | null
        }
        Insert: {
          amount_due?: number | null
          autopay?: boolean | null
          case_name?: string | null
          contact?: string | null
          created_at?: string | null
          final_date?: string | null
          id?: string | null
          installments_paid?: number | null
          invoice_number?: string | null
          last_synced_at?: string | null
          match_type?: string | null
          matched_contract_id?: string | null
          next_amount?: number | null
          next_due_date?: string | null
          normalized_contact?: string | null
          paid?: number | null
          total?: number | null
          total_installments?: number | null
          updated_at?: string | null
        }
        Update: {
          amount_due?: number | null
          autopay?: boolean | null
          case_name?: string | null
          contact?: string | null
          created_at?: string | null
          final_date?: string | null
          id?: string | null
          installments_paid?: number | null
          invoice_number?: string | null
          last_synced_at?: string | null
          match_type?: string | null
          matched_contract_id?: string | null
          next_amount?: number | null
          next_due_date?: string | null
          normalized_contact?: string | null
          paid?: number | null
          total?: number | null
          total_installments?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mycase_plans_scraped_20260708: {
        Row: {
          amount_due: number | null
          autopay: boolean | null
          bill_id: string | null
          contact: string | null
          installments_paid: number | null
          next_amount: number | null
          next_due: string | null
          nn: string | null
          number: string | null
          paid: number | null
          total: number | null
          total_installments: number | null
        }
        Insert: {
          amount_due?: number | null
          autopay?: boolean | null
          bill_id?: string | null
          contact?: string | null
          installments_paid?: number | null
          next_amount?: number | null
          next_due?: string | null
          nn?: string | null
          number?: string | null
          paid?: number | null
          total?: number | null
          total_installments?: number | null
        }
        Update: {
          amount_due?: number | null
          autopay?: boolean | null
          bill_id?: string | null
          contact?: string | null
          installments_paid?: number | null
          next_amount?: number | null
          next_due?: string | null
          nn?: string | null
          number?: string | null
          paid?: number | null
          total?: number | null
          total_installments?: number | null
        }
        Relationships: []
      }
      mycase_practice_areas: {
        Row: {
          created_at: string
          id: string
          mycase_practice_area_id: number
          name: string
          raw_payload: Json | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mycase_practice_area_id: number
          name: string
          raw_payload?: Json | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mycase_practice_area_id?: number
          name?: string
          raw_payload?: Json | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mycase_staff: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          is_current_user: boolean | null
          last_name: string | null
          mycase_staff_id: number
          raw_payload: Json | null
          role: string | null
          status: string | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_current_user?: boolean | null
          last_name?: string | null
          mycase_staff_id: number
          raw_payload?: Json | null
          role?: string | null
          status?: string | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_current_user?: boolean | null
          last_name?: string | null
          mycase_staff_id?: number
          raw_payload?: Json | null
          role?: string | null
          status?: string | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mycase_sync_state: {
        Row: {
          access_token: string | null
          created_at: string
          last_cursor: string | null
          last_error: string | null
          last_success_at: string | null
          meta: Json | null
          refresh_token: string | null
          sync_key: string
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          last_cursor?: string | null
          last_error?: string | null
          last_success_at?: string | null
          meta?: Json | null
          refresh_token?: string | null
          sync_key: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          last_cursor?: string | null
          last_error?: string | null
          last_success_at?: string | null
          meta?: Json | null
          refresh_token?: string | null
          sync_key?: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mycase_tasks: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          mycase_case_id: number | null
          mycase_task_id: number
          name: string | null
          priority: string | null
          raw_payload: Json | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          mycase_case_id?: number | null
          mycase_task_id: number
          name?: string | null
          priority?: string | null
          raw_payload?: Json | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          mycase_case_id?: number | null
          mycase_task_id?: number
          name?: string | null
          priority?: string | null
          raw_payload?: Json | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mycase_time_entries: {
        Row: {
          amount: number | null
          billable: boolean | null
          billed: boolean | null
          created_at: string
          date: string | null
          description: string | null
          hours: number | null
          id: string
          mycase_case_id: number | null
          mycase_staff_id: number | null
          mycase_time_entry_id: number
          rate: number | null
          raw_payload: Json | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          billable?: boolean | null
          billed?: boolean | null
          created_at?: string
          date?: string | null
          description?: string | null
          hours?: number | null
          id?: string
          mycase_case_id?: number | null
          mycase_staff_id?: number | null
          mycase_time_entry_id: number
          rate?: number | null
          raw_payload?: Json | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          billable?: boolean | null
          billed?: boolean | null
          created_at?: string
          date?: string | null
          description?: string | null
          hours?: number | null
          id?: string
          mycase_case_id?: number | null
          mycase_staff_id?: number | null
          mycase_time_entry_id?: number
          rate?: number | null
          raw_payload?: Json | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mycase_transaction_history: {
        Row: {
          amount: number | null
          client_name: string | null
          client_name_normalized: string | null
          created_at: string | null
          entered_by: string | null
          id: number
          invoice_number: string | null
          is_filevine_rerecord: boolean
          method: string | null
          payment_date: string | null
          rerecord_checked_at: string | null
          rerecord_match_tier: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          client_name?: string | null
          client_name_normalized?: string | null
          created_at?: string | null
          entered_by?: string | null
          id?: never
          invoice_number?: string | null
          is_filevine_rerecord?: boolean
          method?: string | null
          payment_date?: string | null
          rerecord_checked_at?: string | null
          rerecord_match_tier?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          client_name?: string | null
          client_name_normalized?: string | null
          created_at?: string | null
          entered_by?: string | null
          id?: never
          invoice_number?: string | null
          is_filevine_rerecord?: boolean
          method?: string | null
          payment_date?: string | null
          rerecord_checked_at?: string | null
          rerecord_match_tier?: string | null
          status?: string | null
        }
        Relationships: []
      }
      mycase_transactions_rich: {
        Row: {
          attribution_method: string | null
          bank_account: string | null
          completed_at: string | null
          created_at_src: string | null
          details: string | null
          entered_by: string | null
          id: number
          loaded_at: string | null
          matched_client_id: string | null
          method: string | null
          payer_email: string | null
          payer_name: string | null
          reference: string | null
          status: string | null
          subtotal: number | null
          surcharge: number | null
          total: number | null
          txn_date: string | null
          voided_at: string | null
        }
        Insert: {
          attribution_method?: string | null
          bank_account?: string | null
          completed_at?: string | null
          created_at_src?: string | null
          details?: string | null
          entered_by?: string | null
          id?: number
          loaded_at?: string | null
          matched_client_id?: string | null
          method?: string | null
          payer_email?: string | null
          payer_name?: string | null
          reference?: string | null
          status?: string | null
          subtotal?: number | null
          surcharge?: number | null
          total?: number | null
          txn_date?: string | null
          voided_at?: string | null
        }
        Update: {
          attribution_method?: string | null
          bank_account?: string | null
          completed_at?: string | null
          created_at_src?: string | null
          details?: string | null
          entered_by?: string | null
          id?: number
          loaded_at?: string | null
          matched_client_id?: string | null
          method?: string | null
          payer_email?: string | null
          payer_name?: string | null
          reference?: string | null
          status?: string | null
          subtotal?: number | null
          surcharge?: number | null
          total?: number | null
          txn_date?: string | null
          voided_at?: string | null
        }
        Relationships: []
      }
      mycase_transactions_rich_backup_refresh: {
        Row: {
          attribution_method: string | null
          bank_account: string | null
          completed_at: string | null
          created_at_src: string | null
          details: string | null
          entered_by: string | null
          id: number | null
          loaded_at: string | null
          matched_client_id: string | null
          method: string | null
          payer_email: string | null
          payer_name: string | null
          reference: string | null
          status: string | null
          subtotal: number | null
          surcharge: number | null
          total: number | null
          txn_date: string | null
          voided_at: string | null
        }
        Insert: {
          attribution_method?: string | null
          bank_account?: string | null
          completed_at?: string | null
          created_at_src?: string | null
          details?: string | null
          entered_by?: string | null
          id?: number | null
          loaded_at?: string | null
          matched_client_id?: string | null
          method?: string | null
          payer_email?: string | null
          payer_name?: string | null
          reference?: string | null
          status?: string | null
          subtotal?: number | null
          surcharge?: number | null
          total?: number | null
          txn_date?: string | null
          voided_at?: string | null
        }
        Update: {
          attribution_method?: string | null
          bank_account?: string | null
          completed_at?: string | null
          created_at_src?: string | null
          details?: string | null
          entered_by?: string | null
          id?: number | null
          loaded_at?: string | null
          matched_client_id?: string | null
          method?: string | null
          payer_email?: string | null
          payer_name?: string | null
          reference?: string | null
          status?: string | null
          subtotal?: number | null
          surcharge?: number | null
          total?: number | null
          txn_date?: string | null
          voided_at?: string | null
        }
        Relationships: []
      }
      mycase_trust_ledger: {
        Row: {
          balance: number | null
          case_name: string | null
          contact: string | null
          credit: number | null
          debit: number | null
          entered_by: string | null
          id: number
          is_disbursement: boolean | null
          lead_attorney: string | null
          originating_attorney: string | null
          related_to: string | null
          signed_amount: number | null
          synced_at: string | null
          txn_date: string | null
        }
        Insert: {
          balance?: number | null
          case_name?: string | null
          contact?: string | null
          credit?: number | null
          debit?: number | null
          entered_by?: string | null
          id?: number
          is_disbursement?: boolean | null
          lead_attorney?: string | null
          originating_attorney?: string | null
          related_to?: string | null
          signed_amount?: number | null
          synced_at?: string | null
          txn_date?: string | null
        }
        Update: {
          balance?: number | null
          case_name?: string | null
          contact?: string | null
          credit?: number | null
          debit?: number | null
          entered_by?: string | null
          id?: number
          is_disbursement?: boolean | null
          lead_attorney?: string | null
          originating_attorney?: string | null
          related_to?: string | null
          signed_amount?: number | null
          synced_at?: string | null
          txn_date?: string | null
        }
        Relationships: []
      }
      mycase_txn_dedup_backup_20260730: {
        Row: {
          amount: number | null
          client_name: string | null
          client_name_normalized: string | null
          created_at: string | null
          entered_by: string | null
          id: number | null
          invoice_number: string | null
          is_filevine_rerecord: boolean | null
          method: string | null
          payment_date: string | null
          rerecord_checked_at: string | null
          rerecord_match_tier: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          client_name?: string | null
          client_name_normalized?: string | null
          created_at?: string | null
          entered_by?: string | null
          id?: number | null
          invoice_number?: string | null
          is_filevine_rerecord?: boolean | null
          method?: string | null
          payment_date?: string | null
          rerecord_checked_at?: string | null
          rerecord_match_tier?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          client_name?: string | null
          client_name_normalized?: string | null
          created_at?: string | null
          entered_by?: string | null
          id?: number | null
          invoice_number?: string | null
          is_filevine_rerecord?: boolean | null
          method?: string | null
          payment_date?: string | null
          rerecord_checked_at?: string | null
          rerecord_match_tier?: string | null
          status?: string | null
        }
        Relationships: []
      }
      mycase_webhook_log: {
        Row: {
          error: string | null
          event_type: string
          id: string
          payload: Json | null
          processed: boolean | null
          processed_at: string | null
          received_at: string
          resource_id: number | null
          resource_type: string | null
          subscription_id: number | null
        }
        Insert: {
          error?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          received_at?: string
          resource_id?: number | null
          resource_type?: string | null
          subscription_id?: number | null
        }
        Update: {
          error?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          received_at?: string
          resource_id?: number | null
          resource_type?: string | null
          subscription_id?: number | null
        }
        Relationships: []
      }
      ops_closure_escalation: {
        Row: {
          aging: string | null
          ar_balance: number | null
          ar_removed: boolean | null
          ar_removed_at: string | null
          collector_note: string | null
          confidence: string | null
          cured_at: string | null
          first_escalated_at: string | null
          id: string
          last_seen_at: string | null
          name: string
          name_key: string
          ops_decided_at: string | null
          ops_decided_by: string | null
          ops_decision: string | null
          run_id: string | null
          source: string | null
          status: string | null
          tag: string | null
          tagged_by: string | null
        }
        Insert: {
          aging?: string | null
          ar_balance?: number | null
          ar_removed?: boolean | null
          ar_removed_at?: string | null
          collector_note?: string | null
          confidence?: string | null
          cured_at?: string | null
          first_escalated_at?: string | null
          id?: string
          last_seen_at?: string | null
          name: string
          name_key: string
          ops_decided_at?: string | null
          ops_decided_by?: string | null
          ops_decision?: string | null
          run_id?: string | null
          source?: string | null
          status?: string | null
          tag?: string | null
          tagged_by?: string | null
        }
        Update: {
          aging?: string | null
          ar_balance?: number | null
          ar_removed?: boolean | null
          ar_removed_at?: string | null
          collector_note?: string | null
          confidence?: string | null
          cured_at?: string | null
          first_escalated_at?: string | null
          id?: string
          last_seen_at?: string | null
          name?: string
          name_key?: string
          ops_decided_at?: string | null
          ops_decided_by?: string | null
          ops_decision?: string | null
          run_id?: string | null
          source?: string | null
          status?: string | null
          tag?: string | null
          tagged_by?: string | null
        }
        Relationships: []
      }
      payment_allocations: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          payment_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          payment_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_allocations_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_clean"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_clean_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "v_eq_multi_contract_attribution"
            referencedColumns: ["payment_id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "v_eq_refund_reversal"
            referencedColumns: ["payment_id"]
          },
        ]
      }
      payment_commitments: {
        Row: {
          call_activity_id: string | null
          client_id: string
          collector: string
          contract_id: string
          created_at: string
          follow_up_date: string | null
          id: string
          notes: string | null
          promised_amount: number
          promised_date: string
          status: string
          updated_at: string
        }
        Insert: {
          call_activity_id?: string | null
          client_id: string
          collector: string
          contract_id: string
          created_at?: string
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          promised_amount: number
          promised_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          call_activity_id?: string | null
          client_id?: string
          collector?: string
          contract_id?: string
          created_at?: string
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          promised_amount?: number
          promised_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_commitments_call_activity_id_fkey"
            columns: ["call_activity_id"]
            isOneToOne: false
            referencedRelation: "collection_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_commitments_call_activity_id_fkey"
            columns: ["call_activity_id"]
            isOneToOne: false
            referencedRelation: "v_collection_activity_lawpay_link_candidates"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "payment_commitments_call_activity_id_fkey"
            columns: ["call_activity_id"]
            isOneToOne: false
            referencedRelation: "v_collection_activity_link_candidates"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "payment_commitments_call_activity_id_fkey"
            columns: ["call_activity_id"]
            isOneToOne: false
            referencedRelation: "v_collection_activity_link_drift"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "payment_commitments_call_activity_id_fkey"
            columns: ["call_activity_id"]
            isOneToOne: false
            referencedRelation: "v_collection_activity_link_proposals"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "payment_commitments_call_activity_id_fkey"
            columns: ["call_activity_id"]
            isOneToOne: false
            referencedRelation: "v_collection_activity_link_subset"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "payment_commitments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_commitments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_commitments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_commitments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_commitments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_commitments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_commitments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_commitments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_commitments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_commitments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_commitments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_commitments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      payment_plan_state_history: {
        Row: {
          amount_due: number | null
          as_of: string
          autopay: boolean | null
          captured_at: string
          case_name: string | null
          contact: string | null
          final_date: string | null
          id: number
          installments_paid: number | null
          invoice_number: string | null
          next_amount: number | null
          next_due_date: string | null
          normalized_contact: string | null
          paid: number | null
          row_seq: number | null
          source_file: string | null
          source_md5: string | null
          total: number | null
          total_installments: number | null
        }
        Insert: {
          amount_due?: number | null
          as_of: string
          autopay?: boolean | null
          captured_at?: string
          case_name?: string | null
          contact?: string | null
          final_date?: string | null
          id?: number
          installments_paid?: number | null
          invoice_number?: string | null
          next_amount?: number | null
          next_due_date?: string | null
          normalized_contact?: string | null
          paid?: number | null
          row_seq?: number | null
          source_file?: string | null
          source_md5?: string | null
          total?: number | null
          total_installments?: number | null
        }
        Update: {
          amount_due?: number | null
          as_of?: string
          autopay?: boolean | null
          captured_at?: string
          case_name?: string | null
          contact?: string | null
          final_date?: string | null
          id?: number
          installments_paid?: number | null
          invoice_number?: string | null
          next_amount?: number | null
          next_due_date?: string | null
          normalized_contact?: string | null
          paid?: number | null
          row_seq?: number | null
          source_file?: string | null
          source_md5?: string | null
          total?: number | null
          total_installments?: number | null
        }
        Relationships: []
      }
      payment_plan_sync_log: {
        Row: {
          completed_at: string | null
          contracts_skipped: number | null
          contracts_updated: number | null
          duration_ms: number | null
          errors: Json | null
          field_changes: Json | null
          fields_updated: string[] | null
          id: string
          notes: string | null
          pages_fetched: number | null
          plans_matched: number | null
          plans_scraped: number | null
          records_synced: number | null
          source: string
          status: string | null
          sync_date: string | null
          unmatched_plans: number | null
          update_details: Json | null
        }
        Insert: {
          completed_at?: string | null
          contracts_skipped?: number | null
          contracts_updated?: number | null
          duration_ms?: number | null
          errors?: Json | null
          field_changes?: Json | null
          fields_updated?: string[] | null
          id?: string
          notes?: string | null
          pages_fetched?: number | null
          plans_matched?: number | null
          plans_scraped?: number | null
          records_synced?: number | null
          source: string
          status?: string | null
          sync_date?: string | null
          unmatched_plans?: number | null
          update_details?: Json | null
        }
        Update: {
          completed_at?: string | null
          contracts_skipped?: number | null
          contracts_updated?: number | null
          duration_ms?: number | null
          errors?: Json | null
          field_changes?: Json | null
          fields_updated?: string[] | null
          id?: string
          notes?: string | null
          pages_fetched?: number | null
          plans_matched?: number | null
          plans_scraped?: number | null
          records_synced?: number | null
          source?: string
          status?: string | null
          sync_date?: string | null
          unmatched_plans?: number | null
          update_details?: Json | null
        }
        Relationships: []
      }
      payment_shadow_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_data: Json
          event_type: string
          id: number
          prediction_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_data?: Json
          event_type: string
          id?: never
          prediction_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: never
          prediction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_shadow_events_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "payment_shadow_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_shadow_predictions: {
        Row: {
          confidence_tier: string
          evidence: Json
          id: string
          last_reconciliation_at: string | null
          lawpay_transaction_id: string
          matched_signals: string[]
          mycase_client_id: string | null
          mycase_contract_id: string | null
          predicted_at: string
          prediction_created_by: string | null
          proposed_client_id: string
          proposed_contract_id: string
          reconciled_at: string | null
          reconciliation_attempt_count: number
          reconciliation_details: Json
          reconciliation_status: string | null
          rule_version: string
          status: string
        }
        Insert: {
          confidence_tier: string
          evidence: Json
          id?: string
          last_reconciliation_at?: string | null
          lawpay_transaction_id: string
          matched_signals?: string[]
          mycase_client_id?: string | null
          mycase_contract_id?: string | null
          predicted_at?: string
          prediction_created_by?: string | null
          proposed_client_id: string
          proposed_contract_id: string
          reconciled_at?: string | null
          reconciliation_attempt_count?: number
          reconciliation_details?: Json
          reconciliation_status?: string | null
          rule_version: string
          status?: string
        }
        Update: {
          confidence_tier?: string
          evidence?: Json
          id?: string
          last_reconciliation_at?: string | null
          lawpay_transaction_id?: string
          matched_signals?: string[]
          mycase_client_id?: string | null
          mycase_contract_id?: string | null
          predicted_at?: string
          prediction_created_by?: string | null
          proposed_client_id?: string
          proposed_contract_id?: string
          reconciled_at?: string | null
          reconciliation_attempt_count?: number
          reconciliation_details?: Json
          reconciliation_status?: string | null
          rule_version?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_shadow_predictions_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "lawpay_actual_mycase_invoice_payments"
            referencedColumns: ["lawpay_row_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "lawpay_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "lawpay_unmatched_resolvable"
            referencedColumns: ["lawpay_txn_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "v_collection_activity_lawpay_link_candidates"
            referencedColumns: ["lawpay_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "v_eq_authorized_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "v_eq_fuzzy_match_review"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["transaction_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_recognition"
            referencedColumns: ["lawpay_row_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_reversal_matched"
            referencedColumns: ["original_lawpay_row_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_lawpay_transaction_id_fkey"
            columns: ["lawpay_transaction_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_settlement_client"
            referencedColumns: ["lawpay_row_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_client_id_fkey"
            columns: ["mycase_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_client_id_fkey"
            columns: ["mycase_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_client_id_fkey"
            columns: ["mycase_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_client_id_fkey"
            columns: ["mycase_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_client_id_fkey"
            columns: ["mycase_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_client_id_fkey"
            columns: ["mycase_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_client_id_fkey"
            columns: ["mycase_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_client_id_fkey"
            columns: ["mycase_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_client_id_fkey"
            columns: ["mycase_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_client_id_fkey"
            columns: ["mycase_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_client_id_fkey"
            columns: ["mycase_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_client_id_fkey"
            columns: ["mycase_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_contract_id_fkey"
            columns: ["mycase_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_contract_id_fkey"
            columns: ["mycase_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_contract_id_fkey"
            columns: ["mycase_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_contract_id_fkey"
            columns: ["mycase_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_contract_id_fkey"
            columns: ["mycase_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_contract_id_fkey"
            columns: ["mycase_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_contract_id_fkey"
            columns: ["mycase_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_contract_id_fkey"
            columns: ["mycase_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_contract_id_fkey"
            columns: ["mycase_contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_contract_id_fkey"
            columns: ["mycase_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_contract_id_fkey"
            columns: ["mycase_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_contract_id_fkey"
            columns: ["mycase_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_contract_id_fkey"
            columns: ["mycase_contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_contract_id_fkey"
            columns: ["mycase_contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_mycase_contract_id_fkey"
            columns: ["mycase_contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_client_id_fkey"
            columns: ["proposed_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_client_id_fkey"
            columns: ["proposed_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_client_id_fkey"
            columns: ["proposed_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_client_id_fkey"
            columns: ["proposed_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_client_id_fkey"
            columns: ["proposed_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_client_id_fkey"
            columns: ["proposed_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_client_id_fkey"
            columns: ["proposed_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_client_id_fkey"
            columns: ["proposed_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_client_id_fkey"
            columns: ["proposed_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_client_id_fkey"
            columns: ["proposed_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_client_id_fkey"
            columns: ["proposed_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_client_id_fkey"
            columns: ["proposed_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_contract_id_fkey"
            columns: ["proposed_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_contract_id_fkey"
            columns: ["proposed_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_contract_id_fkey"
            columns: ["proposed_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_contract_id_fkey"
            columns: ["proposed_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_contract_id_fkey"
            columns: ["proposed_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_contract_id_fkey"
            columns: ["proposed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_contract_id_fkey"
            columns: ["proposed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_contract_id_fkey"
            columns: ["proposed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_contract_id_fkey"
            columns: ["proposed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_contract_id_fkey"
            columns: ["proposed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_contract_id_fkey"
            columns: ["proposed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_contract_id_fkey"
            columns: ["proposed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_contract_id_fkey"
            columns: ["proposed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_contract_id_fkey"
            columns: ["proposed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_shadow_predictions_proposed_contract_id_fkey"
            columns: ["proposed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      payments: {
        Row: {
          aging_bucket: string | null
          amount: number
          client_id: string | null
          collector_name: string | null
          commission: number | null
          contract_id: string | null
          created_at: string
          delinquency_days: number | null
          deposit_to_trust: boolean
          hubspot_deal_id: string | null
          id: string
          lawpay_invoice_number: string | null
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_number: string
          payment_type: string | null
          received_by: string | null
          reference_number: string | null
          updated_at: string
        }
        Insert: {
          aging_bucket?: string | null
          amount: number
          client_id?: string | null
          collector_name?: string | null
          commission?: number | null
          contract_id?: string | null
          created_at?: string
          delinquency_days?: number | null
          deposit_to_trust?: boolean
          hubspot_deal_id?: string | null
          id?: string
          lawpay_invoice_number?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_number: string
          payment_type?: string | null
          received_by?: string | null
          reference_number?: string | null
          updated_at?: string
        }
        Update: {
          aging_bucket?: string | null
          amount?: number
          client_id?: string | null
          collector_name?: string | null
          commission?: number | null
          contract_id?: string | null
          created_at?: string
          delinquency_days?: number | null
          deposit_to_trust?: boolean
          hubspot_deal_id?: string | null
          id?: string
          lawpay_invoice_number?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_number?: string
          payment_type?: string | null
          received_by?: string | null
          reference_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments_history: {
        Row: {
          amount: number | null
          client_id: string
          created_at: string | null
          email: string | null
          id: number
          match_method: string | null
          method: string | null
          payer_name: string | null
          payment_date: string | null
          reference: string | null
          source: string | null
        }
        Insert: {
          amount?: number | null
          client_id: string
          created_at?: string | null
          email?: string | null
          id?: number
          match_method?: string | null
          method?: string | null
          payer_name?: string | null
          payment_date?: string | null
          reference?: string | null
          source?: string | null
        }
        Update: {
          amount?: number | null
          client_id?: string
          created_at?: string | null
          email?: string | null
          id?: number
          match_method?: string | null
          method?: string | null
          payer_name?: string | null
          payment_date?: string | null
          reference?: string | null
          source?: string | null
        }
        Relationships: []
      }
      pipeline_heartbeat: {
        Row: {
          detail: string | null
          job: string
          last_run_at: string
          rows_inserted: number | null
          rows_linked: number | null
          status: string | null
        }
        Insert: {
          detail?: string | null
          job: string
          last_run_at?: string
          rows_inserted?: number | null
          rows_linked?: number | null
          status?: string | null
        }
        Update: {
          detail?: string | null
          job?: string
          last_run_at?: string
          rows_inserted?: number | null
          rows_linked?: number | null
          status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bar_number: string | null
          created_at: string
          default_hourly_rate: number | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
          timekeeper_type: Database["public"]["Enums"]["timekeeper_type"] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bar_number?: string | null
          created_at?: string
          default_hourly_rate?: number | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          timekeeper_type?:
            | Database["public"]["Enums"]["timekeeper_type"]
            | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bar_number?: string | null
          created_at?: string
          default_hourly_rate?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          timekeeper_type?:
            | Database["public"]["Enums"]["timekeeper_type"]
            | null
          updated_at?: string
        }
        Relationships: []
      }
      qbo_account_balances: {
        Row: {
          account_type: string | null
          bank_balance: number | null
          delta: number | null
          id: number
          ingested_at: string
          name: string
          number: string | null
          pulled_at: string
          quickbooks_balance: number | null
        }
        Insert: {
          account_type?: string | null
          bank_balance?: number | null
          delta?: number | null
          id?: number
          ingested_at?: string
          name: string
          number?: string | null
          pulled_at: string
          quickbooks_balance?: number | null
        }
        Update: {
          account_type?: string | null
          bank_balance?: number | null
          delta?: number | null
          id?: number
          ingested_at?: string
          name?: string
          number?: string | null
          pulled_at?: string
          quickbooks_balance?: number | null
        }
        Relationships: []
      }
      qbo_account_balances_heartbeat: {
        Row: {
          accounts_present: number | null
          ar_aging_zero_attested: boolean | null
          bank_accounts: number | null
          bank_feed_supplied: boolean | null
          captured_at: string
          id: number
          pulled_at: string | null
          total_bank_cash: number | null
          total_cc_liability: number | null
          total_unreconciled: number | null
        }
        Insert: {
          accounts_present?: number | null
          ar_aging_zero_attested?: boolean | null
          bank_accounts?: number | null
          bank_feed_supplied?: boolean | null
          captured_at?: string
          id?: number
          pulled_at?: string | null
          total_bank_cash?: number | null
          total_cc_liability?: number | null
          total_unreconciled?: number | null
        }
        Update: {
          accounts_present?: number | null
          ar_aging_zero_attested?: boolean | null
          bank_accounts?: number | null
          bank_feed_supplied?: boolean | null
          captured_at?: string
          id?: number
          pulled_at?: string | null
          total_bank_cash?: number | null
          total_cc_liability?: number | null
          total_unreconciled?: number | null
        }
        Relationships: []
      }
      qbo_bank_deposits: {
        Row: {
          affinipay: boolean
          amount: number
          deposit_date: string
          dup_seq: number
          id: number
          loaded_at: string
          pulled_at: string
          source_file: string
        }
        Insert: {
          affinipay: boolean
          amount: number
          deposit_date: string
          dup_seq?: number
          id?: never
          loaded_at?: string
          pulled_at?: string
          source_file?: string
        }
        Update: {
          affinipay?: boolean
          amount?: number
          deposit_date?: string
          dup_seq?: number
          id?: never
          loaded_at?: string
          pulled_at?: string
          source_file?: string
        }
        Relationships: []
      }
      qbo_bank_deposits_heartbeat: {
        Row: {
          affinipay_deposits: number | null
          affinipay_total: number | null
          all_deposit_total: number | null
          captured_at: string
          deposits_present: number | null
          earliest_deposit: string | null
          id: number
          jan_partial: boolean | null
          latest_deposit: string | null
          notes: string | null
          threeway_status: string | null
        }
        Insert: {
          affinipay_deposits?: number | null
          affinipay_total?: number | null
          all_deposit_total?: number | null
          captured_at?: string
          deposits_present?: number | null
          earliest_deposit?: string | null
          id?: never
          jan_partial?: boolean | null
          latest_deposit?: string | null
          notes?: string | null
          threeway_status?: string | null
        }
        Update: {
          affinipay_deposits?: number | null
          affinipay_total?: number | null
          all_deposit_total?: number | null
          captured_at?: string
          deposits_present?: number | null
          earliest_deposit?: string | null
          id?: never
          jan_partial?: boolean | null
          latest_deposit?: string | null
          notes?: string | null
          threeway_status?: string | null
        }
        Relationships: []
      }
      qbo_deposits: {
        Row: {
          deposit_id: string
          deposit_to_account_id: string | null
          deposit_to_account_name: string | null
          line_account_code: string | null
          line_account_id: string | null
          line_account_name: string | null
          loaded_at: string | null
          private_note: string | null
          pulled_at: string | null
          rail: string | null
          rail_mixed: boolean | null
          raw: Json | null
          realm: string | null
          source: string | null
          source_md5: string | null
          total_amount: number | null
          txn_date: string | null
        }
        Insert: {
          deposit_id: string
          deposit_to_account_id?: string | null
          deposit_to_account_name?: string | null
          line_account_code?: string | null
          line_account_id?: string | null
          line_account_name?: string | null
          loaded_at?: string | null
          private_note?: string | null
          pulled_at?: string | null
          rail?: string | null
          rail_mixed?: boolean | null
          raw?: Json | null
          realm?: string | null
          source?: string | null
          source_md5?: string | null
          total_amount?: number | null
          txn_date?: string | null
        }
        Update: {
          deposit_id?: string
          deposit_to_account_id?: string | null
          deposit_to_account_name?: string | null
          line_account_code?: string | null
          line_account_id?: string | null
          line_account_name?: string | null
          loaded_at?: string | null
          private_note?: string | null
          pulled_at?: string | null
          rail?: string | null
          rail_mixed?: boolean | null
          raw?: Json | null
          realm?: string | null
          source?: string | null
          source_md5?: string | null
          total_amount?: number | null
          txn_date?: string | null
        }
        Relationships: []
      }
      qbo_pnl_heartbeat: {
        Row: {
          captured_at: string
          control_total_status: string | null
          id: number
          latest_period: string | null
          net_income_ytd: number | null
          periods_present: number | null
          pulled_at: string | null
        }
        Insert: {
          captured_at?: string
          control_total_status?: string | null
          id?: never
          latest_period?: string | null
          net_income_ytd?: number | null
          periods_present?: number | null
          pulled_at?: string | null
        }
        Update: {
          captured_at?: string
          control_total_status?: string | null
          id?: never
          latest_period?: string | null
          net_income_ytd?: number | null
          periods_present?: number | null
          pulled_at?: string | null
        }
        Relationships: []
      }
      qbo_pnl_monthly: {
        Row: {
          account_code: string | null
          account_line: string | null
          amount: number | null
          basis: string | null
          id: number
          line_type: string | null
          period: string | null
          pulled_at: string | null
          source_file: string | null
          source_md5: string | null
          source_mtime: string | null
        }
        Insert: {
          account_code?: string | null
          account_line?: string | null
          amount?: number | null
          basis?: string | null
          id?: number
          line_type?: string | null
          period?: string | null
          pulled_at?: string | null
          source_file?: string | null
          source_md5?: string | null
          source_mtime?: string | null
        }
        Update: {
          account_code?: string | null
          account_line?: string | null
          amount?: number | null
          basis?: string | null
          id?: number
          line_type?: string | null
          period?: string | null
          pulled_at?: string | null
          source_file?: string | null
          source_md5?: string | null
          source_mtime?: string | null
        }
        Relationships: []
      }
      qbo_pnl_monthly_backup_20260731: {
        Row: {
          account_code: string | null
          account_line: string | null
          amount: number | null
          basis: string | null
          id: number | null
          line_type: string | null
          period: string | null
          pulled_at: string | null
          source_file: string | null
          source_md5: string | null
          source_mtime: string | null
        }
        Insert: {
          account_code?: string | null
          account_line?: string | null
          amount?: number | null
          basis?: string | null
          id?: number | null
          line_type?: string | null
          period?: string | null
          pulled_at?: string | null
          source_file?: string | null
          source_md5?: string | null
          source_mtime?: string | null
        }
        Update: {
          account_code?: string | null
          account_line?: string | null
          amount?: number | null
          basis?: string | null
          id?: number | null
          line_type?: string | null
          period?: string | null
          pulled_at?: string | null
          source_file?: string | null
          source_md5?: string | null
          source_mtime?: string | null
        }
        Relationships: []
      }
      queue_build_heartbeat: {
        Row: {
          built_at: string | null
          collectors: number | null
          conflicts: number | null
          id: string
          moves: number | null
          notes: string | null
          owned_pinned: number | null
          owner_overflow: number | null
          pool_coverage: number | null
          removed: number | null
          rows: number | null
          run_date: string | null
          run_id: string | null
          source: string | null
          worked_locked: number | null
        }
        Insert: {
          built_at?: string | null
          collectors?: number | null
          conflicts?: number | null
          id?: string
          moves?: number | null
          notes?: string | null
          owned_pinned?: number | null
          owner_overflow?: number | null
          pool_coverage?: number | null
          removed?: number | null
          rows?: number | null
          run_date?: string | null
          run_id?: string | null
          source?: string | null
          worked_locked?: number | null
        }
        Update: {
          built_at?: string | null
          collectors?: number | null
          conflicts?: number | null
          id?: string
          moves?: number | null
          notes?: string | null
          owned_pinned?: number | null
          owner_overflow?: number | null
          pool_coverage?: number | null
          removed?: number | null
          rows?: number | null
          run_date?: string | null
          run_id?: string | null
          source?: string | null
          worked_locked?: number | null
        }
        Relationships: []
      }
      queue_change_log: {
        Row: {
          action: string | null
          balance: number | null
          basis: string | null
          changed: boolean | null
          client_name: string | null
          created_at: string | null
          dedup_version: string | null
          from_collector: string | null
          id: string
          matched_client_id: string | null
          name_key: string | null
          run_date: string | null
          run_id: string | null
          snapshot_id: string | null
          source: string | null
          to_collector: string | null
        }
        Insert: {
          action?: string | null
          balance?: number | null
          basis?: string | null
          changed?: boolean | null
          client_name?: string | null
          created_at?: string | null
          dedup_version?: string | null
          from_collector?: string | null
          id?: string
          matched_client_id?: string | null
          name_key?: string | null
          run_date?: string | null
          run_id?: string | null
          snapshot_id?: string | null
          source?: string | null
          to_collector?: string | null
        }
        Update: {
          action?: string | null
          balance?: number | null
          basis?: string | null
          changed?: boolean | null
          client_name?: string | null
          created_at?: string | null
          dedup_version?: string | null
          from_collector?: string | null
          id?: string
          matched_client_id?: string | null
          name_key?: string | null
          run_date?: string | null
          run_id?: string | null
          snapshot_id?: string | null
          source?: string | null
          to_collector?: string | null
        }
        Relationships: []
      }
      queue_exclusion_keys: {
        Row: {
          k: string
          refreshed_at: string | null
        }
        Insert: {
          k: string
          refreshed_at?: string | null
        }
        Update: {
          k?: string
          refreshed_at?: string | null
        }
        Relationships: []
      }
      queue_system_patch_log: {
        Row: {
          affected_objects: string[]
          applied_at: string | null
          change_summary: string
          code_sha256: string | null
          component: string
          config_sha256: string | null
          created_by: string
          detected_at: string
          id: string
          implementation: Json
          issue: string
          patch_key: string
          queue_run_id: string | null
          root_cause: string | null
          status: string
          supersedes_patch_key: string | null
          updated_at: string
          verification: Json
          verified_at: string | null
        }
        Insert: {
          affected_objects?: string[]
          applied_at?: string | null
          change_summary: string
          code_sha256?: string | null
          component: string
          config_sha256?: string | null
          created_by?: string
          detected_at?: string
          id?: string
          implementation?: Json
          issue: string
          patch_key: string
          queue_run_id?: string | null
          root_cause?: string | null
          status?: string
          supersedes_patch_key?: string | null
          updated_at?: string
          verification?: Json
          verified_at?: string | null
        }
        Update: {
          affected_objects?: string[]
          applied_at?: string | null
          change_summary?: string
          code_sha256?: string | null
          component?: string
          config_sha256?: string | null
          created_by?: string
          detected_at?: string
          id?: string
          implementation?: Json
          issue?: string
          patch_key?: string
          queue_run_id?: string | null
          root_cause?: string | null
          status?: string
          supersedes_patch_key?: string | null
          updated_at?: string
          verification?: Json
          verified_at?: string | null
        }
        Relationships: []
      }
      retention_engine_heartbeat: {
        Row: {
          adherence_pct: number | null
          behind_plans: number | null
          captured_at: string
          card_recovery_overdue: number | null
          collected_to_date: number | null
          cure_to_90: number | null
          due_by_now: number | null
          id: string
          overdue_now: number | null
          plan_data_synced_at: string | null
          queue_overdue: number | null
          savable_overdue: number | null
        }
        Insert: {
          adherence_pct?: number | null
          behind_plans?: number | null
          captured_at?: string
          card_recovery_overdue?: number | null
          collected_to_date?: number | null
          cure_to_90?: number | null
          due_by_now?: number | null
          id?: string
          overdue_now?: number | null
          plan_data_synced_at?: string | null
          queue_overdue?: number | null
          savable_overdue?: number | null
        }
        Update: {
          adherence_pct?: number | null
          behind_plans?: number | null
          captured_at?: string
          card_recovery_overdue?: number | null
          collected_to_date?: number | null
          cure_to_90?: number | null
          due_by_now?: number | null
          id?: string
          overdue_now?: number | null
          plan_data_synced_at?: string | null
          queue_overdue?: number | null
          savable_overdue?: number | null
        }
        Relationships: []
      }
      schema_cleanup_audit: {
        Row: {
          category: string | null
          cleanup_batch: string
          data_recovery_note: string | null
          dropped_at: string
          dropped_by: string
          go_authority: string | null
          id: string
          migration_ref: string
          object_name: string
          object_type: string
          readers_app_refs: number | null
          readers_func_refs: number | null
          readers_inbound_fks: number | null
          readers_view_deps: number | null
          rollback_ddl: string | null
          row_count_at_drop: number | null
          size_bytes_at_drop: number | null
        }
        Insert: {
          category?: string | null
          cleanup_batch: string
          data_recovery_note?: string | null
          dropped_at?: string
          dropped_by?: string
          go_authority?: string | null
          id?: string
          migration_ref: string
          object_name: string
          object_type?: string
          readers_app_refs?: number | null
          readers_func_refs?: number | null
          readers_inbound_fks?: number | null
          readers_view_deps?: number | null
          rollback_ddl?: string | null
          row_count_at_drop?: number | null
          size_bytes_at_drop?: number | null
        }
        Update: {
          category?: string | null
          cleanup_batch?: string
          data_recovery_note?: string | null
          dropped_at?: string
          dropped_by?: string
          go_authority?: string | null
          id?: string
          migration_ref?: string
          object_name?: string
          object_type?: string
          readers_app_refs?: number | null
          readers_func_refs?: number | null
          readers_inbound_fks?: number | null
          readers_view_deps?: number | null
          rollback_ddl?: string | null
          row_count_at_drop?: number | null
          size_bytes_at_drop?: number | null
        }
        Relationships: []
      }
      snapshot_immutability_audit: {
        Row: {
          allowed_by: string
          changed_cols: string[] | null
          db_user: string
          detail: Json | null
          id: string
          occurred_at: string
          op: string
          row_id: string | null
          snapshot_id: string | null
          table_name: string
        }
        Insert: {
          allowed_by: string
          changed_cols?: string[] | null
          db_user?: string
          detail?: Json | null
          id?: string
          occurred_at?: string
          op: string
          row_id?: string | null
          snapshot_id?: string | null
          table_name: string
        }
        Update: {
          allowed_by?: string
          changed_cols?: string[] | null
          db_user?: string
          detail?: Json | null
          id?: string
          occurred_at?: string
          op?: string
          row_id?: string | null
          snapshot_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      spine_provenance_attestation: {
        Row: {
          attested_at: string
          attested_by: string
          column_source_map: Json
          exceptions: Json | null
          id: string
          notes: string | null
          object_kind: string
          object_name: string
          recomputes_nothing: boolean
          source_views: string[]
          verdict: string
        }
        Insert: {
          attested_at?: string
          attested_by: string
          column_source_map: Json
          exceptions?: Json | null
          id?: string
          notes?: string | null
          object_kind: string
          object_name: string
          recomputes_nothing: boolean
          source_views: string[]
          verdict: string
        }
        Update: {
          attested_at?: string
          attested_by?: string
          column_source_map?: Json
          exceptions?: Json | null
          id?: string
          notes?: string | null
          object_kind?: string
          object_name?: string
          recomputes_nothing?: boolean
          source_views?: string[]
          verdict?: string
        }
        Relationships: []
      }
      stg_lawpay_alltime: {
        Row: {
          amount: number | null
          bank_account: string | null
          email: string | null
          id: number
          loaded_at: string | null
          match_method: string | null
          match_score: number | null
          matched_client_id: string | null
          matched_contract_id: string | null
          method: string | null
          payer_name: string | null
          payment_date: string | null
          reference: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          bank_account?: string | null
          email?: string | null
          id?: number
          loaded_at?: string | null
          match_method?: string | null
          match_score?: number | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          method?: string | null
          payer_name?: string | null
          payment_date?: string | null
          reference?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          bank_account?: string | null
          email?: string | null
          id?: number
          loaded_at?: string | null
          match_method?: string | null
          match_score?: number | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          method?: string | null
          payer_name?: string | null
          payment_date?: string | null
          reference?: string | null
          status?: string | null
        }
        Relationships: []
      }
      stg_txn_collections_recovery_xwalk: {
        Row: {
          collection_activity_id: string
          match_basis: string | null
          matched_at: string
          txn_id: number
        }
        Insert: {
          collection_activity_id: string
          match_basis?: string | null
          matched_at?: string
          txn_id: number
        }
        Update: {
          collection_activity_id?: string
          match_basis?: string | null
          matched_at?: string
          txn_id?: number
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          collections_notice: string | null
          created_at: string
          id: number
          legal_notice: string | null
          privacy_warning: string | null
          security_notice: string | null
          support_email: string | null
          updated_at: string
        }
        Insert: {
          collections_notice?: string | null
          created_at?: string
          id?: number
          legal_notice?: string | null
          privacy_warning?: string | null
          security_notice?: string | null
          support_email?: string | null
          updated_at?: string
        }
        Update: {
          collections_notice?: string | null
          created_at?: string
          id?: number
          legal_notice?: string | null
          privacy_warning?: string | null
          security_notice?: string | null
          support_email?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      team_performance: {
        Row: {
          avg_per_call: number | null
          collected_calls: number | null
          collector: string
          created_at: string | null
          id: string
          month: string
          total_collected: number | null
        }
        Insert: {
          avg_per_call?: number | null
          collected_calls?: number | null
          collector: string
          created_at?: string | null
          id?: string
          month: string
          total_collected?: number | null
        }
        Update: {
          avg_per_call?: number | null
          collected_calls?: number | null
          collector?: string
          created_at?: string | null
          id?: string
          month?: string
          total_collected?: number | null
        }
        Relationships: []
      }
      trust_accounts: {
        Row: {
          account_name: string
          account_number_last4: string | null
          bank_name: string | null
          created_at: string
          current_balance: number
          id: string
          is_active: boolean
          routing_number_last4: string | null
          updated_at: string
        }
        Insert: {
          account_name?: string
          account_number_last4?: string | null
          bank_name?: string | null
          created_at?: string
          current_balance?: number
          id?: string
          is_active?: boolean
          routing_number_last4?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number_last4?: string | null
          bank_name?: string | null
          created_at?: string
          current_balance?: number
          id?: string
          is_active?: boolean
          routing_number_last4?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trust_client_balances: {
        Row: {
          balance: number
          client_id: string
          id: string
          last_transaction_at: string | null
          trust_account_id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          client_id: string
          id?: string
          last_transaction_at?: string | null
          trust_account_id: string
          updated_at?: string
        }
        Update: {
          balance?: number
          client_id?: string
          id?: string
          last_transaction_at?: string | null
          trust_account_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_client_balances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_client_balances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_client_balances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_client_balances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_client_balances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_client_balances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_client_balances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_client_balances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_client_balances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_client_balances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_client_balances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_client_balances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_client_balances_trust_account_id_fkey"
            columns: ["trust_account_id"]
            isOneToOne: false
            referencedRelation: "trust_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_reconciliations: {
        Row: {
          bank_statement_balance: number
          book_balance: number
          client_ledger_total: number
          created_at: string
          id: string
          is_balanced: boolean | null
          notes: string | null
          performed_by: string
          reconciliation_date: string
          trust_account_id: string
        }
        Insert: {
          bank_statement_balance: number
          book_balance: number
          client_ledger_total: number
          created_at?: string
          id?: string
          is_balanced?: boolean | null
          notes?: string | null
          performed_by: string
          reconciliation_date: string
          trust_account_id: string
        }
        Update: {
          bank_statement_balance?: number
          book_balance?: number
          client_ledger_total?: number
          created_at?: string
          id?: string
          is_balanced?: boolean | null
          notes?: string | null
          performed_by?: string
          reconciliation_date?: string
          trust_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_reconciliations_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_reconciliations_trust_account_id_fkey"
            columns: ["trust_account_id"]
            isOneToOne: false
            referencedRelation: "trust_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_transactions: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          description: string | null
          id: string
          invoice_id: string | null
          matter_id: string | null
          payment_id: string | null
          performed_by: string
          reconciled: boolean
          reconciled_at: string | null
          reconciled_by: string | null
          reference_number: string | null
          running_balance: number
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["trust_transaction_type"]
          trust_account_id: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          invoice_id?: string | null
          matter_id?: string | null
          payment_id?: string | null
          performed_by: string
          reconciled?: boolean
          reconciled_at?: string | null
          reconciled_by?: string | null
          reference_number?: string | null
          running_balance: number
          transaction_date?: string
          transaction_type: Database["public"]["Enums"]["trust_transaction_type"]
          trust_account_id: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          invoice_id?: string | null
          matter_id?: string | null
          payment_id?: string | null
          performed_by?: string
          reconciled?: boolean
          reconciled_at?: string | null
          reconciled_by?: string | null
          reference_number?: string | null
          running_balance?: number
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["trust_transaction_type"]
          trust_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "trust_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_transactions_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_clean"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_clean_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "v_eq_multi_contract_attribution"
            referencedColumns: ["payment_id"]
          },
          {
            foreignKeyName: "trust_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "v_eq_refund_reversal"
            referencedColumns: ["payment_id"]
          },
          {
            foreignKeyName: "trust_transactions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_transactions_reconciled_by_fkey"
            columns: ["reconciled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_transactions_trust_account_id_fkey"
            columns: ["trust_account_id"]
            isOneToOne: false
            referencedRelation: "trust_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      txn_draft_events: {
        Row: {
          amount: number | null
          as_of: string
          captured_at: string
          client_name: string | null
          id: number
          installment_cycle: string | null
          invoice_number: string | null
          payment_source: string | null
          row_seq: number | null
          source_file: string | null
          source_md5: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          as_of: string
          captured_at?: string
          client_name?: string | null
          id?: number
          installment_cycle?: string | null
          invoice_number?: string | null
          payment_source?: string | null
          row_seq?: number | null
          source_file?: string | null
          source_md5?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          as_of?: string
          captured_at?: string
          client_name?: string | null
          id?: number
          installment_cycle?: string | null
          invoice_number?: string | null
          payment_source?: string | null
          row_seq?: number | null
          source_file?: string | null
          source_md5?: string | null
          status?: string | null
        }
        Relationships: []
      }
      txn_typing_heartbeat: {
        Row: {
          anchor_snapshot_id: string | null
          bank_max_mo: string | null
          canonical_rows: number | null
          canonical_sum: number | null
          captured_at: string
          collections_pending: boolean | null
          collections_recovery_rows: number | null
          deterministic_pct: number | null
          deterministic_rows: number | null
          id: number
          ledger_max_date: string | null
          mece_ok: boolean | null
          notes: string | null
          status: string | null
          typed_rows: number | null
          typed_sum: number | null
          unattributed_pct: number | null
          unattributed_rows: number | null
        }
        Insert: {
          anchor_snapshot_id?: string | null
          bank_max_mo?: string | null
          canonical_rows?: number | null
          canonical_sum?: number | null
          captured_at?: string
          collections_pending?: boolean | null
          collections_recovery_rows?: number | null
          deterministic_pct?: number | null
          deterministic_rows?: number | null
          id?: never
          ledger_max_date?: string | null
          mece_ok?: boolean | null
          notes?: string | null
          status?: string | null
          typed_rows?: number | null
          typed_sum?: number | null
          unattributed_pct?: number | null
          unattributed_rows?: number | null
        }
        Update: {
          anchor_snapshot_id?: string | null
          bank_max_mo?: string | null
          canonical_rows?: number | null
          canonical_sum?: number | null
          captured_at?: string
          collections_pending?: boolean | null
          collections_recovery_rows?: number | null
          deterministic_pct?: number | null
          deterministic_rows?: number | null
          id?: never
          ledger_max_date?: string | null
          mece_ok?: boolean | null
          notes?: string | null
          status?: string | null
          typed_rows?: number | null
          typed_sum?: number | null
          unattributed_pct?: number | null
          unattributed_rows?: number | null
        }
        Relationships: []
      }
      universal_transaction_events: {
        Row: {
          created_at: string
          event_type: string
          evidence: Json
          id: number
          new_status: string | null
          prior_status: string | null
          transaction_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          evidence?: Json
          id?: never
          new_status?: string | null
          prior_status?: string | null
          transaction_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          evidence?: Json
          id?: never
          new_status?: string | null
          prior_status?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "universal_transaction_events_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "universal_transaction_inbox"
            referencedColumns: ["id"]
          },
        ]
      }
      universal_transaction_inbox: {
        Row: {
          amount: number
          card_fingerprint: string | null
          card_last_four: string | null
          confidence_score: number
          currency: string
          direction: string
          evidence: Json
          first_captured_at: string
          id: string
          last_captured_at: string
          observed_client_id: string | null
          observed_contract_id: string | null
          observed_payment_id: string | null
          occurred_on: string | null
          payer_email: string | null
          payer_name: string | null
          payer_phone: string | null
          payment_method: string | null
          recognition_status: string
          record_kind: string
          reference_number: string | null
          source_created_at: string | null
          source_external_id: string | null
          source_record_id: string
          source_revision_hash: string
          source_status: string | null
          source_system: string
          source_table: string
          source_updated_at: string | null
        }
        Insert: {
          amount: number
          card_fingerprint?: string | null
          card_last_four?: string | null
          confidence_score?: number
          currency?: string
          direction: string
          evidence?: Json
          first_captured_at?: string
          id?: string
          last_captured_at?: string
          observed_client_id?: string | null
          observed_contract_id?: string | null
          observed_payment_id?: string | null
          occurred_on?: string | null
          payer_email?: string | null
          payer_name?: string | null
          payer_phone?: string | null
          payment_method?: string | null
          recognition_status: string
          record_kind: string
          reference_number?: string | null
          source_created_at?: string | null
          source_external_id?: string | null
          source_record_id: string
          source_revision_hash: string
          source_status?: string | null
          source_system: string
          source_table: string
          source_updated_at?: string | null
        }
        Update: {
          amount?: number
          card_fingerprint?: string | null
          card_last_four?: string | null
          confidence_score?: number
          currency?: string
          direction?: string
          evidence?: Json
          first_captured_at?: string
          id?: string
          last_captured_at?: string
          observed_client_id?: string | null
          observed_contract_id?: string | null
          observed_payment_id?: string | null
          occurred_on?: string | null
          payer_email?: string | null
          payer_name?: string | null
          payer_phone?: string | null
          payment_method?: string | null
          recognition_status?: string
          record_kind?: string
          reference_number?: string | null
          source_created_at?: string | null
          source_external_id?: string | null
          source_record_id?: string
          source_revision_hash?: string
          source_status?: string | null
          source_system?: string
          source_table?: string
          source_updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "universal_transaction_inbox_observed_client_id_fkey"
            columns: ["observed_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_client_id_fkey"
            columns: ["observed_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_client_id_fkey"
            columns: ["observed_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_client_id_fkey"
            columns: ["observed_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_client_id_fkey"
            columns: ["observed_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_client_id_fkey"
            columns: ["observed_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_client_id_fkey"
            columns: ["observed_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_client_id_fkey"
            columns: ["observed_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_client_id_fkey"
            columns: ["observed_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_client_id_fkey"
            columns: ["observed_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_client_id_fkey"
            columns: ["observed_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_client_id_fkey"
            columns: ["observed_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_contract_id_fkey"
            columns: ["observed_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_contract_id_fkey"
            columns: ["observed_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_contract_id_fkey"
            columns: ["observed_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_contract_id_fkey"
            columns: ["observed_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_contract_id_fkey"
            columns: ["observed_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_contract_id_fkey"
            columns: ["observed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_contract_id_fkey"
            columns: ["observed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_contract_id_fkey"
            columns: ["observed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_contract_id_fkey"
            columns: ["observed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_contract_id_fkey"
            columns: ["observed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_contract_id_fkey"
            columns: ["observed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_contract_id_fkey"
            columns: ["observed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_contract_id_fkey"
            columns: ["observed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_contract_id_fkey"
            columns: ["observed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_contract_id_fkey"
            columns: ["observed_contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_payment_id_fkey"
            columns: ["observed_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_payment_id_fkey"
            columns: ["observed_payment_id"]
            isOneToOne: false
            referencedRelation: "payments_clean"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_payment_id_fkey"
            columns: ["observed_payment_id"]
            isOneToOne: false
            referencedRelation: "payments_clean_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_payment_id_fkey"
            columns: ["observed_payment_id"]
            isOneToOne: false
            referencedRelation: "v_eq_multi_contract_attribution"
            referencedColumns: ["payment_id"]
          },
          {
            foreignKeyName: "universal_transaction_inbox_observed_payment_id_fkey"
            columns: ["observed_payment_id"]
            isOneToOne: false
            referencedRelation: "v_eq_refund_reversal"
            referencedColumns: ["payment_id"]
          },
        ]
      }
      unmatched_payments: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          matched_client_id: string | null
          name_in_notes: string | null
          notes: string | null
          payment_date: string | null
          payment_id: string | null
          payment_number: string | null
          reference_number: string | null
          resolved_at: string | null
          resolved_method: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          matched_client_id?: string | null
          name_in_notes?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_id?: string | null
          payment_number?: string | null
          reference_number?: string | null
          resolved_at?: string | null
          resolved_method?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          matched_client_id?: string | null
          name_in_notes?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_id?: string | null
          payment_number?: string | null
          reference_number?: string | null
          resolved_at?: string | null
          resolved_method?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unmatched_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "unmatched_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "unmatched_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unmatched_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "unmatched_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "unmatched_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "unmatched_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "unmatched_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "unmatched_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "unmatched_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "unmatched_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "unmatched_payments_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "unmatched_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unmatched_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_clean"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unmatched_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_clean_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unmatched_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "v_eq_multi_contract_attribution"
            referencedColumns: ["payment_id"]
          },
          {
            foreignKeyName: "unmatched_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "v_eq_refund_reversal"
            referencedColumns: ["payment_id"]
          },
        ]
      }
      utbms_codes: {
        Row: {
          category: string | null
          code: string
          code_type: string
          description: string
          id: string
          is_active: boolean
        }
        Insert: {
          category?: string | null
          code: string
          code_type: string
          description: string
          id?: string
          is_active?: boolean
        }
        Update: {
          category?: string | null
          code?: string
          code_type?: string
          description?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      admin_kpi: {
        Row: {
          active_cases: number | null
          ar_actionable: number | null
          ar_delinquent: number | null
          ar_late: number | null
          ar_on_plan: number | null
          collected_this_month: number | null
          collection_rate_pct: number | null
          contracts_actionable: number | null
          contracts_delinquent: number | null
          contracts_late: number | null
          contracts_on_plan: number | null
          current_clients: number | null
          delinquent_clients: number | null
          late_clients: number | null
          payments_this_month: number | null
          risk_contracts: number | null
          total_clients: number | null
          total_collected: number | null
          total_contracts: number | null
          total_remaining: number | null
          unclassified_clients: number | null
        }
        Relationships: []
      }
      admin_mycase_reconciliation_summary: {
        Row: {
          closed_cases: number | null
          last_sync: string | null
          last_sync_error: string | null
          matched_cases: number | null
          matched_contacts: number | null
          matched_invoices: number | null
          open_cases: number | null
          total_billed: number | null
          total_cases: number | null
          total_contacts: number | null
          total_invoices: number | null
          total_outstanding: number | null
          total_paid: number | null
          unmatched_cases: number | null
          unmatched_contacts: number | null
          unmatched_invoices: number | null
        }
        Relationships: []
      }
      ar_active_contracts: {
        Row: {
          balance: number | null
          client: string | null
          client_id: string | null
          collected: number | null
          contract_value: number | null
          delinquency_status: string | null
          excel_status: string | null
          hubspot_deal_id: string | null
          id: string | null
          practice_area: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          balance?: never
          client?: string | null
          client_id?: string | null
          collected?: never
          contract_value?: number | null
          delinquency_status?: string | null
          excel_status?: string | null
          hubspot_deal_id?: string | null
          id?: string | null
          practice_area?: string | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          balance?: never
          client?: string | null
          client_id?: string | null
          collected?: never
          contract_value?: number | null
          delinquency_status?: string | null
          excel_status?: string | null
          hubspot_deal_id?: string | null
          id?: string | null
          practice_area?: string | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      ar_aging_summary: {
        Row: {
          aging_bucket: string | null
          avg_collection_rate: number | null
          client_count: number | null
          total_balance: number | null
          total_billed: number | null
          total_failed_payments: number | null
        }
        Relationships: []
      }
      ar_by_practice_area: {
        Row: {
          balance_owed: number | null
          client_count: number | null
          collection_rate_pct: number | null
          contract_count: number | null
          invoice_count: number | null
          practice_area: string | null
          total_billed: number | null
          total_paid: number | null
        }
        Relationships: []
      }
      ar_client_detail: {
        Row: {
          aging_bucket: string | null
          assigned_collectors: string | null
          balance_owed: number | null
          client_id: string | null
          client_name: string | null
          client_number: string | null
          client_phone: string | null
          client_quality_status: string | null
          collection_rate_pct: number | null
          contract_count: number | null
          days_past_due: number | null
          delinquency_status: string | null
          excluded_from_collections: boolean | null
          failed_payments: number | null
          has_failed_transactions: boolean | null
          inbound_calls: number | null
          invoice_count: number | null
          last_contact_date: string | null
          last_contacted_by: string | null
          last_payment_amount: number | null
          last_payment_date: string | null
          last_payment_source: string | null
          most_active_collector: string | null
          needs_review: boolean | null
          next_due_date: string | null
          no_answer_count: number | null
          outbound_calls: number | null
          payment_activities: number | null
          practice_areas: string | null
          total_billed: number | null
          total_collection_activities: number | null
          total_paid: number | null
        }
        Relationships: []
      }
      ar_closed_contracts: {
        Row: {
          balance: number | null
          client: string | null
          collected: number | null
          contract_value: number | null
          id: string | null
          notes: string | null
          practice_area: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          balance?: never
          client?: string | null
          collected?: never
          contract_value?: number | null
          id?: string | null
          notes?: string | null
          practice_area?: string | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          balance?: never
          client?: string | null
          collected?: never
          contract_value?: number | null
          id?: string | null
          notes?: string | null
          practice_area?: string | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: []
      }
      ar_collection_trending: {
        Row: {
          activity_date: string | null
          collected_amount: number | null
          collector: string | null
          failed_payments: number | null
          inbound_calls: number | null
          month_of: string | null
          outbound_calls: number | null
          successful_collections: number | null
          unique_clients: number | null
          week_of: string | null
        }
        Relationships: []
      }
      ar_collector_performance: {
        Row: {
          amount_collected_via_activity: number | null
          assigned_clients: number | null
          assigned_contracts: number | null
          collector: string | null
          failed_payments: number | null
          first_activity_date: string | null
          inbound_calls: number | null
          last_activity_date: string | null
          outbound_calls: number | null
          payment_promises: number | null
          portfolio_balance: number | null
          portfolio_billed: number | null
          portfolio_collected: number | null
          portfolio_collection_rate: number | null
          revenue_per_outbound_call: number | null
          success_rate_pct: number | null
          successful_collections: number | null
          total_activities: number | null
          total_call_minutes: number | null
          unique_clients_contacted: number | null
          voicemails: number | null
        }
        Relationships: []
      }
      ar_contract_lawpay_agg: {
        Row: {
          contract_id: string | null
          lawpay_total: number | null
          lawpay_txns: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      ar_contract_payments_agg: {
        Row: {
          contract_id: string | null
          earliest_payment: string | null
          last_90d_total: number | null
          last_txn_amount: number | null
          last_txn_date: string | null
          last_txn_source: string | null
          latest_payment: string | null
          total_paid: number | null
          total_txns: number | null
          ytd_total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      ar_dashboard: {
        Row: {
          amount_collected: number | null
          ar_source: string | null
          case_closed: boolean | null
          case_number: string | null
          case_stage: string | null
          client_id: string | null
          client_name: string | null
          collection_pct: number | null
          collector: string | null
          contract_id: string | null
          contract_status: string | null
          days_past_due: number | null
          delinquency_status: string | null
          down_payment: number | null
          down_payment_paid: boolean | null
          email: string | null
          installments_paid: number | null
          installments_remaining: number | null
          invoice_number: string | null
          latest_payment_date: string | null
          lead_attorney: string | null
          monthly_installment: number | null
          next_due_date: string | null
          phone: string | null
          post_snapshot_payments: number | null
          practice_area: string | null
          preferred_language: string | null
          remaining_balance: number | null
          snapshot_date: string | null
          start_date: string | null
          total_contract_value: number | null
          total_installments: number | null
        }
        Relationships: []
      }
      ar_flagged_accounts: {
        Row: {
          aging_bucket: string | null
          aging_flag: string | null
          assigned_collectors: string | null
          balance_owed: number | null
          client_id: string | null
          client_name: string | null
          client_number: string | null
          collection_rate_pct: number | null
          contact_gap_flag: string | null
          days_past_due: number | null
          delinquency_status: string | null
          failed_payment_flag: string | null
          failed_payments: number | null
          last_contact_date: string | null
          last_contacted_by: string | null
          practice_areas: string | null
          priority_score: number | null
          review_flag: string | null
          total_billed: number | null
        }
        Relationships: []
      }
      ar_migration_contracts: {
        Row: {
          amount_collected: number | null
          balance: number | null
          client: string | null
          client_id: string | null
          collector: string | null
          contract_value: number | null
          id: string | null
          monthly_installment: number | null
          practice_area: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          amount_collected?: number | null
          balance?: never
          client?: string | null
          client_id?: string | null
          collector?: string | null
          contract_value?: number | null
          id?: string | null
          monthly_installment?: number | null
          practice_area?: string | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          amount_collected?: number | null
          balance?: never
          client?: string | null
          client_id?: string | null
          collector?: string | null
          contract_value?: number | null
          id?: string | null
          monthly_installment?: number | null
          practice_area?: string | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      ar_monthly_kpi: {
        Row: {
          active_collectors: number | null
          activity_total_collected: number | null
          auto_charge_amount: number | null
          auto_charges: number | null
          auto_system_collected: number | null
          auto_system_count: number | null
          avg_payment_per_client: number | null
          call_success_rate_pct: number | null
          clients_contacted: number | null
          collection_effort_collected: number | null
          collection_effort_count: number | null
          contact_coverage_pct: number | null
          delinquent_clients_contacted: number | null
          delinquent_clients_worked: number | null
          delinquent_coverage_pct: number | null
          failed_payments: number | null
          human_collected_amount: number | null
          inbound_calls: number | null
          installment_collected: number | null
          installment_count: number | null
          month_label: string | null
          month_start: string | null
          outbound_calls: number | null
          revenue_per_outbound_call: number | null
          successful_collections: number | null
          total_activities: number | null
          total_collected: number | null
          total_delinquent_clients: number | null
          total_delinquent_contracts: number | null
          total_payments: number | null
          unique_clients_paying: number | null
          unique_clients_worked: number | null
        }
        Relationships: []
      }
      ar_overall_overview: {
        Row: {
          at_risk_balance: number | null
          auto_lawpay_collected: number | null
          auto_payment_count: number | null
          backfill_collected: number | null
          current_balance: number | null
          current_contracts: number | null
          delinquent_balance: number | null
          delinquent_contracts: number | null
          expected_from_current: number | null
          human_effort_collected: number | null
          installment_payment_count: number | null
          installment_plan_collected: number | null
          late_balance: number | null
          late_contracts: number | null
          overall_collection_rate: number | null
          successful_collection_events: number | null
          system_auto_charge_collected: number | null
          total_balance_owed: number | null
          total_billed: number | null
          total_clients: number | null
          total_collection_calls: number | null
          total_contracts: number | null
          total_paid: number | null
        }
        Relationships: []
      }
      ar_validation_summary: {
        Row: {
          avg_discrepancy_amount: number | null
          clients_with_discrepancy: number | null
          clients_with_invoices: number | null
          total_contract_ar: number | null
          total_mc_ar: number | null
          total_unmatched_lawpay: number | null
          total_variance: number | null
        }
        Relationships: []
      }
      ar_weekly_kpi: {
        Row: {
          auto_charge_amount: number | null
          auto_system_collected: number | null
          clients_contacted: number | null
          collection_effort_collected: number | null
          delinquent_clients_worked: number | null
          delinquent_coverage_pct: number | null
          failed_payments: number | null
          human_collected_amount: number | null
          inbound_calls: number | null
          installment_collected: number | null
          month_label: string | null
          outbound_calls: number | null
          revenue_per_outbound_call: number | null
          successful_collections: number | null
          total_activities: number | null
          total_collected: number | null
          total_delinquent_clients: number | null
          total_payments: number | null
          unique_clients_paying: number | null
          unique_clients_worked: number | null
          week_label: string | null
          week_start: string | null
        }
        Relationships: []
      }
      client_quality_summary: {
        Row: {
          active_clients: number | null
          client_quality_status: string | null
          excluded_from_collections: boolean | null
          with_case_number: number | null
          with_collector: number | null
          with_email: number | null
          with_phone: number | null
        }
        Relationships: []
      }
      collections_by_aging: {
        Row: {
          days_31_to_60: number | null
          days_61_to_90: number | null
          month_start: string | null
          over_90_days: number | null
          total_collected: number | null
          total_transactions: number | null
          txn_31_to_60: number | null
          txn_61_to_90: number | null
          txn_over_90: number | null
          txn_under_30: number | null
          under_30_days: number | null
          week_start: string | null
        }
        Relationships: []
      }
      collections_dashboard: {
        Row: {
          assigned_collector: string | null
          balance_remaining: number | null
          case_number: string | null
          case_stage: string | null
          client_id: string | null
          client_last_transaction_amount: number | null
          client_last_transaction_date: string | null
          client_last_transaction_source: string | null
          client_name: string | null
          client_quality_reason: string | null
          client_quality_status: string | null
          collected: number | null
          collector: string | null
          contact_count_30d: number | null
          contract_id: string | null
          contract_last_transaction_amount: number | null
          contract_last_transaction_date: string | null
          contract_last_transaction_source: string | null
          contract_status: string | null
          contract_value: number | null
          days_out: number | null
          days_past_due: number | null
          delinquency_status: string | null
          effective_days_past_due: number | null
          email: string | null
          excluded_from_collections: boolean | null
          immigration_stage: string | null
          last_contact_date: string | null
          last_transaction_amount: number | null
          last_transaction_date: string | null
          last_transaction_source: string | null
          latest_commitment_follow_up_date: string | null
          latest_commitment_status: string | null
          latest_promised_amount: number | null
          latest_promised_date: string | null
          lead_attorney: string | null
          low_balance_hold: boolean | null
          missed_promise: boolean | null
          monthly_installment: number | null
          next_due_date: string | null
          next_payment_date: string | null
          phone: string | null
          positive_contact_count_90d: number | null
          practice_area: string | null
          preferred_language: string | null
          priority_score: number | null
          queue_reason: string | null
          queue_tier: string | null
          repeat_delinquency_count: number | null
        }
        Relationships: []
      }
      collector_client_status: {
        Row: {
          client_id: string | null
          client_name: string | null
          collector: string | null
          contacted_this_week: boolean | null
          contacts_last_30d: number | null
          days_since_contact: number | null
          delinquency_status: string | null
          last_contact_date: string | null
          practice_area: string | null
          remaining_ar: number | null
          total_contacts: number | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      collector_performance: {
        Row: {
          avg_collected_per_call: number | null
          collected_calls: number | null
          collector: string | null
          conversion_rate_pct: number | null
          month: string | null
          total_activities: number | null
          total_collected: number | null
          total_commission: number | null
        }
        Relationships: []
      }
      collector_weekly_coverage: {
        Row: {
          collector: string | null
          coverage_pct: number | null
          productive_contacts: number | null
          productivity_pct: number | null
          team_share_pct: number | null
          team_unique_clients: number | null
          total_activities: number | null
          total_ar_clients: number | null
          unique_clients_contacted: number | null
          week_end: string | null
          week_start: string | null
        }
        Relationships: []
      }
      consult_funnel: {
        Row: {
          avg_fee: number | null
          converted: number | null
          fees_collected: number | null
          stage_label: string | null
          total: number | null
        }
        Relationships: []
      }
      data_health_dashboard: {
        Row: {
          amount: string | null
          category: string | null
          metric: string | null
          value: string | null
        }
        Relationships: []
      }
      hubspot_deals_review_queue: {
        Row: {
          amount: number | null
          case_number: string | null
          contact_email: string | null
          contact_phone: string | null
          dealname: string | null
          dealstage: string | null
          hubspot_deal_id: string | null
          match_method: string | null
          match_notes: string | null
          match_score: number | null
          match_status: string | null
          matched_client_id: string | null
          mycase_case_id: string | null
          pipeline: string | null
          suggested_client_case_number: string | null
          suggested_client_name: string | null
          suggested_client_quality: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      hubspot_unmatched: {
        Row: {
          amount: number | null
          consultation_fee: number | null
          created_at: string | null
          dealname: string | null
          event_type: string | null
          hubspot_deal_id: string | null
          match_detail: string | null
          pipeline: string | null
          stage: string | null
        }
        Insert: {
          amount?: never
          consultation_fee?: never
          created_at?: string | null
          dealname?: never
          event_type?: string | null
          hubspot_deal_id?: string | null
          match_detail?: string | null
          pipeline?: string | null
          stage?: string | null
        }
        Update: {
          amount?: never
          consultation_fee?: never
          created_at?: string | null
          dealname?: never
          event_type?: string | null
          hubspot_deal_id?: string | null
          match_detail?: string | null
          pipeline?: string | null
          stage?: string | null
        }
        Relationships: []
      }
      lawpay_actual_mycase_invoice_payments: {
        Row: {
          contract_client: string | null
          contract_invoice_number: string | null
          invoice_number: string | null
          invoice_payment_status: string | null
          lawpay_amount: number | null
          lawpay_reference: string | null
          lawpay_row_id: string | null
          lawpay_transaction_id: string | null
          match_confidence: string | null
          match_reason: string | null
          matched_client_id: string | null
          matched_contract_id: string | null
          matched_to_payment: boolean | null
          mycase_amount_due: number | null
          mycase_internal_id: string | null
          mycase_invoice_description: string | null
          mycase_invoice_row_id: string | null
          mycase_invoice_status: string | null
          payment_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      lawpay_unmatched_resolvable: {
        Row: {
          amount: number | null
          client_id: string | null
          client_name: string | null
          description: string | null
          display_invoice_number: string | null
          invoice_balance: number | null
          invoice_status: string | null
          lawpay_transaction_id: string | null
          lawpay_txn_id: string | null
          mycase_internal_id: string | null
          payment_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      legal_kpi: {
        Row: {
          active_cases: number | null
          approved_cases: number | null
          attorney_caseloads: Json | null
          closed_cases: number | null
          detained_cases: number | null
          filed_with_uscis: number | null
          intakes_last_month: number | null
          intakes_this_month: number | null
          monthly_intake_trend: Json | null
          pending_decision: number | null
          pending_rfe: number | null
          practice_breakdown: Json | null
          receipts_biometrics: number | null
          removal_defense: number | null
          stage_breakdown: Json | null
          total_cases: number | null
        }
        Relationships: []
      }
      mv_queue_contact_coverage_monthly: {
        Row: {
          as_of_date: string | null
          coverage_45d_pct: number | null
          coverage_basis: string | null
          covered_clients: number | null
          delinquent_clients: number | null
          month: string | null
          overdue_ar: number | null
          paid_clients: number | null
          reach_45d_pct: number | null
          reached_clients: number | null
        }
        Relationships: []
      }
      mycase_ar_validation: {
        Row: {
          ar_status: string | null
          ar_variance: number | null
          client_id: string | null
          client_name: string | null
          contract_balance: number | null
          contract_billed: number | null
          contract_collected: number | null
          has_discrepancy: boolean | null
          lawpay_matched_payments: number | null
          lawpay_unmatched_payments: number | null
          mc_collectible_ar: number | null
          mc_total_billed: number | null
          mc_total_paid: number | null
          overdue_invoices: number | null
          paid_invoices: number | null
          partial_invoices: number | null
          total_invoices: number | null
        }
        Relationships: []
      }
      payment_shadow_rule_metrics: {
        Row: {
          confidence_tier: string | null
          confirmed: number | null
          disagreed: number | null
          first_prediction_at: string | null
          latest_prediction_at: string | null
          observed_precision_pct: number | null
          predictions: number | null
          rule_version: string | null
          still_unresolved: number | null
        }
        Relationships: []
      }
      payments_clean: {
        Row: {
          aging_bucket: string | null
          amount: number | null
          case_number: string | null
          client_id: string | null
          client_name: string | null
          collector_name: string | null
          commission: number | null
          contract_collected: number | null
          contract_collector: string | null
          contract_id: string | null
          contract_invoice_number: string | null
          contract_status: string | null
          contract_value: number | null
          created_at: string | null
          delinquency_days: number | null
          deposit_to_trust: boolean | null
          id: string | null
          lawpay_invoice_number: string | null
          monthly_installment: number | null
          notes: string | null
          payment_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_number: string | null
          payment_type: string | null
          practice_area: string | null
          received_by: string | null
          reference_number: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments_clean_mv: {
        Row: {
          aging_bucket: string | null
          amount: number | null
          case_number: string | null
          client_id: string | null
          client_name: string | null
          collector_name: string | null
          commission: number | null
          contract_collected: number | null
          contract_collector: string | null
          contract_status: string | null
          contract_value: number | null
          created_at: string | null
          delinquency_days: number | null
          deposit_to_trust: boolean | null
          id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_number: string | null
          payment_type: string | null
          practice_area: string | null
          received_by: string | null
          reference_number: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments_monthly_rollup: {
        Row: {
          month: string | null
          month_date: string | null
          payment_count: number | null
          total_collected: number | null
          unique_clients: number | null
        }
        Relationships: []
      }
      universal_transaction_coverage: {
        Row: {
          earliest_date: string | null
          held_rows: number | null
          last_capture_at: string | null
          latest_date: string | null
          probable_rows: number | null
          recognized_pct: number | null
          record_kind: string | null
          source_system: string | null
          source_table: string | null
          transaction_rows: number | null
          unmatched_rows: number | null
          verified_rows: number | null
        }
        Relationships: []
      }
      v_activity_collected_by_collector_weekly: {
        Row: {
          certified_collected: number | null
          collector: string | null
          is_autopay_credit: boolean | null
          payment_events: number | null
          week_start: string | null
        }
        Relationships: []
      }
      v_activity_collected_dup_health: {
        Row: {
          certified_4w: number | null
          checked_at: string | null
          crosssource_dup_pct_4w: number | null
          detail: Json | null
          guard: string | null
          reingest_excess_dollars_30d: number | null
          reingest_excess_rows_30d: number | null
          status: string | null
        }
        Relationships: []
      }
      v_activity_collected_weekly: {
        Row: {
          certified_auto_payment: number | null
          certified_collected: number | null
          certified_collector: number | null
          duplication_excess: number | null
          duplication_pct: number | null
          money_rows: number | null
          payment_events: number | null
          raw_collected: number | null
          week_start: string | null
        }
        Relationships: []
      }
      v_activity_feed_health: {
        Row: {
          active_collectors: number | null
          blind: number | null
          blind_names: string | null
          earliest_activity_date: string | null
          feed_age_days: number | null
          feed_status: string | null
          healthy: number | null
          latest_activity_date: string | null
          never_logged: number | null
          never_logged_names: string | null
          new_no_data_yet: number | null
          real_rows_365d: number | null
          reason: string | null
          rostered_tracked: number | null
          twelve_month_window_ok: boolean | null
          warning: number | null
        }
        Relationships: []
      }
      v_all_hands_health: {
        Row: {
          days_since_last: number | null
          last_held_at: string | null
          last_invariants_ok: boolean | null
          status: string | null
          total_standups: number | null
        }
        Relationships: []
      }
      v_ar_active_rows: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          client_case_text: string | null
          client_id: string | null
          effective_due_date: string | null
          has_original_due: boolean | null
          invoice_number: string | null
          invoice_number_raw: string | null
          invoice_total: number | null
          link_source: string | null
          original_due_date: string | null
          snapshot_date: string | null
          snapshot_due_date: string | null
          snapshot_id: string | null
          source_row_id: string | null
          status: string | null
        }
        Relationships: []
      }
      v_ar_active_snapshot: {
        Row: {
          imported_at: string | null
          row_count: number | null
          snapshot_date: string | null
          snapshot_id: string | null
          source_filename: string | null
          source_system: string | null
          total_ar_dollars: number | null
        }
        Relationships: []
      }
      v_ar_aging: {
        Row: {
          aging_bucket: string | null
          amount_due: number | null
          amount_paid: number | null
          case_number: string | null
          client_case_text: string | null
          client_id: string | null
          collector: string | null
          contract_collected: number | null
          contract_status: string | null
          contract_value: number | null
          days_overdue: number | null
          delinquency_status: string | null
          due_date: string | null
          installments_paid: number | null
          invoice_number: string | null
          invoice_status: string | null
          invoice_total: number | null
          is_linked_to_contract: boolean | null
          maturity_date: string | null
          monthly_installment: number | null
          next_due_date: string | null
          plan_pct_complete: number | null
          practice_area: string | null
          total_installments: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_ar_at_risk: {
        Row: {
          aging_bucket: string | null
          autopay_status: string | null
          client_name: string | null
          days_overdue: number | null
          dedup_version: string | null
          is_behind: boolean | null
          last_worked_date: string | null
          matched_client_id: string | null
          motion: string | null
          never_worked: boolean | null
          on_plan: boolean | null
          open_balance: number | null
          plan_as_of: string | null
          plan_behind_balance: number | null
          plan_days_behind: number | null
          plan_overdue_amount: number | null
          savable_tier: string | null
          snapshot_as_of: string | null
          worked_as_of: string | null
          worked_recency_bucket: string | null
        }
        Relationships: []
      }
      v_ar_at_risk_candidate: {
        Row: {
          aging_bucket: string | null
          autopay_status: string | null
          client_name: string | null
          days_overdue: number | null
          dedup_version: string | null
          is_behind: boolean | null
          last_worked_date: string | null
          matched_client_id: string | null
          motion: string | null
          never_worked: boolean | null
          on_plan: boolean | null
          open_balance: number | null
          plan_as_of: string | null
          plan_behind_balance: number | null
          plan_days_behind: number | null
          plan_overdue_amount: number | null
          savable_tier: string | null
          snapshot_as_of: string | null
          worked_as_of: string | null
          worked_recency_bucket: string | null
        }
        Relationships: []
      }
      v_ar_at_risk_candidate_spinepref: {
        Row: {
          aging_bucket: string | null
          autopay_status: string | null
          client_name: string | null
          days_overdue: number | null
          dedup_version: string | null
          is_behind: boolean | null
          last_worked_date: string | null
          matched_client_id: string | null
          motion: string | null
          never_worked: boolean | null
          on_plan: boolean | null
          open_balance: number | null
          plan_as_of: string | null
          plan_behind_balance: number | null
          plan_days_behind: number | null
          plan_overdue_amount: number | null
          savable_tier: string | null
          snapshot_as_of: string | null
          worked_as_of: string | null
          worked_recency_bucket: string | null
        }
        Relationships: []
      }
      v_ar_bucket_movement: {
        Row: {
          amount_due: number | null
          client_id: string | null
          from_bucket: string | null
          invoice_number: string | null
          movement_type: string | null
          period_date: string | null
          to_bucket: string | null
        }
        Relationships: []
      }
      v_ar_canonical: {
        Row: {
          amount: number | null
          amount_due: number | null
          amount_paid: number | null
          bank_account_type: string | null
          due_date: string | null
          invoice_number: string | null
          is_attributed: boolean | null
          is_open: boolean | null
          issue_date: string | null
          matched_client_id: string | null
          matched_contract_id: string | null
          mycase_case_id: number | null
          mycase_invoice_id: number | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          amount_due?: number | null
          amount_paid?: number | null
          bank_account_type?: string | null
          due_date?: string | null
          invoice_number?: string | null
          is_attributed?: never
          is_open?: never
          issue_date?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_case_id?: number | null
          mycase_invoice_id?: number | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          amount_due?: number | null
          amount_paid?: number | null
          bank_account_type?: string | null
          due_date?: string | null
          invoice_number?: string | null
          is_attributed?: never
          is_open?: never
          issue_date?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_case_id?: number | null
          mycase_invoice_id?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      v_ar_canonical_summary: {
        Row: {
          distinct_clients: number | null
          open_ar: number | null
          open_ar_attributed: number | null
          open_ar_unattributed: number | null
          open_invoices: number | null
          pct_attributed: number | null
        }
        Relationships: []
      }
      v_ar_client_concentration: {
        Row: {
          ar: number | null
          ar_pct: number | null
          avg_balance: number | null
          balance_band: string | null
          clients: number | null
        }
        Relationships: []
      }
      v_ar_client_movement: {
        Row: {
          ar_current: number | null
          ar_prior: number | null
          client_id: string | null
          client_name: string | null
          client_number: string | null
          delta: number | null
          latest_snapshot_date: string | null
          movement: string | null
          prior_snapshot_date: string | null
        }
        Relationships: []
      }
      v_ar_client_movement_ts: {
        Row: {
          ar: number | null
          client_id: string | null
          client_name: string | null
          client_number: string | null
          delta: number | null
          movement: string | null
          prior_ar: number | null
          prior_date: string | null
          snapshot_date: string | null
        }
        Relationships: []
      }
      v_ar_contact_coverage: {
        Row: {
          assigned_collector: string | null
          call_contacts: number | null
          client_id: string | null
          client_name: string | null
          days_contacted: number | null
          days_out: number | null
          delinquency_status: string | null
          ever_contacted: boolean | null
          first_contact_date: string | null
          last_contact_date: string | null
          outstanding_ar: number | null
          payment_contacts: number | null
          total_collected: number | null
          total_contacts: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_ar_dashboard: {
        Row: {
          active_plan_ar: number | null
          active_plan_count: number | null
          current_live_ar: number | null
          has_both_sources: number | null
          has_lawpay_data: number | null
          has_mycase_history: number | null
          no_history_ar: number | null
          no_history_count: number | null
          paid_in_full_ar: number | null
          paid_in_full_count: number | null
          paid_since_snapshot: number | null
          partial_count: number | null
          partial_live_ar: number | null
          recent_payer_ar: number | null
          recent_payer_count: number | null
          snapshot_ar: number | null
          stale_ar: number | null
          stale_count: number | null
          total_invoices: number | null
        }
        Relationships: []
      }
      v_ar_forward_projection: {
        Row: {
          cumulative_collections: number | null
          proj_month: string | null
          projected_ar_if_on_schedule: number | null
          scheduled_collections: number | null
        }
        Relationships: []
      }
      v_ar_freshness_guard: {
        Row: {
          aging_days_old: number | null
          alert_days: number | null
          anchor_matches_feeding: boolean | null
          anchor_snapshot_date: string | null
          anchor_snapshot_id: string | null
          feeding_snapshot_date: string | null
          feeding_snapshot_id: string | null
          newer_snapshot_available: boolean | null
          newest_available_date: string | null
          source_system: string | null
          status: string | null
          warn_days: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["anchor_snapshot_id"]
            isOneToOne: false
            referencedRelation: "ar_source_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["anchor_snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_active_rows"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["anchor_snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_active_snapshot"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["anchor_snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_freshness_guard"
            referencedColumns: ["feeding_snapshot_id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["anchor_snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_invoice_client_map_current"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["anchor_snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_purpose_classified_v1"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["anchor_snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_snapshot_series"
            referencedColumns: ["snapshot_id"]
          },
        ]
      }
      v_ar_gap_contracts: {
        Row: {
          case_number: string | null
          client_canonical_name: string | null
          client_id: string | null
          client_name: string | null
          collected: number | null
          collector: string | null
          confidence: string | null
          contract_id: string | null
          contract_value: number | null
          days_out: number | null
          delinquency_status: string | null
          gap_source: string | null
          invoice_number: string | null
          monthly_installment: number | null
          mycase_status: string | null
          next_due_date: string | null
          practice_area: string | null
          remaining_balance: number | null
          snapshot_date: string | null
          start_date: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_ar_invoice_bucket_snapshot: {
        Row: {
          aging_bucket: string | null
          amount_due: number | null
          client_id: string | null
          due_date: string | null
          invoice_number: string | null
          rn: number | null
          snapshot_date: string | null
        }
        Relationships: []
      }
      v_ar_invoice_client_map_current: {
        Row: {
          amount_paid: number | null
          amount_receivable: number | null
          case_text: string | null
          client: string | null
          days_aging: number | null
          due_date: string | null
          invoice_number_norm: string | null
          invoice_number_raw: string | null
          invoice_total: number | null
          snapshot_date: string | null
          snapshot_id: string | null
          source_system: string | null
          status: string | null
        }
        Relationships: []
      }
      v_ar_keys_pit: {
        Row: {
          any_due: number | null
          k: string | null
          overdue_due: number | null
          snapshot_date: string | null
        }
        Relationships: []
      }
      v_ar_kpi_health: {
        Row: {
          ar_as_of_drift_days: number | null
          basis_book: string | null
          findings: string[] | null
          is_publish_month: boolean | null
          month: string | null
          ok_book_tie: boolean | null
          ok_buckets: boolean | null
          ok_denylist_estimated: boolean | null
          ok_freshness: boolean | null
          ok_qbo_net: boolean | null
          ok_scale: boolean | null
          publish_blocked: boolean | null
          row_quality: string | null
          snapshot_quality: string | null
          status: string | null
        }
        Relationships: []
      }
      v_ar_kpi_monthly: {
        Row: {
          aged_180_pct: number | null
          aged_180_plus: number | null
          aged_365_plus: number | null
          ar_as_of_drift_days: number | null
          ar_mom_change: number | null
          ar_mom_change_pct: number | null
          ar_total: number | null
          autopay_attrition_pct: number | null
          autopay_crosscut: number | null
          b_1_30: number | null
          b_181_365: number | null
          b_31_90: number | null
          b_365_plus: number | null
          b_91_180: number | null
          b_current: number | null
          bank_verified: boolean | null
          basis_book: string | null
          basis_cash: string | null
          basis_driver_split: string | null
          basis_mix: string | null
          basis_plan_era: string | null
          basis_team: string | null
          book_ar_total_check: number | null
          book_as_of: string | null
          book_month_gap: boolean | null
          card_recovery_cured: number | null
          cash_accounting_basis: string | null
          cash_current_op: number | null
          collected_pct: number | null
          consult_op: number | null
          coverage_45d_pct: number | null
          cycle_time_days: number | null
          delinquent_op: number | null
          delinquent_recovery: number | null
          driver_machine_cash: number | null
          driver_manual_cash: number | null
          is_complete_month: boolean | null
          leakage_amt: number | null
          leakage_pct: number | null
          month: string | null
          month_end: string | null
          net_cash: number | null
          new_case_op: number | null
          notes: string[] | null
          provisional: boolean | null
          qbo_scale_factor: number | null
          recovery_from_180plus: number | null
          refunds: number | null
          row_quality: string | null
          sales_gross: number | null
          snapshot_quality: string | null
          unattributable_op: number | null
        }
        Relationships: []
      }
      v_ar_landscape_health: {
        Row: {
          as_of: string | null
          days_old: number | null
          feed: string | null
          pull: string | null
          source: string | null
          stale_days: number | null
          status: string | null
        }
        Relationships: []
      }
      v_ar_landscape_monthly: {
        Row: {
          aged_180_pct: number | null
          ar_total: number | null
          as_of: string | null
          b_1_30: number | null
          b_181_365: number | null
          b_31_90: number | null
          b_365_plus: number | null
          b_91_180: number | null
          b_current: number | null
          cumulative_collected_pct: number | null
          mom_change: number | null
          mom_change_pct: number | null
          month: string | null
          new_invoiced_delta: number | null
          open_invoices: number | null
          overdue_ct: number | null
          paid_delta: number | null
          partial_ct: number | null
          total_invoiced: number | null
          total_paid: number | null
        }
        Relationships: []
      }
      v_ar_landscape_monthly_verified: {
        Row: {
          aged_180_pct: number | null
          ar_total: number | null
          as_of: string | null
          book_paid_delta: number | null
          cash_collected_verified: number | null
          cash_crosscheck_lawpay: number | null
          cash_source: string | null
          cash_vs_book_paid_gap: number | null
          delta_ar: number | null
          implied_offline_slice: number | null
          lawpay_max_date: string | null
          month: string | null
          movement_reconciled: string | null
          new_invoiced_delta: number | null
          qbo_chargebacks: number | null
          qbo_pulled: string | null
          qbo_refunds: number | null
          verification_note: string | null
        }
        Relationships: []
      }
      v_ar_landscape_trend: {
        Row: {
          aged_180_pct: number | null
          aged_180_plus: number | null
          aged_365_pct: number | null
          aged_365_plus: number | null
          as_of_date: string | null
          collected_pct: number | null
          invoice_count: number | null
          mom_change: number | null
          mom_change_pct: number | null
          month: string | null
          month_gap: boolean | null
          months_since_prev: number | null
          overdue_ar: number | null
          overdue_count: number | null
          partial_count: number | null
          src: string | null
          total_invoiced: number | null
          total_paid: number | null
          total_receivable: number | null
        }
        Relationships: []
      }
      v_ar_live_delinquency: {
        Row: {
          aging_status: string | null
          ar_180_plus: number | null
          ar_365_plus: number | null
          as_of: string | null
          client_id: string | null
          client_key: string | null
          client_name: string | null
          current_ar: number | null
          max_days_past_due: number | null
          open_invoices: number | null
          overdue_ar: number | null
          partial_ar: number | null
          unresolved: boolean | null
        }
        Relationships: []
      }
      v_ar_live_movement: {
        Row: {
          ar_paid_down_since: number | null
          as_of: string | null
          baseline_ar: number | null
          baseline_date: string | null
          baseline_invoices: number | null
          days_since_baseline: number | null
          last_lawpay_date: string | null
          lawpay_gross_inflow_since: number | null
          lawpay_payments_since: number | null
          live_ar: number | null
        }
        Relationships: []
      }
      v_ar_monthly_cashflow: {
        Row: {
          ar_created: number | null
          collected: number | null
          cumulative_ar_created: number | null
          cumulative_collected: number | null
          month: string | null
          net_ar_change: number | null
          new_contracts: number | null
          payments_received: number | null
        }
        Relationships: []
      }
      v_ar_movement_monthly: {
        Row: {
          ar_balance: number | null
          ar_created: number | null
          ar_mom_change: number | null
          bucket_180_plus: number | null
          bucket_31_60: number | null
          bucket_61_90: number | null
          bucket_91_180: number | null
          bucket_current: number | null
          chg_180_plus: number | null
          chg_31_60: number | null
          chg_61_90: number | null
          chg_91_180: number | null
          chg_current: number | null
          chg_total_contracts: number | null
          collected: number | null
          current_contracts: number | null
          current_outstanding: number | null
          delinquent_contracts: number | null
          delinquent_outstanding: number | null
          late_contracts: number | null
          late_outstanding: number | null
          month: string | null
          net_new_vs_collected: number | null
          total_contracts_with_ar: number | null
        }
        Relationships: []
      }
      v_ar_payment_history: {
        Row: {
          aging_bucket: string | null
          ar_status: string | null
          client_case_text: string | null
          due_date: string | null
          invoice_number: string | null
          invoice_total: number | null
          last_payment_date: string | null
          lawpay_last_payment: string | null
          lawpay_payments: number | null
          lawpay_post_snapshot_paid: number | null
          lawpay_post_snapshot_payments: number | null
          lawpay_total_paid: number | null
          live_ar: number | null
          mycase_first_payment: string | null
          mycase_last_payment: string | null
          mycase_payments: number | null
          mycase_recent_paid: number | null
          mycase_recent_payments: number | null
          mycase_total_paid: number | null
          payment_status: string | null
          practice_area: string | null
          snapshot_amount_due: number | null
          snapshot_amount_paid: number | null
        }
        Relationships: []
      }
      v_ar_payment_staleness: {
        Row: {
          client: string | null
          cohort_month: string | null
          cohort_year: number | null
          collected: number | null
          collection_pct: number | null
          contract_id: string | null
          contract_status: string | null
          contract_value: number | null
          days_since_last_payment: number | null
          days_since_start: number | null
          days_to_first_payment: number | null
          first_payment_date: string | null
          last_payment_date: string | null
          maturity_date: string | null
          outstanding_ar: number | null
          payment_count: number | null
          staleness_bucket: string | null
          start_date: string | null
          total_paid_lawpay: number | null
        }
        Relationships: []
      }
      v_ar_plan_adherence: {
        Row: {
          amount_due: number | null
          autopay: boolean | null
          cadence_days: number | null
          case_name: string | null
          contact: string | null
          final_due: string | null
          health: string | null
          id: string | null
          installment_amt: number | null
          installments_paid: number | null
          invoice_number: string | null
          next_amount: number | null
          next_due: string | null
          overdue_amount: number | null
          overdue_inst: number | null
          paid: number | null
          remaining_inst: number | null
          total: number | null
          total_installments: number | null
        }
        Relationships: []
      }
      v_ar_portfolio_monthly: {
        Row: {
          active_count: number | null
          ar_created: number | null
          archived_count: number | null
          avg_contract_value: number | null
          cohort_month: string | null
          collection_pct: number | null
          cumulative_ar: number | null
          cumulative_cases: number | null
          cumulative_outstanding: number | null
          new_cases: number | null
          outstanding_ar: number | null
          paid_count: number | null
          risk_count: number | null
          total_collected: number | null
        }
        Relationships: []
      }
      v_ar_portfolio_yearly: {
        Row: {
          active_count: number | null
          ar_created: number | null
          archived_count: number | null
          avg_contract_value: number | null
          cohort_year: number | null
          collection_pct: number | null
          new_cases: number | null
          outstanding_ar: number | null
          paid_count: number | null
          risk_count: number | null
          total_collected: number | null
        }
        Relationships: []
      }
      v_ar_preview: {
        Row: {
          ar_status: string | null
          case_number: string | null
          client_id: string | null
          client_name: string | null
          collector: string | null
          contract_id: string | null
          contract_status: string | null
          contract_total: number | null
          derived_installment_occurrences: number | null
          derived_monthly_installment: number | null
          dollar_shortfall: number | null
          dollar_surplus: number | null
          down_payment: number | null
          expected_paid_by_today: number | null
          fee_schedule_plan: string | null
          first_payment_date: string | null
          installment_from_contract: boolean | null
          installment_source: string | null
          installments_ahead: number | null
          installments_behind: number | null
          installments_completed: number | null
          installments_expected_by_today: number | null
          invoice_number: string | null
          last_payment_date: string | null
          match_path: string | null
          monthly_installment: number | null
          months_behind: number | null
          months_elapsed: number | null
          net_collected: number | null
          payment_count: number | null
          practice_area: string | null
          queue_delinquency_status: string | null
          remaining_balance: number | null
          source_confidence: string | null
          start_date: string | null
          total_installments: number | null
          total_payments_applied: number | null
          total_refunds: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_ar_preview_summary: {
        Row: {
          behind_1_installment: number | null
          behind_2_installments: number | null
          behind_3_installments: number | null
          behind_4_to_6_installments: number | null
          behind_6_plus_installments: number | null
          current_count: number | null
          delinquent_balance: number | null
          delinquent_count: number | null
          delinquent_shortfall: number | null
          eq_authorized_only: number | null
          eq_fuzzy_match_review: number | null
          eq_multi_contract_attribution: number | null
          eq_payment_no_contract: number | null
          eq_refund_reversal: number | null
          installment_from_contract: number | null
          installment_from_fee_schedule: number | null
          installment_from_payments: number | null
          installment_missing: number | null
          paid_ahead_count: number | null
          paid_off_count: number | null
          shortfall_2000_4999: number | null
          shortfall_500_1999: number | null
          shortfall_5000_plus: number | null
          shortfall_under_500: number | null
          total_clients: number | null
          total_collected: number | null
          total_contract_value: number | null
          total_contracts: number | null
          total_remaining_balance: number | null
          unknown_count: number | null
        }
        Relationships: []
      }
      v_ar_purpose_classified_v1: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          case_seq: number | null
          client_case_text: string | null
          client_id: string | null
          client_inv_cnt: number | null
          invoice_number: string | null
          invoice_total: number | null
          norm_key: string | null
          purpose: string | null
          purpose_confidence: string | null
          purpose_signal: string | null
          snapshot_date: string | null
          snapshot_id: string | null
          source_row_id: string | null
          status: string | null
        }
        Relationships: []
      }
      v_ar_reconciliation_map: {
        Row: {
          amount: number | null
          counts_toward_operating_ar: boolean | null
          label: string | null
          line_order: number | null
          note: string | null
          tier: string | null
        }
        Relationships: []
      }
      v_ar_retention_by_vintage: {
        Row: {
          collected: number | null
          invoiced: number | null
          invoices: number | null
          outstanding: number | null
          retention_pct: number | null
          vintage_year: number | null
        }
        Relationships: []
      }
      v_ar_retention_gap_buckets: {
        Row: {
          motion: string | null
          overdue_owed: number | null
          plans: number | null
          severity: string | null
        }
        Relationships: []
      }
      v_ar_snapshot_series: {
        Row: {
          rn_asc: number | null
          rn_desc: number | null
          snapshot_date: string | null
          snapshot_id: string | null
          source_system: string | null
          total_ar_dollars: number | null
        }
        Relationships: []
      }
      v_ar_source_rows_resolved: {
        Row: {
          aging_bucket: string | null
          amount_due: number | null
          amount_paid: number | null
          client_case_text_raw: string | null
          client_case_text_resolved: string | null
          client_case_text_source: string | null
          client_id: string | null
          client_name: string | null
          client_quality_status: string | null
          due_date: string | null
          imported_at: string | null
          invoice_number: string | null
          invoice_status: string | null
          invoice_total: number | null
          practice_area: string | null
          risk_tier: string | null
          snapshot_id: string | null
          source_invoice_id: string | null
          source_row_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ar_source_rows_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "ar_source_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_source_rows_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_active_rows"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_source_rows_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_active_snapshot"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_source_rows_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_freshness_guard"
            referencedColumns: ["feeding_snapshot_id"]
          },
          {
            foreignKeyName: "ar_source_rows_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_invoice_client_map_current"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_source_rows_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_purpose_classified_v1"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_source_rows_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_snapshot_series"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_ar_staleness_summary: {
        Row: {
          avg_days_aging: number | null
          avg_outstanding: number | null
          contract_status: string | null
          contracts: number | null
          staleness_bucket: string | null
          total_outstanding: number | null
        }
        Relationships: []
      }
      v_ar_understanding_scorecard: {
        Row: {
          category: string | null
          coverage_pct: number | null
          current_value: string | null
          dimension: string | null
          gap: string | null
          priority: number | null
          source_object: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          coverage_pct?: number | null
          current_value?: string | null
          dimension?: string | null
          gap?: string | null
          priority?: number | null
          source_object?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          coverage_pct?: number | null
          current_value?: string | null
          dimension?: string | null
          gap?: string | null
          priority?: number | null
          source_object?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      v_ar_vintage_cohort: {
        Row: {
          ar_outstanding: number | null
          invoices: number | null
          snapshot_date: string | null
          vintage_year: number | null
        }
        Relationships: []
      }
      v_ar_watch_health: {
        Row: {
          alerts: string | null
          delinquent_180_ar: number | null
          delinquent_180_clients: number | null
          delinquent_90_ar: number | null
          hours_since_run: number | null
          id: string | null
          lawpay_age_hours: number | null
          mycase_inv_age_hours: number | null
          mycase_txn_age_hours: number | null
          prior_month_lawpay_gap: number | null
          ran_at: string | null
          stalled_plan_ar: number | null
          status: string | null
        }
        Relationships: []
      }
      v_ar_waterfall: {
        Row: {
          additions: number | null
          beginning: number | null
          ending: number | null
          lawpay_card_cash: number | null
          mycase_cash_all_methods: number | null
          period_date: string | null
          prior_date: string | null
          reductions: number | null
        }
        Relationships: []
      }
      v_attribution_health: {
        Row: {
          month: string | null
          pct_amt_to_client: number | null
          pct_txns_to_client: number | null
          pct_txns_to_contract: number | null
          settled_amt: number | null
          settled_txns: number | null
        }
        Relationships: []
      }
      v_autopay_stop_cohorts: {
        Row: {
          anchor_as_of: string | null
          anchor_snapshot_id: string | null
          autopay_status: string | null
          clean_stop: boolean | null
          client_name_sample: string | null
          cohort: string | null
          days_overdue: number | null
          has_failed_draft: boolean | null
          last_failed: string | null
          last_success: string | null
          matched_client_id_sample: string | null
          motion: string | null
          n_failed: number | null
          n_success: number | null
          name_key: string | null
          open_balance: number | null
          plan_overdue_amount: number | null
        }
        Relationships: []
      }
      v_bank_deposit_3way: {
        Row: {
          bank_affinipay: number | null
          bank_all_deposits: number | null
          bank_non_affinipay: number | null
          deposit_count: number | null
          is_partial: boolean | null
          is_prehistory: boolean | null
          lawpay_all_methods: number | null
          lawpay_card_settled: number | null
          mo: string | null
          month_label: string | null
          qbo_sales: number | null
          status_bank_vs_lawpay: string | null
          status_qbo_vs_bank: string | null
          var_bank_vs_lawpay: number | null
          var_qbo_vs_bankaffinipay: number | null
          var_qbo_vs_lawpay: number | null
        }
        Relationships: []
      }
      v_behind_plan_worklist: {
        Row: {
          amount_due: number | null
          autopay: boolean | null
          best_phone: string | null
          client_name: string | null
          client_number: string | null
          days_since_call: number | null
          installments_paid: number | null
          invoice_number: string | null
          last_call_date: string | null
          last_call_outcome: string | null
          last_payment_date: string | null
          months_behind: number | null
          motion: string | null
          next_amount: number | null
          next_due_date: string | null
          over_20k: boolean | null
          recently_called: boolean | null
          total_installments: number | null
        }
        Relationships: []
      }
      v_card_expiration_segment: {
        Row: {
          amount_due: number | null
          card_brand: string | null
          card_exp_end: string | null
          card_last_four: string | null
          client_id: string | null
          email: string | null
          lc_collection_motion: string | null
        }
        Relationships: []
      }
      v_card_recovery_cure_gate_0630: {
        Row: {
          book_absence_is_artifact: boolean | null
          book_cured: boolean | null
          book_open_bal: number | null
          client_name: string | null
          client_number: string | null
          cohort_amt: number | null
          days_behind: number | null
          email: string | null
          evict_cured: boolean | null
          next_due: string | null
          plan_amount_due: number | null
          plan_autopay: boolean | null
          plan_cured: boolean | null
          plan_health: string | null
          plan_paid: number | null
        }
        Relationships: []
      }
      v_card_recovery_effectiveness: {
        Row: {
          at_risk_dollars: number | null
          cohort_date: string | null
          cohort_size: number | null
          emailable: number | null
          motion: string | null
          recovered_clients: number | null
          recovered_dollars: number | null
          recovery_rate_pct: number | null
        }
        Relationships: []
      }
      v_card_recovery_lanes: {
        Row: {
          client_name: string | null
          days_behind: number | null
          email: string | null
          has_recent_fail: boolean | null
          lc_amount_due: number | null
          lc_card_recovery_lane: string | null
          lc_client_number: string | null
          lc_installments_paid: number | null
          lc_next_amount: number | null
          lc_next_due_date: string | null
          lc_total_installments: number | null
          nn: string | null
        }
        Relationships: []
      }
      v_card_recovery_list: {
        Row: {
          amount_due: number | null
          case_name: string | null
          contact: string | null
          days_behind: number | null
          installments_paid: number | null
          invoice_number: string | null
          next_amount: number | null
          next_due: string | null
          overdue_amount: number | null
          paid: number | null
          priority: string | null
          total: number | null
          total_installments: number | null
        }
        Relationships: []
      }
      v_card_recovery_list_verified: {
        Row: {
          case_name: string | null
          contact: string | null
          days_behind: number | null
          fresh_amount_due: number | null
          fresh_status: string | null
          invoice_number: string | null
          invoice_synced_at: string | null
          next_amount: number | null
          overdue_amount: number | null
          plan_balance: number | null
          priority: string | null
        }
        Relationships: []
      }
      v_card_recovery_refund_exclusion: {
        Row: {
          client_name: string | null
          client_name_normalized: string | null
        }
        Relationships: []
      }
      v_case_type_economics: {
        Row: {
          attested_avg_collected: number | null
          attested_by: string | null
          attested_h1_2026_cases: number | null
          attested_on: string | null
          family: string | null
          is_attested_headline: boolean | null
          live_all_time_cases: number | null
          live_avg_collected_per_paying_case: number | null
          live_h1_2026_open: number | null
          live_lifetime_collected: number | null
          live_paying_cases: number | null
          pct_of_lifetime_collected: number | null
        }
        Relationships: []
      }
      v_cash_control_factor: {
        Row: {
          is_complete_month: boolean | null
          mycase_operational_total: number | null
          note: string | null
          period: string | null
          period_label: string | null
          qbo_net_cash: number | null
          scale_factor: number | null
        }
        Relationships: []
      }
      v_client_connector: {
        Row: {
          anchor_snapshot_id: string | null
          matched_client_id: string | null
          source: string | null
          source_rank: number | null
          tokenset: string | null
        }
        Relationships: []
      }
      v_client_disposition: {
        Row: {
          acts: number | null
          disposition: string | null
          engaged: boolean | null
          last_act: string | null
          last_engage: string | null
          name_key: string | null
          no_answers: number | null
          reason: string | null
        }
        Relationships: []
      }
      v_client_financial_360: {
        Row: {
          client_id: string | null
          client_name: string | null
          current_ar: number | null
          days_since_last_payment: number | null
          delinquency_status: string | null
          first_payment: string | null
          last_payment: string | null
          n_payments: number | null
          total_paid_all_time: number | null
        }
        Relationships: []
      }
      v_client_owner: {
        Row: {
          basis: string | null
          basis_date: string | null
          client_id: string | null
          name_key: string | null
          owner_collector: string | null
          sample_client_name: string | null
        }
        Relationships: []
      }
      v_client_payment_recency: {
        Row: {
          client_id: string | null
          completed_payments: number | null
          days_since_last_payment: number | null
          first_payment_date: string | null
          last_payment_date: string | null
          total_paid_observed: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_client_provisional_twin: {
        Row: {
          client_id: string | null
          is_provisional_twin: boolean | null
          twin_key: string | null
        }
        Relationships: []
      }
      v_collectable_aging: {
        Row: {
          collectable_aging_days: number | null
          last_real_payment: string | null
          name_key: string | null
        }
        Relationships: []
      }
      v_collectable_delinquency: {
        Row: {
          aging_bucket: string | null
          balance_due: number | null
          client_name: string | null
          collectable_aging_days: number | null
          is_delinquent_30d: boolean | null
          last_real_payment: string | null
          mycase_days_overdue: number | null
          name_key: string | null
        }
        Relationships: []
      }
      v_collected_canonical: {
        Row: {
          gross: number | null
          net_collected: number | null
          refund_txns: number | null
          refunds: number | null
          yr: number | null
        }
        Relationships: []
      }
      v_collection_activity_attribution_bankrule_gauge: {
        Row: {
          as_of: string | null
          name_sourced_money_dollars: number | null
          name_sourced_money_dollars_30d: number | null
          name_sourced_money_rows: number | null
          name_sourced_money_rows_30d: number | null
          reason: string | null
          status: string | null
        }
        Relationships: []
      }
      v_collection_activity_attribution_health: {
        Row: {
          as_of: string | null
          attributed_rows: number | null
          link_candidates_pending: number | null
          money_attributed: number | null
          money_dollars: number | null
          money_dollars_attributed: number | null
          money_rows: number | null
          nameless_rows: number | null
          pct_money_attributed: number | null
          pct_money_dollars_attributed: number | null
          pct_real_attributed: number | null
          real_rows: number | null
          reason: string | null
          status: string | null
        }
        Relationships: []
      }
      v_collection_activity_attribution_money_health: {
        Row: {
          as_of: string | null
          base_status: string | null
          link_candidates_pending_30d: number | null
          money_attributed_rows_30d: number | null
          money_dollars_30d: number | null
          money_dollars_attributed_30d: number | null
          money_rows_30d: number | null
          pct_money_dollars_attributed_30d: number | null
          pct_money_rows_attributed_30d: number | null
          reason: string | null
          unlinked_money_dollars_30d: number | null
          window_days: number | null
        }
        Relationships: []
      }
      v_collection_activity_attribution_money_stock: {
        Row: {
          aged_over_30d_dollars: number | null
          aged_over_30d_rows: number | null
          aged_over_90d_dollars: number | null
          aged_over_90d_rows: number | null
          as_of: string | null
          money_orphaned_from_candidate_views: number | null
          oldest_unlinked_date: string | null
          reason: string | null
          status: string | null
          unlinked_money_dollars_alltime: number | null
          unlinked_money_rows_alltime: number | null
        }
        Relationships: []
      }
      v_collection_activity_lawpay_link_candidates: {
        Row: {
          activity_date: string | null
          activity_id: string | null
          client_name: string | null
          collected_amount: number | null
          collector: string | null
          disposition: string | null
          identity_status: string | null
          invnum_client_id: string | null
          invoice_client_id: string | null
          invoice_internal_id: string | null
          is_conflict: boolean | null
          lawpay_amount: number | null
          lawpay_client_id: string | null
          lawpay_id: string | null
          lawpay_match_confidence: string | null
          lawpay_payment_date: string | null
          link_method: string | null
          origin: string | null
          resolution_path: string | null
          resolved_client_id: string | null
          resolved_client_name: string | null
          transaction_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["lawpay_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["lawpay_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["lawpay_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["lawpay_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["lawpay_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["lawpay_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["lawpay_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["lawpay_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["lawpay_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["lawpay_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["lawpay_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["lawpay_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["invoice_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["invoice_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["invoice_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["invoice_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["invoice_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["invoice_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["invoice_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["invoice_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["invoice_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["invoice_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["invoice_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_client_id_fkey"
            columns: ["invoice_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_collection_activity_link_candidates: {
        Row: {
          activity_date: string | null
          activity_id: string | null
          client_name: string | null
          collector: string | null
          match_count: number | null
          match_type: string | null
          name_key: string | null
          resolved_client_id: string | null
          resolved_client_name: string | null
        }
        Relationships: []
      }
      v_collection_activity_link_drift: {
        Row: {
          activity_id: string | null
          collected_amount: number | null
          current_client_id: string | null
          current_method: string | null
          det_client_id: string | null
          is_drift: boolean | null
          transaction_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["current_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["current_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["current_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["current_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["current_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["current_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["current_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["current_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["current_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["current_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["current_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["current_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_collection_activity_link_proposals: {
        Row: {
          activity_date: string | null
          activity_id: string | null
          classification: string | null
          client_name: string | null
          collected_amount: number | null
          collector: string | null
          money_row: boolean | null
          origin: string | null
          person_like: boolean | null
          proposed_client_id: string | null
          resolve_method: string | null
          transaction_id: string | null
        }
        Relationships: []
      }
      v_collection_activity_link_review: {
        Row: {
          activity_rows: number | null
          candidate_clients: number | null
          client_name: string | null
          collectors: string[] | null
          first_seen: string | null
          last_seen: string | null
          match_type: string | null
          name_key: string | null
        }
        Relationships: []
      }
      v_collection_activity_link_subset: {
        Row: {
          activity_id: string | null
          resolved_client_id: string | null
        }
        Relationships: []
      }
      v_collection_contact_trend: {
        Row: {
          collected_amount: number | null
          cumulative_clients_ever_contacted: number | null
          cumulative_contact_rate_pct: number | null
          payment_calls: number | null
          total_activities: number | null
          total_ar_clients: number | null
          total_calls: number | null
          unique_clients_called: number | null
          unique_clients_contacted: number | null
          week_start: string | null
          weekly_contact_rate_pct: number | null
        }
        Relationships: []
      }
      v_collections_by_source_monthly: {
        Row: {
          amount_operational: number | null
          basis: string | null
          is_complete_month: boolean | null
          month_operational_total: number | null
          period: string | null
          period_label: string | null
          qbo_net_cash: number | null
          qbo_scale_factor: number | null
          snapshot_quality: string | null
          source_bucket: string | null
          tolerance_band: string | null
          wave_month: boolean | null
        }
        Relationships: []
      }
      v_collections_certified_monthly: {
        Row: {
          autopay_crosscut: number | null
          basis: string | null
          delinquent_recovery: number | null
          mon: string | null
          offline_kept: number | null
          online_cash: number | null
          pct_from_delinquent: number | null
          qbo_verified: number | null
          real_cash_total: number | null
          recovery_from_180plus: number | null
          wave_month: boolean | null
        }
        Relationships: []
      }
      v_collections_queue_current: {
        Row: {
          aging_bucket: string | null
          amount_paid: number | null
          assigned_collector: string | null
          balance_due: number | null
          client_name: string | null
          contact_priority: number | null
          created_at: string | null
          days_aging: number | null
          days_since_call: number | null
          days_since_payment: number | null
          id: string | null
          invoice_total: number | null
          last_call_by: string | null
          last_call_date: string | null
          last_call_outcome: string | null
          last_payment_date: string | null
          name_norm: string | null
          payment_status: string | null
          prior_note: string | null
          rank_in_collector: number | null
          run_date: string | null
          run_id: string | null
          warmth: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_queue_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "collections_queue_runs"
            referencedColumns: ["run_id"]
          },
        ]
      }
      v_collections_true: {
        Row: {
          collections_true: number | null
          filevine_rerecord_netted: number | null
          money_in_gross: number | null
          pay_month: string | null
        }
        Relationships: []
      }
      v_collections_true_alltime: {
        Row: {
          collections_true: number | null
          filevine_rerecord_netted: number | null
          money_in_gross: number | null
        }
        Relationships: []
      }
      v_collections_worklist_live: {
        Row: {
          aging_bucket: string | null
          client_id: string | null
          client_name: string | null
          collector: string | null
          contract_status: string | null
          days_overdue: number | null
          delinquency_status: string | null
          has_balance: boolean | null
          installments_paid: number | null
          is_attributed: boolean | null
          is_overdue: boolean | null
          last_payment_date: string | null
          live_ar: number | null
          meets_6k: boolean | null
          monthly_installment: number | null
          oldest_due: string | null
          phone: string | null
          plan_pct: number | null
          post_snapshot_payments: number | null
          practice_area: string | null
          snapshot_ar: number | null
          snapshot_date: string | null
          total_installments: number | null
        }
        Relationships: []
      }
      v_collector_activity_health: {
        Row: {
          capture_status: string | null
          collector: string | null
          days_on_roster: number | null
          days_since_activity: number | null
          last_activity_date: string | null
          last_row_inserted_at: string | null
          link_pct: number | null
          real_rows_30d: number | null
          real_rows_365d: number | null
          real_rows_7d: number | null
          reason: string | null
          sheet_name: string | null
          started_at: string | null
        }
        Relationships: []
      }
      v_collector_ar_coverage: {
        Row: {
          assigned_ar: number | null
          assigned_clients: number | null
          clients_contacted_30d: number | null
          clients_contacted_7d: number | null
          clients_contacted_total: number | null
          collected_30d: number | null
          collector: string | null
          contact_coverage_30d_pct: number | null
          contact_coverage_pct: number | null
          total_collected: number | null
        }
        Relationships: []
      }
      v_collector_contact_card: {
        Row: {
          balance: number | null
          best_cell: string | null
          best_email: string | null
          best_home: string | null
          best_work: string | null
          client_id: string | null
          client_name: string | null
          contract_id: string | null
          phone_source: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_collector_validated_recovery: {
        Row: {
          activity_month: string | null
          collector: string | null
          logged_rows: number | null
          logged_usd: number | null
          match_rate_pct: number | null
          validated_usd: number | null
          validated_wide_usd: number | null
        }
        Relationships: []
      }
      v_consult_cash_lawpay: {
        Row: {
          authorized_only_cash: number | null
          authorized_only_ct: number | null
          avg_fee: number | null
          collected_cash: number | null
          consult_payments: number | null
          month: string | null
          settled_cash: number | null
          settled_ct: number | null
        }
        Relationships: []
      }
      v_consult_reconciliation: {
        Row: {
          avg_fee: number | null
          booked_minus_collected: number | null
          collected_cash: number | null
          collected_count: number | null
          consult_pct_of_qbo_sales: number | null
          hs_booked_amount: number | null
          hs_booked_count: number | null
          lawpay_webhook_gap_cash: number | null
          month: string | null
          qbo_3000_sales: number | null
        }
        Relationships: []
      }
      v_consultations_mirror_live: {
        Row: {
          amount_paid: number | null
          card_brand: string | null
          card_last_four: string | null
          email: string | null
          lawpay_payment_page_id: string | null
          lawpay_transaction_id: string | null
          payment_date: string | null
          payment_method: string | null
          phone: string | null
          potential_client_name: string | null
          raw_payload: Json | null
          rebuilt_at: string | null
          source_feed: string | null
          status: string | null
        }
        Insert: {
          amount_paid?: number | null
          card_brand?: string | null
          card_last_four?: string | null
          email?: string | null
          lawpay_payment_page_id?: never
          lawpay_transaction_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          phone?: never
          potential_client_name?: string | null
          raw_payload?: Json | null
          rebuilt_at?: never
          source_feed?: never
          status?: string | null
        }
        Update: {
          amount_paid?: number | null
          card_brand?: string | null
          card_last_four?: string | null
          email?: string | null
          lawpay_payment_page_id?: never
          lawpay_transaction_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          phone?: never
          potential_client_name?: string | null
          raw_payload?: Json | null
          rebuilt_at?: never
          source_feed?: never
          status?: string | null
        }
        Relationships: []
      }
      v_contract_collected_authoritative: {
        Row: {
          authoritative_collected: number | null
          authoritative_exceeds_value: boolean | null
          collected_final: number | null
          contract_id: string | null
          contract_value: number | null
          current_cache_collected: number | null
          delta: number | null
          has_mycase_match: boolean | null
          invoice_number: string | null
        }
        Relationships: []
      }
      v_contract_collected_fanout_safe: {
        Row: {
          authoritative_collected: number | null
          authoritative_exceeds_value: boolean | null
          collected_final: number | null
          contract_id: string | null
          contract_value: number | null
          current_cache_collected: number | null
          delta_vs_cache: number | null
          fanout_overcount: number | null
          has_mycase_match: boolean | null
          invoice_number: string | null
          naive_collected: number | null
        }
        Relationships: []
      }
      v_contract_installment_resolved: {
        Row: {
          client_id: string | null
          collected: number | null
          contract_id: string | null
          contract_value: number | null
          fee_schedule_recognized: boolean | null
          installment_source: string | null
          matched_plan: string | null
          queue_delinquency_status: string | null
          recorded_down_payment: number | null
          recorded_installment: number | null
          resolved_down_payment: number | null
          resolved_installment: number | null
          resolved_plan_months: number | null
          start_date: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_controller_ar_cashflow: {
        Row: {
          ar_created: number | null
          ar_trend: string | null
          avg_contract: number | null
          cases_3mo_avg: number | null
          collected_3mo_avg: number | null
          collection_coverage_pct: number | null
          contract_3mo_avg: number | null
          contract_value: number | null
          data_quality: string | null
          down_payments: number | null
          dp_match_pct: number | null
          dp_pct: number | null
          ending_firm_ar: number | null
          firm_ar_mom_change: number | null
          label: string | null
          net_ar_movement: number | null
          new_cases: number | null
          notes: string | null
          period: string | null
          source: string | null
          total_collected: number | null
        }
        Relationships: []
      }
      v_controller_ar_snapshot_delta: {
        Row: {
          ar_change: number | null
          ar_change_pct: number | null
          current_ar: number | null
          current_invoices: number | null
          invoice_change: number | null
          new_collections: number | null
          new_invoicing: number | null
          prev_ar: number | null
          snapshot_date: string | null
        }
        Relationships: []
      }
      v_controller_automation_clients: {
        Row: {
          client_id: string | null
          client_name: string | null
          client_number: string | null
          collected: number | null
          collector: string | null
          contract_id: string | null
          contract_status: string | null
          contract_value: number | null
          days_out: number | null
          days_since_contact: number | null
          days_since_payment: number | null
          delinquency_status: string | null
          installments_paid: number | null
          last_contact_date: string | null
          last_payment_date: string | null
          lifetime_payments: number | null
          monthly_installment: number | null
          outstanding: number | null
          practice_area: string | null
          priority_ord: number | null
          rationale: string | null
          total_installments: number | null
          trigger_type: string | null
        }
        Relationships: []
      }
      v_controller_automation_summary: {
        Row: {
          avg_days_since_payment: number | null
          avg_outstanding: number | null
          contracts: number | null
          monthly_expected: number | null
          priority_ord: number | null
          total_outstanding: number | null
          trigger_type: string | null
        }
        Relationships: []
      }
      v_controller_autopay_forecast: {
        Row: {
          avg_installment: number | null
          contract_status: string | null
          contracts: number | null
          delinquency_status: string | null
          outstanding: number | null
          total_collected: number | null
          total_monthly_expected: number | null
          total_value: number | null
          with_installment: number | null
        }
        Relationships: []
      }
      v_controller_bucket_ar_aging: {
        Row: {
          bucket_1_30: number | null
          bucket_180_plus: number | null
          bucket_31_60: number | null
          bucket_61_90: number | null
          bucket_91_180: number | null
          current_0: number | null
          invoice_count: number | null
          snapshot_date: string | null
          total_ar: number | null
        }
        Relationships: []
      }
      v_controller_bucket_collections: {
        Row: {
          activities: number | null
          avg_commission_pct: number | null
          bucket: string | null
          bucket_ord: number | null
          clients: number | null
          collected: number | null
          est_commission_earned: number | null
          month: string | null
        }
        Relationships: []
      }
      v_controller_bucket_contracts: {
        Row: {
          avg_days_out: number | null
          bucket: string | null
          bucket_ord: number | null
          contracts: number | null
          monthly_expected: number | null
          outstanding: number | null
          status: string | null
          total_collected: number | null
          total_value: number | null
        }
        Relationships: []
      }
      v_controller_collector_monthly: {
        Row: {
          activities: number | null
          collected: number | null
          collector: string | null
          dollars_per_activity: number | null
          dollars_per_client: number | null
          month: string | null
          no_contact: number | null
          payment_outcomes: number | null
          unique_clients: number | null
        }
        Relationships: []
      }
      v_controller_delinquent_exposure: {
        Row: {
          avg_days_out: number | null
          collected_via_activities: number | null
          contact_status: string | null
          contracts: number | null
          delinquency_status: string | null
          monthly_installment_expected: number | null
          outstanding: number | null
          total_activities: number | null
        }
        Relationships: []
      }
      v_controller_growth_vs_collections: {
        Row: {
          ar_direction: string | null
          down_payments_received: number | null
          month: string | null
          net_growth: number | null
          new_clients: number | null
          new_contract_value: number | null
          new_contracts: number | null
          total_collected: number | null
        }
        Relationships: []
      }
      v_controller_installment_completion: {
        Row: {
          avg_days_out: number | null
          avg_paid: number | null
          avg_total: number | null
          completion_tier: string | null
          contracts: number | null
          delinquency_status: string | null
          monthly_expected: number | null
          outstanding: number | null
          tier_ord: number | null
          total_collected: number | null
          total_value: number | null
        }
        Relationships: []
      }
      v_controller_installment_gap: {
        Row: {
          avg_gap_per_contract: number | null
          avg_plan_total: number | null
          avg_value: number | null
          contracts: number | null
          delinquency_status: string | null
          gap_status: string | null
          plan_status: string | null
          total_outstanding: number | null
          total_structural_gap: number | null
        }
        Relationships: []
      }
      v_controller_installment_maturity: {
        Row: {
          avg_installment: number | null
          avg_remaining: number | null
          contracts: number | null
          maturity_ord: number | null
          maturity_window: string | null
          monthly_flow: number | null
          total_outstanding: number | null
          total_plan_gap: number | null
          total_remaining_scheduled: number | null
        }
        Relationships: []
      }
      v_controller_installment_rate: {
        Row: {
          actual_amount: number | null
          actual_txns: number | null
          collection_rate_pct: number | null
          contracts_with_installment: number | null
          expected_amount: number | null
          gap: number | null
          month: string | null
        }
        Relationships: []
      }
      v_controller_installment_tiers: {
        Row: {
          avg_completion_pct: number | null
          avg_days_out: number | null
          contracts: number | null
          current_cnt: number | null
          delinquent_cnt: number | null
          installment_tier: string | null
          outstanding: number | null
          tier_ord: number | null
          total_monthly: number | null
        }
        Relationships: []
      }
      v_controller_monthly_collections: {
        Row: {
          auto_pay_amount: number | null
          auto_pay_txns: number | null
          avg_payment: number | null
          backfill_amount: number | null
          backfill_txns: number | null
          installment_amount: number | null
          installment_txns: number | null
          month: string | null
          total_collected: number | null
          total_txns: number | null
          unique_clients: number | null
        }
        Relationships: []
      }
      v_controller_true_ar_exposure: {
        Row: {
          active_risk_contracts: number | null
          active_risk_outstanding: number | null
          invoice_count: number | null
          migrated_fv_in_reported: number | null
          migrated_fv_invoices: number | null
          missing_fv_outstanding: number | null
          missing_fv_plans: number | null
          missing_mc_outstanding: number | null
          missing_mc_plans: number | null
          missing_plans_count: number | null
          missing_plans_outstanding: number | null
          mycase_reported: number | null
          reported_ar: number | null
          snapshot_date: string | null
          true_collectible_ar: number | null
        }
        Relationships: []
      }
      v_dedup_gate_health: {
        Row: {
          flagged_rows_total: number | null
          health: string | null
          hours_since_run: number | null
          last_drop_status: string | null
          last_run_at: string | null
          overlap_dollars_total: number | null
        }
        Relationships: []
      }
      v_eq_authorized_only: {
        Row: {
          amount: number | null
          client_id: string | null
          client_name: string | null
          description: string | null
          exception_type: string | null
          id: string | null
          lawpay_payer_name: string | null
          lawpay_status: string | null
          lawpay_transaction_id: string | null
          match_confidence: string | null
          payment_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_eq_fuzzy_match_review: {
        Row: {
          amount: number | null
          candidate_client_id: string | null
          candidate_client_name: string | null
          candidate_contract_id: string | null
          description: string | null
          exception_type: string | null
          id: string | null
          lawpay_payer_email: string | null
          lawpay_payer_name: string | null
          lawpay_transaction_id: string | null
          match_confidence: string | null
          match_reason: string | null
          payment_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["candidate_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["candidate_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["candidate_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["candidate_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["candidate_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["candidate_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["candidate_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["candidate_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["candidate_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["candidate_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["candidate_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["candidate_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["candidate_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["candidate_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["candidate_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["candidate_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["candidate_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["candidate_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["candidate_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["candidate_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["candidate_contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["candidate_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["candidate_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["candidate_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["candidate_contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["candidate_contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["candidate_contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      v_eq_missing_mycase_import: {
        Row: {
          amount: number | null
          exception_type: string | null
          extracted_invoice_digits: string | null
          id: string | null
          name_in_notes: string | null
          notes: string | null
          payment_date: string | null
          reference_number: string | null
        }
        Insert: {
          amount?: number | null
          exception_type?: never
          extracted_invoice_digits?: never
          id?: string | null
          name_in_notes?: string | null
          notes?: string | null
          payment_date?: string | null
          reference_number?: string | null
        }
        Update: {
          amount?: number | null
          exception_type?: never
          extracted_invoice_digits?: never
          id?: string | null
          name_in_notes?: string | null
          notes?: string | null
          payment_date?: string | null
          reference_number?: string | null
        }
        Relationships: []
      }
      v_eq_multi_contract_attribution: {
        Row: {
          amount: number | null
          client_id: string | null
          client_name: string | null
          contract_count: number | null
          exception_type: string | null
          notes: string | null
          payment_date: string | null
          payment_id: string | null
          payment_number: string | null
          payment_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_eq_payment_no_contract: {
        Row: {
          client_id: string | null
          client_name: string | null
          exception_type: string | null
          first_payment: string | null
          last_payment: string | null
          payment_count: number | null
          total_paid: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_eq_refund_reversal: {
        Row: {
          amount: number | null
          client_id: string | null
          client_name: string | null
          contract_client_name: string | null
          contract_id: string | null
          exception_type: string | null
          notes: string | null
          payment_date: string | null
          payment_id: string | null
          payment_number: string | null
          payment_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      v_fee_schedule_coverage: {
        Row: {
          contract_value: number | null
          defaulted_from_schedule: number | null
          open_ar: number | null
          pct_recognized: number | null
          recorded_and_recognized: number | null
          recorded_not_recognized: number | null
          total_contracts: number | null
          unresolvable: number | null
        }
        Relationships: []
      }
      v_feed_certification_health: {
        Row: {
          certified_at: string | null
          days_since_refresh: number | null
          feed: string | null
          health: string | null
          leg1_provenance: string | null
          leg2_validation: string | null
          leg3_immutability: string | null
          leg4_dedup: string | null
          leg5_reattribution: string | null
          leg6_invariants: string | null
          refresh_as_of: string | null
          verdict: string | null
        }
        Relationships: []
      }
      v_feed_freshness: {
        Row: {
          age_days: number | null
          driver: string | null
          evaluated_at: string | null
          feed: string | null
          freshness_col: string | null
          is_red: boolean | null
          max_as_of: string | null
          max_load_at: string | null
          source_table: string | null
          status: string | null
          threshold_label: string | null
        }
        Relationships: []
      }
      v_filevine_ar_gap: {
        Row: {
          amount_paid: number | null
          amount_receivable: number | null
          case_number: string | null
          case_text: string | null
          classification: string | null
          client_name: string | null
          due_date: string | null
          invoice_total: number | null
          source_invoice: string | null
          status: string | null
        }
        Relationships: []
      }
      v_filevine_txn_attributed: {
        Row: {
          amount_applied: number | null
          client_id: string | null
          id: number | null
          invoice_number: string | null
          is_unmigrated: boolean | null
          match_method: string | null
          name_key: string | null
          nk: string | null
          payment_id: string | null
          project_name: string | null
          txn_date: string | null
        }
        Relationships: []
      }
      v_fin_recon_scorecard: {
        Row: {
          coverage_pct: number | null
          current_value: string | null
          dimension: string | null
          gap: string | null
          priority: number | null
          source_object: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          coverage_pct?: number | null
          current_value?: string | null
          dimension?: string | null
          gap?: string | null
          priority?: number | null
          source_object?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          coverage_pct?: number | null
          current_value?: string | null
          dimension?: string | null
          gap?: string | null
          priority?: number | null
          source_object?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      v_financial_ledger_canonical: {
        Row: {
          amount: number | null
          attribution_method: string | null
          client_attributed: boolean | null
          client_id: string | null
          entered_by: string | null
          invoice_number: string | null
          method: string | null
          payer_email: string | null
          payer_name: string | null
          payment_date: string | null
          source: string | null
          status: string | null
          txn_id: number | null
        }
        Insert: {
          amount?: number | null
          attribution_method?: string | null
          client_attributed?: never
          client_id?: string | null
          entered_by?: string | null
          invoice_number?: string | null
          method?: string | null
          payer_email?: string | null
          payer_name?: string | null
          payment_date?: string | null
          source?: never
          status?: string | null
          txn_id?: number | null
        }
        Update: {
          amount?: number | null
          attribution_method?: string | null
          client_attributed?: never
          client_id?: string | null
          entered_by?: string | null
          invoice_number?: string | null
          method?: string | null
          payer_email?: string | null
          payer_name?: string | null
          payment_date?: string | null
          source?: never
          status?: string | null
          txn_id?: number | null
        }
        Relationships: []
      }
      v_firm_case_financials: {
        Row: {
          case_financial_status: string | null
          client_id: string | null
          client_name: string | null
          current_ar: number | null
          days_since_last_payment: number | null
          delinquency_status: string | null
          filevine_applied: number | null
          has_filevine_billing: boolean | null
          has_mycase_payments: boolean | null
          last_payment: string | null
          mycase_paid: number | null
          n_payments: number | null
        }
        Relationships: []
      }
      v_firm_financial_health: {
        Row: {
          aged_180_pct: number | null
          ar_age_days: number | null
          ar_delta_since_prev_run: number | null
          ar_net_movement: number | null
          ar_total: number | null
          as_of: string | null
          collected_pct: number | null
          dedup_anti_fanout_overdue: number | null
          delinquent_180_ar: number | null
          delinquent_180_clients: number | null
          filevine_recognition_pct: number | null
          filevine_unresolved: number | null
          genuine_hole_offspine_noar: number | null
          mom_change_pct: number | null
          notes: string | null
          recognized_clients: number | null
          recon_flags: Json | null
          recon_status: string | null
          run_at: string | null
          snapshot_vs_live_gap: number | null
        }
        Relationships: []
      }
      v_firm_financial_summary: {
        Row: {
          aged_180_pct: number | null
          ar_additions: number | null
          ar_net_movement: number | null
          ar_reductions: number | null
          ar_total: number | null
          as_of: string | null
          collected_pct: number | null
          delinquent_180_ar: number | null
          delinquent_180_clients: number | null
          filevine_billing_total: number | null
          filevine_recognition_pct: number | null
          filevine_unresolved: number | null
          live_attributed_ar: number | null
          mom_change: number | null
          mom_change_pct: number | null
          movement_period: string | null
          open_invoices: number | null
          recognized_clients: number | null
          snapshot_vs_live_gap: number | null
        }
        Relationships: []
      }
      v_hubspot_collections_segments: {
        Row: {
          ar_as_of_date: string | null
          assigned_collector: string | null
          balance_due: number | null
          client_id: string | null
          client_name: string | null
          collection_motion: string | null
          contract_id: string | null
          days_out: number | null
          days_since_payment: number | null
          delinquency_status: string | null
          delinquency_tier: string | null
          email: string | null
          has_payment_plan: boolean | null
          installments_paid: number | null
          is_delinquent: boolean | null
          is_email_reachable: boolean | null
          last_contact_date: string | null
          last_payment_date: string | null
          monthly_installment: number | null
          phone: string | null
          practice_area: string | null
          priority_ord: number | null
          total_installments: number | null
          trigger_type: string | null
        }
        Relationships: []
      }
      v_ingest_validation_health: {
        Row: {
          checks: Json | null
          control_total_actual: number | null
          control_total_diff: number | null
          control_total_expected: number | null
          days_since: number | null
          feed: string | null
          notes: string | null
          rows_in_file: number | null
          rows_loaded: number | null
          source_file: string | null
          status: string | null
          validated_at: string | null
        }
        Relationships: []
      }
      v_invoice_effective_date: {
        Row: {
          aging_ref_date: string | null
          amount: number | null
          amount_due: number | null
          amount_paid: number | null
          date_source: string | null
          days_aging: number | null
          effective_date: string | null
          id: string | null
          invoice_number: string | null
          issue_date: string | null
          status: string | null
        }
        Relationships: []
      }
      v_iolta_client_disposition: {
        Row: {
          balance: number | null
          case_stage: string | null
          check_no: string | null
          client_name: string | null
          client_token: string | null
          closed_on_filevine: string | null
          closed_on_mycase: string | null
          credit: number | null
          debit: number | null
          disposition: string | null
          reason: string | null
          refund_amount: number | null
          refund_status: string | null
          year_lists: string | null
        }
        Relationships: []
      }
      v_iolta_disposition_summary: {
        Row: {
          clients: number | null
          disposition: string | null
          total_balance: number | null
        }
        Relationships: []
      }
      v_iolta_monthly_trajectory: {
        Row: {
          cum_net: number | null
          deposits_in: number | null
          net_change: number | null
          refunds_out: number | null
          txn_count: number | null
          year_month: string | null
        }
        Relationships: []
      }
      v_iolta_recon_summary: {
        Row: {
          bank_anchor_2026_05_19: number | null
          bank_net_change_qbo_period: number | null
          gap_book_over_bank: number | null
          mycase_total: number | null
          nonzero_clients: number | null
        }
        Relationships: []
      }
      v_lawpay_complete: {
        Row: {
          amount: number | null
          lawpay_ref: string | null
          matched_client_id: string | null
          matched_contract_id: string | null
          payer_name: string | null
          payment_date: string | null
          payment_method: string | null
          source: string | null
          status: string | null
        }
        Relationships: []
      }
      v_lawpay_daily_ingest_gap: {
        Row: {
          gap_amt: number | null
          gap_pct: number | null
          ingest_status: string | null
          payment_date: string | null
          scrape_amt: number | null
          scrape_covered: boolean | null
          scrape_txns: number | null
          webhook_amt: number | null
          webhook_txns: number | null
        }
        Relationships: []
      }
      v_lawpay_ingest_gap_decomposition: {
        Row: {
          gap_class: string | null
          genuinely_missing: number | null
          lp_authorized_uncredited: number | null
          lp_completed_credited: number | null
          period: string | null
          reconciler_gap: number | null
          scrape_truth: number | null
        }
        Relationships: []
      }
      v_lawpay_ingest_gap_health: {
        Row: {
          backfill_gap_30d: number | null
          backfill_gap_alltime: number | null
          evaluated_at: string | null
          feed: string | null
          last_severe_short_day: string | null
          scrape_age_days: number | null
          scrape_horizon: string | null
          short_days_30d: number | null
          short_days_alltime: number | null
          status: string | null
          webhook_max: string | null
        }
        Relationships: []
      }
      v_lawpay_ingest_gap_monthly: {
        Row: {
          lawpay_completed: number | null
          lawpay_completed_txns: number | null
          lawpay_completed_unmatched: number | null
          lawpay_retrieval_gap: number | null
          month: string | null
          mycase_completed: number | null
          mycase_completed_txns: number | null
          mycase_offline_not_in_lawpay: number | null
          retrieval_priority: string | null
        }
        Relationships: []
      }
      v_lawpay_new_activity: {
        Row: {
          amount: number | null
          client_id: string | null
          client_name: string | null
          contract_collected: number | null
          contract_id: string | null
          contract_remaining: number | null
          contract_value: number | null
          description: string | null
          detection_status: string | null
          extracted_invoice: string | null
          payment_date: string | null
          transaction_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_lawpay_recognition: {
        Row: {
          account_type: string | null
          amount: number | null
          case_invoice_client_id: string | null
          case_invoice_resolves: boolean | null
          created_at: string | null
          description: string | null
          generic_desc: boolean | null
          has_full_payload: boolean | null
          hub_offpage_validated: boolean | null
          hubspot_consult_id: string | null
          invoice_ref: string | null
          is_authorized_only: boolean | null
          is_settled: boolean | null
          lawpay_charge_id: string | null
          lawpay_row_id: string | null
          lawpay_transaction_id: string | null
          on_consult_page: boolean | null
          payer_also_pays_invoices: boolean | null
          payment_date: string | null
          payment_page_id: string | null
          recognition: string | null
          recognition_basis: string | null
          status: string | null
        }
        Relationships: []
      }
      v_lawpay_reversal_completeness: {
        Row: {
          captured_chargebacks: number | null
          captured_refunds: number | null
          chargeback_gap: number | null
          period: string | null
          qbo_chargebacks: number | null
          qbo_refunds: number | null
          refund_gap: number | null
          status: string | null
        }
        Relationships: []
      }
      v_lawpay_reversal_matched: {
        Row: {
          amount: number | null
          invoice_number: string | null
          original_amount: number | null
          original_client_id: string | null
          original_found_in_feed: boolean | null
          original_lawpay_row_id: string | null
          original_transaction_id: string | null
          reversal_date: string | null
          reversal_id: string | null
          reversal_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["original_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["original_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["original_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["original_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["original_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["original_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["original_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["original_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["original_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["original_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["original_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_client_id_fkey"
            columns: ["original_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_lawpay_settled_cash_canonical: {
        Row: {
          canonical_settled_amt: number | null
          canonical_source: string | null
          gap_amt: number | null
          ingest_status: string | null
          payment_date: string | null
          scrape_amt: number | null
          scrape_covered: boolean | null
          webhook_amt: number | null
        }
        Relationships: []
      }
      v_lawpay_settled_cash_net: {
        Row: {
          canonical_settled_amt: number | null
          canonical_source: string | null
          net_settled_amt: number | null
          payment_date: string | null
          reversal_amt: number | null
        }
        Relationships: []
      }
      v_lawpay_settlement_batch_client: {
        Row: {
          amount: number | null
          client_id: string | null
          n_txn: number | null
          rail: string | null
          resolution_status: string | null
          settlement_batch_date: string | null
        }
        Relationships: []
      }
      v_lawpay_settlement_client: {
        Row: {
          amount: number | null
          bankrule_basis: string | null
          client_id: string | null
          invoice_ref: string | null
          lawpay_charge_id: string | null
          lawpay_row_id: string | null
          lawpay_transaction_id: string | null
          payment_page_id: string | null
          rail: string | null
          recognition: string | null
          recognition_basis: string | null
          resolution_status: string | null
          settlement_batch_date: string | null
          txn_date: string | null
        }
        Relationships: []
      }
      v_ledger_txn_typed: {
        Row: {
          amount: number | null
          anchor_snapshot_id: string | null
          client_attributed: boolean | null
          client_id: string | null
          collection_activity_id: string | null
          invoice_number: string | null
          is_collections_recovery: boolean | null
          method: string | null
          payment_date: string | null
          resolved_contract_id: string | null
          source: string | null
          txn_id: number | null
          txn_type: string | null
          typing_basis: string | null
          typing_confidence: number | null
          underlying_purpose: string | null
        }
        Relationships: []
      }
      v_live_ar_by_client: {
        Row: {
          aging_bucket: string | null
          ar_status: string | null
          client_id: string | null
          client_name: string | null
          days_oldest_invoice: number | null
          first_ever_payment: string | null
          first_payment_after_snapshot: string | null
          invoice_count: number | null
          invoice_statuses: string[] | null
          last_ever_payment: string | null
          latest_payment_date: string | null
          lifetime_payments: number | null
          lifetime_txn_count: number | null
          live_ar: number | null
          newest_due_date: string | null
          oldest_due_date: string | null
          post_snapshot_net: number | null
          post_snapshot_payments: number | null
          post_snapshot_refunds: number | null
          post_snapshot_txn_count: number | null
          snapshot_ar: number | null
          snapshot_date: string | null
          total_invoiced: number | null
          total_paid_at_snapshot: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_live_ar_by_client_v2: {
        Row: {
          aging_bucket: string | null
          client_id: string | null
          client_name: string | null
          invoice_count: number | null
          is_attributed: boolean | null
          last_payment_date: string | null
          live_ar: number | null
          oldest_due: string | null
          post_snapshot_payments: number | null
          post_snapshot_refunds: number | null
          snapshot_ar: number | null
          snapshot_date: string | null
        }
        Relationships: []
      }
      v_live_ar_invoice_detail: {
        Row: {
          aging_bucket: string | null
          ar_at_snapshot: number | null
          case_name: string | null
          client_id: string | null
          client_name: string | null
          due_date: string | null
          invoice_number: string | null
          invoice_status: string | null
          invoice_total: number | null
          paid_at_snapshot: number | null
          snapshot_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_source_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_live_ar_summary: {
        Row: {
          ar_reduction: number | null
          avg_days_oldest_invoice: number | null
          client_count: number | null
          clients_active_no_recent: number | null
          clients_no_activity: number | null
          clients_paid_full: number | null
          clients_partial: number | null
          current_live_ar: number | null
          snapshot_date: string | null
          snapshot_total_ar: number | null
          total_invoices: number | null
          total_payments_since: number | null
          total_refunds_since: number | null
        }
        Relationships: []
      }
      v_live_ar_summary_v2: {
        Row: {
          attributed_ar: number | null
          clients: number | null
          live_ar: number | null
          live_payments_applied: number | null
          live_refunds_applied: number | null
          pct_attributed: number | null
          snapshot_date: string | null
          snapshot_total_ar: number | null
          unattributed_ar: number | null
        }
        Relationships: []
      }
      v_mc_h1_manual: {
        Row: {
          amount: number | null
          client_name: string | null
          fam: string | null
          id: number | null
          k: string | null
          method: string | null
          mo: string | null
          payment_date: string | null
        }
        Insert: {
          amount?: number | null
          client_name?: string | null
          fam?: never
          id?: number | null
          k?: never
          method?: string | null
          mo?: never
          payment_date?: string | null
        }
        Update: {
          amount?: number | null
          client_name?: string | null
          fam?: never
          id?: number | null
          k?: never
          method?: string | null
          mo?: never
          payment_date?: string | null
        }
        Relationships: []
      }
      v_mycase_filevine_overlap: {
        Row: {
          amount: number | null
          client_name: string | null
          client_tokenset: string | null
          invoice_number: string | null
          is_filevine_rerecord: boolean | null
          match_tier: string | null
          method: string | null
          mycase_txn_id: number | null
          payment_date: string | null
        }
        Relationships: []
      }
      v_mycase_financial_bridge: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          case_name: string | null
          case_number: string | null
          case_stage: string | null
          client_id: string | null
          collected: number | null
          collector: string | null
          contract_id: string | null
          contract_status: string | null
          contract_value: number | null
          installments_paid: number | null
          invoice_number: string | null
          invoice_status: string | null
          invoice_total: number | null
          is_closed: boolean | null
          monthly_installment: number | null
          mycase_case_id: number | null
          mycase_invoice_id: number | null
          practice_area: string | null
          total_installments: number | null
        }
        Relationships: []
      }
      v_ops_escalation_health: {
        Row: {
          ar_cleaned_amt: number | null
          ar_removed_ct: number | null
          cured: number | null
          decided_writeoff: number | null
          harvest_stale: boolean | null
          last_run: string | null
          pending: number | null
          pending_amt: number | null
          pending_pile_untouched: boolean | null
          readback_alert: boolean | null
          readback_last_run: string | null
          readback_stale: boolean | null
          readback_status: string | null
        }
        Relationships: []
      }
      v_ownership_conflicts: {
        Row: {
          balance_due: number | null
          basis: string | null
          client_name: string | null
          name_key: string | null
          queue_collector: string | null
          rightful_owner: string | null
          run_date: string | null
          status: string | null
        }
        Relationships: []
      }
      v_payment_plan_adherence: {
        Row: {
          adherence: string | null
          amount_due: number | null
          autopay: boolean | null
          case_name: string | null
          last_payment_date: string | null
          matched_contract_id: string | null
          next_amount: number | null
          next_due_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_payment_plans_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      v_payment_plan_freshness: {
        Row: {
          days_old: number | null
          is_stale: boolean | null
          plan_count: number | null
          plans_as_of: string | null
          total_due: number | null
        }
        Relationships: []
      }
      v_payment_plan_txn_scoped: {
        Row: {
          amount: number | null
          client_name: string | null
          expected_installment: number | null
          is_filevine_rerecord: boolean | null
          is_plan_installment: boolean | null
          method: string | null
          pay_month: string | null
          pay_period: string | null
          payment_date: string | null
          plan_linked: boolean | null
          resolved_contract_id: string | null
          status: string | null
          status_class: string | null
          tokenset_key: string | null
          txn_class: string | null
          txn_id: number | null
        }
        Relationships: []
      }
      v_pipeline_health: {
        Row: {
          cadence: string | null
          collectors_needing_attention: number | null
          hours_since_run: number | null
          is_stale: boolean | null
          last_run_at: string | null
          last_status: string | null
          latest_activity_date: string | null
          overall_status: string | null
          pipeline: string | null
          rows_inserted: number | null
          rows_linked: number | null
        }
        Relationships: []
      }
      v_promise_to_pay_tracker: {
        Row: {
          aging_bucket: string | null
          client_id: string | null
          client_name: string | null
          days_until_due: number | null
          last_call_by: string | null
          last_call_date: string | null
          last_payment_amount: number | null
          last_payment_date: string | null
          live_ar: number | null
          name_norm: string | null
          promise_date: string | null
          promised_to_collector: string | null
          ptp_date: string | null
          ptp_status: string | null
          window_hint: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "collection_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_qbo_account_health: {
        Row: {
          accounts_present: number | null
          age_days: number | null
          ar_aging_zero_attested: boolean | null
          bank_accounts: number | null
          bank_feed_supplied: boolean | null
          captured_at: string | null
          health: string | null
          health_reason: string | null
          pulled_at: string | null
          total_bank_cash: number | null
          total_cc_liability: number | null
          total_unreconciled: number | null
        }
        Relationships: []
      }
      v_qbo_account_reconciliation: {
        Row: {
          abs_delta: number | null
          account_type: string | null
          bank_balance: number | null
          delta: number | null
          likely_cause: string | null
          material_gap: boolean | null
          name: string | null
          number: string | null
          pulled_at: string | null
          quickbooks_balance: number | null
          status: string | null
        }
        Relationships: []
      }
      v_qbo_bank_deposit_health: {
        Row: {
          affinipay_total: number | null
          all_deposit_total: number | null
          captured_at: string | null
          deposits_present: number | null
          health_status: string | null
          interior_bank_vs_lawpay_pct: number | null
          latest_deposit: string | null
          notes: string | null
        }
        Relationships: []
      }
      v_qbo_cash_monthly_t12: {
        Row: {
          bank_deposits_total: number | null
          bank_verified: boolean | null
          basis: string | null
          basis_note: string | null
          categorization_residual: number | null
          completeness_variance_pct: number | null
          is_complete_month: boolean | null
          lawpay_settled_3mo: number | null
          leakage_amt: number | null
          leakage_pct: number | null
          maturity_months: number | null
          net_cash: number | null
          period: string | null
          period_label: string | null
          provisional: boolean | null
          refunds: number | null
          sales_gross: number | null
          transfers_in: number | null
        }
        Relationships: []
      }
      v_qbo_income_tie: {
        Row: {
          bridge_identity_check: number | null
          feed_gap: number | null
          feed_gap_status: string | null
          is_partial_current_month: boolean | null
          lawpay_coverage_pct_diagnostic_only: number | null
          lawpay_max_date: string | null
          mc_autopay: number | null
          mc_echeck: number | null
          method_blind_offline: number | null
          mo: string | null
          mycase_completed_card_electronic: number | null
          mycase_max_date: string | null
          mycase_money_in_gross: number | null
          offline_filevine_rerecord: number | null
          offline_true_cash_check: number | null
          qbo_chargebacks_5101: number | null
          qbo_income_net: number | null
          qbo_income_pending: boolean | null
          qbo_max_income_period: string | null
          qbo_refunds_3100: number | null
          qbo_sales_3000: number | null
          recog_case: number | null
          recog_consult: number | null
          recog_coverage_pct: number | null
          recog_lawpay_settled: number | null
          recog_review: number | null
          recognition_quarantine: number | null
          residual_filevine_component: number | null
          residual_pct: number | null
          reversal_chargeback_gap: number | null
          reversal_refund_gap: number | null
          rhs_partition_check: number | null
          timing_basis_gap: number | null
          timing_basis_residual: number | null
          timing_basis_residual_ex_filevine: number | null
          ym: string | null
        }
        Relationships: []
      }
      v_qbo_income_tie_guard: {
        Row: {
          anchor_single_counted_h1: boolean | null
          cert_status: string | null
          certifiable_grain: string | null
          cleanup_applied_mycase_side: number | null
          closed_months: number | null
          filevine_andback_excluded_not_bridge_input: number | null
          firm_income_anchor: string | null
          first_closed_month: string | null
          last_closed_month: string | null
          lawpay_coverage_pct_diagnostic_only: number | null
          lawpay_recog_sum: number | null
          max_monthly_residual_pct: number | null
          monthly_offline_do_not_ship: boolean | null
          mycase_anchor_tie_pct_h1: number | null
          mycase_money_in_sum: number | null
          offline_cash_fv_affiliated_sum: number | null
          per_transaction_certifiable: boolean | null
          qbo_income_sum: number | null
          tolerance_pct: number | null
          window_residual_h1: number | null
        }
        Relationships: []
      }
      v_qbo_income_tie_health: {
        Row: {
          cert_status: string | null
          closed_months: number | null
          expected_last_closed_month: string | null
          filevine_sum: number | null
          first_closed_month: string | null
          health_status: string | null
          last_closed_month: string | null
          lawpay_age_days: number | null
          lawpay_coverage_pct_diagnostic_only: number | null
          lawpay_recog_sum: number | null
          max_month_abs_residual_pct: number | null
          mycase_age_days: number | null
          mycase_gross_sum: number | null
          qbo_income_sum: number | null
          qbo_max_income_period: string | null
          residual_sum: number | null
          tolerance_pct: number | null
          window_residual_pct: number | null
          window_residual_pct_filevine_stress: number | null
        }
        Relationships: []
      }
      v_qbo_pnl_health: {
        Row: {
          captured_at: string | null
          control_total_status: string | null
          days_since_pull: number | null
          health: string | null
          last_validation_status: string | null
          latest_period: string | null
          net_income_ytd: number | null
          periods_present: number | null
          pulled_at: string | null
          reason: string | null
        }
        Relationships: []
      }
      v_qbo_revenue_reconciliation: {
        Row: {
          month: string | null
          mycase_cash: number | null
          mycase_unlabeled_excluded: number | null
          period: string | null
          qbo_sales: number | null
          status: string | null
          variance_pct: number | null
          variance_usd: number | null
        }
        Relationships: []
      }
      v_queue_client_contact: {
        Row: {
          any_client_id: string | null
          called_le_14d: boolean | null
          called_le_30d: boolean | null
          called_le_7d: boolean | null
          days_since_call: number | null
          days_since_payment: number | null
          last_activity_date: string | null
          last_call_by: string | null
          last_call_date: string | null
          last_call_outcome: string | null
          last_payment_amount: number | null
          last_payment_date: string | null
          name_norm: string | null
          sample_client_name: string | null
          total_activities: number | null
          total_calls: number | null
        }
        Relationships: []
      }
      v_queue_contact_coverage: {
        Row: {
          balance_due: number | null
          client_name: string | null
          collectable_aging_days: number | null
          coverage_state: string | null
          days_since_attempt: number | null
          days_since_reach: number | null
          decided_excluded: boolean | null
          decided_reason: string | null
          in_book: boolean | null
          in_queue_ssot: boolean | null
          last_attempt_date: string | null
          last_payment_date: string | null
          last_reach_date: string | null
          name_key: string | null
          owner_collector: string | null
        }
        Relationships: []
      }
      v_queue_contact_coverage_monthly: {
        Row: {
          as_of_date: string | null
          coverage_45d_pct: number | null
          coverage_basis: string | null
          covered_clients: number | null
          delinquent_clients: number | null
          month: string | null
          overdue_ar: number | null
          paid_clients: number | null
          reach_45d_pct: number | null
          reached_clients: number | null
        }
        Relationships: []
      }
      v_queue_coverage_health: {
        Row: {
          computed_at: string | null
          covered_in_tab: number | null
          nc_closed_w_balance: number | null
          nc_collector_closed: number | null
          nc_park_remove: number | null
          not_covered_bal: number | null
          not_covered_pre_decision: number | null
          run_id: string | null
          spine_bal: number | null
          spine_total: number | null
          status: string | null
          threshold: number | null
          workable_omitted: number | null
          workable_omitted_bal: number | null
        }
        Relationships: []
      }
      v_queue_coverage_monthly_health: {
        Row: {
          last_refresh: string | null
          month_rows: number | null
          staleness: string | null
          status: string | null
        }
        Relationships: []
      }
      v_queue_system_health: {
        Row: {
          activities_last_7d: number | null
          built_at: string | null
          collectors: number | null
          last_activity: string | null
          moves: number | null
          owned_pinned: number | null
          owner_overflow: number | null
          ownership_conflicts: number | null
          ownership_matches: number | null
          pending_review: boolean | null
          pool_coverage: number | null
          queue_age_days: number | null
          removed: number | null
          review_built_at: string | null
          rows: number | null
          run_date: string | null
          source: string | null
          status: string | null
          worked_locked: number | null
        }
        Relationships: []
      }
      v_queue_system_patches_current: {
        Row: {
          affected_objects: string[] | null
          applied_at: string | null
          change_summary: string | null
          code_sha256: string | null
          component: string | null
          config_sha256: string | null
          detected_at: string | null
          implementation: Json | null
          issue: string | null
          patch_key: string | null
          queue_run_id: string | null
          root_cause: string | null
          status: string | null
          supersedes_patch_key: string | null
          updated_at: string | null
          verification: Json | null
          verified_at: string | null
        }
        Insert: {
          affected_objects?: string[] | null
          applied_at?: string | null
          change_summary?: string | null
          code_sha256?: string | null
          component?: string | null
          config_sha256?: string | null
          detected_at?: string | null
          implementation?: Json | null
          issue?: string | null
          patch_key?: string | null
          queue_run_id?: string | null
          root_cause?: string | null
          status?: string | null
          supersedes_patch_key?: string | null
          updated_at?: string | null
          verification?: Json | null
          verified_at?: string | null
        }
        Update: {
          affected_objects?: string[] | null
          applied_at?: string | null
          change_summary?: string | null
          code_sha256?: string | null
          component?: string | null
          config_sha256?: string | null
          detected_at?: string | null
          implementation?: Json | null
          issue?: string | null
          patch_key?: string | null
          queue_run_id?: string | null
          root_cause?: string | null
          status?: string | null
          supersedes_patch_key?: string | null
          updated_at?: string | null
          verification?: Json | null
          verified_at?: string | null
        }
        Relationships: []
      }
      v_recommendations_preview: {
        Row: {
          ar_balance_due: number | null
          ar_invoice_count: number | null
          auto_apply_eligible: boolean | null
          client_id: string | null
          client_name: string | null
          current_status: string | null
          evidence_summary: Json | null
          recommendation_category: string | null
          recommended_status: string | null
        }
        Relationships: []
      }
      v_retention_engine_health: {
        Row: {
          adherence_delta_vs_prior: number | null
          adherence_pct: number | null
          alert: string | null
          captured_at: string | null
          cure_to_90: number | null
          plan_data_age: string | null
          plan_data_synced_at: string | null
          status: string | null
          target_pct: number | null
        }
        Relationships: []
      }
      v_retention_goal_scorecard: {
        Row: {
          adherence_pct: number | null
          collected_to_date: number | null
          due_by_now: number | null
          overdue_now: number | null
          overdue_to_cure_for_90: number | null
          target_pct: number | null
        }
        Relationships: []
      }
      v_revenue_reconciliation: {
        Row: {
          month: string | null
          outside_webhook: number | null
          payments_coverage_pct: number | null
          payments_total: number | null
          payments_txns: number | null
          qbo_sales: number | null
          unattributed: number | null
          webhook_coverage_pct: number | null
          webhook_total: number | null
          webhook_txns: number | null
        }
        Relationships: []
      }
      v_sol_deadline_watch: {
        Row: {
          case_name: string | null
          case_number: string | null
          case_stage: string | null
          days_to_sol: number | null
          lead_attorney: string | null
          matched_client_id: string | null
          matched_contract_id: string | null
          mycase_case_id: number | null
          outstanding_balance: number | null
          practice_area: string | null
          sol_bucket: string | null
          sol_date: string | null
          status: string | null
        }
        Insert: {
          case_name?: string | null
          case_number?: string | null
          case_stage?: string | null
          days_to_sol?: never
          lead_attorney?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_case_id?: number | null
          outstanding_balance?: number | null
          practice_area?: string | null
          sol_bucket?: never
          sol_date?: string | null
          status?: string | null
        }
        Update: {
          case_name?: string | null
          case_number?: string | null
          case_stage?: string | null
          days_to_sol?: never
          lead_attorney?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_case_id?: number | null
          outstanding_balance?: number | null
          practice_area?: string | null
          sol_bucket?: never
          sol_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_card_expiration_segment"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_financial_360"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_client_provisional_twin"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_firm_case_financials"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_gap_contracts"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_payment_staleness"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_collector_contact_card"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_authoritative"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_collected_fanout_safe"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_controller_automation_clients"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_hubspot_collections_segments"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_lawpay_new_activity"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      v_source_feed_freshness: {
        Row: {
          age_days: number | null
          driver: string | null
          feed: string | null
          last_landed: string | null
          verdict: string | null
        }
        Relationships: []
      }
      v_tag_harvest_health: {
        Row: {
          age: string | null
          alert: boolean | null
          check_status: string | null
          days_since_check: number | null
          detail: string | null
          exclusion_marks_captured: number | null
          exclusion_marks_total: number | null
          exclusion_marks_uncaptured: number | null
          health: string | null
          last_check: string | null
          off_cycle_gap: number | null
          team_files: number | null
        }
        Relationships: []
      }
      v_true_ar_kpi: {
        Row: {
          confirmed_true_ar: number | null
          filevine_gap_ar: number | null
          filevine_gap_count: number | null
          gap_confirmed_ar: number | null
          gap_confirmed_count: number | null
          gap_unconfirmed_ar: number | null
          gap_unconfirmed_count: number | null
          last_snapshot_date: string | null
          last_snapshot_file: string | null
          max_true_ar: number | null
          pdf_ar: number | null
          pdf_invoice_count: number | null
        }
        Relationships: []
      }
      v_txn_attribution: {
        Row: {
          ambiguous: boolean | null
          amount: number | null
          anchor_as_of: string | null
          anchor_snapshot_id: string | null
          client_name: string | null
          client_name_normalized: string | null
          invoice_key: string | null
          invoice_number: string | null
          is_filevine_rerecord: boolean | null
          method: string | null
          payment_date: string | null
          resolution_confidence: number | null
          resolution_method: string | null
          resolved_client_id: string | null
          resolved_contract_id: string | null
          status: string | null
          txn_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["anchor_snapshot_id"]
            isOneToOne: false
            referencedRelation: "ar_source_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["anchor_snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_active_rows"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["anchor_snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_active_snapshot"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["anchor_snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_freshness_guard"
            referencedColumns: ["feeding_snapshot_id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["anchor_snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_invoice_client_map_current"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["anchor_snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_purpose_classified_v1"
            referencedColumns: ["snapshot_id"]
          },
          {
            foreignKeyName: "ar_anchor_snapshot_snapshot_id_fkey"
            columns: ["anchor_snapshot_id"]
            isOneToOne: false
            referencedRelation: "v_ar_snapshot_series"
            referencedColumns: ["snapshot_id"]
          },
        ]
      }
      v_txn_collections_recovery_xwalk: {
        Row: {
          collection_activity_id: string | null
          match_basis: string | null
          n_activities: number | null
          txn_id: number | null
        }
        Relationships: []
      }
      v_txn_type_monthly: {
        Row: {
          anchor_snapshot_id: string | null
          bank_affinipay: number | null
          bank_all_deposits: number | null
          is_partial: boolean | null
          lawpay_all_methods: number | null
          lawpay_card_settled: number | null
          mo: string | null
          month_label: string | null
          month_typed_revenue: number | null
          month_typed_total: number | null
          n: number | null
          non_revenue_deposits: number | null
          qbo_sales: number | null
          rev_vs_bank_affinipay_pct: number | null
          rev_vs_qbo_sales_pct: number | null
          txn_type: string | null
          typed_amount: number | null
        }
        Relationships: []
      }
      v_txn_typing_health: {
        Row: {
          anchor_snapshot_id: string | null
          bank_max_mo: string | null
          canonical_rows: number | null
          canonical_sum: number | null
          captured_at: string | null
          collections_pending: boolean | null
          deterministic_pct: number | null
          health_status: string | null
          ledger_age_days: number | null
          ledger_max_date: string | null
          mece_ok: boolean | null
          notes: string | null
          typed_rows: number | null
          typed_sum: number | null
          unattributed_pct: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_filevine_case_reconciliation_candidates: {
        Args: { p_limit?: number }
        Returns: {
          case_client_id: string
          case_id: string
          case_name: string
          client_id: string
          client_name: string
          contract_id: string
          contract_invoice_number: string
          filevine_project_id: string
          match_type: string
        }[]
      }
      admin_filevine_case_reconciliation_summary: {
        Args: never
        Returns: {
          cases_missing_client_link: number
          clients_missing_case_link: number
          exact_name_matches: number
          filevine_cases: number
          filevine_clients: number
          filevine_projects_without_match: number
          project_id_matches: number
          unique_filevine_projects: number
        }[]
      }
      admin_filevine_project_snapshot_summary: {
        Args: never
        Returns: {
          latest_processed_at: string
          linked_cases: number
          linked_clients: number
          linked_projects: number
          total_projects: number
          unmatched_projects: number
        }[]
      }
      admin_filevine_reconciliation_summary: {
        Args: never
        Returns: {
          last_cursor: string
          last_success_at: string
          latest_filevine_payment_date: string
          latest_linked_payment_date: string
          linked_payment_amount: number
          linked_payment_rows: number
          matched_events: number
          matched_filevine_amount: number
          total_events: number
          total_filevine_amount: number
          unmatched_events: number
          unmatched_filevine_amount: number
        }[]
      }
      admin_get_system_settings: {
        Args: never
        Returns: {
          collections_notice: string | null
          created_at: string
          id: number
          legal_notice: string | null
          privacy_warning: string | null
          security_notice: string | null
          support_email: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "system_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_lawpay_reconciliation_summary: {
        Args: never
        Returns: {
          latest_payment_date: string
          latest_transaction_date: string
          linked_payment_amount: number
          linked_payment_rows: number
          matched_lawpay_amount: number
          matched_transactions: number
          total_lawpay_amount: number
          total_transactions: number
          unmatched_lawpay_amount: number
          unmatched_transactions: number
          unresolved_validation_difference: number
          unresolved_validation_issues: number
        }[]
      }
      admin_list_user_access: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_sign_in_at: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      admin_log_user_access_event: {
        Args: {
          p_action: string
          p_new_data?: Json
          p_old_data?: Json
          p_record_id: string
        }
        Returns: undefined
      }
      admin_rematch_unmatched_lawpay: {
        Args: { p_max?: number }
        Returns: {
          client: string
          contract_id: string
          lawpay_transaction_id: string
          result: string
        }[]
      }
      admin_update_system_settings: {
        Args: {
          p_collections_notice: string
          p_legal_notice: string
          p_privacy_warning: string
          p_security_notice: string
          p_support_email: string
        }
        Returns: {
          collections_notice: string | null
          created_at: string
          id: number
          legal_notice: string | null
          privacy_warning: string | null
          security_notice: string | null
          support_email: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "system_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_update_user_access: {
        Args: {
          p_full_name?: string
          p_is_active: boolean
          p_role: Database["public"]["Enums"]["user_role"]
          p_user_id: string
        }
        Returns: {
          avatar_url: string | null
          bar_number: string | null
          created_at: string
          default_hourly_rate: number | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
          timekeeper_type: Database["public"]["Enums"]["timekeeper_type"] | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_recommendations: {
        Args: {
          p_actor?: string
          p_dry_run?: boolean
          p_expected_count?: number
          p_notes?: string
          p_override_count_check?: boolean
          p_run_id: string
        }
        Returns: {
          action: string
          audit_log_id: string
          client_id: string
          client_name: string
          new_quality_reviewed_at: string
          new_reason: string
          new_status: string
          old_quality_reviewed_at: string
          old_reason: string
          old_status: string
          reason_skipped: string
          recommendation_id: string
        }[]
      }
      call_lawpay_orchestrator: {
        Args: { p_payload: Json }
        Returns: undefined
      }
      call_mycase_sync: { Args: { p_payload: Json }; Returns: undefined }
      capture_ar_live_trend: { Args: never; Returns: undefined }
      capture_monthly_ar_snapshot: {
        Args: { p_month?: string }
        Returns: string
      }
      certify_anchor: {
        Args: { p_by?: string }
        Returns: {
          anchor_content_md5: string
          ar_total: number
          certified_at: string
          certified_by: string
          content_md5_matches: boolean
          id: string
          inv_closure: string
          inv_one_delinquency: string
          inv_subset: string
          inv_subset_detail: Json | null
          inv_tie_out: string
          notes: string | null
          recomputed_content_md5: string
          section_c_abs_delta: number | null
          section_c_behind_plan_balance: number | null
          section_c_overdue_ar: number | null
          section_c_pass: boolean | null
          snapshot_date: string
          snapshot_id: string
          source_row_count: number
          source_rows_ar_sum: number
          status: string
          ties_to_source: boolean
        }
        SetofOptions: {
          from: "*"
          to: "ar_snapshot_certification"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      extract_case_number_from_text: {
        Args: { value: string }
        Returns: string
      }
      fn_post_ingest_reattribute: {
        Args: { p_dry_run?: boolean; p_feed: string }
        Returns: Json
      }
      fn_tokenkey: { Args: { p: string }; Returns: string }
      get_aging_summary: {
        Args: never
        Returns: {
          aging_bucket: string
          invoice_count: number
          total_amount: number
        }[]
      }
      get_classified_monthly_collections: {
        Args: { months_back?: number }
        Returns: {
          current_count: number
          current_total: number
          delinquent_count: number
          delinquent_total: number
          month: string
          unknown_count: number
          unknown_total: number
        }[]
      }
      get_legal_kpi: { Args: { p_year?: number }; Returns: Json }
      get_transaction_type_breakdown: {
        Args: { p_date_from?: string; p_date_to?: string }
        Returns: {
          payment_type: string
          row_count: number
          total: number
        }[]
      }
      get_transactions_page: {
        Args: {
          p_date_from?: string
          p_date_to?: string
          p_from?: number
          p_limit?: number
          p_method?: string
          p_search?: string
          p_type?: string
        }
        Returns: {
          amount: number
          case_number: string
          client_id: string
          client_name: string
          collector_name: string
          contract_collector: string
          id: string
          payment_date: string
          payment_method: string
          payment_number: string
          payment_type: string
          reference_number: string
          total_count: number
        }[]
      }
      hubspot_stage_to_delinquency: {
        Args: { stage_id: string }
        Returns: string
      }
      is_active_user: { Args: never; Returns: boolean }
      lawpay_match_client: {
        Args: { p_invoice_ref?: string; p_payor_name: string }
        Returns: {
          match_confidence: string
          matched_client_id: string
          matched_contract_id: string
          similarity_score: number
        }[]
      }
      link_collection_activities_to_clients: {
        Args: never
        Returns: {
          linked_count: number
          tier: string
        }[]
      }
      log_motions: {
        Args: { p_by?: string }
        Returns: {
          rows_logged: number
          snapshot_date: string
          snapshot_id: string
        }[]
      }
      mark_overdue_invoices: { Args: never; Returns: number }
      match_contract_by_normalized_name: {
        Args: {
          p_active_only?: boolean
          p_amount?: number
          p_min_similarity?: number
          p_name: string
        }
        Returns: {
          client: string
          client_id: string
          collected: number
          id: string
          similarity: number
          status: string
          value: number
        }[]
      }
      match_hubspot_deals: {
        Args: {
          p_apply?: boolean
          p_name_floor?: number
          p_name_strong_match?: number
          p_name_threshold?: number
        }
        Returns: {
          evaluated: number
          flagged_review: number
          matched_secure: number
          unmatched: number
        }[]
      }
      materialize_recommendations: {
        Args: { p_notes?: string; p_triggered_by?: string }
        Returns: string
      }
      merge_duplicate_clients: {
        Args: {
          p_duplicate_id: string
          p_reason?: string
          p_survivor_id: string
        }
        Returns: undefined
      }
      merge_duplicate_clients_round2: {
        Args: { p_dry_run?: boolean }
        Returns: {
          activities_reassigned: number
          client_name: string
          contracts_reassigned: number
          duplicates_merged: number
          payments_reassigned: number
        }[]
      }
      merge_exact_duplicate_clients: {
        Args: { p_dry_run?: boolean }
        Returns: {
          action: string
          case_number: string
          duplicate_client_id: string
          duplicate_client_number: string
          duplicate_link_count: number
          normalized_name: string
          survivor_client_id: string
          survivor_client_number: string
        }[]
      }
      normalize_case_stage: { Args: { raw_stage: string }; Returns: string }
      normalize_client_name: { Args: { raw: string }; Returns: string }
      normalize_collection_name: { Args: { raw: string }; Returns: string }
      normalize_collector_client_name: {
        Args: { value: string }
        Returns: string
      }
      normalize_invoice_no: { Args: { p: string }; Returns: string }
      normalize_name_key: { Args: { raw_name: string }; Returns: string }
      normalize_name_tokenset: { Args: { value: string }; Returns: string }
      normalize_practice_area: { Args: { raw_area: string }; Returns: string }
      promote_anchor: {
        Args: { p_by?: string; p_snapshot_id: string }
        Returns: {
          content_md5: string | null
          pinned_at: string
          pinned_by: string
          row_count: number
          singleton_id: number
          snapshot_date: string
          snapshot_id: string
          total_ar_dollars: number
        }
        SetofOptions: {
          from: "*"
          to: "ar_anchor_snapshot"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      promote_hubspot_case_won_deal: {
        Args: {
          p_contact_email?: string
          p_contact_firstname?: string
          p_contact_lastname?: string
          p_contact_phone?: string
          p_dealname: string
          p_hubspot_deal_id: string
        }
        Returns: Json
      }
      rebuild_mycase_links: { Args: { p_dry_run?: boolean }; Returns: Json }
      recheck_collection_activity_link_drift: {
        Args: { p_dry_run?: boolean; p_run_id?: string }
        Returns: {
          repaired: number
          run_id: string
        }[]
      }
      refresh_after_import: { Args: never; Returns: Json }
      refresh_ar_cashflow: { Args: { target_month?: string }; Returns: Json }
      refresh_client_quality_classification: {
        Args: never
        Returns: {
          client_quality_status: string
          clients_updated: number
          excluded_from_collections: boolean
        }[]
      }
      refresh_collection_activity_attribution_heartbeat: {
        Args: never
        Returns: Json
      }
      refresh_collector_assignments: {
        Args: { p_client_id?: string; p_dry_run?: boolean }
        Returns: {
          action: string
          assigned_collector: string
          assignment_score: number
          client_id: string
          client_name: string
          collected_total: number
          contact_count: number
          last_contact: string
          positive_count: number
          previous_collector: string
        }[]
      }
      refresh_lawpay_ingest_gap_heartbeat: { Args: never; Returns: undefined }
      refresh_payments_clean_mv: { Args: never; Returns: undefined }
      refresh_qbo_income_tie_heartbeat: { Args: never; Returns: undefined }
      refresh_queue_coverage_monthly: { Args: never; Returns: undefined }
      refresh_retention_heartbeat: { Args: never; Returns: undefined }
      rematch_invoice_payments: {
        Args: { p_dry_run?: boolean }
        Returns: {
          rematched_count: number
        }[]
      }
      rematch_lawpay_attribution: {
        Args: { p_dry_run?: boolean }
        Returns: Json
      }
      rematch_upgrade_mycase_invoice: {
        Args: { p_dry_run?: boolean }
        Returns: {
          upgraded_count: number
        }[]
      }
      resolve_collection_activity_links: {
        Args: { p_dry_run?: boolean }
        Returns: {
          linked: number
          still_unresolved: number
        }[]
      }
      resolve_collection_activity_links_deterministic: {
        Args: { p_dry_run?: boolean; p_run_id?: string }
        Returns: {
          linked: number
          run_id: string
        }[]
      }
      resolve_lawpay_unmatched_clients: {
        Args: never
        Returns: {
          resolved_count: number
          still_unresolved: number
        }[]
      }
      resolve_links_safely: {
        Args: never
        Returns: {
          linked: number
          still_unresolved: number
        }[]
      }
      resolve_unmatched_payment: {
        Args: { p_client_id: string; p_method?: string; p_payment_id: string }
        Returns: Json
      }
      resolve_unmatched_payments_aggressive: {
        Args: { p_dry_run?: boolean; p_limit?: number }
        Returns: {
          amount_recovered: number
          matched: number
          pass: string
          still_unmatched: number
        }[]
      }
      rollback_recommendations: {
        Args: {
          p_actor?: string
          p_dry_run?: boolean
          p_reason?: string
          p_run_id: string
        }
        Returns: {
          action: string
          audit_log_id: string
          client_id: string
          recommendation_id: string
          restored_quality_reviewed_at: string
          restored_reason: string
          restored_status: string
        }[]
      }
      set_collector_assignment_trigger: {
        Args: { p_enabled: boolean }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      suggest_unmatched_payment_matches: {
        Args: { p_payment_id: string }
        Returns: {
          amount_score: number
          best_contract_id: string
          client_id: string
          client_name: string
          confidence: number
          date_score: number
          monthly_installment: number
          name_score: number
          next_due_date: string
        }[]
      }
      tier25_match: {
        Args: {
          p_dry_run?: boolean
          p_include_trgm?: boolean
          p_since?: string
        }
        Returns: {
          action_taken: string
          amount: number
          lawpay_payer_name: string
          lt_id: string
          match_sim: number
          match_vector: string
          matched_client_id: string
          matched_client_name: string
          matched_contract_id: string
          payment_date: string
        }[]
      }
      tokenset_key: { Args: { p: string }; Returns: string }
    }
    Enums: {
      billing_type:
        | "hourly"
        | "flat_fee"
        | "contingency"
        | "retainer"
        | "hybrid"
      invoice_status:
        | "draft"
        | "review"
        | "sent"
        | "partially_paid"
        | "paid"
        | "overdue"
        | "written_off"
        | "void"
      matter_status: "active" | "pending" | "closed" | "archived"
      payment_method:
        | "check"
        | "wire"
        | "ach"
        | "credit_card"
        | "cash"
        | "trust_transfer"
        | "other"
      timekeeper_type:
        | "partner"
        | "associate"
        | "of_counsel"
        | "paralegal"
        | "legal_assistant"
      trust_transaction_type:
        | "deposit"
        | "disbursement"
        | "interest"
        | "bank_fee"
        | "transfer_in"
        | "transfer_out"
      user_role:
        | "admin"
        | "partner"
        | "attorney"
        | "paralegal"
        | "billing_clerk"
        | "read_only"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      billing_type: ["hourly", "flat_fee", "contingency", "retainer", "hybrid"],
      invoice_status: [
        "draft",
        "review",
        "sent",
        "partially_paid",
        "paid",
        "overdue",
        "written_off",
        "void",
      ],
      matter_status: ["active", "pending", "closed", "archived"],
      payment_method: [
        "check",
        "wire",
        "ach",
        "credit_card",
        "cash",
        "trust_transfer",
        "other",
      ],
      timekeeper_type: [
        "partner",
        "associate",
        "of_counsel",
        "paralegal",
        "legal_assistant",
      ],
      trust_transaction_type: [
        "deposit",
        "disbursement",
        "interest",
        "bank_fee",
        "transfer_in",
        "transfer_out",
      ],
      user_role: [
        "admin",
        "partner",
        "attorney",
        "paralegal",
        "billing_clerk",
        "read_only",
      ],
    },
  },
} as const
