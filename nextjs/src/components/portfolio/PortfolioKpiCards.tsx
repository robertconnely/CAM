"use client";

import type { PortfolioProduct } from "@/lib/types/database";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { GLOSSARY } from "@/lib/glossary";

interface PortfolioKpiCardsProps {
  products: PortfolioProduct[];
}

interface StatCard {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

export function PortfolioKpiCards({ products }: PortfolioKpiCardsProps) {
  const total = products.length;

  // Total ARR
  const totalArr = products.reduce(
    (sum, p) => sum + (p.annual_recurring_revenue ?? 0),
    0
  );

  // Average growth rate
  const growthRates = products
    .map((p) => p.revenue_growth_rate)
    .filter((r): r is number => r != null);
  const avgGrowth =
    growthRates.length > 0
      ? (growthRates.reduce((a, b) => a + b, 0) / growthRates.length).toFixed(1)
      : "—";

  // Total clients
  const totalClients = products.reduce(
    (sum, p) => sum + (p.client_count ?? 0),
    0
  );

  // Avg LTV / CAC ratio
  const ltvCacRatios = products
    .filter((p) => p.avg_customer_ltv != null && p.customer_acquisition_cost != null && p.customer_acquisition_cost > 0)
    .map((p) => p.avg_customer_ltv! / p.customer_acquisition_cost!);
  const avgLtvCac =
    ltvCacRatios.length > 0
      ? (ltvCacRatios.reduce((a, b) => a + b, 0) / ltvCacRatios.length).toFixed(1)
      : "—";

  // Avg NPS
  const npsValues = products
    .map((p) => p.net_promoter_score)
    .filter((n): n is number => n != null);
  const avgNps =
    npsValues.length > 0
      ? Math.round(npsValues.reduce((a, b) => a + b, 0) / npsValues.length)
      : "—";

  // Avg Retention
  const retentionValues = products
    .map((p) => p.retention_rate)
    .filter((r): r is number => r != null);
  const avgRetention =
    retentionValues.length > 0
      ? (retentionValues.reduce((a, b) => a + b, 0) / retentionValues.length).toFixed(1)
      : "—";

  // Avg Market Share
  const shareValues = products
    .map((p) => p.market_share)
    .filter((s): s is number => s != null);
  const avgShare =
    shareValues.length > 0
      ? (shareValues.reduce((a, b) => a + b, 0) / shareValues.length).toFixed(1)
      : "—";

  const stats: StatCard[] = [
    {
      label: "Total Products",
      value: String(total),
      accent: "#321478",
    },
    {
      label: "Total ARR",
      value: totalArr > 0 ? formatCurrency(totalArr) : "—",
      accent: "#320FFF",
    },
    {
      label: "Avg Growth",
      value: avgGrowth !== "—" ? `${avgGrowth}%` : "—",
      accent: "#FFBE00",
    },
    {
      label: "LTV / CAC",
      value: avgLtvCac !== "—" ? `${avgLtvCac}x` : "—",
      accent: "#5F5FC3",
    },
    {
      label: "Total Clients",
      value: totalClients > 0 ? totalClients.toLocaleString() : "—",
      accent: "#41329B",
    },
    {
      label: "Avg NPS",
      value: avgNps !== "—" ? String(avgNps) : "—",
      accent: "#23004B",
    },
    {
      label: "Avg Retention",
      value: avgRetention !== "—" ? `${avgRetention}%` : "—",
      accent: "#320FFF",
    },
    {
      label: "Avg Mkt Share",
      value: avgShare !== "—" ? `${avgShare}%` : "—",
      accent: "#828CE1",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            background: "#fff",
            borderRadius: 10,
            border: "1px solid var(--zelis-ice, #ECE9FF)",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#41329B",
              lineHeight: 1.2,
            }}
          >
            {GLOSSARY[s.label] ? (
              <InfoTooltip text={GLOSSARY[s.label]}>{s.label}</InfoTooltip>
            ) : (
              s.label
            )}
          </span>
          <span
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: s.accent || "var(--zelis-dark, #23004B)",
              lineHeight: 1.2,
            }}
          >
            {s.value}
          </span>
          {s.sub && (
            <span
              style={{
                fontSize: 11,
                color: "var(--zelis-warm-gray, #B4B4B9)",
                lineHeight: 1.3,
              }}
            >
              {s.sub}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
