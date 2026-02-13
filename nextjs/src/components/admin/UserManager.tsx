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

  return (
    <div>
      <h2>User Management</h2>
      <p className="opacity-75" style={{ marginBottom: "1.5rem" }}>
        {profiles.length} registered users.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          gap: "0.75rem",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "0.85rem", opacity: 0.6 }}>
          EMAIL
        </div>
        <div style={{ fontWeight: 700, fontSize: "0.85rem", opacity: 0.6 }}>
          ROLE
        </div>
        <div style={{ fontWeight: 700, fontSize: "0.85rem", opacity: 0.6 }}>
          JOINED
        </div>

        {profiles.map((profile) => (
          <>
            <div key={`email-${profile.id}`}>
              <strong>{profile.full_name || "—"}</strong>
              <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                {profile.email}
              </div>
            </div>
            <div key={`role-${profile.id}`}>
              <select
                value={profile.role}
                onChange={(e) =>
                  handleRoleChange(profile.id, e.target.value as UserRole)
                }
                disabled={saving === profile.id}
                style={{
                  padding: "0.35rem 0.5rem",
                  borderRadius: "6px",
                  border: "2px solid var(--zelis-ice)",
                  fontFamily: "inherit",
                  fontSize: "0.85rem",
                }}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div
              key={`date-${profile.id}`}
              style={{ fontSize: "0.85rem", opacity: 0.7 }}
            >
              {new Date(profile.created_at).toLocaleDateString()}
            </div>
          </>
        ))}
      </div>
    </div>
  );
}
