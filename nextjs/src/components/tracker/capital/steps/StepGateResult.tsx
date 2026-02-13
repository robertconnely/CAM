"use client";

import type { InitiativeType, RevenueModel } from "@/lib/types/database";
import { IRR_THRESHOLDS, CM_THRESHOLDS } from "@/lib/scoring/capital-scoring";

interface StepGateResultProps {
  irrValue: number;
  cmValue: number;
  irrPass: boolean;
  cmPass: boolean;
  initiativeType: InitiativeType;
  revenueModel: RevenueModel;
}

export function StepGateResult({
  irrValue,
  cmValue,
  irrPass,
  cmPass,
  initiativeType,
  revenueModel,
}: StepGateResultProps) {
  const bothPass = irrPass && cmPass;
  const irrThreshold = IRR_THRESHOLDS[initiativeType];
  const cmThreshold = CM_THRESHOLDS[revenueModel];
  const isIrrExempt = irrThreshold.min === null;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 800,
            color: "var(--zelis-purple)",
            margin: "0 0 0.35rem 0",
          }}
        >
          Financial Inclusion Gate
        </h2>
        <p style={{ fontSize: "0.88rem", color: "var(--zelis-blue-purple)", margin: 0 }}>
          Summary of your financial gate evaluation
        </p>
      </div>

      {/* Overall result banner */}
      <div
        style={{
          borderRadius: "14px",
          padding: "1.75rem 1.5rem",
          textAlign: "center",
          background: bothPass
            ? "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)"
            : "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)",
          marginBottom: "1.5rem",
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: bothPass ? "#a5d6a7" : "#ef9a9a",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: bothPass ? "#2e7d32" : "#e53935",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 0.75rem",
          }}
        >
          <span style={{ color: "white", fontSize: "1.5rem", fontWeight: 700 }}>
            {bothPass ? "✓" : "!"}
          </span>
        </div>
        <div
          style={{
            fontSize: "1.15rem",
            fontWeight: 800,
            color: bothPass ? "#1b5e20" : "#b71c1c",
            marginBottom: "0.3rem",
          }}
        >
          {bothPass ? "Financial Gate Passed" : "Financial Gate Not Met"}
        </div>
        <div
          style={{
            fontSize: "0.85rem",
            color: bothPass ? "#2e7d32" : "#c62828",
            lineHeight: 1.5,
          }}
        >
          {bothPass
            ? "Your initiative meets the financial inclusion criteria. Proceed to strategic scoring."
            : "Your initiative doesn't fully meet financial thresholds. You can still proceed to strategic scoring, but this will be reflected in the final recommendation."}
        </div>
      </div>

      {/* Individual results */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {/* IRR result */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem 1.25rem",
            borderRadius: "10px",
            background: "white",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "var(--zelis-ice)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: irrPass ? "#e8f5e9" : "#fce4ec",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ color: irrPass ? "#2e7d32" : "#e53935", fontWeight: 700, fontSize: "1.1rem" }}>
              {irrPass ? "✓" : "✗"}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--zelis-dark-gray)" }}>
              IRR — Internal Rate of Return
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--zelis-medium-gray)", marginTop: "0.1rem" }}>
              {isIrrExempt
                ? `Exempt for ${irrThreshold.label}`
                : `Your ${irrValue}% vs. ${irrThreshold.min}% minimum (${irrThreshold.label})`}
            </div>
          </div>
          <div
            style={{
              fontSize: "1.15rem",
              fontWeight: 800,
              color: irrPass ? "#2e7d32" : "#e53935",
            }}
          >
            {isIrrExempt ? "N/A" : `${irrValue}%`}
          </div>
        </div>

        {/* CM result */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem 1.25rem",
            borderRadius: "10px",
            background: "white",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "var(--zelis-ice)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: cmPass ? "#e8f5e9" : "#fce4ec",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ color: cmPass ? "#2e7d32" : "#e53935", fontWeight: 700, fontSize: "1.1rem" }}>
              {cmPass ? "✓" : "✗"}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--zelis-dark-gray)" }}>
              CM% — Contribution Margin
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--zelis-medium-gray)", marginTop: "0.1rem" }}>
              Your {cmValue}% vs. {cmThreshold.min}% minimum ({cmThreshold.label})
            </div>
          </div>
          <div
            style={{
              fontSize: "1.15rem",
              fontWeight: 800,
              color: cmPass ? "#2e7d32" : "#e53935",
            }}
          >
            {cmValue}%
          </div>
        </div>
      </div>

      {/* Guidance if failed */}
      {!bothPass && (
        <div
          style={{
            marginTop: "1.25rem",
            padding: "1rem 1.25rem",
            borderRadius: "10px",
            background: "#fff8e1",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "#ffe082",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.82rem",
              color: "#e65100",
              marginBottom: "0.4rem",
            }}
          >
            What this means
          </div>
          <div style={{ fontSize: "0.8rem", color: "#bf360c", lineHeight: 1.5 }}>
            Failing the financial gate doesn't stop the evaluation, but it limits the
            maximum recommendation. Even with strong strategic scores, the final
            recommendation will be capped at <strong>CONSIDER</strong> (Band B) rather
            than GO or STRONG GO.
          </div>
        </div>
      )}
    </div>
  );
}
