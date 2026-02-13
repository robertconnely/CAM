"use client";

import { use } from "react";
import { CaseResults } from "@/components/cam/results/CaseResults";
import { CommentThread } from "@/components/cam/comments/CommentThread";

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Demo IDs (sample data rows) use the sessionStorage flow
  const isDemo = id.startsWith("demo-");

  return (
    <>
      <CaseResults caseId={isDemo ? undefined : id} />
      {!isDemo && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 64px" }}>
          <CommentThread caseId={id} />
        </div>
      )}
    </>
  );
}
