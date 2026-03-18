-- Add book edition tier and extra copies to the books table.
--
-- design_tier: 'classic' ($149 base) or 'heirloom' ($449 base)
-- extra_copies: number of identical additional copies added to the same order
--               Classic extras: $99 each · Heirloom extras: $349 each

ALTER TABLE books
  ADD COLUMN IF NOT EXISTS design_tier TEXT NOT NULL DEFAULT 'classic'
    CHECK (design_tier IN ('classic', 'heirloom')),
  ADD COLUMN IF NOT EXISTS extra_copies INTEGER NOT NULL DEFAULT 0
    CHECK (extra_copies >= 0 AND extra_copies <= 20);
