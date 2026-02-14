import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { EditPageLink } from "@/components/content/EditPageLink";
import { PdlcCycleDiagram } from "@/components/tracker/PdlcCycleDiagram";
import type { Section, ContentBlock, Document as DocType, TocItem, PdlcPhase } from "@/lib/types/database";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("sections")
    .select("title")
    .eq("slug", slug)
    .single();

  const section = data as { title: string } | null;
  if (!section) return { title: "Not Found" };

  return {
    title: `${section.title} — Zelis Product Operating System`,
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // First fetch the section to get its ID
  const { data: sectionData } = await supabase
    .from("sections")
    .select("*")
    .eq("slug", slug)
    .single();

  const section = sectionData as Section | null;
  if (!section) {
    notFound();
  }

  // Now fetch related data in parallel using the section ID
  const [contentResult, docsResult, navResult] = await Promise.all([
    supabase
      .from("content_blocks")
      .select("*")
      .eq("section_id", section.id)
      .order("display_order"),
    supabase
      .from("documents")
      .select("*")
      .eq("section_id", section.id)
      .order("display_order"),
    supabase
      .from("sections")
      .select("slug, title, display_order")
      .order("display_order"),
  ]);

  const contentBlocks = (contentResult.data ?? []) as ContentBlock[];
  const documents = (docsResult.data ?? []) as DocType[];
  const allSections = (navResult.data ?? []) as Array<{ slug: string; title: string; display_order: number }>;

  // For PDLC page, fetch phases for the cycle diagram
  let pdlcPhases: PdlcPhase[] = [];
  if (slug === "pdlc") {
    const { data: phasesData } = await supabase
      .from("pdlc_phases")
      .select("*")
      .order("display_order", { ascending: true });
    pdlcPhases = (phasesData ?? []) as PdlcPhase[];
  }

  // Generate TOC from heading blocks so sidebar always reflects actual page content
  const tocItems: TocItem[] = contentBlocks
    .filter((b) => b.block_type === "heading")
    .map((b, i) => {
      const text = b.content.text as string;
      const anchor =
        (b.content.anchor as string) ||
        text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      return {
        id: b.id,
        section_id: section.id,
        label: text,
        anchor,
        display_order: i,
        created_at: b.created_at,
      };
    });

  // Determine prev/next pages from display_order
  const currentIndex = allSections.findIndex((s) => s.slug === slug);
  const prevSection =
    currentIndex > 0 ? allSections[currentIndex - 1] : null;
  const nextSection =
    currentIndex < allSections.length - 1
      ? allSections[currentIndex + 1]
      : null;

  return (
    <>
      <Breadcrumb items={[{ label: section.title }]} />
      <main className="container">
        <div className="page-content">
          <div className="page-main">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <h1 style={{ margin: 0 }}>{section.title}</h1>
              <EditPageLink sectionId={section.id} slug={slug} />
            </div>
            <ContentRenderer
              blocks={contentBlocks}
              documents={documents}
            />
            {slug === "pdlc" && pdlcPhases.length > 0 && (
              <>
                <div style={{ margin: "2.5rem 0 1.5rem" }}>
                  <h2 id="pdlc-lifecycle" style={{ marginBottom: "0.5rem" }}>
                    Product Development Lifecycle
                  </h2>
                  <p style={{ color: "var(--zelis-blue-purple)", fontSize: "0.92rem", marginBottom: "1.5rem" }}>
                    Our 8-phase stage-gated framework for turning business ideas into products that win at scale.
                  </p>
                  <PdlcCycleDiagram phases={pdlcPhases} />
                </div>
                <div
                  id="stage-gate-tracker"
                  style={{
                    margin: "2rem 0",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #23004B 0%, #321478 40%, #41329B 100%)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.1rem", fontWeight: 800 }}>
                      Stage Gate Tracker
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.85 }}>
                      Track initiatives through the PDLC pipeline — manage gates, record reviews, and monitor progress.
                    </p>
                  </div>
                  <a
                    href="/pdlc/tracker"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.65rem 1.5rem",
                      borderRadius: "10px",
                      background: "var(--zelis-gold)",
                      color: "var(--zelis-dark)",
                      fontWeight: 800,
                      fontSize: "0.88rem",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      boxShadow: "0 2px 10px rgba(255, 192, 0, 0.3)",
                      transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                  >
                    Open Tracker &rarr;
                  </a>
                </div>
              </>
            )}
          </div>
          <Sidebar items={tocItems} />
        </div>
      </main>
      <Footer
        prevPage={
          prevSection
            ? { label: prevSection.title, href: `/${prevSection.slug}` }
            : undefined
        }
        nextPage={
          nextSection
            ? { label: nextSection.title, href: `/${nextSection.slug}` }
            : undefined
        }
      />
    </>
  );
}
