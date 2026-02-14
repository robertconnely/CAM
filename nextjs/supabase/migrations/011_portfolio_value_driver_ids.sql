-- Migration 011: Add value_driver_ids to portfolio_products
-- Carries forward the value driver lineage when an initiative graduates to a product.

ALTER TABLE portfolio_products
ADD COLUMN value_driver_ids text[] NOT NULL DEFAULT '{}';

-- Backfill from linked initiatives (where initiative_id is set)
UPDATE portfolio_products pp
SET value_driver_ids = i.value_driver_ids
FROM initiatives i
WHERE pp.initiative_id = i.id
  AND array_length(i.value_driver_ids, 1) > 0;
