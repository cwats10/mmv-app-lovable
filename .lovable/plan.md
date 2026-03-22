

## Fix Three Issues: Text Duplication, Page Count Integrity, Book Dimensions

### Problem 1: Two-page spread duplicates text
In `BookSpread.tsx`, the spread creates `page1Submission` and `page2Submission` that both carry the full `submission.message`. Each page's template then renders the entire message. Page 2 should show the continuation of the text, not a copy.

**Fix in `BookSpread.tsx`**: Split the message text between pages. Page 1 gets the first half (by paragraph or character midpoint), page 2 gets the second half. Same approach needed in `PagePreview.tsx` for the contributor preview.

### Problem 2: Page count must be respected regardless of submission history
Currently `BookSpread.tsx` checks `vault.contributor_page_allowance` to decide whether to render a spread. If a contributor submitted with a 2-page allowance and the owner later changes it to 1, the book should render as 1 page. If submitted as 1 page, it stays 1 page even if allowance changes to 2.

**Fix in `BookSpread.tsx`**: Render based on `vault.contributor_page_allowance` (already does this). But a submission created under a 1-page allowance should not be expanded to 2 pages. Logic: render as spread only if `pageAllowance === 2` AND the submission has `spreadPage2` layout data. If the submission lacks `spreadPage2`, render as single page regardless of vault setting.

### Problem 3: Book dimensions — add 10x10 / 12x12 selection
The cover uses `aspect-square` (1:1) but contributor pages use `aspect-[1/1.3]` (portrait). Both should be square to match the printed book.

**Changes:**
- **`src/types/index.ts`**: Add `book_size` field to `Vault` type (`'10x10' | '12x12'`)
- **Database migration**: Add `book_size text not null default '12x12'` column to `vaults` table
- **`src/components/vault/CreateVaultModal.tsx`**: Add dimension picker (10×10 or 12×12) near the top of the form
- **`src/components/book/BookSpread.tsx`**: Change page aspect ratio from `aspect-[1/1.3]` to `aspect-square` so pages match the square cover
- **`src/components/book/PurchaseModal.tsx`**: Reduce price by $10 when vault `book_size` is `'10x10'`
- **`src/pages/VaultDetail.tsx`**: Show current book size in settings (read-only or editable)

### Files to change
1. **`src/components/book/BookSpread.tsx`** — split message text between pages; only render spread if submission has `spreadPage2` data; change page aspect to square
2. **`src/components/submission/PagePreview.tsx`** — same text-splitting logic for contributor preview
3. **`src/types/index.ts`** — add `book_size` to `Vault`
4. **`src/components/vault/CreateVaultModal.tsx`** — add dimension picker
5. **`src/components/book/PurchaseModal.tsx`** — $10 discount for 10x10
6. **`src/pages/VaultDetail.tsx`** — show/edit book size in settings tab
7. **Database migration** — add `book_size` column to `vaults`

