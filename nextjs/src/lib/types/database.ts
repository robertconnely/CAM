export type UserRole = "admin" | "editor" | "viewer";
export type InitiativeStatus = "on_track" | "at_risk" | "blocked" | "complete";
export type GateDecision = "go" | "no_go" | "pivot" | "park";
export type GovernanceTier = "tier_1" | "tier_2" | "tier_3" | "tier_4";

export type InitiativeType =
  | "new_product_platform"
  | "major_feature_enhancement"
  | "efficiency_automation"
  | "compliance_regulatory"
  | "client_retention_defensive";

export type RevenueModel =
  | "pmpm_subscription"
  | "per_claim_transaction"
  | "contingency_savings"
  | "hybrid";

export type CapitalBand = "band_a" | "band_b" | "band_c" | "band_d";
export type CapitalRecommendation = "strong_go" | "go" | "consider" | "hold";

export type ContentBlockType =
  | "subtitle"
  | "quick_summary"
  | "heading"
  | "paragraph"
  | "list"
  | "figma_embed"
  | "image_gallery"
  | "key_documents"
  | "coming_soon"
  | "html";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      sections: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          icon: string;
          category_id: string;
          keywords: string[];
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description: string;
          icon: string;
          category_id: string;
          keywords?: string[];
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string;
          icon?: string;
          category_id?: string;
          keywords?: string[];
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      content_blocks: {
        Row: {
          id: string;
          section_id: string;
          block_type: ContentBlockType;
          content: Record<string, unknown>;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          block_type: ContentBlockType;
          content: Record<string, unknown>;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          block_type?: ContentBlockType;
          content?: Record<string, unknown>;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          section_id: string;
          title: string;
          storage_path: string;
          file_type: string;
          icon: string;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          title: string;
          storage_path: string;
          file_type: string;
          icon?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          title?: string;
          storage_path?: string;
          file_type?: string;
          icon?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      toc_items: {
        Row: {
          id: string;
          section_id: string;
          label: string;
          anchor: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          label: string;
          anchor: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          label?: string;
          anchor?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      pdlc_phases: {
        Row: {
          id: string;
          name: string;
          label: string;
          description: string | null;
          gate_description: string | null;
          typical_duration: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          label: string;
          description?: string | null;
          gate_description?: string | null;
          typical_duration?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          label?: string;
          description?: string | null;
          gate_description?: string | null;
          typical_duration?: string | null;
          display_order?: number;
          created_at?: string;
        };
      };
      initiatives: {
        Row: {
          id: string;
          initiative_id: string;
          name: string;
          tier: GovernanceTier;
          current_phase_id: string;
          phase_start_date: string | null;
          target_gate_date: string | null;
          actual_gate_date: string | null;
          status: InitiativeStatus;
          owner_id: string | null;
          owner_name: string | null;
          irr: number | null;
          contribution_margin: number | null;
          strategic_score: number | null;
          priority_rank: number | null;
          notes: string | null;
          created_by: string | null;
          investment_case_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          initiative_id: string;
          name: string;
          tier?: GovernanceTier;
          current_phase_id: string;
          phase_start_date?: string | null;
          target_gate_date?: string | null;
          actual_gate_date?: string | null;
          status?: InitiativeStatus;
          owner_id?: string | null;
          owner_name?: string | null;
          irr?: number | null;
          contribution_margin?: number | null;
          strategic_score?: number | null;
          priority_rank?: number | null;
          notes?: string | null;
          created_by?: string | null;
          investment_case_id?: string | null;
        };
        Update: {
          initiative_id?: string;
          name?: string;
          tier?: GovernanceTier;
          current_phase_id?: string;
          phase_start_date?: string | null;
          target_gate_date?: string | null;
          actual_gate_date?: string | null;
          status?: InitiativeStatus;
          owner_id?: string | null;
          owner_name?: string | null;
          irr?: number | null;
          contribution_margin?: number | null;
          strategic_score?: number | null;
          priority_rank?: number | null;
          notes?: string | null;
        };
      };
      gate_reviews: {
        Row: {
          id: string;
          initiative_id: string;
          gate_name: string;
          phase_id: string;
          review_date: string;
          reviewers: string[];
          decision: GateDecision;
          conditions: string | null;
          next_gate_date: string | null;
          notes: string | null;
          recorded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          initiative_id: string;
          gate_name: string;
          phase_id: string;
          review_date: string;
          reviewers?: string[];
          decision: GateDecision;
          conditions?: string | null;
          next_gate_date?: string | null;
          notes?: string | null;
          recorded_by?: string | null;
        };
        Update: {
          initiative_id?: string;
          gate_name?: string;
          phase_id?: string;
          review_date?: string;
          reviewers?: string[];
          decision?: GateDecision;
          conditions?: string | null;
          next_gate_date?: string | null;
          notes?: string | null;
        };
      };
      capital_scores: {
        Row: {
          id: string;
          initiative_id: string;
          initiative_type: InitiativeType;
          revenue_model: RevenueModel;
          investment_amount: number | null;
          timeline_months: number | null;
          irr_value: number;
          irr_threshold_min: number;
          irr_threshold_target: number | null;
          irr_pass: boolean;
          contribution_margin_value: number;
          cm_threshold_min: number;
          cm_pass: boolean;
          financial_gate_pass: boolean;
          score_financial_return: number | null;
          score_strategic_alignment: number | null;
          score_competitive_impact: number | null;
          score_client_demand: number | null;
          score_execution_feasibility: number | null;
          notes_financial_return: string | null;
          notes_strategic_alignment: string | null;
          notes_competitive_impact: string | null;
          notes_client_demand: string | null;
          notes_execution_feasibility: string | null;
          weighted_score: number | null;
          band: CapitalBand | null;
          recommendation: CapitalRecommendation | null;
          scored_by: string | null;
          scored_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          initiative_id: string;
          initiative_type: InitiativeType;
          revenue_model: RevenueModel;
          investment_amount?: number | null;
          timeline_months?: number | null;
          irr_value: number;
          irr_threshold_min: number;
          irr_threshold_target?: number | null;
          irr_pass: boolean;
          contribution_margin_value: number;
          cm_threshold_min: number;
          cm_pass: boolean;
          financial_gate_pass: boolean;
          score_financial_return?: number | null;
          score_strategic_alignment?: number | null;
          score_competitive_impact?: number | null;
          score_client_demand?: number | null;
          score_execution_feasibility?: number | null;
          notes_financial_return?: string | null;
          notes_strategic_alignment?: string | null;
          notes_competitive_impact?: string | null;
          notes_client_demand?: string | null;
          notes_execution_feasibility?: string | null;
          weighted_score?: number | null;
          band?: CapitalBand | null;
          recommendation?: CapitalRecommendation | null;
          scored_by?: string | null;
          scored_at?: string;
        };
        Update: {
          initiative_type?: InitiativeType;
          revenue_model?: RevenueModel;
          investment_amount?: number | null;
          timeline_months?: number | null;
          irr_value?: number;
          irr_threshold_min?: number;
          irr_threshold_target?: number | null;
          irr_pass?: boolean;
          contribution_margin_value?: number;
          cm_threshold_min?: number;
          cm_pass?: boolean;
          financial_gate_pass?: boolean;
          score_financial_return?: number | null;
          score_strategic_alignment?: number | null;
          score_competitive_impact?: number | null;
          score_client_demand?: number | null;
          score_execution_feasibility?: number | null;
          notes_financial_return?: string | null;
          notes_strategic_alignment?: string | null;
          notes_competitive_impact?: string | null;
          notes_client_demand?: string | null;
          notes_execution_feasibility?: string | null;
          weighted_score?: number | null;
          band?: CapitalBand | null;
          recommendation?: CapitalRecommendation | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      content_block_type: ContentBlockType;
      initiative_status: InitiativeStatus;
      gate_decision: GateDecision;
      governance_tier: GovernanceTier;
      initiative_type: InitiativeType;
      revenue_model: RevenueModel;
      capital_band: CapitalBand;
      capital_recommendation: CapitalRecommendation;
    };
  };
}

// =============================================
// CAM Types
// =============================================

export type CaseStage = "ideation" | "discovery" | "business_case" | "approval" | "execution" | "review";
export type CaseStatus = "draft" | "in_progress" | "submitted" | "approved" | "rejected" | "tracking";

export interface InvestmentCase {
  id: string;
  title: string;
  description: string | null;
  owner_id: string | null;
  stage: CaseStage;
  status: CaseStatus;
  initiative_type: InitiativeType | null;
  revenue_model: RevenueModel | null;
  investment_amount: number | null;
  timeline_months: number | null;
  assumptions: CaseAssumptions;
  financials: CaseFinancials;
  memo_content: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseAssumptions {
  monthly_price?: number;
  year1_customers?: number;
  revenue_growth_pct?: number;
  gross_margin_pct?: number;
  discount_rate?: number;
  projection_years?: number;
  investment_amount?: number;
  [key: string]: number | string | undefined;
}

export interface CaseFinancials {
  npv?: number;
  irr?: number;
  payback_months?: number;
  annual_revenue?: number;
  cash_flows?: number[];
  total_revenue_5yr?: number;
  contribution_margin?: number;
  [key: string]: number | number[] | undefined;
}

export interface WizardConversation {
  id: string;
  case_id: string;
  messages: WizardMessage[];
  completed: boolean;
  created_at: string;
}

export interface WizardMessage {
  role: "cam" | "user";
  text: string;
  timestamp?: string;
}

export interface CaseComment {
  id: string;
  case_id: string;
  author_id: string;
  author_name?: string;
  content: string;
  created_at: string;
}

export type NotificationType = "case_submitted" | "case_scored" | "comment_added";

export interface Notification {
  id: string;
  recipient_id: string;
  type: NotificationType;
  case_id: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Section = Database["public"]["Tables"]["sections"]["Row"];
export type ContentBlock = Database["public"]["Tables"]["content_blocks"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type TocItem = Database["public"]["Tables"]["toc_items"]["Row"];
export type PdlcPhase = Database["public"]["Tables"]["pdlc_phases"]["Row"];
export type Initiative = Database["public"]["Tables"]["initiatives"]["Row"];
export type GateReview = Database["public"]["Tables"]["gate_reviews"]["Row"];
export type CapitalScore = Database["public"]["Tables"]["capital_scores"]["Row"];
