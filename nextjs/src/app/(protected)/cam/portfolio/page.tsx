import { createClient } from "@/lib/supabase/server";
import { PlcCurveChart } from "@/components/portfolio/PlcCurveChart";
import { PortfolioKpiCards } from "@/components/portfolio/PortfolioKpiCards";
import { PortfolioProductCards } from "@/components/portfolio/PortfolioProductCards";
import Link from "next/link";
import type { PortfolioProduct } from "@/lib/types/database";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { GLOSSARY } from "@/lib/glossary";

export const metadata = {
  title: "Product Portfolio — CAM",
};

export default async function PortfolioPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("portfolio_products")
    .select("*")
    .order("plc_stage", { ascending: true })
    .order("annual_recurring_revenue", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error("Failed to load portfolio data. Please try again.");
  }

  const products = (data ?? []) as PortfolioProduct[];

  return (
    <div style={{ padding: "2rem 2.5rem" }}>
      {/* Hero */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "var(--zelis-purple, #321478)",
          }}
        >
          Product Portfolio
        </h1>
        <p
          style={{
            margin: "0.25rem 0 0",
            fontSize: "0.85rem",
            color: "var(--zelis-medium-gray, #888)",
            fontWeight: 500,
          }}
        >
          Product Life Cycle tracking for live products across Introduction, Growth, Maturity, and Decline stages
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div style={{ marginBottom: "1.5rem" }}>
        <PortfolioKpiCards products={products} />
      </div>

      {/* PLC Curve */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "1.5rem",
          boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.07)",
          marginBottom: "2rem",
        }}
      >
        <h2
          style={{
            margin: "0 0 1rem",
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--zelis-dark, #23004B)",
          }}
        >
          Product Life Cycle (<InfoTooltip text={GLOSSARY.PLC}>PLC</InfoTooltip>) Curve
        </h2>
        <PlcCurveChart products={products} />
      </div>

      {/* Product Cards by Stage */}
      <div style={{ marginBottom: "2rem" }}>
        <PortfolioProductCards products={products} />
      </div>

      {/* CTA Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #321478, #5F5FC3)",
          borderRadius: 12,
          padding: "2rem 2.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            Products in the pipeline?
          </h3>
          <p
            style={{
              margin: "0.25rem 0 0",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Track initiatives through the PDLC before they graduate to the portfolio.
          </p>
        </div>
        <Link
          href="/cam/pipeline"
          style={{
            background: "#FFBE00",
            color: "#23004B",
            padding: "10px 24px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          View PDLC Pipeline
        </Link>
      </div>
    </div>
  );
}
