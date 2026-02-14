import Link from "next/link";

export const metadata = {
  title: "How It Works — CAM",
};

const STAGES = [
  {
    number: 1,
    label: "Case",
    macro: "Propose",
    color: "#321478",
    description: "Build and evaluate a business justification for investment",
    bullets: [
      "AI Chat Wizard builds the business case with assumptions",
      "Financial model generates NPV, IRR, and cash flow projections",
      "Capital Scoring Wizard evaluates strategic fit and risk",
      "Investment memo summarizes the recommendation",
    ],
    metrics: ["NPV", "IRR", "Payback Period", "Contribution Margin"],
    linkLabel: "Start a New Case",
    linkHref: "/cam/new?fresh=1",
  },
  {
    number: 2,
    label: "Initiative",
    macro: "Execute",
    color: "#5F5FC3",
    description:
      "An approved case becomes an active project moving through the 8-phase PDLC",
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

export default function OverviewPage() {
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
          Every product begins as a Case, executes as an Initiative, and
          operates as a Product in market.
        </p>
      </div>

      {/* Horizontal Flow Visualization */}
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

      {/* Stage Detail Cards */}
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

      {/* CTA Banner */}
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
