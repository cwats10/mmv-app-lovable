

## Fix Spread Page Aspect Ratio

### Problem
The two-page spread container uses `aspect-square` (1:1), which means each individual page inside is half that width — resulting in tall portrait rectangles (1:2 ratio), not the intended 1:1 squares.

For two square pages displayed side-by-side, the outer container needs a 2:1 aspect ratio so each half is a perfect square.

### Changes

**`src/components/book/BookSpread.tsx`**
- Change the spread container from `aspect-square` to `aspect-[2/1]` so each page within the spread renders as a square

### Result
- Cover: 1:1 square (unchanged)
- Single pages: 1:1 square (unchanged)
- Spread pages: 2:1 container → each page is 1:1 square
- Back cover: 1:1 square (unchanged)

All pages will match the 10×10 or 12×12 printed book format.

