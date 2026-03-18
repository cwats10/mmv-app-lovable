-- ============================================================
-- MMV — Image Layout Migration
-- Adds contributor-controlled image positioning to submissions
-- ============================================================

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS image_layout JSONB DEFAULT '{"position": "float-right"}'::jsonb;
