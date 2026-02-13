-- =============================================
-- PDLC Stage Gate Tracker — Schema
-- =============================================

-- Custom Types
CREATE TYPE initiative_status AS ENUM ('on_track', 'at_risk', 'blocked', 'complete');
CREATE TYPE gate_decision AS ENUM ('go', 'no_go', 'pivot', 'park');
CREATE TYPE governance_tier AS ENUM ('tier_1', 'tier_2', 'tier_3', 'tier_4');

-- =============================================
-- Tables
-- =============================================

-- Configurable PDLC phase definitions (not an enum — easy to update)
CREATE TABLE pdlc_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  gate_description TEXT,
  typical_duration TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initiatives tracked through the PDLC pipeline
CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tier governance_tier NOT NULL DEFAULT 'tier_3',
  current_phase_id UUID NOT NULL REFERENCES pdlc_phases(id),
  phase_start_date DATE,
  target_gate_date DATE,
  actual_gate_date DATE,
  status initiative_status NOT NULL DEFAULT 'on_track',
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  owner_name TEXT,
  irr NUMERIC(5,2),
  contribution_margin NUMERIC(5,2),
  strategic_score INTEGER CHECK (strategic_score >= 0 AND strategic_score <= 100),
  priority_rank INTEGER,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gate review decisions recorded per initiative
CREATE TABLE gate_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  gate_name TEXT NOT NULL,
  phase_id UUID NOT NULL REFERENCES pdlc_phases(id),
  review_date DATE NOT NULL,
  reviewers TEXT[] NOT NULL DEFAULT '{}',
  decision gate_decision NOT NULL,
  conditions TEXT,
  next_gate_date DATE,
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX idx_pdlc_phases_order ON pdlc_phases(display_order);
CREATE INDEX idx_initiatives_status ON initiatives(status);
CREATE INDEX idx_initiatives_tier ON initiatives(tier);
CREATE INDEX idx_initiatives_phase ON initiatives(current_phase_id);
CREATE INDEX idx_initiatives_owner ON initiatives(owner_id);
CREATE INDEX idx_gate_reviews_initiative ON gate_reviews(initiative_id);
CREATE INDEX idx_gate_reviews_phase ON gate_reviews(phase_id);

-- =============================================
-- Updated_at triggers
-- =============================================

CREATE TRIGGER initiatives_updated_at
  BEFORE UPDATE ON initiatives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER gate_reviews_updated_at
  BEFORE UPDATE ON gate_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE pdlc_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_reviews ENABLE ROW LEVEL SECURITY;

-- pdlc_phases: all authenticated can read; editors+ can write; admins can delete
CREATE POLICY "Authenticated users can view phases"
  ON pdlc_phases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Editors and admins can insert phases"
  ON pdlc_phases FOR INSERT TO authenticated
  WITH CHECK (public.user_role() IN ('editor', 'admin'));
CREATE POLICY "Editors and admins can update phases"
  ON pdlc_phases FOR UPDATE TO authenticated
  USING (public.user_role() IN ('editor', 'admin'));
CREATE POLICY "Admins can delete phases"
  ON pdlc_phases FOR DELETE TO authenticated
  USING (public.user_role() = 'admin');

-- initiatives: same pattern
CREATE POLICY "Authenticated users can view initiatives"
  ON initiatives FOR SELECT TO authenticated USING (true);
CREATE POLICY "Editors and admins can insert initiatives"
  ON initiatives FOR INSERT TO authenticated
  WITH CHECK (public.user_role() IN ('editor', 'admin'));
CREATE POLICY "Editors and admins can update initiatives"
  ON initiatives FOR UPDATE TO authenticated
  USING (public.user_role() IN ('editor', 'admin'));
CREATE POLICY "Admins can delete initiatives"
  ON initiatives FOR DELETE TO authenticated
  USING (public.user_role() = 'admin');

-- gate_reviews: same pattern
CREATE POLICY "Authenticated users can view gate reviews"
  ON gate_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Editors and admins can insert gate reviews"
  ON gate_reviews FOR INSERT TO authenticated
  WITH CHECK (public.user_role() IN ('editor', 'admin'));
CREATE POLICY "Editors and admins can update gate reviews"
  ON gate_reviews FOR UPDATE TO authenticated
  USING (public.user_role() IN ('editor', 'admin'));
CREATE POLICY "Admins can delete gate reviews"
  ON gate_reviews FOR DELETE TO authenticated
  USING (public.user_role() = 'admin');

-- =============================================
-- Seed PDLC Phases (8-phase updated framework)
-- =============================================

INSERT INTO pdlc_phases (name, label, description, gate_description, typical_duration, display_order) VALUES
  ('idea_generation', 'Idea Generation',
   'Brainstorming sessions to identify product opportunities. Focus on customer problems using SCAMPER, market research, and competitive analysis.',
   'Shortlisted ideas from brainstorming, SCAMPER analysis, market research',
   '1-2 weeks', 1),
  ('idea_vetting', 'Idea Vetting & Screening',
   'Internal review of ideas by experts using SWOT analysis. Score and rank candidates to select the highest-potential opportunities.',
   'SWOT analysis complete, ideas scored by experts, top candidates selected',
   '1-2 weeks', 2),
  ('concept_generation', 'Concept Generation',
   'Determine feasibility and potential success. Includes market research, feasibility studies, and cost-benefit analysis to define specifications.',
   'Market research + feasibility study + cost-benefit analysis complete',
   '2-3 weeks', 3),
  ('design_development', 'Design & Development',
   'Create detailed specifications, wireframes, and prototypes. Gather feedback from experts and potential customers on design and functionality.',
   'Prototypes built, wireframes complete, expert & customer feedback gathered',
   '3-6 weeks', 4),
  ('marketing_strategy', 'Marketing Strategy',
   'Develop go-to-market strategy. Identify target audience, channels, pricing, and positioning. Document the marketing plan.',
   'GTM strategy documented, channels identified, marketing plan approved',
   '2-4 weeks', 5),
  ('product_development', 'Product Development',
   'Build the MVP and iterate. Create product roadmap, apply 80/20 prioritization for updates. Focus on core value delivery.',
   'MVP built, product roadmap defined, 80/20 prioritization applied',
   '6-16 weeks', 6),
  ('launch', 'Launch',
   'Finalize integrations, billing, analytics. Execute marketing campaigns, press releases, launch events. Go live and monitor initial response.',
   'Integrations complete, billing set up, analytics live, marketing campaigns live',
   '2-4 weeks', 7),
  ('post_launch', 'Post-Launch Evaluation & Improvements',
   'Assess market performance, collect customer feedback via surveys, review product roadmap. Continuous cycle of research, implementation, and improvement.',
   'Performance assessed, customer feedback collected, roadmap updated',
   'Ongoing', 8);
