"use client";

import type { PortfolioProduct, PlcStage } from "@/lib/types/database";
import { PLC_STAGE_CONFIG } from "@/components/tracker/constants";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { GLOSSARY } from "@/lib/glossary";

interface PortfolioProductCardsProps {
  products: PortfolioProduct[];
}

const STAGE_ORDER: PlcStage[] = ["introduction", "growth", "maturity", "decline"];

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

function MetricItem({ label, value }: { label: string; value: string }) {
  const tip = GLOSSARY[label];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#B4B4B9",
          lineHeight: 1.2,
        }}
      >
        {tip ? <InfoTooltip text={tip}>{label}</InfoTooltip> : label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#23004B",
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ProductCard({ product }: { product: PortfolioProduct }) {
  const cfg = PLC_STAGE_CONFIG[product.plc_stage];

  const ltvCac =
    product.avg_customer_ltv != null &&
    product.customer_acquisition_cost != null &&
    product.customer_acquisition_cost > 0
      ? (product.avg_customer_ltv / product.customer_acquisition_cost).toFixed(1) + "x"
      : "—";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid var(--zelis-ice, #ECE9FF)",
        borderLeft: `4px solid ${cfg.color}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: "#23004B",
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </h3>
          {product.owner_name && (
            <span
              style={{
                fontSize: 11,
                color: "#5F5FC3",
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              {product.owner_name}
            </span>
          )}
        </div>
        {product.description && (
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#B4B4B9",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </p>
        )}
      </div>

      {/* Metrics grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px 16px",
        }}
      >
        <MetricItem
          label="ARR"
          value={
            product.annual_recurring_revenue != null
              ? formatCurrency(product.annual_recurring_revenue)
              : "—"
          }
        />
        <MetricItem
          label="Clients"
          value={
            product.client_count != null
              ? product.client_count.toLocaleString()
              : "—"
          }
        />
        <MetricItem
          label="Growth"
          value={
            product.revenue_growth_rate != null
              ? `${product.revenue_growth_rate > 0 ? "+" : ""}${product.revenue_growth_rate}%`
              : "—"
          }
        />
        <MetricItem
          label="Mkt Share"
          value={
            product.market_share != null
              ? `${product.market_share}%`
              : "—"
          }
        />
        <MetricItem label="LTV/CAC" value={ltvCac} />
        <MetricItem
          label="NPS"
          value={
            product.net_promoter_score != null
              ? String(product.net_promoter_score)
              : "—"
          }
        />
        <MetricItem
          label="Retention"
          value={
            product.retention_rate != null
              ? `${product.retention_rate}%`
              : "—"
          }
        />
        <MetricItem
          label="Launched"
          value={
            product.launch_date
              ? new Date(product.launch_date + "T00:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })
              : "—"
          }
        />
      </div>
    </div>
  );
}

export function PortfolioProductCards({ products }: PortfolioProductCardsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {STAGE_ORDER.map((stage) => {
        const cfg = PLC_STAGE_CONFIG[stage];
        const stageProducts = products.filter((p) => p.plc_stage === stage);
        if (stageProducts.length === 0) return null;

        return (
          <div key={stage}>
            {/* Stage header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: cfg.color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: cfg.color,
                }}
              >
                {cfg.label}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: cfg.color,
                  background: cfg.bg,
                  padding: "2px 10px",
                  borderRadius: 12,
                }}
              >
                {stageProducts.length}
              </span>
            </div>

            {/* Product cards grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                gap: 16,
              }}
            >
              {stageProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
