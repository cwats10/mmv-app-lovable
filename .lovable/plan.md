

## Fix Page Content: Text Cutoff, Wasted Space, Image Cropping

### Root Causes

1. **Text cutoff**: Page templates use `overflow-hidden` on the outer container, and text has no scroll or size adaptation — long messages get clipped silently.

2. **Excessive white space**: Padding values (`p-5`, `p-8`) and divider margins are sized for a large printed page but render in a small on-screen preview, wasting proportionally too much space.

3. **Images not fully visible**: `ImageGallery` uses `object-contain` (correct for showing full images) but the image containers are constrained by rigid flex ratios (55% image / 45% text) that don't leave enough room. The image area gets clipped by `overflow-hidden`.

### Changes

**`src/components/book/BookSpread.tsx`** — all page template functions:
- Reduce padding: `p-5` → `p-3`, `p-8` → `p-4`
- Reduce divider margins: `my-4` → `my-1`, `my-2` → `my-1`
- Add `overflow-y-auto` to text containers so long messages scroll instead of being cut off
- Change default image/text split ratio from `0.55` to `0.45` to give more room to text
- In `TextOnlyPage`, remove the duplicate quoted excerpt that wastes space
- In `FullImageCaptionPage`, remove `line-clamp-3` so text isn't artificially truncated

**`src/components/submission/ImageGallery.tsx`**:
- Change `object-contain` to `object-cover` so images fill their containers without letterboxing (the current approach leaves large beige gaps around images)
- This matches what users expect from a printed book — images fill the frame

### Files to change
- `src/components/book/BookSpread.tsx`
- `src/components/submission/ImageGallery.tsx`

