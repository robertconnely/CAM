import {
  SkeletonBox,
  SkeletonCard,
  SkeletonStyles,
} from "@/components/ui/Skeleton";

export default function PipelineLoading() {
  return (
    <div style={{ padding: "32px 40px", maxWidth: 1120 }}>
      <SkeletonStyles />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <SkeletonBox width={240} height={24} borderRadius={4} />
        <SkeletonBox
          width={300}
          height={13}
          borderRadius={4}
          style={{ marginTop: 8 }}
        />
      </div>

      {/* 4 KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} height={90} />
        ))}
      </div>

      {/* Kanban board skeleton */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid var(--zelis-ice, #ECE9FF)",
          padding: 24,
        }}
      >
        <SkeletonBox
          width={180}
          height={15}
          borderRadius={4}
          style={{ marginBottom: 20 }}
        />
        {/* Phase columns */}
        <div style={{ display: "flex", gap: 12 }}>
          {[1, 2, 3, 4, 5, 6].map((col) => (
            <div key={col} style={{ flex: 1, minWidth: 0 }}>
              <SkeletonBox
                width="80%"
                height={12}
                borderRadius={3}
                style={{ marginBottom: 12 }}
              />
              <SkeletonBox height={60} borderRadius={8} />
              {col % 2 === 0 && (
                <SkeletonBox
                  height={60}
                  borderRadius={8}
                  style={{ marginTop: 8 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
