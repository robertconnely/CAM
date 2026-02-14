"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/Toast";
import { CelebrationModal } from "@/components/cam/workflow/CelebrationModal";
import type { Initiative } from "@/lib/types/database";

interface GraduationFormProps {
  initiative: Initiative;
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

export function GraduationForm({ initiative, onClose }: GraduationFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    name: initiative.name,
    description: initiative.notes ?? "",
    owner_name: initiative.owner_name ?? "",
    plc_stage: "introduction" as "introduction" | "growth" | "maturity" | "decline",
    launch_date: today,
    annual_recurring_revenue: "",
    client_count: "",
    revenue_growth_rate: "",
    net_promoter_score: "",
    retention_rate: "",
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);

    const { error } = await supabase.from("portfolio_products").insert({
      name: form.name.trim(),
      description: form.description.trim() || null,
      owner_name: form.owner_name.trim() || null,
      plc_stage: form.plc_stage,
      initiative_id: initiative.id,
      value_driver_ids: initiative.value_driver_ids ?? [],
      launch_date: form.launch_date || null,
      annual_recurring_revenue: form.annual_recurring_revenue
        ? parseFloat(form.annual_recurring_revenue)
        : null,
      client_count: form.client_count ? parseInt(form.client_count) : null,
      revenue_growth_rate: form.revenue_growth_rate
        ? parseFloat(form.revenue_growth_rate)
        : null,
      net_promoter_score: form.net_promoter_score
        ? parseInt(form.net_promoter_score)
        : null,
      retention_rate: form.retention_rate
        ? parseFloat(form.retention_rate)
        : null,
    });

    if (error) {
      setSaving(false);
      showToast(`Failed to create product: ${error.message}`, "error");
      return;
    }

    // Update initiative status to complete
    if (initiative.status !== "complete") {
      await supabase
        .from("initiatives")
        .update({ status: "complete" })
        .eq("id", initiative.id);
    }

    setSaving(false);
    setShowCelebration(true);
  };

  if (showCelebration) {
    return (
      <CelebrationModal
        open
        variant="graduated"
        title="Product Launched to Portfolio"
        subtitle={`"${form.name}" has graduated from the PDLC and is now tracked in the Product Portfolio.`}
        actions={[
          {
            label: "Stay in Tracker",
            onClick: () => {
              router.refresh();
              onClose();
            },
          },
          {
            label: "View Portfolio",
            href: "/cam/portfolio",
            primary: true,
          },
        ]}
        onClose={() => {
          router.refresh();
          onClose();
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(35, 0, 75, 0.45)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 12,
          maxWidth: 560,
          width: "90%",
          maxHeight: "85vh",
          overflow: "auto",
          boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.15)",
        }}
      >
        {/* Gold accent bar */}
        <div
          style={{
            height: 4,
            background: "linear-gradient(135deg, #FFBE00, #321478)",
          }}
        />

        <div style={{ padding: "1.5rem 2rem" }}>
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "var(--zelis-purple, #321478)",
              margin: "0 0 0.25rem",
            }}
          >
            Graduate to Portfolio
          </h2>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--zelis-medium-gray, #797279)",
              margin: "0 0 1.25rem",
            }}
          >
            Create a portfolio product from this initiative. Initial metrics can
            be updated later.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Product Name */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Two-column row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Owner</label>
                <input
                  type="text"
                  value={form.owner_name}
                  onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>PLC Stage</label>
                <select
                  value={form.plc_stage}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      plc_stage: e.target.value as typeof form.plc_stage,
                    })
                  }
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="introduction">Introduction</option>
                  <option value="growth">Growth</option>
                  <option value="maturity">Maturity</option>
                  <option value="decline">Decline</option>
                </select>
              </div>
            </div>

            {/* Launch Date */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Launch Date</label>
              <input
                type="date"
                value={form.launch_date}
                onChange={(e) => setForm({ ...form, launch_date: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Description */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* Metrics section */}
            <div
              style={{
                borderTop: "2px solid var(--zelis-ice, #ECE9FF)",
                paddingTop: "1rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "var(--zelis-blue-purple)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: "0.75rem",
                }}
              >
                Initial Metrics (optional)
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                <div style={fieldStyle}>
                  <label style={labelStyle}>ARR ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000000"
                    value={form.annual_recurring_revenue}
                    onChange={(e) =>
                      setForm({ ...form, annual_recurring_revenue: e.target.value })
                    }
                    style={inputStyle}
                  />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Client Count</label>
                  <input
                    type="number"
                    placeholder="e.g. 45"
                    value={form.client_count}
                    onChange={(e) =>
                      setForm({ ...form, client_count: e.target.value })
                    }
                    style={inputStyle}
                  />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Growth Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 12.5"
                    value={form.revenue_growth_rate}
                    onChange={(e) =>
                      setForm({ ...form, revenue_growth_rate: e.target.value })
                    }
                    style={inputStyle}
                  />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>NPS (-100 to 100)</label>
                  <input
                    type="number"
                    placeholder="e.g. 72"
                    value={form.net_promoter_score}
                    onChange={(e) =>
                      setForm({ ...form, net_promoter_score: e.target.value })
                    }
                    style={inputStyle}
                  />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Retention Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 95.0"
                    value={form.retention_rate}
                    onChange={(e) =>
                      setForm({ ...form, retention_rate: e.target.value })
                    }
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "2px solid var(--zelis-ice, #ECE9FF)",
            }}
          >
            <button
              onClick={onClose}
              disabled={saving}
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: 10,
                border: "2px solid var(--zelis-ice, #ECE9FF)",
                background: "#fff",
                color: "var(--zelis-dark, #23004B)",
                fontSize: "0.88rem",
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              style={{
                padding: "0.6rem 1.5rem",
                borderRadius: 10,
                border: "none",
                background:
                  saving || !form.name.trim()
                    ? "var(--zelis-medium-gray, #B4B4B9)"
                    : "linear-gradient(135deg, #FFBE00, #e6a800)",
                color: "var(--zelis-dark, #23004B)",
                fontSize: "0.88rem",
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: saving || !form.name.trim() ? "default" : "pointer",
                boxShadow:
                  saving || !form.name.trim()
                    ? "none"
                    : "0 2px 8px rgba(255, 190, 0, 0.3)",
              }}
            >
              {saving ? "Creating..." : "Launch Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
