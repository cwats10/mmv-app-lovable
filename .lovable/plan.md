

## Consolidate to Lovable Cloud Database

All hooks and pages currently import from `src/lib/supabase.ts`, which points to an external project (`pcsdjwtzmluiafsakocf`). We need to switch everything to the Lovable Cloud client at `src/integrations/supabase/client.ts` (`fzbeebomtlynnypalxou`).

### Changes

**Delete:** `src/lib/supabase.ts`

**Update imports** in these 12 files — replace `import { supabase } from '@/lib/supabase'` with `import { supabase } from '@/integrations/supabase/client'`:

| File |
|---|
| `src/hooks/useAuth.ts` |
| `src/hooks/useVaults.ts` |
| `src/hooks/useBook.ts` |
| `src/hooks/useSubmissions.ts` |
| `src/hooks/useReferral.ts` |
| `src/pages/Admin.tsx` |
| `src/pages/Checkout.tsx` |
| `src/pages/Contribute.tsx` |
| `src/pages/Manage.tsx` |
| `src/components/book/PurchaseModal.tsx` |
| `src/components/submission/SubmissionForm.tsx` |
| `src/components/vault/CreateVaultModal.tsx` |

**Fix auth race condition** in `useAuth.ts`: let `getSession()` set initial state, and `onAuthStateChange` handle only subsequent updates — avoids double profile fetches on mount.

No database migrations needed. The Lovable Cloud project already has the same schema. Edge functions already use the correct project via environment variables.

