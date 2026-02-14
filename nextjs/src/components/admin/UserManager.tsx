"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/lib/types/database";
import { useToast } from "./Toast";

interface UserManagerProps {
  profiles: Profile[];
}

const ROLES: UserRole[] = ["viewer", "editor", "admin"];

export function UserManager({ profiles }: UserManagerProps) {
  const [saving, setSaving] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setSaving(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);
    setSaving(null);
    if (error) {
      showToast(`Failed to update role: ${error.message}`, "error");
    } else {
      showToast("Role updated", "success");
      router.refresh();
    }
  };

  const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
    admin: { bg: "rgba(50,15,255,0.08)", color: "var(--zelis-blue, #320FFF)" },
    editor: { bg: "rgba(95,95,195,0.1)", color: "var(--zelis-blue-purple, #5F5FC3)" },
    viewer: { bg: "var(--zelis-ice, #ECE9FF)", color: "var(--zelis-dark, #23004B)" },
  };

  return (
    <div>
      <h2 style={{
        margin: 0,
        fontSize: "1.05rem",
        fontWeight: 700,
        color: "var(--zelis-dark, #23004B)",
      }}>User Management</h2>
      <p style={{
        margin: "0.15rem 0 1.25rem",
        fontSize: "0.78rem",
        color: "var(--zelis-medium-gray, #888)",
        fontWeight: 500,
      }}>
        {profiles.length} registered user{profiles.length !== 1 ? "s" : ""}
      </p>

      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 100px",
          gap: "0.75rem",
          alignItems: "center",
          padding: "0 0.5rem 0.6rem",
          borderBottom: "1px solid var(--zelis-ice, #ECE9FF)",
          marginBottom: "0.5rem",
        }}
      >
        <div style={{
          fontWeight: 700,
          fontSize: "0.68rem",
          color: "var(--zelis-blue-purple, #5F5FC3)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}>User</div>
        <div style={{
          fontWeight: 700,
          fontSize: "0.68rem",
          color: "var(--zelis-blue-purple, #5F5FC3)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}>Role</div>
        <div style={{
          fontWeight: 700,
          fontSize: "0.68rem",
          color: "var(--zelis-blue-purple, #5F5FC3)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}>Joined</div>
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {profiles.map((profile) => (
          <div
            key={profile.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 100px",
              gap: "0.75rem",
              alignItems: "center",
              padding: "0.7rem 0.5rem",
              borderRadius: 8,
              background: "var(--zelis-ice, #ECE9FF)",
            }}
          >
            <div>
              <div style={{
                fontSize: "0.84rem",
                fontWeight: 700,
                color: "var(--zelis-dark, #23004B)",
              }}>{profile.full_name || "\u2014"}</div>
              <div style={{
                fontSize: "0.72rem",
                color: "var(--zelis-blue-purple, #5F5FC3)",
                fontWeight: 500,
              }}>{profile.email}</div>
            </div>
            <div>
              <select
                value={profile.role}
                onChange={(e) =>
                  handleRoleChange(profile.id, e.target.value as UserRole)
                }
                disabled={saving === profile.id}
                style={{
                  padding: "0.3rem 0.5rem",
                  borderRadius: 6,
                  border: "1.5px solid rgba(95,95,195,0.2)",
                  fontFamily: "inherit",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  background: ROLE_COLORS[profile.role].bg,
                  color: ROLE_COLORS[profile.role].color,
                  cursor: saving === profile.id ? "not-allowed" : "pointer",
                }}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div style={{
              fontSize: "0.78rem",
              color: "var(--zelis-dark-gray, #555)",
              fontWeight: 500,
            }}>
              {new Date(profile.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
