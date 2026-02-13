"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { submitForApproval } from "@/lib/cam/submit-for-approval";
import type { InvestmentCase } from "@/lib/types/database";

interface SubmitButtonProps {
  investmentCase: InvestmentCase | null;
  onSubmitted?: () => void;
}

export function SubmitButton({ investmentCase, onSubmitted }: SubmitButtonProps) {
  const { user } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!investmentCase) return null;

  const isSubmitted = investmentCase.status === "submitted";
  const isApproved = investmentCase.status === "approved";
  const isRejected = investmentCase.status === "rejected";

  // Already submitted or beyond
  if (isSubmitted) {
    return (
      <button
        disabled
        style={{
          padding: "9px 18px",
          borderRadius: 8,
          border: "none",
          background: "var(--zelis-ice, #ECE9FF)",
          color: "var(--zelis-blue-purple, #5F5FC3)",
          fontSize: 13,
          fontWeight: 600,
          cursor: "default",
          whiteSpace: "nowrap",
        }}
      >
        Submitted — Awaiting Review
      </button>
    );
  }

  if (isApproved) {
    return (
      <button
        disabled
        style={{
          padding: "9px 18px",
          borderRadius: 8,
          border: "none",
          background: "rgba(16, 185, 129, 0.1)",
          color: "#059669",
          fontSize: 13,
          fontWeight: 600,
          cursor: "default",
          whiteSpace: "nowrap",
        }}
      >
        Approved
      </button>
    );
  }

  if (isRejected) {
    return (
      <button
        disabled
        style={{
          padding: "9px 18px",
          borderRadius: 8,
          border: "none",
          background: "rgba(230, 30, 45, 0.08)",
          color: "var(--zelis-red, #E61E2D)",
          fontSize: 13,
          fontWeight: 600,
          cursor: "default",
          whiteSpace: "nowrap",
        }}
      >
        Rejected
      </button>
    );
  }

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    const result = await submitForApproval(investmentCase, user.id);
    setSubmitting(false);
    if (result.success) {
      setConfirming(false);
      onSubmitted?.();
    } else {
      setError(result.error ?? "Failed to submit");
    }
  };

  // Confirmation dialog
  if (confirming) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {error && (
          <span style={{ fontSize: 12, color: "var(--zelis-red, #E61E2D)" }}>{error}</span>
        )}
        <button
          onClick={() => setConfirming(false)}
          disabled={submitting}
          style={{
            padding: "9px 14px",
            borderRadius: 8,
            border: "1px solid var(--zelis-ice, #ECE9FF)",
            background: "#fff",
            color: "var(--zelis-dark, #23004B)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            padding: "9px 18px",
            borderRadius: 8,
            border: "none",
            background: "var(--zelis-dark, #23004B)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: submitting ? "default" : "pointer",
            whiteSpace: "nowrap",
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? "Submitting..." : "Confirm Submit"}
        </button>
      </div>
    );
  }

  // Default: Submit button (only for authenticated users with draft cases)
  if (!user) {
    return (
      <button
        disabled
        style={{
          padding: "9px 18px",
          borderRadius: 8,
          border: "none",
          background: "var(--zelis-dark, #23004B)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: "default",
          whiteSpace: "nowrap",
          opacity: 0.5,
        }}
        title="Sign in to submit for approval"
      >
        Submit for Approval
      </button>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        padding: "9px 18px",
        borderRadius: 8,
        border: "none",
        background: "var(--zelis-dark, #23004B)",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      Submit for Approval
    </button>
  );
}
