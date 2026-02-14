-- =============================================
-- Migration 008: Update PDLC Phases to New Framework
-- Renames and updates all 8 PDLC phases to the refined
-- Product Development Lifecycle framework.
-- =============================================

BEGIN;

-- Phase 1: Idea Generation -> Ideation
UPDATE pdlc_phases SET
  name = 'ideation',
  label = 'Ideation',
  description = 'Brainstorm and identify product opportunities through customer research, market analysis, competitive intelligence, and SCAMPER methodology. Capture signals from client advisory boards, sales teams, and industry trends to build a backlog of validated opportunity hypotheses.',
  gate_description = 'Opportunity hypotheses documented, market signals validated, initial TAM estimate, competitive differentiation thesis drafted',
  typical_duration = '1-2 weeks'
WHERE name = 'idea_generation';

-- Phase 2: Idea Vetting & Screening -> Business Validation
UPDATE pdlc_phases SET
  name = 'business_validation',
  label = 'Business Validation',
  description = 'Evaluate ideas through structured scoring using SWOT analysis, financial modeling, and strategic alignment assessment. Build the business case with IRR projections, contribution margin estimates, and resource requirements to determine investment worthiness.',
  gate_description = 'Business case approved with IRR/CM projections, SWOT complete, strategic alignment scored, resource plan drafted',
  typical_duration = '2-3 weeks'
WHERE name = 'idea_vetting';

-- Phase 3: Concept Generation -> Product Requirements
UPDATE pdlc_phases SET
  name = 'product_requirements',
  label = 'Product Requirements',
  description = 'Define detailed product requirements including BRD, PRD, user stories, and acceptance criteria. Conduct feasibility studies, regulatory/compliance impact assessment, and cross-functional alignment with Engineering, Legal, and Sales.',
  gate_description = 'PRD approved, user stories documented, feasibility study complete, regulatory sign-off obtained, architecture endorsed',
  typical_duration = '2-4 weeks'
WHERE name = 'concept_generation';

-- Phase 4: Design & Development (name unchanged, update content)
UPDATE pdlc_phases SET
  label = 'Design & Development',
  description = 'Create technical architecture, UX/UI wireframes, prototypes, and API contracts. Execute agile sprints with continuous integration, bi-weekly demos, and iterative design reviews with stakeholders and potential customers.',
  gate_description = 'Technical design approved, UX validated, prototypes built, code feature-complete with >85% test coverage',
  typical_duration = '4-8 weeks'
WHERE name = 'design_development';

-- Phase 5: Marketing Strategy (name unchanged, update content)
UPDATE pdlc_phases SET
  label = 'Marketing Strategy',
  description = 'Develop the go-to-market strategy including target audience segmentation, channel strategy, pricing model, positioning, and competitive battle cards. Prepare sales enablement materials, marketing collateral, and analyst briefing plans.',
  gate_description = 'GTM strategy documented, pricing approved, battle cards created, sales team trained, marketing campaigns staged',
  typical_duration = '2-4 weeks'
WHERE name = 'marketing_strategy';

-- Phase 6: Product Development -> UAT & QA/QC Testing
UPDATE pdlc_phases SET
  name = 'uat_qa_testing',
  label = 'UAT & QA/QC Testing',
  description = 'Execute comprehensive validation in production-like environments. Conduct UAT with internal stakeholders and beta clients, performance/load testing, security review, claims accuracy validation, and client pilot programs with 2-3 Tier 2/3 clients.',
  gate_description = 'UAT sign-off obtained, pilot success metrics achieved, security review passed, go-live checklist complete',
  typical_duration = '4-8 weeks'
WHERE name = 'product_development';

-- Phase 7: Launch (name unchanged, update content)
UPDATE pdlc_phases SET
  label = 'Launch',
  description = 'Coordinate market launch across Sales, Marketing, Implementation, and Client Success. Execute marketing campaigns, press releases, and launch events. Finalize integrations, billing, and analytics. Go live and monitor initial adoption metrics.',
  gate_description = 'Integrations complete, billing configured, analytics live, marketing campaigns launched, support teams ready',
  typical_duration = '2-4 weeks'
WHERE name = 'launch';

-- Phase 8: Post-Launch -> Optimize & Support
UPDATE pdlc_phases SET
  name = 'optimize_support',
  label = 'Optimize & Support',
  description = 'Monitor post-launch performance via KPI dashboards tracking adoption rates, accuracy metrics, and client satisfaction. Conduct 30/60/90-day reviews, win/loss analysis, quarterly business reviews with clients, and continuous improvement backlog refinement.',
  gate_description = '30/60/90-day reviews completed, KPIs baselined, enhancement roadmap prioritized, learnings documented',
  typical_duration = 'Ongoing'
WHERE name = 'post_launch';

COMMIT;
