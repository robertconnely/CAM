"use client";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  startStep?: number;
}

const STEP_GROUPS = [
  { label: "Setup", steps: [0, 1] },
  { label: "Financial Gates", steps: [2, 3, 4] },
  { label: "Strategic Scoring", steps: [5, 6, 7, 8, 9] },
  { label: "Results", steps: [10] },
];

export function WizardProgress({ currentStep, totalSteps, startStep = 0 }: WizardProgressProps) {
  const effectiveTotal = totalSteps - startStep;
  const effectivePos = currentStep - startStep;
  const progress = (effectivePos / (effectiveTotal - 1)) * 100;

  return (
    <div style={{ padding: "1.25rem 2rem", borderBottom: "2px solid var(--zelis-ice)" }}>
      {/* Group labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.6rem",
        }}
      >
        {STEP_GROUPS.map((group) => {
          const isSkipped = startStep > 0 && group.steps.every((s) => s < startStep);
          const isActive = group.steps.includes(currentStep);
          const isComplete = group.steps.every((s) => s < currentStep);
          return (
            <span
              key={group.label}
              style={{
                fontSize: "0.7rem",
                fontWeight: isActive ? 800 : 600,
                color: isSkipped || isComplete
                  ? "var(--zelis-blue-purple)"
                  : isActive
                    ? "var(--zelis-purple)"
                    : "var(--zelis-medium-gray)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                transition: "all 0.3s ease",
              }}
            >
              {isSkipped ? "✓ " : isComplete ? "✓ " : ""}
              {group.label}
              {isSkipped ? " (from case)" : ""}
            </span>
          );
        })}
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 6,
          borderRadius: 3,
          background: "var(--zelis-ice)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.max(0, Math.min(100, progress))}%`,
            borderRadius: 3,
            background: "linear-gradient(90deg, var(--zelis-purple) 0%, var(--zelis-blue-purple) 60%, var(--zelis-gold) 100%)",
            transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>

      {/* Step dots — only show steps from startStep onward */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "0.4rem",
          padding: "0 2px",
        }}
      >
        {Array.from({ length: effectiveTotal }, (_, i) => {
          const stepNum = i + startStep;
          const isComplete = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          return (
            <div
              key={stepNum}
              style={{
                width: isCurrent ? 10 : 6,
                height: isCurrent ? 10 : 6,
                borderRadius: "50%",
                background: isComplete
                  ? "var(--zelis-blue-purple)"
                  : isCurrent
                    ? "var(--zelis-gold)"
                    : "var(--zelis-medium-gray)",
                boxShadow: isCurrent ? "0 0 0 3px rgba(255, 192, 0, 0.3)" : "none",
                transition: "all 0.3s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
