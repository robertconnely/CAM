"use client";

import type { RevenueModel } from "@/lib/types/database";
import { CM_THRESHOLDS, checkCmPass } from "@/lib/scoring/capital-scoring";

interface StepCmGateProps {
  cmValue: string;
  revenueModel: RevenueModel;
  onChange: (val: string) => void;
  prePopulated?: boolean;
  computedValue?: string;
}

export function StepCmGate({ cmValue, revenueModel, onChange, prePopulated, computedValue }: StepCmGateProps) {
  const threshold = CM_THRESHOLDS[revenueModel];
  const numValue = parseFloat(cmValue) || 0;
  const result = checkCmPass(numValue, revenueModel);
  const hasValue = cmValue !== "";

  // Gauge calculations
  const maxGauge = 100;
  const valuePercent = Math.min((numValue / maxGauge) * 100, 100);
  const minPercent = (threshold.min / maxGauge) * 100;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 800,
            color: "var(--zelis-purple)",
            margin: "0 0 0.35rem 0",
          }}
        >
          Contribution Margin (CM%)
        </h2>
        <p style={{ fontSize: "0.88rem", color: "var(--zelis-blue-purple)", margin: 0 }}>
          Financial Inclusion Gate — Step 2 of 2
        </p>
      </div>

      {prePopulated && (
        <div
          style={{
            background: "#e3f2fd",
            border: "1px solid #90caf9",
            borderRadius: "10px",
            padding: "0.85rem 1.1rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.65rem",
          }}
        >
          <span style={{ fontSize: "1rem", lineHeight: 1.3 }}>&#x2139;&#xFE0F;</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#1565c0" }}>
              Computed from Financial Model
            </div>
            <div style={{ fontSize: "0.78rem", color: "#1976d2", marginTop: "0.15rem" }}>
              This value was calculated by the investment case wizard. You may adjust if needed.
            </div>
            {computedValue && cmValue !== computedValue && (
              <button
                type="button"
                onClick={() => onChange(computedValue)}
                style={{
                  marginTop: "0.4rem",
                  background: "none",
                  border: "none",
                  color: "#1565c0",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                Reset to {computedValue}%
              </button>
            )}
          </div>
        </div>
      )}

      {/* Threshold info */}
      <div
        style={{
          background: "var(--zelis-ice)",
          borderRadius: "10px",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          gap: "1.5rem",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "var(--zelis-purple)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "0.2rem",
            }}
          >
            Minimum CM%
          </div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--zelis-purple)" }}>
            {threshold.min}%
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <span
            style={{
              fontSize: "0.72rem",
              color: "var(--zelis-medium-gray)",
              fontStyle: "italic",
            }}
          >
            for {threshold.label}
          </span>
        </div>
      </div>

      {/* CM input */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "var(--zelis-purple)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            display: "block",
            marginBottom: "0.4rem",
          }}
        >
          Your Initiative's Contribution Margin (%)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          style={{
            width: "100%",
            padding: "0.85rem 1rem",
            borderRadius: "10px",
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: !hasValue
              ? "var(--zelis-ice)"
              : result.pass
                ? "#4caf50"
                : "#e53935",
            fontSize: "1.5rem",
            fontWeight: 800,
            fontFamily: "inherit",
            outline: "none",
            textAlign: "center",
            background: "white",
            transition: "border-color 0.3s ease",
          }}
          value={cmValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter CM %"
          autoFocus
        />
      </div>

      {/* Visual gauge */}
      {hasValue && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              height: 28,
              borderRadius: 14,
              background: "linear-gradient(90deg, #ffcdd2 0%, #fff9c4 40%, #c8e6c9 70%, #a5d6a7 100%)",
              position: "relative",
              overflow: "visible",
            }}
          >
            {/* Min threshold marker */}
            <div
              style={{
                position: "absolute",
                left: `${minPercent}%`,
                top: -4,
                bottom: -4,
                width: 2,
                background: "#e53935",
                zIndex: 2,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  bottom: -18,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "#e53935",
                  whiteSpace: "nowrap",
                }}
              >
                Min {threshold.min}%
              </span>
            </div>

            {/* Value indicator */}
            <div
              style={{
                position: "absolute",
                left: `${valuePercent}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: result.pass ? "#2e7d32" : "#e53935",
                borderWidth: "3px",
                borderStyle: "solid",
                borderColor: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "0.65rem",
                fontWeight: 800,
                zIndex: 3,
                transition: "left 0.3s ease",
              }}
            >
              {numValue}%
            </div>
          </div>
        </div>
      )}

      {/* Result banner */}
      {hasValue && (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "10px",
            background: result.pass ? "#e8f5e9" : "#fce4ec",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginTop: "2rem",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: result.pass ? "#2e7d32" : "#e53935",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "1rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {result.pass ? "✓" : "✗"}
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                color: result.pass ? "#2e7d32" : "#c62828",
                fontSize: "0.9rem",
              }}
            >
              {result.pass ? "CM% Gate Passed" : "CM% Below Minimum Threshold"}
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                color: result.pass ? "#388e3c" : "#d32f2f",
                marginTop: "0.1rem",
              }}
            >
              {result.pass
                ? `${numValue}% meets the ${threshold.min}% minimum for ${threshold.label}`
                : `${numValue}% is below the ${threshold.min}% minimum. Need ${(threshold.min - numValue).toFixed(1)}% more to pass.`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
