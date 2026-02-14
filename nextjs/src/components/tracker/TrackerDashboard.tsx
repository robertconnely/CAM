"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ToastProvider } from "@/components/admin/Toast";
import type {
  Initiative,
  GateReview,
  PdlcPhase,
  CapitalScore,
  UserRole,
  InitiativeStatus,
  GovernanceTier,
} from "@/lib/types/database";
import { TrackerStats } from "./TrackerStats";
import { InitiativeList } from "./InitiativeList";
import { InitiativeDetail } from "./InitiativeDetail";
import { InitiativeForm } from "./InitiativeForm";
import { GateReviewForm } from "./GateReviewForm";
import { STATUS_CONFIG, TIER_CONFIG, VALUE_DRIVER_OPTIONS } from "./constants";

interface TrackerDashboardProps {
  initiatives: Initiative[];
  gateReviews: GateReview[];
  phases: PdlcPhase[];
  capitalScores: CapitalScore[];
  role: UserRole | null;
}

type FilterStatus = InitiativeStatus | "all";
type FilterTier = GovernanceTier | "all";

const filterBtnBase: React.CSSProperties = {
  padding: "0.35rem 0.85rem",
  borderRadius: "999px",
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: "var(--zelis-ice)",
  background: "white",
  cursor: "pointer",
  fontSize: "0.78rem",
  fontWeight: 600,
  fontFamily: "inherit",
  transition: "all 0.2s",
  whiteSpace: "nowrap",
};

const filterBtnActive: React.CSSProperties = {
  ...filterBtnBase,
  background: "var(--zelis-purple)",
  color: "white",
  borderColor: "var(--zelis-purple)",
};

const searchInputStyle: React.CSSProperties = {
  padding: "0.5rem 1rem 0.5rem 2.25rem",
  borderRadius: "999px",
  border: "2px solid var(--zelis-ice)",
  fontSize: "0.85rem",
  fontFamily: "inherit",
  outline: "none",
  width: "100%",
  maxWidth: 320,
  background: "white",
  transition: "border-color 0.2s",
};

function TrackerDashboardInner({
  initiatives,
  gateReviews,
  phases,
  capitalScores,
  role,
}: TrackerDashboardProps) {
  const [selectedInitiative, setSelectedInitiative] =
    useState<Initiative | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Initiative | null>(null);
  const [gateTarget, setGateTarget] = useState<Initiative | null>(null);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterTier, setFilterTier] = useState<FilterTier>("all");
  const [filterPhase, setFilterPhase] = useState<string>("all");
  const [filterDriver, setFilterDriver] = useState<string>("all");
  const [search, setSearch] = useState("");

  const canEdit = role === "admin" || role === "editor";
  const sorted = [...phases].sort((a, b) => a.display_order - b.display_order);

  const nextId = useMemo(() => {
    const nums = initiatives.map((i) => {
      const m = i.initiative_id.match(/(\d+)/);
      return m ? parseInt(m[1]) : 0;
    });
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `PDLC-${String(max + 1).padStart(3, "0")}`;
  }, [initiatives]);

  const filtered = useMemo(() => {
    let result = [...initiatives];
    if (filterStatus !== "all") {
      result = result.filter((i) => i.status === filterStatus);
    }
    if (filterTier !== "all") {
      result = result.filter((i) => i.tier === filterTier);
    }
    if (filterPhase !== "all") {
      result = result.filter((i) => i.current_phase_id === filterPhase);
    }
    if (filterDriver !== "all") {
      result = result.filter(
        (i) => i.value_driver_ids && i.value_driver_ids.includes(filterDriver)
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.initiative_id.toLowerCase().includes(q) ||
          (i.owner_name && i.owner_name.toLowerCase().includes(q))
      );
    }
    // Sort: priority_rank (ascending, nulls last), then by initiative_id
    result.sort((a, b) => {
      if (a.priority_rank != null && b.priority_rank != null)
        return a.priority_rank - b.priority_rank;
      if (a.priority_rank != null) return -1;
      if (b.priority_rank != null) return 1;
      return a.initiative_id.localeCompare(b.initiative_id);
    });
    return result;
  }, [initiatives, filterStatus, filterTier, filterPhase, filterDriver, search]);

  // If viewing a specific initiative
  if (selectedInitiative) {
    // Refresh from latest data
    const current = initiatives.find((i) => i.id === selectedInitiative.id);
    if (!current) {
      setSelectedInitiative(null);
      return null;
    }
    return (
      <InitiativeDetail
        initiative={current}
        gateReviews={gateReviews}
        capitalScores={capitalScores}
        phases={phases}
        allInitiatives={initiatives}
        role={role}
        onBack={() => setSelectedInitiative(null)}
      />
    );
  }

  return (
    <div>
      {/* Stats */}
      <TrackerStats initiatives={initiatives} />

      {/* Toolbar */}
      <div
        style={{
          marginTop: "1.5rem",
          marginBottom: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {/* Search + Create */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
            <span
              style={{
                position: "absolute",
                left: "0.85rem",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.85rem",
                color: "var(--zelis-medium-gray)",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search initiatives..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchInputStyle}
            />
          </div>
          {canEdit && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link
                href="/cam/tracker/capital"
                style={{
                  padding: "0.55rem 1.25rem",
                  borderRadius: "10px",
                  borderWidth: "2px",
                  borderStyle: "solid",
                  borderColor: "var(--zelis-gold)",
                  background: "#fffbe6",
                  color: "var(--zelis-purple)",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  transition: "all 0.15s",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="8" width="2.5" height="5" rx="0.5" fill="var(--zelis-purple)" opacity="0.5" />
                  <rect x="4.5" y="5.5" width="2.5" height="7.5" rx="0.5" fill="var(--zelis-purple)" opacity="0.7" />
                  <rect x="8" y="3" width="2.5" height="10" rx="0.5" fill="var(--zelis-purple)" opacity="0.85" />
                  <rect x="11.5" y="1" width="2.5" height="12" rx="0.5" fill="var(--zelis-purple)" />
                </svg>
                Capital Scoring
              </Link>
              <button
                onClick={() => setShowCreateForm(true)}
                style={{
                  padding: "0.55rem 1.25rem",
                  borderRadius: "10px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, var(--zelis-purple) 0%, var(--zelis-blue-purple) 100%)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  fontFamily: "inherit",
                  boxShadow: "0 2px 10px rgba(50, 20, 120, 0.3)",
                  whiteSpace: "nowrap",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(50, 20, 120, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow =
                    "0 2px 10px rgba(50, 20, 120, 0.3)";
                }}
              >
                + New Initiative
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--zelis-blue-purple)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Status:
          </span>
          <button
            style={filterStatus === "all" ? filterBtnActive : filterBtnBase}
            onClick={() => setFilterStatus("all")}
          >
            All
          </button>
          {(Object.keys(STATUS_CONFIG) as InitiativeStatus[]).map((s) => (
            <button
              key={s}
              style={
                filterStatus === s
                  ? { ...filterBtnActive, background: STATUS_CONFIG[s].color, borderColor: STATUS_CONFIG[s].color }
                  : filterBtnBase
              }
              onClick={() => setFilterStatus(s)}
            >
              {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
            </button>
          ))}

          <span
            style={{
              width: "1px",
              height: "1.2rem",
              background: "var(--zelis-medium-gray)",
              margin: "0 0.5rem",
            }}
          />

          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--zelis-blue-purple)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Tier:
          </span>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value as FilterTier)}
            style={{
              ...filterBtnBase,
              appearance: "auto",
              paddingRight: "0.5rem",
            }}
          >
            <option value="all">All Tiers</option>
            {(Object.keys(TIER_CONFIG) as GovernanceTier[]).map((t) => (
              <option key={t} value={t}>
                {TIER_CONFIG[t].label}
              </option>
            ))}
          </select>

          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--zelis-blue-purple)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Phase:
          </span>
          <select
            value={filterPhase}
            onChange={(e) => setFilterPhase(e.target.value)}
            style={{
              ...filterBtnBase,
              appearance: "auto",
              paddingRight: "0.5rem",
            }}
          >
            <option value="all">All Phases</option>
            {sorted.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display_order}. {p.label}
              </option>
            ))}
          </select>

          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--zelis-blue-purple)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Driver:
          </span>
          <select
            value={filterDriver}
            onChange={(e) => setFilterDriver(e.target.value)}
            style={{
              ...filterBtnBase,
              appearance: "auto",
              paddingRight: "0.5rem",
            }}
          >
            <option value="all">All Drivers</option>
            {VALUE_DRIVER_OPTIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.shortLabel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div
        style={{
          fontSize: "0.78rem",
          color: "var(--zelis-medium-gray)",
          fontWeight: 600,
          marginBottom: "0.5rem",
        }}
      >
        {filtered.length === initiatives.length
          ? `${initiatives.length} initiative${initiatives.length !== 1 ? "s" : ""}`
          : `${filtered.length} of ${initiatives.length} initiatives`}
      </div>

      {/* Initiative list */}
      <InitiativeList
        initiatives={filtered}
        phases={phases}
        capitalScores={capitalScores}
        role={role}
        onSelect={(i) => setSelectedInitiative(i)}
        onEdit={(i) => setEditTarget(i)}
        onGateReview={(i) => setGateTarget(i)}
      />

      {/* Modals */}
      {showCreateForm && (
        <InitiativeForm
          phases={phases}
          nextId={nextId}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {editTarget && (
        <InitiativeForm
          initiative={editTarget}
          phases={phases}
          nextId={nextId}
          onClose={() => setEditTarget(null)}
        />
      )}

      {gateTarget && (
        <GateReviewForm
          initiative={gateTarget}
          phases={phases}
          onClose={() => setGateTarget(null)}
        />
      )}
    </div>
  );
}

export function TrackerDashboard(props: TrackerDashboardProps) {
  return (
    <ToastProvider>
      <TrackerDashboardInner {...props} />
    </ToastProvider>
  );
}
