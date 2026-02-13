-- =============================================
-- CAM — Capital Allocation Manager Tables
-- =============================================

-- Investment Cases: the core CAM entity
CREATE TABLE investment_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  stage TEXT NOT NULL DEFAULT 'ideation'
    CHECK (stage IN ('ideation','discovery','business_case','approval','execution','review')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','in_progress','submitted','approved','rejected','tracking')),
  initiative_type TEXT
    CHECK (initiative_type IS NULL OR initiative_type IN (
      'new_product_platform','major_feature_enhancement',
      'efficiency_automation','compliance_regulatory','client_retention_defensive'
    )),
  revenue_model TEXT
    CHECK (revenue_model IS NULL OR revenue_model IN (
      'pmpm_subscription','per_claim_transaction','contingency_savings','hybrid'
    )),
  investment_amount NUMERIC,
  timeline_months INTEGER,
  assumptions JSONB NOT NULL DEFAULT '{}'::jsonb,
  financials JSONB NOT NULL DEFAULT '{}'::jsonb,
  memo_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE TRIGGER set_updated_at_investment_cases
  BEFORE UPDATE ON investment_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Wizard Conversations: AI interview history per case
CREATE TABLE wizard_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES investment_cases(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case Comments: reviewer feedback
CREATE TABLE case_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES investment_cases(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_investment_cases_owner ON investment_cases(owner_id);
CREATE INDEX idx_investment_cases_status ON investment_cases(status);
CREATE INDEX idx_investment_cases_stage ON investment_cases(stage);
CREATE INDEX idx_wizard_conversations_case ON wizard_conversations(case_id);
CREATE INDEX idx_case_comments_case ON case_comments(case_id);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE investment_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE wizard_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_comments ENABLE ROW LEVEL SECURITY;

-- Investment Cases: authenticated users can read all, create their own, update their own (admins can update any)
CREATE POLICY "Anyone authenticated can view cases"
  ON investment_cases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create cases"
  ON investment_cases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners and admins can update cases"
  ON investment_cases FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = owner_id
    OR public.user_role() = 'admin'
  );

CREATE POLICY "Admins can delete cases"
  ON investment_cases FOR DELETE
  TO authenticated
  USING (public.user_role() = 'admin');

-- Wizard Conversations: same access as parent case
CREATE POLICY "Anyone authenticated can view conversations"
  ON wizard_conversations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Case owners can create conversations"
  ON wizard_conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM investment_cases
      WHERE id = case_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Case owners can update conversations"
  ON wizard_conversations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investment_cases
      WHERE id = case_id AND owner_id = auth.uid()
    )
  );

-- Case Comments: anyone can read, authenticated can create
CREATE POLICY "Anyone authenticated can view comments"
  ON case_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON case_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and admins can delete comments"
  ON case_comments FOR DELETE
  TO authenticated
  USING (
    auth.uid() = author_id
    OR public.user_role() = 'admin'
  );
