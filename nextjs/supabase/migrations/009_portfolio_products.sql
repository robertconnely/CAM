-- Migration 009: Portfolio Products (Product Life Cycle tracking)
-- Products that graduate from PDLC are tracked through 4 PLC stages:
-- Introduction → Growth → Maturity → Decline

-- 1. Create PLC stage enum
CREATE TYPE public.plc_stage AS ENUM ('introduction', 'growth', 'maturity', 'decline');

-- 2. Create portfolio_products table
CREATE TABLE public.portfolio_products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  owner_name    TEXT,
  plc_stage     public.plc_stage NOT NULL DEFAULT 'introduction',
  initiative_id UUID REFERENCES public.initiatives(id) ON DELETE SET NULL,

  -- Key metrics (all nullable — populated over time)
  annual_recurring_revenue  NUMERIC,
  client_count              INTEGER,
  revenue_growth_rate       NUMERIC,   -- percentage, e.g. 12.5 = 12.5%
  market_share              NUMERIC,   -- percentage, e.g. 34.0 = 34%
  avg_customer_ltv          NUMERIC,   -- dollars
  customer_acquisition_cost NUMERIC,   -- dollars
  net_promoter_score        INTEGER,   -- -100 to 100
  retention_rate            NUMERIC,   -- percentage, e.g. 95.0 = 95%

  launch_date       DATE,
  last_review_date  DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_portfolio_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_portfolio_products_updated_at
  BEFORE UPDATE ON public.portfolio_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_portfolio_products_updated_at();

-- 4. Enable RLS
ALTER TABLE public.portfolio_products ENABLE ROW LEVEL SECURITY;

-- Viewers can read
CREATE POLICY "Viewers can read portfolio products"
  ON public.portfolio_products FOR SELECT
  USING (true);

-- Editors and admins can insert
CREATE POLICY "Editors can insert portfolio products"
  ON public.portfolio_products FOR INSERT
  WITH CHECK (public.user_role() IN ('admin', 'editor'));

-- Editors and admins can update
CREATE POLICY "Editors can update portfolio products"
  ON public.portfolio_products FOR UPDATE
  USING (public.user_role() IN ('admin', 'editor'));

-- Only admins can delete
CREATE POLICY "Admins can delete portfolio products"
  ON public.portfolio_products FOR DELETE
  USING (public.user_role() = 'admin');

-- 5. Seed data: 8 Zelis healthcare/payments products across all 4 PLC stages
INSERT INTO public.portfolio_products (name, description, owner_name, plc_stage, annual_recurring_revenue, client_count, revenue_growth_rate, market_share, avg_customer_ltv, customer_acquisition_cost, net_promoter_score, retention_rate, launch_date, last_review_date, notes) VALUES
(
  'AI Claims Adjudication Engine',
  'ML-powered auto-adjudication for medical, dental, and vision claims with real-time decision transparency and audit trails.',
  'Sarah Chen',
  'introduction',
  4200000, 12, 85.0, 3.2, 350000, 95000, 42, 91.0,
  '2025-09-15', '2026-01-20',
  'Rapid early adoption among mid-market TPAs. Accuracy rate at 94.7% — targeting 97% by Q3.'
),
(
  'Provider Directory Intelligence',
  'Real-time provider data enrichment and network adequacy analytics using NPI registry, claims history, and credentialing feeds.',
  'Marcus Johnson',
  'introduction',
  2800000, 8, 110.0, 2.1, 350000, 120000, 38, 88.0,
  '2025-11-01', '2026-01-25',
  'Strong pull from compliance teams. Data freshness score 96.2% vs. industry average of 72%.'
),
(
  'Real-Time Eligibility Verification',
  'Sub-second eligibility and benefits verification across all major payer networks with smart caching and predictive pre-auth.',
  'Jennifer Walsh',
  'growth',
  28500000, 145, 32.5, 18.4, 196500, 42000, 67, 95.5,
  '2023-06-01', '2026-02-01',
  'Transaction volume up 40% YoY. New dental/vision vertical launched Q4. Enterprise expansion pipeline strong.'
),
(
  'Payment Integrity Analytics',
  'Post-payment audit and recovery platform with pattern detection for fraud, waste, and abuse across claims lifecycle.',
  'David Park',
  'growth',
  19800000, 92, 28.0, 14.7, 215200, 55000, 61, 94.0,
  '2024-01-15', '2026-01-30',
  'Recovery rates averaging 3.2% of total claims spend. New pharmacy module driving upsell.'
),
(
  'Network Access Platform',
  'Core network management platform for provider contracting, credentialing, and rate configuration across PPO/EPO/HMO products.',
  'Linda Torres',
  'maturity',
  62000000, 340, 5.2, 38.5, 182350, 28000, 72, 97.0,
  '2019-03-01', '2026-02-05',
  'Market leader in mid-market segment. Focus on margin optimization and API modernization.'
),
(
  'Claims Pricing Engine',
  'High-throughput reference-based and contracted-rate pricing engine processing 2B+ claims annually with sub-100ms latency.',
  'Robert Kim',
  'maturity',
  54000000, 285, 3.8, 31.2, 189470, 25000, 78, 96.5,
  '2018-08-01', '2026-02-10',
  'Processing volume growing 8% while revenue growth slows. Price compression in large accounts.'
),
(
  'Legacy Batch Processing Module',
  'Overnight batch claim processing system for payers still on legacy 837/835 EDI workflows without real-time capabilities.',
  'Tom Bradley',
  'decline',
  8200000, 45, -12.5, 6.8, 182200, 15000, 28, 82.0,
  '2014-06-01', '2026-01-15',
  'Migrating clients to real-time platform. 15 clients scheduled for migration by Q4. Sunset target: 2027.'
),
(
  'Paper EOB Generator',
  'Print and mail Explanation of Benefits statements for members without digital access or payer portal enrollment.',
  'Amy Rodriguez',
  'decline',
  3100000, 62, -18.0, 4.5, 50000, 8000, 20, 72.0,
  '2012-01-01', '2025-12-01',
  'Volume declining 20% annually as digital EOB adoption accelerates. Maintaining for contractual obligations.'
);
