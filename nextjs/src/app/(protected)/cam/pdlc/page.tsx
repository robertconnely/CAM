import { createClient } from "@/lib/supabase/server";
import { PdlcPipeline } from "@/components/tracker/PdlcPipeline";
import { GlossaryText } from "@/components/ui/GlossaryText";
import type { PdlcPhase } from "@/lib/types/database";

export const metadata = {
  title: "PDLC Framework — CAM",
};

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

export default async function PdlcFrameworkPage() {
  const supabase = await createClient();

  const { data: phasesData, error } = await supabase
    .from("pdlc_phases")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error("Failed to load PDLC framework data. Please try again.");
  }

  const phases = (phasesData ?? []) as PdlcPhase[];

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 1100 }}>
      {/* Hero */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "var(--zelis-purple, #321478)",
          }}
        >
          Product Development Lifecycle Framework
        </h1>
        <p
          style={{
            margin: "0.25rem 0 0",
            fontSize: "0.85rem",
            color: "var(--zelis-medium-gray, #888)",
            fontWeight: 500,
          }}
        >
          Our 8-phase stage-gated framework for turning business ideas into
          products that win at scale.
        </p>
      </div>

      {/* Phase Pipeline Visualization */}
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

      {/* Phase Deep Dive */}
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
          What happens at each stage, what the gate criteria are, and why it
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

      {/* Governance Tiers */}
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

      {/* CTA Banner */}
      <div
        style={{
          padding: "1.5rem",
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
            Stage Gate Tracker
          </h3>
          <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.85 }}>
            Track initiatives through the PDLC pipeline — manage gates, record
            reviews, and monitor progress.
          </p>
        </div>
        <a
          href="/pdlc/tracker"
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
          Open Tracker &rarr;
        </a>
      </div>
    </div>
  );
}
