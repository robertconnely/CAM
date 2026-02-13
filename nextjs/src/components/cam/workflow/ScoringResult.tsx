"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CapitalRecommendation, CapitalBand } from "@/lib/types/database";

interface ScoringResultProps {
  caseId: string;
}

interface ScoreData {
  recommendation: CapitalRecommendation;
  band: CapitalBand;
  weighted_score: number;
  score_financial_return: number | null;
  score_strategic_alignment: number | null;
  score_competitive_impact: number | null;
  score_client_demand: number | null;
  score_execution_feasibility: number | null;
  scored_at: string;
}

const RECOMMENDATION_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  strong_go: { bg: "rgba(16, 185, 129, 0.12)", color: "#059669", label: "Strong Go" },
  go: { bg: "rgba(16, 185, 129, 0.08)", color: "#10B981", label: "Go" },
  consider: { bg: "rgba(255, 192, 0, 0.12)", color: "#D97706", label: "Consider" },
  hold: { bg: "rgba(230, 30, 45, 0.08)", color: "var(--zelis-red, #E61E2D)", label: "Hold" },
};

const DIMENSIONS = [
  { key: "score_financial_return", label: "Financial Return" },
  { key: "score_strategic_alignment", label: "Strategic Alignment" },
  { key: "score_competitive_impact", label: "Competitive Impact" },
  { key: "score_client_demand", label: "Client Demand" },
  { key: "score_execution_feasibility", label: "Execution Feasibility" },
];

export function ScoringResult({ caseId }: ScoringResultProps) {
  const [score, setScore] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchScore() {
      // Find the bridge initiative for this case, then its latest score
      const { data: initiatives } = await supabase
        .from("initiatives")
        .select("id")
        .eq("investment_case_id", caseId);

      if (!initiatives || initiatives.length === 0) {
        setLoading(false);
        return;
      }

      const { data: scores } = await supabase
        .from("capital_scores")
        .select("recommendation, band, weighted_score, score_financial_return, score_strategic_alignment, score_competitive_impact, score_client_demand, score_execution_feasibility, scored_at")
        .eq("initiative_id", initiatives[0].id)
        .order("scored_at", { ascending: false })
        .limit(1);

      if (scores && scores.length > 0) {
        setScore(scores[0] as ScoreData);
      }
      setLoading(false);
    }

    fetchScore();
  }, [caseId]);

  if (loading || !score) return null;

  const style = RECOMMENDATION_STYLES[score.recommendation] ?? RECOMMENDATION_STYLES.consider;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid var(--zelis-ice, #ECE9FF)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        padding: "24px 28px",
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--zelis-dark, #23004B)",
            margin: 0,
          }}
        >
          Capital Scoring Result
        </h3>

        {/* Recommendation badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 16px",
            borderRadius: 20,
            background: style.bg,
            color: style.color,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {style.label}
        </span>
      </div>

      {/* Weighted score */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: "var(--zelis-medium-gray, #797279)", fontWeight: 600 }}>
          Weighted Score:{" "}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--zelis-dark, #23004B)" }}>
          {score.weighted_score.toFixed(1)} / 5.0
        </span>
      </div>

      {/* Dimension breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {DIMENSIONS.map((dim) => {
          const value = score[dim.key as keyof ScoreData] as number | null;
          if (value == null) return null;
          return (
            <div key={dim.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, color: "var(--zelis-medium-gray, #797279)", width: 160, flexShrink: 0 }}>
                {dim.label}
              </span>
              <div style={{ flex: 1, height: 6, background: "var(--zelis-ice, #ECE9FF)", borderRadius: 3 }}>
                <div
                  style={{
                    width: `${(value / 5) * 100}%`,
                    height: "100%",
                    borderRadius: 3,
                    background: value >= 4 ? "#10B981" : value >= 3 ? "var(--zelis-blue-purple, #5F5FC3)" : value >= 2 ? "#FFC000" : "var(--zelis-red, #E61E2D)",
                    transition: "width 0.3s",
                  }}
                />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--zelis-dark, #23004B)", width: 24, textAlign: "right" }}>
                {value}
              </span>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 11, color: "var(--zelis-medium-gray, #797279)", margin: "12px 0 0" }}>
        Scored on {new Date(score.scored_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </div>
  );
}
