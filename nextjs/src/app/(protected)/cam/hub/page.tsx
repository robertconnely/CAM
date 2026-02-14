import { createClient } from "@/lib/supabase/server";
import { SectionGrid } from "@/components/hub/SectionGrid";
import type { Section, Category } from "@/lib/types/database";

export const metadata = {
  title: "Knowledge Hub — Zelis Product Operating System",
};

export default async function HubPage() {
  const supabase = await createClient();

  const [sectionsResult, categoriesResult] = await Promise.all([
    supabase.from("sections").select("*").order("display_order"),
    supabase.from("categories").select("*").order("display_order"),
  ]);

  const sections = (sectionsResult.data ?? []) as Section[];
  const categories = (categoriesResult.data ?? []) as Category[];

  return (
    <div style={{ padding: "2rem 2.5rem" }}>
      {/* Hero */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "var(--zelis-purple, #321478)",
            margin: "0 0 0.35rem",
            letterSpacing: "-0.01em",
          }}
        >
          Knowledge Hub
        </h1>
        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--zelis-medium-gray, #797279)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Browse all product operating system resources, frameworks, and
          documentation.
        </p>
      </div>

      {/* Grid with search, filters, and cards */}
      <SectionGrid sections={sections} categories={categories} />
    </div>
  );
}
