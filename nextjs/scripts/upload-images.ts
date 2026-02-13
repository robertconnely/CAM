/**
 * upload-images.ts
 *
 * Uploads all referenced images from the static site's parent directories
 * to the Supabase 'images' storage bucket (public).
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/upload-images.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const BASE_DIR = resolve(__dirname, "../../../");

// All image references organized by storage path
const IMAGES: Array<{ localPath: string; storagePath: string }> = [
  // Mind Maps
  ...[
    "02_PDLC_Framework.png",
    "03_Capital_Allocation.png",
    "03_Capital_Allocation_Simple.png",
    "04_Competitive_Battlefield.png",
    "04_Competitive_Battlefield_Simple.png",
    "05_Financial_Engine.png",
    "05_Financial_Engine_Simple.png",
    "06_Day1_Battle_Plan.png",
    "07_Operating_Cadence.png",
    "08_MA_Timeline.png",
    "09_Product_Portfolio.png",
  ].map((f) => ({
    localPath: join(BASE_DIR, "Mind Maps", f),
    storagePath: `mind-maps/${f}`,
  })),

  // Onboarding mind map
  {
    localPath: join(
      BASE_DIR,
      "00 - Onboarding and Day 1",
      "Day1_Battle_Plan_Mind_Map.png"
    ),
    storagePath: "onboarding/Day1_Battle_Plan_Mind_Map.png",
  },

  // Capital allocation images
  {
    localPath: join(
      BASE_DIR,
      "02 - Capital Allocation",
      "Capital_Allocation_Mind_Map.png"
    ),
    storagePath: "capital/Capital_Allocation_Mind_Map.png",
  },
  {
    localPath: join(
      BASE_DIR,
      "02 - Capital Allocation",
      "Capital_Allocation_Mind_Map_Simple.png"
    ),
    storagePath: "capital/Capital_Allocation_Mind_Map_Simple.png",
  },

  // Strategy images
  {
    localPath: join(
      BASE_DIR,
      "08 - Product Strategy",
      "Zelis Claims Flow Chronological.png"
    ),
    storagePath: "strategy/Zelis_Claims_Flow_Chronological.png",
  },
  {
    localPath: join(
      BASE_DIR,
      "08 - Product Strategy",
      "Zelis Claims Flow Clean.png"
    ),
    storagePath: "strategy/Zelis_Claims_Flow_Clean.png",
  },
  {
    localPath: join(
      BASE_DIR,
      "08 - Product Strategy",
      "zelis_roic_value_driver_tree.png"
    ),
    storagePath: "strategy/zelis_roic_value_driver_tree.png",
  },

  // Competitive images
  {
    localPath: join(BASE_DIR, "03 - Competitive Intelligence", "Competitive_Battlefield_Mind_Map.png"),
    storagePath: "competitive/Competitive_Battlefield_Mind_Map.png",
  },
  {
    localPath: join(BASE_DIR, "03 - Competitive Intelligence", "Competitive_Battlefield_Mind_Map_Simple.png"),
    storagePath: "competitive/Competitive_Battlefield_Mind_Map_Simple.png",
  },

  // Cadence images
  {
    localPath: join(BASE_DIR, "04 - Operating Cadence", "Operating_Cadence_Mind_Map.png"),
    storagePath: "cadence/Operating_Cadence_Mind_Map.png",
  },

  // Finance images
  {
    localPath: join(BASE_DIR, "05 - Finance Strategy", "Zelis Claims Revenue Flow.png"),
    storagePath: "finance/Zelis_Claims_Revenue_Flow.png",
  },
  {
    localPath: join(BASE_DIR, "05 - Finance Strategy", "zelis_roic_value_driver_tree_branded.png"),
    storagePath: "finance/zelis_roic_value_driver_tree_branded.png",
  },
  {
    localPath: join(BASE_DIR, "05 - Finance Strategy", "zelis_roic_value_driver_tree_v2.png"),
    storagePath: "finance/zelis_roic_value_driver_tree_v2.png",
  },

  // Portfolio images
  {
    localPath: join(BASE_DIR, "15 - Product Portfolio", "MA_Timeline_Mind_Map.png"),
    storagePath: "portfolio/MA_Timeline_Mind_Map.png",
  },
  {
    localPath: join(BASE_DIR, "15 - Product Portfolio", "Product_Portfolio_Mind_Map.png"),
    storagePath: "portfolio/Product_Portfolio_Mind_Map.png",
  },

  // Workflow images (Payment Integrity)
  ...[
    "Pre-Payment Claim Editing Process.png",
    "Pre-Payment Editing Money Flow (Zelis Brand).png",
    "Post-Payment Recovery Process.png",
  ].map((f) => ({
    localPath: join(
      BASE_DIR,
      "07 - Product Workflows",
      "Figma workflows",
      "Payment Integrity figma flows",
      f
    ),
    storagePath: `workflows/${f.replace(/\s+/g, "_")}`,
  })),
  // Workflow images (Revenue)
  ...[
    "Claim Dollar Flow - OON Pricing.png",
    "Unit Economics by Product Line.png",
  ].map((f) => ({
    localPath: join(
      BASE_DIR,
      "07 - Product Workflows",
      "Figma workflows",
      "Revenue and unit economics figma flows",
      f
    ),
    storagePath: `workflows/${f.replace(/\s+/g, "_")}`,
  })),
];

async function main() {
  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const { localPath, storagePath } of IMAGES) {
    if (!existsSync(localPath)) {
      console.log(`SKIP (not found): ${localPath}`);
      skipped++;
      continue;
    }

    try {
      const fileBuffer = readFileSync(localPath);
      const { error } = await supabase.storage
        .from("images")
        .upload(storagePath, fileBuffer, {
          upsert: true,
          contentType: "image/png",
        });

      if (error) {
        console.error(`ERROR: ${storagePath} — ${error.message}`);
        errors++;
      } else {
        console.log(`OK: ${storagePath}`);
        uploaded++;
      }
    } catch (err) {
      console.error(`ERROR: ${storagePath} — ${err}`);
      errors++;
    }
  }

  console.log(
    `\nDone! Uploaded: ${uploaded}, Skipped: ${skipped}, Errors: ${errors}`
  );
}

main().catch(console.error);
