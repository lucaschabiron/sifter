export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          confirmed_at: string | null;
          email: string | null;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          confirmed_at?: string | null;
          email?: string | null;
          id: string;
          updated_at?: string | null;
        };
        Update: {
          confirmed_at?: string | null;
          email?: string | null;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      sifts: {
        Row: {
          id: number;
          user_id: string;
          title: string;
          topic: string;
          usual_sources: string;
          frequency: 'daily' | 'weekly' | 'monthly';
          content_preference: 'summaries' | 'detailed' | 'mixed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          title: string;
          topic: string;
          usual_sources?: string;
          frequency: 'daily' | 'weekly' | 'monthly';
          content_preference: 'summaries' | 'detailed' | 'mixed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          title?: string;
          topic?: string;
          usual_sources?: string;
          frequency?: 'daily' | 'weekly' | 'monthly';
          content_preference?: 'summaries' | 'detailed' | 'mixed';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      newsletters: {
        Row: {
          id: number;
          user_id: string;
          sift_id: number;
          title: string;
          content_markdown: string;
          article_count: number;
          sent_at: string | null;
          delivery_status: 'pending' | 'sent' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          sift_id: number;
          title: string;
          content_markdown: string;
          article_count?: number;
          sent_at?: string | null;
          delivery_status?: 'pending' | 'sent' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          sift_id?: number;
          title?: string;
          content_markdown?: string;
          article_count?: number;
          sent_at?: string | null;
          delivery_status?: 'pending' | 'sent' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "newsletters_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "newsletters_sift_id_fkey";
            columns: ["sift_id"];
            isOneToOne: false;
            referencedRelation: "sifts";
            referencedColumns: ["id"];
          }
        ];
      };
      newsletter_articles: {
        Row: {
          id: number;
          newsletter_id: number;
          title: string;
          url: string;
          summary: string | null;
          virality_score: number;
          published_at: string | null;
          source_domain: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          newsletter_id: number;
          title: string;
          url: string;
          summary?: string | null;
          virality_score?: number;
          published_at?: string | null;
          source_domain?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          newsletter_id?: number;
          title?: string;
          url?: string;
          summary?: string | null;
          virality_score?: number;
          published_at?: string | null;
          source_domain?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "newsletter_articles_newsletter_id_fkey";
            columns: ["newsletter_id"];
            isOneToOne: false;
            referencedRelation: "newsletters";
            referencedColumns: ["id"];
          }
        ];
      };
      newsletter_feedback: {
        Row: {
          id: number;
          newsletter_id: number;
          user_id: string;
          rating: number | null;
          liked_articles: number[];
          disliked_articles: number[];
          created_at: string;
        };
        Insert: {
          id?: number;
          newsletter_id: number;
          user_id: string;
          rating?: number | null;
          liked_articles?: number[];
          disliked_articles?: number[];
          created_at?: string;
        };
        Update: {
          id?: number;
          newsletter_id?: number;
          user_id?: string;
          rating?: number | null;
          liked_articles?: number[];
          disliked_articles?: number[];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "newsletter_feedback_newsletter_id_fkey";
            columns: ["newsletter_id"];
            isOneToOne: false;
            referencedRelation: "newsletters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "newsletter_feedback_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      waitlist: {
        Row: {
          beta_access: boolean;
          created_at: string;
          email: string;
          id: number;
        };
        Insert: {
          beta_access?: boolean;
          created_at?: string;
          email: string;
          id?: number;
        };
        Update: {
          beta_access?: boolean;
          created_at?: string;
          email?: string;
          id?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;
