

## Onboarding Tour Fixes

### Changes to `src/components/onboarding/OnboardingTour.tsx`

**Problem 1 — Steps 3, 4, 5 need visual context via user-provided screenshots**

Add an optional `image` field to the `TourStep` interface. For steps 3 (Invite Contributors), 4 (Review/Approve/Delegate), and 5 (Memories Never Lost), render the image inside the tour card above the body text.

Workflow:
1. I'll add the `image` field and rendering logic to the component
2. I'll prompt you to upload three screenshots:
   - The **Contribute page** (share link / submission form) for step 3
   - The **Vault Detail review queue** (approve/reject view) for step 4
   - The **vault archive or timeline view** for step 5
3. Each uploaded image gets saved to `src/assets/onboarding/` and imported into the tour component

The image will render as a rounded, bordered thumbnail (~340px wide) between the title and body text, giving users immediate visual context for these off-screen features.

**Problem 2 — Steps 6 & 7 card blocks the highlighted nav items**

Change the `right` position calculation in `getWrapperStyle` from `rect.top - 20` to `rect.bottom + 10`, so the card appears below the highlighted nav item instead of overlapping it.

### Files to change
- `src/components/onboarding/OnboardingTour.tsx` — add image support + fix positioning
- `src/assets/onboarding/` — new directory for 3 screenshot images (provided by you)

