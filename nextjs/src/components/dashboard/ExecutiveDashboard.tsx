"use client";

import type {
  Initiative,
  GateReview,
  PdlcPhase,
  CapitalScore,
  UserRole,
} from "@/lib/types/database";
import { KpiStatsBar } from "./KpiStatsBar";
import { RoicValueDriverTree } from "./roic-tree/RoicValueDriverTree";
import { PipelineKanban } from "./PipelineKanban";
import { QuickActions } from "./QuickActions";
import { RecentActivityFeed } from "./RecentActivityFeed";

interface ExecutiveDashboardProps {
  initiatives: Initiative[];
  gateReviews: GateReview[];
  phases: PdlcPhase[];
  capitalScores: CapitalScore[];
  role: UserRole | null;
}

export function ExecutiveDashboard({
  initiatives,
  gateReviews,
  phases,
  capitalScores,
  role,
}: ExecutiveDashboardProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Hero — clean, no competing gradient */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          borderBottom: "3px solid var(--zelis-gold)",
          paddingBottom: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "var(--zelis-purple)",
              lineHeight: 1.2,
            }}
          >
            Product Operating System
          </h1>
          <p
            style={{
              margin: "0.25rem 0 0",
              fontSize: "0.92rem",
              fontWeight: 500,
              color: "var(--zelis-blue-purple)",
            }}
          >
            Price Optimization Business Unit — Initiative Pipeline &amp; Value
            Driver Dashboard
          </p>
        </div>
        <div
          style={{
            fontSize: "0.78rem",
            color: "var(--zelis-medium-gray)",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {today}
        </div>
      </div>

      {/* KPI Stats */}
      <KpiStatsBar initiatives={initiatives} capitalScores={capitalScores} />

      {/* ROIC Tree — full width */}
      <div className="dashboard-section">
        <RoicValueDriverTree
          initiatives={initiatives}
          capitalScores={capitalScores}
        />
      </div>

      {/* Pipeline — full width */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h3 className="dashboard-section-title">Initiative Pipeline</h3>
            <p
              style={{
                margin: "0.2rem 0 0",
                fontSize: "0.75rem",
                color: "var(--zelis-medium-gray)",
                fontWeight: 500,
              }}
            >
              Initiatives by PDLC phase
            </p>
          </div>
        </div>
        <PipelineKanban initiatives={initiatives} phases={phases} />
      </div>

      {/* Two-column: Quick Actions + Activity Feed */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h3 className="dashboard-section-title">Quick Actions</h3>
          </div>
          <QuickActions role={role} />
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h3 className="dashboard-section-title">Recent Activity</h3>
          </div>
          <RecentActivityFeed
            initiatives={initiatives}
            gateReviews={gateReviews}
            capitalScores={capitalScores}
            phases={phases}
          />
        </div>
      </div>
    </div>
  );
}
