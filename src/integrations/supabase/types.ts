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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      advance_requests: {
        Row: {
          amount_requested: number
          applied_at: string
          employee_id: string
          id: string
          reason: string | null
          repayment_months: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          amount_requested: number
          applied_at?: string
          employee_id: string
          id?: string
          reason?: string | null
          repayment_months?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          amount_requested?: number
          applied_at?: string
          employee_id?: string
          id?: string
          reason?: string | null
          repayment_months?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "advance_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advance_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          attendance_date: string
          check_in_lat: number | null
          check_in_lng: number | null
          check_in_time: string | null
          check_out_lat: number | null
          check_out_lng: number | null
          check_out_time: string | null
          created_at: string
          employee_id: string
          id: string
          is_inside_geofence: boolean | null
          is_unannounced_absence: boolean | null
          late_minutes: number | null
          late_reason: string | null
          manual_override: boolean
          override_by: string | null
          override_reason: string | null
          overtime_hours: number | null
          points_earned: number | null
          shift_type: Database["public"]["Enums"]["shift_type"] | null
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string
        }
        Insert: {
          attendance_date?: string
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_time?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_time?: string | null
          created_at?: string
          employee_id: string
          id?: string
          is_inside_geofence?: boolean | null
          is_unannounced_absence?: boolean | null
          late_minutes?: number | null
          late_reason?: string | null
          manual_override?: boolean
          override_by?: string | null
          override_reason?: string | null
          overtime_hours?: number | null
          points_earned?: number | null
          shift_type?: Database["public"]["Enums"]["shift_type"] | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_time?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_time?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          is_inside_geofence?: boolean | null
          is_unannounced_absence?: boolean | null
          late_minutes?: number | null
          late_reason?: string | null
          manual_override?: boolean
          override_by?: string | null
          override_reason?: string | null
          overtime_hours?: number | null
          points_earned?: number | null
          shift_type?: Database["public"]["Enums"]["shift_type"] | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_override_by_fkey"
            columns: ["override_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_checkpoints: {
        Row: {
          all_confirmed: boolean | null
          attendance_date: string
          checkpoint_1_gps_lat: number | null
          checkpoint_1_gps_lng: number | null
          checkpoint_1_mock_location: boolean | null
          checkpoint_1_qr_valid: boolean | null
          checkpoint_1_time: string | null
          checkpoint_2_confirmed_by: string | null
          checkpoint_2_time: string | null
          checkpoint_3_confirmed_by: string | null
          checkpoint_3_time: string | null
          employee_id: string
          id: string
          mismatch_detected: boolean | null
          mismatch_type: string | null
        }
        Insert: {
          all_confirmed?: boolean | null
          attendance_date: string
          checkpoint_1_gps_lat?: number | null
          checkpoint_1_gps_lng?: number | null
          checkpoint_1_mock_location?: boolean | null
          checkpoint_1_qr_valid?: boolean | null
          checkpoint_1_time?: string | null
          checkpoint_2_confirmed_by?: string | null
          checkpoint_2_time?: string | null
          checkpoint_3_confirmed_by?: string | null
          checkpoint_3_time?: string | null
          employee_id: string
          id?: string
          mismatch_detected?: boolean | null
          mismatch_type?: string | null
        }
        Update: {
          all_confirmed?: boolean | null
          attendance_date?: string
          checkpoint_1_gps_lat?: number | null
          checkpoint_1_gps_lng?: number | null
          checkpoint_1_mock_location?: boolean | null
          checkpoint_1_qr_valid?: boolean | null
          checkpoint_1_time?: string | null
          checkpoint_2_confirmed_by?: string | null
          checkpoint_2_time?: string | null
          checkpoint_3_confirmed_by?: string | null
          checkpoint_3_time?: string | null
          employee_id?: string
          id?: string
          mismatch_detected?: boolean | null
          mismatch_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_checkpoints_checkpoint_2_confirmed_by_fkey"
            columns: ["checkpoint_2_confirmed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_checkpoints_checkpoint_3_confirmed_by_fkey"
            columns: ["checkpoint_3_confirmed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_checkpoints_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_regularisation: {
        Row: {
          attendance_date: string
          created_at: string | null
          employee_id: string
          id: string
          reason: string | null
          rejection_reason: string | null
          requested_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          shift_type: string | null
          status: string | null
        }
        Insert: {
          attendance_date: string
          created_at?: string | null
          employee_id: string
          id?: string
          reason?: string | null
          rejection_reason?: string | null
          requested_status: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          shift_type?: string | null
          status?: string | null
        }
        Update: {
          attendance_date?: string
          created_at?: string | null
          employee_id?: string
          id?: string
          reason?: string | null
          rejection_reason?: string | null
          requested_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          shift_type?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_regularisation_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_regularisation_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_warnings: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by_employee: boolean | null
          approved_by: string | null
          employee_id: string
          id: string
          issued_at: string | null
          issued_by: string | null
          owner_approved: boolean | null
          reason: string | null
          requires_owner_approval: boolean | null
          warning_number: number
          warning_type: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by_employee?: boolean | null
          approved_by?: string | null
          employee_id: string
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          owner_approved?: boolean | null
          reason?: string | null
          requires_owner_approval?: boolean | null
          warning_number?: number
          warning_type?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by_employee?: boolean | null
          approved_by?: string | null
          employee_id?: string
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          owner_approved?: boolean | null
          reason?: string | null
          requires_owner_approval?: boolean | null
          warning_number?: number
          warning_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_warnings_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_warnings_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_warnings_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      casual_workers: {
        Row: {
          created_at: string
          department: string | null
          id: string
          id_number: string | null
          logged_by: string
          name: string
          work_date: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          id_number?: string | null
          logged_by: string
          name: string
          work_date?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          id_number?: string | null
          logged_by?: string
          name?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "casual_workers_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_off_balance: {
        Row: {
          created_at: string | null
          earned_date: string
          employee_id: string
          expiry_date: string
          id: string
          is_expired: boolean | null
          is_used: boolean | null
        }
        Insert: {
          created_at?: string | null
          earned_date: string
          employee_id: string
          expiry_date: string
          id?: string
          is_expired?: boolean | null
          is_used?: boolean | null
        }
        Update: {
          created_at?: string | null
          earned_date?: string
          employee_id?: string
          expiry_date?: string
          id?: string
          is_expired?: boolean | null
          is_used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "comp_off_balance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checklist_log: {
        Row: {
          completed_at: string | null
          date: string
          employee_id: string
          id: string
          items_completed: Json | null
        }
        Insert: {
          completed_at?: string | null
          date: string
          employee_id: string
          id?: string
          items_completed?: Json | null
        }
        Update: {
          completed_at?: string | null
          date?: string
          employee_id?: string
          id?: string
          items_completed?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_checklist_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_eod_confirmations: {
        Row: {
          confirmation_date: string
          confirmed_at: string | null
          discrepancies_found: Json | null
          employee_id: string
          id: string
          is_complete: boolean | null
          items_confirmed: Json
          override_reason: string | null
          role: string
          system_check_result: Json | null
        }
        Insert: {
          confirmation_date?: string
          confirmed_at?: string | null
          discrepancies_found?: Json | null
          employee_id: string
          id?: string
          is_complete?: boolean | null
          items_confirmed: Json
          override_reason?: string | null
          role: string
          system_check_result?: Json | null
        }
        Update: {
          confirmation_date?: string
          confirmed_at?: string | null
          discrepancies_found?: Json | null
          employee_id?: string
          id?: string
          is_complete?: boolean | null
          items_confirmed?: Json
          override_reason?: string | null
          role?: string
          system_check_result?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_eod_confirmations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      data_collection_submissions: {
        Row: {
          data: Json | null
          id: string
          shift: string | null
          submitted_at: string | null
          submitted_by: string
          task_id: string
        }
        Insert: {
          data?: Json | null
          id?: string
          shift?: string | null
          submitted_at?: string | null
          submitted_by: string
          task_id: string
        }
        Update: {
          data?: Json | null
          id?: string
          shift?: string | null
          submitted_at?: string | null
          submitted_by?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_collection_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_collection_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "data_collection_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      data_collection_tasks: {
        Row: {
          assigned_to_id: string | null
          created_at: string | null
          department: string
          description: string | null
          entry_time: string | null
          fields_schema: Json | null
          frequency: string | null
          id: string
          last_submitted_at: string | null
          title: string
        }
        Insert: {
          assigned_to_id?: string | null
          created_at?: string | null
          department: string
          description?: string | null
          entry_time?: string | null
          fields_schema?: Json | null
          frequency?: string | null
          id?: string
          last_submitted_at?: string | null
          title: string
        }
        Update: {
          assigned_to_id?: string | null
          created_at?: string | null
          department?: string
          description?: string | null
          entry_time?: string | null
          fields_schema?: Json | null
          frequency?: string | null
          id?: string
          last_submitted_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_collection_tasks_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      document_uploads: {
        Row: {
          doc_reference: string | null
          doc_type: string
          doc_url: string
          drive_folder_url: string | null
          id: string
          linked_to_grn: string | null
          linked_to_invoice: string | null
          notes: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          verified: boolean | null
        }
        Insert: {
          doc_reference?: string | null
          doc_type: string
          doc_url: string
          drive_folder_url?: string | null
          id?: string
          linked_to_grn?: string | null
          linked_to_invoice?: string | null
          notes?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          verified?: boolean | null
        }
        Update: {
          doc_reference?: string | null
          doc_type?: string
          doc_url?: string
          drive_folder_url?: string | null
          id?: string
          linked_to_grn?: string | null
          linked_to_invoice?: string | null
          notes?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "document_uploads_linked_to_grn_fkey"
            columns: ["linked_to_grn"]
            isOneToOne: false
            referencedRelation: "goods_receipt_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_uploads_linked_to_invoice_fkey"
            columns: ["linked_to_invoice"]
            isOneToOne: false
            referencedRelation: "inward_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_uploads_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      email_tasks: {
        Row: {
          assigned_to: string | null
          body_preview: string | null
          category: string | null
          created_at: string | null
          escalated_at: string | null
          escalated_to: string | null
          from_address: string
          from_name: string | null
          gmail_message_id: string | null
          id: string
          inbox_email: string
          received_at: string
          replied_at: string | null
          reply_deadline: string | null
          status: string | null
          subject: string
          urgency: string | null
        }
        Insert: {
          assigned_to?: string | null
          body_preview?: string | null
          category?: string | null
          created_at?: string | null
          escalated_at?: string | null
          escalated_to?: string | null
          from_address: string
          from_name?: string | null
          gmail_message_id?: string | null
          id?: string
          inbox_email: string
          received_at: string
          replied_at?: string | null
          reply_deadline?: string | null
          status?: string | null
          subject: string
          urgency?: string | null
        }
        Update: {
          assigned_to?: string | null
          body_preview?: string | null
          category?: string | null
          created_at?: string | null
          escalated_at?: string | null
          escalated_to?: string | null
          from_address?: string
          from_name?: string | null
          gmail_message_id?: string | null
          id?: string
          inbox_email?: string
          received_at?: string
          replied_at?: string | null
          reply_deadline?: string | null
          status?: string | null
          subject?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_tasks_escalated_to_fkey"
            columns: ["escalated_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_contracts: {
        Row: {
          bonus_applicable: boolean | null
          confirmation_date: string | null
          created_at: string | null
          current_ctc: number | null
          date_of_joining: string | null
          employee_id: string
          employment_type: string | null
          esi_applicable: boolean | null
          grade: string | null
          gratuity_applicable: boolean | null
          id: string
          last_increment_date: string | null
          last_increment_pct: number | null
          last_updated_by: string | null
          next_review_date: string | null
          notes: string | null
          notice_period_days: number | null
          pf_applicable: boolean | null
          updated_at: string | null
        }
        Insert: {
          bonus_applicable?: boolean | null
          confirmation_date?: string | null
          created_at?: string | null
          current_ctc?: number | null
          date_of_joining?: string | null
          employee_id: string
          employment_type?: string | null
          esi_applicable?: boolean | null
          grade?: string | null
          gratuity_applicable?: boolean | null
          id?: string
          last_increment_date?: string | null
          last_increment_pct?: number | null
          last_updated_by?: string | null
          next_review_date?: string | null
          notes?: string | null
          notice_period_days?: number | null
          pf_applicable?: boolean | null
          updated_at?: string | null
        }
        Update: {
          bonus_applicable?: boolean | null
          confirmation_date?: string | null
          created_at?: string | null
          current_ctc?: number | null
          date_of_joining?: string | null
          employee_id?: string
          employment_type?: string | null
          esi_applicable?: boolean | null
          grade?: string | null
          gratuity_applicable?: boolean | null
          id?: string
          last_increment_date?: string | null
          last_increment_pct?: number | null
          last_updated_by?: string | null
          next_review_date?: string | null
          notes?: string | null
          notice_period_days?: number | null
          pf_applicable?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_contracts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_contracts_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          aadhar: string | null
          account_no: string | null
          address: string | null
          auth_user_id: string | null
          bank_name: string | null
          base_salary: number | null
          blood_group: string | null
          category: Database["public"]["Enums"]["employee_category"]
          communication: number | null
          confirmation_date: string | null
          conveyance: number | null
          created_at: string
          ctc_annual: number | null
          date_of_birth: string | null
          date_of_joining: string | null
          deactivated_at: string | null
          department: string
          designation: string | null
          education: number | null
          emergency_contact: string | null
          emp_code: string
          esi_no: string | null
          esic_deduction: number | null
          fcm_token: string | null
          grade: string | null
          gross_monthly: number | null
          heat_allow: number | null
          hra: number | null
          id: string
          ifsc: string | null
          is_active: boolean
          is_ai_agent: boolean | null
          language: string | null
          medical: number | null
          missing_data: Json | null
          name: string
          name_hi: string | null
          office_email: string | null
          pan: string | null
          personal_email: string | null
          pf_deduction: number | null
          phone: string
          probation_status: string | null
          production_allow: number | null
          prof_development: number | null
          reporting_manager_emp_code: string | null
          reporting_manager_name: string | null
          role: Database["public"]["Enums"]["app_role"]
          salary_type: string | null
          skill_level: string | null
          special_allowance: number | null
          uan: string | null
          uniform: number | null
          updated_at: string
          vda: number | null
          washing: number | null
        }
        Insert: {
          aadhar?: string | null
          account_no?: string | null
          address?: string | null
          auth_user_id?: string | null
          bank_name?: string | null
          base_salary?: number | null
          blood_group?: string | null
          category?: Database["public"]["Enums"]["employee_category"]
          communication?: number | null
          confirmation_date?: string | null
          conveyance?: number | null
          created_at?: string
          ctc_annual?: number | null
          date_of_birth?: string | null
          date_of_joining?: string | null
          deactivated_at?: string | null
          department?: string
          designation?: string | null
          education?: number | null
          emergency_contact?: string | null
          emp_code: string
          esi_no?: string | null
          esic_deduction?: number | null
          fcm_token?: string | null
          grade?: string | null
          gross_monthly?: number | null
          heat_allow?: number | null
          hra?: number | null
          id?: string
          ifsc?: string | null
          is_active?: boolean
          is_ai_agent?: boolean | null
          language?: string | null
          medical?: number | null
          missing_data?: Json | null
          name: string
          name_hi?: string | null
          office_email?: string | null
          pan?: string | null
          personal_email?: string | null
          pf_deduction?: number | null
          phone: string
          probation_status?: string | null
          production_allow?: number | null
          prof_development?: number | null
          reporting_manager_emp_code?: string | null
          reporting_manager_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          salary_type?: string | null
          skill_level?: string | null
          special_allowance?: number | null
          uan?: string | null
          uniform?: number | null
          updated_at?: string
          vda?: number | null
          washing?: number | null
        }
        Update: {
          aadhar?: string | null
          account_no?: string | null
          address?: string | null
          auth_user_id?: string | null
          bank_name?: string | null
          base_salary?: number | null
          blood_group?: string | null
          category?: Database["public"]["Enums"]["employee_category"]
          communication?: number | null
          confirmation_date?: string | null
          conveyance?: number | null
          created_at?: string
          ctc_annual?: number | null
          date_of_birth?: string | null
          date_of_joining?: string | null
          deactivated_at?: string | null
          department?: string
          designation?: string | null
          education?: number | null
          emergency_contact?: string | null
          emp_code?: string
          esi_no?: string | null
          esic_deduction?: number | null
          fcm_token?: string | null
          grade?: string | null
          gross_monthly?: number | null
          heat_allow?: number | null
          hra?: number | null
          id?: string
          ifsc?: string | null
          is_active?: boolean
          is_ai_agent?: boolean | null
          language?: string | null
          medical?: number | null
          missing_data?: Json | null
          name?: string
          name_hi?: string | null
          office_email?: string | null
          pan?: string | null
          personal_email?: string | null
          pf_deduction?: number | null
          phone?: string
          probation_status?: string | null
          production_allow?: number | null
          prof_development?: number | null
          reporting_manager_emp_code?: string | null
          reporting_manager_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          salary_type?: string | null
          skill_level?: string | null
          special_allowance?: number | null
          uan?: string | null
          uniform?: number | null
          updated_at?: string
          vda?: number | null
          washing?: number | null
        }
        Relationships: []
      }
      fraud_flags: {
        Row: {
          action_taken: string | null
          auto_detected: boolean | null
          created_at: string | null
          employee_id: string
          flag_date: string
          flag_detail: string | null
          flag_type: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          action_taken?: string | null
          auto_detected?: boolean | null
          created_at?: string | null
          employee_id: string
          flag_date?: string
          flag_detail?: string | null
          flag_type: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          action_taken?: string | null
          auto_detected?: boolean | null
          created_at?: string | null
          employee_id?: string
          flag_date?: string
          flag_detail?: string | null
          flag_type?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_flags_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_flags_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      gmail_inbox_owners: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          id: string
          inbox_email: string
          inbox_label: string
          is_active: boolean | null
          is_customer_facing: boolean | null
          reply_deadline_hours: number | null
          urgency_keywords: string[] | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          inbox_email: string
          inbox_label: string
          is_active?: boolean | null
          is_customer_facing?: boolean | null
          reply_deadline_hours?: number | null
          urgency_keywords?: string[] | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          inbox_email?: string
          inbox_label?: string
          is_active?: boolean | null
          is_customer_facing?: boolean | null
          reply_deadline_hours?: number | null
          urgency_keywords?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "gmail_inbox_owners_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipt_notes: {
        Row: {
          challan_doc_url: string | null
          challan_number: string | null
          condition: string | null
          created_at: string | null
          department: string | null
          grn_date: string
          grn_number: string
          id: string
          material_description: string
          payment_status: string | null
          po_number: string | null
          qc_approved_at: string | null
          qc_approved_by: string | null
          qc_notes: string | null
          qc_status: string | null
          quantity_received: number
          received_by: string | null
          status: string | null
          unit: string | null
          vehicle_log_id: string | null
          vendor_name: string
        }
        Insert: {
          challan_doc_url?: string | null
          challan_number?: string | null
          condition?: string | null
          created_at?: string | null
          department?: string | null
          grn_date?: string
          grn_number: string
          id?: string
          material_description: string
          payment_status?: string | null
          po_number?: string | null
          qc_approved_at?: string | null
          qc_approved_by?: string | null
          qc_notes?: string | null
          qc_status?: string | null
          quantity_received: number
          received_by?: string | null
          status?: string | null
          unit?: string | null
          vehicle_log_id?: string | null
          vendor_name: string
        }
        Update: {
          challan_doc_url?: string | null
          challan_number?: string | null
          condition?: string | null
          created_at?: string | null
          department?: string | null
          grn_date?: string
          grn_number?: string
          id?: string
          material_description?: string
          payment_status?: string | null
          po_number?: string | null
          qc_approved_at?: string | null
          qc_approved_by?: string | null
          qc_notes?: string | null
          qc_status?: string | null
          quantity_received?: number
          received_by?: string | null
          status?: string | null
          unit?: string | null
          vehicle_log_id?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipt_notes_qc_approved_by_fkey"
            columns: ["qc_approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_notes_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_notes_vehicle_log_id_fkey"
            columns: ["vehicle_log_id"]
            isOneToOne: false
            referencedRelation: "vehicle_log"
            referencedColumns: ["id"]
          },
        ]
      }
      incentive_config: {
        Row: {
          active: boolean | null
          amount_per_shift: number
          band_name: string
          id: string
          max_pct: number | null
          min_pct: number | null
        }
        Insert: {
          active?: boolean | null
          amount_per_shift: number
          band_name: string
          id?: string
          max_pct?: number | null
          min_pct?: number | null
        }
        Update: {
          active?: boolean | null
          amount_per_shift?: number
          band_name?: string
          id?: string
          max_pct?: number | null
          min_pct?: number | null
        }
        Relationships: []
      }
      incentive_payments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          avg_performance_pct: number | null
          employee_id: string
          id: string
          incentive_amount: number | null
          month: number
          status: string | null
          total_pieces_actual: number | null
          total_pieces_expected: number | null
          total_shifts: number | null
          year: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          avg_performance_pct?: number | null
          employee_id: string
          id?: string
          incentive_amount?: number | null
          month: number
          status?: string | null
          total_pieces_actual?: number | null
          total_pieces_expected?: number | null
          total_shifts?: number | null
          year: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          avg_performance_pct?: number | null
          employee_id?: string
          id?: string
          incentive_amount?: number | null
          month?: number
          status?: string | null
          total_pieces_actual?: number | null
          total_pieces_expected?: number | null
          total_shifts?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "incentive_payments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incentive_payments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      inward_invoices: {
        Row: {
          created_at: string | null
          entered_at: string | null
          entered_by: string | null
          grn_id: string | null
          id: string
          invoice_amount: number
          invoice_date: string
          invoice_doc_url: string | null
          invoice_number: string
          invoice_quantity: number | null
          match_status: string | null
          po_number: string | null
          scanned_at: string | null
          scanned_by: string | null
          unit: string | null
          vendor_name: string
        }
        Insert: {
          created_at?: string | null
          entered_at?: string | null
          entered_by?: string | null
          grn_id?: string | null
          id?: string
          invoice_amount: number
          invoice_date: string
          invoice_doc_url?: string | null
          invoice_number: string
          invoice_quantity?: number | null
          match_status?: string | null
          po_number?: string | null
          scanned_at?: string | null
          scanned_by?: string | null
          unit?: string | null
          vendor_name: string
        }
        Update: {
          created_at?: string | null
          entered_at?: string | null
          entered_by?: string | null
          grn_id?: string | null
          id?: string
          invoice_amount?: number
          invoice_date?: string
          invoice_doc_url?: string | null
          invoice_number?: string
          invoice_quantity?: number | null
          match_status?: string | null
          po_number?: string | null
          scanned_at?: string | null
          scanned_by?: string | null
          unit?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "inward_invoices_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inward_invoices_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "goods_receipt_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inward_invoices_scanned_by_fkey"
            columns: ["scanned_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          casual_leave: number
          cl_used: number
          created_at: string
          earned_leave: number
          el_used: number
          employee_id: string
          encashed_days: number | null
          id: string
          sick_leave: number
          sl_used: number
          year: number
        }
        Insert: {
          casual_leave?: number
          cl_used?: number
          created_at?: string
          earned_leave?: number
          el_used?: number
          employee_id: string
          encashed_days?: number | null
          id?: string
          sick_leave?: number
          sl_used?: number
          year?: number
        }
        Update: {
          casual_leave?: number
          cl_used?: number
          created_at?: string
          earned_leave?: number
          el_used?: number
          employee_id?: string
          encashed_days?: number | null
          id?: string
          sick_leave?: number
          sl_used?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          applied_at: string
          approval_level: number | null
          current_approver_id: string | null
          employee_id: string
          from_date: string
          id: string
          leave_type: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          to_date: string
        }
        Insert: {
          applied_at?: string
          approval_level?: number | null
          current_approver_id?: string | null
          employee_id: string
          from_date: string
          id?: string
          leave_type: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          to_date: string
        }
        Update: {
          applied_at?: string
          approval_level?: number | null
          current_approver_id?: string | null
          employee_id?: string
          from_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          to_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_observations: {
        Row: {
          employee_id: string
          id: string
          machine_area: string
          observation_text: string
          points_awarded: number
          reason_text: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          submitted_at: string
          urgency: string
        }
        Insert: {
          employee_id: string
          id?: string
          machine_area: string
          observation_text: string
          points_awarded?: number
          reason_text: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          submitted_at?: string
          urgency?: string
        }
        Update: {
          employee_id?: string
          id?: string
          machine_area?: string
          observation_text?: string
          points_awarded?: number
          reason_text?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          submitted_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_observations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_observations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_scores: {
        Row: {
          attendance_score: number | null
          composite_score: number | null
          created_at: string
          employee_id: string
          eotm_rank: number | null
          id: string
          month: number
          observation_score: number | null
          performance_score: number | null
          year: number
        }
        Insert: {
          attendance_score?: number | null
          composite_score?: number | null
          created_at?: string
          employee_id: string
          eotm_rank?: number | null
          id?: string
          month: number
          observation_score?: number | null
          performance_score?: number | null
          year: number
        }
        Update: {
          attendance_score?: number | null
          composite_score?: number | null
          created_at?: string
          employee_id?: string
          eotm_rank?: number | null
          id?: string
          month?: number
          observation_score?: number | null
          performance_score?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_scores_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      mrm_reviews: {
        Row: {
          actions_taken: string | null
          department: string
          dept_head_id: string | null
          id: string
          key_issues: string | null
          key_wins: string | null
          pending_actions: Json | null
          plan_vs_actual_pct: number | null
          review_month: number
          review_year: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
        }
        Insert: {
          actions_taken?: string | null
          department: string
          dept_head_id?: string | null
          id?: string
          key_issues?: string | null
          key_wins?: string | null
          pending_actions?: Json | null
          plan_vs_actual_pct?: number | null
          review_month: number
          review_year: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
        }
        Update: {
          actions_taken?: string | null
          department?: string
          dept_head_id?: string | null
          id?: string
          key_issues?: string | null
          key_wins?: string | null
          pending_actions?: Json | null
          plan_vs_actual_pct?: number | null
          review_month?: number
          review_year?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mrm_reviews_dept_head_id_fkey"
            columns: ["dept_head_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mrm_reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mrm_reviews_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_data: Json | null
          body: string
          created_at: string | null
          employee_id: string
          id: string
          read: boolean | null
          title: string
          type: string | null
        }
        Insert: {
          action_data?: Json | null
          body: string
          created_at?: string | null
          employee_id: string
          id?: string
          read?: boolean | null
          title: string
          type?: string | null
        }
        Update: {
          action_data?: Json | null
          body?: string
          created_at?: string | null
          employee_id?: string
          id?: string
          read?: boolean | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      override_log: {
        Row: {
          changed_by: string | null
          created_at: string | null
          field_changed: string
          id: string
          new_value: string | null
          old_value: string | null
          reason: string | null
          record_id: string
          table_name: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          field_changed: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reason?: string | null
          record_id: string
          table_name: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          field_changed?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reason?: string | null
          record_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "override_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      part_master: {
        Row: {
          active: boolean | null
          created_at: string | null
          customer: string | null
          cycle_time_seconds: number
          department: string | null
          id: string
          machine_type: string
          part_name: string
          part_number: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          customer?: string | null
          cycle_time_seconds: number
          department?: string | null
          id?: string
          machine_type: string
          part_name: string
          part_number: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          customer?: string | null
          cycle_time_seconds?: number
          department?: string | null
          id?: string
          machine_type?: string
          part_name?: string
          part_number?: string
        }
        Relationships: []
      }
      plant_config: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      preventive_maintenance_tasks: {
        Row: {
          assigned_to_id: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          day_of_week: string | null
          department: string
          description: string | null
          due_date: string | null
          escalation_level: number | null
          frequency: string
          id: string
          last_reminded_at: string | null
          status: string
          title: string
        }
        Insert: {
          assigned_to_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          day_of_week?: string | null
          department: string
          description?: string | null
          due_date?: string | null
          escalation_level?: number | null
          frequency?: string
          id?: string
          last_reminded_at?: string | null
          status?: string
          title: string
        }
        Update: {
          assigned_to_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          day_of_week?: string | null
          department?: string
          description?: string | null
          due_date?: string | null
          escalation_level?: number | null
          frequency?: string
          id?: string
          last_reminded_at?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "preventive_maintenance_tasks_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preventive_maintenance_tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      production_entries: {
        Row: {
          employee_id: string
          entry_date: string
          entry_time: string | null
          flag_reason: string | null
          flagged_for_review: boolean | null
          hour_slot: number | null
          id: string
          incentive_amount: number | null
          part_id: string | null
          performance_pct: number | null
          pieces_actual: number
          pieces_expected: number
          shift: string | null
          shift_total_actual: number | null
          shift_total_expected: number | null
          supervisor_id: string | null
          supervisor_verified: boolean | null
        }
        Insert: {
          employee_id: string
          entry_date?: string
          entry_time?: string | null
          flag_reason?: string | null
          flagged_for_review?: boolean | null
          hour_slot?: number | null
          id?: string
          incentive_amount?: number | null
          part_id?: string | null
          performance_pct?: number | null
          pieces_actual?: number
          pieces_expected?: number
          shift?: string | null
          shift_total_actual?: number | null
          shift_total_expected?: number | null
          supervisor_id?: string | null
          supervisor_verified?: boolean | null
        }
        Update: {
          employee_id?: string
          entry_date?: string
          entry_time?: string | null
          flag_reason?: string | null
          flagged_for_review?: boolean | null
          hour_slot?: number | null
          id?: string
          incentive_amount?: number | null
          part_id?: string | null
          performance_pct?: number | null
          pieces_actual?: number
          pieces_expected?: number
          shift?: string | null
          shift_total_actual?: number | null
          shift_total_expected?: number | null
          supervisor_id?: string | null
          supervisor_verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "production_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_entries_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "part_master"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_entries_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      public_holidays: {
        Row: {
          created_at: string | null
          created_by: string | null
          holiday_date: string
          holiday_name: string
          holiday_name_hi: string | null
          id: string
          is_national: boolean | null
          year: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          holiday_date: string
          holiday_name: string
          holiday_name_hi?: string | null
          id?: string
          is_national?: boolean | null
          year: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          holiday_date?: string
          holiday_name?: string
          holiday_name_hi?: string | null
          id?: string
          is_national?: boolean | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_holidays_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          created_by: string | null
          expected_delivery: string | null
          id: string
          item_description: string
          po_date: string
          po_number: string
          pr_id: string | null
          quantity: number
          status: string | null
          total_amount: number
          unit: string | null
          unit_price: number
          vendor_name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          item_description: string
          po_date?: string
          po_number: string
          pr_id?: string | null
          quantity: number
          status?: string | null
          total_amount: number
          unit?: string | null
          unit_price: number
          vendor_name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          item_description?: string
          po_date?: string
          po_number?: string
          pr_id?: string | null
          quantity?: number
          status?: string | null
          total_amount?: number
          unit?: string | null
          unit_price?: number
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_pr_id_fkey"
            columns: ["pr_id"]
            isOneToOne: false
            referencedRelation: "purchase_requisitions"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_requisitions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          department: string
          id: string
          item_description: string
          po_id: string | null
          pr_date: string
          pr_number: string
          quantity: number
          raised_by: string | null
          required_by: string | null
          status: string | null
          unit: string | null
          urgency: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          department: string
          id?: string
          item_description: string
          po_id?: string | null
          pr_date?: string
          pr_number: string
          quantity: number
          raised_by?: string | null
          required_by?: string | null
          status?: string | null
          unit?: string | null
          urgency?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          department?: string
          id?: string
          item_description?: string
          po_id?: string | null
          pr_date?: string
          pr_number?: string
          quantity?: number
          raised_by?: string | null
          required_by?: string | null
          status?: string | null
          unit?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requisitions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requisitions_raised_by_fkey"
            columns: ["raised_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_tokens: {
        Row: {
          created_at: string | null
          id: string
          shift_type: string | null
          token: string
          valid_date: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          shift_type?: string | null
          token: string
          valid_date: string
          valid_from: string
          valid_until: string
        }
        Update: {
          created_at?: string | null
          id?: string
          shift_type?: string | null
          token?: string
          valid_date?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      role_kpis: {
        Row: {
          created_at: string | null
          id: string
          is_blocker: boolean | null
          kpi_title: string
          kpi_title_hi: string
          kra_number: number
          measurement_frequency: string | null
          points_on_achieve: number | null
          points_on_miss: number | null
          role: string
          target_operator: string | null
          target_value: string
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_blocker?: boolean | null
          kpi_title: string
          kpi_title_hi: string
          kra_number: number
          measurement_frequency?: string | null
          points_on_achieve?: number | null
          points_on_miss?: number | null
          role: string
          target_operator?: string | null
          target_value: string
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_blocker?: boolean | null
          kpi_title?: string
          kpi_title_hi?: string
          kra_number?: number
          measurement_frequency?: string | null
          points_on_achieve?: number | null
          points_on_miss?: number | null
          role?: string
          target_operator?: string | null
          target_value?: string
          unit?: string | null
        }
        Relationships: []
      }
      role_kras: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          kra_number: number
          kra_title: string
          kra_title_hi: string
          role: string
          weight_pct: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          kra_number: number
          kra_title: string
          kra_title_hi: string
          role: string
          weight_pct?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          kra_number?: number
          kra_title?: string
          kra_title_hi?: string
          role?: string
          weight_pct?: number | null
        }
        Relationships: []
      }
      salary_advances: {
        Row: {
          amount_deducted: number
          amount_sanctioned: number
          closing_balance: number
          created_at: string
          employee_id: string
          entered_by: string | null
          id: string
          month: string
          opening_balance: number
          year: number
        }
        Insert: {
          amount_deducted?: number
          amount_sanctioned?: number
          closing_balance?: number
          created_at?: string
          employee_id: string
          entered_by?: string | null
          id?: string
          month: string
          opening_balance?: number
          year: number
        }
        Update: {
          amount_deducted?: number
          amount_sanctioned?: number
          closing_balance?: number
          created_at?: string
          employee_id?: string
          entered_by?: string | null
          id?: string
          month?: string
          opening_balance?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "salary_advances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_master: {
        Row: {
          created_at: string
          days_absent: number | null
          days_present: number | null
          employee_id: string
          gross_salary: number | null
          id: string
          month: number
          net_salary: number | null
          overtime_hours: number | null
          total_deductions: number | null
          year: number
        }
        Insert: {
          created_at?: string
          days_absent?: number | null
          days_present?: number | null
          employee_id: string
          gross_salary?: number | null
          id?: string
          month: number
          net_salary?: number | null
          overtime_hours?: number | null
          total_deductions?: number | null
          year: number
        }
        Update: {
          created_at?: string
          days_absent?: number | null
          days_present?: number | null
          employee_id?: string
          gross_salary?: number | null
          id?: string
          month?: number
          net_salary?: number | null
          overtime_hours?: number | null
          total_deductions?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "salary_master_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_reports: {
        Row: {
          id: string
          issues_reported: string | null
          observations: string | null
          shift_date: string
          shift_type: string
          submitted_at: string
          supervisor_id: string
        }
        Insert: {
          id?: string
          issues_reported?: string | null
          observations?: string | null
          shift_date?: string
          shift_type?: string
          submitted_at?: string
          supervisor_id: string
        }
        Update: {
          id?: string
          issues_reported?: string | null
          observations?: string | null
          shift_date?: string
          shift_type?: string
          submitted_at?: string
          supervisor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_reports_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          published: boolean
          published_at: string | null
          published_by: string | null
          shift_date: string
          shift_type: Database["public"]["Enums"]["shift_type"]
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          published?: boolean
          published_at?: string | null
          published_by?: string | null
          shift_date: string
          shift_type?: Database["public"]["Enums"]["shift_type"]
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          published?: boolean
          published_at?: string | null
          published_by?: string | null
          shift_date?: string
          shift_type?: Database["public"]["Enums"]["shift_type"]
        }
        Relationships: [
          {
            foreignKeyName: "shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          acknowledged_at: string | null
          assigned_to: string
          completed_at: string | null
          completion_note: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          due_time: string | null
          escalation_level: number | null
          id: string
          priority: string
          repeat_frequency: string | null
          status: string
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          assigned_to: string
          completed_at?: string | null
          completion_note?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          escalation_level?: number | null
          id?: string
          priority?: string
          repeat_frequency?: string | null
          status?: string
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          assigned_to?: string
          completed_at?: string | null
          completion_note?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          escalation_level?: number | null
          id?: string
          priority?: string
          repeat_frequency?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      three_way_match: {
        Row: {
          created_at: string | null
          exception_escalated_to: string | null
          exception_reason: string | null
          grn_id: string | null
          grn_qty: number | null
          grn_quantity: number | null
          id: string
          invoice_id: string | null
          invoice_price: number | null
          invoice_qty: number | null
          invoice_quantity: number | null
          matched_at: string | null
          matched_by: string | null
          overall_status: string | null
          payment_released: boolean | null
          po_id: string | null
          po_price: number | null
          po_quantity: number | null
          price_match: boolean | null
          price_variance_pct: number | null
          qc_approved: boolean | null
          quantity_match: boolean | null
        }
        Insert: {
          created_at?: string | null
          exception_escalated_to?: string | null
          exception_reason?: string | null
          grn_id?: string | null
          grn_qty?: number | null
          grn_quantity?: number | null
          id?: string
          invoice_id?: string | null
          invoice_price?: number | null
          invoice_qty?: number | null
          invoice_quantity?: number | null
          matched_at?: string | null
          matched_by?: string | null
          overall_status?: string | null
          payment_released?: boolean | null
          po_id?: string | null
          po_price?: number | null
          po_quantity?: number | null
          price_match?: boolean | null
          price_variance_pct?: number | null
          qc_approved?: boolean | null
          quantity_match?: boolean | null
        }
        Update: {
          created_at?: string | null
          exception_escalated_to?: string | null
          exception_reason?: string | null
          grn_id?: string | null
          grn_qty?: number | null
          grn_quantity?: number | null
          id?: string
          invoice_id?: string | null
          invoice_price?: number | null
          invoice_qty?: number | null
          invoice_quantity?: number | null
          matched_at?: string | null
          matched_by?: string | null
          overall_status?: string | null
          payment_released?: boolean | null
          po_id?: string | null
          po_price?: number | null
          po_quantity?: number | null
          price_match?: boolean | null
          price_variance_pct?: number | null
          qc_approved?: boolean | null
          quantity_match?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "three_way_match_exception_escalated_to_fkey"
            columns: ["exception_escalated_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "three_way_match_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "goods_receipt_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "three_way_match_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "inward_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "three_way_match_matched_by_fkey"
            columns: ["matched_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "three_way_match_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_log: {
        Row: {
          created_at: string | null
          delivery_type: string | null
          driver_name: string | null
          grn_id: string | null
          id: string
          log_date: string
          logged_by: string | null
          material_description: string | null
          po_reference: string | null
          purpose: string
          security_confirmed: boolean | null
          shift: string
          time_in: string
          time_out: string | null
          vehicle_number: string
          vendor_name: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_type?: string | null
          driver_name?: string | null
          grn_id?: string | null
          id?: string
          log_date?: string
          logged_by?: string | null
          material_description?: string | null
          po_reference?: string | null
          purpose: string
          security_confirmed?: boolean | null
          shift: string
          time_in?: string
          time_out?: string | null
          vehicle_number: string
          vendor_name?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_type?: string | null
          driver_name?: string | null
          grn_id?: string | null
          id?: string
          log_date?: string
          logged_by?: string | null
          material_description?: string | null
          po_reference?: string | null
          purpose?: string
          security_confirmed?: boolean | null
          shift?: string
          time_in?: string
          time_out?: string | null
          vehicle_number?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_log_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_employee_id: { Args: never; Returns: string }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "worker"
        | "supervisor"
        | "manager"
        | "hr_admin"
        | "owner"
        | "plant_head"
        | "security_guard"
      attendance_status:
        | "P"
        | "H"
        | "LC"
        | "EC"
        | "OT"
        | "A"
        | "L"
        | "WO"
        | "HO"
      employee_category: "WORKER" | "STAFF" | "CONSULTANT"
      shift_type: "general" | "first" | "second" | "third" | "day" | "night"
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
      app_role: [
        "worker",
        "supervisor",
        "manager",
        "hr_admin",
        "owner",
        "plant_head",
        "security_guard",
      ],
      attendance_status: ["P", "H", "LC", "EC", "OT", "A", "L", "WO", "HO"],
      employee_category: ["WORKER", "STAFF", "CONSULTANT"],
      shift_type: ["general", "first", "second", "third", "day", "night"],
    },
  },
} as const
