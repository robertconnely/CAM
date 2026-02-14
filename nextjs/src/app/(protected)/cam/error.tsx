"use client";

export default function CamError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        padding: "32px 40px",
        maxWidth: 1120,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid var(--zelis-ice, #ECE9FF)",
          padding: "40px 32px",
          textAlign: "center",
          maxWidth: 440,
          width: "100%",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--zelis-ice, #ECE9FF)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 20,
          }}
        >
          !
        </div>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--zelis-dark, #23004B)",
            margin: "0 0 8px",
          }}
        >
          Something went wrong
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--zelis-medium-gray, #797279)",
            margin: "0 0 24px",
            lineHeight: 1.5,
          }}
        >
          {error.message || "Failed to load this page. Please try again."}
        </p>
        <button
          onClick={reset}
          style={{
            padding: "9px 24px",
            borderRadius: 8,
            background:
              "linear-gradient(135deg, var(--zelis-purple, #321478), var(--zelis-blue-purple, #5F5FC3))",
            color: "#fff",
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
