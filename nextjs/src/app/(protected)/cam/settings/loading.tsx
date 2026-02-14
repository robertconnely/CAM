import {
  SkeletonBox,
  SkeletonStyles,
} from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 1120 }}>
      <SkeletonStyles />

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SkeletonBox width={120} height={24} borderRadius={4} />
        <SkeletonBox
          width={280}
          height={13}
          borderRadius={4}
          style={{ marginTop: 8 }}
        />
      </div>

      {/* Tab pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[100, 110, 80].map((w, i) => (
          <SkeletonBox key={i} width={w} height={36} borderRadius={8} />
        ))}
      </div>

      {/* Content card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid var(--zelis-ice, #ECE9FF)",
          padding: 24,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 0",
              borderBottom:
                i < 5 ? "1px solid var(--zelis-ice, #ECE9FF)" : "none",
            }}
          >
            <SkeletonBox width={32} height={32} borderRadius={6} />
            <div style={{ flex: 1 }}>
              <SkeletonBox width="60%" height={14} borderRadius={3} />
              <SkeletonBox
                width="30%"
                height={11}
                borderRadius={3}
                style={{ marginTop: 6 }}
              />
            </div>
            <SkeletonBox width={60} height={28} borderRadius={6} />
          </div>
        ))}
      </div>
    </div>
  );
}
