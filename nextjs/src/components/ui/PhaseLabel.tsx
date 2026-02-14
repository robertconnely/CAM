interface PhaseLabelProps {
  phaseNumber: number | string;
  label: string;
  color?: string;
}

export function PhaseLabel({
  phaseNumber,
  label,
  color = "#321478",
}: PhaseLabelProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        fontSize: "0.65rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color,
        background: `${color}10`,
        padding: "0.2rem 0.6rem",
        borderRadius: 4,
        whiteSpace: "nowrap",
      }}
    >
      {typeof phaseNumber === "number"
        ? `PHASE ${phaseNumber}`
        : `PHASES ${phaseNumber}`}{" "}
      &middot; {label}
    </span>
  );
}
