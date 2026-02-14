"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import PdlcStepper from "@/components/cam/shared/PdlcStepper";
import MetricCard from "@/components/cam/shared/MetricCard";
import TornadoChart from "@/components/cam/results/TornadoChart";
import {
  computeFinancials,
  generateSensitivity,
  DEFAULT_ASSUMPTIONS,
  toFinancialAssumptions,
  toCaseFinancials,
} from "@/lib/financial";
import type { FinancialAssumptions } from "@/lib/financial";
import type { WizardResult } from "@/components/cam/wizard/InvestmentWizard";
import { useInvestmentCase } from "@/hooks/useInvestmentCase";
import { updateCase } from "@/lib/cam/case-service";
import type { CaseStage } from "@/lib/types/database";
import { SubmitButton } from "@/components/cam/workflow/SubmitButton";
import { ScoreButton } from "@/components/cam/workflow/ScoreButton";
import { ScoringResult } from "@/components/cam/workflow/ScoringResult";

/* ─── Helpers ─── */

function formatCurrency(n: number): string {
  if (n < 0) return "-" + formatCurrency(-n);
  return n >= 1e6
    ? "$" + (n / 1e6).toFixed(1) + "M"
    : n >= 1e3
      ? "$" + (n / 1e3).toFixed(0) + "K"
      : "$" + n.toFixed(0);
}

/** Compute slider min/max/step that scale to the actual value (~30-40 steps) */
function sliderConfig(value: number): { min: number; max: number; step: number } {
  if (value <= 0) return { min: 0, max: 100, step: 1 };
  const range = value * 3.8;
  const rawStep = range / 40;
  const p = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const n = rawStep / p;
  let step: number;
  if (n <= 1) step = p;
  else if (n <= 2) step = 2 * p;
  else if (n <= 5) step = 5 * p;
  else step = 10 * p;
  step = Math.max(1, Math.round(step));
  const min = Math.max(step, Math.floor(value * 0.2 / step) * step);
  const max = Math.max(min + step * 10, Math.ceil(value * 4 / step) * step);
  return { min, max, step };
}

/* ─── Custom Bar Label ─── */

function BarLabel(props: Record<string, unknown>) {
  const { x, y, width, value } = props as {
    x: number;
    y: number;
    width: number;
    value: number;
  };
  const isNeg = value < 0;
  return (
    <text
      x={x + width / 2}
      y={isNeg ? y + 16 : y - 6}
      fill="var(--zelis-dark, #23004B)"
      textAnchor="middle"
      fontSize={11}
      fontWeight={600}
    >
      {formatCurrency(value)}
    </text>
  );
}

/* ─── Stage mapping ─── */

const STAGE_INDEX: Record<string, number> = {
  ideation: 0,
  discovery: 1,
  business_case: 2,
  approval: 3,
  execution: 4,
  review: 5,
};

/* ─── Component ─── */

interface CaseResultsProps {
  caseId?: string;
}

export function CaseResults({ caseId }: CaseResultsProps) {
  /* DB-backed case (when caseId provided) */
  const { investmentCase, loading: caseLoading, refetch: refetchCase } = useInvestmentCase(caseId);

  /* State: wizard result from sessionStorage */
  const [wizardResult, setWizardResult] = useState<WizardResult | null>(null);

  /* State: assumption sliders */
  const [revenue, setRevenue] = useState(DEFAULT_ASSUMPTIONS.monthly_price);
  const [customers, setCustomers] = useState(DEFAULT_ASSUMPTIONS.year1_customers);
  const [growth, setGrowth] = useState(DEFAULT_ASSUMPTIONS.revenue_growth_pct);
  const [investment, setInvestment] = useState(DEFAULT_ASSUMPTIONS.investment_amount);
  const [grossMargin, setGrossMargin] = useState(DEFAULT_ASSUMPTIONS.gross_margin_pct);
  const [discountRate, setDiscountRate] = useState(DEFAULT_ASSUMPTIONS.discount_rate);

  /* State: editable title */
  const [title, setTitle] = useState("Investment Case");

  /* State: current stage (from DB or default) */
  const [currentStage, setCurrentStage] = useState<CaseStage>("business_case");

  /* State: navigation source */
  const [cameFromWizard, setCameFromWizard] = useState(false);

  /* State: AI memo */
  const [memo, setMemo] = useState<string | null>(null);
  const [memoLoading, setMemoLoading] = useState(false);
  const [memoError, setMemoError] = useState<string | null>(null);

  /* Track whether DB case has been initialized into slider state */
  const dbInitialized = useRef(false);

  /* Track assumptions used for last memo generation (stale detection) */
  const memoAssumptionsRef = useRef<string | null>(null);

  /* Load from DB case when available */
  useEffect(() => {
    if (!investmentCase || dbInitialized.current) return;
    dbInitialized.current = true;

    setTitle(investmentCase.title);
    setCurrentStage(investmentCase.stage as CaseStage);

    if (investmentCase.memo_content) {
      setMemo(investmentCase.memo_content);
      // Snapshot DB assumptions so stale detection works from initial load
      const a = investmentCase.assumptions;
      memoAssumptionsRef.current = JSON.stringify({
        ...DEFAULT_ASSUMPTIONS,
        monthly_price: a.monthly_price ?? DEFAULT_ASSUMPTIONS.monthly_price,
        year1_customers: a.year1_customers ?? DEFAULT_ASSUMPTIONS.year1_customers,
        revenue_growth_pct: a.revenue_growth_pct ?? DEFAULT_ASSUMPTIONS.revenue_growth_pct,
        investment_amount: a.investment_amount ?? DEFAULT_ASSUMPTIONS.investment_amount,
        gross_margin_pct: a.gross_margin_pct ?? DEFAULT_ASSUMPTIONS.gross_margin_pct,
        discount_rate: a.discount_rate ?? DEFAULT_ASSUMPTIONS.discount_rate,
      });
    }

    const a = investmentCase.assumptions;
    if (a.monthly_price) setRevenue(a.monthly_price as number);
    if (a.year1_customers) setCustomers(a.year1_customers as number);
    if (a.revenue_growth_pct) setGrowth(a.revenue_growth_pct as number);
    if (a.investment_amount) setInvestment(a.investment_amount as number);
    if (a.gross_margin_pct) setGrossMargin(a.gross_margin_pct as number);
    if (a.discount_rate) setDiscountRate(a.discount_rate as number);
  }, [investmentCase]);

  /* Load wizard result from sessionStorage on mount (only for non-DB mode) */
  useEffect(() => {
    if (caseId) return; // Skip sessionStorage when DB-backed
    try {
      const stored = sessionStorage.getItem("cam_wizard_result");
      if (stored) {
        const result: WizardResult = JSON.parse(stored);
        setWizardResult(result);
        if (result.title) setTitle(result.title);
        // Check if user came from wizard
        if (sessionStorage.getItem("cam_nav_source") === "wizard") {
          setCameFromWizard(true);
        }
        // Restore cached memo if available
        const cachedMemo = sessionStorage.getItem("cam_memo");
        if (cachedMemo) setMemo(cachedMemo);
        // Seed all values from wizard assumptions
        const a = result.assumptions;
        if (a.monthly_price) setRevenue(a.monthly_price);
        if (a.year1_customers) setCustomers(a.year1_customers);
        if (a.revenue_growth_pct) setGrowth(a.revenue_growth_pct);
        if (a.investment_amount) setInvestment(a.investment_amount);
        if (a.gross_margin_pct) setGrossMargin(a.gross_margin_pct);
        if (a.discount_rate) setDiscountRate(a.discount_rate);
      }
    } catch { /* sessionStorage unavailable or invalid data */ }
  }, [caseId]);

  /* Compute slider ranges from initial wizard values (stable — won't shift as user drags) */
  const priceSlider = useMemo(() => sliderConfig(wizardResult?.assumptions.monthly_price ?? DEFAULT_ASSUMPTIONS.monthly_price), [wizardResult]);
  const customerSlider = useMemo(() => sliderConfig(wizardResult?.assumptions.year1_customers ?? DEFAULT_ASSUMPTIONS.year1_customers), [wizardResult]);
  const growthSlider = useMemo(() => {
    const base = wizardResult?.assumptions.revenue_growth_pct ?? DEFAULT_ASSUMPTIONS.revenue_growth_pct;
    return { min: 5, max: Math.max(200, Math.ceil(base * 2.5 / 5) * 5), step: 5 };
  }, [wizardResult]);

  /* Build assumptions from slider state */
  const assumptions = useMemo<FinancialAssumptions>(
    () => ({
      ...DEFAULT_ASSUMPTIONS,
      monthly_price: revenue,
      year1_customers: customers,
      revenue_growth_pct: growth,
      investment_amount: investment,
      gross_margin_pct: grossMargin,
      discount_rate: discountRate,
    }),
    [revenue, customers, growth, investment, grossMargin, discountRate]
  );

  /* Computed financials via engine */
  const financials = useMemo(() => computeFinancials(assumptions), [assumptions]);
  const sensitivity = useMemo(() => generateSensitivity(assumptions), [assumptions]);

  /* Debounce-save slider changes to DB */
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!caseId || !dbInitialized.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const caseAssumptions = {
        monthly_price: revenue,
        year1_customers: customers,
        revenue_growth_pct: growth,
        gross_margin_pct: grossMargin,
        investment_amount: investment,
        discount_rate: discountRate,
        projection_years: assumptions.projection_years,
      };
      const caseFinancials = toCaseFinancials(financials);
      updateCase(caseId, {
        assumptions: caseAssumptions,
        financials: caseFinancials,
        investment_amount: investment,
      });
    }, 1000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [caseId, revenue, customers, growth, investment, grossMargin, discountRate, assumptions.projection_years, financials]);

  const { cash_flows, npv, irr, payback_months } = financials;

  /* Fetch AI memo — computes financials from source data to avoid stale slider state */
  const fetchMemo = useCallback(async () => {
    // Need either wizard result or DB case to generate memo
    const description = wizardResult?.description ?? investmentCase?.description ?? "";
    const answers = wizardResult?.answers ?? [];
    if (!description && answers.length === 0) return;

    // Build assumptions from the source of truth (wizard result or DB case),
    // NOT from slider state which may not have updated yet on first render
    const sourceAssumptions: FinancialAssumptions = wizardResult
      ? { ...DEFAULT_ASSUMPTIONS, ...wizardResult.assumptions }
      : investmentCase
        ? { ...DEFAULT_ASSUMPTIONS, ...toFinancialAssumptions(investmentCase.assumptions) }
        : assumptions; // fallback to current slider state (for regenerate)

    const freshFinancials = computeFinancials(sourceAssumptions);
    const memoTitle = wizardResult?.title ?? investmentCase?.title ?? title;

    setMemoLoading(true);
    setMemoError(null);
    try {
      const res = await fetch("/api/ai/memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: memoTitle,
          description,
          answers,
          assumptions: {
            monthly_price: sourceAssumptions.monthly_price,
            year1_customers: sourceAssumptions.year1_customers,
            revenue_growth_pct: sourceAssumptions.revenue_growth_pct,
            gross_margin_pct: sourceAssumptions.gross_margin_pct,
            investment_amount: sourceAssumptions.investment_amount,
            discount_rate: sourceAssumptions.discount_rate,
          },
          financials: {
            npv: freshFinancials.npv,
            irr: freshFinancials.irr,
            payback_months: freshFinancials.payback_months,
            total_revenue_5yr: freshFinancials.total_revenue_5yr,
            annual_revenues: freshFinancials.annual_revenues,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to generate memo");
      const data = await res.json();
      setMemo(data.memo);
      // Snapshot current assumptions so we can detect staleness
      memoAssumptionsRef.current = JSON.stringify(assumptions);
      // Save memo to DB if case is persisted
      if (caseId) {
        updateCase(caseId, { memo_content: data.memo });
      }
      // Cache memo in sessionStorage for demo flow
      try { sessionStorage.setItem("cam_memo", data.memo); } catch {}
    } catch (err) {
      setMemoError(err instanceof Error ? err.message : "Failed to generate memo");
    } finally {
      setMemoLoading(false);
    }
  }, [wizardResult, investmentCase, assumptions, title, caseId]);

  /* Generate memo on first load when data is available */
  useEffect(() => {
    if (memo || memoLoading) return;
    // For DB-backed case: generate if no memo stored
    if (caseId && investmentCase && !investmentCase.memo_content) {
      fetchMemo();
    }
    // For sessionStorage flow: generate when wizard result loaded
    if (!caseId && wizardResult) {
      fetchMemo();
    }
  }, [wizardResult, investmentCase]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Chart data */
  const chartData = [
    { name: "Inv.", value: cash_flows[0] },
    { name: "Yr 1", value: cash_flows[1] },
    { name: "Yr 2", value: cash_flows[2] },
    { name: "Yr 3", value: cash_flows[3] },
    { name: "Yr 4", value: cash_flows[4] },
    { name: "Yr 5", value: cash_flows[5] },
  ];

  const npvPositive = npv >= 0;
  const irrDisplay =
    irr !== null ? (irr * 100).toFixed(1) + "%" : "N/A";
  const paybackDisplay =
    payback_months !== null ? `${payback_months} mo` : "N/A";

  /* Loading state for DB-backed cases */
  if (caseId && caseLoading) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 40px", textAlign: "center" }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid var(--zelis-ice, #ECE9FF)",
            borderTopColor: "var(--zelis-blue-purple, #5F5FC3)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ fontSize: 14, color: "var(--zelis-medium-gray, #797279)" }}>
          Loading investment case...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "32px 40px 64px",
      }}
    >
      {/* ── Back link ── */}
      <div style={{ marginBottom: 8 }}>
        <Link
          href={cameFromWizard ? "/cam/new" : "/cam"}
          style={{
            fontSize: 13,
            color: "var(--zelis-blue-purple, #5F5FC3)",
            textDecoration: "none",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          &larr; {cameFromWizard ? "Back to Wizard" : "Dashboard"}
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--zelis-dark, #23004B)",
              margin: 0,
              lineHeight: 1.3,
              border: "1px solid transparent",
              borderRadius: 6,
              padding: "2px 6px",
              background: "transparent",
              width: "100%",
              fontFamily: "'Nunito Sans', 'Avenir Next', sans-serif",
              outline: "none",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--zelis-ice, #ECE9FF)";
              e.currentTarget.style.background = "#fff";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.background = "transparent";
            }}
          />
          <p
            style={{
              fontSize: 13,
              color: "var(--zelis-medium-gray, #797279)",
              margin: "4px 0 0",
            }}
          >
            Investment case &middot; {currentStage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} stage
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          {caseId && investmentCase && ["draft", "submitted"].includes(investmentCase.status) && (
            <Link
              href={`/cam/${caseId}/edit`}
              style={{
                padding: "9px 18px",
                borderRadius: 8,
                border: "1px solid var(--zelis-ice, #ECE9FF)",
                background: "#fff",
                color: "var(--zelis-blue-purple, #5F5FC3)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              Edit Case
            </Link>
          )}
          {caseId && <ScoreButton investmentCase={investmentCase} />}
          {caseId ? (
            <SubmitButton
              investmentCase={investmentCase}
              onSubmitted={refetchCase}
            />
          ) : (
            <button
              style={{
                padding: "9px 18px",
                borderRadius: 8,
                border: "none",
                background: "var(--zelis-dark, #23004B)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Submit for Approval
            </button>
          )}
        </div>
      </div>

      {/* ── PDLC Stepper ── */}
      <div style={{ marginBottom: 24 }}>
        <PdlcStepper currentStage={STAGE_INDEX[currentStage] ?? 2} />
      </div>

      {/* ── Metric Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricCard
          label="Net Present Value"
          value={formatCurrency(npv)}
          accent={npvPositive ? "#10B981" : "var(--zelis-red, #E61E2D)"}
        />
        <MetricCard
          label="IRR"
          value={irrDisplay}
          accent={
            irr !== null && irr >= 0.2
              ? "#10B981"
              : "var(--zelis-red, #E61E2D)"
          }
        />
        <MetricCard label="Payback Period" value={paybackDisplay} />
        <MetricCard
          label="Total Investment"
          value={formatCurrency(assumptions.investment_amount)}
        />
      </div>

      {/* ── Two-column: Chart + Assumptions ── */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 24,
          alignItems: "stretch",
        }}
      >
        {/* Left: Cash Flow Chart */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: 10,
            border: "1px solid var(--zelis-ice, #ECE9FF)",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
            padding: "20px 24px",
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--zelis-dark, #23004B)",
              margin: "0 0 16px",
            }}
          >
            5-Year Cash Flow Projection
          </h3>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 24, right: 8, left: 8, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#797279" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(value as number),
                    "Cash Flow",
                  ]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #ECE9FF",
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  label={<BarLabel />}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.value < 0
                          ? "var(--zelis-red, #E61E2D)"
                          : "var(--zelis-blue-purple, #5F5FC3)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Assumptions Panel */}
        <div
          style={{
            width: 340,
            flexShrink: 0,
            background: "#fff",
            borderRadius: 10,
            border: "1px solid var(--zelis-ice, #ECE9FF)",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--zelis-dark, #23004B)",
              margin: "0 0 2px",
            }}
          >
            Key Assumptions
          </h3>
          <p
            style={{
              fontSize: 12,
              color: "var(--zelis-medium-gray, #797279)",
              margin: "0 0 20px",
            }}
          >
            Adjust to see model update in real-time
          </p>

          {/* Monthly Price slider */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--zelis-dark, #23004B)",
                }}
              >
                Monthly Price
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--zelis-blue-purple, #5F5FC3)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ${revenue.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={priceSlider.min}
              max={priceSlider.max}
              step={priceSlider.step}
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: "var(--zelis-blue-purple, #5F5FC3)",
                cursor: "pointer",
              }}
            />
          </div>

          {/* Year 1 Customers slider */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--zelis-dark, #23004B)",
                }}
              >
                Year 1 Customers
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--zelis-blue-purple, #5F5FC3)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {customers}
              </span>
            </div>
            <input
              type="range"
              min={customerSlider.min}
              max={customerSlider.max}
              step={customerSlider.step}
              value={customers}
              onChange={(e) => setCustomers(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: "var(--zelis-blue-purple, #5F5FC3)",
                cursor: "pointer",
              }}
            />
          </div>

          {/* Revenue Growth % slider */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--zelis-dark, #23004B)",
                }}
              >
                Revenue Growth %
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--zelis-blue-purple, #5F5FC3)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {growth}%
              </span>
            </div>
            <input
              type="range"
              min={growthSlider.min}
              max={growthSlider.max}
              step={growthSlider.step}
              value={growth}
              onChange={(e) => setGrowth(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: "var(--zelis-blue-purple, #5F5FC3)",
                cursor: "pointer",
              }}
            />
          </div>

          {/* NPV indicator */}
          <div
            style={{
              marginTop: "auto",
              padding: "12px 16px",
              borderRadius: 8,
              background: npvPositive
                ? "rgba(16, 185, 129, 0.08)"
                : "rgba(230, 30, 45, 0.08)",
              border: `1px solid ${npvPositive ? "rgba(16, 185, 129, 0.2)" : "rgba(230, 30, 45, 0.2)"}`,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: npvPositive
                  ? "#059669"
                  : "var(--zelis-red, #E61E2D)",
              }}
            >
              {npvPositive
                ? "\u2713 Positive NPV \u2014 Investment Recommended"
                : "\u2717 Negative NPV \u2014 Review Assumptions"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Sensitivity Analysis ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          border: "1px solid var(--zelis-ice, #ECE9FF)",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          padding: "24px 28px",
          marginBottom: 24,
        }}
      >
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--zelis-dark, #23004B)",
            margin: "0 0 2px",
          }}
        >
          Sensitivity Analysis
        </h3>
        <p
          style={{
            fontSize: 12,
            color: "var(--zelis-medium-gray, #797279)",
            margin: "0 0 16px",
            lineHeight: 1.6,
          }}
        >
          Shows which assumptions have the biggest impact on NPV. Each bar
          represents the change in NPV when that assumption is adjusted by
          &plusmn;20% from its current value. Longer bars indicate higher
          sensitivity &mdash; focus due diligence on these areas.
        </p>
        <TornadoChart sensitivity={sensitivity} />
      </div>

      {/* ── Scoring Result (if scored) ── */}
      {caseId && <ScoringResult caseId={caseId} />}

      {/* ── Investment Memo ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          border: "1px solid var(--zelis-ice, #ECE9FF)",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          padding: "24px 28px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--zelis-dark, #23004B)",
                margin: "0 0 2px",
              }}
            >
              Generated Investment Memo
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "var(--zelis-medium-gray, #797279)",
                margin: 0,
              }}
            >
              AI-generated &middot; Review before sharing
            </p>
          </div>
          {(wizardResult || investmentCase) && (
            <button
              onClick={fetchMemo}
              disabled={memoLoading}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "1px solid var(--zelis-ice, #ECE9FF)",
                background: "#fff",
                color: "var(--zelis-blue-purple, #5F5FC3)",
                fontSize: 12,
                fontWeight: 600,
                cursor: memoLoading ? "default" : "pointer",
                opacity: memoLoading ? 0.5 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {memoLoading ? "Generating..." : "Regenerate"}
            </button>
          )}
        </div>

        {/* Stale memo indicator */}
        {memo && memoAssumptionsRef.current && JSON.stringify(assumptions) !== memoAssumptionsRef.current && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 8,
              background: "rgba(255, 190, 0, 0.08)",
              border: "1px solid rgba(255, 190, 0, 0.25)",
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 15 }}>&#9888;</span>
            <span
              style={{
                flex: 1,
                fontSize: 12,
                color: "var(--zelis-dark, #23004B)",
                fontWeight: 500,
              }}
            >
              Assumptions have changed since this memo was generated.
            </span>
            <button
              onClick={fetchMemo}
              disabled={memoLoading}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: "none",
                background: "var(--zelis-gold, #FFBE00)",
                color: "var(--zelis-dark, #23004B)",
                fontSize: 12,
                fontWeight: 700,
                cursor: memoLoading ? "default" : "pointer",
                opacity: memoLoading ? 0.6 : 1,
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              {memoLoading ? "Regenerating..." : "Regenerate"}
            </button>
          </div>
        )}

        {/* Memo content */}
        {memoLoading && !memo && (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "var(--zelis-medium-gray, #797279)",
              fontSize: 13,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                border: "3px solid var(--zelis-ice, #ECE9FF)",
                borderTopColor: "var(--zelis-blue-purple, #5F5FC3)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            Generating investment memo...
          </div>
        )}

        {memoError && !memo && (
          <div
            style={{
              padding: "20px",
              borderRadius: 8,
              background: "rgba(230, 30, 45, 0.05)",
              border: "1px solid rgba(230, 30, 45, 0.15)",
              color: "var(--zelis-red, #E61E2D)",
              fontSize: 13,
            }}
          >
            {memoError}
            <button
              onClick={fetchMemo}
              style={{
                marginLeft: 12,
                padding: "4px 12px",
                borderRadius: 4,
                border: "1px solid var(--zelis-red, #E61E2D)",
                background: "#fff",
                color: "var(--zelis-red, #E61E2D)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {memo ? (
          <MemoDisplay markdown={memo} />
        ) : (
          !memoLoading &&
          !memoError && (
            /* Fallback: hardcoded summary when no AI memo */
            <div>
              <h4
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--zelis-dark, #23004B)",
                  margin: "0 0 8px",
                }}
              >
                Executive Summary
              </h4>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: "var(--zelis-dark-gray, #4A4A4A)",
                  margin: "0 0 16px",
                }}
              >
                This investment of{" "}
                <strong>{formatCurrency(assumptions.investment_amount)}</strong>{" "}
                projects a net present value of{" "}
                <strong>{formatCurrency(npv)}</strong> with an IRR of{" "}
                <strong>{irrDisplay}</strong> and a payback period of{" "}
                <strong>{paybackDisplay}</strong>. Based on{" "}
                <strong>${revenue.toLocaleString()}/mo</strong> pricing with{" "}
                <strong>{customers}</strong> Year 1 customers and{" "}
                <strong>{growth}%</strong> annual growth.
              </p>
              <p
                style={{
                  fontSize: 12,
                  fontStyle: "italic",
                  color: "var(--zelis-medium-gray, #797279)",
                  margin: 0,
                }}
              >
                Complete the investment wizard to generate a full AI-powered
                memo with detailed analysis and recommendation.
              </p>
            </div>
          )
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ─── Markdown Memo Renderer ─── */

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function MemoDisplay({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  const headingStyle = {
    fontSize: 13,
    fontWeight: 700 as const,
    color: "var(--zelis-dark, #23004B)",
    margin: "20px 0 8px",
  };

  const paraStyle = {
    fontSize: 13,
    lineHeight: 1.65,
    color: "var(--zelis-dark-gray, #4A4A4A)",
    margin: "0 0 12px",
  };

  while (i < lines.length) {
    const line = lines[i];

    // Headers (h1, h2, h3)
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} style={headingStyle}>
          {line.slice(4)}
        </h4>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h4 key={i} style={{ ...headingStyle, fontSize: 14 }}>
          {line.slice(3)}
        </h4>
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h4 key={i} style={{ ...headingStyle, fontSize: 15 }}>
          {line.slice(2)}
        </h4>
      );
      i++;
      continue;
    }

    // Table
    if (line.includes("|") && line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].includes("|") &&
        lines[i].trim().startsWith("|")
      ) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.filter((r) => !r.match(/^\|[-:\s|]+\|$/));
      if (rows.length > 0) {
        const headerRow = rows[0];
        const bodyRows = rows.slice(1);
        elements.push(
          <table
            key={`table-${i}`}
            style={{
              width: "100%",
              borderCollapse: "collapse",
              margin: "8px 0 16px",
              fontSize: 13,
            }}
          >
            <thead>
              <tr>
                {headerRow
                  .split("|")
                  .filter((c) => c.trim())
                  .map((cell, ci) => (
                    <th
                      key={ci}
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        borderBottom: "2px solid var(--zelis-ice, #ECE9FF)",
                        fontWeight: 700,
                        color: "var(--zelis-dark, #23004B)",
                        fontSize: 12,
                      }}
                    >
                      {cell.trim()}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri}>
                  {row
                    .split("|")
                    .filter((c) => c.trim())
                    .map((cell, ci) => (
                      <td
                        key={ci}
                        style={{
                          padding: "6px 12px",
                          borderBottom: "1px solid #f0f0f0",
                          color: "var(--zelis-dark-gray, #4A4A4A)",
                        }}
                      >
                        {renderInline(cell.trim())}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // List items
    if (line.match(/^[-*] /)) {
      elements.push(
        <div
          key={i}
          style={{ ...paraStyle, display: "flex", gap: 8, margin: "0 0 6px" }}
        >
          <span style={{ color: "var(--zelis-blue-purple, #5F5FC3)" }}>
            &bull;
          </span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
      i++;
      continue;
    }
    if (line.match(/^\d+\. /)) {
      const num = line.match(/^(\d+)\./)?.[1];
      elements.push(
        <div
          key={i}
          style={{ ...paraStyle, display: "flex", gap: 8, margin: "0 0 6px" }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "var(--zelis-blue-purple, #5F5FC3)",
            }}
          >
            {num}.
          </span>
          <span>{renderInline(line.replace(/^\d+\.\s*/, ""))}</span>
        </div>
      );
      i++;
      continue;
    }

    // Regular paragraph — collect consecutive lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !(lines[i].includes("|") && lines[i].trim().startsWith("|")) &&
      !lines[i].match(/^[-*] /) &&
      !lines[i].match(/^\d+\. /)
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      elements.push(
        <p key={`p-${i}`} style={paraStyle}>
          {renderInline(paraLines.join(" "))}
        </p>
      );
    } else {
      // Safety: always advance to prevent infinite loops on unrecognized lines
      i++;
    }
  }

  return <>{elements}</>;
}
