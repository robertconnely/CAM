import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Document as DocType } from "@/lib/types/database";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get document metadata
  const { data: docData, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  const doc = docData as DocType | null;
  if (docError || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Generate a signed URL for private documents bucket
  const { data: signedUrl, error: urlError } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.storage_path, 3600); // 1-hour expiry

  if (urlError || !signedUrl) {
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }

  // Redirect to the signed URL
  return NextResponse.redirect(signedUrl.signedUrl);
}
