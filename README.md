# CAM — Capital Allocation Manager

A full-stack product operating system for managing investment cases, tracking product development through an 8-phase PDLC framework, and monitoring live products across their lifecycle. Built for the Zelis Price Optimization Business Unit.

**Live at [pdlc-cam.com](https://www.pdlc-cam.com)**

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **AI**: Claude API — powers the investment wizard and memo generation
- **Hosting**: Vercel (frontend) + Supabase Cloud (backend)
- **Charts**: Recharts, custom SVG visualizations

## Features

### Capital Allocation Manager
- **AI Investment Wizard** — 6-question conversational interview powered by Claude that generates a complete financial model (NPV, IRR, payback period, 5-year projections) from a plain-English idea description
- **Capital Scoring Wizard** — 11-step guided evaluation with IRR/CM gate checks and 5-dimension weighted scoring (Financial Return, Strategic Alignment, Competitive Impact, Client Demand, Execution Feasibility)
- **Case workflow** — Create → Classify → Financial Model → Submit → Score → Recommend
- **Sensitivity analysis** — Tornado charts showing ±20% impact on each assumption

### PDLC Tracker
- 8-phase stage-gate framework: Ideation → Business Validation → Product Requirements → Design & Development → Marketing Strategy → UAT & QA/QC Testing → Launch → Optimize & Support
- 4 governance tiers (Strategic >$500K through Expedited/Kanban)
- Gate review forms with Go / No-Go / Pivot / Park decisions
- Initiative pipeline with KPI cards and Kanban board

### PLC Portfolio
- Product Life Cycle tracking for live products post-PDLC graduation
- 4 stages: Introduction → Growth → Maturity → Decline
- Interactive S-curve visualization with product positioning
- 8 metrics per product: ARR, client count, growth rate, market share, LTV, CAC, NPS, retention rate

### ROIC Value Driver Tree
- Interactive visualization mapping initiatives to ROIC impact
- Fullscreen mode with node selection and drill-down

### Content Management (Admin)
- 10 typed block editors (Rich Text, Image Gallery, Key Documents, Figma Embed, etc.)
- TOC auto-generation, document uploads to Supabase Storage
- 13 knowledge-base pages migrated from the original static site

### Glossary Tooltip System
- 20+ business/financial term definitions (IRR, NPV, ROIC, SCAMPER, etc.)
- Auto-scanning text component that wraps recognized terms with portal-based tooltips

## Architecture

```
website/
├── nextjs/                    # Next.js application (Vercel root dir)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (protected)/   # Auth-gated route group
│   │   │   │   ├── cam/       # CAM pages (dashboard, new, detail, score, roic, pdlc, pipeline, portfolio)
│   │   │   │   ├── admin/     # Admin CMS
│   │   │   │   ├── hub/       # Knowledge hub
│   │   │   │   └── [slug]/    # Dynamic content pages
│   │   │   ├── api/           # API routes (ai/wizard, ai/memo, documents)
│   │   │   └── login/         # Auth page
│   │   ├── components/
│   │   │   ├── cam/           # Investment wizard, case results, sidebar, workflow
│   │   │   ├── dashboard/     # Executive dashboard, KPI bar, Kanban, ROIC tree
│   │   │   ├── tracker/       # PDLC tracker, capital scoring wizard, pipeline
│   │   │   ├── portfolio/     # PLC curve chart, KPI cards, product cards
│   │   │   ├── admin/         # CMS editors
│   │   │   ├── content/       # Content renderers
│   │   │   └── ui/            # Shared UI (InfoTooltip, GlossaryText)
│   │   └── lib/
│   │       ├── financial/     # NPV, IRR (Newton-Raphson), payback, projections, sensitivity
│   │       ├── scoring/       # Capital scoring engine (gates, dimensions, bands)
│   │       ├── cam/           # Case service, notifications, approval workflow
│   │       ├── supabase/      # Client, server, middleware helpers
│   │       └── glossary.ts    # Term definitions
│   └── supabase/
│       └── migrations/        # 9 SQL migrations
├── *.html                     # Original static site (14 pages, retained for reference)
└── style.css
```

## Local Development

### Prerequisites
- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Setup

```bash
# Clone the repo
git clone https://github.com/robertconnely/CAM.git
cd CAM/website/nextjs

# Install dependencies
npm install

# Start local Supabase (Docker required)
npx supabase start

# Apply migrations and seed data
npx supabase db reset

# Create .env.local with local Supabase credentials
# (supabase start prints the URLs and keys)

# Start dev server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description | Scope |
|----------|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Client + Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Server only |
| `ANTHROPIC_API_KEY` | Claude API key (for AI wizard) | Server only |

## Database

9 migrations covering:

1. **001** — Core schema: profiles, sections, content_blocks, toc_items
2. **002** — Seed data (13 sections, 528 content blocks)
3. **003** — Storage bucket policies
4. **004** — PDLC tracker tables (initiatives, pdlc_phases, gate_reviews)
5. **005** — Capital scores
6. **006** — CAM tables (investment_cases, wizard_conversations)
7. **007** — CAM workflow (notifications, comments, approval policies)
8. **008** — Updated PDLC phases (8 phases with detailed gate criteria, macro-stages)
9. **009** — Portfolio products (PLC tracking with 8 seed products)

### Auth & Roles

Three roles enforced via Row-Level Security:
- **admin** — Full access (CRUD all tables)
- **editor** — Read + create/update
- **viewer** — Read only

## Brand System

Zelis corporate color palette enforced throughout:

| Color | Hex | Usage |
|-------|-----|-------|
| Ink Blue Primary | `#23004B` | Replaces black |
| Ink Shade 1 | `#321478` | Headers, emphasis |
| Ink Shade 2 | `#41329B` | Subheads |
| Ink Shade 3 | `#5F5FC3` | Links, hover states |
| Bright Blue | `#320FFF` | CTAs, "On Track" status |
| Gold | `#FFBE00` | Alerts, "At Risk" status |
| Red | `#E61E2D` | Warnings, "Blocked" status |

Font: Nunito Sans (Google Fonts)

## License

Private — Zelis internal use only.
