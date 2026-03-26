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
          manual_override: boolean
          override_by: string | null
          override_reason: string | null
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
          manual_override?: boolean
          override_by?: string | null
          override_reason?: string | null
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
          manual_override?: boolean
          override_by?: string | null
          override_reason?: string | null
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
      employees: {
        Row: {
          auth_user_id: string | null
          base_salary: number | null
          category: Database["public"]["Enums"]["employee_category"]
          conveyance: number | null
          created_at: string
          department: string
          emp_code: string
          esic_deduction: number | null
          hra: number | null
          id: string
          is_active: boolean
          medical: number | null
          name: string
          name_hi: string | null
          pf_deduction: number | null
          phone: string
          role: Database["public"]["Enums"]["app_role"]
          special_allowance: number | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          base_salary?: number | null
          category?: Database["public"]["Enums"]["employee_category"]
          conveyance?: number | null
          created_at?: string
          department?: string
          emp_code: string
          esic_deduction?: number | null
          hra?: number | null
          id?: string
          is_active?: boolean
          medical?: number | null
          name: string
          name_hi?: string | null
          pf_deduction?: number | null
          phone: string
          role?: Database["public"]["Enums"]["app_role"]
          special_allowance?: number | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          base_salary?: number | null
          category?: Database["public"]["Enums"]["employee_category"]
          conveyance?: number | null
          created_at?: string
          department?: string
          emp_code?: string
          esic_deduction?: number | null
          hra?: number | null
          id?: string
          is_active?: boolean
          medical?: number | null
          name?: string
          name_hi?: string | null
          pf_deduction?: number | null
          phone?: string
          role?: Database["public"]["Enums"]["app_role"]
          special_allowance?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      leave_balances: {
        Row: {
          casual_leave: number
          cl_used: number
          created_at: string
          earned_leave: number
          el_used: number
          employee_id: string
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
      app_role: "worker" | "supervisor" | "manager" | "hr_admin" | "owner"
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
      app_role: ["worker", "supervisor", "manager", "hr_admin", "owner"],
      attendance_status: ["P", "H", "LC", "EC", "OT", "A", "L", "WO", "HO"],
      employee_category: ["WORKER", "STAFF", "CONSULTANT"],
      shift_type: ["general", "first", "second", "third", "day", "night"],
    },
  },
} as const
