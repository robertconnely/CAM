import {
  SkeletonBox,
  SkeletonCard,
  SkeletonStyles,
} from "@/components/ui/Skeleton";

export default function PdlcLoading() {
  return (
    <div style={{ padding: "32px 40px", maxWidth: 1120 }}>
      <SkeletonStyles />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <SkeletonBox width={220} height={24} borderRadius={4} />
        <SkeletonBox
          width={360}
          height={13}
          borderRadius={4}
          style={{ marginTop: 8 }}
        />
      </div>

      {/* Horizontal pipeline skeleton */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid var(--zelis-ice, #ECE9FF)",
          padding: 24,
          marginBottom: 32,
        }}
      >
        {/* Macro stage labels */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: 16,
          }}
        >
          {["Strategy", "Build", "Prepare", "Launch"].map((_, i) => (
            <SkeletonBox key={i} width={80} height={12} borderRadius={3} />
          ))}
        </div>
        {/* Pipeline nodes */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            justifyContent: "center",
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SkeletonBox key={i} width={48} height={48} borderRadius="50%" />
          ))}
        </div>
      </div>

      {/* Deep-dive cards skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <SkeletonCard key={i} height={140} />
        ))}
      </div>

      {/* Governance section */}
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
          style={{ marginBottom: 16 }}
        />
        <div style={{ display: "flex", gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} height={80} style={{ flex: 1 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
