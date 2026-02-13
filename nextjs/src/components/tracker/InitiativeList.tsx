"use client";

import type { Initiative, PdlcPhase, CapitalScore, UserRole } from "@/lib/types/database";
import { PhaseIndicator } from "./PhaseIndicator";
import { StatusBadge } from "./StatusBadge";
import { TierBadge } from "./TierBadge";
import { Tooltip } from "./Tooltip";
import { ScoreBadge } from "./capital/ScoreBadge";

interface InitiativeListProps {
  initiatives: Initiative[];
  phases: PdlcPhase[];
  capitalScores: CapitalScore[];
  role: UserRole | null;
  onSelect: (initiative: Initiative) => void;
  onEdit: (initiative: Initiative) => void;
  onGateReview: (initiative: Initiative) => void;
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function InitiativeList({
  initiatives,
  phases,
  capitalScores,
  role,
  onSelect,
  onEdit,
  onGateReview,
}: InitiativeListProps) {
  const canEdit = role === "admin" || role === "editor";
  const sorted = [...phases].sort((a, b) => a.display_order - b.display_order);

  if (initiatives.length === 0) {
    return (
      <div
        style={{
          padding: "3rem 2rem",
          textAlign: "center",
          borderRadius: "12px",
          background: "white",
          border: "2px dashed var(--zelis-ice)",
        }}
      >
        <div
          style={{
            fontSize: "2.5rem",
            marginBottom: "0.5rem",
            opacity: 0.4,
          }}
        >
          📋
        </div>
        <div
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "var(--zelis-medium-gray)",
            marginBottom: "0.25rem",
          }}
        >
          No initiatives found
        </div>
        <div
          style={{
            fontSize: "0.82rem",
            color: "var(--zelis-medium-gray)",
          }}
        >
          {canEdit
            ? 'Click "+ New Initiative" to get started.'
            : "Check back later for updates."}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {initiatives.map((init) => {
        const phase = sorted.find((p) => p.id === init.current_phase_id);
        const latestScore = capitalScores.find((s) => s.initiative_id === init.id);

        return (
          <div
            key={init.id}
            onClick={() => onSelect(init)}
            style={{
              background: "white",
              borderRadius: "10px",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "var(--zelis-ice)",
              padding: "1.1rem 1.5rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.07)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0px 8px 32px 12px rgba(130, 140, 225, 0.14)";
              e.currentTarget.style.borderColor = "var(--zelis-gold)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0px 4px 28px 9px rgba(130, 140, 225, 0.07)";
              e.currentTarget.style.borderColor = "var(--zelis-ice)";
              e.currentTarget.style.transform = "none";
            }}
          >
            {/* Top row: ID, Name, Badges, Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                marginBottom: "0.6rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "var(--zelis-blue-purple)",
                    fontFamily: "monospace",
                    background: "var(--zelis-ice)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {init.initiative_id}
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    color: "var(--zelis-dark-gray)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {init.name}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexShrink: 0,
                }}
              >
                <StatusBadge status={init.status} size="sm" />
                <TierBadge tier={init.tier} />
                {latestScore?.recommendation && (
                  <ScoreBadge
                    recommendation={latestScore.recommendation}
                    score={latestScore.weighted_score}
                  />
                )}
              </div>
            </div>

            {/* Bottom row: Phase indicator + meta */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <PhaseIndicator
                  phases={phases}
                  currentPhaseId={init.current_phase_id}
                  size="sm"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  flexShrink: 0,
                  fontSize: "0.72rem",
                  color: "var(--zelis-medium-gray)",
                  fontWeight: 600,
                }}
              >
                <Tooltip label="Current Phase">
                  <span>{phase?.label ?? "—"}</span>
                </Tooltip>
                <Tooltip label="Owner">
                  <span>{init.owner_name || "Unassigned"}</span>
                </Tooltip>
                <Tooltip label="Target Gate Date">
                  <span>{formatDate(init.target_gate_date)}</span>
                </Tooltip>
                {canEdit && (
                  <div
                    style={{
                      display: "flex",
                      gap: "0.4rem",
                      marginLeft: "0.5rem",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      title="Edit"
                      onClick={() => onEdit(init)}
                      style={{
                        background: "var(--zelis-ice)",
                        border: "none",
                        borderRadius: "6px",
                        padding: "0.35rem 0.65rem",
                        cursor: "pointer",
                        fontSize: "0.72rem",
                        fontFamily: "inherit",
                        fontWeight: 600,
                        color: "var(--zelis-blue-purple)",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      title="Record gate review"
                      onClick={() => onGateReview(init)}
                      style={{
                        background:
                          "linear-gradient(135deg, var(--zelis-purple) 0%, var(--zelis-blue-purple) 100%)",
                        border: "none",
                        borderRadius: "6px",
                        padding: "0.35rem 0.65rem",
                        cursor: "pointer",
                        fontSize: "0.72rem",
                        fontFamily: "inherit",
                        fontWeight: 600,
                        color: "white",
                      }}
                    >
                      Gate
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
