-- =============================================
-- Storage Buckets and Policies
-- =============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('documents', 'documents', false),
  ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Documents: authenticated can read
CREATE POLICY "auth_read_documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents');

-- Documents: editors can upload
CREATE POLICY "editor_upload_documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND public.user_role() IN ('editor', 'admin')
  );

-- Documents: editors can update
CREATE POLICY "editor_update_documents" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.user_role() IN ('editor', 'admin')
  );

-- Documents: admins can delete
CREATE POLICY "admin_delete_documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.user_role() = 'admin'
  );

-- Images: public read
CREATE POLICY "public_read_images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'images');

-- Images: editors can upload
CREATE POLICY "editor_upload_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND public.user_role() IN ('editor', 'admin')
  );

-- Images: editors can update
CREATE POLICY "editor_update_images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'images'
    AND public.user_role() IN ('editor', 'admin')
  );

-- Images: admins can delete
CREATE POLICY "admin_delete_images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'images'
    AND public.user_role() = 'admin'
  );
