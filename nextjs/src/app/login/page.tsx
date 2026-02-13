import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In — Zelis Product Operating System",
};

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
            Product Operating System
          </h1>
          <p className="opacity-75">
            Price Optimization Business Unit
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
