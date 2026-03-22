# Mission Memory Vault — MVP Readiness Analysis

## Context

Mission Memory Vault is a web app that lets users create digital "vaults" to collect memories about missionaries, then compile them into printed books. Built with React + Supabase + Stripe on Lovable. The goal is to identify every bug, gap, and issue blocking a sellable MVP and provide copy-paste Lovable prompts to fix each one.

---

## TIER 1 — CRITICAL (Will break the app or lose money)

### 1. Payment verification is broken — `client_id` column doesn't exist
**File:** `supabase/functions/verify-checkout-session/index.ts` (line 45)
**Bug:** The query references `vaults(client_id)` but the actual column is `owner_id`. This means **every checkout verification will fail** after a customer pays — they'll see "Something went wrong" even though Stripe charged them.

**Lovable Prompt:**
> In the file `supabase/functions/verify-checkout-session/index.ts`, there is a critical bug. On the line that queries books with `.select('id, vault_id, vaults(client_id)')`, change `client_id` to `owner_id`. Also update the type cast on the next line from `{ client_id: string }` to `{ owner_id: string }` and change `.client_id` to `.owner_id` in the ownership check. The vaults table uses `owner_id`, not `client_id`.

---

### 2. Index page is a Lovable placeholder — not your app
**File:** `src/pages/Index.tsx`
**Bug:** The root `/` route shows a generic Lovable placeholder image with a `REMOVE_THIS` data attribute. Any visitor hitting your homepage sees a broken page.

**Lovable Prompt:**
> Replace the entire contents of `src/pages/Index.tsx`. Instead of the placeholder, make it redirect to `/landing` using React Router's `Navigate` component. Import `Navigate` from `react-router-dom` and return `<Navigate to="/landing" replace />`. Remove the placeholder SVG image entirely.

---

### 3. Duplicate Supabase client causing potential auth desync
**Files:** `src/lib/supabase.ts` AND `src/integrations/supabase/client.ts`
**Bug:** Two separate Supabase client instances exist. If any component imports from `src/lib/supabase.ts`, it uses a different client with different auth state (and placeholder fallback values). This can cause authenticated requests to silently fail.

**Lovable Prompt:**
> Delete the file `src/lib/supabase.ts` entirely. Search the entire codebase for any imports from `@/lib/supabase` or `../lib/supabase` and replace them with imports from `@/integrations/supabase/client`. There should only be one Supabase client instance in the app, the one in `src/integrations/supabase/client.ts`.

---

### 4. Profile type missing `reward_balance` — rewards silently fail
**File:** `src/types/index.ts`
**Bug:** The `Profile` interface doesn't include `reward_balance` (added in migration 005). The checkout flow reads this field to apply discounts, but TypeScript won't catch if it's undefined, leading to silent $0 discounts or NaN errors.

**Lovable Prompt:**
> In `src/types/index.ts`, add `reward_balance: number;` to the `Profile` interface, after the `referred_by` field. This field was added in database migration 005_referral_rewards.sql and tracks the user's referral reward balance in dollars.

---

## TIER 2 — HIGH (Bad user experience, will lose customers)

### 5. No email validation on auth forms
**File:** `src/pages/Auth.tsx`
**Bug:** Users can submit empty or malformed emails. No client-side validation before hitting Supabase, resulting in cryptic error messages.

**Lovable Prompt:**
> In `src/pages/Auth.tsx`, add email format validation before calling signUp or signIn. Check that the email matches a basic email regex pattern (contains @ and a domain). Also trim whitespace from the email and name inputs before submission. Show a clear error message like "Please enter a valid email address" if the format is invalid. Also increase the minimum password requirement from 6 to 8 characters with a message like "Password must be at least 8 characters."

---

### 6. Checkout page shows generic error with no recovery path
**File:** `src/pages/Checkout.tsx`
**Bug:** If verification fails (network error, edge function error, etc.), the user just sees "We couldn't confirm your order" with no details, no retry button, and no way to contact support.

**Lovable Prompt:**
> In `src/pages/Checkout.tsx`, improve the error state. Add a "Try Again" button that re-runs the verification by resetting status to 'loading' and re-invoking the verify-checkout-session function. Also add a line that says "If the problem persists, email support@missionmemoryvault.com with your session ID" and display the session_id from the URL so the user can reference it. Also handle the case where verify-checkout-session returns successfully but with an error in the response body (check `data.error` in addition to the `error` parameter).

---

### 7. No confirmation dialog before deleting submissions
**File:** `src/components/submission/SubmissionCard.tsx`
**Bug:** The delete/reject button immediately performs the action with no "Are you sure?" confirmation. A vault owner could accidentally delete a contributor's heartfelt memory with one mis-click.

**Lovable Prompt:**
> In `src/components/submission/SubmissionCard.tsx`, add a confirmation dialog before the reject/delete action. Use the existing AlertDialog component from `@/components/ui/alert-dialog`. When the user clicks reject, show a dialog that says "Are you sure you want to reject this submission from [contributor name]? This action cannot be undone." with "Cancel" and "Yes, reject" buttons. Only call the reject handler if they confirm.

---

### 8. Delivery address validation is too weak for real orders
**File:** `src/components/book/PurchaseModal.tsx`
**Bug:** The address form only checks if fields are non-empty. Users can enter "x" for every field and proceed to a $149+ purchase that will fail at fulfillment.

**Lovable Prompt:**
> In `src/components/book/PurchaseModal.tsx`, add proper validation for the delivery address form. Validate that: zip code matches a 5-digit or ZIP+4 format for US addresses, state is a valid 2-letter US state code (use a dropdown/select instead of a text input), street address is at least 5 characters, and city is at least 2 characters. Show inline validation errors below each field. Also add a country dropdown defaulting to "United States" since you're shipping physical books.

---

### 9. Auth error messages expose too much info / are too cryptic
**File:** `src/pages/Auth.tsx`
**Bug:** Supabase error messages like "User already registered" or "Invalid login credentials" are passed through raw. Some are confusing; others leak info about which emails are registered.

**Lovable Prompt:**
> In `src/pages/Auth.tsx`, map Supabase auth error messages to user-friendly versions. For "User already registered", show "An account with this email already exists. Try signing in instead." For "Invalid login credentials", show "Incorrect email or password. Please try again." For "Email not confirmed", show "Please check your email to confirm your account before signing in." For any other error, show "Something went wrong. Please try again." This prevents leaking internal details to users.

---

### 10. Password reset page has weak minimum strength requirement
**File:** `src/pages/ResetPassword.tsx` (line 38)
**Bug:** Only requires 6 characters. For a paid app handling personal data and payment info, this is too weak.

**Lovable Prompt:**
> In `src/pages/ResetPassword.tsx`, increase the password minimum from 6 to 8 characters. Update the error message to "Password must be at least 8 characters." Also add a check that the password contains at least one letter and one number, with the message "Password must contain at least one letter and one number."

---

## TIER 3 — MEDIUM (Polish issues that affect trust and professionalism)

### 11. Console.log/error statements left in production code
**Files:** `src/pages/NotFound.tsx`, `src/pages/VaultDetail.tsx`, `src/hooks/useVaults.ts`
**Bug:** Console errors visible in browser dev tools look unprofessional and could leak internal details.

**Lovable Prompt:**
> Search the entire codebase for `console.log` and `console.error` statements. Remove all of them from production page components and hooks. In `src/pages/NotFound.tsx`, remove the console.log on line 8. In `src/pages/VaultDetail.tsx`, remove any console.error calls. In `src/hooks/useVaults.ts`, remove the console.error. Replace critical error logging with user-visible toast notifications using the `sonner` toast library that's already installed.

---

### 12. No loading/empty states for dashboard
**File:** `src/pages/Dashboard.tsx`
**Bug:** When a new user signs up and visits the dashboard, they may see a blank screen or a flash before their empty vault list renders. No onboarding or call-to-action.

**Lovable Prompt:**
> In `src/pages/Dashboard.tsx`, add a proper empty state when the user has no vaults. Show a centered card with an illustration or icon, a heading like "Start Your First Memory Vault", a brief description like "Create a vault to start collecting memories, stories, and photos from family and friends.", and a prominent "Create Vault" button that opens the CreateVaultModal. Also ensure there's a loading skeleton while vaults are being fetched.

---

### 13. No real error handling in useAuth fetchProfile
**File:** `src/hooks/useAuth.ts` (line 47-54)
**Bug:** If the profile fetch fails (network issue, RLS misconfiguration), the profile is silently null. The user appears logged in but with no profile data, which can break downstream features like the referral page or admin check.

**Lovable Prompt:**
> In `src/hooks/useAuth.ts`, update the `fetchProfile` function to handle errors from the Supabase query. If the query returns an error, show a toast notification saying "Failed to load your profile. Please refresh the page." using the `sonner` toast library. Also add a retry mechanism — if profile fetch fails, retry once after a 1-second delay before giving up.

---

### 14. Landing page uses hardcoded demo data with fake UUIDs
**File:** `src/pages/Landing.tsx`
**Bug:** Demo vault and submission data use hardcoded UUIDs and Unsplash image URLs. If these URLs go down or change, the landing page breaks visually.

**Lovable Prompt:**
> In `src/pages/Landing.tsx`, download the demo/preview images to your project's public folder instead of linking to external Unsplash URLs. Replace the external image URLs with local paths like `/demo-cover.jpg` and `/demo-submission.jpg`. This ensures the landing page always loads correctly regardless of external service availability.

---

### 15. Submission form has no file size validation for photo uploads
**File:** `src/components/submission/SubmissionForm.tsx`
**Bug:** Contributors can upload up to 6 photos with no individual or total file size limit. A single 50MB RAW photo could cause upload failures or blow through Supabase storage limits.

**Lovable Prompt:**
> In `src/components/submission/SubmissionForm.tsx`, add file size validation for photo uploads. Limit each individual file to 10MB and show an error message like "Each photo must be under 10MB" if a file exceeds this limit. Also limit total combined upload size to 25MB. Only accept image file types (jpg, jpeg, png, webp, heic). Show a clear error toast if a user tries to upload an unsupported file type.

---

### 16. No pagination on vault submission lists
**Files:** `src/hooks/useSubmissions.ts`, `src/pages/VaultDetail.tsx`
**Bug:** All submissions are fetched at once with no pagination. A popular vault with 100+ submissions will have slow load times and poor UX.

**Lovable Prompt:**
> In `src/hooks/useSubmissions.ts`, add pagination to the submission fetch. Load 20 submissions at a time, ordered by creation date. In `src/pages/VaultDetail.tsx`, add a "Load More" button at the bottom of the submissions list that fetches the next 20. Show the total count of submissions (e.g., "Showing 20 of 47 submissions") above the list.

---

## TIER 4 — LOW (Nice-to-have before launch)

### 17. Inconsistent error display patterns across pages
Some pages use red-bordered boxes, others inline text, others nothing. Makes the app feel inconsistent.

**Lovable Prompt:**
> Create a reusable `ErrorBanner` component in `src/components/common/ErrorBanner.tsx` that displays error messages in a consistent style — a red-bordered box with red-50 background and red-600 text, matching the pattern used in `ResetPassword.tsx`. Replace all inline error display patterns across Auth.tsx, PurchaseModal.tsx, and any other pages that show errors to use this shared component.

---

### 18. Missing mobile responsiveness on key pages
The app may not be fully tested on mobile where many users will access it (especially contributors receiving share links on phones).

**Lovable Prompt:**
> Review and fix mobile responsiveness on these critical pages: 1) The Contribute page (`src/pages/Contribute.tsx`) — the submission form should be fully usable on a 375px-wide screen with proper spacing. 2) The Landing page — ensure the hero section, pricing cards, and testimonials stack properly on mobile. 3) The VaultDetail page — ensure the submission cards and book preview are usable on mobile. Test at 375px (iPhone SE) and 390px (iPhone 14) widths.

---

### 19. No "forgot password" link on the sign-in form
**File:** `src/pages/Auth.tsx`
**Bug:** Users who forget their password have no way to reset it from the login screen.

**Lovable Prompt:**
> In `src/pages/Auth.tsx`, add a "Forgot password?" link below the password field on the sign-in form. When clicked, show an inline form that asks for their email and calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`. Show a success message like "Check your email for a password reset link." Use the existing design system styles.

---

### 20. Book pricing not visible until checkout modal
Users don't know what the book costs until they're deep in the purchase flow.

**Lovable Prompt:**
> On the `src/pages/VaultDetail.tsx` page, add a small pricing summary near the "Purchase Book" button area. Show the tier pricing: "Classic 10×10 — $149" or "Heirloom 12×12 — $449" based on the vault's `book_size` setting. If the user has a reward balance, show it as "You have $XX in rewards to apply." This sets pricing expectations before they open the purchase modal.

---

## Summary

| Tier | Count | Impact |
|------|-------|--------|
| Critical | 4 | App-breaking bugs, lost revenue |
| High | 6 | Bad UX, lost customers, weak security |
| Medium | 6 | Trust/polish issues |
| Low | 4 | Nice-to-have improvements |
| **Total** | **20** | |

**Recommended order:** Fix all Tier 1 items first (especially #1 — the payment bug). Then Tier 2. Ship after Tier 2 is done. Tier 3-4 can be post-launch polish.
