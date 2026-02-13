"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import MetricCard from "@/components/cam/shared/MetricCard";
import StatusBadge from "@/components/cam/shared/StatusBadge";
import type { CaseStatusDisplay } from "@/components/cam/shared/StatusBadge";
import StageBar from "@/components/cam/shared/StageBar";
import { useAuth } from "@/components/auth/AuthProvider";
import { getCases } from "@/lib/cam/case-service";
import type { InvestmentCase } from "@/lib/types/database";

/* ─── Constants ─── */

const STAGES = [
  "Ideation",
  "Discovery",
  "Business Case",
  "Approval",
  "Execution",
  "Review",
] as const;

const STAGE_INDEX: Record<string, number> = {
  ideation: 1,
  discovery: 2,
  business_case: 3,
  approval: 4,
  execution: 5,
  review: 6,
};

/* ─── Sample data fallback ─── */

interface SampleCase {
  id: string;
  title: string;
  stage: number;
  npv: string;
  irr: string;
  payback: string;
  status: CaseStatusDisplay;
  date: string;
}

const SAMPLE_CASES: SampleCase[] = [
  {
    id: "demo-1",
    title: "AI-Powered Customer Onboarding",
    stage: 4,
    npv: "$2.4M",
    irr: "34%",
    payback: "14 mo",
    status: "approved",
    date: "Jan 28",
  },
  {
    id: "demo-2",
    title: "Supply Chain Visibility Platform",
    stage: 2,
    npv: "$5.1M",
    irr: "41%",
    payback: "11 mo",
    status: "in-progress",
    date: "Feb 3",
  },
  {
    id: "demo-3",
    title: "Mobile Field Service App",
    stage: 5,
    npv: "$890K",
    irr: "22%",
    payback: "18 mo",
    status: "tracking",
    date: "Dec 12",
  },
  {
    id: "demo-4",
    title: "Data Warehouse Migration",
    stage: 1,
    npv: "\u2014",
    irr: "\u2014",
    payback: "\u2014",
    status: "draft",
    date: "Feb 11",
  },
];

/* ─── Helpers ─── */

function formatCurrency(n: number): string {
  if (n < 0) return "-" + formatCurrency(-n);
  return n >= 1e6
    ? "$" + (n / 1e6).toFixed(1) + "M"
    : n >= 1e3
      ? "$" + (n / 1e3).toFixed(0) + "K"
      : "$" + n.toFixed(0);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function mapStatusDisplay(status: string): CaseStatusDisplay {
  const map: Record<string, CaseStatusDisplay> = {
    draft: "draft",
    in_progress: "in-progress",
    submitted: "submitted",
    approved: "approved",
    rejected: "rejected",
    tracking: "tracking",
  };
  return map[status] ?? "draft";
}

function dbCaseToRow(c: InvestmentCase) {
  const npv = c.financials?.npv;
  const irr = c.financials?.irr;
  const payback = c.financials?.payback_months;
  return {
    id: c.id,
    title: c.title,
    stage: STAGE_INDEX[c.stage] ?? 1,
    npv: npv != null ? formatCurrency(npv) : "\u2014",
    irr: irr != null ? (irr * 100).toFixed(0) + "%" : "\u2014",
    payback: payback != null ? payback + " mo" : "\u2014",
    status: mapStatusDisplay(c.status),
    date: formatDate(c.updated_at),
  };
}

/* ─── Styles ─── */

const thStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--zelis-medium-gray, #797279)",
  padding: "12px 16px",
  textAlign: "left",
  whiteSpace: "nowrap",
  borderBottom: "1px solid var(--zelis-ice, #ECE9FF)",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: 13,
  color: "var(--zelis-dark, #23004B)",
  verticalAlign: "middle",
  borderBottom: "1px solid var(--zelis-ice, #ECE9FF)",
};

/* ─── Page ─── */

export default function CamDashboard() {
  const { user } = useAuth();
  const [dbCases, setDbCases] = useState<InvestmentCase[] | null>(null);

  useEffect(() => {
    if (!user) return;
    getCases().then(setDbCases);
  }, [user]);

  // Use real data when authenticated + loaded, otherwise sample data
  const isLive = user && dbCases !== null;
  const rows = isLive ? dbCases.map(dbCaseToRow) : SAMPLE_CASES;

  // Compute aggregate metrics
  let totalNpv = isLive ? "\u2014" : "$8.4M";
  let avgIrr = isLive ? "\u2014" : "32%";
  let capitalDeployed = isLive ? "\u2014" : "$4.2M";
  let capitalSub = isLive ? "" : "Of $6.5M approved";
  let pipelineCount = isLive ? "0" : "4";
  let pipelineSub = isLive ? "" : "1 awaiting approval";

  if (isLive && dbCases.length > 0) {
    const npvs = dbCases
      .map((c) => c.financials?.npv)
      .filter((v): v is number => v != null);
    const irrs = dbCases
      .map((c) => c.financials?.irr)
      .filter((v): v is number => v != null);
    const investments = dbCases
      .map((c) => c.investment_amount)
      .filter((v): v is number => v != null);
    const submitted = dbCases.filter((c) => c.status === "submitted").length;

    totalNpv = npvs.length > 0 ? formatCurrency(npvs.reduce((a, b) => a + b, 0)) : "\u2014";
    avgIrr = irrs.length > 0 ? ((irrs.reduce((a, b) => a + b, 0) / irrs.length) * 100).toFixed(0) + "%" : "\u2014";
    capitalDeployed = investments.length > 0 ? formatCurrency(investments.reduce((a, b) => a + b, 0)) : "\u2014";
    capitalSub = `${investments.length} cases with investment data`;
    pipelineCount = String(dbCases.length);
    pipelineSub = submitted > 0 ? `${submitted} awaiting approval` : "All in progress";
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1120 }}>
      {/* ── Header row ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--zelis-dark, #23004B)",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Capital Allocation Dashboard
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--zelis-medium-gray, #797279)",
              margin: "4px 0 0",
            }}
          >
            {rows.length} {isLive ? "" : "sample "}investment case{rows.length !== 1 ? "s" : ""}{isLive ? " in your portfolio" : " (sign in to save)"}
          </p>
        </div>

        <Link
          href="/cam/new?fresh=1"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 18px",
            borderRadius: 8,
            background:
              "linear-gradient(135deg, var(--zelis-purple, #321478), var(--zelis-blue-purple, #5F5FC3))",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            boxShadow:
              "0 1px 3px rgba(50, 20, 120, 0.3), 0 1px 2px rgba(50, 20, 120, 0.2)",
            whiteSpace: "nowrap",
            transition: "opacity 0.15s ease",
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          New Investment Case
        </Link>
      </div>

      {/* ── Metric cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <MetricCard
          label="Total Portfolio NPV"
          value={totalNpv}
          accent="var(--zelis-blue-purple, #5F5FC3)"
        />
        <MetricCard label="Avg. IRR" value={avgIrr} />
        <MetricCard
          label="Capital Deployed"
          value={capitalDeployed}
          sub={capitalSub}
        />
        <MetricCard
          label="Cases in Pipeline"
          value={pipelineCount}
          sub={pipelineSub}
        />
      </div>

      {/* ── Investment Cases table ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid var(--zelis-ice, #ECE9FF)",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px 12px",
            borderBottom: "1px solid var(--zelis-ice, #ECE9FF)",
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--zelis-dark, #23004B)",
              margin: 0,
            }}
          >
            Investment Cases
          </h2>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Case</th>
              <th style={thStyle}>Stage</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>NPV</th>
              <th style={thStyle}>IRR</th>
              <th style={thStyle}>Payback</th>
              <th style={{ ...thStyle, width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...tdStyle, textAlign: "center", padding: "40px 16px", color: "var(--zelis-medium-gray, #797279)" }}>
                  No investment cases yet.{" "}
                  <Link href="/cam/new?fresh=1" style={{ color: "var(--zelis-blue-purple, #5F5FC3)" }}>
                    Create your first case
                  </Link>
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr
                  key={c.id}
                  style={{
                    cursor: "pointer",
                    transition: "background-color 0.12s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      "var(--zelis-ink-5, #F7F6FF)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      "transparent";
                  }}
                >
                  <td style={tdStyle}>
                    <Link
                      href={`/cam/${c.id}`}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 13 }}>
                        {c.title}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--zelis-medium-gray, #797279)",
                        }}
                      >
                        {c.date}
                      </span>
                    </Link>
                  </td>
                  <td style={tdStyle}>
                    <Link
                      href={`/cam/${c.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <StageBar current={c.stage} total={STAGES.length} />
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--zelis-medium-gray, #797279)",
                          }}
                        >
                          {STAGES[c.stage - 1]}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td style={tdStyle}>
                    <Link
                      href={`/cam/${c.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <StatusBadge status={c.status} />
                    </Link>
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    <Link
                      href={`/cam/${c.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {c.npv}
                    </Link>
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    <Link
                      href={`/cam/${c.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {c.irr}
                    </Link>
                  </td>
                  <td style={tdStyle}>
                    <Link
                      href={`/cam/${c.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {c.payback}
                    </Link>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", width: 40 }}>
                    <Link
                      href={`/cam/${c.id}`}
                      style={{
                        textDecoration: "none",
                        color: "var(--zelis-medium-gray, #797279)",
                        fontSize: 16,
                      }}
                    >
                      &#8594;
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
