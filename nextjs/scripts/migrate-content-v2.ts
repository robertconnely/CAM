/**
 * migrate-content-v2.ts
 *
 * Complete rewrite of the content migration — uses div-counting instead of
 * regex to properly handle nested HTML structures.
 *
 * This replaces BOTH migrate-content.ts AND migrate-missing-blocks.ts.
 *
 * Outputs SQL that:
 *   1. Deletes ALL existing content_blocks (clean slate)
 *   2. Inserts every block in correct document order
 *   3. Re-inserts documents (after deleting stale ones)
 *
 * Usage:
 *   npx tsx scripts/migrate-content-v2.ts | docker exec -i supabase_db_nextjs psql -U postgres -d postgres
 */

import { readFileSync } from "fs";
import { join, resolve } from "path";

const STATIC_DIR = resolve(__dirname, "../../");
const IMAGES_BASE_URL =
  "http://127.0.0.1:54321/storage/v1/object/public/images";

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

const FILE_ICONS: Record<string, string> = {
  docx: "📄",
  pptx: "📊",
  xlsx: "📈",
  pdf: "📕",
  png: "🖼️",
  html: "🌐",
};

const SQL: string[] = [];
function emit(sql: string) {
  SQL.push(sql);
}

function esc(str: string): string {
  return str.replace(/'/g, "''");
}

function escJSON(obj: unknown): string {
  return esc(JSON.stringify(obj));
}

// ── Div-counting helpers ──────────────────────────────────────────────

/**
 * Starting from an opening <div at `startPos`, find its matching </div>.
 */
function findClosingDiv(html: string, startPos: number): number {
  let depth = 0;
  let i = startPos;
  while (i < html.length) {
    if (html.substring(i, i + 4) === "<div") {
      depth++;
      i += 4;
    } else if (html.substring(i, i + 6) === "</div>") {
      depth--;
      if (depth === 0) return i + 6;
      i += 6;
    } else {
      i++;
    }
  }
  return html.length;
}

/**
 * Extract the full innerHTML of the page-main div.
 */
function extractPageMain(html: string): string {
  const marker = 'class="page-main"';
  const idx = html.indexOf(marker);
  if (idx === -1) return "";
  // Find the <div that contains this class
  const divStart = html.lastIndexOf("<div", idx);
  if (divStart === -1) return "";
  const divEnd = findClosingDiv(html, divStart);
  // Return innerHTML (skip the opening tag up through ">")
  const openTagEnd = html.indexOf(">", idx) + 1;
  // Strip the outer </div> at the end
  return html.substring(openTagEnd, divEnd - 6).trim();
}

// ── Image URL mapping ─────────────────────────────────────────────────

function mapImageSrc(src: string, slug: string): string {
  if (src.includes("Mind Maps/")) {
    const filename = src.split("Mind Maps/").pop()!;
    return `${IMAGES_BASE_URL}/mind-maps/${filename}`;
  }
  if (src.includes("../")) {
    const filename = src.split("/").pop()!;
    return `${IMAGES_BASE_URL}/${slug}/${filename.replace(/\s+/g, "_")}`;
  }
  return src;
}

// ── Block types ───────────────────────────────────────────────────────

interface Block {
  type: string;
  content: Record<string, unknown>;
}

interface DocRef {
  title: string;
  storagePath: string;
  icon: string;
  fileType: string;
}

interface TocEntry {
  label: string;
  anchor: string;
}

// ── Sequential HTML walker ────────────────────────────────────────────

/**
 * Walk through `pageMain` HTML sequentially, yielding blocks in document
 * order. Handles nested div-based sections via div-counting.
 */
function parseContent(
  pageMain: string,
  slug: string
): { blocks: Block[]; docs: DocRef[] } {
  const blocks: Block[] = [];
  const docs: DocRef[] = [];
  let pos = 0;
  let isFirstParagraph = true;

  while (pos < pageMain.length) {
    // Skip whitespace / text nodes between tags
    const nextTag = pageMain.indexOf("<", pos);
    if (nextTag === -1) break;
    pos = nextTag;

    // ── <h1> ── skip (title comes from sections table)
    if (pageMain.substring(pos, pos + 3) === "<h1") {
      const closeTag = pageMain.indexOf("</h1>", pos);
      if (closeTag === -1) break;
      pos = closeTag + 5;
      continue;
    }

    // ── <h2> ──
    if (pageMain.substring(pos, pos + 3) === "<h2") {
      const closeTag = pageMain.indexOf("</h2>", pos);
      if (closeTag === -1) break;
      const fullTag = pageMain.substring(pos, closeTag + 5);
      const idMatch = fullTag.match(/id="([^"]*)"/);
      const textMatch = fullTag.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
      if (textMatch) {
        const text = textMatch[1].replace(/<[^>]+>/g, "").trim();
        if (text) {
          blocks.push({
            type: "heading",
            content: {
              text,
              level: 2,
              anchor: idMatch?.[1] || undefined,
            },
          });
        }
      }
      pos = closeTag + 5;
      continue;
    }

    // ── <h3> ──
    if (pageMain.substring(pos, pos + 3) === "<h3") {
      const closeTag = pageMain.indexOf("</h3>", pos);
      if (closeTag === -1) break;
      const fullTag = pageMain.substring(pos, closeTag + 5);
      const idMatch = fullTag.match(/id="([^"]*)"/);
      const textMatch = fullTag.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
      if (textMatch) {
        const text = textMatch[1].replace(/<[^>]+>/g, "").trim();
        if (text) {
          blocks.push({
            type: "heading",
            content: {
              text,
              level: 3,
              anchor: idMatch?.[1] || undefined,
            },
          });
        }
      }
      pos = closeTag + 5;
      continue;
    }

    // ── <h4> ──
    if (pageMain.substring(pos, pos + 3) === "<h4") {
      const closeTag = pageMain.indexOf("</h4>", pos);
      if (closeTag === -1) break;
      pos = closeTag + 5;
      continue; // skip h4 (usually "Key Documents" heading inside the div)
    }

    // ── <p> ──
    if (pageMain.substring(pos, pos + 2) === "<p") {
      // Find the closing </p>. Note: <p> cannot legally nest,
      // but some content has <p> followed by another <p> without closing.
      const closeTag = pageMain.indexOf("</p>", pos);
      if (closeTag === -1) {
        pos++;
        continue;
      }
      const fullTag = pageMain.substring(pos, closeTag + 4);
      const attrMatch = fullTag.match(/<p\s*([^>]*)>/);
      const attrs = attrMatch?.[1] ?? "";
      const innerHtml = fullTag.replace(/<p[^>]*>/, "").replace(/<\/p>$/, "");
      const text = innerHtml.replace(/<[^>]+>/g, "").trim();

      if (text) {
        // First paragraph with opacity class → subtitle
        if (isFirstParagraph && attrs.includes("opacity")) {
          blocks.push({ type: "subtitle", content: { text } });
          isFirstParagraph = false;
        } else {
          isFirstParagraph = false;
          // Keep HTML if it contains links or formatting
          if (
            innerHtml.includes("<a ") ||
            innerHtml.includes("<strong>") ||
            innerHtml.includes("<em>")
          ) {
            blocks.push({
              type: "paragraph",
              content: { html: innerHtml.trim() },
            });
          } else {
            blocks.push({ type: "paragraph", content: { text } });
          }
        }
      }
      pos = closeTag + 4;
      continue;
    }

    // ── <ul> ──
    if (pageMain.substring(pos, pos + 4) === "<ul>" || pageMain.substring(pos, pos + 4) === "<ul ") {
      const closeTag = pageMain.indexOf("</ul>", pos);
      if (closeTag === -1) {
        pos++;
        continue;
      }
      const fullTag = pageMain.substring(pos, closeTag + 5);
      const items: string[] = [];
      const liMatches = fullTag.matchAll(/<li>([\s\S]*?)<\/li>/g);
      for (const li of liMatches) {
        items.push(li[1].trim());
      }
      if (items.length > 0) {
        blocks.push({ type: "list", content: { items, ordered: false } });
      }
      pos = closeTag + 5;
      continue;
    }

    // ── <ol> ──
    if (pageMain.substring(pos, pos + 4) === "<ol>" || pageMain.substring(pos, pos + 4) === "<ol ") {
      const closeTag = pageMain.indexOf("</ol>", pos);
      if (closeTag === -1) {
        pos++;
        continue;
      }
      const fullTag = pageMain.substring(pos, closeTag + 5);
      const items: string[] = [];
      const liMatches = fullTag.matchAll(/<li>([\s\S]*?)<\/li>/g);
      for (const li of liMatches) {
        items.push(li[1].trim());
      }
      if (items.length > 0) {
        blocks.push({ type: "list", content: { items, ordered: true } });
      }
      pos = closeTag + 5;
      continue;
    }

    // ── <div> — handle block-level sections ──
    if (pageMain.substring(pos, pos + 4) === "<div") {
      const tagEnd = pageMain.indexOf(">", pos);
      if (tagEnd === -1) break;
      const openTag = pageMain.substring(pos, tagEnd + 1);
      const divEnd = findClosingDiv(pageMain, pos);
      const fullDiv = pageMain.substring(pos, divEnd);

      // ── figma-embed-section ──
      if (openTag.includes("figma-embed-section")) {
        const titleMatch = fullDiv.match(/<h3>([^<]+)<\/h3>/);
        const noteMatch = fullDiv.match(
          /class="figma-embed-note">([^<]+)<\/p>/
        );
        const iframeMatch = fullDiv.match(
          /src="(https:\/\/www\.figma\.com\/embed[^"]+)"/
        );
        const imgMatch = fullDiv.match(
          /<img\s+src="([^"]+)"[^>]*class="inline-preview-img"/
        );
        const btnMatch = fullDiv.match(
          /<a\s+href="(https?:\/\/[^"]*figma[^"]*)"[^>]*class="figma-btn"/
        );

        const content: Record<string, unknown> = {
          title: titleMatch?.[1]?.trim() ?? "Figma Board",
        };
        if (iframeMatch) content.embedUrl = iframeMatch[1];
        if (imgMatch) content.imageUrl = mapImageSrc(imgMatch[1], slug);
        if (btnMatch) content.figmaUrl = btnMatch[1];
        if (noteMatch) content.note = noteMatch[1].trim();

        blocks.push({ type: "figma_embed", content });
        pos = divEnd;
        continue;
      }

      // ── image-gallery ──
      if (openTag.includes("image-gallery")) {
        const images: Array<{
          src: string;
          alt: string;
          caption?: string;
        }> = [];
        const imgRegex =
          /<img\s+src="([^"]+)"\s+alt="([^"]*)"[^>]*>/g;
        let imgMatch;
        while ((imgMatch = imgRegex.exec(fullDiv)) !== null) {
          const src = mapImageSrc(imgMatch[1], slug);
          const alt = imgMatch[2];
          const after = fullDiv.substring(
            imgMatch.index + imgMatch[0].length,
            imgMatch.index + imgMatch[0].length + 200
          );
          const capMatch = after.match(/<p>([^<]+)<\/p>/);
          images.push({
            src,
            alt,
            caption: capMatch?.[1]?.trim(),
          });
        }
        if (images.length > 0) {
          blocks.push({
            type: "image_gallery",
            content: { images },
          });
        }
        pos = divEnd;
        continue;
      }

      // ── key-documents ──
      if (openTag.includes("key-documents")) {
        // Extract document references
        const docMatches = fullDiv.matchAll(
          /<div class="doc-item">\s*<div class="doc-icon">([^<]*)<\/div>\s*<div class="doc-link">\s*<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g
        );
        for (const match of docMatches) {
          const icon = match[1].trim();
          const path = match[2].trim();
          const title = match[3].trim();
          const ext = path.split(".").pop()?.toLowerCase() ?? "docx";

          // Skip Figma URLs and internal HTML page references
          if (
            path.includes("figma.com") ||
            path.includes("utm_source=") ||
            (path.endsWith(".html") && !path.includes("../") && !path.includes("file://"))
          ) {
            continue;
          }

          const filename = path.split("/").pop() ?? "";
          const storagePath = `${slug}/${filename}`;
          docs.push({
            title,
            storagePath,
            icon: icon || FILE_ICONS[ext] || "📄",
            fileType: ext,
          });
        }
        blocks.push({ type: "key_documents", content: {} });
        pos = divEnd;
        continue;
      }

      // ── coming-soon-notice ──
      if (openTag.includes("coming-soon-notice")) {
        let text = fullDiv
          .replace(/<div[^>]*>/g, "")
          .replace(/<\/div>/g, "")
          .replace(/<\/?p>/g, "")
          .replace(/<strong>/g, "**")
          .replace(/<\/strong>/g, "**")
          .trim();
        blocks.push({ type: "coming_soon", content: { text } });
        pos = divEnd;
        continue;
      }

      // ── doc-list (standalone, outside key-documents) ──
      if (openTag.includes("doc-list")) {
        const docMatches = fullDiv.matchAll(
          /<div class="doc-item">\s*<div class="doc-icon">([^<]*)<\/div>\s*<div class="doc-link">\s*<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g
        );
        for (const match of docMatches) {
          const icon = match[1].trim();
          const path = match[2].trim();
          const title = match[3].trim();
          const ext = path.split(".").pop()?.toLowerCase() ?? "docx";

          if (
            path.includes("figma.com") ||
            path.includes("utm_source=") ||
            (path.endsWith(".html") && !path.includes("../") && !path.includes("file://"))
          ) {
            continue;
          }

          const filename = path.split("/").pop() ?? "";
          const storagePath = `${slug}/${filename}`;
          docs.push({
            title,
            storagePath,
            icon: icon || FILE_ICONS[ext] || "📄",
            fileType: ext,
          });
        }
        pos = divEnd;
        continue;
      }

      // ── any other div — skip the opening tag, parse inside ──
      // This handles wrapper divs like figma-link-row, doc-item, etc.
      // We advance past the opening tag and let inner elements be parsed
      pos = tagEnd + 1;
      continue;
    }

    // ── </div> — skip closing tags ──
    if (pageMain.substring(pos, pos + 6) === "</div>") {
      pos += 6;
      continue;
    }

    // ── <aside> — stop parsing (sidebar content) ──
    if (pageMain.substring(pos, pos + 6) === "<aside") {
      break;
    }

    // ── Other tags — skip ──
    pos++;
  }

  return { blocks, docs };
}

/**
 * Extract TOC entries from sidebar.
 */
function parseToc(html: string): TocEntry[] {
  const toc: TocEntry[] = [];
  const tocMatch = html.match(/<div class="toc">([\s\S]*?)<\/div>/);
  if (tocMatch) {
    const links = tocMatch[1].matchAll(
      /<a\s+href="#([^"]+)"[^>]*>([^<]+)<\/a>/g
    );
    for (const m of links) {
      toc.push({ anchor: m[1], label: m[2].trim() });
    }
  }
  return toc;
}

// ── Main ──────────────────────────────────────────────────────────────

function main() {
  emit("-- =============================================");
  emit("-- Content Migration v2: Full reparse with div-counting");
  emit("-- =============================================");
  emit("");
  emit("-- Clean slate: delete all existing content blocks and documents");
  emit("DELETE FROM content_blocks;");
  emit("DELETE FROM documents;");
  emit("DELETE FROM toc_items;");
  emit("");

  for (const [slug, filename] of Object.entries(SLUG_TO_FILE)) {
    const filepath = join(STATIC_DIR, filename);
    let html: string;
    try {
      html = readFileSync(filepath, "utf-8");
    } catch {
      continue;
    }

    const pageMain = extractPageMain(html);
    if (!pageMain) {
      console.error(`Warning: no page-main found in ${filename}`);
      continue;
    }

    const { blocks, docs } = parseContent(pageMain, slug);
    const toc = parseToc(html);

    const sid = `(SELECT id FROM sections WHERE slug = '${slug}')`;

    emit(`-- ---- ${slug} (${blocks.length} blocks, ${docs.length} docs, ${toc.length} toc) ----`);

    // TOC items
    for (let i = 0; i < toc.length; i++) {
      emit(
        `INSERT INTO toc_items (section_id, label, anchor, display_order) VALUES (${sid}, '${esc(toc[i].label)}', '${esc(toc[i].anchor)}', ${i});`
      );
    }

    // Content blocks
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      // Remove undefined values from content
      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(b.content)) {
        if (v !== undefined) clean[k] = v;
      }
      emit(
        `INSERT INTO content_blocks (section_id, block_type, content, display_order) VALUES (${sid}, '${b.type}', '${escJSON(clean)}'::jsonb, ${i});`
      );
    }

    // Documents
    for (let i = 0; i < docs.length; i++) {
      const d = docs[i];
      emit(
        `INSERT INTO documents (section_id, title, storage_path, file_type, icon, display_order) VALUES (${sid}, '${esc(d.title)}', '${esc(d.storagePath)}', '${esc(d.fileType)}', '${esc(d.icon)}', ${i});`
      );
    }

    emit("");
  }

  console.log(SQL.join("\n"));
}

main();
