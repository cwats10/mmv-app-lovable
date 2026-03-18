import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { SubmissionCard } from '@/components/submission/SubmissionCard';
import { BookStatusBadge } from '@/components/book/BookStatusBadge';
import { BookSpread } from '@/components/book/BookSpread';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { PurchaseModal } from '@/components/book/PurchaseModal';
import { useVault } from '@/hooks/useVaults';
import { useBook } from '@/hooks/useBook';
import { useSubmissions } from '@/hooks/useSubmissions';
import { ChevronRight, Eye, X, MapPin } from 'lucide-react';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

export default function BookDetail() {
  const { id: vaultId, bookId } = useParams<{ id: string; bookId: string }>();
  const { vault } = useVault(vaultId);
  const { book } = useBook(vaultId);
  const { submissions, pending, approved, reject, approve, refetch } = useSubmissions(vaultId);

  const [filter, setFilter] = useState<FilterTab>('all');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  const isLocked = !!(book && !['collecting', 'review'].includes(book.status));

  const filtered = filter === 'all' ? submissions
    : submissions.filter((s) => s.status === filter);

  async function handleApprove(submissionId: string, bId: string) {
    await approve(submissionId, bId);
    await refetch();
  }

  async function handleReject(submissionId: string) {
    await reject(submissionId);
  }



  if (!vault || !book) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <p className="font-inter text-sm text-muted-text">Loading…</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 font-inter text-sm text-muted-text">
        <Link to="/dashboard" className="hover:text-dark-text">Vaults</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/vault/${vaultId}`} className="hover:text-dark-text">{vault.missionary_name}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-dark-text">Book</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <PageTag>Memory Book</PageTag>
          <h1 className="mt-1 font-playfair text-3xl font-semibold text-dark-text">{vault.missionary_name}</h1>
          <p className="font-inter text-sm text-muted-text">{vault.mission_name}</p>
        </div>
        <div className="flex items-center gap-3">
          <BookStatusBadge status={book.status} />
          {approved.length > 0 && (
            <HeirloomButton variant="ghost" size="sm" onClick={() => setPreviewOpen(true)}>
              <Eye className="mr-1 h-4 w-4" /> Preview Book
            </HeirloomButton>
          )}
        </div>
      </div>

      <Divider className="my-6" />

      {/* Filter tabs */}
      <div className="mb-6 flex">
        {(['all', 'pending', 'approved', 'rejected'] as FilterTab[]).map((t) => {
          const counts = {
            all: submissions.length,
            pending: submissions.filter(s => s.status === 'pending').length,
            approved: submissions.filter(s => s.status === 'approved').length,
            rejected: submissions.filter(s => s.status === 'rejected').length,
          };
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="px-4 py-2 font-space-mono text-xs uppercase tracking-wider transition-colors"
              style={{
                backgroundColor: filter === t ? '#222222' : 'transparent',
                color: filter === t ? '#ffffff' : '#555555',
                border: '1px solid #e0deda',
                borderRight: t !== 'rejected' ? 'none' : '1px solid #e0deda',
              }}
            >
              {t} ({counts[t]})
            </button>
          );
        })}
      </div>

      {/* Submissions list */}
      {filtered.length === 0 ? (
        <div className="border border-border-light bg-white p-10 text-center">
          <p className="font-inter text-sm text-muted-text">
            No {filter === 'all' ? '' : filter} submissions yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              bookId={book.id}
              onApprove={handleApprove}
              onReject={handleReject}
              readonly={isLocked}
            />
          ))}
        </div>
      )}

      {/* Pinned purchase bar */}
      {!isLocked && (
        <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between border-t border-border-light bg-white px-8 py-4">
          <div>
            <p className="font-inter text-sm text-dark-text">
              {approved.length} approved {approved.length !== 1 ? 'stories' : 'story'}
            </p>
            {pending.length > 0 && (
              <p className="font-space-mono text-[10px] text-amber-600">
                {pending.length} pending review
              </p>
            )}
          </div>
          <HeirloomButton onClick={() => setAddressFormOpen(true)}>
            <MapPin className="mr-1.5 h-4 w-4" /> Purchase & Print
          </HeirloomButton>
        </div>
      )}

      {/* Book preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-dark-text/95 p-8">
          <div className="mx-auto max-w-5xl">
            <button
              onClick={() => setPreviewOpen(false)}
              className="mb-6 self-end text-white transition-colors hover:text-border-light"
            >
              <X className="h-6 w-6" />
            </button>
            {approved.map((sub, i) => (
              <div key={sub.id} className="mb-8">
                <BookSpread vault={vault} submission={sub} pageNumber={i + 1} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Address modal */}
      {addressFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg border border-border-light bg-white p-8">
            <PageTag>Delivery Address</PageTag>
            <h2 className="mt-2 font-playfair text-2xl font-semibold text-dark-text">
              Where should we send the book?
            </h2>
            <button
              onClick={() => setAddressFormOpen(false)}
              className="absolute right-4 top-4 text-muted-text hover:text-dark-text"
            >
              <X className="h-5 w-5" />
            </button>

            <Divider className="my-5" />

            <div className="space-y-4">
              {(['street', 'city', 'state', 'zip', 'country'] as (keyof DeliveryAddress)[]).map((field) => (
                <div key={field}>
                  <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    value={address[field]}
                    onChange={(e) => setAddress((a) => ({ ...a, [field]: e.target.value }))}
                    className="w-full border border-border-light bg-stone-bg px-4 py-3 font-inter text-sm text-dark-text outline-none"
                  />
                </div>
              ))}
            </div>

            {addressError && (
              <div className="mt-4 border border-red-200 bg-red-50 px-4 py-2">
                <p className="font-inter text-sm text-red-600">{addressError}</p>
              </div>
            )}

            <Divider className="my-5" />

            <div className="flex gap-3">
              <HeirloomButton variant="ghost" onClick={() => setAddressFormOpen(false)} className="flex-1">
                Cancel
              </HeirloomButton>
              <HeirloomButton loading={purchasing} onClick={handlePurchase} className="flex-1">
                Confirm & Pay
              </HeirloomButton>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
