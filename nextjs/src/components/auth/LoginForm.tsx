"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@zelis.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />
      </div>

      {error && <div className="form-error">{error}</div>}

      <button type="submit" disabled={loading} className="login-button">
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <style jsx>{`
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
          max-width: 400px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group label {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--zelis-dark-gray);
        }
        .form-group input {
          padding: 0.75rem 1rem;
          border: 2px solid var(--zelis-ice);
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
          transition: border-color 0.3s ease;
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--zelis-blue-purple);
          box-shadow: 0 0 0 3px rgba(95, 95, 195, 0.15);
        }
        .form-error {
          color: var(--zelis-red);
          font-size: 0.9rem;
          padding: 0.75rem 1rem;
          background: rgba(230, 30, 45, 0.08);
          border-radius: 8px;
          border-left: 3px solid var(--zelis-red);
        }
        .login-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, var(--zelis-purple), var(--zelis-blue-purple));
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(50, 20, 120, 0.35);
        }
        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}
