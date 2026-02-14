import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PdlcPipeline } from "@/components/tracker/PdlcPipeline";
import { GlossaryText } from "@/components/ui/GlossaryText";
import type { PdlcPhase } from "@/lib/types/database";

export const metadata = {
  title: "How It Works — CAM",
};

/* ─── Data ─── */

const STAGES = [
  {
    number: 1,
    label: "Case",
    macro: "Propose",
    color: "#321478",
    description:
      "Propose, evaluate, and score a business justification — the first two steps of the PDLC Strategy stage",
    bullets: [
      "AI Chat Wizard builds the business case with assumptions",
      "Financial model generates NPV, IRR, and cash flow projections",
      "Capital Scoring Wizard evaluates strategic fit and risk as the approval gate",
      "Only approved cases (Strong Go / Go) become active initiatives",
    ],
    metrics: ["NPV", "IRR", "Payback Period", "Contribution Margin", "Capital Score"],
    linkLabel: "Start a New Case",
    linkHref: "/cam/new?fresh=1",
  },
  {
    number: 2,
    label: "Initiative",
    macro: "Execute",
    color: "#5F5FC3",
    description:
      "An approved case becomes an active initiative moving through the 8-phase PDLC",
    bullets: [
      "8 phases from Ideation through Launch and Optimize & Support",
      "Gate reviews at each phase transition with documented criteria",
      "Status tracking — On Track, At Risk, or Blocked",
      "Governance tier (1-4) determines rigor and approval levels",
    ],
    metrics: [
      "Phase Progress",
      "Gate Status",
      "Governance Tier",
      "Target Launch",
    ],
    linkLabel: "View Pipeline",
    linkHref: "/cam/pipeline",
  },
  {
    number: 3,
    label: "Product",
    macro: "Operate",
    color: "#320FFF",
    description:
      "A launched initiative graduates to the portfolio as a live market offering",
    bullets: [
      "Track health metrics across the full product life cycle",
      "4 PLC stages: Introduction, Growth, Maturity, Decline",
      "Monitor revenue, retention, NPS, and market share over time",
      "One product may contain multiple initiatives (features, enhancements)",
    ],
    metrics: ["ARR", "NPS", "Retention Rate", "Market Share"],
    linkLabel: "View Portfolio",
    linkHref: "/cam/portfolio",
  },
];

const TRANSITIONS = [
  {
    label: "Approved via Capital Scoring",
    from: "Case",
    to: "Initiative",
  },
  {
    label: "Launched & graduated from PDLC",
    from: "Initiative",
    to: "Product",
  },
];

const NODE_COLORS = [
  "#321478",
  "#41329B",
  "#5F5FC3",
  "#320FFF",
  "#828CE1",
  "#23004B",
  "#E61E2D",
  "#FFBE00",
];

const GOVERNANCE_TIERS = [
  {
    tier: "Tier 1",
    title: "Strategic Initiative",
    criteria: ">$500K investment, >$1M ARR impact",
    approval: "President + Board approval",
    framework: "Full 8-phase PDLC with all gates",
    timeline: "6-12 months",
    color: "#321478",
    bg: "#ECE9FF",
  },
  {
    tier: "Tier 2",
    title: "Major Enhancement",
    criteria: "$100K-$500K investment, $250K-$1M ARR",
    approval: "President approval at Phase 2",
    framework: "Full PDLC with streamlined Ideation",
    timeline: "3-6 months",
    color: "#5F5FC3",
    bg: "#F7F6FF",
  },
  {
    tier: "Tier 3",
    title: "Standard Feature",
    criteria: "<$100K investment, <$250K ARR",
    approval: "Product Director approval",
    framework: "Expedited 3-phase (Define, Build, Launch)",
    timeline: "4-10 weeks",
    color: "#41329B",
    bg: "#F7F6FF",
  },
  {
    tier: "Tier 4",
    title: "Expedited Fix",
    criteria: "Minimal investment",
    approval: "Product Manager approval",
    framework: "Kanban workflow",
    timeline: "1-3 weeks",
    color: "#B4B4B9",
    bg: "#F0F0F1",
  },
];

/* Unified graphic: lifecycle stage → PDLC phase mapping */
const LIFECYCLE_MAP = [
  {
    stage: "Case",
    macro: "Strategy",
    color: "#321478",
    phases: [
      { num: 1, label: "Ideation" },
      { num: 2, label: "Business Validation" },
    ],
  },
  {
    stage: "Initiative",
    macro: "Build → Prepare",
    color: "#5F5FC3",
    phases: [
      { num: 3, label: "Product Requirements" },
      { num: 4, label: "Design & Development" },
      { num: 5, label: "Marketing Strategy" },
      { num: 6, label: "UAT & QA/QC Testing" },
    ],
  },
  {
    stage: "Product",
    macro: "Launch → Operate",
    color: "#320FFF",
    phases: [
      { num: 7, label: "Launch" },
      { num: 8, label: "Optimize & Support" },
    ],
  },
];

/* ─── Component ─── */

export default async function OverviewPage() {
  const supabase = await createClient();

  const { data: phasesData } = await supabase
    .from("pdlc_phases")
    .select("*")
    .order("display_order", { ascending: true });

  const phases = (phasesData ?? []) as PdlcPhase[];

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 1100 }}>
      {/* ═══════════════════════════════════════════
          SECTION 1: Hero
         ═══════════════════════════════════════════ */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "var(--zelis-purple, #321478)",
          }}
        >
          How It Works
        </h1>
        <p
          style={{
            margin: "0.25rem 0 0",
            fontSize: "0.85rem",
            color: "var(--zelis-medium-gray, #888)",
            fontWeight: 500,
          }}
        >
          Every product begins as a Case, earns approval through Capital
          Scoring, executes as an Initiative, and operates as a Product in
          market.
        </p>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 2: 3-Stage Flow Visualization
         ═══════════════════════════════════════════ */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "2.5rem 2rem",
          boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.07)",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
            position: "relative",
          }}
        >
          {STAGES.map((stage, i) => (
            <div
              key={stage.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
              }}
            >
              {/* Stage Node */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  minWidth: 120,
                }}
              >
                {/* Macro label */}
                <div
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    color: stage.color,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    background: `${stage.color}10`,
                    padding: "0.15rem 0.5rem",
                    borderRadius: 4,
                  }}
                >
                  {stage.macro}
                </div>

                {/* Circle */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: stage.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "#fff",
                    fontFamily: "'Nunito Sans', sans-serif",
                    boxShadow: `0 4px 16px ${stage.color}30`,
                  }}
                >
                  {stage.number}
                </div>

                {/* Label */}
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "var(--zelis-dark, #23004B)",
                  }}
                >
                  {stage.label}
                </div>
              </div>

              {/* Connector Arrow */}
              {i < STAGES.length - 1 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.35rem",
                    margin: "0 1.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {/* Arrow line */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 3,
                        background: `linear-gradient(90deg, ${STAGES[i].color}, ${STAGES[i + 1].color})`,
                        borderRadius: 2,
                      }}
                    />
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderTop: "6px solid transparent",
                        borderBottom: "6px solid transparent",
                        borderLeft: `8px solid ${STAGES[i + 1].color}`,
                      }}
                    />
                  </div>
                  {/* Transition label */}
                  <div
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      color: "var(--zelis-medium-gray, #888)",
                      textAlign: "center",
                      maxWidth: 110,
                      lineHeight: 1.3,
                    }}
                  >
                    {TRANSITIONS[i].label}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 3: Stage Detail Cards
         ═══════════════════════════════════════════ */}
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            margin: "0 0 0.25rem",
            fontSize: "1.15rem",
            fontWeight: 800,
            color: "var(--zelis-purple, #321478)",
          }}
        >
          The Three Stages
        </h2>
        <p
          style={{
            margin: "0 0 1.25rem",
            fontSize: "0.82rem",
            color: "var(--zelis-medium-gray, #888)",
            fontWeight: 500,
          }}
        >
          What happens at each stage, what gets measured, and where to go in the
          platform.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1rem",
          }}
        >
          {STAGES.map((stage) => (
            <div
              key={stage.label}
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: "1.25rem 1.25rem 1.25rem 1.5rem",
                borderLeft: `4px solid ${stage.color}`,
                boxShadow: "0 2px 12px rgba(130, 140, 225, 0.06)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  marginBottom: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: stage.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    color: "#fff",
                    flexShrink: 0,
                    fontFamily: "'Nunito Sans', sans-serif",
                  }}
                >
                  {stage.number}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.98rem",
                      fontWeight: 800,
                      color: "var(--zelis-dark, #23004B)",
                      lineHeight: 1.3,
                    }}
                  >
                    {stage.label}
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: stage.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {stage.macro}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p
                style={{
                  margin: "0 0 0.75rem",
                  fontSize: "0.8rem",
                  color: "var(--zelis-dark-gray, #555)",
                  lineHeight: 1.6,
                }}
              >
                {stage.description}
              </p>

              {/* Bullets */}
              <ul
                style={{
                  margin: "0 0 0.75rem",
                  paddingLeft: "1.1rem",
                  fontSize: "0.78rem",
                  color: "var(--zelis-dark-gray, #555)",
                  lineHeight: 1.7,
                  flex: 1,
                }}
              >
                {stage.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              {/* Metrics */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.35rem",
                  marginBottom: "0.75rem",
                }}
              >
                {stage.metrics.map((m) => (
                  <span
                    key={m}
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: stage.color,
                      background: `${stage.color}10`,
                      padding: "0.2rem 0.5rem",
                      borderRadius: 4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>

              {/* Link */}
              <Link
                href={stage.linkHref}
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: stage.color,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                {stage.linkLabel} &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 4: PDLC Pipeline Graphic
         ═══════════════════════════════════════════ */}
      <div style={{ marginBottom: "0.5rem" }}>
        <h2
          style={{
            margin: "0 0 0.25rem",
            fontSize: "1.15rem",
            fontWeight: 800,
            color: "var(--zelis-purple, #321478)",
          }}
        >
          Product Development Lifecycle (PDLC)
        </h2>
        <p
          style={{
            margin: "0 0 1.25rem",
            fontSize: "0.82rem",
            color: "var(--zelis-medium-gray, #888)",
            fontWeight: 500,
          }}
        >
          Our 8-phase stage-gated framework for turning business ideas into
          products that win at scale.
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "2rem 2rem 1.5rem",
          boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.07)",
          marginBottom: "2rem",
        }}
      >
        <PdlcPipeline phases={phases} />
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 5: Phase Deep Dive Cards
         ═══════════════════════════════════════════ */}
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            margin: "0 0 0.25rem",
            fontSize: "1.15rem",
            fontWeight: 800,
            color: "var(--zelis-purple, #321478)",
          }}
        >
          Phase Deep Dive
        </h2>
        <p
          style={{
            margin: "0 0 1.25rem",
            fontSize: "0.82rem",
            color: "var(--zelis-medium-gray, #888)",
            fontWeight: 500,
          }}
        >
          What happens at each phase, what the gate criteria are, and why it
          matters.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
            gap: "1rem",
          }}
        >
          {phases.map((phase, i) => (
            <div
              key={phase.id}
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: "1.25rem 1.25rem 1.25rem 1.5rem",
                borderLeft: `4px solid ${NODE_COLORS[i]}`,
                boxShadow: "0 2px 12px rgba(130, 140, 225, 0.06)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  marginBottom: "0.6rem",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: NODE_COLORS[i],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    color: "#fff",
                    flexShrink: 0,
                    fontFamily: "'Nunito Sans', sans-serif",
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.98rem",
                      fontWeight: 800,
                      color: "var(--zelis-dark, #23004B)",
                      lineHeight: 1.3,
                    }}
                  >
                    {phase.label}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: NODE_COLORS[i],
                    background: `${NODE_COLORS[i]}10`,
                    padding: "0.2rem 0.5rem",
                    borderRadius: 4,
                    whiteSpace: "nowrap",
                  }}
                >
                  {phase.typical_duration}
                </div>
              </div>

              {/* Description */}
              <p
                style={{
                  margin: "0 0 0.75rem",
                  fontSize: "0.8rem",
                  color: "var(--zelis-dark-gray, #555)",
                  lineHeight: 1.6,
                }}
              >
                <GlossaryText>{phase.description ?? ""}</GlossaryText>
              </p>

              {/* Gate Criteria */}
              <div
                style={{
                  padding: "0.6rem 0.75rem",
                  background: "var(--zelis-ice, #ECE9FF)",
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    color: NODE_COLORS[i],
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.2rem",
                  }}
                >
                  Gate Criteria
                </div>
                <div
                  style={{
                    fontSize: "0.76rem",
                    color: "var(--zelis-dark-gray, #555)",
                    lineHeight: 1.45,
                  }}
                >
                  {phase.gate_description || "\u2014"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 6: Governance Tiers
         ═══════════════════════════════════════════ */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "1.75rem",
          boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.07)",
          marginBottom: "2rem",
        }}
      >
        <h2
          style={{
            margin: "0 0 0.25rem",
            fontSize: "1.15rem",
            fontWeight: 800,
            color: "var(--zelis-purple, #321478)",
          }}
        >
          Governance & Decision Rights
        </h2>
        <p
          style={{
            margin: "0 0 1.25rem",
            fontSize: "0.82rem",
            color: "var(--zelis-medium-gray, #888)",
            fontWeight: 500,
          }}
        >
          Initiative size determines the governance tier and level of PDLC rigor
          applied.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1rem",
          }}
        >
          {GOVERNANCE_TIERS.map((tier) => (
            <div
              key={tier.tier}
              style={{
                padding: "1.25rem",
                borderRadius: 10,
                background: tier.bg,
                border: `1.5px solid ${tier.color}20`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    color: "#fff",
                    background: tier.color,
                    padding: "0.15rem 0.45rem",
                    borderRadius: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {tier.tier}
                </span>
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 800,
                    color: tier.color,
                  }}
                >
                  {tier.title}
                </span>
              </div>
              {[
                { label: "Criteria", value: tier.criteria },
                { label: "Approval", value: tier.approval },
                { label: "Framework", value: tier.framework },
                { label: "Timeline", value: tier.timeline },
              ].map((row) => (
                <div key={row.label} style={{ marginBottom: "0.4rem" }}>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: tier.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {row.label}
                  </span>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--zelis-dark-gray, #555)",
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 7: Unified Lifecycle Map
         ═══════════════════════════════════════════ */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "2rem 2rem 1.75rem",
          boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.07)",
          marginBottom: "2rem",
        }}
      >
        <h2
          style={{
            margin: "0 0 0.25rem",
            fontSize: "1.15rem",
            fontWeight: 800,
            color: "var(--zelis-purple, #321478)",
            textAlign: "center",
          }}
        >
          The Complete System
        </h2>
        <p
          style={{
            margin: "0 0 2rem",
            fontSize: "0.82rem",
            color: "var(--zelis-medium-gray, #888)",
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          How the three lifecycle stages map onto the 8 PDLC phases.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {LIFECYCLE_MAP.map((group, gi) => (
            <div key={group.stage}>
              {/* Stage header band */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: group.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                    fontWeight: 800,
                    color: "#fff",
                    flexShrink: 0,
                    fontFamily: "'Nunito Sans', sans-serif",
                    boxShadow: `0 3px 12px ${group.color}30`,
                  }}
                >
                  {gi + 1}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: 800,
                      color: "var(--zelis-dark, #23004B)",
                    }}
                  >
                    {group.stage}
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: group.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {group.macro}
                  </div>
                </div>
                {/* Horizontal line */}
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    background: `linear-gradient(90deg, ${group.color}, ${group.color}30)`,
                    borderRadius: 1,
                  }}
                />
              </div>

              {/* Phase chips */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  paddingLeft: "3.25rem",
                }}
              >
                {group.phases.map((phase) => (
                  <div
                    key={phase.num}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.85rem",
                      borderRadius: 8,
                      background: `${group.color}08`,
                      border: `1.5px solid ${group.color}20`,
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: `2px solid ${group.color}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        color: group.color,
                        flexShrink: 0,
                        fontFamily: "'Nunito Sans', sans-serif",
                      }}
                    >
                      {phase.num}
                    </div>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "var(--zelis-dark, #23004B)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {phase.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Connector between groups */}
              {gi < LIFECYCLE_MAP.length - 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.75rem 0 0.25rem",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 5v14M7 14l5 5 5-5"
                      stroke={LIFECYCLE_MAP[gi + 1].color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 8: CTA Banner
         ═══════════════════════════════════════════ */}
      <div
        style={{
          padding: "1.5rem 2rem",
          borderRadius: 12,
          background:
            "linear-gradient(135deg, #23004B 0%, #321478 40%, #41329B 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3
            style={{
              margin: "0 0 0.25rem",
              fontSize: "1.1rem",
              fontWeight: 800,
            }}
          >
            Ready to propose a new investment?
          </h3>
          <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.85 }}>
            Start with a Case — the AI wizard will help you build the business
            justification and financial model.
          </p>
        </div>
        <Link
          href="/cam/new?fresh=1"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.65rem 1.5rem",
            borderRadius: 10,
            background: "var(--zelis-gold, #FFBE00)",
            color: "var(--zelis-dark, #23004B)",
            fontWeight: 800,
            fontSize: "0.88rem",
            textDecoration: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 10px rgba(255, 192, 0, 0.3)",
          }}
        >
          Start a New Case &rarr;
        </Link>
      </div>
    </div>
  );
}
