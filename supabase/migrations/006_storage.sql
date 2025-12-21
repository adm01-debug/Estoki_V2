-- Storage buckets configuration
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('triagem-fotos', 'triagem-fotos', true),
  ('documentos', 'documentos', false),
  ('avatars', 'avatars', true);

-- Storage policies
CREATE POLICY "Public read for triagem photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'triagem-fotos');

CREATE POLICY "Auth users can upload triagem photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'triagem-fotos' AND auth.role() = 'authenticated');

CREATE POLICY "Auth users can read documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documentos' AND auth.role() = 'authenticated');

CREATE POLICY "Public read for avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
