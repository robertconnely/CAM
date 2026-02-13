"use client";

import type { Initiative } from "@/lib/types/database";

interface StepWelcomeProps {
  initiatives: Initiative[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function StepWelcome({ initiatives, selectedId, onSelect }: StepWelcomeProps) {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="28" fill="var(--zelis-ice)" />
            <path
              d="M18 38V18h20l-16 20h16"
              stroke="var(--zelis-purple)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "var(--zelis-purple)",
            margin: "0 0 0.5rem 0",
          }}
        >
          Capital Allocation Scoring
        </h2>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--zelis-blue-purple)",
            lineHeight: 1.6,
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          Walk through a guided evaluation to score and prioritize this initiative
          for capital investment. We'll assess the financial inclusion gate, then
          score across five strategic dimensions.
        </p>
      </div>

      {/* What to expect */}
      <div
        style={{
          background: "var(--zelis-ice)",
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <h3
          style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "var(--zelis-purple)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            margin: "0 0 0.75rem 0",
          }}
        >
          What to Expect
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {[
            { num: "1", label: "Initiative Details", desc: "Type, revenue model, and investment" },
            { num: "2", label: "Financial Inclusion Gate", desc: "IRR and CM% pass/fail evaluation" },
            { num: "3", label: "Strategic Scoring", desc: "Five dimensions scored 1–5 with rubrics" },
            { num: "4", label: "Recommendation", desc: "Weighted score, band, and next steps" },
          ].map((item) => (
            <div key={item.num} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "var(--zelis-purple)",
                  flexShrink: 0,
                }}
              >
                {item.num}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--zelis-dark-gray)",
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--zelis-medium-gray)" }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Initiative selector */}
      <div>
        <label
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "var(--zelis-purple)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            display: "block",
            marginBottom: "0.5rem",
          }}
        >
          Select Initiative to Score
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {initiatives.map((init) => {
            const isSelected = selectedId === init.id;
            return (
              <button
                key={init.id}
                onClick={() => onSelect(init.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.85rem 1.15rem",
                  borderRadius: "10px",
                  borderWidth: "2px",
                  borderStyle: "solid",
                  borderColor: isSelected ? "var(--zelis-purple)" : "var(--zelis-ice)",
                  background: isSelected ? "#f3f0ff" : "white",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderColor: isSelected ? "var(--zelis-purple)" : "var(--zelis-medium-gray)",
                    background: isSelected ? "var(--zelis-purple)" : "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "white",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: "var(--zelis-blue-purple)",
                        fontFamily: "monospace",
                        background: "var(--zelis-ice)",
                        padding: "0.1rem 0.4rem",
                        borderRadius: "4px",
                      }}
                    >
                      {init.initiative_id}
                    </span>
                    <span
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "var(--zelis-dark-gray)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {init.name}
                    </span>
                  </div>
                  {init.owner_name && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--zelis-medium-gray)",
                        marginTop: "0.15rem",
                      }}
                    >
                      Owner: {init.owner_name}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
          {initiatives.length === 0 && (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--zelis-medium-gray)",
                fontSize: "0.88rem",
              }}
            >
              No initiatives available. Create one in the tracker first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
