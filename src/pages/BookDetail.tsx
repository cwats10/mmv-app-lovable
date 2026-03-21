import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { SubmissionCard } from '@/components/submission/SubmissionCard';
import { BookStatusBadge } from '@/components/book/BookStatusBadge';
import { BookSpread } from '@/components/book/BookSpread';
import { PageReorderList } from '@/components/book/PageReorderList';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { PurchaseModal } from '@/components/book/PurchaseModal';
import { useVault } from '@/hooks/useVaults';
import { useBook } from '@/hooks/useBook';
import { useSubmissions } from '@/hooks/useSubmissions';
import { ChevronRight, Eye, X, MapPin, ArrowUpDown } from 'lucide-react';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

export default function BookDetail() {
  const { id: vaultId, bookId } = useParams<{ id: string; bookId: string }>();
  const { vault } = useVault(vaultId);
  const { book } = useBook(vaultId);
  const { submissions, pending, approved, reject, approve, deleteSubmission, reorderSubmissions, refetch } = useSubmissions(vaultId);

  const [filter, setFilter] = useState<FilterTab>('all');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [reorderOpen, setReorderOpen] = useState(false);

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
      <div className="mb-6 flex flex-wrap items-center gap-2 font-inter text-sm text-muted-text">
        <Link to="/dashboard" className="hover:text-dark-text">Vaults</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/vault/${vaultId}`} className="hover:text-dark-text truncate max-w-[120px] sm:max-w-none">{vault.missionary_name}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-dark-text">Book</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <PageTag>Memory Book</PageTag>
          <h1 className="mt-1 font-playfair text-2xl font-semibold text-dark-text sm:text-3xl">{vault.missionary_name}</h1>
          <p className="font-inter text-sm text-muted-text">{vault.mission_name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <BookStatusBadge status={book.status} />
          {approved.length > 0 && (
            <HeirloomButton variant="ghost" size="sm" onClick={() => setPreviewOpen(true)}>
              <Eye className="mr-1 h-4 w-4" /> Preview Book
            </HeirloomButton>
          )}
        </div>
      </div>

      <Divider className="my-6" />

      {/* Page reorder section */}
      {approved.length > 1 && !isLocked && (
        <div className="mb-6">
          <button
            onClick={() => setReorderOpen(!reorderOpen)}
            className="flex items-center gap-2 px-4 py-2 font-space-mono text-xs uppercase tracking-wider transition-colors"
            style={{
              border: '1px solid #e0deda',
              backgroundColor: reorderOpen ? '#222222' : 'transparent',
              color: reorderOpen ? '#ffffff' : '#555555',
            }}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Arrange Page Order
          </button>

          {reorderOpen && (
            <div className="mt-4">
              <PageReorderList
                submissions={approved}
                onReorder={reorderSubmissions}
              />
            </div>
          )}
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap">
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
              className="px-3 py-2 font-space-mono text-[10px] uppercase tracking-wider transition-colors sm:px-4 sm:text-xs"
              style={{
                backgroundColor: filter === t ? '#222222' : 'transparent',
                color: filter === t ? '#ffffff' : '#555555',
                border: '1px solid #e0deda',
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
              onDelete={(id) => deleteSubmission(id)}
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
          <HeirloomButton onClick={() => setPurchaseOpen(true)}>
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
            {/* Front cover */}
            <div className="mb-8">
              <BookSpread vault={vault} isCover />
            </div>

            {approved.map((sub, i) => (
              <div key={sub.id} className="mb-8">
                <BookSpread vault={vault} submission={sub} pageNumber={i + 1} />
              </div>
            ))}

            {/* Back cover */}
            <div className="mb-8">
              <BookSpread vault={vault} isBackCover />
            </div>
          </div>
        </div>
      )}

      {/* Purchase modal */}
      <PurchaseModal
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        book={book}
        vault={vault}
      />
    </AppShell>
  );
}
