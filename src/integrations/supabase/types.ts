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
      accounts: {
        Row: {
          account_number: string | null
          account_type: string | null
          balance: number | null
          bank_code: string | null
          bank_name: string | null
          branch_number: string | null
          created_at: string
          currency: string | null
          id: string
          is_active: boolean | null
          is_synced: boolean | null
          last_sync: string | null
          name: string
          open_banking_connection_id: string | null
          open_banking_provider: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          balance?: number | null
          bank_code?: string | null
          bank_name?: string | null
          branch_number?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          is_active?: boolean | null
          is_synced?: boolean | null
          last_sync?: string | null
          name: string
          open_banking_connection_id?: string | null
          open_banking_provider?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          balance?: number | null
          bank_code?: string | null
          bank_name?: string | null
          branch_number?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          is_active?: boolean | null
          is_synced?: boolean | null
          last_sync?: string | null
          name?: string
          open_banking_connection_id?: string | null
          open_banking_provider?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_open_banking_connection_id_fkey"
            columns: ["open_banking_connection_id"]
            isOneToOne: false
            referencedRelation: "open_banking_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          alert_threshold: number | null
          amount: number
          category_id: string | null
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean | null
          period: string | null
          spent: number | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_threshold?: number | null
          amount: number
          category_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          period?: string | null
          spent?: number | null
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_threshold?: number | null
          amount?: number
          category_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          period?: string | null
          spent?: number | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_system: boolean | null
          name_en: string
          name_he: string
          parent_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name_en: string
          name_he: string
          parent_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name_en?: string
          name_he?: string
          parent_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      maaser_calculations: {
        Row: {
          calculation_date: string
          calculation_method: string | null
          created_at: string
          id: string
          maaser_amount: number
          maaser_balance: number
          maaser_paid: number | null
          maaser_percentage: number | null
          net_income: number
          notes: string | null
          period_end: string
          period_start: string
          total_expenses: number
          total_income: number
          user_id: string
        }
        Insert: {
          calculation_date: string
          calculation_method?: string | null
          created_at?: string
          id?: string
          maaser_amount?: number
          maaser_balance?: number
          maaser_paid?: number | null
          maaser_percentage?: number | null
          net_income?: number
          notes?: string | null
          period_end: string
          period_start: string
          total_expenses?: number
          total_income?: number
          user_id: string
        }
        Update: {
          calculation_date?: string
          calculation_method?: string | null
          created_at?: string
          id?: string
          maaser_amount?: number
          maaser_balance?: number
          maaser_paid?: number | null
          maaser_percentage?: number | null
          net_income?: number
          notes?: string | null
          period_end?: string
          period_start?: string
          total_expenses?: number
          total_income?: number
          user_id?: string
        }
        Relationships: []
      }
      maaser_payments: {
        Row: {
          amount: number
          calculation_id: string | null
          created_at: string
          description: string | null
          id: string
          is_tax_deductible: boolean | null
          payment_date: string
          recipient: string | null
          recipient_type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          calculation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_tax_deductible?: boolean | null
          payment_date: string
          recipient?: string | null
          recipient_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          calculation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_tax_deductible?: boolean | null
          payment_date?: string
          recipient?: string | null
          recipient_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maaser_payments_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "maaser_calculations"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          auto_categorize: boolean | null
          category_id: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          auto_categorize?: boolean | null
          category_id?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          auto_categorize?: boolean | null
          category_id?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchants_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      open_banking_connections: {
        Row: {
          connection_status: string
          consent_expires_at: string | null
          consent_id: string | null
          created_at: string
          error_message: string | null
          id: string
          last_sync: string | null
          provider_code: string
          provider_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_status?: string
          consent_expires_at?: string | null
          consent_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync?: string | null
          provider_code: string
          provider_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_status?: string
          consent_expires_at?: string | null
          consent_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync?: string | null
          provider_code?: string
          provider_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          account_id: string | null
          amount: number
          auto_create: boolean | null
          category_id: string | null
          created_at: string
          day_of_month: number | null
          description: string | null
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          next_date: string
          reminder_days: number | null
          start_date: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          auto_create?: boolean | null
          category_id?: string | null
          created_at?: string
          day_of_month?: number | null
          description?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          next_date: string
          reminder_days?: number | null
          start_date: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          auto_create?: boolean | null
          category_id?: string | null
          created_at?: string
          day_of_month?: number | null
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          next_date?: string
          reminder_days?: number | null
          start_date?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_contributions: {
        Row: {
          amount: number
          contribution_date: string
          created_at: string
          goal_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          amount: number
          contribution_date: string
          created_at?: string
          goal_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          contribution_date?: string
          created_at?: string
          goal_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          category: string | null
          color: string | null
          created_at: string
          current_amount: number | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          monthly_target: number | null
          name: string
          target_amount: number
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string
          current_amount?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          monthly_target?: number | null
          name: string
          target_amount: number
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string
          current_amount?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          monthly_target?: number | null
          name?: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sync_history: {
        Row: {
          account_id: string | null
          connection_id: string | null
          created_at: string
          error_message: string | null
          id: string
          sync_end: string | null
          sync_start: string
          sync_status: string
          sync_type: string
          transactions_added: number | null
          transactions_updated: number | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          connection_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          sync_end?: string | null
          sync_start?: string
          sync_status: string
          sync_type: string
          transactions_added?: number | null
          transactions_updated?: number | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          connection_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          sync_end?: string | null
          sync_start?: string
          sync_status?: string
          sync_type?: string
          transactions_added?: number | null
          transactions_updated?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_history_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "open_banking_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          is_maaser_relevant: boolean | null
          is_recurring: boolean | null
          merchant_name: string | null
          notes: string | null
          recurring_rule_id: string | null
          tags: string[] | null
          transaction_date: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_maaser_relevant?: boolean | null
          is_recurring?: boolean | null
          merchant_name?: string | null
          notes?: string | null
          recurring_rule_id?: string | null
          tags?: string[] | null
          transaction_date: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_maaser_relevant?: boolean | null
          is_recurring?: boolean | null
          merchant_name?: string | null
          notes?: string | null
          recurring_rule_id?: string | null
          tags?: string[] | null
          transaction_date?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          auto_categorize: boolean | null
          budget_alert_enabled: boolean | null
          budget_alert_threshold: number | null
          created_at: string
          currency: string | null
          id: string
          locale: string | null
          maaser_calculation_method: string | null
          maaser_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_categorize?: boolean | null
          budget_alert_enabled?: boolean | null
          budget_alert_threshold?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          locale?: string | null
          maaser_calculation_method?: string | null
          maaser_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_categorize?: boolean | null
          budget_alert_enabled?: boolean | null
          budget_alert_threshold?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          locale?: string | null
          maaser_calculation_method?: string | null
          maaser_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
