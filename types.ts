export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      dogs: {
        Row: {
          age: number | null
          breed: string
          created_at: string
          energy_level: string | null
          household_id: string
          id: string
          name: string
          special_needs: string | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          breed: string
          created_at?: string
          energy_level?: string | null
          household_id: string
          id?: string
          name: string
          special_needs?: string | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          breed?: string
          created_at?: string
          energy_level?: string | null
          household_id?: string
          id?: string
          name?: string
          special_needs?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dogs_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          id: string
          name: string
          password: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          password: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          password?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          achievements: Json | null
          created_at: string
          email: string | null
          household_id: string
          id: string
          name: string
          profile_picture: string | null
          role: string
          total_walk_duration: number | null
          walk_count: number | null
        }
        Insert: {
          achievements?: Json | null
          created_at?: string
          email?: string | null
          household_id: string
          id?: string
          name: string
          profile_picture?: string | null
          role: string
          total_walk_duration?: number | null
          walk_count?: number | null
        }
        Update: {
          achievements?: Json | null
          created_at?: string
          email?: string | null
          household_id?: string
          id?: string
          name?: string
          profile_picture?: string | null
          role?: string
          total_walk_duration?: number | null
          walk_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          accepted_by: string | null
          created_at: string
          household_id: string
          id: string
          message: string
          read: boolean
          related_id: string | null
          time: string
          title: string
          type: string
        }
        Insert: {
          accepted_by?: string | null
          created_at?: string
          household_id: string
          id?: string
          message: string
          read?: boolean
          related_id?: string | null
          time?: string
          title: string
          type: string
        }
        Update: {
          accepted_by?: string | null
          created_at?: string
          household_id?: string
          id?: string
          message?: string
          read?: boolean
          related_id?: string | null
          time?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      walks: {
        Row: {
          activity: Json | null
          assigned_to: string | null
          created_at: string
          date: string
          dog_mood: string | null
          duration: number | null
          end_time: string | null
          household_id: string
          id: string
          notes: string | null
          start_time: string | null
          status: string
        }
        Insert: {
          activity?: Json | null
          assigned_to?: string | null
          created_at?: string
          date: string
          dog_mood?: string | null
          duration?: number | null
          end_time?: string | null
          household_id: string
          id?: string
          notes?: string | null
          start_time?: string | null
          status: string
        }
        Update: {
          activity?: Json | null
          assigned_to?: string | null
          created_at?: string
          date?: string
          dog_mood?: string | null
          duration?: number | null
          end_time?: string | null
          household_id?: string
          id?: string
          notes?: string | null
          start_time?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "walks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "walks_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
