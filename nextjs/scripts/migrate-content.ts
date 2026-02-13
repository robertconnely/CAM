/**
 * migrate-content.ts
 *
 * Parses the 13 static HTML pages and generates SQL INSERT statements
 * for content_blocks, documents, and toc_items tables.
 *
 * Usage:
 *   npx tsx scripts/migrate-content.ts > supabase/migrations/004_content_data.sql
 *
 * This script reads the HTML files from the parent static site directory,
 * extracts content structure, and outputs ready-to-run SQL.
 */

import { readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";

const STATIC_DIR = resolve(__dirname, "../../"); // parent website/ directory
const OUTPUT_LINES: string[] = [];

// File type to emoji icon mapping
const FILE_ICONS: Record<string, string> = {
  docx: "📄",
  pptx: "📊",
  xlsx: "📈",
  pdf: "📕",
  png: "🖼️",
  html: "🌐",
};

// Slug to static filename mapping
const SLUG_TO_FILE: Record<string, string> = {
  onboarding: "onboarding.html",
  pdlc: "pdlc.html",
  capital: "capital.html",
  competitive: "competitive.html",
  cadence: "cadence.html",
  finance: "finance.html",
  templates: "templates.html",
  workflows: "workflows.html",
  strategy: "strategy.html",
  research: "research.html",
  "mind-maps": "mind-maps.html",
  portfolio: "portfolio.html",
  radiology: "radiology.html",
};

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''").replace(/\\/g, "\\\\");
}

function emit(sql: string) {
  OUTPUT_LINES.push(sql);
}

interface DocRef {
  title: string;
  path: string;
  icon: string;
  fileType: string;
}

interface TocEntry {
  label: string;
  anchor: string;
}

/**
 * Simple HTML parser: extracts text content, headings, paragraphs, lists, etc.
 * from the .page-main div of each content page.
 */
function parsePageMain(html: string): {
  blocks: Array<{ type: string; content: Record<string, unknown> }>;
  docs: DocRef[];
  toc: TocEntry[];
} {
  const blocks: Array<{ type: string; content: Record<string, unknown> }> = [];
  const docs: DocRef[] = [];
  const toc: TocEntry[] = [];

  // Extract page-main content
  const mainMatch = html.match(
    /<div class="page-main">([\s\S]*?)<\/div>\s*<aside/
  );
  if (!mainMatch) return { blocks, docs, toc };

  const mainContent = mainMatch[1];

  // Extract TOC from sidebar
  const tocMatch = html.match(/<div class="toc">([\s\S]*?)<\/div>/);
  if (tocMatch) {
    const tocHtml = tocMatch[1];
    const tocLinks = tocHtml.matchAll(
      /<a\s+href="#([^"]+)"[^>]*>([^<]+)<\/a>/g
    );
    for (const match of tocLinks) {
      toc.push({ anchor: match[1], label: match[2].trim() });
    }
  }

  // Extract document references
  const docMatches = mainContent.matchAll(
    /<div class="doc-item">\s*<div class="doc-icon">([^<]*)<\/div>\s*<div class="doc-link">\s*<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g
  );
  for (const match of docMatches) {
    const icon = match[1].trim();
    const path = match[2].trim();
    const title = match[3].trim();
    const ext = path.split(".").pop()?.toLowerCase() ?? "docx";
    docs.push({ title, path, icon: icon || FILE_ICONS[ext] || "📄", fileType: ext });
  }

  // Parse content into blocks (simplified — handles common patterns)
  // Split by major HTML tags
  const lines = mainContent.split(/(<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>|<p[^>]*>[\s\S]*?<\/p>|<ul>[\s\S]*?<\/ul>|<ol>[\s\S]*?<\/ol>|<div class="key-documents">[\s\S]*?<\/div>\s*<\/div>|<div class="figma-embed-section">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>|<div class="image-gallery">[\s\S]*?<\/div>\s*<\/div>|<div class="coming-soon-notice">[\s\S]*?<\/div>)/g);

  let isFirstParagraph = true;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Heading
    const headingMatch = trimmed.match(
      /<h([1-3])\s*(?:id="([^"]*)")?[^>]*>([\s\S]*?)<\/h[1-3]>/
    );
    if (headingMatch) {
      const level = parseInt(headingMatch[1]);
      const anchor = headingMatch[2] || "";
      const text = headingMatch[3].replace(/<[^>]+>/g, "").trim();

      if (level === 1) continue; // Skip h1, rendered from section title

      blocks.push({
        type: "heading",
        content: { text, level, anchor: anchor || undefined },
      });
      continue;
    }

    // Paragraph (first paragraph after h1 as subtitle)
    const pMatch = trimmed.match(/<p\s*([^>]*)>([\s\S]*?)<\/p>/);
    if (pMatch) {
      const attrs = pMatch[1];
      const text = pMatch[2].replace(/<[^>]+>/g, "").trim();

      if (isFirstParagraph && attrs.includes("opacity")) {
        blocks.push({ type: "subtitle", content: { text } });
        isFirstParagraph = false;
        continue;
      }
      isFirstParagraph = false;

      if (text) {
        // Keep HTML if it contains links or formatting
        if (pMatch[2].includes("<a ") || pMatch[2].includes("<strong>")) {
          blocks.push({ type: "paragraph", content: { html: pMatch[2].trim() } });
        } else {
          blocks.push({ type: "paragraph", content: { text } });
        }
      }
      continue;
    }

    // Unordered list
    if (trimmed.startsWith("<ul>")) {
      const items: string[] = [];
      const liMatches = trimmed.matchAll(/<li>([\s\S]*?)<\/li>/g);
      for (const li of liMatches) {
        items.push(li[1].trim());
      }
      if (items.length > 0) {
        blocks.push({ type: "list", content: { items, ordered: false } });
      }
      continue;
    }

    // Ordered list
    if (trimmed.startsWith("<ol>")) {
      const items: string[] = [];
      const liMatches = trimmed.matchAll(/<li>([\s\S]*?)<\/li>/g);
      for (const li of liMatches) {
        items.push(li[1].trim());
      }
      if (items.length > 0) {
        blocks.push({ type: "list", content: { items, ordered: true } });
      }
      continue;
    }

    // Key documents
    if (trimmed.includes('class="key-documents"')) {
      blocks.push({ type: "key_documents", content: {} });
      continue;
    }

    // Figma embed
    if (trimmed.includes('class="figma-embed-section"')) {
      const titleMatch = trimmed.match(/<h3>([^<]+)<\/h3>/);
      const iframeMatch = trimmed.match(/src="([^"]+figma[^"]+)"/);
      const imgMatch = trimmed.match(/<img[^>]+src="([^"]+)"[^>]+class="inline-preview-img"/);
      const figmaLinkMatch = trimmed.match(/<a[^>]+href="(https:\/\/[^"]*figma[^"]*)"[^>]+class="figma-btn"/);
      const noteMatch = trimmed.match(/<p class="figma-embed-note">([^<]+)<\/p>/);

      blocks.push({
        type: "figma_embed",
        content: {
          title: titleMatch?.[1]?.trim() ?? "Figma Board",
          embedUrl: iframeMatch?.[1],
          imageUrl: imgMatch?.[1],
          figmaUrl: figmaLinkMatch?.[1],
          note: noteMatch?.[1]?.trim(),
        },
      });
      continue;
    }

    // Image gallery
    if (trimmed.includes('class="image-gallery"')) {
      const images: Array<{ src: string; alt: string; caption?: string }> = [];
      const imgMatches = trimmed.matchAll(
        /<img[^>]+src="([^"]+)"[^>]+alt="([^"]*)"[^>]*>(?:\s*<p>([^<]*)<\/p>)?/g
      );
      for (const img of imgMatches) {
        images.push({
          src: img[1],
          alt: img[2],
          caption: img[3]?.trim() || undefined,
        });
      }
      if (images.length > 0) {
        blocks.push({ type: "image_gallery", content: { images } });
      }
      continue;
    }

    // Coming soon notice
    if (trimmed.includes('class="coming-soon-notice"')) {
      const text = trimmed.replace(/<[^>]+>/g, "").trim();
      blocks.push({ type: "coming_soon", content: { text } });
      continue;
    }
  }

  return { blocks, docs, toc };
}

function main() {
  emit("-- =============================================");
  emit("-- Content Migration: Auto-generated from static HTML");
  emit("-- =============================================");
  emit("");

  for (const [slug, filename] of Object.entries(SLUG_TO_FILE)) {
    const filepath = join(STATIC_DIR, filename);
    let html: string;
    try {
      html = readFileSync(filepath, "utf-8");
    } catch {
      console.error(`Warning: Could not read ${filepath}, skipping.`);
      continue;
    }

    emit(`-- ---- Section: ${slug} ----`);
    emit("");

    const { blocks, docs, toc } = parsePageMain(html);

    // Get the section ID via a subquery
    const sectionIdExpr = `(SELECT id FROM sections WHERE slug = '${slug}')`;

    // Insert TOC items
    for (let i = 0; i < toc.length; i++) {
      emit(
        `INSERT INTO toc_items (section_id, label, anchor, display_order) VALUES (${sectionIdExpr}, '${escapeSQL(toc[i].label)}', '${escapeSQL(toc[i].anchor)}', ${i});`
      );
    }

    if (toc.length > 0) emit("");

    // Insert content blocks
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const contentJson = escapeSQL(JSON.stringify(block.content));
      emit(
        `INSERT INTO content_blocks (section_id, block_type, content, display_order) VALUES (${sectionIdExpr}, '${block.type}', '${contentJson}'::jsonb, ${i});`
      );
    }

    if (blocks.length > 0) emit("");

    // Insert documents
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const storagePath = `${slug}/${doc.path.split("/").pop()}`;
      emit(
        `INSERT INTO documents (section_id, title, storage_path, file_type, icon, display_order) VALUES (${sectionIdExpr}, '${escapeSQL(doc.title)}', '${escapeSQL(storagePath)}', '${escapeSQL(doc.fileType)}', '${escapeSQL(doc.icon)}', ${i});`
      );
    }

    if (docs.length > 0) emit("");
    emit("");
  }

  // Output everything
  console.log(OUTPUT_LINES.join("\n"));
}

main();
