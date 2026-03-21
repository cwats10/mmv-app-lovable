
-- Add missing columns to vaults
ALTER TABLE public.vaults ADD COLUMN IF NOT EXISTS contributor_page_allowance integer NOT NULL DEFAULT 1;

-- Add missing columns to submissions
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS page_order integer;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS page_layout jsonb;

-- Allow vault owners to delete submissions
CREATE POLICY "Vault owners can delete submissions"
ON public.submissions
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM vaults WHERE vaults.id = submissions.vault_id AND vaults.owner_id = auth.uid()
));
