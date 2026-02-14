import { SkeletonBox, SkeletonStyles } from "@/components/ui/Skeleton";

export default function RoicLoading() {
  return (
    <div style={{ padding: "32px 40px", maxWidth: 1120 }}>
      <SkeletonStyles />

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginBottom: 20,
        }}
      >
        <SkeletonBox width={100} height={32} borderRadius={6} />
        <SkeletonBox width={120} height={32} borderRadius={6} />
      </div>

      {/* ROIC tree visualization placeholder */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid var(--zelis-ice, #ECE9FF)",
          padding: 32,
          minHeight: 500,
        }}
      >
        {/* Root node */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <SkeletonBox width={180} height={60} borderRadius={10} />
        </div>

        {/* Level 2 nodes */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            marginBottom: 40,
          }}
        >
          <SkeletonBox width={150} height={50} borderRadius={10} />
          <SkeletonBox width={150} height={50} borderRadius={10} />
        </div>

        {/* Level 3 nodes */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            marginBottom: 40,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBox key={i} width={120} height={44} borderRadius={8} />
          ))}
        </div>

        {/* Level 4 nodes */}
        <div
          style={{ display: "flex", justifyContent: "center", gap: 16 }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonBox key={i} width={100} height={40} borderRadius={8} />
          ))}
        </div>
      </div>
    </div>
  );
}
