ZELIS SVP PRODUCT OPERATING SYSTEM - WEBSITE
================================================

Complete HTML website ready for offline use with file:// protocol.
No web server required - works directly from the filesystem.

FILES CREATED:
==============

CORE PAGES (15 total)
---------------------
1. index.html              - Master hub with searchable section cards
2. onboarding.html         - Onboarding & Day 1 Readiness
3. pdlc.html               - PDLC Framework (7-phase development lifecycle)
4. capital.html            - Capital Allocation (Investment scoring & IRR)
5. competitive.html        - Competitive Intelligence (Lyric, Machinify, Cotiviti analysis)
6. cadence.html            - Operating Cadence (5 rhythms of review)
7. finance.html            - Finance Strategy (Unit economics & ROIC)
8. templates.html          - Templates & Tools (PRD, agendas, battle cards)
9. workflows.html          - Product Workflows (PI, OON, Revenue diagrams)
10. strategy.html          - Product Strategy (2026-2028 vision & AI innovation)
11. research.html          - Research & Reference (Glossary & study guides)
12. mind-maps.html         - Mind Maps (Visual frameworks)
13. portfolio.html         - Product Portfolio (M&A history & product lines)
14. radiology.html         - Radiology COE (Imaging center of excellence)

SUPPORTING FILES
----------------
15. style.css              - Shared stylesheet with Zelis brand system

BRAND SYSTEM IMPLEMENTED:
=========================

Colors (CSS variables):
- --zelis-dark: #23004B (dark purple - backgrounds)
- --zelis-purple: #321478 (primary purple)
- --zelis-mid-purple: #41329B
- --zelis-blue-purple: #5F5FC3 (links, accents)
- --zelis-gold: #FFC000 (highlights, hover states)
- --zelis-blue: #320FFF (secondary accents)
- --zelis-red: #E61E2D
- --zelis-ice: #ECE9FF (light purple backgrounds)

Typography:
- Font: "Nunito Sans" from Google Fonts (with Avenir Next fallback)
- Responsive font sizing

Logo:
- "zelis." with gold dot - displayed in header on all pages

DESIGN FEATURES:
================

1. DARK/LIGHT MODE
   - Toggle button in header (saves preference to localStorage)
   - All pages fully styled for both modes
   - Smooth transitions between modes

2. SEARCH & FILTERING
   - Full-text search on index.html
   - Filters by category (All, Frameworks, Strategy, Operations, Tools, Intelligence)
   - Real-time filtering as you type

3. NAVIGATION
   - Header with logo and theme toggle
   - Breadcrumb navigation on all pages
   - Sidebar table of contents on content pages
   - Footer with quick links and section navigation
   - Previous/Next section links

4. RESPONSIVE DESIGN
   - Mobile-friendly layout
   - Flexbox/grid-based responsive structure
   - Breakpoints for tablets and phones
   - Touch-friendly navigation

5. VISUAL POLISH
   - Card-based layout with hover effects
   - Smooth animations and transitions
   - Gradient backgrounds
   - Z background motif on dark pages
   - Box shadows and depth
   - Consistent spacing and typography

CONTENT STRUCTURE:
==================

Each section page includes:
- Clear title and subtitle
- Quick summary paragraph
- Main content with organized sections
- Key Documents list (with file type icons)
- Related mind map images (where available)
- Sidebar table of contents
- Footer with navigation

DOCUMENT LINKING:
=================

All documents are linked using RELATIVE PATHS:
- ../00 - Onboarding and Day 1/file.docx
- ../01 - PDLC Framework/file.docx
- etc.

This allows the website to work in any directory structure
without requiring a web server or URL rewriting.

USAGE INSTRUCTIONS:
===================

1. Open index.html in any modern web browser
2. Use the search bar to find specific sections
3. Click on cards to navigate to section pages
4. Use the table of contents for long pages
5. Toggle dark/light mode with the button in the header
6. Click "Theme toggle" to save your preference

SUPPORTED BROWSERS:
===================

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

GOOGLE FONTS:
=============

The website uses Google Fonts CDN for "Nunito Sans" typography.
This works even with file:// protocol in modern browsers.
If offline access is needed, fonts can be downloaded and stored locally.

FILE STRUCTURE:
===============

/mnt/Zelis Product Operating System/
├── website/
│   ├── index.html
│   ├── onboarding.html
│   ├── pdlc.html
│   ├── capital.html
│   ├── competitive.html
│   ├── cadence.html
│   ├── finance.html
│   ├── templates.html
│   ├── workflows.html
│   ├── strategy.html
│   ├── research.html
│   ├── mind-maps.html
│   ├── portfolio.html
│   ├── radiology.html
│   └── style.css
│
└── (Existing content folders one level up)
    ├── 00 - Onboarding and Day 1/
    ├── 01 - PDLC Framework/
    ├── 02 - Capital Allocation/
    ├── 03 - Competitive Intelligence/
    ├── 04 - Operating Cadence/
    ├── 05 - Finance Strategy/
    ├── 06 - Templates and Tools/
    ├── 07 - Product Workflows/
    ├── 08 - Product Strategy/
    ├── 09 - Research and Reference/
    ├── 12 - Radiology COE/
    ├── 15 - Product Portfolio/
    └── Mind Maps/

FEATURES CHECKLIST:
===================

✓ All file links use relative paths (../folder/file)
✓ Works standalone with file:// protocol
✓ Mobile responsive design
✓ Search functionality with real-time filtering
✓ Dark/light mode toggle
✓ Smooth scroll navigation
✓ Inline SVG/CSS (no external icon library)
✓ Sticky header navigation
✓ Breadcrumb trail on every page
✓ Table of contents on long pages
✓ Image galleries for mind maps and workflows
✓ Hover effects and animations
✓ Footer with navigation links
✓ Consistent brand system throughout
✓ Semantic HTML structure
✓ Accessibility considerations

DOCUMENT REFERENCES:
====================

All file links point to existing documents one level up:
- Word documents (.docx)
- PowerPoint presentations (.pptx)
- Excel spreadsheets (.xlsx)
- PNG images (mind maps and workflow diagrams)
- HTML files (PDLC Education Deck)

Files open in default applications when clicked.

CUSTOMIZATION:
==============

To modify styles:
1. Edit style.css for global changes
2. Inline styles on individual pages for page-specific changes
3. Update CSS variables in :root for brand colors

To add new sections:
1. Create new HTML file following the template
2. Add to index.html card grid
3. Update footer links on related pages
4. Update breadcrumb navigation

PERFORMANCE:
============

- Inline CSS minimizes HTTP requests
- No external dependencies except Google Fonts
- Fast load times even on slower connections
- Optimized for file:// protocol performance
- Lazy loading ready for images

BUILD DATE: February 12, 2026
VERSION: 1.0
