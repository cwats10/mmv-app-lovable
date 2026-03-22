

## Fix: Contributor name/relation getting cut off on book pages

### Problem
The `ContributorFooter` (name + relationship) is being clipped at the bottom of pages — particularly visible on the right page of a two-page spread. The text area uses `overflow-y-auto` or `overflow-hidden` and the footer has no guaranteed minimum space, so when the message text is long, the footer gets pushed out of view.

### Solution
Ensure the `ContributorFooter` never gets pushed out by making the message text area shrinkable while the footer remains fixed:

1. **`ContributorFooter`** — add `shrink-0` (flex-shrink: 0) so it never collapses.

2. **All template layouts** (`ImageTopTextBottomPage`, `TextTopImageBottomPage`, `SideBySideLeftPage`, `SideBySideRightPage`, `TextOnlyPage`, `FullImageCaptionPage`) — restructure the text section so:
   - The message `<p>` is inside a `min-h-0 flex-1 overflow-y-auto` container (it scrolls/clips if too long).
   - The `ContributorFooter` sits outside that scrollable area with `flex-shrink-0`, guaranteeing it's always visible.

### File changed
- `src/components/book/BookSpread.tsx` — add `shrink-0` to `ContributorFooter` wrapper and ensure each template wraps the message in a scrollable flex-1 div while keeping the footer pinned.

