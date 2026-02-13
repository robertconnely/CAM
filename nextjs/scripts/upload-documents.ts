/**
 * upload-documents.ts
 *
 * Uploads all referenced documents from the static site's parent directories
 * to the Supabase 'documents' storage bucket.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/upload-documents.ts
 *
 * Requires the SUPABASE_SERVICE_ROLE_KEY for admin-level storage access.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join, resolve, basename } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Base directory (parent of website/)
const BASE_DIR = resolve(__dirname, "../../../");

// Map section slugs to their document source folders
const SECTION_DOCS: Record<string, { folder: string; files: string[] }> = {
  onboarding: {
    folder: "00 - Onboarding and Day 1",
    files: [
      "Day_1_Readiness_Checklist.docx",
      "First_30_Days_Day_by_Day.docx",
      "First_90_Days_Success_Tracker.docx",
      "Listening_Tour_Playbook.docx",
      "Day_1_Project_Initiatives.docx",
      "Regulatory_Landscape_Briefing.docx",
      "Zelis_Price_Optimization_Org_Chart.pptx",
    ],
  },
  pdlc: {
    folder: "01 - PDLC Framework",
    files: [
      "Zelis_PDLC_Framework.docx",
      "PDLC_Education_Deck.html",
      "PDLC_NEW.pptx",
      "PDLC_Stage_Gate_Tracker.xlsx",
      "Product_Discovery_Framework.docx",
      "Product_Management_Playbook_Summary.docx",
      "Product_Engineering_Partnership_Charter.docx",
      "Product_Operating_Model_Rhythms.docx",
      "SAFe_Planning_RACI.docx",
      "SAFe Planning Checklist.docx",
      "Product Planning Cadence SAFe.docx",
      "Capital_Development_Process_Framework.docx",
    ],
  },
  capital: {
    folder: "02 - Capital Allocation",
    files: [
      "Capital_Allocation_Education_Deck.pptx",
      "Capital_Allocation_Scoring_Model.xlsx",
    ],
  },
  competitive: {
    folder: "03 - Competitive Intelligence",
    files: [
      "Competitive_Intelligence_Education_Deck.pptx",
      "Zelis_Detailed_Research_Report.docx",
      "Zelis_Price_Optimization_Competitive_Analysis.pptx",
      "Zelis_Price_Optimization_Competitive_Landscape.pptx",
    ],
  },
  cadence: {
    folder: "04 - Operating Cadence",
    files: [
      "Operating_Cadence_Education_Deck.pptx",
      "Product_OKR_Tracker.xlsx",
    ],
  },
  finance: {
    folder: "05 - Finance Strategy",
    files: [
      "Finance_Strategy_Education_Deck.pptx",
      "Unit_Economics_Model.xlsx",
      "zelis unit economics.xlsx",
      "zelis unit economics for PI - example.xlsx",
      "Zelis_Imaging_COE_ProForma.xlsx",
    ],
  },
  templates: {
    folder: "06 - Templates and Tools",
    files: [
      "PRD_Template.xlsx",
      "Meeting_Agenda_Templates.xlsx",
      "Competitive_Battle_Card_Template.xlsx",
      "Confluence Jira Implementation Guide.docx",
    ],
  },
  strategy: {
    folder: "08 - Product Strategy",
    files: [
      "Zelis_Product_Vision_2026_2028.docx",
      "Zelis_AI_Innovation_Prioritization_Deck.pptx",
      "Zelis_AI_Innovation_Prioritization_Matrix.docx",
      "Zelis Competitive Battlecards Updated.docx",
      "Zelis_Capital_Allocation_Framework_v2.pptx",
      "Zelis Flow v3.pptx",
    ],
  },
  research: {
    folder: "09 - Research and Reference",
    files: [
      "Acronym_Terminology_Glossary.docx",
      "Payment_Integrity_OON_Study_Guide.docx",
      "Zelis_SVP_Product_Knowledge_Base.docx",
      "Document_1_Industry_Market_Landscape.docx",
      "Document_2_Zelis_Intelligence.docx",
      "Document_3_Zelis_Competitive_Landscape_Analysis.docx",
      "Document_4_SVP_Product_Success_Framework.docx",
      "Document_5_Learning_Plan.docx",
      "Document_6_Strategic_Opportunity_Assessment.docx",
    ],
  },
  portfolio: {
    folder: "15 - Product Portfolio",
    files: ["Zelis_Product_Portfolio_MA_History.xlsx"],
  },
  radiology: {
    folder: "12 - Radiology COE",
    files: [
      "Radiology_COE_Executive_OnePager.docx",
      "Imaging_COE_Market_Analysis.docx",
      "Imaging_COE_Inorganic_Context.docx",
      "Radiology_COE_MA_Target_List.docx",
      "Zelis_Imaging_COE_ProForma.xlsx",
      "Zelis_Imaging_COE_Inorganic_ProForma.xlsx",
    ],
  },
};

async function main() {
  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const [slug, { folder, files }] of Object.entries(SECTION_DOCS)) {
    console.log(`\n--- ${slug} (${folder}) ---`);

    for (const file of files) {
      const localPath = join(BASE_DIR, folder, file);
      const storagePath = `${slug}/${file}`;

      if (!existsSync(localPath)) {
        console.log(`  SKIP (not found): ${file}`);
        skipped++;
        continue;
      }

      try {
        const fileBuffer = readFileSync(localPath);
        const { error } = await supabase.storage
          .from("documents")
          .upload(storagePath, fileBuffer, {
            upsert: true,
            contentType: getContentType(file),
          });

        if (error) {
          console.error(`  ERROR: ${file} — ${error.message}`);
          errors++;
        } else {
          console.log(`  OK: ${file}`);
          uploaded++;
        }
      } catch (err) {
        console.error(`  ERROR: ${file} — ${err}`);
        errors++;
      }
    }
  }

  console.log(`\nDone! Uploaded: ${uploaded}, Skipped: ${skipped}, Errors: ${errors}`);
}

function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pdf: "application/pdf",
    png: "image/png",
    html: "text/html",
  };
  return types[ext ?? ""] ?? "application/octet-stream";
}

main().catch(console.error);
