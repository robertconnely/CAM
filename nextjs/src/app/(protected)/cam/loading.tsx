import {
  SkeletonBox,
  SkeletonCard,
  SkeletonStyles,
} from "@/components/ui/Skeleton";

export default function CamDashboardLoading() {
  return (
    <div style={{ padding: "32px 40px", maxWidth: 1120 }}>
      <SkeletonStyles />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <SkeletonBox width={280} height={24} borderRadius={4} />
        <SkeletonBox
          width={200}
          height={13}
          borderRadius={4}
          style={{ marginTop: 8 }}
        />
      </div>

      {/* 4 metric cards */}
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

      {/* Table skeleton */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid var(--zelis-ice, #ECE9FF)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 20px 12px" }}>
          <SkeletonBox width={140} height={15} borderRadius={4} />
        </div>
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 40px",
            padding: "12px 16px",
            borderBottom: "1px solid var(--zelis-ice, #ECE9FF)",
          }}
        >
          {["Case", "Stage", "Status", "NPV", "IRR", "Payback", ""].map(
            (_, i) => (
              <SkeletonBox key={i} width="70%" height={11} borderRadius={3} />
            )
          )}
        </div>
        {/* Table rows */}
        {[1, 2, 3, 4].map((row) => (
          <div
            key={row}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 40px",
              padding: "14px 16px",
              borderBottom: "1px solid var(--zelis-ice, #ECE9FF)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <SkeletonBox width="80%" height={13} borderRadius={3} />
              <SkeletonBox width="40%" height={11} borderRadius={3} />
            </div>
            <SkeletonBox width="70%" height={13} borderRadius={3} />
            <SkeletonBox width={70} height={22} borderRadius={11} />
            <SkeletonBox width="50%" height={13} borderRadius={3} />
            <SkeletonBox width="40%" height={13} borderRadius={3} />
            <SkeletonBox width="50%" height={13} borderRadius={3} />
            <SkeletonBox width={16} height={16} borderRadius={8} />
          </div>
        ))}
      </div>
    </div>
  );
}
