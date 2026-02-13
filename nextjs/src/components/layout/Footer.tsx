"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  prevPage?: FooterLink;
  nextPage?: FooterLink;
  relatedSections?: FooterLink[];
}

const footerBtnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.25)",
  color: "white",
  padding: "0.4rem 1rem",
  borderRadius: "6px",
  textDecoration: "none",
  fontFamily: "inherit",
  fontSize: "0.82rem",
  fontWeight: 600,
  transition: "background 0.2s",
};

export function Footer({ prevPage, nextPage, relatedSections }: FooterProps) {
  const { user, role, signOut } = useAuth();

  return (
    <footer className="site-footer">
      <div className="container">
        <div>
          <h4>Navigation</h4>
          <p>
            <Link href="/">Dashboard</Link>
          </p>
          <p>
            <Link href="/hub">Knowledge Hub</Link>
          </p>
          {prevPage && (
            <p>
              <Link href={prevPage.href}>&larr; {prevPage.label}</Link>
            </p>
          )}
          {nextPage && (
            <p>
              <Link href={nextPage.href}>{nextPage.label} &rarr;</Link>
            </p>
          )}
        </div>
        {relatedSections && relatedSections.length > 0 && (
          <div>
            <h4>Related Sections</h4>
            {relatedSections.map((section) => (
              <p key={section.href}>
                <Link href={section.href}>{section.label}</Link>
              </p>
            ))}
          </div>
        )}
        <div>
          <h4>Product Operating System</h4>
          <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>
            Price Optimization Business Unit
          </p>
        </div>
      </div>
      <div className="footer-nav">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div className="footer-copyright">
            &copy; 2026 Zelis. Product Operating System.
          </div>
          {user ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <span style={{ fontSize: "0.82rem", opacity: 0.7 }}>
                {user.email}
              </span>
              {(role === "admin" || role === "editor") && (
                <Link href="/admin" style={footerBtnStyle}>
                  Admin
                </Link>
              )}
              <button
                onClick={signOut}
                style={{ ...footerBtnStyle, cursor: "pointer" }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/login" style={footerBtnStyle}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
