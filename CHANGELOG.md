# Changelog

## [1.0.0] - 2026-02-13

### Full-Stack Migration & CAM Platform Launch

Migrated the static HTML documentation site to a production-ready Next.js 16 + Supabase application, and built the Capital Allocation Manager (CAM) — an AI-powered platform for creating and evaluating investment cases.

---

### Added

#### Next.js Application (`nextjs/`)
- **Next.js 16 + React 19** application with App Router, TypeScript, and Tailwind CSS 4
- **Supabase backend** — PostgreSQL database, email/password auth, Storage (documents + images), Row-Level Security
- **7 database migrations** covering profiles, content, PDLC tracker, capital scores, CAM tables, and workflow policies

#### Authentication & Authorization
- Email/password login with Supabase Auth
- Three roles: **admin**, **editor**, **viewer** — enforced via RLS policies and middleware
- `AuthProvider` context with session-based auth (no network-dependent `getUser()` calls)
- `RoleGate` component for role-based UI access control

#### Content Management System (Admin CMS)
- **Admin dashboard** with section CRUD, content block management, and user management
- **10 typed block editors**: Heading, Paragraph, Rich Text (TipTap WYSIWYG), Subtitle, List, Image Gallery, Key Documents, Figma Embed, Quick Summary, Coming Soon, HTML
- **TOC editor** with auto-generation from heading blocks
- **Document uploader** to Supabase Storage with download API endpoint
- All 13 content pages migrated: **528 content blocks, 58 documents, 65 TOC items, 30 images**

#### Capital Allocation Manager (CAM)
- **AI Investment Wizard** — Claude-powered 6-question conversational interview that generates a complete financial model from a plain-English idea description
- **Financial engine** (`src/lib/financial/`):
  - NPV (discounted cash flow)
  - IRR (Newton-Raphson iterative solver)
  - Payback period (monthly granularity)
  - 5-year revenue and cash flow projections with margin ramp and growth deceleration
  - Tornado sensitivity analysis (±20% on each assumption)
- **Capital Scoring Wizard** — 11-step guided evaluation:
  - Initiative type and revenue model classification
  - IRR gate check (thresholds by initiative type)
  - Contribution margin gate check (thresholds by revenue model)
  - 5-dimension weighted scoring: Financial Return (30%), Strategic Alignment (25%), Competitive Impact (20%), Client Demand (15%), Execution Feasibility (10%)
  - Band assignment: A (90+), B (70-89), C (50-69), D (<50)
  - Recommendation: Strong Go / Go / Consider / Hold
- **Case workflow**: Create → Classify → Financial Model → Submit → Score → Recommend
- **Case results view** with financial metrics, scoring breakdown, sensitivity chart, and AI-generated investment memo
- **Tornado chart** (Recharts) for sensitivity visualization
- Comment threads, notifications, and approval workflow

#### PDLC Tracker
- Stage-gate initiative tracker with 7 PDLC phases
- Gate review form with Go / No-Go / Pivot / Park decisions
- Governance tiers (Tier 1–4) and status tracking (On Track, At Risk, Blocked, Complete)
- PDLC cycle diagram visualization

#### Executive Dashboard
- KPI stats bar, pipeline Kanban view, recent activity feed
- **ROIC Value Driver Tree** — interactive visualization rebranded to Zelis colors
- Quick actions panel

#### Hub & Navigation
- Searchable section hub with category filter buttons
- Layout components: Header, Footer, Sidebar, Breadcrumb
- Protected route group with auth-gated access
- Global loading, error, and 404 pages

#### API Routes
- `POST /api/ai/wizard` — Claude-powered investment wizard endpoint
- `POST /api/ai/memo` — AI investment memo generation
- `GET /api/documents/[id]/download` — Authenticated document download

#### CAM Project Documentation (`CAM Project/`)
- `CAM_PRD_v1.0.md` — Full product requirements document
- `CAM_v1.0_Build_Plan.md` — Phased engineering build plan
- `CAM_Weekend_Build_Plan.md` — 48-hour MVP sprint plan
- `CAM_UI_Prototype.jsx` — React prototype with working UI components

#### Developer Tooling
- 5 migration/upload scripts for content, documents, and images
- 18 agent persona markdown files for specialized AI guidance
- `changelog-generator.md` — Changelog creation guidelines
- Root `.gitignore` for macOS artifacts

### Changed
- `CLAUDE.md` — Added agent personas reference table
- `pdlc.html` — Minor HTML entity fix in phase naming
