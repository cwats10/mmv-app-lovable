

## Fix Image Collapse While Keeping Text/Space Improvements

### Root cause
The image containers inside flex layouts collapse because of a common flexbox issue: flex children default to `min-height: auto`, which can cause unpredictable sizing when combined with `overflow-hidden`. The images have `h-full w-full object-cover` but their parent containers don't reliably resolve a height, so images shrink to zero or get clipped.

### Changes

**`src/components/book/BookSpread.tsx`**:
- Add `min-h-0` to the image container divs in all templates — this is the standard flexbox fix that allows flex children to shrink below their content size while still filling available space
- Add `h-full` explicitly to image container wrappers so the ImageGallery receives a resolved height
- On the single-page outer wrapper (line 303), change `overflow-hidden` to `overflow-y-auto min-h-0` so images aren't clipped but text can still scroll

**`src/components/submission/ImageGallery.tsx`**:
- Add `min-h-0` to the root containers so flex-based gallery layouts don't collapse
- Ensure each `<img>` has explicit `min-h-0` to prevent flex collapse

### What stays the same
- `object-cover` on images (fills frame, no letterboxing)
- Reduced padding (`p-3`, `p-4`)
- `overflow-y-auto` on text containers
- 45% default split ratio

### Files to change
- `src/components/book/BookSpread.tsx`
- `src/components/submission/ImageGallery.tsx`

