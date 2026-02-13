# CAM v1.0 — Build Plan

## Status: Planning Complete — Ready to Build

Last updated: February 13, 2026

---

## Existing Assets Inventory

### Already Built (in Next.js app at `website/nextjs/`)

| Asset | Location | What It Does |
|---|---|---|
| **Auth + Roles + RLS** | `src/lib/supabase/`, `src/middleware.ts`, `src/components/auth/` | Email/password auth, 3 roles (admin/editor/viewer), RLS enforcement |
| **Capital Scoring Wizard** | `src/components/tracker/capital/CapitalWizard.tsx` + 7 step components | 11-step form: select initiative → set type & revenue model → IRR gate → CM% gate → score 5 dimensions → weighted recommendation |
| **Capital Scoring Engine** | `src/lib/scoring/capital-scoring.ts` | IRR thresholds by initiative type, CM thresholds by revenue model, weighted scoring, band assignment (A-D), recommendation (Strong Go/Go/Consider/Hold) |
| **PDLC Phases** | `supabase/migrations/004_pdlc_tracker.sql` | 8 phases seeded in DB, `initiatives` table with status/tier/owner, `gate_reviews` table |
| **Capital Scores Table** | `supabase/migrations/005_capital_scores.sql` | 5-dimension scores, IRR/CM gates, weighted results, band assignments |
| **ROIC Value Driver Tree** | `src/components/dashboard/roic-tree/` | Interactive SVG tree, Zelis-branded (updated Feb 13) |
| **Zelis Brand System** | `src/app/globals.css` | Full CSS custom properties, Nunito Sans font, responsive breakpoints |
| **Component Patterns** | `src/components/admin/`, `src/components/layout/`, `src/components/content/` | Toast, ConfirmDialog, block editors, header/footer/sidebar, content renderer |
| **Database Types** | `src/lib/types/database.ts` | TypeScript interfaces for all tables, enums for status/type/band/recommendation |

### Prototype (standalone, needs conversion)

| Asset | Location | What It Does |
|---|---|---|
| **CAM UI Prototype** | `website/CAM Project/CAM_UI_Prototype.jsx` | Full product demo: dashboard with cases table, conversational AI wizard (chat-style), split-screen live model, results view with charts + editable assumptions + memo |

### Reference Documents

| Doc | Location |
|---|---|
| **CAM PRD v1.0** | `website/CAM Project/CAM_PRD_v1.0.md` |
| **Weekend Build Plan** | `website/CAM Project/CAM_Weekend_Build_Plan.md` |

---

## Architecture Decision: Two Complementary Wizards

CAM v1.0 has two wizard workflows that serve different roles:

### Wizard 1: Investment Case Wizard (from prototype) — "Create"
- User describes idea in plain English
- AI asks 6 adaptive follow-up questions (chat-style)
- Live financial model updates on split-screen as answers come in
- Generates: NPV, IRR, payback period, 5-year cash flow projections
- Outputs: editable financial model + AI-generated investment memo
- **Purpose**: Turn a raw idea into a structured investment case

### Wizard 2: Capital Scoring Wizard (already built) — "Evaluate"
- Reviewer selects an existing investment case
- Sets initiative type + revenue model
- Runs IRR gate check + CM% gate check
- Scores across 5 strategic dimensions (1-5 with rubrics)
- Weighted scoring → recommendation (Strong Go / Go / Consider / Hold)
- **Purpose**: Evaluate and prioritize an investment case for funding

### End-to-End Workflow

```
Requestor describes idea
    → AI Wizard creates investment case with financial model + memo
        → Case enters PDLC workflow at "Business Case" stage
            → Reviewer opens case, runs Capital Scoring Wizard
                → Recommendation: Strong Go / Go / Consider / Hold
                    → Approved → Execution stage → Performance tracking
```

---

## User Roles

| Role | Can Do | Implementation |
|---|---|---|
| **Requestor** (Product Leader / BU Head) | Create investment cases, run AI wizard, edit own cases, submit for approval | Extend existing `editor` role |
| **Reviewer** (Finance / CFO) | View all cases, run capital scoring, comment, approve/reject, portfolio view | New role or extend `admin` |
| **Admin** | Configure workflows, manage users, system settings | Existing `admin` role |
| **Viewer** (Executive / Board) | Read-only dashboards, portfolio reports | Existing `viewer` role |

---

## Build Phases

### Phase A: Foundation — Convert Prototype to Production Components
**Goal**: Get the CAM shell working in Next.js with Zelis branding and Supabase persistence.

- [ ] Create new Supabase migration with tables:
  - `investment_cases` (title, description, stage, owner_id, financials JSON, status, created_at)
  - `case_assumptions` (case_id, key, value, type, source — for editable financial inputs)
  - `wizard_conversations` (case_id, messages JSON — AI interview history)
- [ ] Convert `CAM_UI_Prototype.jsx` into TypeScript components:
  - `src/components/cam/CamDashboard.tsx` — Cases table + summary metrics
  - `src/components/cam/CamSidebar.tsx` — Navigation sidebar
  - `src/components/cam/wizard/WizardChat.tsx` — Conversational chat UI
  - `src/components/cam/wizard/LiveModelPanel.tsx` — Split-screen financial model
  - `src/components/cam/results/ResultsView.tsx` — Metrics + chart + assumptions + memo
  - `src/components/cam/results/CashFlowChart.tsx` — Bar chart component
  - `src/components/cam/results/AssumptionsPanel.tsx` — Editable sliders
  - `src/components/cam/results/InvestmentMemo.tsx` — Memo display
  - `src/components/cam/shared/MetricCard.tsx` — Reusable metric card
  - `src/components/cam/shared/StatusBadge.tsx` — Status pill
  - `src/components/cam/shared/StageBar.tsx` — PDLC mini-stepper
  - `src/components/cam/shared/PdlcStepper.tsx` — Full horizontal stepper
- [ ] Create app routes:
  - `src/app/(protected)/cam/page.tsx` — Dashboard
  - `src/app/(protected)/cam/new/page.tsx` — Wizard
  - `src/app/(protected)/cam/[id]/page.tsx` — Case detail / results
- [ ] Rebrand from navy/teal to Zelis colors:
  - Navy `#0F2B4C` → `var(--zelis-dark)` `#23004B`
  - Teal `#2A9D8F` → `var(--zelis-blue-purple)` `#5F5FC3` or `var(--zelis-purple)` `#321478`
  - DM Sans → Nunito Sans
- [ ] Wire CRUD to Supabase (create case, list cases, update case)
- [ ] Install Recharts: `npm install recharts`

### Phase B: Financial Engine
**Goal**: Real financial calculations replacing the prototype's placeholder math.

- [ ] Create `src/lib/financial/` directory:
  - `npv.ts` — Net Present Value calculation
  - `irr.ts` — Internal Rate of Return (Newton-Raphson method)
  - `dcf.ts` — Discounted Cash Flow projections (3-5 year)
  - `payback.ts` — Payback period calculation
  - `sensitivity.ts` — Tornado diagram data generation
  - `projections.ts` — Revenue/cost projection engine (takes wizard inputs, outputs 5-year model)
  - `index.ts` — Barrel export
- [ ] Connect to results view: assumptions change → recalculate → update charts
- [ ] Replace prototype's custom SVG chart with Recharts `<BarChart>` for cash flows
- [ ] Add sensitivity tornado diagram (Recharts `<BarChart>` horizontal)

### Phase C: Claude API Integration
**Goal**: Real AI powering the wizard conversation and memo generation.

- [ ] Create API routes:
  - `src/app/api/ai/wizard/route.ts` — Wizard conversation endpoint
  - `src/app/api/ai/memo/route.ts` — Investment memo generation endpoint
- [ ] Wizard AI prompt engineering:
  - System prompt: "You are a financial advisor helping build an investment case..."
  - Adaptive questioning: adjust depth based on investment size/complexity
  - Structured extraction: parse each answer into financial model inputs
  - Use Option A approach (pre-defined question flow with AI making it conversational)
- [ ] Memo generation:
  - Takes structured financial model data
  - Generates: Executive Summary, Market Opportunity, Financial Projections, Risk Assessment, Recommendation
  - Returns markdown that renders in the memo component
- [ ] Add `ANTHROPIC_API_KEY` to `.env.local`
- [ ] Streaming responses for wizard (better UX than waiting for full response)

### Phase D: Workflow Integration
**Goal**: Connect AI wizard → Capital Scoring → Approval flow end-to-end.

- [ ] When wizard completes, create `investment_case` in Supabase with generated model
- [ ] Case appears in dashboard with "Business Case" PDLC stage
- [ ] "Submit for Approval" button routes case to reviewer
- [ ] Reviewer can open case → run existing Capital Scoring Wizard on it
- [ ] Scoring result (Strong Go/Go/Consider/Hold) updates case status
- [ ] Add comments/feedback thread on cases (`case_comments` table)
- [ ] Notification system (in-app, could add Slack later)

### Phase E: Polish & Export
**Goal**: Production-quality UX and PDF output.

- [ ] PDF export for investment memo (`html2pdf.js` or `@react-pdf/renderer`)
- [ ] PowerPoint export (stretch goal — use `pptxgenjs`)
- [ ] Editable assumptions panel with live recalculation (sliders + number inputs)
- [ ] Loading states, transitions, animations (match prototype's `fadeSlideIn`)
- [ ] Empty states ("No cases yet — create your first investment case")
- [ ] Error handling for API failures
- [ ] Mobile responsiveness for dashboard (desktop-first, but readable on tablet)
- [ ] "Use sample answer" demo mode for showcasing the product

---

## New Dependencies Needed

```
npm install recharts        # Charts (cash flow, sensitivity, portfolio)
npm install html2pdf.js     # PDF export for investment memos
```

Claude API accessed via `@anthropic-ai/sdk` or direct fetch to `https://api.anthropic.com/v1/messages`.

---

## Database Schema Additions

```sql
-- New table: Investment Cases (the core CAM entity)
CREATE TABLE investment_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id),
  stage TEXT DEFAULT 'ideation', -- maps to PDLC stages
  status TEXT DEFAULT 'draft',   -- draft, submitted, approved, rejected, tracking
  initiative_type TEXT,          -- links to initiative type enum
  revenue_model TEXT,            -- links to revenue model enum
  investment_amount NUMERIC,
  timeline_months INTEGER,
  financials JSONB DEFAULT '{}', -- computed model outputs (NPV, IRR, payback, cash flows)
  assumptions JSONB DEFAULT '{}', -- editable assumptions (revenue, growth, costs, etc.)
  memo_content TEXT,             -- AI-generated investment memo (markdown)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- New table: Wizard Conversations (AI interview history)
CREATE TABLE wizard_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES investment_cases(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]', -- array of {role, content, timestamp}
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- New table: Case Comments (reviewer feedback)
CREATE TABLE case_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES investment_cases(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Key Technical Decisions

1. **Wizard architecture**: Option A — Pre-defined 6-8 question flow with Claude API making it conversational and adaptive. Simpler to control quality, can upgrade to fully dynamic later.
2. **Financial model storage**: Hybrid — structured `assumptions` JSONB for editable inputs + computed `financials` JSONB for outputs. Recalculate on the client when assumptions change.
3. **CAM lives inside the existing app** — Same Next.js instance, new route group `(protected)/cam/`, shared Supabase instance. Avoids deployment complexity.
4. **Zelis branding from day one** — Convert prototype colors during Phase A, not as an afterthought.

---

## Definition of Done (v1.0)

- [ ] User can log in and see the CAM dashboard with investment cases
- [ ] User can create a new case via the AI-powered wizard (real Claude API)
- [ ] Wizard generates a financial model with NPV, IRR, payback, 5-year cash flows
- [ ] User can adjust assumptions and watch the model recalculate live
- [ ] AI generates an investment memo from the financial model
- [ ] User can export the memo as PDF
- [ ] User can submit a case for approval
- [ ] Reviewer can score a case using the Capital Scoring Wizard
- [ ] Case shows recommendation (Strong Go / Go / Consider / Hold)
- [ ] Dashboard shows all cases with status, stage, and key metrics
- [ ] PDLC stepper shows progression through stages
- [ ] Everything uses Zelis brand colors and Nunito Sans font
