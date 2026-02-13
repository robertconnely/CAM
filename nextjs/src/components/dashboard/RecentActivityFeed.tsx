"use client";

import type {
  Initiative,
  GateReview,
  CapitalScore,
  PdlcPhase,
  GateDecision,
  CapitalRecommendation,
} from "@/lib/types/database";

interface RecentActivityFeedProps {
  initiatives: Initiative[];
  gateReviews: GateReview[];
  capitalScores: CapitalScore[];
  phases: PdlcPhase[];
}

interface ActivityItem {
  id: string;
  type: "gate_review" | "initiative_created" | "capital_score";
  title: string;
  subtitle: string;
  date: Date;
  color: string;
  iconLabel: string;
}

const DECISION_DISPLAY: Record<
  GateDecision,
  { label: string; color: string; icon: string }
> = {
  go: { label: "GO", color: "#2e7d32", icon: "G" },
  no_go: { label: "NO GO", color: "#c62828", icon: "X" },
  pivot: { label: "PIVOT", color: "#e67e00", icon: "P" },
  park: { label: "PARK", color: "#797279", icon: "H" },
};

const REC_DISPLAY: Record<
  CapitalRecommendation,
  { label: string; color: string }
> = {
  strong_go: { label: "STRONG GO", color: "#1b5e20" },
  go: { label: "GO", color: "#2e7d32" },
  consider: { label: "CONSIDER", color: "#e65100" },
  hold: { label: "HOLD", color: "#b71c1c" },
};

function buildActivityFeed(
  initiatives: Initiative[],
  gateReviews: GateReview[],
  capitalScores: CapitalScore[],
  phases: PdlcPhase[]
): ActivityItem[] {
  const items: ActivityItem[] = [];
  const initMap = new Map(initiatives.map((i) => [i.id, i]));

  for (const review of gateReviews.slice(0, 15)) {
    const init = initMap.get(review.initiative_id);
    const phase = phases.find((p) => p.id === review.phase_id);
    const d = DECISION_DISPLAY[review.decision];
    items.push({
      id: `gate-${review.id}`,
      type: "gate_review",
      title: `Gate Review: ${d.label}`,
      subtitle: `${init?.name ?? "Unknown"} — ${phase?.label ?? ""}`,
      date: new Date(review.review_date),
      color: d.color,
      iconLabel: d.icon,
    });
  }

  for (const score of capitalScores.slice(0, 15)) {
    const init = initMap.get(score.initiative_id);
    const rec = score.recommendation
      ? REC_DISPLAY[score.recommendation]
      : null;
    items.push({
      id: `score-${score.id}`,
      type: "capital_score",
      title: `Capital Score: ${rec?.label ?? "Scored"}`,
      subtitle: `${init?.name ?? "Unknown"} — Weighted: ${score.weighted_score?.toFixed(1) ?? "—"}`,
      date: new Date(score.scored_at),
      color: rec?.color ?? "#5F5FC3",
      iconLabel: "$",
    });
  }

  // Newest initiatives
  const sortedInits = [...initiatives].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  for (const init of sortedInits.slice(0, 8)) {
    items.push({
      id: `init-${init.id}`,
      type: "initiative_created",
      title: `New Initiative: ${init.initiative_id}`,
      subtitle: init.name,
      date: new Date(init.created_at),
      color: "#321478",
      iconLabel: "+",
    });
  }

  return items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);
}

export function RecentActivityFeed({
  initiatives,
  gateReviews,
  capitalScores,
  phases,
}: RecentActivityFeedProps) {
  const activities = buildActivityFeed(
    initiatives,
    gateReviews,
    capitalScores,
    phases
  );

  if (activities.length === 0) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "var(--zelis-medium-gray)",
          fontSize: "0.85rem",
          fontWeight: 500,
        }}
      >
        No recent activity yet. Create an initiative to get started.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {activities.map((item, i) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            gap: "0.75rem",
            paddingBottom: "1rem",
            position: "relative",
          }}
        >
          {/* Timeline connector */}
          {i < activities.length - 1 && (
            <div
              style={{
                position: "absolute",
                left: 13,
                top: 28,
                bottom: 0,
                width: 2,
                background: "var(--zelis-ice)",
              }}
            />
          )}
          {/* Dot */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: item.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "white",
              fontSize: "0.68rem",
              fontWeight: 800,
            }}
          >
            {item.iconLabel}
          </div>
          {/* Content */}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.82rem",
                color: "var(--zelis-dark, #23004B)",
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--zelis-medium-gray, #797279)",
                lineHeight: 1.4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.subtitle}
            </div>
            <div
              style={{
                fontSize: "0.68rem",
                color: "var(--zelis-warm-gray, #B4B4B9)",
                marginTop: "0.15rem",
              }}
            >
              {item.date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
