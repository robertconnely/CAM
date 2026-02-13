"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/Toast";
import type {
  Initiative,
  PdlcPhase,
  GateDecision,
} from "@/lib/types/database";
import { DECISION_CONFIG } from "./constants";

interface GateReviewFormProps {
  initiative: Initiative;
  phases: PdlcPhase[];
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  borderRadius: "8px",
  border: "2px solid var(--zelis-ice)",
  fontSize: "0.88rem",
  fontFamily: "inherit",
  outline: "none",
  background: "white",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "var(--zelis-purple)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: "0.3rem",
  display: "block",
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

export function GateReviewForm({
  initiative,
  phases,
  onClose,
}: GateReviewFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const sorted = [...phases].sort((a, b) => a.display_order - b.display_order);
  const currentPhase = sorted.find((p) => p.id === initiative.current_phase_id);
  const currentIndex = sorted.findIndex(
    (p) => p.id === initiative.current_phase_id
  );
  const nextPhase = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;

  const [form, setForm] = useState({
    gate_name: currentPhase
      ? `${currentPhase.label} Gate`
      : "Gate Review",
    review_date: new Date().toISOString().slice(0, 10),
    reviewers: "",
    decision: "go" as GateDecision,
    conditions: "",
    next_gate_date: "",
    notes: "",
    advance_phase: true,
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const set = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);

    const reviewPayload = {
      initiative_id: initiative.id,
      gate_name: form.gate_name.trim(),
      phase_id: initiative.current_phase_id,
      review_date: form.review_date,
      reviewers: form.reviewers
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean),
      decision: form.decision,
      conditions: form.conditions.trim() || null,
      next_gate_date: form.next_gate_date || null,
      notes: form.notes.trim() || null,
    };

    const { error: reviewError } = await supabase
      .from("gate_reviews")
      .insert(reviewPayload);

    if (reviewError) {
      setSaving(false);
      showToast(`Failed: ${reviewError.message}`, "error");
      return;
    }

    // If decision is "Go" and user wants to advance
    if (form.decision === "go" && form.advance_phase && nextPhase) {
      const { error: updateError } = await supabase
        .from("initiatives")
        .update({
          current_phase_id: nextPhase.id,
          actual_gate_date: form.review_date,
          phase_start_date: form.review_date,
          target_gate_date: form.next_gate_date || null,
        })
        .eq("id", initiative.id);

      if (updateError) {
        showToast(
          `Gate review saved, but failed to advance phase: ${updateError.message}`,
          "error"
        );
      } else {
        showToast(
          `Gate review recorded — advanced to ${nextPhase.label}`,
          "success"
        );
      }
    } else {
      showToast("Gate review recorded", "success");
    }

    setSaving(false);
    router.refresh();
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(35, 0, 75, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "10px",
          width: "100%",
          maxWidth: 540,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "12px 12px 50px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "2px solid var(--zelis-ice)",
            background: "linear-gradient(135deg, #f8f6ff 0%, white 100%)",
            borderRadius: "10px 10px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.15rem",
                fontWeight: 800,
                color: "var(--zelis-purple)",
              }}
            >
              Record Gate Review
            </h2>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--zelis-blue-purple)",
                marginTop: "0.2rem",
              }}
            >
              {initiative.initiative_id} — {initiative.name}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: "var(--zelis-medium-gray)",
              padding: "0.25rem",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <div style={fieldStyle}>
              <label style={labelStyle}>Gate Name</label>
              <input
                style={inputStyle}
                value={form.gate_name}
                onChange={(e) => set("gate_name", e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Review Date</label>
              <input
                type="date"
                style={inputStyle}
                value={form.review_date}
                onChange={(e) => set("review_date", e.target.value)}
              />
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Reviewers (comma-separated)</label>
            <input
              style={inputStyle}
              value={form.reviewers}
              onChange={(e) => set("reviewers", e.target.value)}
              placeholder="Jane Doe, John Smith"
            />
          </div>

          {/* Decision selector */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Decision</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(
                Object.entries(DECISION_CONFIG) as [
                  GateDecision,
                  (typeof DECISION_CONFIG)[GateDecision],
                ][]
              ).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set("decision", key)}
                  style={{
                    flex: 1,
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border:
                      form.decision === key
                        ? `2px solid ${cfg.color}`
                        : "2px solid var(--zelis-ice)",
                    background:
                      form.decision === key ? cfg.bg : "white",
                    color: cfg.color,
                    fontWeight: form.decision === key ? 700 : 500,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                >
                  {cfg.icon} {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advance phase checkbox (only for Go + if there's a next phase) */}
          {form.decision === "go" && nextPhase && (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                background: "#e8f5e9",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#2e7d32",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={form.advance_phase}
                onChange={(e) => set("advance_phase", e.target.checked)}
                style={{ accentColor: "#2e7d32" }}
              />
              Advance to next phase: {nextPhase.label}
            </label>
          )}

          <div style={fieldStyle}>
            <label style={labelStyle}>Conditions / Follow-ups</label>
            <textarea
              style={{ ...inputStyle, minHeight: 50, resize: "vertical" }}
              value={form.conditions}
              onChange={(e) => set("conditions", e.target.value)}
              placeholder="Any conditions for the gate decision..."
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <div style={fieldStyle}>
              <label style={labelStyle}>Next Gate Date</label>
              <input
                type="date"
                style={inputStyle}
                value={form.next_gate_date}
                onChange={(e) => set("next_gate_date", e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Notes</label>
              <input
                style={inputStyle}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Additional notes"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderTop: "2px solid var(--zelis-ice)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            background: "#fafafa",
            borderRadius: "0 0 10px 10px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.55rem 1.25rem",
              borderRadius: "8px",
              border: "2px solid var(--zelis-medium-gray)",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.85rem",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.55rem 1.5rem",
              borderRadius: "8px",
              border: "none",
              background: saving
                ? "var(--zelis-medium-gray)"
                : "linear-gradient(135deg, var(--zelis-purple) 0%, var(--zelis-blue-purple) 100%)",
              color: "white",
              cursor: saving ? "default" : "pointer",
              fontWeight: 700,
              fontSize: "0.85rem",
              fontFamily: "inherit",
              boxShadow: saving
                ? "none"
                : "0 2px 8px rgba(50, 20, 120, 0.3)",
            }}
          >
            {saving ? "Saving..." : "Record Gate Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
