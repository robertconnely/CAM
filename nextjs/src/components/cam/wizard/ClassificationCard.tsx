"use client";

import type { InitiativeType, RevenueModel } from "@/lib/types/database";
import {
  INITIATIVE_TYPE_OPTIONS,
  REVENUE_MODEL_OPTIONS,
} from "@/lib/scoring/capital-scoring";

interface ClassificationCardProps {
  initiativeType: InitiativeType | null;
  revenueModel: RevenueModel | null;
  onSetType: (type: InitiativeType) => void;
  onSetModel: (model: RevenueModel) => void;
}

export function ClassificationCard({
  initiativeType,
  revenueModel,
  onSetType,
  onSetModel,
}: ClassificationCardProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        maxWidth: "92%",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background:
            "linear-gradient(135deg, var(--zelis-purple, #321478), var(--zelis-blue-purple, #5F5FC3))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          color: "#fff",
          flexShrink: 0,
        }}
      >
        C
      </div>

      {/* Card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: "4px 16px 16px 16px",
          padding: "20px 24px",
          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--zelis-dark, #23004B)",
            marginBottom: 20,
          }}
        >
          One last thing before I build your model — how would you classify this
          initiative? This determines the financial thresholds used during
          scoring.
        </div>

        {/* Initiative Type */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--zelis-purple, #321478)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 8,
          }}
        >
          Initiative Type
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
            marginBottom: 20,
          }}
        >
          {INITIATIVE_TYPE_OPTIONS.map((opt) => {
            const isSelected = initiativeType === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onSetType(opt.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  borderWidth: 2,
                  borderStyle: "solid",
                  borderColor: isSelected
                    ? "var(--zelis-purple, #321478)"
                    : "var(--zelis-ice, #ECE9FF)",
                  background: isSelected ? "#f3f0ff" : "white",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "'Nunito Sans', 'Avenir Next', sans-serif",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isSelected
                      ? "var(--zelis-purple, #321478)"
                      : "var(--zelis-dark, #23004B)",
                    marginBottom: 2,
                  }}
                >
                  {opt.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#999",
                    lineHeight: 1.4,
                  }}
                >
                  {opt.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Revenue Model */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--zelis-purple, #321478)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 8,
          }}
        >
          Revenue Model
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
          }}
        >
          {REVENUE_MODEL_OPTIONS.map((opt) => {
            const isSelected = revenueModel === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onSetModel(opt.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  borderWidth: 2,
                  borderStyle: "solid",
                  borderColor: isSelected
                    ? "var(--zelis-purple, #321478)"
                    : "var(--zelis-ice, #ECE9FF)",
                  background: isSelected ? "#f3f0ff" : "white",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "'Nunito Sans', 'Avenir Next', sans-serif",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isSelected
                      ? "var(--zelis-purple, #321478)"
                      : "var(--zelis-dark, #23004B)",
                    marginBottom: 2,
                  }}
                >
                  {opt.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#999",
                    lineHeight: 1.4,
                  }}
                >
                  {opt.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
