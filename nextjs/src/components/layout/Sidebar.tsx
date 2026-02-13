"use client";

import type { TocItem } from "@/lib/types/database";

interface SidebarProps {
  items: TocItem[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function findHeadingElement(anchor: string): Element | null {
  // Try exact ID match first
  const exact = document.getElementById(anchor);
  if (exact) return exact;

  // Fallback: find a heading whose slugified text content matches the anchor
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  for (const heading of headings) {
    const text = heading.textContent ?? "";
    if (heading.id === anchor || slugify(text) === anchor || slugify(text).includes(anchor)) {
      return heading;
    }
  }
  return null;
}

export function Sidebar({ items }: SidebarProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    e.preventDefault();
    const element = findHeadingElement(anchor);
    if (element) {
      const header = document.querySelector(".site-header");
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const top = element.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <aside className="sidebar">
      <div className="toc">
        <h4>On This Page</h4>
        <ol>
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.anchor}`}
                onClick={(e) => handleClick(e, item.anchor)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
