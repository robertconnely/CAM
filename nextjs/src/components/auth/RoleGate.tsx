"use client";

import { useAuth } from "./AuthProvider";
import type { UserRole } from "@/lib/types/database";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 0,
  editor: 1,
  admin: 2,
};

export function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { role, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!role || !allowedRoles.includes(role)) {
    return fallback ?? null;
  }

  return <>{children}</>;
}

export function hasMinRole(userRole: UserRole | null, minRole: UserRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}
