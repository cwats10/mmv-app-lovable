

## Reorganize Vault Detail Page with Tabs

### Current Problem
Six distinct sections stacked vertically require excessive scrolling. The page feels like a long form rather than a dashboard.

### New Layout

**Always visible (top):**
- Breadcrumb + header (missionary name, mission, dates) — unchanged
- Stats row (4 boxes) — made more compact (smaller padding)
- Book status card with "Review Book" button — stays prominent

**Tabbed section below (3 tabs):**

```text
[ Sharing ]  [ Settings ]  [ Message Bank ]
```

- **Sharing tab**: Contributor share widget + Manager link widget stacked (or side-by-side on wider screens via a 2-column grid)
- **Settings tab**: Book settings (page allowance toggle) + Delete vault button at bottom
- **Message Bank tab**: The existing MessageBank component, unchanged

### Technical approach

Uses the existing `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` components from `@/components/ui/tabs` (already in the project).

### Files changed
- `src/pages/VaultDetail.tsx` — restructure into tabbed layout, import Tabs components, reduce stats padding

No new components or database changes needed.

