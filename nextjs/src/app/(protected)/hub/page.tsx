import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SectionGrid } from "@/components/hub/SectionGrid";
import { Footer } from "@/components/layout/Footer";
import type { Section, Category } from "@/lib/types/database";

export const metadata = {
  title: "Knowledge Management Hub — Zelis Product Operating System",
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
    <>
      <Breadcrumb items={[{ label: "Knowledge Hub" }]} />
      <main className="site-main">
        <div className="hero">
          <h1>Knowledge Management Hub</h1>
          <p className="subtitle">
            Browse all product operating system resources
          </p>
        </div>
        <SectionGrid sections={sections} categories={categories} />
      </main>
      <Footer />
    </>
  );
}
