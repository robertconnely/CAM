"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/Toast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type {
  Initiative,
  GateReview,
  PdlcPhase,
  CapitalScore,
  UserRole,
} from "@/lib/types/database";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { GLOSSARY } from "@/lib/glossary";
import { PhaseIndicator } from "./PhaseIndicator";
import { StatusBadge } from "./StatusBadge";
import { TierBadge } from "./TierBadge";
import { GateReviewForm } from "./GateReviewForm";
import { InitiativeForm } from "./InitiativeForm";
import { GraduationForm } from "./GraduationForm";
import { ScoreHistory } from "./capital/ScoreHistory";
import { ScoreBadge } from "./capital/ScoreBadge";
import { DECISION_CONFIG, VALUE_DRIVER_OPTIONS } from "./constants";

interface InitiativeDetailProps {
  initiative: Initiative;
  gateReviews: GateReview[];
  capitalScores: CapitalScore[];
  phases: PdlcPhase[];
  allInitiatives: Initiative[];
  role: UserRole | null;
  onBack: () => void;
}

const metaLabelStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 700,
  color: "var(--zelis-blue-purple)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "0.15rem",
};

const metaValueStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "var(--zelis-dark-gray)",
};

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function InitiativeDetail({
  initiative,
  gateReviews,
  capitalScores,
  phases,
  allInitiatives,
  role,
  onBack,
}: InitiativeDetailProps) {
  const [showGateForm, setShowGateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showGraduationForm, setShowGraduationForm] = useState(false);
  const [alreadyGraduated, setAlreadyGraduated] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();

  const canEdit = role === "admin" || role === "editor";
  const canDelete = role === "admin";
  const sorted = [...phases].sort((a, b) => a.display_order - b.display_order);
  const currentPhase = sorted.find(
    (p) => p.id === initiative.current_phase_id
  );
  const isLastPhase =
    sorted.length > 0 &&
    initiative.current_phase_id === sorted[sorted.length - 1]?.id;
  const canGraduate =
    canEdit &&
    !alreadyGraduated &&
    (initiative.status === "complete" || isLastPhase);

  // Check if initiative has already been graduated to a product
  useEffect(() => {
    supabase
      .from("portfolio_products")
      .select("id")
      .eq("initiative_id", initiative.id)
      .limit(1)
      .then(({ data }) => setAlreadyGraduated((data?.length ?? 0) > 0));
  }, [initiative.id]);
  const reviews = [...gateReviews]
    .filter((r) => r.initiative_id === initiative.id)
    .sort(
      (a, b) =>
        new Date(b.review_date).getTime() - new Date(a.review_date).getTime()
    );

  const nextId = (() => {
    const nums = allInitiatives
      .map((i) => {
        const m = i.initiative_id.match(/(\d+)/);
        return m ? parseInt(m[1]) : 0;
      });
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `PDLC-${String(max + 1).padStart(3, "0")}`;
  })();

  const handleDelete = async () => {
    const { error } = await supabase
      .from("initiatives")
      .delete()
      .eq("id", initiative.id);
    if (error) {
      showToast(`Failed: ${error.message}`, "error");
    } else {
      showToast("Initiative deleted", "success");
      router.refresh();
      onBack();
    }
    setDeleteTarget(false);
  };

  return (
    <div>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "0.88rem",
            fontWeight: 600,
            color: "var(--zelis-blue-purple)",
            fontFamily: "inherit",
            padding: 0,
          }}
        >
          ← Back to Pipeline
        </button>
        {canEdit && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setShowEditForm(true)}
              style={{
                padding: "0.5rem 1.15rem",
                borderRadius: "8px",
                border: "2px solid var(--zelis-blue-purple)",
                background: "white",
                color: "var(--zelis-blue-purple)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.82rem",
                fontFamily: "inherit",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => setShowGateForm(true)}
              style={{
                padding: "0.5rem 1.15rem",
                borderRadius: "8px",
                border: "none",
                background:
                  "linear-gradient(135deg, var(--zelis-purple) 0%, var(--zelis-blue-purple) 100%)",
                color: "white",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.82rem",
                fontFamily: "inherit",
                boxShadow: "0 2px 8px rgba(50, 20, 120, 0.25)",
              }}
            >
              Record Gate Review
            </button>
            <Link
              href={`/cam/tracker/capital?initiative=${initiative.id}`}
              style={{
                padding: "0.5rem 1.15rem",
                borderRadius: "8px",
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: "var(--zelis-gold)",
                background: "#fffbe6",
                color: "var(--zelis-purple)",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.82rem",
                fontFamily: "inherit",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              Capital Scoring
            </Link>
            {canGraduate && (
              <button
                onClick={() => setShowGraduationForm(true)}
                style={{
                  padding: "0.5rem 1.15rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #FFBE00, #e6a800)",
                  color: "var(--zelis-dark, #23004B)",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  fontFamily: "inherit",
                  boxShadow: "0 2px 8px rgba(255, 190, 0, 0.3)",
                }}
              >
                Graduate to Portfolio
              </button>
            )}
            {alreadyGraduated && (
              <Link
                href="/cam/portfolio"
                style={{
                  padding: "0.5rem 1.15rem",
                  borderRadius: "8px",
                  background: "rgba(50, 15, 255, 0.08)",
                  color: "var(--zelis-blue, #320FFF)",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  fontFamily: "inherit",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                Graduated
              </Link>
            )}
            {canDelete && (
              <button
                onClick={() => setDeleteTarget(true)}
                style={{
                  padding: "0.5rem 1.15rem",
                  borderRadius: "8px",
                  border: "2px solid var(--zelis-red)",
                  background: "white",
                  color: "var(--zelis-red)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  fontFamily: "inherit",
                }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hero card */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #23004B 0%, #321478 40%, #41329B 100%)",
          borderRadius: "10px",
          padding: "2.25rem 2.5rem",
          color: "white",
          marginBottom: "1.5rem",
          position: "relative",
          overflow: "hidden",
          boxShadow: "12px 12px 50px rgba(0, 0, 0, 0.25)",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          style={{
            position: "absolute",
            top: "-20px",
            right: "-10px",
            width: 220,
            height: 220,
            opacity: 0.07,
          }}
        >
          <path
            d="M15 15 L85 15 L25 85 L85 85"
            fill="none"
            stroke="white"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                opacity: 0.7,
                letterSpacing: "0.05em",
                marginBottom: "0.25rem",
              }}
            >
              {initiative.initiative_id}
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: 800,
                marginBottom: "0.5rem",
              }}
            >
              {initiative.name}
            </h2>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <StatusBadge status={initiative.status} />
              <TierBadge tier={initiative.tier} />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{ fontSize: "0.7rem", fontWeight: 600, opacity: 0.7 }}
            >
              CURRENT PHASE
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--zelis-gold)" }}>
              {currentPhase?.label ?? "—"}
            </div>
          </div>
        </div>
        {/* Phase indicator */}
        <div style={{ marginTop: "1.5rem" }}>
          <PhaseIndicator
            phases={phases}
            currentPhaseId={initiative.current_phase_id}
            size="lg"
          />
        </div>
      </div>

      {/* Info grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        {[
          { label: "Owner", value: initiative.owner_name || "Unassigned" },
          { label: "Phase Start", value: formatDate(initiative.phase_start_date) },
          { label: "Target Gate", value: formatDate(initiative.target_gate_date) },
          { label: "Actual Gate", value: formatDate(initiative.actual_gate_date) },
          {
            label: "IRR",
            value: initiative.irr != null ? `${initiative.irr}%` : "—",
          },
          {
            label: "Contribution Margin",
            value:
              initiative.contribution_margin != null
                ? `${initiative.contribution_margin}%`
                : "—",
          },
          {
            label: "Strategic Score",
            value:
              initiative.strategic_score != null
                ? `${initiative.strategic_score}/100`
                : "—",
          },
          {
            label: "Priority Rank",
            value:
              initiative.priority_rank != null
                ? `#${initiative.priority_rank}`
                : "—",
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              padding: "1rem 1.25rem",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(11px)",
              borderRadius: "10px",
              border: "1px solid var(--zelis-ice)",
              boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.05)",
            }}
          >
            <div style={metaLabelStyle}>
              {GLOSSARY[item.label] ? (
                <InfoTooltip text={GLOSSARY[item.label]}>{item.label}</InfoTooltip>
              ) : (
                item.label
              )}
            </div>
            <div style={metaValueStyle}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Value Drivers */}
      {initiative.value_driver_ids && initiative.value_driver_ids.length > 0 && (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(11px)",
            borderRadius: "10px",
            border: "1px solid var(--zelis-ice)",
            boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.05)",
            marginBottom: "1.5rem",
          }}
        >
          <div style={metaLabelStyle}>Value Drivers</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.35rem" }}>
            {initiative.value_driver_ids.map((driverId) => {
              const driver = VALUE_DRIVER_OPTIONS.find((d) => d.id === driverId);
              if (!driver) return null;
              return (
                <span
                  key={driverId}
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: driver.color,
                    background: `${driver.color}10`,
                    padding: "0.25rem 0.6rem",
                    borderRadius: 5,
                    border: `1px solid ${driver.color}20`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {driver.shortLabel}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      {initiative.notes && (
        <div
          style={{
            padding: "1.15rem 1.5rem",
            background: "#fffbe6",
            borderRadius: "10px",
            border: "1px solid #ffe082",
            marginBottom: "1.5rem",
            fontSize: "0.88rem",
            lineHeight: 1.6,
          }}
        >
          <div
            style={{
              ...metaLabelStyle,
              color: "#e67e00",
              marginBottom: "0.4rem",
            }}
          >
            Notes
          </div>
          {initiative.notes}
        </div>
      )}

      {/* Capital Score History */}
      {(() => {
        const initScores = capitalScores
          .filter((s) => s.initiative_id === initiative.id)
          .sort((a, b) => new Date(b.scored_at).getTime() - new Date(a.scored_at).getTime());
        const latestScore = initScores[0];
        return (
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.75rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "var(--zelis-purple)",
                  margin: 0,
                }}
              >
                Capital Allocation Scores
              </h3>
              {latestScore?.recommendation && (
                <ScoreBadge
                  recommendation={latestScore.recommendation}
                  score={latestScore.weighted_score}
                  size="md"
                />
              )}
            </div>
            <ScoreHistory scores={initScores} />
          </div>
        );
      })()}

      {/* Gate Review History */}
      <div>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 800,
            color: "var(--zelis-purple)",
            marginBottom: "0.75rem",
          }}
        >
          Gate Review History
        </h3>
        {reviews.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--zelis-medium-gray)",
              fontSize: "0.88rem",
              background: "white",
              borderRadius: "10px",
              border: "1px solid var(--zelis-ice)",
            }}
          >
            No gate reviews recorded yet.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {reviews.map((review) => {
              const dcfg = DECISION_CONFIG[review.decision];
              const phase = sorted.find((p) => p.id === review.phase_id);

              return (
                <div
                  key={review.id}
                  style={{
                    padding: "1.15rem 1.5rem",
                    background: "white",
                    borderRadius: "10px",
                    borderWidth: "1px 1px 1px 4px",
                    borderStyle: "solid",
                    borderColor: `var(--zelis-ice) var(--zelis-ice) var(--zelis-ice) ${dcfg.color}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "0.92rem",
                          color: "var(--zelis-dark-gray)",
                        }}
                      >
                        {review.gate_name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--zelis-blue-purple)",
                          marginTop: "0.1rem",
                        }}
                      >
                        {phase?.label ?? "—"} &middot;{" "}
                        {formatDate(review.review_date)}
                      </div>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: dcfg.color,
                        background: dcfg.bg,
                        border: `1px solid ${dcfg.color}20`,
                      }}
                    >
                      {dcfg.icon} {dcfg.label}
                    </span>
                  </div>
                  {(review.conditions || review.notes) && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.82rem",
                        color: "#666",
                        lineHeight: 1.5,
                      }}
                    >
                      {review.conditions && (
                        <div>
                          <strong>Conditions:</strong> {review.conditions}
                        </div>
                      )}
                      {review.notes && (
                        <div>
                          <strong>Notes:</strong> {review.notes}
                        </div>
                      )}
                    </div>
                  )}
                  {review.reviewers && review.reviewers.length > 0 && (
                    <div
                      style={{
                        marginTop: "0.4rem",
                        fontSize: "0.72rem",
                        color: "var(--zelis-medium-gray)",
                      }}
                    >
                      Reviewed by: {review.reviewers.join(", ")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showGraduationForm && (
        <GraduationForm
          initiative={initiative}
          onClose={() => setShowGraduationForm(false)}
        />
      )}

      {showGateForm && (
        <GateReviewForm
          initiative={initiative}
          phases={phases}
          onClose={() => setShowGateForm(false)}
        />
      )}

      {showEditForm && (
        <InitiativeForm
          initiative={initiative}
          phases={phases}
          nextId={nextId}
          onClose={() => setShowEditForm(false)}
        />
      )}

      <ConfirmDialog
        open={deleteTarget}
        title="Delete Initiative?"
        message={`This will permanently delete "${initiative.name}" and all its gate reviews.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(false)}
      />
    </div>
  );
}
