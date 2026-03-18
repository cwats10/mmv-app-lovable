

## What's happening

The components exist in the codebase as standalone files, but **none of them are wired into the pages that render them**:

1. **OnboardingTour** — exists at `src/components/onboarding/OnboardingTour.tsx` but is never imported or rendered in `Dashboard.tsx`. The `data-tour` attributes it targets (`new-vault-btn`, `nav-vaults`, `nav-referrals`) are also missing from `DashboardNav.tsx` and the Dashboard buttons.

2. **MessageBank** — exists at `src/components/dashboard/MessageBank.tsx` but is never imported or rendered anywhere.

3. **ManagerShareWidget** — exists at `src/components/vault/ManagerShareWidget.tsx` but is never rendered in `VaultDetail.tsx`. Additionally, the `Vault` type doesn't have a `manager_token` field, and the vaults table likely doesn't have a `manager_token` column yet.

4. **Manage page** — exists at `src/pages/Manage.tsx` with a route at `/manage/:token` but there's no route for it in `App.tsx`.

### Plan

**1. Wire OnboardingTour into Dashboard**
- Import `OnboardingTour` in `Dashboard.tsx`
- Track first-visit state (localStorage flag `mmv_tour_done`)
- Show tour when `!loading && !tourDone`; on complete, set flag and optionally open CreateVaultModal
- Add `data-tour="new-vault-btn"` to the "New Vault" button in Dashboard
- Add `data-tour="nav-vaults"` and `data-tour="nav-referrals"` to the corresponding links in `DashboardNav.tsx`

**2. Wire MessageBank into Dashboard**
- Import and render `MessageBank` below the vault grid (only when vaults exist)
- Pass `vaults` and `profile` props

**3. Wire ManagerShareWidget into VaultDetail**
- Add `manager_token` column to the `vaults` table (migration: `ALTER TABLE public.vaults ADD COLUMN manager_token text UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex')`)
- Add `manager_token` to the `Vault` type in `src/types/index.ts`
- Import and render `ManagerShareWidget` in `VaultDetail.tsx` below the contributor share widget
- Update the vault query in `useVaults.ts` to include `manager_token` if needed

**4. Add /manage/:token route to App.tsx**
- Add lazy import for `Manage` and add `<Route path="/manage/:token" element={<Manage />} />`

**5. Fix profiles 406 error** (bonus — visible in network logs)
- The profiles table has no row for the new user. The `signUp` function does an `update` on a row that doesn't exist yet. Need a database trigger or change `update` to `upsert` so the profile row is created on signup.

