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
      categories: {
        Row: {
          icon_name: string | null
          id: number
          is_product_category: boolean | null
          menu_name: string
          name: string
        }
        Insert: {
          icon_name?: string | null
          id?: number
          is_product_category?: boolean | null
          menu_name: string
          name: string
        }
        Update: {
          icon_name?: string | null
          id?: number
          is_product_category?: boolean | null
          menu_name?: string
          name?: string
        }
        Relationships: []
      }
      categoriesd: {
        Row: {
          created_at: string | null
          href: string
          id: string
          name: string
          order_index: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          href: string
          id?: string
          name: string
          order_index: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          href?: string
          id?: string
          name?: string
          order_index?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      categoryss: {
        Row: {
          id: number
          name: string
          type: string
        }
        Insert: {
          id?: number
          name: string
          type: string
        }
        Update: {
          id?: number
          name?: string
          type?: string
        }
        Relationships: []
      }
      change: {
        Row: {
          id: number
          name: string
          subcategory_id: number | null
        }
        Insert: {
          id?: number
          name: string
          subcategory_id?: number | null
        }
        Update: {
          id?: number
          name?: string
          subcategory_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      footer_content: {
        Row: {
          address: string | null
          address_label: string | null
          club_name: string | null
          copyright_text: string | null
          created_at: string | null
          footer_image_url: string | null
          id: string
          logo_url: string | null
          navigation_links: Json | null
          service_area: string | null
          service_area_label: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          address_label?: string | null
          club_name?: string | null
          copyright_text?: string | null
          created_at?: string | null
          footer_image_url?: string | null
          id?: string
          logo_url?: string | null
          navigation_links?: Json | null
          service_area?: string | null
          service_area_label?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          address_label?: string | null
          club_name?: string | null
          copyright_text?: string | null
          created_at?: string | null
          footer_image_url?: string | null
          id?: string
          logo_url?: string | null
          navigation_links?: Json | null
          service_area?: string | null
          service_area_label?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      footer_contentn: {
        Row: {
          fields: Json
          id: string
        }
        Insert: {
          fields?: Json
          id?: string
        }
        Update: {
          fields?: Json
          id?: string
        }
        Relationships: []
      }
      footer_contents: {
        Row: {
          created_at: string | null
          footer_data: Json
          id: number
        }
        Insert: {
          created_at?: string | null
          footer_data: Json
          id?: number
        }
        Update: {
          created_at?: string | null
          footer_data?: Json
          id?: number
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
      header_details: {
        Row: {
          address: string
          buttons: Json
          email: string
          hours_of_operation: string
          id: number
          logo: string
          phone: string
          social_media: Json
        }
        Insert: {
          address: string
          buttons: Json
          email: string
          hours_of_operation: string
          id?: number
          logo: string
          phone: string
          social_media: Json
        }
        Update: {
          address?: string
          buttons?: Json
          email?: string
          hours_of_operation?: string
          id?: number
          logo?: string
          phone?: string
          social_media?: Json
        }
        Relationships: []
      }
      header_detailsd: {
        Row: {
          address: string
          buttons: Json
          email: string
          hours_of_operation: string
          id: string
          logo: string
          phone: string
          social_media: Json
        }
        Insert: {
          address: string
          buttons: Json
          email: string
          hours_of_operation: string
          id?: string
          logo: string
          phone: string
          social_media: Json
        }
        Update: {
          address?: string
          buttons?: Json
          email?: string
          hours_of_operation?: string
          id?: string
          logo?: string
          phone?: string
          social_media?: Json
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
      menu_items: {
        Row: {
          created_at: string | null
          href: string
          id: string
          name: string
          order_index: number
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          href: string
          id?: string
          name: string
          order_index: number
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          href?: string
          id?: string
          name?: string
          order_index?: number
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_itemsd: {
        Row: {
          created_at: string | null
          href: string
          id: string
          is_category: boolean | null
          name: string
          order_index: number
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          href: string
          id?: string
          is_category?: boolean | null
          name: string
          order_index: number
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          href?: string
          id?: string
          is_category?: boolean | null
          name?: string
          order_index?: number
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_itemsd_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_itemsd"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_items: {
        Row: {
          created_at: string | null
          id: string
          is_category: boolean | null
          name: string
          order_index: number
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_category?: boolean | null
          name: string
          order_index: number
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_category?: boolean | null
          name?: string
          order_index?: number
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      otps: {
        Row: {
          created_at: string | null
          email: string
          id: number
          otp: number
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: number
          otp: number
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: number
          otp?: number
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          title?: string
        }
        Relationships: []
      }
      product: {
        Row: {
          description: string
          id: number
          name: string
          price: number
          subcategory_id: number | null
        }
        Insert: {
          description: string
          id?: number
          name: string
          price: number
          subcategory_id?: number | null
        }
        Update: {
          description?: string
          id?: number
          name?: string
          price?: number
          subcategory_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_details: {
        Row: {
          amenities: Json | null
          description: string | null
          hero_image: string | null
          icon: string | null
          id: number
          images: Json | null
          product_id: number | null
          specifications: Json | null
          subtitle: string | null
          title: string | null
        }
        Insert: {
          amenities?: Json | null
          description?: string | null
          hero_image?: string | null
          icon?: string | null
          id?: number
          images?: Json | null
          product_id?: number | null
          specifications?: Json | null
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          amenities?: Json | null
          description?: string | null
          hero_image?: string | null
          icon?: string | null
          id?: number
          images?: Json | null
          product_id?: number | null
          specifications?: Json | null
          subtitle?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      register: {
        Row: {
          created_at: string | null
          email: string
          id: number
          name: string | null
          password: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: number
          name?: string | null
          password: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: number
          name?: string | null
          password?: string
        }
        Relationships: []
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
      subcategories: {
        Row: {
          category_id: number | null
          id: number
          name: string
        }
        Insert: {
          category_id?: number | null
          id?: number
          name: string
        }
        Update: {
          category_id?: number | null
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategoriesd: {
        Row: {
          category_id: string | null
          created_at: string | null
          href: string
          id: string
          name: string
          order_index: number
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          href: string
          id?: string
          name: string
          order_index: number
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          href?: string
          id?: string
          name?: string
          order_index?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategoriesd_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categoriesd"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategory: {
        Row: {
          category_id: number | null
          id: number
          name: string
        }
        Insert: {
          category_id?: number | null
          id?: number
          name: string
        }
        Update: {
          category_id?: number | null
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategory_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categoryss"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_details: {
        Row: {
          content: Json
          id: number
          section_type: string
          vehicle_id: number | null
        }
        Insert: {
          content: Json
          id?: number
          section_type: string
          vehicle_id?: number | null
        }
        Update: {
          content?: Json
          id?: number
          section_type?: string
          vehicle_id?: number | null
        }
        Relationships: []
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
      vehicle_detailss: {
        Row: {
          created_at: string | null
          id: number
          vehicle_name: string
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          vehicle_name: string
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          vehicle_name?: string
          vehicle_type?: string | null
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
