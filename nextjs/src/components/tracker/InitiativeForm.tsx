"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/Toast";
import type {
  Initiative,
  PdlcPhase,
  InitiativeStatus,
  GovernanceTier,
} from "@/lib/types/database";
import { VALUE_DRIVER_OPTIONS } from "./constants";

interface InitiativeFormProps {
  initiative?: Initiative | null;
  phases: PdlcPhase[];
  nextId: string;
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
  transition: "border-color 0.2s",
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

export function InitiativeForm({
  initiative,
  phases,
  nextId,
  onClose,
}: InitiativeFormProps) {
  const isEditing = !!initiative;
  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const sorted = [...phases].sort((a, b) => a.display_order - b.display_order);

  const [form, setForm] = useState({
    initiative_id: initiative?.initiative_id ?? nextId,
    name: initiative?.name ?? "",
    tier: (initiative?.tier ?? "tier_3") as GovernanceTier,
    current_phase_id: initiative?.current_phase_id ?? sorted[0]?.id ?? "",
    phase_start_date: initiative?.phase_start_date?.slice(0, 10) ?? "",
    target_gate_date: initiative?.target_gate_date?.slice(0, 10) ?? "",
    status: (initiative?.status ?? "on_track") as InitiativeStatus,
    owner_name: initiative?.owner_name ?? "",
    irr: initiative?.irr?.toString() ?? "",
    contribution_margin: initiative?.contribution_margin?.toString() ?? "",
    strategic_score: initiative?.strategic_score?.toString() ?? "",
    priority_rank: initiative?.priority_rank?.toString() ?? "",
    notes: initiative?.notes ?? "",
    value_driver_ids: initiative?.value_driver_ids ?? [],
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast("Initiative name is required", "error");
      return;
    }
    if (!form.initiative_id.trim()) {
      showToast("Initiative ID is required", "error");
      return;
    }

    setSaving(true);
    const payload = {
      initiative_id: form.initiative_id.trim(),
      name: form.name.trim(),
      tier: form.tier,
      current_phase_id: form.current_phase_id,
      phase_start_date: form.phase_start_date || null,
      target_gate_date: form.target_gate_date || null,
      status: form.status,
      owner_name: form.owner_name.trim() || null,
      irr: form.irr ? parseFloat(form.irr) : null,
      contribution_margin: form.contribution_margin
        ? parseFloat(form.contribution_margin)
        : null,
      strategic_score: form.strategic_score
        ? parseInt(form.strategic_score)
        : null,
      priority_rank: form.priority_rank ? parseInt(form.priority_rank) : null,
      notes: form.notes.trim() || null,
      value_driver_ids: form.value_driver_ids,
    };

    if (isEditing && initiative) {
      const { error } = await supabase
        .from("initiatives")
        .update(payload)
        .eq("id", initiative.id);
      setSaving(false);
      if (error) {
        showToast(`Failed: ${error.message}`, "error");
      } else {
        showToast("Initiative updated", "success");
        router.refresh();
        onClose();
      }
    } else {
      const { error } = await supabase.from("initiatives").insert(payload);
      setSaving(false);
      if (error) {
        showToast(`Failed: ${error.message}`, "error");
      } else {
        showToast("Initiative created", "success");
        router.refresh();
        onClose();
      }
    }
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
          maxWidth: 820,
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
          <h2
            style={{
              margin: 0,
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "var(--zelis-purple)",
            }}
          >
            {isEditing ? "Edit Initiative" : "New Initiative"}
          </h2>
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

        {/* Body */}
        <div
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* Row 1: ID + Name */}
          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "0.75rem" }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>ID</label>
              <input
                style={inputStyle}
                value={form.initiative_id}
                onChange={(e) => set("initiative_id", e.target.value)}
                placeholder="PDLC-001"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Initiative Name</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Enter initiative name"
                autoFocus
              />
            </div>
          </div>

          {/* Row 2: Tier + Status + Owner */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Tier</label>
              <select
                style={inputStyle}
                value={form.tier}
                onChange={(e) => set("tier", e.target.value)}
              >
                <option value="tier_1">Tier 1 — Strategic</option>
                <option value="tier_2">Tier 2 — Cross-functional</option>
                <option value="tier_3">Tier 3 — Team-level</option>
                <option value="tier_4">Tier 4 — Operational</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Status</label>
              <select
                style={inputStyle}
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="on_track">On Track</option>
                <option value="at_risk">At Risk</option>
                <option value="blocked">Blocked</option>
                <option value="complete">Complete</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Owner</label>
              <input
                style={inputStyle}
                value={form.owner_name}
                onChange={(e) => set("owner_name", e.target.value)}
                placeholder="Name"
              />
            </div>
          </div>

          {/* Row 3: Phase + Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Current Phase</label>
              <select
                style={inputStyle}
                value={form.current_phase_id}
                onChange={(e) => set("current_phase_id", e.target.value)}
              >
                {sorted.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.display_order}. {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Phase Start</label>
              <input
                type="date"
                style={inputStyle}
                value={form.phase_start_date}
                onChange={(e) => set("phase_start_date", e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Target Gate Date</label>
              <input
                type="date"
                style={inputStyle}
                value={form.target_gate_date}
                onChange={(e) => set("target_gate_date", e.target.value)}
              />
            </div>
          </div>

          {/* Row 4: Financial metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem" }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>IRR %</label>
              <input
                type="number"
                step="0.01"
                style={inputStyle}
                value={form.irr}
                onChange={(e) => set("irr", e.target.value)}
                placeholder="—"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>CM %</label>
              <input
                type="number"
                step="0.01"
                style={inputStyle}
                value={form.contribution_margin}
                onChange={(e) => set("contribution_margin", e.target.value)}
                placeholder="—"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Strategic Score</label>
              <input
                type="number"
                min="0"
                max="100"
                style={inputStyle}
                value={form.strategic_score}
                onChange={(e) => set("strategic_score", e.target.value)}
                placeholder="0–100"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Priority Rank</label>
              <input
                type="number"
                min="1"
                style={inputStyle}
                value={form.priority_rank}
                onChange={(e) => set("priority_rank", e.target.value)}
                placeholder="#"
              />
            </div>
          </div>

          {/* Value Drivers */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Value Drivers</label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              {VALUE_DRIVER_OPTIONS.map((driver) => {
                const selected = form.value_driver_ids.includes(driver.id);
                return (
                  <button
                    key={driver.id}
                    type="button"
                    onClick={() => {
                      setForm((f) => ({
                        ...f,
                        value_driver_ids: selected
                          ? f.value_driver_ids.filter((id) => id !== driver.id)
                          : [...f.value_driver_ids, driver.id],
                      }));
                    }}
                    style={{
                      padding: "0.4rem 0.75rem",
                      borderRadius: "6px",
                      border: `2px solid ${selected ? driver.color : "var(--zelis-ice)"}`,
                      background: selected ? `${driver.color}10` : "white",
                      color: selected ? driver.color : "var(--zelis-dark-gray, #555)",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                      fontWeight: selected ? 700 : 500,
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {driver.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Notes</label>
            <textarea
              style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Additional context..."
            />
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
            {saving
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Create Initiative"}
          </button>
        </div>
      </div>
    </div>
  );
}
