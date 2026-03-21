

## Re-add Message Bank to Vault Detail Page

The `MessageBank` component already exists at `src/components/dashboard/MessageBank.tsx` but is not imported or rendered anywhere. It was likely dropped during earlier edits.

### What changes

**`src/pages/VaultDetail.tsx`**
- Import `MessageBank` from `@/components/dashboard/MessageBank`
- Destructure `profile` from `useAuth()` (already available in the hook)
- Render `<MessageBank vaults={[vault]} profile={profile} />` at the bottom of the vault page, just above the Delete Vault section
- Wrap it with a `<Divider>` for visual separation

That's it — one file, three small additions. No new components or database changes needed.

