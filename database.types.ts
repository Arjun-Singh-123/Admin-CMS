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
      about_section: {
        Row: {
          button_text: string | null
          created_at: string | null
          description_1: string
          description_2: string
          id: string
          image_url: string | null
          subtitle: string
          title: string
          updated_at: string | null
        }
        Insert: {
          button_text?: string | null
          created_at?: string | null
          description_1: string
          description_2: string
          id?: string
          image_url?: string | null
          subtitle: string
          title: string
          updated_at?: string | null
        }
        Update: {
          button_text?: string | null
          created_at?: string | null
          description_1?: string
          description_2?: string
          id?: string
          image_url?: string | null
          subtitle?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      boats: {
        Row: {
          availability_time: string
          available_no: number
          booked_by_email: string | null
          booked_by_name: string | null
          booked_by_phone: string | null
          booked_end_date: string | null
          booked_start_date: string | null
          booked_status: string
          id: number
          name: string
          size: string
        }
        Insert: {
          availability_time: string
          available_no: number
          booked_by_email?: string | null
          booked_by_name?: string | null
          booked_by_phone?: string | null
          booked_end_date?: string | null
          booked_start_date?: string | null
          booked_status: string
          id?: number
          name: string
          size: string
        }
        Update: {
          availability_time?: string
          available_no?: number
          booked_by_email?: string | null
          booked_by_name?: string | null
          booked_by_phone?: string | null
          booked_end_date?: string | null
          booked_start_date?: string | null
          booked_status?: string
          id?: number
          name?: string
          size?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          button_style: string | null
          created_at: string
          display_order: number
          icon: string | null
          id: string
          label: string
          platform: string | null
          position: string
          status: string
          type: string
          updated_at: string
          value: string
        }
        Insert: {
          button_style?: string | null
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          label: string
          platform?: string | null
          position?: string
          status?: string
          type: string
          updated_at?: string
          value: string
        }
        Update: {
          button_style?: string | null
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          label?: string
          platform?: string | null
          position?: string
          status?: string
          type?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      footer_contentsa: {
        Row: {
          content: Json
          id: string
        }
        Insert: {
          content?: Json
          id?: string
        }
        Update: {
          content?: Json
          id?: string
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          id: number
          is_visible: boolean | null
          page: string
          section_name: string
        }
        Insert: {
          id?: number
          is_visible?: boolean | null
          page: string
          section_name: string
        }
        Update: {
          id?: number
          is_visible?: boolean | null
          page?: string
          section_name?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          about: string | null
          email: string
          id: number
          image: string | null
          name: string
          phone: string | null
          profession: string | null
        }
        Insert: {
          about?: string | null
          email: string
          id?: number
          image?: string | null
          name: string
          phone?: string | null
          profession?: string | null
        }
        Update: {
          about?: string | null
          email?: string
          id?: number
          image?: string | null
          name?: string
          phone?: string | null
          profession?: string | null
        }
        Relationships: []
      }
      members_new: {
        Row: {
          about: string | null
          access: string
          address1: string | null
          address2: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          id: string
          job_role: string | null
          name: string
          phone: string | null
          profile_image_url: string | null
          state: string | null
          updated_at: string | null
          zipcode: string | null
        }
        Insert: {
          about?: string | null
          access: string
          address1?: string | null
          address2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          id?: string
          job_role?: string | null
          name: string
          phone?: string | null
          profile_image_url?: string | null
          state?: string | null
          updated_at?: string | null
          zipcode?: string | null
        }
        Update: {
          about?: string | null
          access?: string
          address1?: string | null
          address2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          id?: string
          job_role?: string | null
          name?: string
          phone?: string | null
          profile_image_url?: string | null
          state?: string | null
          updated_at?: string | null
          zipcode?: string | null
        }
        Relationships: []
      }
      nav_items: {
        Row: {
          created_at: string | null
          href: string
          id: string
          name: string
          priority: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          href: string
          id?: string
          name: string
          priority?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          href?: string
          id?: string
          name?: string
          priority?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      nav_sections: {
        Row: {
          created_at: string | null
          href: string
          id: string
          name: string
          parent_id: string | null
          slug: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          href: string
          id?: string
          name: string
          parent_id?: string | null
          slug?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          href?: string
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nav_sections_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "nav_items"
            referencedColumns: ["id"]
          },
        ]
      }
      product_details: {
        Row: {
          amenities: Json | null
          created_at: string | null
          description: string | null
          hero_image: string[] | null
          icon: string | null
          id: string
          images: Json | null
          product_id: string | null
          specifications: Json | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amenities?: Json | null
          created_at?: string | null
          description?: string | null
          hero_image?: string[] | null
          icon?: string | null
          id?: string
          images?: Json | null
          product_id?: string | null
          specifications?: Json | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amenities?: Json | null
          created_at?: string | null
          description?: string | null
          hero_image?: string[] | null
          icon?: string | null
          id?: string
          images?: Json | null
          product_id?: string | null
          specifications?: Json | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          href: string | null
          id: string
          image_url: string | null
          name: string
          nav_section_id: string | null
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          href?: string | null
          id?: string
          image_url?: string | null
          name: string
          nav_section_id?: string | null
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          href?: string | null
          id?: string
          image_url?: string | null
          name?: string
          nav_section_id?: string | null
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_nav_section_id_fkey"
            columns: ["nav_section_id"]
            isOneToOne: false
            referencedRelation: "nav_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      rentals: {
        Row: {
          id: string
          members: Json
          non_members: Json
        }
        Insert: {
          id?: string
          members: Json
          non_members: Json
        }
        Update: {
          id?: string
          members?: Json
          non_members?: Json
        }
        Relationships: []
      }
      sections: {
        Row: {
          content: Json | null
          description: string | null
          display_order: number
          icon: string | null
          id: string
          image: string | null
          is_visible: boolean | null
          name: string
          status: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          content?: Json | null
          description?: string | null
          display_order: number
          icon?: string | null
          id?: string
          image?: string | null
          is_visible?: boolean | null
          name: string
          status?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          content?: Json | null
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          image?: string | null
          is_visible?: boolean | null
          name?: string
          status?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: []
      }
      stats: {
        Row: {
          emoji: string
          id: number
          label: string
          value: number
        }
        Insert: {
          emoji: string
          id?: never
          label: string
          value: number
        }
        Update: {
          emoji?: string
          id?: never
          label?: string
          value?: number
        }
        Relationships: []
      }
      stats_section: {
        Row: {
          created_at: string | null
          destination_count: number
          id: string
          satisfied_count: number
          updated_at: string | null
          yachts_count: number
        }
        Insert: {
          created_at?: string | null
          destination_count: number
          id?: string
          satisfied_count: number
          updated_at?: string | null
          yachts_count: number
        }
        Update: {
          created_at?: string | null
          destination_count?: number
          id?: string
          satisfied_count?: number
          updated_at?: string | null
          yachts_count?: number
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          cpu: number
          id: number
          memory: number
          timestamp: string
        }
        Insert: {
          cpu: number
          id?: number
          memory: number
          timestamp?: string
        }
        Update: {
          cpu?: number
          id?: number
          memory?: number
          timestamp?: string
        }
        Relationships: []
      }
      user_selections: {
        Row: {
          created_at: string | null
          id: string
          is_external_image: boolean | null
          product_id: string | null
          section_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_external_image?: boolean | null
          product_id?: string | null
          section_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_external_image?: boolean | null
          product_id?: string | null
          section_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_selections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_selections_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_details_new: {
        Row: {
          content: Json | null
          id: number
          vehicle_id: number | null
        }
        Insert: {
          content?: Json | null
          id?: number
          vehicle_id?: number | null
        }
        Update: {
          content?: Json | null
          id?: number
          vehicle_id?: number | null
        }
        Relationships: []
      }
      vessels: {
        Row: {
          autopilot: boolean | null
          bbq: boolean | null
          bimini: boolean | null
          cabins: number | null
          cockpit_table: boolean | null
          depth_fish: boolean | null
          dodger: boolean | null
          fuel_tank_size: number | null
          gps: boolean | null
          head_shower: boolean | null
          heater: boolean | null
          ice_box: boolean | null
          id: string
          marine_radio: boolean | null
          max_persons: number | null
          mfg: string
          microwave: boolean | null
          microwave_stove: boolean | null
          refrigerator: boolean | null
          sails: boolean | null
          shower_system: boolean | null
          size: number
          stereo: boolean | null
          stove: boolean | null
          swim_platform: boolean | null
          vessel: string
          water_tank_size: number | null
        }
        Insert: {
          autopilot?: boolean | null
          bbq?: boolean | null
          bimini?: boolean | null
          cabins?: number | null
          cockpit_table?: boolean | null
          depth_fish?: boolean | null
          dodger?: boolean | null
          fuel_tank_size?: number | null
          gps?: boolean | null
          head_shower?: boolean | null
          heater?: boolean | null
          ice_box?: boolean | null
          id?: string
          marine_radio?: boolean | null
          max_persons?: number | null
          mfg: string
          microwave?: boolean | null
          microwave_stove?: boolean | null
          refrigerator?: boolean | null
          sails?: boolean | null
          shower_system?: boolean | null
          size: number
          stereo?: boolean | null
          stove?: boolean | null
          swim_platform?: boolean | null
          vessel: string
          water_tank_size?: number | null
        }
        Update: {
          autopilot?: boolean | null
          bbq?: boolean | null
          bimini?: boolean | null
          cabins?: number | null
          cockpit_table?: boolean | null
          depth_fish?: boolean | null
          dodger?: boolean | null
          fuel_tank_size?: number | null
          gps?: boolean | null
          head_shower?: boolean | null
          heater?: boolean | null
          ice_box?: boolean | null
          id?: string
          marine_radio?: boolean | null
          max_persons?: number | null
          mfg?: string
          microwave?: boolean | null
          microwave_stove?: boolean | null
          refrigerator?: boolean | null
          sails?: boolean | null
          shower_system?: boolean | null
          size?: number
          stereo?: boolean | null
          stove?: boolean | null
          swim_platform?: boolean | null
          vessel?: string
          water_tank_size?: number | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
