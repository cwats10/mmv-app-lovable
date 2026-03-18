

## Onboarding Tour Cleanup

### What changes

**1. Remove Step 5 image**
- Delete the `image: memoriesPreservedImg` from the "Memories Are Never Lost" step definition.
- Remove the `memoriesPreservedImg` import (and delete `src/assets/onboarding/memories-preserved.png`).

**2. Prevent image lag with a "gate" approach**
The current preloading strategy fires off `new Image()` on mount but the browser still has to decode and paint the images. The fix:
- **Don't render the tour at all until every image is loaded.** Add a derived `allImagesReady` boolean. While false, render nothing (or a subtle loading spinner on the backdrop). This guarantees zero layout shifts or flickers on any step.
- Remove the per-step `currentImagesReady` / `Skeleton` fallback — it's no longer needed since everything is ready before step 1 appears.

**3. Minimal, cleaner layout**
- Reduce `CARD_W_IMAGE` from 620 → 520 for a tighter card that still shows images clearly.
- Add `maxWidth: '90vw'` so it doesn't overflow on smaller viewports.
- Use a subtle crossfade between steps instead of the current slide-up (`translateY`) — change the transition to opacity-only for a calmer feel.

### Files modified

| File | Change |
|---|---|
| `src/components/onboarding/OnboardingTour.tsx` | Remove step 5 image, gate rendering on `allImagesReady`, shrink image card width, simplify transition |
| `src/assets/onboarding/memories-preserved.png` | Delete |

### Technical detail

```text
Mount
  ├─ useEffect: preload all images → track in loadedImages state
  ├─ allImagesReady = all unique image srcs are in loadedImages
  ├─ if (!allImagesReady) → render only the dark backdrop + a small spinner
  └─ else → render full tour (no Skeleton fallback needed per-step)
```

