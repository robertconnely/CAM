import {
  SkeletonBox,
  SkeletonCard,
  SkeletonStyles,
} from "@/components/ui/Skeleton";

export default function PortfolioLoading() {
  return (
    <div style={{ padding: "32px 40px", maxWidth: 1120 }}>
      <SkeletonStyles />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <SkeletonBox width={200} height={24} borderRadius={4} />
        <SkeletonBox
          width={320}
          height={13}
          borderRadius={4}
          style={{ marginTop: 8 }}
        />
      </div>

      {/* PLC S-curve chart placeholder */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid var(--zelis-ice, #ECE9FF)",
          padding: 24,
          marginBottom: 24,
          height: 280,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <SkeletonBox width={160} height={15} borderRadius={4} />
        <SkeletonBox height="100%" borderRadius={8} />
      </div>

      {/* 8 KPI cards in 2 rows */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <SkeletonCard key={i} height={90} />
        ))}
      </div>

      {/* Product cards by stage */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[1, 2, 3, 4].map((stage) => (
          <div key={stage}>
            <SkeletonBox
              width={120}
              height={14}
              borderRadius={4}
              style={{ marginBottom: 12 }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
              }}
            >
              {[1, 2].map((card) => (
                <SkeletonCard key={card} height={120} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
