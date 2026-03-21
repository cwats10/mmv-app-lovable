

## Fix Vault Settings, Submissions, and Add Missing Features

### Problems Found

From the network errors and code inspection:

1. **Book Settings broken**: The `contributor_page_allowance` column does not exist on the `vaults` table — the PATCH request returns a 400 error.
2. **Submissions broken**: The `page_order` and `page_layout` columns do not exist on the `submissions` table — the SELECT query returns a 400 error, which means no submissions load at all.
3. **Manager invite link missing**: The `ManagerShareWidget` component exists but is not imported or rendered in `VaultDetail.tsx`.
4. **No delete for contributions**: Neither the vault owner nor managers can delete individual submissions.

### Plan

#### 1. Database migration — add missing columns

Run a single migration adding:
- `contributor_page_allowance` (integer, default 1) to `vaults`
- `page_order` (integer, nullable) to `submissions`
- `page_layout` (jsonb, nullable) to `submissions`

#### 2. Add ManagerShareWidget to VaultDetail

Import `ManagerShareWidget` and render it below the existing `VaultShareWidget`, passing `vault.manager_token`. Only show it for the vault owner (using the existing `isOwner` check).

#### 3. Add delete submission capability

- **`useSubmissions.ts`**: Add a `deleteSubmission(id)` function that calls `supabase.from('submissions').delete().eq('id', id)`.
- **`VaultDetail.tsx`** (or the relevant submission list UI): Add a delete button on each submission card for the owner.
- **`Manage.tsx`**: Add the same delete button for managers.
- **Database**: Add an RLS policy allowing vault owners to delete submissions on their vaults (managers already operate via the manager page which may need a separate approach — will check the Manage page pattern).

#### 4. Fix VaultDetail Book Settings UI

Remove the `window.location.reload()` hack. After calling `updateVault`, refetch the vault data instead — update `useVault` to expose a `refetch` method, or use the existing `useVaults.updateVault` flow properly.

### Files changed

- **New migration**: Add 3 columns + 1 RLS policy for owner delete on submissions
- `src/hooks/useSubmissions.ts` — add `deleteSubmission`
- `src/hooks/useVaults.ts` — expose `refetch` on `useVault`
- `src/pages/VaultDetail.tsx` — add ManagerShareWidget, wire delete, fix reload hack
- `src/pages/Manage.tsx` — add delete button for managers (if submissions are shown there)

