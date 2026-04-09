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
            referencedRelation: "ar_dashboard"
            referencedColumns: ["contract_id"]
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
            foreignKeyName: "case_milestones_immigration_case_id_fkey"
            columns: ["immigration_case_id"]
            isOneToOne: false
            referencedRelation: "immigration_cases"
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
          case_stage: string | null
          city: string | null
          client_number: string
          contact_name: string | null
          created_at: string
          created_by: string | null
          custom_fields: Json | null
          days_past_due: number | null
          delinquency_status: string | null
          detained: boolean | null
          email: string | null
          filevine_project_id: string | null
          id: string
          is_active: boolean
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
          case_stage?: string | null
          city?: string | null
          client_number: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          days_past_due?: number | null
          delinquency_status?: string | null
          detained?: boolean | null
          email?: string | null
          filevine_project_id?: string | null
          id?: string
          is_active?: boolean
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
          case_stage?: string | null
          city?: string | null
          client_number?: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          days_past_due?: number | null
          delinquency_status?: string | null
          detained?: boolean | null
          email?: string | null
          filevine_project_id?: string | null
          id?: string
          is_active?: boolean
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
          id: string
          installments_paid: number | null
          invoice_number: string | null
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
          id?: string
          installments_paid?: number | null
          invoice_number?: string | null
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
          id?: string
          installments_paid?: number | null
          invoice_number?: string | null
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
            foreignKeyName: "escalations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_dashboard"
            referencedColumns: ["contract_id"]
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
        ]
      }
      firm_settings: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string
          default_late_fee_percent: number | null
          default_payment_terms_days: number
          ein: string | null
          email: string | null
          firm_name: string
          id: string
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
          created_at?: string
          default_late_fee_percent?: number | null
          default_payment_terms_days?: number
          ein?: string | null
          email?: string | null
          firm_name?: string
          id?: string
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
          created_at?: string
          default_late_fee_percent?: number | null
          default_payment_terms_days?: number
          ein?: string | null
          email?: string | null
          firm_name?: string
          id?: string
          logo_url?: string | null
          phone?: string | null
          state?: string | null
          trust_account_bank_name?: string | null
          updated_at?: string
          zip_code?: string | null
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
      lawpay_transactions: {
        Row: {
          amount: number
          card_brand: string | null
          card_last_four: string | null
          client_id: string | null
          contract_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          lawpay_charge_id: string | null
          lawpay_customer_id: string | null
          lawpay_payment_method_id: string | null
          lawpay_transaction_id: string | null
          match_confidence: string | null
          matched_to_payment: boolean | null
          payment_date: string | null
          payment_id: string | null
          payment_method: string | null
          processed_at: string | null
          raw_payload: Json | null
          status: string | null
        }
        Insert: {
          amount: number
          card_brand?: string | null
          card_last_four?: string | null
          client_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          lawpay_charge_id?: string | null
          lawpay_customer_id?: string | null
          lawpay_payment_method_id?: string | null
          lawpay_transaction_id?: string | null
          match_confidence?: string | null
          matched_to_payment?: boolean | null
          payment_date?: string | null
          payment_id?: string | null
          payment_method?: string | null
          processed_at?: string | null
          raw_payload?: Json | null
          status?: string | null
        }
        Update: {
          amount?: number
          card_brand?: string | null
          card_last_four?: string | null
          client_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          lawpay_charge_id?: string | null
          lawpay_customer_id?: string | null
          lawpay_payment_method_id?: string | null
          lawpay_transaction_id?: string | null
          match_confidence?: string | null
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
            foreignKeyName: "lawpay_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_dashboard"
            referencedColumns: ["contract_id"]
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
            foreignKeyName: "lawpay_validation_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_dashboard"
            referencedColumns: ["contract_id"]
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
            foreignKeyName: "lawpay_validation_log_lawpay_txn_id_fkey"
            columns: ["lawpay_txn_id"]
            isOneToOne: false
            referencedRelation: "lawpay_transactions"
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
            foreignKeyName: "payment_commitments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "ar_dashboard"
            referencedColumns: ["contract_id"]
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
          created_at: string
          delinquency_days: number | null
          deposit_to_trust: boolean
          id: string
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
          created_at?: string
          delinquency_days?: number | null
          deposit_to_trust?: boolean
          id?: string
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
          created_at?: string
          delinquency_days?: number | null
          deposit_to_trust?: boolean
          id?: string
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
            referencedRelation: "ar_dashboard"
            referencedColumns: ["contract_id"]
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
            referencedRelation: "ar_dashboard"
            referencedColumns: ["contract_id"]
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
        ]
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
          status?: string | null
        }
        Relationships: [
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
          active_contracts: number | null
          closed_cases: number | null
          collected_this_month: number | null
          collected_this_week: number | null
          collection_rate_pct: number | null
          current_clients: number | null
          delinquent_clients: number | null
          late_clients: number | null
          overdue_ar: number | null
          payments_this_month: number | null
          risk_contracts: number | null
          total_ar_value: number | null
          total_clients: number | null
          total_collected: number | null
          total_contracts: number | null
          total_remaining: number | null
        }
        Relationships: []
      }
      ar_dashboard: {
        Row: {
          amount_collected: number | null
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
          lead_attorney: string | null
          monthly_installment: number | null
          next_due_date: string | null
          phone: string | null
          practice_area: string | null
          preferred_language: string | null
          remaining_balance: number | null
          start_date: string | null
          total_contract_value: number | null
          total_installments: number | null
        }
        Relationships: [
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
        ]
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
          client_name: string | null
          collected: number | null
          collector: string | null
          contract_id: string | null
          contract_status: string | null
          contract_value: number | null
          days_out: number | null
          days_past_due: number | null
          delinquency_status: string | null
          email: string | null
          immigration_stage: string | null
          lead_attorney: string | null
          monthly_installment: number | null
          next_due_date: string | null
          next_payment_date: string | null
          phone: string | null
          practice_area: string | null
          preferred_language: string | null
          priority_score: number | null
        }
        Relationships: []
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
          contract_status: string | null
          contract_value: number | null
          created_at: string | null
          delinquency_days: number | null
          deposit_to_trust: boolean | null
          id: string | null
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
            foreignKeyName: "payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
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
      call_lawpay_orchestrator: {
        Args: { p_payload: Json }
        Returns: undefined
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_aging_summary: {
        Args: never
        Returns: {
          aging_bucket: string
          invoice_count: number
          total_amount: number
        }[]
      }
      get_legal_kpi: { Args: { p_year?: number }; Returns: Json }
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
      normalize_case_stage: { Args: { raw_stage: string }; Returns: string }
      normalize_practice_area: { Args: { raw_area: string }; Returns: string }
      resolve_lawpay_unmatched_clients: {
        Args: never
        Returns: {
          resolved_count: number
          still_unresolved: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
