import Link from "next/link";

type View = "pipeline" | "tracker";

interface InitiativeViewToggleProps {
  active: View;
}

const views: {
  key: View;
  label: string;
  href: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "pipeline",
    label: "Pipeline View",
    href: "/cam/pipeline",
    description: "Visual overview of all initiatives by PDLC phase",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="0.5" y="3" width="3" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect x="5.5" y="1" width="3" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect x="10.5" y="5" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    key: "tracker",
    label: "Tracker View",
    href: "/cam/tracker",
    description: "Create, manage, and advance initiatives through gates",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="1" y1="11" x2="10" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function InitiativeViewToggle({ active }: InitiativeViewToggleProps) {
  const activeView = views.find((v) => v.key === active)!;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginBottom: "1.25rem",
      }}
    >
      {/* Toggle pills */}
      <div
        style={{
          display: "inline-flex",
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid var(--zelis-ice, #ECE9FF)",
        }}
      >
        {views.map((view) => {
          const isActive = view.key === active;
          return isActive ? (
            <span
              key={view.key}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 16px",
                background: "var(--zelis-blue-purple, #5F5FC3)",
                color: "#fff",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "default",
              }}
            >
              {view.icon}
              {view.label}
            </span>
          ) : (
            <Link
              key={view.key}
              href={view.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 16px",
                background: "#fff",
                color: "var(--zelis-dark, #23004B)",
                fontSize: "0.78rem",
                fontWeight: 500,
                textDecoration: "none",
                transition: "background 0.15s",
              }}
            >
              {view.icon}
              {view.label}
            </Link>
          );
        })}
      </div>

      {/* Active description */}
      <span
        style={{
          fontSize: "0.78rem",
          color: "var(--zelis-medium-gray, #888)",
          fontWeight: 500,
        }}
      >
        {activeView.description}
      </span>
    </div>
  );
}
