

## Fix Book Settings Toggle (Pages Per Contributor)

### Root Cause

The toggle buttons in VaultDetail.tsx lack `type="button"` and error handling. If the `updateVault` call fails (e.g., due to a timing issue with auth), the error is thrown but never caught — the click appears to do nothing silently. Additionally, the async flow between two separate hooks (`useVaults.updateVault` + `useVault.refetch`) introduces unnecessary complexity.

### Plan

**`src/pages/VaultDetail.tsx`**
1. Add `type="button"` to both toggle buttons
2. Wrap the `onClick` handler in try/catch with a toast error notification
3. Add a local loading state so the user sees feedback during the update

**`src/hooks/useVaults.ts`**
4. Add an `updateVault` method directly to the `useVault` (singular) hook so VaultDetail doesn't need to juggle two hooks for one operation. This keeps the update and refetch in the same hook, eliminating race conditions.

### Files changed
- `src/hooks/useVaults.ts` — add `updateVault` to `useVault` hook
- `src/pages/VaultDetail.tsx` — use the new single-hook update, add `type="button"`, add error handling

