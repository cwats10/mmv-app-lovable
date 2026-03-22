# Mission Memory Vault — MVP Readiness Phase 2: Beyond Code Bugs

This analysis covers missing features, broken flows, business logic gaps, legal requirements, and infrastructure issues that must be addressed before launching a sellable MVP.

---

## CATEGORY A — DEAD-END FEATURES (Built but unreachable)

### A1. Manager route doesn't exist — links lead to 404
**Bug:** `Manage.tsx` is fully implemented (297 lines), but `/manage/:token` is never added to `App.tsx` routes. Every manager link you share leads to a 404 page.

**Lovable Prompt:**
> In `src/App.tsx`, add a new route for the manager page. Import the Manage component with `const Manage = lazy(() => import('./pages/Manage'));` and add the route `<Route path="/manage/:token" element={<Manage />} />` alongside the other routes. This page is already fully built in `src/pages/Manage.tsx` but was never connected to the router. It allows people with a manager token to approve/reject submissions without needing an account.

---

### A2. Onboarding tour built but never shown
**Bug:** `OnboardingTour.tsx` is a complete 8-step guided walkthrough component, but it's never imported or rendered anywhere. New users get zero guidance.

**Lovable Prompt:**
> In `src/pages/Dashboard.tsx`, import and render the `OnboardingTour` component from `@/components/onboarding/OnboardingTour`. Show it only for new users — check if the user has zero vaults and has never dismissed the tour (store dismissal in localStorage with key `mmv_tour_dismissed`). The tour component already exists and is fully functional — it just needs to be connected to the Dashboard page.

---

### A3. Password reset page exists but route is missing
**Bug:** `ResetPassword.tsx` is implemented, but there may not be a proper route for it, and the Auth page has no "Forgot password?" link to trigger the flow.

**Lovable Prompt:**
> Verify that `src/App.tsx` has a route for `/reset-password` pointing to the ResetPassword component. If missing, add it with `const ResetPassword = lazy(() => import('./pages/ResetPassword'));` and `<Route path="/reset-password" element={<ResetPassword />} />`. Then in `src/pages/Auth.tsx`, add a "Forgot password?" link below the password field on the sign-in form that calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })` and shows a confirmation message.

---

## CATEGORY B — CRITICAL BUSINESS LOGIC GAPS

### B1. Users can purchase a book with zero approved submissions
**Bug:** The "Purchase & Print" button appears as long as the book isn't locked, even with 0 approved submissions. If they pay, Stripe charges them, then `trigger-pipeline` fails with "No approved submissions found." Customer is charged but gets nothing.

**Lovable Prompt:**
> In `src/pages/BookDetail.tsx`, disable the "Purchase & Print" button when there are zero approved submissions. Show a message like "Approve at least one submission before purchasing your book." Also in `src/components/book/PurchaseModal.tsx`, add a check at the top of the purchase handler — if the number of approved submissions passed as a prop is 0, show an error and return early. Do NOT allow the Stripe checkout session to be created without at least 1 approved submission.

---

### B2. Only one book per vault — no second editions
**Bug:** The `books` table has a UNIQUE constraint on `vault_id`. Users who want a second edition with new submissions cannot create another book for the same vault.

**Lovable Prompt:**
> This is a design decision to address. For MVP, add a clear message on the VaultDetail page when a book has already been purchased: "Your book has been ordered. New submissions will be saved for a future edition." On the vault card in the dashboard, show the book status badge (purchased/printing/delivered). For now, don't allow creating a second book — but make the limitation clear to users instead of silently blocking them.

---

### B3. $10 size discount calculated client-side but NOT sent to Stripe
**Bug:** In `PurchaseModal.tsx` (line 33), the $10 discount for 10x10 books is subtracted from the displayed "Estimated Total" but the full price is sent to Stripe. Customer sees $139, gets charged $149.

**Lovable Prompt:**
> In `supabase/functions/create-checkout-session/index.ts`, apply the book size discount server-side. If the vault's `book_size` is '10x10', subtract 1000 cents ($10) from the base price before creating the Stripe checkout session. Remove the client-side discount calculation from `src/components/book/PurchaseModal.tsx` — the server should be the source of truth for pricing. Display the final price from the server response, not a client-side calculation.

---

### B4. No shipping cost or sales tax calculation
**Bug:** Users see a total that is just the book price. No shipping charges, no tax. This will cause problems with US sales tax obligations and customer surprise at potential additional charges.

**Lovable Prompt:**
> For MVP, add a note below the total in `src/components/book/PurchaseModal.tsx` that says "Shipping included. Sales tax may apply at checkout." Then in `supabase/functions/create-checkout-session/index.ts`, enable Stripe's automatic tax calculation by adding `automatic_tax: { enabled: true }` to the session creation parameters, and set `shipping_options` with a flat-rate shipping option. This lets Stripe handle tax calculation based on the delivery address.

---

### B5. No minimum submission count shown to users
**Bug:** Users have no idea how many submissions they need for a good book. They could buy a book with 1 submission and be disappointed.

**Lovable Prompt:**
> On the `src/pages/VaultDetail.tsx` page, add a progress indicator near the submissions section. Show something like "5 of 10 recommended submissions approved" with a progress bar. Set the recommended minimum at 10 submissions. If they have fewer than 5 approved submissions, show a yellow warning: "We recommend at least 10 submissions for a great book. You currently have X approved." Don't block purchase, just inform.

---

### B6. Character limits not enforced on backend — PDF can overflow
**Bug:** `SubmissionForm.tsx` has client-side character limits, but the database `submissions.message` column is unlimited TEXT. Someone bypassing the frontend (or a future API) could submit 10,000 characters that overflow the PDF layout.

**Lovable Prompt:**
> In the Supabase database, add a CHECK constraint to the `submissions` table that limits the `message` column to 5000 characters maximum: `ALTER TABLE submissions ADD CONSTRAINT message_length CHECK (char_length(message) <= 5000);`. Also in the submission insert logic in `src/hooks/useSubmissions.ts`, validate message length before inserting and show an error toast if it exceeds the limit.

---

## CATEGORY C — MISSING LEGAL REQUIREMENTS

### C1. No Terms of Service page
**Impact:** You're collecting personal data, processing payments, and printing physical books. Without ToS, you have no legal framework for disputes, refunds, or liability.

**Lovable Prompt:**
> Create a new page at `src/pages/Terms.tsx` with a Terms of Service page. Use the same layout as the Landing page (PublicShell wrapper). Add a route for `/terms` in App.tsx. Include sections for: Acceptance of Terms, Description of Service, User Accounts, Submissions & Content Ownership, Payment & Refunds, Privacy, Limitation of Liability, and Contact Information. Use placeholder text that I can review with a lawyer, but structure it properly. Add a link to this page in the footer component.

---

### C2. No Privacy Policy page
**Impact:** Required by law in most jurisdictions. You're collecting names, emails, photos, payment info, and shipping addresses.

**Lovable Prompt:**
> Create a new page at `src/pages/Privacy.tsx` with a Privacy Policy page. Use the same layout as Terms. Add a route for `/privacy` in App.tsx. Include sections for: Information We Collect (account data, submissions, photos, payment info, shipping addresses), How We Use Information, Data Storage (mention Supabase), Third-Party Services (Stripe, print-on-demand provider), Data Retention, User Rights (access, deletion), Children's Privacy, and Contact Information. Add a link in the footer next to Terms of Service.

---

### C3. No photo consent in the submission form
**Impact:** Contributors upload photos of real people (missionaries, families). Without consent acknowledgment, you're liable for unauthorized use of someone's likeness in a printed book.

**Lovable Prompt:**
> In `src/components/submission/SubmissionForm.tsx`, add a required checkbox before the submit button that says: "I confirm that I have the right to share these photos and stories, and I grant Mission Memory Vault permission to include them in a printed book." The submit button should be disabled until this checkbox is checked. Style it with a small checkbox and text in the muted-text color, matching the existing design system.

---

## CATEGORY D — MISSING EMAIL NOTIFICATIONS

### D1. No email system at all
**Impact:** The app has zero email functionality. No signup confirmation, no submission notifications, no order confirmations, no shipping updates. Users are in the dark after every action.

**Lovable Prompt:**
> Set up email notifications using Supabase Edge Functions and a transactional email service. Create a new edge function called `send-email` that accepts a `to`, `subject`, `template`, and `data` parameter. For MVP, implement these email triggers:
> 1. After a new submission is created (notify vault owner): "You received a new memory from [contributor_name]"
> 2. After book purchase (notify buyer): "Your Memory Book order is confirmed — Order #[book_id]"
> 3. After book status changes to 'printing' (notify buyer): "Your Memory Book is being printed!"
> Use Supabase's built-in email or integrate with Resend (resend.com) which has a generous free tier. Add the email send calls to the relevant edge functions (stripe-webhook for order confirmation, trigger-pipeline for printing notification). For submission notifications, add a database trigger or modify the submission insert flow.

---

## CATEGORY E — ACCOUNT MANAGEMENT GAPS

### E1. No account settings page
**Impact:** Users cannot change their name, email, or password after signup. No way to view or manage their account.

**Lovable Prompt:**
> Create a new page at `src/pages/Settings.tsx` with an account settings form. Add a route for `/settings` in App.tsx (protected, requires auth). Include sections for: 1) Profile — edit name, with a save button that calls `supabase.from('profiles').update({ name }).eq('id', user.id)`. 2) Email — show current email with a "Change Email" button that calls `supabase.auth.updateUser({ email: newEmail })`. 3) Password — change password form with current and new password fields. 4) Danger Zone — "Delete My Account" button with confirmation dialog. Add a "Settings" link to the dashboard navigation in `src/components/layout/DashboardNav.tsx`.

---

### E2. Cannot delete vaults that have submissions
**Bug:** Database has `ON DELETE RESTRICT` on submissions → vaults. Users cannot delete a vault once anyone has submitted to it.

**Lovable Prompt:**
> In `src/hooks/useVaults.ts`, update the `deleteVault` function to first delete all submissions associated with the vault before deleting the vault itself. Add a confirmation dialog in the UI that warns: "This will permanently delete this vault and all [X] submissions. This cannot be undone." Only show the delete option if the vault's book status is NOT 'purchased' or 'printing' (don't let them delete a vault with an active order). Run the deletes in order: submissions first, then book (if exists), then vault.

---

## CATEGORY F — INFRASTRUCTURE & SECURITY

### F1. Submission-media storage bucket is publicly writable
**Bug:** Anyone can upload files to the `submission-media` bucket without authentication. This is an abuse vector — someone could fill your storage with junk files.

**Lovable Prompt:**
> In the Supabase dashboard, update the `submission-media` storage bucket policy. Change the INSERT policy from allowing anonymous uploads to requiring authentication OR a valid submission token. The current policy allows anyone to upload. For MVP, at minimum require that the uploader is authenticated OR that the upload path matches a valid vault's submission token pattern. Also add a file size limit of 10MB per file in the storage policy.

---

### F2. Book PDFs are publicly accessible
**Bug:** The `book-pdfs` bucket is public. Anyone with a PDF URL can access someone's personal memory book — including all photos and messages.

**Lovable Prompt:**
> In the Supabase dashboard, change the `book-pdfs` storage bucket from `public: true` to `public: false`. Then update any code that reads the PDF URL to use Supabase's `createSignedUrl()` method instead of direct public URLs. In `src/pages/BookDetail.tsx` or wherever the PDF download link is shown, generate a signed URL with a 1-hour expiration: `supabase.storage.from('book-pdfs').createSignedUrl(path, 3600)`. This ensures only the vault owner can access their book PDF.

---

### F3. Stripe webhook doesn't handle refunds or failed payments
**Bug:** `stripe-webhook/index.ts` only handles `checkout.session.completed`. If a payment fails, is refunded, or disputed, the app doesn't know. Books could stay in "purchased" status even after a refund.

**Lovable Prompt:**
> In `supabase/functions/stripe-webhook/index.ts`, add handlers for additional Stripe events: 1) `charge.refunded` — update the book status back to 'review' and set stripe_payment_intent_id to null. 2) `charge.failed` — log the failure (no book status change needed since checkout.session.completed wouldn't have fired). 3) `charge.dispute.created` — update a new `disputed` flag on the book record. Add these event types to the webhook configuration in your Stripe dashboard as well.

---

### F4. Missing database indexes for performance
**Bug:** No indexes on frequently queried columns. As data grows, queries will slow down significantly.

**Lovable Prompt:**
> Create a new Supabase migration that adds indexes for performance. Add these indexes:
> ```sql
> CREATE INDEX idx_vaults_owner_id ON vaults(owner_id);
> CREATE INDEX idx_submissions_vault_id_status ON submissions(vault_id, status);
> CREATE INDEX idx_books_vault_id ON books(vault_id);
> CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
> CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);
> CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
> ```
> These cover the most common query patterns in the app.

---

### F5. No enum constraints on database TEXT columns
**Bug:** `cover_theme`, `book_size`, and `vault_type` are stored as plain TEXT with no CHECK constraints. Invalid values can be inserted.

**Lovable Prompt:**
> Create a Supabase migration that adds CHECK constraints to enum-like columns:
> ```sql
> ALTER TABLE vaults ADD CONSTRAINT valid_cover_theme CHECK (cover_theme IN ('light', 'dark'));
> ALTER TABLE vaults ADD CONSTRAINT valid_book_size CHECK (book_size IN ('10x10', '12x12'));
> ALTER TABLE vaults ADD CONSTRAINT valid_vault_type CHECK (vault_type IN ('pre', 'post'));
> ALTER TABLE books ADD CONSTRAINT valid_book_status CHECK (status IN ('collecting', 'review', 'purchased', 'printing', 'delivered'));
> ALTER TABLE submissions ADD CONSTRAINT valid_submission_status CHECK (status IN ('pending', 'approved', 'rejected'));
> ```
> This prevents invalid data from entering the database.

---

## CATEGORY G — USER EXPERIENCE GAPS

### G1. No order tracking after purchase
**Bug:** After paying $149-449, the user sees "Your book is on its way" and then... nothing. No order status page, no tracking number, no estimated delivery date. Complete dead end.

**Lovable Prompt:**
> Add an order status section to `src/pages/VaultDetail.tsx` that shows when a book has been purchased. Display a timeline/stepper with these stages: "Order Placed" → "Generating PDF" → "Sent to Printer" → "Shipped" → "Delivered". Highlight the current stage based on the book's status field. If the book has a `pod_order_id`, show it as a reference number. Add text like "Estimated delivery: 2-3 weeks after printing begins." Below the timeline, add a "Questions about your order? Contact support@missionmemoryvault.com" link.

---

### G2. Checkout confirmation page shows no order details
**Bug:** After successful payment, `Checkout.tsx` shows "Your book is on its way" but no order number, no price paid, no shipping address confirmation, no estimated timeline.

**Lovable Prompt:**
> In `src/pages/Checkout.tsx`, after successful verification, fetch the book details and display: 1) Order reference number (book ID), 2) Missionary name (from vault), 3) Book tier (Classic or Heirloom), 4) Shipping address, 5) Estimated timeline ("Your book will be printed and shipped within 2-3 weeks"). Update the verify-checkout-session function to return the book and vault details in its response so the checkout page can display them.

---

### G3. No way to see pricing before deep in the purchase flow
**Bug:** Users don't learn about $149/$449 pricing until they click "Purchase" and open the modal.

**Lovable Prompt:**
> On `src/pages/Landing.tsx`, add a pricing section below the features section. Show two cards side by side: "Classic Edition — 10×10 — $149" and "Heirloom Edition — 12×12 — $449". List what's included: "Museum-quality printing, Hardcover binding, All approved submissions, Free shipping." Add "Extra copies available" below each card. Also on `src/pages/VaultDetail.tsx`, show the price near the Purchase button: "Classic 10×10 — Starting at $149" based on the vault's book_size.

---

## SUMMARY

| Category | Count | Priority |
|----------|-------|----------|
| A. Dead-end features | 3 | Fix immediately — these are already built |
| B. Business logic gaps | 6 | Fix before taking payments |
| C. Legal requirements | 3 | Fix before public launch |
| D. Email notifications | 1 (covers 3+ emails) | Fix before launch |
| E. Account management | 2 | Fix before launch |
| F. Infrastructure/security | 5 | Fix before launch |
| G. User experience | 3 | Fix before launch |
| **Total** | **23** | |

### Recommended Fix Order:
1. **Category A** (30 min each in Lovable) — Unblock features you already built
2. **B1** — Block purchase with 0 submissions (prevents charging customers for nothing)
3. **B3** — Fix the price mismatch between display and Stripe charge
4. **C3** — Add photo consent checkbox (legal protection, 10 min fix)
5. **F1 & F2** — Lock down storage buckets (security)
6. **C1 & C2** — Add Terms and Privacy pages
7. **D1** — Set up email notifications
8. **G1 & G2** — Add order tracking and confirmation details
9. Everything else in B, E, F, G
