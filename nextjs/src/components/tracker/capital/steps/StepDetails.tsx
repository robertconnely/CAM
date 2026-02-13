"use client";

import type { InitiativeType, RevenueModel } from "@/lib/types/database";
import {
  INITIATIVE_TYPE_OPTIONS,
  REVENUE_MODEL_OPTIONS,
} from "@/lib/scoring/capital-scoring";

interface StepDetailsProps {
  initiativeType: InitiativeType | null;
  revenueModel: RevenueModel | null;
  investmentAmount: string;
  timelineMonths: string;
  onSetType: (type: InitiativeType) => void;
  onSetModel: (model: RevenueModel) => void;
  onSetInvestment: (val: string) => void;
  onSetTimeline: (val: string) => void;
}

const ICONS: Record<string, string> = {
  rocket: "M15 59l13-40 40-13-13 40z",
  sparkle: "M28 8l5 15 15 5-15 5-5 15-5-15-15-5 15-5z",
  gear: "M28 18a10 10 0 100 20 10 10 0 000-20z",
  check: "M16 28l8 8 16-16",
  shield: "M28 8l16 8v12c0 10-7 19-16 22-9-3-16-12-16-22V16z",
};

function TypeIcon({ icon }: { icon: string }) {
  const path = ICONS[icon] || ICONS.rocket;
  return (
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none">
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  borderRadius: "8px",
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: "var(--zelis-ice)",
  fontSize: "0.88rem",
  fontFamily: "inherit",
  outline: "none",
  background: "white",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "var(--zelis-purple)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: "0.4rem",
  display: "block",
};

export function StepDetails({
  initiativeType,
  revenueModel,
  investmentAmount,
  timelineMonths,
  onSetType,
  onSetModel,
  onSetInvestment,
  onSetTimeline,
}: StepDetailsProps) {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 800,
            color: "var(--zelis-purple)",
            margin: "0 0 0.35rem 0",
          }}
        >
          Initiative Classification
        </h2>
        <p style={{ fontSize: "0.88rem", color: "var(--zelis-blue-purple)", margin: 0 }}>
          These selections determine the financial thresholds for your initiative.
        </p>
      </div>

      {/* Initiative Type */}
      <label style={labelStyle}>Initiative Type</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {INITIATIVE_TYPE_OPTIONS.map((opt) => {
          const isSelected = initiativeType === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSetType(opt.value)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.65rem",
                padding: "0.85rem 1rem",
                borderRadius: "10px",
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: isSelected ? "var(--zelis-purple)" : "var(--zelis-ice)",
                background: isSelected ? "#f3f0ff" : "white",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                color: isSelected ? "var(--zelis-purple)" : "var(--zelis-medium-gray)",
              }}
            >
              <div style={{ flexShrink: 0, marginTop: "0.1rem" }}>
                <TypeIcon icon={opt.icon} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: isSelected ? "var(--zelis-purple)" : "var(--zelis-dark-gray)",
                    marginBottom: "0.15rem",
                  }}
                >
                  {opt.label}
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--zelis-medium-gray)",
                    lineHeight: 1.4,
                  }}
                >
                  {opt.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Revenue Model */}
      <label style={labelStyle}>Revenue Model</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {REVENUE_MODEL_OPTIONS.map((opt) => {
          const isSelected = revenueModel === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSetModel(opt.value)}
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: isSelected ? "var(--zelis-purple)" : "var(--zelis-ice)",
                background: isSelected ? "#f3f0ff" : "white",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: isSelected ? "var(--zelis-purple)" : "var(--zelis-dark-gray)",
                  marginBottom: "0.1rem",
                }}
              >
                {opt.label}
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--zelis-medium-gray)",
                  lineHeight: 1.4,
                }}
              >
                {opt.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Investment + Timeline */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <label style={labelStyle}>Investment Amount ($)</label>
          <input
            type="number"
            min="0"
            style={inputStyle}
            value={investmentAmount}
            onChange={(e) => onSetInvestment(e.target.value)}
            placeholder="e.g. 500,000"
          />
        </div>
        <div>
          <label style={labelStyle}>Timeline (months)</label>
          <input
            type="number"
            min="1"
            max="120"
            style={inputStyle}
            value={timelineMonths}
            onChange={(e) => onSetTimeline(e.target.value)}
            placeholder="e.g. 12"
          />
        </div>
      </div>
    </div>
  );
}
