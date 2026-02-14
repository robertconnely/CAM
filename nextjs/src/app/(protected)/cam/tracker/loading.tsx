export default function TrackerLoading() {
  return (
    <div style={{ padding: "2rem 2.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            height: 24,
            width: 200,
            borderRadius: 6,
            background: "var(--zelis-ice, #ECE9FF)",
            marginBottom: 8,
          }}
        />
        <div
          style={{
            height: 14,
            width: 380,
            borderRadius: 4,
            background: "var(--zelis-ice, #ECE9FF)",
          }}
        />
      </div>

      {/* Stats skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.07)",
              padding: 20,
              height: 80,
            }}
          />
        ))}
      </div>

      {/* List skeleton */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0px 4px 28px 9px rgba(130, 140, 225, 0.07)",
          padding: 24,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              height: 56,
              borderRadius: 8,
              background: "var(--zelis-ice, #ECE9FF)",
              marginBottom: i < 5 ? 12 : 0,
              opacity: 1 - i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}
