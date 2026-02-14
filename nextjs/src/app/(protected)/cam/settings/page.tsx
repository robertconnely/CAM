import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import type { Section, Category, Profile, Document as DocType, UserRole } from "@/lib/types/database";

export const metadata = {
  title: "Settings — CAM",
};

interface SettingsPageProps {
  searchParams: Promise<{ section?: string; from?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { section: editSectionId, from: fromSlug } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check role
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const profile = profileData as { role: UserRole } | null;
  if (!profile || profile.role === "viewer") {
    redirect("/cam");
  }

  // Fetch admin data
  const [sectionsResult, categoriesResult, documentsResult] =
    await Promise.all([
      supabase.from("sections").select("*").order("display_order"),
      supabase.from("categories").select("*").order("display_order"),
      supabase
        .from("documents")
        .select("*, sections(title, slug)")
        .order("created_at", { ascending: false }),
    ]);

  // Only fetch profiles for admins
  let profiles: Profile[] = [];
  if (profile.role === "admin") {
    const { data } = await supabase.from("profiles").select("*").order("created_at");
    profiles = (data ?? []) as Profile[];
  }

  return (
    <AdminDashboard
      sections={(sectionsResult.data ?? []) as Section[]}
      categories={(categoriesResult.data ?? []) as Category[]}
      profiles={profiles}
      documents={(documentsResult.data ?? []) as (DocType & { sections?: { title: string; slug: string } })[]}
      userRole={profile.role}
      editSectionId={editSectionId}
      editFromSlug={fromSlug}
    />
  );
}
