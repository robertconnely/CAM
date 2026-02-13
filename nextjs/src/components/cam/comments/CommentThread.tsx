"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface Comment {
  id: string;
  case_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author_name?: string;
  author_email?: string;
}

interface CommentThreadProps {
  caseId: string;
}

export function CommentThread({ caseId }: CommentThreadProps) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("case_comments")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true });

    if (data) {
      // Fetch author names
      const authorIds = [...new Set(data.map((c) => c.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", authorIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

      setComments(
        data.map((c) => ({
          ...c,
          author_name: profileMap.get(c.author_id)?.full_name ?? undefined,
          author_email: profileMap.get(c.author_id)?.email ?? undefined,
        })) as Comment[]
      );
    }
    setLoading(false);
  }, [caseId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    if (!user || !newComment.trim()) return;
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("case_comments")
      .insert({
        case_id: caseId,
        author_id: user.id,
        content: newComment.trim(),
      });

    if (!error) {
      setNewComment("");
      fetchComments();

      // Notify case owner (best-effort)
      try {
        const { data: investmentCase } = await supabase
          .from("investment_cases")
          .select("owner_id, title")
          .eq("id", caseId)
          .single();

        if (investmentCase?.owner_id && investmentCase.owner_id !== user.id) {
          await supabase.from("notifications").insert({
            recipient_id: investmentCase.owner_id,
            type: "comment_added",
            case_id: caseId,
            message: `${profile?.full_name ?? "Someone"} commented on "${investmentCase.title}"`,
          });
        }
      } catch {
        // Non-fatal
      }
    }

    setSubmitting(false);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return (email?.[0] ?? "?").toUpperCase();
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid var(--zelis-ice, #ECE9FF)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        padding: "24px 28px",
      }}
    >
      <h3
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--zelis-dark, #23004B)",
          margin: "0 0 16px",
        }}
      >
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {/* Comment list */}
      {loading ? (
        <p style={{ fontSize: 13, color: "var(--zelis-medium-gray, #797279)" }}>Loading...</p>
      ) : comments.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--zelis-medium-gray, #797279)", margin: "0 0 16px" }}>
          No comments yet. Be the first to leave feedback.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
          {comments.map((c) => (
            <div key={c.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              {/* Avatar */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--zelis-purple, #321478), var(--zelis-blue-purple, #5F5FC3))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {getInitials(c.author_name, c.author_email)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--zelis-dark, #23004B)" }}>
                    {c.author_name ?? c.author_email ?? "Unknown"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--zelis-medium-gray, #797279)" }}>
                    {formatTime(c.created_at)}
                  </span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--zelis-dark-gray, #4A4A4A)", margin: 0 }}>
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New comment input */}
      {user ? (
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            style={{
              flex: 1,
              resize: "none",
              border: "1px solid var(--zelis-ice, #ECE9FF)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              lineHeight: 1.5,
              fontFamily: "'Nunito Sans', 'Avenir Next', sans-serif",
              color: "var(--zelis-dark, #23004B)",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--zelis-blue-purple, #5F5FC3)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--zelis-ice, #ECE9FF)";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim() || submitting}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: newComment.trim()
                ? "var(--zelis-dark, #23004B)"
                : "var(--zelis-ice, #ECE9FF)",
              color: newComment.trim() ? "#fff" : "var(--zelis-medium-gray, #797279)",
              fontSize: 13,
              fontWeight: 600,
              cursor: newComment.trim() && !submitting ? "pointer" : "default",
              whiteSpace: "nowrap",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      ) : (
        <p style={{ fontSize: 12, color: "var(--zelis-medium-gray, #797279)", fontStyle: "italic", margin: 0 }}>
          Sign in to leave a comment.
        </p>
      )}
    </div>
  );
}
