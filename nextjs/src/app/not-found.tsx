import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="site-main"
      style={{ textAlign: "center", paddingTop: "4rem" }}
    >
      <h1>404</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
        This page could not be found.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "0.75rem 1.5rem",
          background: "linear-gradient(135deg, var(--zelis-purple), var(--zelis-blue-purple))",
          color: "white",
          borderRadius: "8px",
          fontWeight: 600,
        }}
      >
        Back to Home
      </Link>
    </main>
  );
}
