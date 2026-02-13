"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      className="site-main"
      style={{ textAlign: "center", paddingTop: "4rem" }}
    >
      <h1>Something went wrong</h1>
      <p style={{ marginBottom: "2rem", opacity: 0.75 }}>
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        style={{
          padding: "0.75rem 1.5rem",
          background:
            "linear-gradient(135deg, var(--zelis-purple), var(--zelis-blue-purple))",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: 600,
          fontFamily: "inherit",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        Try Again
      </button>
    </main>
  );
}
