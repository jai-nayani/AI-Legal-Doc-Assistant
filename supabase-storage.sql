-- Legal Document Assistant - Storage Buckets Setup
-- Run this AFTER running supabase-schema.sql

-- Create storage buckets (Run this in SQL Editor)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 52428800, ARRAY['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('templates', 'templates', false, 52428800, ARRAY['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Documents bucket policies
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
CREATE POLICY "Users can update own documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Templates bucket policies
DROP POLICY IF EXISTS "Users can upload templates" ON storage.objects;
CREATE POLICY "Users can upload templates" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'templates' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Anyone can view public templates" ON storage.objects;
CREATE POLICY "Anyone can view public templates" ON storage.objects
  FOR SELECT USING (bucket_id = 'templates');

DROP POLICY IF EXISTS "Users can update own templates" ON storage.objects;
CREATE POLICY "Users can update own templates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'templates' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own templates" ON storage.objects;
CREATE POLICY "Users can delete own templates" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'templates' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

