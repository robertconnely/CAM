-- =============================================
-- Capital Allocation Scoring — Schema
-- =============================================

-- Custom Types
CREATE TYPE initiative_type AS ENUM (
  'new_product_platform',
  'major_feature_enhancement',
  'efficiency_automation',
  'compliance_regulatory',
  'client_retention_defensive'
);

CREATE TYPE revenue_model AS ENUM (
  'pmpm_subscription',
  'per_claim_transaction',
  'contingency_savings',
  'hybrid'
);

CREATE TYPE capital_band AS ENUM ('band_a', 'band_b', 'band_c', 'band_d');

CREATE TYPE capital_recommendation AS ENUM ('strong_go', 'go', 'consider', 'hold');

-- =============================================
-- Table
-- =============================================

CREATE TABLE capital_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,

  -- Classification
  initiative_type initiative_type NOT NULL,
  revenue_model revenue_model NOT NULL,
  investment_amount NUMERIC(14,2),
  timeline_months INTEGER,

  -- Financial Inclusion Gate: IRR
  irr_value NUMERIC(6,2) NOT NULL,
  irr_threshold_min NUMERIC(6,2) NOT NULL,
  irr_threshold_target NUMERIC(6,2),
  irr_pass BOOLEAN NOT NULL,

  -- Financial Inclusion Gate: CM%
  contribution_margin_value NUMERIC(6,2) NOT NULL,
  cm_threshold_min NUMERIC(6,2) NOT NULL,
  cm_pass BOOLEAN NOT NULL,

  -- Combined gate
  financial_gate_pass BOOLEAN NOT NULL,

  -- Strategic Scoring (1-5 per dimension)
  score_financial_return SMALLINT CHECK (score_financial_return >= 1 AND score_financial_return <= 5),
  score_strategic_alignment SMALLINT CHECK (score_strategic_alignment >= 1 AND score_strategic_alignment <= 5),
  score_competitive_impact SMALLINT CHECK (score_competitive_impact >= 1 AND score_competitive_impact <= 5),
  score_client_demand SMALLINT CHECK (score_client_demand >= 1 AND score_client_demand <= 5),
  score_execution_feasibility SMALLINT CHECK (score_execution_feasibility >= 1 AND score_execution_feasibility <= 5),

  -- Dimension notes
  notes_financial_return TEXT,
  notes_strategic_alignment TEXT,
  notes_competitive_impact TEXT,
  notes_client_demand TEXT,
  notes_execution_feasibility TEXT,

  -- Computed results (stored for history)
  weighted_score NUMERIC(4,2),
  band capital_band,
  recommendation capital_recommendation,

  -- Metadata
  scored_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX idx_capital_scores_initiative ON capital_scores(initiative_id);
CREATE INDEX idx_capital_scores_scored_at ON capital_scores(scored_at DESC);
CREATE INDEX idx_capital_scores_band ON capital_scores(band);
CREATE INDEX idx_capital_scores_recommendation ON capital_scores(recommendation);

-- =============================================
-- Updated_at trigger
-- =============================================

CREATE TRIGGER capital_scores_updated_at
  BEFORE UPDATE ON capital_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE capital_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view capital scores"
  ON capital_scores FOR SELECT TO authenticated USING (true);

CREATE POLICY "Editors and admins can insert capital scores"
  ON capital_scores FOR INSERT TO authenticated
  WITH CHECK (public.user_role() IN ('editor', 'admin'));

CREATE POLICY "Editors and admins can update capital scores"
  ON capital_scores FOR UPDATE TO authenticated
  USING (public.user_role() IN ('editor', 'admin'));

CREATE POLICY "Admins can delete capital scores"
  ON capital_scores FOR DELETE TO authenticated
  USING (public.user_role() = 'admin');
