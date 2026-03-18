

## Fix: Eliminate All Image Latency in Onboarding Tour

### Root Cause

The images are preloaded into browser cache via `new Image()`, but when the user advances to an image step, the browser still needs to **decode** the image data for rendering. The `decoding="async"` attribute explicitly allows this to happen after paint, causing the ~0.5s pop-in. The 30ms crossfade timeout adds to the perceived delay.

### Solution: Pre-render all images in the DOM (hidden)

Instead of only mounting images when their step is active, **render every tour image in the DOM from the start**, hidden with `display: none`. This forces the browser to fully decode and rasterize them upfront. When a step becomes active, the image is already decoded and composited — it appears instantly.

### Changes to `src/components/onboarding/OnboardingTour.tsx`

1. **Add a hidden pre-render block** after the gate check passes: render all tour images in a `div` with `display: none`. This ensures every `<img>` element is mounted and decoded by the browser before any step needs it.

2. **Change `decoding="async"` to `decoding="sync"`** on the visible tour images so the browser blocks paint until the (already-cached) image is decoded.

3. **Remove the crossfade delay** — reduce the `setTimeout` from 30ms to 0ms (or remove it entirely) so step transitions feel instant.

### Technical Detail

```text
Before (current flow):
  Step change → mount <img> → browser fetches from cache → async decode → paint
  Result: ~500ms visible delay

After (fixed flow):
  Tour opens → all <img> pre-mounted hidden → browser decodes all upfront
  Step change → show already-decoded <img> with decoding="sync" → instant paint
  Result: 0ms visible delay
```

**Single file changed**: `src/components/onboarding/OnboardingTour.tsx`

