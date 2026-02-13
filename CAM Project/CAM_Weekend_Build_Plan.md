# CAM — Weekend Build Plan

## What You Can Ship in 48 Hours with Claude Code

This plan assumes you already have a working prototype and want to convert it into something you could actually demo to someone on Monday morning. The goal isn't feature completeness — it's getting the hero element (Investment Case Wizard) working end-to-end with enough polish that it feels like a real product, not a hackathon project.

---

## The Weekend Target

By Sunday night, you should have a working web app where someone can:

1. Log in and see a clean dashboard
2. Click "New Investment Case" and describe their idea
3. Get walked through a guided AI interview (5–8 adaptive questions)
4. See a generated financial model with NPV, IRR, and payback period
5. Adjust assumptions and watch the numbers update
6. Export a PDF investment memo

That's it. No portfolio manager, no performance tracker, no integrations. Just the wizard doing its thing beautifully. If the wizard works and feels magical, everything else is an engineering roadmap. If the wizard doesn't work, nothing else matters.

---

## Saturday Morning (4 hrs): Foundation & Structure

### Set Up the Project Properly

If your current codebase is a loose collection of components, this is where you give it a spine. Use Claude Code to scaffold or restructure into a clean Next.js (or Vite + React) project with:

- A proper folder structure: `/app`, `/components`, `/lib`, `/api`, `/types`
- Tailwind CSS for styling (fastest path to polished UI)
- A layout shell with sidebar navigation, even if most nav items are placeholders
- Basic auth — even just a hardcoded login screen is fine for demo purposes. If you want something real, Clerk or NextAuth takes 30 minutes with Claude Code.

### Build the Dashboard

Keep it dead simple. The dashboard needs three things:

- A welcome message and "New Investment Case" button (this is the CTA)
- A list of existing cases (can be dummy data for now, stored in local state or a JSON file)
- Status indicators showing where each case is in the PDLC workflow

**Claude Code prompt approach:** Give Claude the PRD's workflow walkthrough section and ask it to build the dashboard. Be specific about the layout — "left sidebar with navigation, main content area with a card grid showing investment cases, each card shows title, status, date created, and estimated NPV."

---

## Saturday Afternoon (4 hrs): The Wizard — Interview Engine

This is the core of the entire product. Spend the most time here.

### The Conversational UI

Build a chat-style interface where CAM asks questions and the user responds. Not a form. Not a stepper with input fields. A conversation. The key architectural decision is how to handle the AI interview flow:

**Option A (Simpler, recommended for weekend):** Pre-define 6–8 question templates organized by category (problem, customer, revenue model, cost structure, timeline, resources). Use the Claude API to make the questions conversational and adapt follow-ups based on previous answers. Store the structured data extracted from each answer.

**Option B (More ambitious):** Give Claude the full context of what financial model inputs are needed and let it drive the entire conversation dynamically. More impressive when it works, but harder to control quality in a weekend.

Go with Option A. You can always upgrade to Option B later.

### What the Wizard Needs to Capture

At minimum, the interview should extract these inputs for the financial model:

- Investment description and strategic rationale
- Target market and estimated TAM
- Revenue model (subscription, transactional, licensing, etc.) and pricing assumptions
- Year 1 revenue estimate and growth rate assumptions
- Upfront investment required and ongoing cost structure
- Timeline to revenue and key milestones
- Top 3 risks

### The Split-Screen Layout

As the user answers questions on the left side, the right side should show a live-updating financial summary panel. Even before all questions are answered, start populating what you can. This real-time feedback is what makes the wizard feel like magic rather than a questionnaire.

---

## Saturday Evening (2–3 hrs): Financial Model Engine

### Build the Calculators

Create a `/lib/financial-model.ts` file with pure functions for:

```
calculateNPV(cashFlows, discountRate)
calculateIRR(cashFlows)
calculatePaybackPeriod(cashFlows)
generateCashFlowProjection(inputs, years)
calculateROIC(nopat, investedCapital)
```

These are straightforward financial formulas. Claude Code can generate all of them accurately — just be explicit about edge cases (negative cash flows, IRR with no real solution, etc.).

### Connect Wizard Outputs to Model Inputs

Write a transformation layer that takes the structured data from the wizard interview and maps it to financial model inputs. This is where the "MBA output from lay input" promise lives. The user said "we think we can charge $50/month and get 1,000 customers in year one" and the system translates that into a 5-year cash flow projection with growth assumptions, churn estimates, and operating cost scaling.

Use reasonable defaults and industry benchmarks for anything the user doesn't explicitly provide. The Claude API can help generate sensible assumptions based on the business description.

---

## Sunday Morning (4 hrs): Results & Memo Generation

### The Results Dashboard

After the wizard completes, show a results page with:

- **Summary cards** at the top: NPV, IRR, Payback Period, 5-year cumulative ROI
- **Cash flow chart** — a simple bar or line chart showing projected cash flows over 5 years (use Recharts, it's already available in most React setups)
- **Assumptions panel** — an editable table of all the assumptions that went into the model. When the user changes a number, the entire page recalculates. This is the "watch the numbers update" moment from the PRD.
- **Sensitivity indicator** — even a simple color-coded list showing "if revenue is 20% lower, NPV drops to X" is powerful

### The Investment Memo

Use the Claude API to generate a narrative investment memo from the structured data. The memo should have:

- Executive Summary (2–3 paragraphs)
- Problem & Opportunity
- Financial Projections (embed the key numbers)
- Key Assumptions
- Risk Assessment
- Recommendation

Render it in a clean, print-friendly format. For PDF export, use a library like `html2pdf.js` or `@react-pdf/renderer`. The `html2pdf` approach is faster for a weekend — just style a div for print and convert it.

---

## Sunday Afternoon (3–4 hrs): Polish & PDLC Skeleton

### Make It Look Real

This is where you turn a prototype into something that feels like a product. Spend time on:

- Consistent color scheme and typography (navy + teal from the PRD branding works well)
- Loading states and transitions — the wizard should feel smooth, not janky
- Empty states that guide the user ("No investment cases yet. Create your first one.")
- Error handling — if the API call fails, show a graceful message, not a blank screen

### PDLC Workflow — Just the Visual

You don't need a full workflow engine this weekend. But you should show the stages visually:

- Add a horizontal stepper/progress bar showing: Ideation → Discovery → Business Case → Approval → Execution → Review
- When a user completes the wizard, automatically move the case to "Business Case Complete"  
- Show the stage on the dashboard card for each case
- Make the other stages clickable but show "Coming Soon" — this communicates the product vision without requiring the engineering

### Data Persistence

If you haven't already, set up basic persistence. For a weekend build, you have two good options:

- **Supabase** — free tier, PostgreSQL, takes 20 minutes to set up with Claude Code. Best if you want to demo with real data that survives a page refresh.
- **Local Storage + JSON** — zero setup, works fine for a solo demo. Just acknowledge it's temporary.

---

## Sunday Evening (1–2 hrs): Demo Prep

### The 3-Minute Demo Script

Practice this flow:

1. Open the app, show the dashboard (5 seconds)
2. Click "New Investment Case" (5 seconds)
3. Type a business idea in plain language (15 seconds)
4. Walk through 3–4 wizard questions, showing the financial model updating in real-time (90 seconds)
5. Show the completed results page with NPV, IRR, and the cash flow chart (20 seconds)
6. Change one assumption and watch everything recalculate (15 seconds)
7. Generate and show the investment memo (20 seconds)

That's your demo. If it works smoothly, you have something worth showing to potential design partners or early customers.

---

## What NOT to Build This Weekend

Resist the temptation to build any of these — they're all Phase 2+ features that will eat your time without improving the demo:

- User registration and team management
- Portfolio comparison views
- Actual ERP or SSO integrations
- Monte Carlo simulation (complex, and the basic sensitivity analysis is impressive enough)
- Approval workflows
- Multi-user collaboration
- Mobile responsiveness (desktop-first is fine for B2B)

---

## Claude Code Session Strategy

Rather than one marathon Claude Code session, break it into focused blocks:

| Session | Duration | Focus | Key Prompt |
|---|---|---|---|
| 1 | 1 hr | Project scaffolding & layout | "Set up a Next.js app with Tailwind, create a dashboard layout with sidebar nav, and build a card grid for investment cases" |
| 2 | 2 hrs | Wizard conversation UI | "Build a chat-style wizard interface that asks adaptive questions about a business investment. Use the Claude API to make questions conversational. Store structured data from each answer." |
| 3 | 1.5 hrs | Financial model engine | "Create TypeScript functions for NPV, IRR, payback period, and 5-year cash flow projections. Connect them to wizard outputs." |
| 4 | 2 hrs | Results page + charts | "Build a results dashboard with summary cards, a Recharts cash flow chart, and an editable assumptions table that triggers recalculation" |
| 5 | 1.5 hrs | Memo generation + PDF | "Use the Claude API to generate an investment memo narrative from the financial model data. Add PDF export." |
| 6 | 2 hrs | Polish, PDLC visual, persistence | "Add Supabase for data persistence, a PDLC stage stepper, loading states, and visual polish" |

Total: ~10 focused hours of building, which is realistic for a weekend with breaks.

---

## Definition of Done for Monday Morning

You're done when you can:

- [ ] Open the app and see a clean, branded dashboard
- [ ] Create a new investment case by describing an idea in plain English
- [ ] Complete the AI-guided wizard in under 10 minutes
- [ ] See a financial model with real NPV/IRR/payback calculations
- [ ] Change an assumption and watch the model recalculate
- [ ] Generate a PDF investment memo that you'd be comfortable showing to a CFO
- [ ] See the case on your dashboard with its PDLC stage

If you hit all seven, you have an MVP worth testing with real users.
