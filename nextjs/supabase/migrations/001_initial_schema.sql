-- =============================================
-- Zelis Product Operating System — Initial Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Custom Types
-- =============================================

CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE content_block_type AS ENUM (
  'subtitle', 'quick_summary', 'heading', 'paragraph',
  'list', 'figma_embed', 'image_gallery', 'key_documents',
  'coming_soon', 'html'
);

-- =============================================
-- Tables
-- =============================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories for hub page filter buttons
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sections (hub cards / content pages)
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📄',
  category_id UUID NOT NULL REFERENCES categories(id),
  keywords TEXT[] NOT NULL DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Content blocks (page body content — ordered per section)
CREATE TABLE content_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  block_type content_block_type NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents (file metadata — linked to sections)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'docx',
  icon TEXT NOT NULL DEFAULT '📄',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TOC items (sidebar table of contents per section)
CREATE TABLE toc_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  anchor TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sections_slug ON sections(slug);
CREATE INDEX idx_sections_category ON sections(category_id);
CREATE INDEX idx_content_blocks_section ON content_blocks(section_id);
CREATE INDEX idx_content_blocks_order ON content_blocks(section_id, display_order);
CREATE INDEX idx_documents_section ON documents(section_id);
CREATE INDEX idx_toc_items_section ON toc_items(section_id);

-- =============================================
-- Auto-create profile on signup trigger
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Updated_at auto-update trigger
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER content_blocks_updated_at
  BEFORE UPDATE ON content_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE toc_items ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: users can read all profiles, only update their own
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (public.user_role() = 'admin');

CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (public.user_role() = 'admin');

-- Categories: all authenticated can read; editors+ can write
CREATE POLICY "Authenticated users can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Editors and admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (public.user_role() IN ('editor', 'admin'));

CREATE POLICY "Editors and admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (public.user_role() IN ('editor', 'admin'));

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (public.user_role() = 'admin');

-- Sections: all authenticated can read; editors+ can write; admins can delete
CREATE POLICY "Authenticated users can view sections"
  ON sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Editors and admins can insert sections"
  ON sections FOR INSERT
  TO authenticated
  WITH CHECK (public.user_role() IN ('editor', 'admin'));

CREATE POLICY "Editors and admins can update sections"
  ON sections FOR UPDATE
  TO authenticated
  USING (public.user_role() IN ('editor', 'admin'));

CREATE POLICY "Admins can delete sections"
  ON sections FOR DELETE
  TO authenticated
  USING (public.user_role() = 'admin');

-- Content blocks: same pattern
CREATE POLICY "Authenticated users can view content blocks"
  ON content_blocks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Editors and admins can insert content blocks"
  ON content_blocks FOR INSERT
  TO authenticated
  WITH CHECK (public.user_role() IN ('editor', 'admin'));

CREATE POLICY "Editors and admins can update content blocks"
  ON content_blocks FOR UPDATE
  TO authenticated
  USING (public.user_role() IN ('editor', 'admin'));

CREATE POLICY "Admins can delete content blocks"
  ON content_blocks FOR DELETE
  TO authenticated
  USING (public.user_role() = 'admin');

-- Documents: same pattern
CREATE POLICY "Authenticated users can view documents"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Editors and admins can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (public.user_role() IN ('editor', 'admin'));

CREATE POLICY "Editors and admins can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (public.user_role() IN ('editor', 'admin'));

CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (public.user_role() = 'admin');

-- TOC items: same pattern
CREATE POLICY "Authenticated users can view toc items"
  ON toc_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Editors and admins can insert toc items"
  ON toc_items FOR INSERT
  TO authenticated
  WITH CHECK (public.user_role() IN ('editor', 'admin'));

CREATE POLICY "Editors and admins can update toc items"
  ON toc_items FOR UPDATE
  TO authenticated
  USING (public.user_role() IN ('editor', 'admin'));

CREATE POLICY "Admins can delete toc items"
  ON toc_items FOR DELETE
  TO authenticated
  USING (public.user_role() = 'admin');

-- =============================================
-- Storage Buckets (run in Supabase dashboard or via API)
-- =============================================
-- Note: Storage bucket creation is done via Supabase dashboard or client.
-- These are the policies you'd apply after creating the buckets:

-- documents bucket (private):
-- INSERT: editors + admins
-- SELECT: all authenticated
-- DELETE: admins only

-- images bucket (public):
-- INSERT: editors + admins
-- SELECT: public
-- DELETE: admins only
