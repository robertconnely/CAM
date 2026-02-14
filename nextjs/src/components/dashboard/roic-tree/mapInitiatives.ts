import type { Initiative, CapitalScore, InitiativeType } from "@/lib/types/database";
import { ROIC_TREE, type TreeNode } from "./roicTreeData";

/**
 * Get the latest capital score for each initiative (scores are pre-sorted desc).
 */
export function getLatestScores(
  capitalScores: CapitalScore[]
): Map<string, CapitalScore> {
  const map = new Map<string, CapitalScore>();
  for (const s of capitalScores) {
    if (!map.has(s.initiative_id)) {
      map.set(s.initiative_id, s);
    }
  }
  return map;
}

/**
 * Map initiative types to key value driver leaf node IDs.
 */
const TYPE_TO_LEAF_IDS: Record<InitiativeType, string[]> = {
  new_product_platform: ["new_product_pipeline", "platform_rules", "analytics_ml"],
  major_feature_enhancement: ["cross_sell"],
  efficiency_automation: ["auto_adj_rate", "analytics_ml"],
  compliance_regulatory: ["compliance"],
  client_retention_defensive: ["client_retention"],
};

/**
 * Collect all leaf node IDs from the tree.
 */
export function collectLeafIds(node: TreeNode): string[] {
  if (!node.children || node.children.length === 0) {
    return [node.id];
  }
  return node.children.flatMap(collectLeafIds);
}

/**
 * Map each initiative to tree leaf node IDs.
 * Priority: 1) explicit value_driver_ids column, 2) capital score type, 3) name heuristic.
 * Returns a map from leaf node ID to list of initiatives.
 */
export function mapInitiativesToTree(
  initiatives: Initiative[],
  capitalScores: CapitalScore[]
): Map<string, Initiative[]> {
  const latestScores = getLatestScores(capitalScores);
  const result = new Map<string, Initiative[]>();

  // Initialize all leaf nodes with empty arrays
  const leafIds = collectLeafIds(ROIC_TREE);
  for (const id of leafIds) {
    result.set(id, []);
  }

  for (const init of initiatives) {
    let leafTargets: string[];

    // 1. Prefer explicit value_driver_ids column (set by user or auto-populated)
    if (init.value_driver_ids && init.value_driver_ids.length > 0) {
      leafTargets = init.value_driver_ids;
    } else {
      // 2. Fall back to capital score type mapping
      const score = latestScores.get(init.id);
      if (score) {
        leafTargets = TYPE_TO_LEAF_IDS[score.initiative_type] ?? [];
      } else {
        // 3. Last resort: keyword matching on initiative name
        leafTargets = guessLeafIds(init.name);
      }
    }

    // Add to each mapped leaf
    for (const leafId of leafTargets) {
      const list = result.get(leafId);
      if (list) {
        // Avoid duplicates
        if (!list.some((i) => i.id === init.id)) {
          list.push(init);
        }
      }
    }
  }

  return result;
}

/**
 * Count initiatives per node (including aggregated children).
 */
export function countInitiativesPerNode(
  node: TreeNode,
  leafMap: Map<string, Initiative[]>
): Map<string, number> {
  const result = new Map<string, number>();

  function count(n: TreeNode): number {
    if (!n.children || n.children.length === 0) {
      const c = leafMap.get(n.id)?.length ?? 0;
      result.set(n.id, c);
      return c;
    }
    const total = n.children.reduce((sum, child) => sum + count(child), 0);
    result.set(n.id, total);
    return total;
  }

  count(node);
  return result;
}

/**
 * Heuristic: guess key value driver leaf node IDs from initiative name.
 */
function guessLeafIds(name: string): string[] {
  const lower = name.toLowerCase();
  if (lower.includes("rule") || lower.includes("edit library") || lower.includes("zipp") || lower.includes("platform")) {
    return ["platform_rules"];
  }
  if (lower.includes("ml") || lower.includes("ai") || lower.includes("analytics") || lower.includes("model")) {
    return ["analytics_ml"];
  }
  if (lower.includes("auto") || lower.includes("adjudication") || lower.includes("automation")) {
    return ["auto_adj_rate"];
  }
  if (lower.includes("compliance") || lower.includes("regulatory") || lower.includes("audit") || lower.includes("cms")) {
    return ["compliance"];
  }
  if (lower.includes("client") || lower.includes("retention") || lower.includes("renewal")) {
    return ["client_retention"];
  }
  if (lower.includes("cross") || lower.includes("attach") || lower.includes("upsell") || lower.includes("feature")) {
    return ["cross_sell"];
  }
  if (lower.includes("new product") || lower.includes("new module") || lower.includes("pipeline")) {
    return ["new_product_pipeline"];
  }
  if (lower.includes("revenue") || lower.includes("growth") || lower.includes("sales")) {
    return ["client_retention"];
  }
  // Default: platform
  return ["platform_rules"];
}
