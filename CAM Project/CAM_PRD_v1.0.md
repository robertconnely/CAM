# CAM — Capital Allocation Manager

## Product Requirements Document

**Enterprise SaaS Platform for Strategic Capital Investment Decisions**

Version 1.0 | February 2026 | CONFIDENTIAL

---

## 1. Executive Summary

### The Idea

CAM (Capital Allocation Manager) is an enterprise SaaS platform that democratizes the capital allocation process. Most companies, especially those in the mid-market, lack the structured financial rigor that top-tier consulting firms and Fortune 100 finance teams bring to investment decisions. Product leaders, business unit heads, and divisional GMs routinely make multi-million dollar bets with spreadsheets, gut instinct, and slide decks that wouldn't survive a first-year MBA finance course.

CAM changes that. It embeds a complete Product Development Lifecycle (PDLC) into an intuitive workflow application, guiding users from raw idea through financial modeling, risk assessment, portfolio prioritization, and post-investment performance tracking. The platform produces MBA-caliber output without requiring MBA-caliber input. Think of it as TurboTax for capital investment decisions — the user answers questions, the system does the heavy financial lifting.

### Why Now

Three converging trends create a significant market window for CAM:

- **Capital discipline is back.** After a decade of cheap money, rising interest rates have forced boards and executive teams to demand better justification for every dollar spent. CFOs are under pressure to demonstrate ROIC discipline, and product teams are being asked to prove value before they get funded.
- **AI makes guided workflows viable.** Large language models can now interpret unstructured business context and translate it into structured financial models, something that wasn't practical even two years ago. This is the enabling technology that makes "MBA output from lay input" a realistic product promise.
- **The tools gap is real.** There's no dominant platform sitting between project management tools (Jira, Asana) and enterprise financial planning systems (Anaplan, Adaptive). Product leaders either build their own spreadsheets or skip the financial analysis entirely.

---

## 2. Jobs to Be Done

CAM addresses distinct jobs across multiple personas within the enterprise. The JTBD framework below maps the functional, emotional, and social dimensions of each job.

### Primary Persona: Product Leader / Business Unit Head

**Job 1: Make defensible investment cases**

"When I have an idea for a new product or feature investment, I want to build a financial case that the CFO and the board will take seriously, so that I can secure funding without hiring a consultant or spending three weeks in Excel."

- Functional outcome: A complete business case with NPV, IRR, payback period, and sensitivity analysis
- Emotional outcome: Confidence walking into the funding conversation
- Social outcome: Being perceived as financially sophisticated by the executive team

**Job 2: Prioritize across competing investments**

"When I have more ideas than budget, I want to objectively compare them using consistent financial and strategic criteria, so that I can defend my portfolio choices and make hard tradeoffs transparent."

- Functional outcome: A ranked portfolio with clear scoring methodology
- Emotional outcome: Relief from the political pressure of subjective prioritization

**Job 3: Track actual returns against projections**

"When a funded project is underway, I want to monitor its performance against the original business case, so that I can course-correct early or reallocate capital to higher-performing initiatives."

### Secondary Persona: CFO / VP of Finance

**Job 4: Enforce capital discipline without becoming a bottleneck**

"When business units submit investment requests, I want a standardized intake process that captures the right financial data upfront, so that I can evaluate proposals efficiently and ensure consistent rigor across the organization."

- Functional outcome: Standardized business cases with consistent assumptions and methodology across every submission
- Emotional outcome: Trust that the organization is making informed capital decisions even when the finance team can't review every detail
- Social outcome: A reputation as an enabler of good decisions rather than a gatekeeper who slows everything down

**Job 5: Report portfolio health to the board**

"When the board asks about capital allocation performance, I want real-time portfolio analytics that show how deployed capital is performing against plan, so that I can provide a credible answer without a two-week data collection exercise."

### Tertiary Persona: CEO / General Manager

**Job 6: Build a culture of financial accountability**

"When I want my leadership team to think like owners, I want a system that teaches them capital allocation principles through the act of using it, so that financial literacy becomes embedded in how we operate rather than something that lives only in the finance department."

---

## 3. Hero Element

Every great product has a hero element — the single feature that makes someone say "I need this" within the first 60 seconds of seeing it. For CAM, that hero element is:

> ### The Investment Case Wizard
> *"Describe your idea in plain English. Get a board-ready business case in 15 minutes."*

The wizard walks the user through a guided conversation that feels more like talking to a smart financial advisor than filling out a form. It asks about the problem being solved, the target customer, revenue model, cost structure, timeline, and key assumptions. Behind the scenes, CAM is building a full financial model, running sensitivity analyses, and generating the narrative that ties it all together.

The output is a polished investment memo that includes an executive summary, market sizing, financial projections (3–5 year DCF), ROIC analysis, risk assessment with Monte Carlo simulation results, and a recommendation. The user can iterate on assumptions and watch the outputs update in real-time.

This is the moment of magic. A product manager who has never built a DCF model produces a document that looks like it came from McKinsey. That's the hook.

---

## 4. Monetization Strategy

### Revenue Model: Subscription SaaS + Usage-Based Components

CAM follows a hybrid monetization model combining predictable subscription revenue with usage-based expansion that grows with customer adoption.

### Subscription Tiers

| | Starter | Professional | Enterprise |
|---|---|---|---|
| **Target** | SMB / Departments | Mid-Market | Enterprise |
| **Users** | Up to 5 | Up to 25 | Unlimited |
| **Active Cases** | 10 / year | 50 / year | Unlimited |
| **AI Wizard** | Basic templates | Full wizard + custom models | Full wizard + API + custom models |
| **Portfolio View** | Single portfolio | Multi-portfolio | Org-wide with roll-ups |
| **Integrations** | Export only | ERP, BI tools | Full API + SSO + SCIM |
| **Annual Price** | $12,000 / yr | $48,000 / yr | $120,000+ / yr |

### Usage-Based Expansion Revenue

Beyond the subscription base, CAM captures incremental revenue through consumption:

- Additional AI wizard runs beyond plan limits ($25 per case generation)
- Advanced analytics modules (Monte Carlo simulation packs, scenario modeling)
- Premium templates and industry-specific financial model libraries

---

## 5. Unit Economics

The unit economics below reflect a steady-state Professional tier customer, which represents the core of the target market. These assumptions are based on comparable vertical SaaS platforms in the financial workflow space.

| Metric | Value |
|---|---|
| Annual Contract Value (ACV) | $48,000 |
| Gross Margin | 82% ($39,360) |
| Customer Acquisition Cost (CAC) | $18,000 (blended) |
| CAC Payback Period | 5.5 months |
| Net Revenue Retention (NRR) | 115% (target Year 3+) |
| Gross Revenue Churn | 8% annual |
| LTV (5-year) | $196,800 |
| LTV:CAC Ratio | 10.9x |
| Fully-Loaded Cost to Serve | $8,640 / yr per customer |

### CAC Breakdown

The $18,000 blended CAC reflects a GTM motion weighted toward content marketing and product-led growth, supplemented by targeted outbound for Enterprise accounts.

- Content marketing & SEO: 35% of spend, lowest CAC channel at ~$9,000
- Product-led growth (freemium trial): 25% of spend, CAC ~$12,000
- Outbound sales (Enterprise): 30% of spend, CAC ~$28,000 but 2.5x ACV
- Events and partnerships: 10% of spend

### Cost to Serve Composition

Infrastructure and AI costs represent the largest variable component. As usage scales, AI inference costs should compress 15–20% annually based on model efficiency improvements.

- Cloud infrastructure: $2,400 / yr per customer
- AI inference costs (LLM calls for wizard, analysis): $3,200 / yr
- Customer success allocation: $2,100 / yr
- Support overhead: $940 / yr

---

## 6. Pricing Strategy

### Pricing Philosophy

CAM's pricing is anchored to the value of better capital allocation decisions, not the cost of software. A single avoided bad investment or accelerated good one can be worth 10–100x the annual subscription. This value-based positioning supports premium pricing relative to generic project management tools.

### Pricing Principles

1. **Price on outcomes, not features.** Every tier should deliver measurable ROI within the first quarter of use.
2. **Land with Starter, expand to Professional.** The Starter tier is priced low enough that a VP of Product can expense it without procurement involvement. Professional requires budget approval but the business case writes itself.
3. **Enterprise pricing is custom because enterprise value is custom.** An organization managing $500M in annual capital allocation gets fundamentally more value than one managing $5M.

### Price Sensitivity Analysis

Based on competitive analysis of adjacent tools (Productboard at $20–80/user/month, Dragonboat at similar ranges, Anaplan at $150+/user/month for planning) and customer willingness-to-pay research in the financial workflow space, CAM is positioned in the mid-premium range.

The Starter tier at $1,000/month is below the threshold that typically triggers procurement review at most organizations, which is by design. The Professional tier at $4,000/month requires budget approval but is easily justified against the cost of a single consulting engagement ($50–150K) that produces a comparable output.

### Discount Policy

- Annual prepay: 15% discount (built into list pricing above)
- Multi-year commit: Additional 10% for 3-year agreements
- No discounting below 80% of list price under any circumstances — this protects LTV:CAC economics and market positioning

---

## 7. ROIC Framework

It would be ironic to build a capital allocation tool without running a rigorous ROIC analysis on the product itself. Here's the framework.

### Investment Required

| Category | Year 1 | Year 2 |
|---|---|---|
| Engineering (6 FTEs scaling to 10) | $1,200,000 | $1,800,000 |
| Product & Design (2 FTEs) | $400,000 | $450,000 |
| GTM (Sales, Marketing, CS) | $600,000 | $1,100,000 |
| Infrastructure & AI Costs | $200,000 | $500,000 |
| **Total Invested Capital** | **$2,400,000** | **$3,850,000** |

### ROIC Value Driver Tree

The ROIC decomposition follows the standard DuPont framework adapted for SaaS, breaking return on invested capital into its component drivers:

**ROIC = NOPAT Margin × Capital Turnover**

- **NOPAT Margin** is driven by gross margin (target 82%), operating leverage as the customer base scales, and disciplined R&D reinvestment at 25–30% of revenue
- **Capital Turnover** is driven by revenue growth velocity (ARR targets below), efficient CAC deployment, and minimal fixed asset requirements given the cloud-native architecture

### Projected Returns

| | Year 1 | Year 2 | Year 3 | Year 4 |
|---|---|---|---|---|
| **ARR** | $720K | $3.2M | $8.5M | $18M |
| **Customers** | 25 | 85 | 190 | 350 |
| **Gross Margin** | 75% | 80% | 82% | 83% |
| **EBITDA Margin** | -180% | -35% | 8% | 22% |
| **Cumulative ROIC** | — | -52% | -8% | 34% |

The business crosses ROIC breakeven midway through Year 3 and achieves a 34% cumulative ROIC by the end of Year 4, which compares favorably to typical SaaS investments that target 25–30% ROIC at scale. The key sensitivity variables are customer acquisition pace, NRR performance, and AI infrastructure cost trajectory.

---

## 8. Product Requirements Document

### 8.1 Platform Architecture

CAM is built as a modern cloud-native web application with the following architectural tenets:

- React-based SPA frontend with responsive design for desktop and tablet
- Node.js/TypeScript API layer with GraphQL
- PostgreSQL for transactional data, Redis for caching and session management
- LLM integration layer (Anthropic Claude API) for the AI wizard and analysis features, with abstraction to support model switching
- Event-driven architecture for workflow orchestration (NATS or Kafka)
- Multi-tenant with logical isolation at the database level, physical isolation available for Enterprise tier

### 8.2 Core Modules

#### Module 1: Investment Case Wizard (Hero Element)

The wizard is the entry point for every capital allocation decision in the system. It transforms unstructured business thinking into structured financial analysis through a guided, conversational interface.

**User Flow:** The user starts by describing their investment idea in natural language. CAM's AI interprets the input and begins an adaptive interview, asking follow-up questions to fill in the financial model. The system pre-populates assumptions where possible using industry benchmarks and the company's historical data. At each step, the user sees the financial model updating in real-time on a split-screen view.

Key capabilities:

1. Natural language idea intake with AI-powered interpretation
2. Adaptive questioning engine that adjusts depth based on investment size and complexity
3. Real-time financial model generation (DCF, NPV, IRR, payback period)
4. Assumption management with industry benchmark suggestions
5. Sensitivity analysis with tornado diagrams and scenario comparison
6. Monte Carlo simulation for probability-weighted outcomes
7. Auto-generated investment memo with executive summary, financials, and risk assessment
8. One-click export to PDF, PowerPoint, and board presentation formats

#### Module 2: Portfolio Manager

Once individual investment cases exist, the Portfolio Manager provides the strategic layer for comparing, prioritizing, and balancing investments across the organization.

- Multi-criteria scoring framework (financial returns, strategic alignment, risk, resource requirements, time-to-value)
- Efficient frontier visualization showing risk-return tradeoffs across the portfolio
- Constraint-based optimization (budget caps, resource limits, strategic mandates)
- What-if scenario modeling for portfolio composition changes
- Dependency mapping between investments

#### Module 3: Performance Tracker

Closing the loop between projection and reality is where most organizations fail. The Performance Tracker makes post-investment monitoring automatic and actionable.

- Actuals-vs-plan dashboards with automated variance analysis
- KPI tracking tied to the original business case assumptions
- AI-generated narrative explanations for significant variances
- Early warning alerts when tracked metrics deviate beyond configurable thresholds
- Reforecast capability that updates the remaining projection based on actual performance

#### Module 4: PDLC Workflow Engine

The PDLC (Product Development Lifecycle) workflow engine provides the governance framework that ensures every investment moves through a disciplined process. This isn't about adding bureaucracy — it's about making the right level of rigor automatic and invisible.

Stage-gate workflow with configurable stages:

1. **Ideation** — Capture and initial screening. Low friction, high volume.
2. **Discovery** — Problem validation, market sizing, preliminary business case.
3. **Business Case** — Full financial modeling via the Investment Case Wizard. This is where most of the analytical heavy lifting happens.
4. **Approval** — Routing to appropriate decision-makers based on investment size and type. Includes approval workflows, feedback loops, and conditional approvals.
5. **Execution** — Active project tracking against the business case.
6. **Review** — Post-investment review and lessons learned capture.

#### Module 5: Calculators & Analysis Tools

Standalone financial calculators available outside the wizard for ad-hoc analysis:

- WACC (Weighted Average Cost of Capital) calculator with guided inputs
- ROIC decomposition tool with DuPont analysis framework
- Total Addressable Market (TAM/SAM/SOM) sizing calculator
- Build vs. Buy analysis framework
- Make vs. Partner decision matrix
- Unit economics modeler
- Break-even analysis with visual charting

#### Module 6: Reporting & Governance

- Board-ready capital allocation summary reports with automated generation
- Audit trail for all investment decisions, approvals, and changes
- Role-based access control with configurable approval matrices
- Compliance reporting for SOX and internal controls requirements

### 8.3 AI Integration Architecture

| Module | AI Application | User Value |
|---|---|---|
| **Wizard** | Natural language interpretation, assumption generation, financial model construction | Non-financial users produce CFO-grade business cases |
| **Portfolio Manager** | Optimization suggestions, dependency detection, strategic alignment scoring | Portfolio decisions backed by quantitative analysis, not politics |
| **Performance Tracker** | Variance narrative generation, early warning pattern detection | Automated insight generation that would take analysts hours |
| **Calculators** | Guided input interpretation, benchmark data enrichment | Correct financial analysis even if the user doesn't know the formulas |

### 8.4 Integration Requirements

**Priority 1 (Launch)**
- SSO/SAML (Okta, Azure AD, Google Workspace)
- Export: PDF, PowerPoint, Excel
- Slack and Microsoft Teams notifications

**Priority 2 (Year 1)**
- ERP systems: NetSuite, SAP, Oracle (read financial data for actuals tracking)
- BI tools: Tableau, Power BI, Looker (embed dashboards, push data)
- Project management: Jira, Asana, Monday (sync execution milestones)

**Priority 3 (Year 2)**
- HRIS systems for resource capacity planning
- CRM integration for revenue pipeline data
- Open API for custom integrations

### 8.5 Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Page load < 2s, Wizard step transitions < 1s, Financial model recalculation < 3s, Report generation < 10s |
| **Availability** | 99.9% uptime SLA for Professional/Enterprise, 99.5% for Starter |
| **Security** | SOC 2 Type II certification by launch, data encryption at rest (AES-256) and in transit (TLS 1.3), role-based access control, MFA support |
| **Compliance** | SOX compliance support for public companies, GDPR compliance for EU customers, data residency options for Enterprise tier |
| **Scalability** | Architecture must support 10,000+ concurrent users without degradation. Horizontal scaling for all stateless services. |

---

## 9. Product Development Lifecycle

CAM itself will be built using the same PDLC discipline it teaches to its users. The irony is intentional and strategic — we're dogfooding the methodology from day one.

### 9.1 Build Phases

#### Phase 1: Foundation (Months 1–4)

Goal: Deliver the Investment Case Wizard and basic PDLC workflow to design partners.

1. Core platform architecture and multi-tenant infrastructure
2. Investment Case Wizard with AI-powered guided interview and financial model generation
3. Basic PDLC workflow (Ideation through Approval stages)
4. User authentication, RBAC, and team management
5. PDF and PowerPoint export
6. 5 design partner deployments with weekly feedback loops

#### Phase 2: Expansion (Months 5–8)

Goal: Launch commercially with Portfolio Manager, Performance Tracker, and integrations.

- Portfolio Manager with multi-criteria scoring and visualization
- Performance Tracker with actuals-vs-plan dashboards
- SSO integration (Okta, Azure AD)
- Standalone financial calculators (WACC, ROIC, TAM)
- Slack and Teams notification integration
- Self-service onboarding and in-app guidance
- Commercial launch with Starter and Professional tiers

#### Phase 3: Scale (Months 9–12)

Goal: Enterprise readiness, advanced analytics, and integration ecosystem.

- Enterprise tier features: custom approval workflows, org-wide roll-ups, physical data isolation
- ERP integrations (NetSuite, SAP) for automated actuals tracking
- Monte Carlo simulation and advanced scenario modeling
- Board reporting module with automated quarterly summaries
- API release for custom integrations

#### Phase 4: Intelligence (Months 13–18)

Goal: AI-driven insights that make CAM progressively smarter.

- Cross-portfolio pattern recognition ("companies like yours that invested in X saw Y")
- Predictive accuracy scoring for business cases based on historical performance
- Automated reforecasting with AI-generated recommendations
- Industry benchmarking database

### 9.2 Success Metrics by Phase

| Metric | Phase 1 Target | Phase 2 Target | Phase 3 Target |
|---|---|---|---|
| Design Partners | 5 | N/A (commercial) | N/A |
| Paying Customers | 0 | 15 | 50 |
| ARR | $0 | $360K | $1.8M |
| Wizard Completion Rate | 60% | 75% | 85% |
| NPS | 40+ | 50+ | 55+ |
| Time to First Case | < 30 min | < 20 min | < 15 min |

---

## 10. Competitive Landscape

CAM occupies a unique position in the market because no existing tool combines financial modeling rigor with product lifecycle workflow management and AI-guided analysis. The competitive landscape is fragmented across adjacent categories:

| Competitor | What They Do | Gap CAM Fills | Overlap Risk |
|---|---|---|---|
| **Productboard / Aha!** | Product roadmap and feature prioritization | No financial modeling, no capital allocation discipline | Low — complementary tools |
| **Anaplan / Adaptive** | Enterprise financial planning and analysis | Too complex for product leaders, no PDLC workflow, no AI guidance | Medium — Enterprise FP&A could expand down |
| **Excel / Google Sheets** | Everything, badly | No structure, no governance, no AI, no audit trail | High — incumbent behavior to displace |
| **Consulting firms** | Custom financial analysis and strategy | $150K+ per engagement, not scalable, not continuous | Low — CAM is a complement and replacement |

The most dangerous competitive dynamic isn't a direct competitor — it's inertia. The biggest competitor is the status quo: product leaders continuing to make capital allocation decisions with unstructured spreadsheets and slide decks. CAM's GTM strategy must explicitly address the behavior change required to adopt a new workflow.

---

## 11. Risks and Mitigations

| Risk | Description | Impact | Mitigation |
|---|---|---|---|
| **AI Accuracy** | Financial models generated by AI contain errors that undermine trust | Critical — one bad model shared with a board could destroy credibility | Human-in-the-loop review, assumption transparency, confidence scoring, disclaimer framework |
| **Adoption** | Product leaders resist structured capital allocation as bureaucracy | High — directly impacts growth trajectory | Make the wizard experience delightful, focus on time-to-value, show ROI of better decisions |
| **Data Security** | Customers hesitate to put sensitive financial projections in a third-party tool | High — particularly for Enterprise segment | SOC 2, data residency options, private deployment for Enterprise, encryption at every layer |
| **Market Timing** | Capital discipline focus fades if interest rates decline significantly | Medium — reduces urgency but doesn't eliminate need | Position CAM as operational excellence, not just cost discipline. The workflow value persists regardless of rate environment. |
| **LLM Costs** | AI inference costs don't decline as projected, compressing margins | Medium — affects unit economics, not viability | Model-agnostic architecture, fine-tuning to reduce token usage, caching for common patterns, usage-based pricing passes cost to high-volume users |

---

## 12. Go-to-Market Strategy

### Launch Strategy

CAM launches with a design-partner-first approach. Five to eight companies across different industries participate in a 90-day design partnership where they get free access in exchange for weekly feedback sessions and case study rights. This generates three critical assets: product validation, customer proof points, and reference accounts for commercial launch.

### GTM Motion

The GTM strategy is a hybrid of product-led growth for the Starter tier and sales-assisted for Professional and Enterprise. The two motions feed each other — PLG generates brand awareness and bottom-up adoption, which creates warm leads for the sales team to convert into larger contracts.

**Product-Led Growth (Starter)**
- Free trial with full wizard access for 2 investment cases
- Self-service purchase with credit card
- In-app upgrade prompts triggered by usage patterns (hitting case limits, adding team members)
- Community content: templates, benchmarks, best practices

**Sales-Assisted (Professional / Enterprise)**
- Targeted outbound to VP Product, VP Strategy, and CFO personas at companies with $50M+ in annual capex or R&D spend
- Demo-driven sales process showcasing the wizard with the prospect's actual investment scenario
- ROI calculator showing the value of better capital allocation decisions based on their specific budget

### Content Strategy

Content marketing is the primary demand generation engine. The content strategy positions CAM as the thought leader in capital allocation best practices, not just a software vendor. Key content themes include the cost of bad capital allocation decisions (case studies of failed investments that better analysis would have caught), the democratization of financial rigor, and practical PDLC frameworks that leaders can implement regardless of whether they use CAM.

---

## Appendix: Workflow Walkthrough

Below is the simplified end-to-end workflow that a user experiences in CAM. The design principle throughout is progressive disclosure — start simple, reveal complexity only when the user needs it.

**Step 1: Describe Your Idea**
The user opens CAM and clicks "New Investment Case." They see a clean text input with the prompt: "What are you thinking about investing in?" They type a few sentences describing their idea in plain language. No forms, no fields, no financial jargon required.

**Step 2: Guided Interview**
CAM's AI reads the input and launches an adaptive conversation. It asks clarifying questions one at a time, in natural language. Questions might include: Who is the target customer? How would revenue be generated? What's the rough timeline? What resources would be needed? The user answers conversationally. CAM translates each answer into structured financial assumptions behind the scenes.

**Step 3: Review Your Model**
Once the interview is complete, CAM presents a full financial model on a split-screen. The left side shows the assumptions (all editable), and the right side shows the outputs: NPV, IRR, payback period, 5-year cash flow projections. The user can adjust any assumption and watch the model update instantly.

**Step 4: Stress Test**
CAM automatically runs sensitivity analysis and presents a tornado diagram showing which assumptions have the biggest impact on returns. The user can run Monte Carlo simulations to see the probability distribution of outcomes. This is where the "MBA output" really shines — most product leaders have never produced this kind of analysis.

**Step 5: Generate Your Memo**
One click generates a complete investment memo: executive summary, problem statement, market opportunity, financial projections, risk assessment, and recommendation. The memo is formatted for board presentation and can be exported as PDF, PowerPoint, or shared directly within CAM.

**Step 6: Submit for Approval**
The case enters the PDLC workflow. Based on the investment size and type, CAM routes it to the appropriate approvers. Reviewers can comment, request changes, or approve directly in the platform. The entire decision trail is captured for audit purposes.

**Step 7: Track and Learn**
Once approved and funded, the investment case moves to the Performance Tracker. Actuals are entered (manually or via ERP integration) and compared against projections. CAM highlights variances and generates narrative explanations. Over time, this data feeds back into the AI to improve future model accuracy.

---

*End of Document*
