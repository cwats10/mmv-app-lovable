-- Create the book-pdfs storage bucket for press-ready PDFs.
-- Files are publicly readable so the pdf_url stored on books can be accessed
-- directly by both the admin and (if desired) the client.
--
-- In production, consider restricting public access and generating
-- signed URLs instead — especially if PDFs contain personal content.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-pdfs',
  'book-pdfs',
  true,
  52428800,          -- 50 MB per file (large books with many hi-res images)
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE
  SET file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS: allow the service role (Edge Function) to upload freely.
-- No INSERT policy needed for anon/authenticated — uploads go through Edge Function only.
CREATE POLICY "Service role can manage book PDFs"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'book-pdfs')
  WITH CHECK (bucket_id = 'book-pdfs');
