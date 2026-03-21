
## Remove Horizontal Side-Scrolling Across the App

### What’s causing it
From the current code, the side-scrolling is coming from several repeated responsive issues, not just one page:

- **Shared nav/layouts** use wide horizontal padding and non-wrapping header rows
- **Button/tab rows** on `VaultDetail`, `BookDetail`, `Manage`, and `MessageBank` stay in one line on small widths
- **Fixed bottom/action bars** don’t stack on mobile
- A few sections use `justify-between` + non-shrinking side panels, which forces overflow at tablet/mobile widths

### Implementation plan

#### 1. Fix shared shells first
Update the common layout wrappers so pages don’t overflow by default:
- `src/components/layout/AppShell.tsx`
- `src/components/layout/DashboardNav.tsx`
- `src/components/layout/PublicShell.tsx`

Changes:
- Reduce horizontal padding on small screens (`px-4`, then scale up)
- Let nav/header content **wrap or stack** on smaller breakpoints
- Add `overflow-x-hidden` as a safety net on the top-level shell containers

#### 2. Make Vault page fully responsive
Update `src/pages/VaultDetail.tsx` so no section requires sideways movement:
- Allow breadcrumb/header/actions to wrap cleanly
- Make the tab bar fit mobile better:
  - either smaller triggers with wrapping
  - or switch to a 2-row layout on very small screens
- Ensure settings toggle buttons stack if needed
- Keep cards full-width with no fixed-width behavior

#### 3. Fix Book page overflow sources
Update `src/pages/BookDetail.tsx`:
- Stack the top header and action controls on tablet/mobile
- Make filter tabs wrap instead of forcing one row
- Make the reorder button/list fit narrow widths
- Convert the fixed purchase bar into a **stacked mobile layout** so text + CTA don’t push past screen width

#### 4. Fix Manager review page overflow
Update `src/pages/Manage.tsx`:
- Stack the hero header content vertically on small screens
- Remove the rigid right-side permission box layout that currently forces width
- Make review filter buttons wrap
- Keep submission cards fluid

#### 5. Fix Message Bank tab rows
Update `src/components/dashboard/MessageBank.tsx`:
- Main tab row should wrap on smaller screens
- Platform buttons should remain multi-row and compact
- Make card headers/buttons stack if space gets tight

#### 6. Tighten reusable card/content components where needed
Review and adjust any components that commonly create overflow:
- `src/components/submission/SubmissionCard.tsx`
- `src/components/book/PageReorderList.tsx`
- share link widgets if needed

Changes:
- add `min-w-0` where text must shrink
- allow action rows to wrap
- avoid long inline content forcing container width

### Design approach
I would fix this as a **responsive system pass**, not a one-off patch:
- mobile-first spacing
- wrapped/staked action rows
- no single-line control bars unless there is room
- small-screen-safe tabs, filters, and fixed bars

### Files likely to change
- `src/components/layout/AppShell.tsx`
- `src/components/layout/DashboardNav.tsx`
- `src/components/layout/PublicShell.tsx`
- `src/pages/VaultDetail.tsx`
- `src/pages/BookDetail.tsx`
- `src/pages/Manage.tsx`
- `src/components/dashboard/MessageBank.tsx`
- `src/components/submission/SubmissionCard.tsx`
- `src/components/book/PageReorderList.tsx`

### Expected result
After this pass, the app should:
- have **no horizontal scrolling** on phone, tablet, or smaller desktop windows
- keep controls readable without squeezing
- preserve the current look/brand while feeling much cleaner and easier to use across screen sizes
