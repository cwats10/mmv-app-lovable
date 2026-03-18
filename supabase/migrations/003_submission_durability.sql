-- ============================================================
-- MMV — Submission Durability Migration
-- Ensures contributions survive indefinitely regardless of
-- vault lifecycle, book purchase status, or account changes.
-- ============================================================

-- 1. Break the CASCADE chain on submissions → vaults.
--    Previously: deleting a vault silently deleted every submission ever made.
--    Now: vault deletion is BLOCKED while any submission exists.
--    Submissions must be explicitly archived before a vault can be removed.
ALTER TABLE submissions DROP CONSTRAINT submissions_vault_id_fkey;
ALTER TABLE submissions
  ADD CONSTRAINT submissions_vault_id_fkey
  FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE RESTRICT;

-- 2. Soft-delete support for vaults.
--    archived_at IS NULL     → active, visible in dashboard
--    archived_at IS NOT NULL → archived, hidden from dashboard but preserved in DB
ALTER TABLE vaults
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- 3. Soft-delete support for submissions.
--    Submissions should never be physically deleted.
--    archived_at IS NOT NULL marks a submission as withdrawn by the contributor
--    (not the same as 'rejected' by the owner).
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- 4. Track when a book was locked (moved to purchased/printing/delivered).
--    Used to distinguish pre-purchase submissions (current edition) from
--    post-purchase submissions (future edition queue).
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;

-- 5. Auto-stamp locked_at when book status transitions to 'purchased'.
CREATE OR REPLACE FUNCTION stamp_book_locked_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'purchased' AND OLD.status != 'purchased' AND NEW.locked_at IS NULL THEN
    NEW.locked_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_book_purchased ON books;
CREATE TRIGGER on_book_purchased
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION stamp_book_locked_at();
