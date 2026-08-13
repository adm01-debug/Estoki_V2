-- Create storage bucket for triagem photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('triagem-fotos', 'triagem-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for triagem photos bucket
CREATE POLICY "Authenticated users can upload triagem photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'triagem-fotos');

CREATE POLICY "Authenticated users can view triagem photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'triagem-fotos');

CREATE POLICY "Users can delete their own triagem photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'triagem-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add fotos column to eventos_triagem if not exists
ALTER TABLE public.eventos_triagem 
ADD COLUMN IF NOT EXISTS fotos text[] DEFAULT '{}';