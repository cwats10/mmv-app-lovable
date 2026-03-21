-- 008_contributor_pages.sql
-- Adds contributor page allowance, page ordering, and enhanced page layout support.

-- Creator controls how many pages each contributor gets (1 or 2)
ALTER TABLE public.vaults
  ADD COLUMN contributor_page_allowance smallint NOT NULL DEFAULT 1
  CHECK (contributor_page_allowance IN (1, 2));

-- Page ordering for the creator to rearrange contributor pages in the book
ALTER TABLE public.submissions
  ADD COLUMN page_order integer;

-- Rich page layout config: template + custom positions
-- Replaces the simpler image_layout column for new submissions.
-- Structure:
--   {
--     "template": "full-image-caption" | "image-top-text-bottom" | "text-top-image-bottom"
--                 | "side-by-side-left" | "side-by-side-right" | "text-only" | "custom",
--     "customSplit": { "direction": "horizontal" | "vertical", "ratio": 0.6 },
--     "imagePosition": "top" | "bottom" | "left" | "right" | "center",
--     "textAlignment": "left" | "center" | "right"
--   }
ALTER TABLE public.submissions
  ADD COLUMN page_layout jsonb DEFAULT '{"template": "image-top-text-bottom"}'::jsonb;
