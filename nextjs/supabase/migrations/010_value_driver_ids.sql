-- Migration 010: Add value_driver_ids to initiatives
-- Explicit many-to-many relationship between initiatives and ROIC value driver leaf nodes.

ALTER TABLE initiatives
ADD COLUMN value_driver_ids text[] NOT NULL DEFAULT '{}';

-- Backfill existing initiatives from their capital_scores.initiative_type
-- Uses the same TYPE_TO_LEAF_IDS mapping from mapInitiatives.ts
UPDATE initiatives i
SET value_driver_ids = CASE cs.initiative_type
  WHEN 'new_product_platform'       THEN ARRAY['new_product_pipeline', 'platform_rules', 'analytics_ml']
  WHEN 'major_feature_enhancement'  THEN ARRAY['cross_sell']
  WHEN 'efficiency_automation'      THEN ARRAY['auto_adj_rate', 'analytics_ml']
  WHEN 'compliance_regulatory'      THEN ARRAY['compliance']
  WHEN 'client_retention_defensive' THEN ARRAY['client_retention']
  ELSE '{}'
END
FROM (
  SELECT DISTINCT ON (initiative_id) initiative_id, initiative_type
  FROM capital_scores
  ORDER BY initiative_id, scored_at DESC
) cs
WHERE i.id = cs.initiative_id;
