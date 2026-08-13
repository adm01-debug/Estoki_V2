-- Fix triagem-fotos storage INSERT policy to scope by user folder
DROP POLICY IF EXISTS "Authenticated users can upload triage photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload own triage photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to triagem-fotos" ON storage.objects;

-- Find and recreate INSERT policy with ownership check
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND cmd = 'INSERT'
    AND qual::text LIKE '%triagem-fotos%' OR with_check::text LIKE '%triagem-fotos%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users upload own triage photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'triagem-fotos'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);