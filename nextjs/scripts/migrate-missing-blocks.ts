/**
 * migrate-missing-blocks.ts
 *
 * Extracts figma_embed, image_gallery, key_documents, and coming_soon blocks
 * that the initial regex-based parser missed due to nested HTML structure.
 *
 * Outputs SQL INSERT statements for content_blocks.
 *
 * Usage:
 *   npx tsx scripts/migrate-missing-blocks.ts | docker exec -i supabase_db_nextjs psql -U postgres -d postgres
 */

import { readFileSync } from "fs";
import { join, resolve } from "path";

const STATIC_DIR = resolve(__dirname, "../../");

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

// Supabase images bucket public URL for local dev
const IMAGES_BASE_URL = "http://127.0.0.1:54321/storage/v1/object/public/images";

function escSQL(str: string): string {
  return str.replace(/'/g, "''");
}

function escJSON(obj: unknown): string {
  return escSQL(JSON.stringify(obj));
}

/**
 * Find matching closing div for a given opening position.
 * Counts nested <div> and </div> tags.
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
 * Extract all instances of a block by class name from page-main content.
 */
function extractBlocks(html: string, className: string): string[] {
  const blocks: string[] = [];
  const searchStr = `class="${className}"`;
  let pos = 0;
  while (true) {
    const idx = html.indexOf(searchStr, pos);
    if (idx === -1) break;
    // Find the opening <div before this class
    let divStart = html.lastIndexOf("<div", idx);
    if (divStart === -1) { pos = idx + 1; continue; }
    const endPos = findClosingDiv(html, divStart);
    blocks.push(html.substring(divStart, endPos));
    pos = endPos;
  }
  return blocks;
}

/**
 * Map an image src from relative path to Supabase storage URL.
 */
function mapImageSrc(src: string, slug: string): string {
  // Handle ../Mind Maps/ paths
  if (src.includes("Mind Maps/")) {
    const filename = src.split("Mind Maps/").pop()!;
    return `${IMAGES_BASE_URL}/mind-maps/${filename}`;
  }
  // Handle ../00 - Onboarding/ etc
  if (src.includes("../")) {
    const filename = src.split("/").pop()!;
    return `${IMAGES_BASE_URL}/${slug}/${filename.replace(/\s+/g, "_")}`;
  }
  return src;
}

function parseFigmaEmbed(blockHtml: string, slug: string): Record<string, unknown> {
  const titleMatch = blockHtml.match(/<h3>([^<]+)<\/h3>/);
  const noteMatch = blockHtml.match(/class="figma-embed-note">([^<]+)<\/p>/);

  // Check for iframe (embed URL)
  const iframeMatch = blockHtml.match(/src="(https:\/\/www\.figma\.com\/embed[^"]+)"/);

  // Check for inline preview image
  const imgMatch = blockHtml.match(/<img\s+src="([^"]+)"[^>]*class="inline-preview-img"/);

  // Check for Figma button link
  const btnMatch = blockHtml.match(/<a\s+href="(https?:\/\/[^"]*figma[^"]*)"[^>]*class="figma-btn"/);

  return {
    title: titleMatch?.[1]?.trim() ?? "Figma Board",
    embedUrl: iframeMatch?.[1] ?? undefined,
    imageUrl: imgMatch ? mapImageSrc(imgMatch[1], slug) : undefined,
    figmaUrl: btnMatch?.[1] ?? undefined,
    note: noteMatch?.[1]?.trim() ?? undefined,
  };
}

function parseImageGallery(blockHtml: string, slug: string): Array<{ src: string; alt: string; caption?: string }> {
  const images: Array<{ src: string; alt: string; caption?: string }> = [];
  // Match each image-item
  const itemRegex = /<div class="image-item">([\s\S]*?)<\/div>\s*<\/div>/g;
  // Simpler: extract all img tags and following p tags
  const imgRegex = /<img\s+src="([^"]+)"\s+alt="([^"]*)"[^>]*>/g;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(blockHtml)) !== null) {
    const src = mapImageSrc(imgMatch[1], slug);
    const alt = imgMatch[2];
    // Look for caption <p> after this img
    const afterImg = blockHtml.substring(imgMatch.index + imgMatch[0].length, imgMatch.index + imgMatch[0].length + 200);
    const captionMatch = afterImg.match(/<p>([^<]+)<\/p>/);
    images.push({
      src,
      alt,
      caption: captionMatch?.[1]?.trim(),
    });
  }
  return images;
}

function parseComingSoon(blockHtml: string): string {
  // Strip HTML tags but keep text
  const text = blockHtml
    .replace(/<div[^>]*>/, "")
    .replace(/<\/div>$/, "")
    .replace(/<\/?p>/g, "")
    .replace(/<strong>/g, "**")
    .replace(/<\/strong>/g, "**")
    .trim();
  return text;
}

const SQL_LINES: string[] = [];

function emit(sql: string) {
  SQL_LINES.push(sql);
}

function main() {
  emit("-- Missing content blocks: figma_embed, image_gallery, key_documents, coming_soon");
  emit("-- Auto-generated from static HTML pages");
  emit("");

  for (const [slug, filename] of Object.entries(SLUG_TO_FILE)) {
    const filepath = join(STATIC_DIR, filename);
    let html: string;
    try {
      html = readFileSync(filepath, "utf-8");
    } catch {
      continue;
    }

    // Extract page-main content
    const mainStart = html.indexOf('class="page-main"');
    if (mainStart === -1) continue;
    const mainDivStart = html.lastIndexOf("<div", mainStart);
    const asideStart = html.indexOf("<aside", mainStart);
    const pageMain = html.substring(mainDivStart, asideStart > 0 ? asideStart : undefined);

    const sectionId = `(SELECT id FROM sections WHERE slug = '${slug}')`;

    // Get current max display_order for this section
    let blockOrder = 1000; // Start high to avoid conflicts with existing blocks

    // === FIGMA EMBEDS ===
    const figmaBlocks = extractBlocks(pageMain, "figma-embed-section");
    for (const block of figmaBlocks) {
      const content = parseFigmaEmbed(block, slug);
      // Remove undefined values
      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(content)) {
        if (v !== undefined) clean[k] = v;
      }
      emit(`INSERT INTO content_blocks (section_id, block_type, content, display_order) VALUES (${sectionId}, 'figma_embed', '${escJSON(clean)}'::jsonb, ${blockOrder++});`);
    }

    // === IMAGE GALLERIES ===
    const galleryBlocks = extractBlocks(pageMain, "image-gallery");
    for (const block of galleryBlocks) {
      const images = parseImageGallery(block, slug);
      if (images.length > 0) {
        emit(`INSERT INTO content_blocks (section_id, block_type, content, display_order) VALUES (${sectionId}, 'image_gallery', '${escJSON({ images })}'::jsonb, ${blockOrder++});`);
      }
    }

    // === KEY DOCUMENTS ===
    const keyDocBlocks = extractBlocks(pageMain, "key-documents");
    for (const _block of keyDocBlocks) {
      // key_documents blocks reference the documents table, not inline data
      emit(`INSERT INTO content_blocks (section_id, block_type, content, display_order) VALUES (${sectionId}, 'key_documents', '${escJSON({})}'::jsonb, ${blockOrder++});`);
    }

    // === COMING SOON ===
    const comingSoonBlocks = extractBlocks(pageMain, "coming-soon-notice");
    for (const block of comingSoonBlocks) {
      const text = parseComingSoon(block);
      emit(`INSERT INTO content_blocks (section_id, block_type, content, display_order) VALUES (${sectionId}, 'coming_soon', '${escJSON({ text })}'::jsonb, ${blockOrder++});`);
    }

    if (figmaBlocks.length + galleryBlocks.length + keyDocBlocks.length + comingSoonBlocks.length > 0) {
      emit(`-- ${slug}: ${figmaBlocks.length} figma, ${galleryBlocks.length} gallery, ${keyDocBlocks.length} docs, ${comingSoonBlocks.length} coming_soon`);
      emit("");
    }
  }

  console.log(SQL_LINES.join("\n"));
}

main();
