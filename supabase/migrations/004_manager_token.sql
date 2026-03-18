-- ============================================================
-- MMV — Manager Token Migration
-- Adds a separate manager_token to vaults so owners can share
-- a review link with trusted helpers who can approve/reject
-- submissions but cannot purchase or finalize the book.
-- ============================================================

ALTER TABLE vaults
  ADD COLUMN IF NOT EXISTS manager_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid();
