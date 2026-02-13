"use client";

import React from "react";

const STAGES = [
  "Ideation",
  "Discovery",
  "Business Case",
  "Approval",
  "Execution",
  "Review",
];

interface PdlcStepperProps {
  currentStage: number; // 0-indexed
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 6L5 8.5L9.5 3.5"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PdlcStepper({ currentStage }: PdlcStepperProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid var(--zelis-ice, #ECE9FF)",
        padding: "20px 24px",
        overflowX: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          minWidth: "fit-content",
        }}
      >
        {STAGES.map((stage, i) => {
          const isCompleted = i < currentStage;
          const isCurrent = i === currentStage;

          return (
            <div
              key={stage}
              style={{
                display: "flex",
                alignItems: "flex-start",
                flex: i < STAGES.length - 1 ? 1 : "0 0 auto",
              }}
            >
              {/* Stage circle + label */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  minWidth: 64,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                    ...(isCompleted
                      ? {
                          backgroundColor: "var(--zelis-blue-purple, #5F5FC3)",
                          color: "#fff",
                        }
                      : isCurrent
                        ? {
                            backgroundColor: "#fff",
                            border: "2px solid var(--zelis-blue-purple, #5F5FC3)",
                            color: "var(--zelis-blue-purple, #5F5FC3)",
                          }
                        : {
                            backgroundColor: "var(--zelis-ice, #ECE9FF)",
                            color: "var(--zelis-medium-gray, #8C8C8C)",
                          }),
                    transition: "all 0.2s ease",
                  }}
                >
                  {isCompleted ? <CheckIcon /> : i + 1}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCompleted || isCurrent
                      ? "var(--zelis-dark, #23004B)"
                      : "var(--zelis-medium-gray, #8C8C8C)",
                    textAlign: "center",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {stage}
                </span>
              </div>

              {/* Connector line */}
              {i < STAGES.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    marginTop: 13, // vertically center with the 28px circle
                    marginLeft: 4,
                    marginRight: 4,
                    minWidth: 20,
                    borderRadius: 1,
                    backgroundColor:
                      i < currentStage
                        ? "var(--zelis-blue-purple, #5F5FC3)"
                        : "var(--zelis-ice, #ECE9FF)",
                    transition: "background-color 0.2s ease",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { STAGES };
export type { PdlcStepperProps };
