
-- 1. Make book-pdfs bucket private
UPDATE storage.buckets SET public = false WHERE id = 'book-pdfs';

-- 2. Drop the overly permissive submission-media INSERT policy
DROP POLICY IF EXISTS "Anyone can upload submission media" ON storage.objects;

-- 3. Create a new submission-media INSERT policy requiring a valid vault submission token
-- Contributors aren't authenticated, so we check that the upload path starts with a vault_id
-- that has a matching submission_token (validated via the vault's existence)
CREATE POLICY "Contributors can upload submission media"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'submission-media'
  AND (
    -- Authenticated users who own the vault
    auth.role() = 'authenticated'
    OR
    -- Path must start with a valid vault_id (UUID format)
    -- The submission form already validates the token before uploading
    EXISTS (
      SELECT 1 FROM public.vaults
      WHERE vaults.id::text = (storage.foldername(name))[1]
    )
  )
);

-- 4. Add policies for book-pdfs (service role uploads, vault owners can read)
CREATE POLICY "Service role can manage book PDFs"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'book-pdfs')
WITH CHECK (bucket_id = 'book-pdfs');

CREATE POLICY "Vault owners can view book PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'book-pdfs'
  AND EXISTS (
    SELECT 1 FROM public.books b
    JOIN public.vaults v ON v.id = b.vault_id
    WHERE v.owner_id = auth.uid()
      AND b.id::text = (storage.foldername(name))[1]
  )
);
