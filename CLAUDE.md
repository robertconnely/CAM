# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS documentation site for the Zelis Price Optimization Business Unit's Product Operating System. Designed for **offline use** via `file://` protocol — no build tools, no server, no framework dependencies.

## Development

**No build system.** Open `index.html` directly in a browser to develop. The only external dependency is Google Fonts (Nunito Sans) loaded via CDN.

To preview: open any `.html` file in Chrome, Firefox, Safari, or Edge.

## Architecture

### Site Structure

- **`index.html`** — Master hub with JavaScript-powered search/filter over 13 section cards
- **13 content pages** (`onboarding.html`, `pdlc.html`, `capital.html`, etc.) — Each follows a consistent two-column layout: main content + sidebar TOC
- **`style.css`** — Single shared stylesheet with CSS custom properties for the Zelis brand system

### Page Template Pattern

Every content page follows this structure:
```
<header> with "zelis." logo
<nav> breadcrumb
<main class="page-content">
  <div class="page-main"> — Content: h1, subtitle, h2/h3 sections, .key-documents, .image-gallery
  <aside class="sidebar"> — .toc with ordered list linking to page sections
</main>
<footer> with section navigation links
```

### JavaScript

Vanilla JS only, inlined in each page:
- `index.html`: Search engine with `sections[]` data array, `searchCards()`, `filterByCategory()`, category filter buttons
- Content pages: `smoothScroll()` for TOC anchor navigation
- `workflows.html` / `mind-maps.html`: Lightbox overlay for image zoom

### Document Linking

All links to source documents use **relative paths** one directory up: `../[folder-number] - [folder-name]/[filename]`. This is critical for offline `file://` access. Referenced document types: `.docx`, `.pptx`, `.xlsx`, `.png`, `.html`.

Parent folder structure:
```
../00 - Onboarding and Day 1/
../01 - PDLC Framework/
../02 - Capital Allocation/
../03 - Competitive Intelligence/
../04 - Operating Cadence/
../05 - Finance Strategy/
../06 - Templates and Tools/
../07 - Product Workflows/
../08 - Product Strategy/
../09 - Research and Reference/
../12 - Radiology COE/
../15 - Product Portfolio/
../Mind Maps/
```

## Brand System (CSS Variables)

```css
--zelis-dark: #23004B       /* dark purple backgrounds */
--zelis-purple: #321478     /* primary purple */
--zelis-mid-purple: #41329B
--zelis-blue-purple: #5F5FC3 /* links, accents */
--zelis-gold: #FFC000       /* highlights, hover states */
--zelis-blue: #320FFF       /* secondary accents */
--zelis-red: #E61E2D
--zelis-ice: #ECE9FF        /* light purple backgrounds */
```

Font: `'Nunito Sans', 'Avenir Next', sans-serif` — weights 300, 400, 600, 700, 800.

## Conventions

- **File naming:** lowercase with hyphens (`mind-maps.html`)
- **CSS classes:** kebab-case (`.page-content`, `.card-icon`, `.key-documents`)
- **Responsive breakpoint:** 768px — single column below, two-column above
- **No external JS/CSS libraries** — everything is vanilla HTML/CSS/JS with inline SVG icons
- Page-specific styles go in `<style>` blocks in the page's `<head>`; shared styles go in `style.css`

## Adding a New Section

1. Create a new `.html` file following the page template pattern above
2. Add an entry to the `sections[]` array in `index.html` with `id`, `title`, `description`, `icon`, `url`, `category`, and `keywords`
3. Update footer navigation links on adjacent pages
4. Add breadcrumb navigation to the new page

## Agent Personas

The following `.md` files in the project root define specialized agent personas. Reference them for domain-specific guidance when working on the corresponding areas of the codebase:

| File | Role | When to Use |
|------|------|-------------|
| `frontend-developer.md` | Frontend Development Specialist | Building UI components, React/Next.js work, responsive design, performance optimization |
| `ui-designer.md` | UI Designer | Creating interfaces, design systems, visual hierarchy, component states |
| `backend-architect.md` | Backend Architect | API design, database architecture, security, scalability patterns |
| `full-stack-architect.md` | Full-Stack Architect | System design spanning frontend + backend, database + API integration |
| `solution-architect.md` | Solution Architect | Transforming abstract ideas into concrete implementation plans, technology selection |
| `cloud-architectmd.md` | Cloud Architect | AWS/GCP/Azure infrastructure, serverless, container orchestration, cost optimization |
| `database-optimizermd.md` | Data Platform Optimizer | Query optimization, schema design, caching strategies, data pipelines |
| `code-reviewer.md` | Code Reviewer | Code quality, security review, best practices enforcement |
| `debugger.md` | Debugger | Root cause analysis, error resolution, debugging methodology |
| `ux-researcher.md` | UX Researcher | User journey mapping, usability testing, persona development, research synthesis |
| `unit-test-generator.md` | Unit Test Generator | Automated test creation, coverage improvement, test architecture |
| `planning-prd-agent.md` | Planning & PRD Agent | PRD creation, user stories, task breakdowns, dependency analysis |
| `project-curator.md` | Project Curator | Codebase reorganization, folder structure optimization, import path fixes |
| `codebase-documenter.md` | Codebase Documenter | Creating comprehensive documentation, CLAUDE.md files |
| `deployment-engineer.md` | Deployment Engineer | CI/CD pipelines, Docker, Kubernetes, infrastructure as code |
| `QUICKSTART.md` | Quick Start Guide | Quick reference for the static site structure and development |
