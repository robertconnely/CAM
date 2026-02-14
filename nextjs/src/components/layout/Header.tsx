"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/cam/hub", label: "Knowledge Hub" },
  { href: "/pdlc/tracker", label: "PDLC Tracker" },
];

const navLinkBase: React.CSSProperties = {
  color: "rgba(255,255,255,0.7)",
  textDecoration: "none",
  fontSize: "0.85rem",
  fontWeight: 600,
  padding: "0.35rem 0.75rem",
  borderRadius: "6px",
  transition: "all 0.2s",
  whiteSpace: "nowrap",
};

const navLinkActive: React.CSSProperties = {
  ...navLinkBase,
  color: "white",
  background: "rgba(255,255,255,0.15)",
};

export function Header() {
  const pathname = usePathname();

  // CAM pages have their own sidebar navigation — hide the site header
  if (pathname.startsWith("/cam")) return null;

  return (
    <header className="site-header">
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <Link
          href="/"
          style={{
            color: "inherit",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Image
            src="/brand/zelis-logo-white.png"
            alt="Zelis"
            width={100}
            height={59}
            style={{ height: "4rem", width: "auto" }}
            priority
          />
        </Link>
        <nav style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={isActive ? navLinkActive : navLinkBase}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
