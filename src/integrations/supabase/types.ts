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
      _hs_contact_staging: {
        Row: {
          email: string | null
          hs_contact_id: string | null
          phone: string | null
        }
        Insert: {
          email?: string | null
          hs_contact_id?: string | null
          phone?: string | null
        }
        Update: {
          email?: string | null
          hs_contact_id?: string | null
          phone?: string | null
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "activity_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      ar_audit_20260503: {
        Row: {
          aging_bucket: string | null
          amount_paid: number | null
          ar_balance: number | null
          client_name: string
          created_at: string
          days_overdue: number | null
          id: string
          install_amount: number | null
          invoice_total: number | null
          match_method: string | null
          matched_client_id: string | null
          matched_quality_status: string | null
          name_sim: number | null
          practice_area: string | null
          risk_tier: string | null
        }
        Insert: {
          aging_bucket?: string | null
          amount_paid?: number | null
          ar_balance?: number | null
          client_name: string
          created_at?: string
          days_overdue?: number | null
          id?: string
          install_amount?: number | null
          invoice_total?: number | null
          match_method?: string | null
          matched_client_id?: string | null
          matched_quality_status?: string | null
          name_sim?: number | null
          practice_area?: string | null
          risk_tier?: string | null
        }
        Update: {
          aging_bucket?: string | null
          amount_paid?: number | null
          ar_balance?: number | null
          client_name?: string
          created_at?: string
          days_overdue?: number | null
          id?: string
          install_amount?: number | null
          invoice_total?: number | null
          match_method?: string | null
          matched_client_id?: string | null
          matched_quality_status?: string | null
          name_sim?: number | null
          practice_area?: string | null
          risk_tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ar_audit_20260503_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "ar_audit_20260503_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "ar_audit_20260503_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ar_audit_20260503_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "ar_audit_20260503_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "ar_audit_20260503_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
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
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
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
      client_duplicate_merge_audit: {
        Row: {
          case_number: string | null
          created_at: string
          duplicate_client_id: string | null
          duplicate_client_number: string | null
          id: string
          merge_reason: string
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "collection_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
        ]
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
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "consults_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
        ]
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_orphan_recovery_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
        ]
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "contract_status_reclass_audit_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
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
      contracts_backup_20260403: {
        Row: {
          case_number: string | null
          client: string | null
          client_id: string | null
          collected: number | null
          collector: string | null
          created_at: string | null
          days_out: number | null
          delinquency_status: string | null
          down_payment: number | null
          down_payment_paid: boolean | null
          id: string
          installments_paid: number | null
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
          value: number | null
        }
        Insert: {
          case_number?: string | null
          client?: string | null
          client_id?: string | null
          collected?: number | null
          collector?: string | null
          created_at?: string | null
          days_out?: number | null
          delinquency_status?: string | null
          down_payment?: number | null
          down_payment_paid?: boolean | null
          id: string
          installments_paid?: number | null
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
          value?: number | null
        }
        Update: {
          case_number?: string | null
          client?: string | null
          client_id?: string | null
          collected?: number | null
          collector?: string | null
          created_at?: string | null
          days_out?: number | null
          delinquency_status?: string | null
          down_payment?: number | null
          down_payment_paid?: boolean | null
          id?: string
          installments_paid?: number | null
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
          value?: number | null
        }
        Relationships: []
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
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
            referencedRelation: "v_ar_preview"
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
            referencedRelation: "ar_dashboard"
            referencedColumns: ["contract_id"]
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hardship_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "hubspot_deals_raw_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
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
      lawpay_export_staging: {
        Row: {
          account: string | null
          already_in_lawpay_txns: boolean | null
          amount: number
          authorized_amount: number | null
          card_type: string | null
          charge_ref: string | null
          city: string | null
          cliente: string | null
          country: string | null
          currency: string | null
          email: string | null
          estimated_date: string | null
          id: string
          imported_at: string | null
          ip_address: string | null
          match_type: string | null
          matched_client_id: string | null
          method: string | null
          payment_page: string | null
          payor: string | null
          phone: string | null
          postal_code: string | null
          raw_row: Json | null
          state: string | null
          status: string | null
          subtotal_amount: number | null
          surcharge_amount: number | null
          transaction_id: string
          txn_type: string | null
          user_name: string | null
        }
        Insert: {
          account?: string | null
          already_in_lawpay_txns?: boolean | null
          amount?: number
          authorized_amount?: number | null
          card_type?: string | null
          charge_ref?: string | null
          city?: string | null
          cliente?: string | null
          country?: string | null
          currency?: string | null
          email?: string | null
          estimated_date?: string | null
          id?: string
          imported_at?: string | null
          ip_address?: string | null
          match_type?: string | null
          matched_client_id?: string | null
          method?: string | null
          payment_page?: string | null
          payor?: string | null
          phone?: string | null
          postal_code?: string | null
          raw_row?: Json | null
          state?: string | null
          status?: string | null
          subtotal_amount?: number | null
          surcharge_amount?: number | null
          transaction_id: string
          txn_type?: string | null
          user_name?: string | null
        }
        Update: {
          account?: string | null
          already_in_lawpay_txns?: boolean | null
          amount?: number
          authorized_amount?: number | null
          card_type?: string | null
          charge_ref?: string | null
          city?: string | null
          cliente?: string | null
          country?: string | null
          currency?: string | null
          email?: string | null
          estimated_date?: string | null
          id?: string
          imported_at?: string | null
          ip_address?: string | null
          match_type?: string | null
          matched_client_id?: string | null
          method?: string | null
          payment_page?: string | null
          payor?: string | null
          phone?: string | null
          postal_code?: string | null
          raw_row?: Json | null
          state?: string | null
          status?: string | null
          subtotal_amount?: number | null
          surcharge_amount?: number | null
          transaction_id?: string
          txn_type?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lawpay_export_staging_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_export_staging_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "ar_flagged_accounts"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_export_staging_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawpay_export_staging_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_export_staging_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "mycase_ar_validation"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "lawpay_export_staging_matched_client_id_fkey"
            columns: ["matched_client_id"]
            isOneToOne: false
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
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
            referencedRelation: "v_ar_preview"
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
            referencedRelation: "v_ar_preview"
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
            referencedRelation: "lawpay_non_invoice_payment_classification"
            referencedColumns: ["lawpay_row_id"]
          },
          {
            foreignKeyName: "lawpay_validation_log_lawpay_txn_id_fkey"
            columns: ["lawpay_txn_id"]
            isOneToOne: false
            referencedRelation: "lawpay_payment_matching_review"
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
            foreignKeyName: "lawpay_validation_log_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_cases_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
        ]
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
      mycase_invoice_links_backup_20260505_pre_contract_link: {
        Row: {
          id: string | null
          invoice_number: string | null
          match_type: string | null
          matched_client_id: string | null
          matched_contract_id: string | null
          mycase_internal_id: string | null
          mycase_invoice_id: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          invoice_number?: string | null
          match_type?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_internal_id?: string | null
          mycase_invoice_id?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          invoice_number?: string | null
          match_type?: string | null
          matched_client_id?: string | null
          matched_contract_id?: string | null
          mycase_internal_id?: string | null
          mycase_invoice_id?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mycase_invoice_links_backup_20260505_pre_high_confidence_connec: {
        Row: {
          amount: number | null
          amount_due: number | null
          amount_paid: number | null
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
          paid_date: string | null
          raw_payload: Json | null
          status: string | null
          synced_at: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          amount_due?: number | null
          amount_paid?: number | null
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
          paid_date?: string | null
          raw_payload?: Json | null
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          amount_due?: number | null
          amount_paid?: number | null
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
          paid_date?: string | null
          raw_payload?: Json | null
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoice_payments_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      mycase_invoices: {
        Row: {
          amount: number | null
          amount_due: number | null
          amount_paid: number | null
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
          status: string | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          amount_due?: number | null
          amount_paid?: number | null
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
          status?: string | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          amount_due?: number | null
          amount_paid?: number | null
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      mycase_invoices_backup_20260505_pre_pdf_refresh: {
        Row: {
          amount: number | null
          amount_due: number | null
          amount_paid: number | null
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
          paid_date: string | null
          raw_payload: Json | null
          status: string | null
          synced_at: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          amount_due?: number | null
          amount_paid?: number | null
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
          paid_date?: string | null
          raw_payload?: Json | null
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          amount_due?: number | null
          amount_paid?: number | null
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
          paid_date?: string | null
          raw_payload?: Json | null
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mycase_invoices_stale_archive_20260505: {
        Row: {
          amount: number | null
          amount_due: number | null
          amount_paid: number | null
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
          paid_date: string | null
          raw_payload: Json | null
          status: string | null
          synced_at: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          amount_due?: number | null
          amount_paid?: number | null
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
          paid_date?: string | null
          raw_payload?: Json | null
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          amount_due?: number | null
          amount_paid?: number | null
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
          paid_date?: string | null
          raw_payload?: Json | null
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
      mycase_pdf_ar_staging: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          days_aging: number | null
          due_date: string | null
          formal_name: string | null
          invoice_number: string
          invoice_status: string | null
          invoice_total: number | null
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          days_aging?: number | null
          due_date?: string | null
          formal_name?: string | null
          invoice_number: string
          invoice_status?: string | null
          invoice_total?: number | null
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          days_aging?: number | null
          due_date?: string | null
          formal_name?: string | null
          invoice_number?: string
          invoice_status?: string | null
          invoice_total?: number | null
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
      mycase_staging: {
        Row: {
          billing_contact: string | null
          case_number: string
          case_stage: string | null
          closed_date: string | null
          flat_fee: number | null
          is_closed: boolean | null
          lead_attorney: string | null
          open_date: string | null
          practice_area: string | null
        }
        Insert: {
          billing_contact?: string | null
          case_number: string
          case_stage?: string | null
          closed_date?: string | null
          flat_fee?: number | null
          is_closed?: boolean | null
          lead_attorney?: string | null
          open_date?: string | null
          practice_area?: string | null
        }
        Update: {
          billing_contact?: string | null
          case_number?: string
          case_stage?: string | null
          closed_date?: string | null
          flat_fee?: number | null
          is_closed?: boolean | null
          lead_attorney?: string | null
          open_date?: string | null
          practice_area?: string | null
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
          method: string | null
          payment_date: string | null
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
          method?: string | null
          payment_date?: string | null
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
          method?: string | null
          payment_date?: string | null
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      payment_plan_staging: {
        Row: {
          amount_due: number | null
          case_name: string | null
          contact: string
          created_at: string | null
          id: number
          installment_amount: number | null
          paid: number | null
          total: number | null
        }
        Insert: {
          amount_due?: number | null
          case_name?: string | null
          contact: string
          created_at?: string | null
          id?: number
          installment_amount?: number | null
          paid?: number | null
          total?: number | null
        }
        Update: {
          amount_due?: number | null
          case_name?: string | null
          contact?: string
          created_at?: string | null
          id?: number
          installment_amount?: number | null
          paid?: number | null
          total?: number | null
        }
        Relationships: []
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
            referencedRelation: "v_ar_preview"
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
            foreignKeyName: "payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      recon_change_log: {
        Row: {
          applied_at: string | null
          change_source: string | null
          contract_id: string | null
          field_name: string
          id: number
          new_value: string | null
          old_value: string | null
          recon_staging_id: number | null
        }
        Insert: {
          applied_at?: string | null
          change_source?: string | null
          contract_id?: string | null
          field_name: string
          id?: number
          new_value?: string | null
          old_value?: string | null
          recon_staging_id?: number | null
        }
        Update: {
          applied_at?: string | null
          change_source?: string | null
          contract_id?: string | null
          field_name?: string
          id?: number
          new_value?: string | null
          old_value?: string | null
          recon_staging_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recon_change_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recon_change_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recon_change_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recon_change_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "recon_change_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recon_change_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "recon_change_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "recon_change_log_recon_staging_id_fkey"
            columns: ["recon_staging_id"]
            isOneToOne: false
            referencedRelation: "recon_staging"
            referencedColumns: ["id"]
          },
        ]
      }
      recon_staging: {
        Row: {
          created_at: string | null
          delta_collected: number | null
          delta_status: string | null
          delta_value: number | null
          excel_aging_bucket: string | null
          excel_amount_paid: number | null
          excel_balance_owed: number | null
          excel_client_name: string
          excel_collection_pct: number | null
          excel_days_aging: number | null
          excel_due_date: string | null
          excel_invoice_number: string | null
          excel_invoice_total: number | null
          excel_notes: string | null
          excel_source: string | null
          excel_status: string | null
          id: number
          match_confidence: number | null
          match_method: string | null
          matched_contract_id: string | null
          processed_at: string | null
          recon_notes: string | null
          recon_status: string | null
        }
        Insert: {
          created_at?: string | null
          delta_collected?: number | null
          delta_status?: string | null
          delta_value?: number | null
          excel_aging_bucket?: string | null
          excel_amount_paid?: number | null
          excel_balance_owed?: number | null
          excel_client_name: string
          excel_collection_pct?: number | null
          excel_days_aging?: number | null
          excel_due_date?: string | null
          excel_invoice_number?: string | null
          excel_invoice_total?: number | null
          excel_notes?: string | null
          excel_source?: string | null
          excel_status?: string | null
          id?: number
          match_confidence?: number | null
          match_method?: string | null
          matched_contract_id?: string | null
          processed_at?: string | null
          recon_notes?: string | null
          recon_status?: string | null
        }
        Update: {
          created_at?: string | null
          delta_collected?: number | null
          delta_status?: string | null
          delta_value?: number | null
          excel_aging_bucket?: string | null
          excel_amount_paid?: number | null
          excel_balance_owed?: number | null
          excel_client_name?: string
          excel_collection_pct?: number | null
          excel_days_aging?: number | null
          excel_due_date?: string | null
          excel_invoice_number?: string | null
          excel_invoice_total?: number | null
          excel_notes?: string | null
          excel_source?: string | null
          excel_status?: string | null
          id?: number
          match_confidence?: number | null
          match_method?: string | null
          matched_contract_id?: string | null
          processed_at?: string | null
          recon_notes?: string | null
          recon_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recon_staging_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_active_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recon_staging_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_closed_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recon_staging_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "ar_migration_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recon_staging_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "collections_dashboard"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "recon_staging_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recon_staging_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "recon_staging_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      recon_staging_apr29: {
        Row: {
          case_number: string | null
          client_name: string | null
          collected: number | null
          delinquency: string | null
          excel_status: string | null
          last_date: string | null
          last_src: string | null
          match_key: string
          recon_status: string | null
          sorted_key: string | null
          status: string | null
          value: number | null
        }
        Insert: {
          case_number?: string | null
          client_name?: string | null
          collected?: number | null
          delinquency?: string | null
          excel_status?: string | null
          last_date?: string | null
          last_src?: string | null
          match_key: string
          recon_status?: string | null
          sorted_key?: string | null
          status?: string | null
          value?: number | null
        }
        Update: {
          case_number?: string | null
          client_name?: string | null
          collected?: number | null
          delinquency?: string | null
          excel_status?: string | null
          last_date?: string | null
          last_src?: string | null
          match_key?: string
          recon_status?: string | null
          sorted_key?: string | null
          status?: string | null
          value?: number | null
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
          ar_late: number | null
          ar_on_plan: number | null
          collected_this_month: number | null
          collection_rate_pct: number | null
          contracts_actionable: number | null
          contracts_late: number | null
          contracts_on_plan: number | null
          current_clients: number | null
          delinquent_clients: number | null
          risk_contracts: number | null
          total_clients: number | null
          total_collected: number | null
          total_contracts: number | null
          total_remaining: number | null
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "mycase_invoices_matched_contract_id_fkey"
            columns: ["matched_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      lawpay_non_invoice_payment_classification: {
        Row: {
          amount: number | null
          lawpay_reference: string | null
          lawpay_row_id: string | null
          lawpay_transaction_id: string | null
          match_confidence: string | null
          match_reason: string | null
          matched_to_payment: boolean | null
          payment_category: string | null
          payment_date: string | null
          reference_digits: string | null
        }
        Relationships: []
      }
      lawpay_payment_matching_review: {
        Row: {
          amount: number | null
          card_brand: string | null
          card_last_four: string | null
          lawpay_card_fingerprint: string | null
          lawpay_payer_email: string | null
          lawpay_payer_name: string | null
          lawpay_payment_page_id: string | null
          lawpay_reference: string | null
          lawpay_row_id: string | null
          lawpay_transaction_id: string | null
          match_confidence: string | null
          match_reason: string | null
          payment_category: string | null
          payment_date: string | null
          reference_digits: string | null
          review_reason: string | null
        }
        Relationships: []
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
            referencedRelation: "v_ar_preview"
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
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
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
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["candidate_contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
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
            referencedRelation: "v_ar_preview"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contract_installment_resolved"
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
            referencedRelation: "v_recommendations_preview"
            referencedColumns: ["client_id"]
          },
        ]
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
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      extract_case_number_from_text: {
        Args: { value: string }
        Returns: string
      }
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
      normalize_collector_client_name: {
        Args: { value: string }
        Returns: string
      }
      normalize_name_key: { Args: { raw_name: string }; Returns: string }
      normalize_practice_area: { Args: { raw_area: string }; Returns: string }
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
      refresh_after_import: { Args: never; Returns: Json }
      refresh_client_quality_classification: {
        Args: never
        Returns: {
          client_quality_status: string
          clients_updated: number
          excluded_from_collections: boolean
        }[]
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
      refresh_payments_clean_mv: { Args: never; Returns: undefined }
      rematch_invoice_payments: {
        Args: { p_dry_run?: boolean }
        Returns: {
          rematched_count: number
        }[]
      }
      rematch_upgrade_mycase_invoice: {
        Args: { p_dry_run?: boolean }
        Returns: {
          upgraded_count: number
        }[]
      }
      resolve_lawpay_unmatched_clients: {
        Args: never
        Returns: {
          resolved_count: number
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
A new version of Supabase CLI is available: v2.95.4 (currently installed v2.84.5)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
