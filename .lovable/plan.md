

## Standardized Cover Themes — Standard Edition Only

### What changes

**1. Database migration**
- Add `cover_theme text NOT NULL DEFAULT 'dark'` to `vaults` table.

**2. Logo assets**
- `src/assets/logo-dark.png` ← uploaded `Mission_Memory_Vault.png` (dark text, for light `#f4f1ec` background)
- `src/assets/logo-light.png` ← uploaded `Mission_Memory_Vault_1.png` (light text, for dark `#2b2b2a` background)

**3. New `VaultCover.tsx` component**
- Props: `missionaryName`, `theme: 'light' | 'dark'`, `className?`
- Light: `#f4f1ec` bg, `logo-dark.png`, missionary name in `#2b2b2a`
- Dark: `#2b2b2a` bg, `logo-light.png`, missionary name in `#f4f1ec`
- No heirloom logic — that's handled at purchase time.

**4. `CreateVaultModal.tsx`**
- Remove file upload (fileRef, uploading state, handleCoverUpload, storage call, cover URL state).
- Add theme picker: two clickable preview boxes showing light/dark covers with live missionary name.
- Pass `cover_theme` instead of `cover_image_url`.

**5. Update display locations**
- `VaultCard.tsx` — replace cover image with `<VaultCover>`.
- `VaultDetail.tsx` — replace cover thumbnail with `<VaultCover>`.
- `BookSpread.tsx` — replace cover image with `<VaultCover>`.
- `Landing.tsx` — update demo vault to use themed cover.

**6. Update hooks/types**
- `useVaults.ts`: replace `cover_image_url` param with `cover_theme` in `createVault`.
- `src/types/index.ts`: add `cover_theme: 'light' | 'dark'` to `Vault` interface.

### Files

| File | Change |
|---|---|
| Migration SQL | Add `cover_theme` column |
| `src/assets/logo-dark.png` | New asset |
| `src/assets/logo-light.png` | New asset |
| `src/components/vault/VaultCover.tsx` | New component |
| `src/components/vault/CreateVaultModal.tsx` | Remove upload, add theme picker |
| `src/components/vault/VaultCard.tsx` | Use VaultCover |
| `src/pages/VaultDetail.tsx` | Use VaultCover |
| `src/components/book/BookSpread.tsx` | Use VaultCover |
| `src/pages/Landing.tsx` | Update demo vault |
| `src/hooks/useVaults.ts` | Update createVault params |
| `src/types/index.ts` | Add cover_theme |

