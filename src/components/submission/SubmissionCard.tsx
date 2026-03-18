import { useState } from 'react';
import type { Submission } from '@/types';
import { PageTag } from '@/components/common/PageTag';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { Check, X, Clock, BookMarked } from 'lucide-react';

interface SubmissionCardProps {
  submission: Submission;
  bookId?: string;
  // bookId is passed through to the callback when known (owner view).
  // Manager view omits it — the server resolves the book from the vault.
  onApprove?: (id: string, bookId?: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  readonly?: boolean;
  /** True when the book is already purchased/printed and this submission
   *  arrived after finalization — it's preserved for a future edition. */
  futureEdition?: boolean;
}

export function SubmissionCard({
  submission,
  bookId,
  onApprove,
  onReject,
  readonly,
  futureEdition,
}: SubmissionCardProps) {
  const [acting, setActing] = useState<'approving' | 'rejecting' | null>(null);

  const statusColors = {
    pending: 'border-amber-200 bg-amber-50',
    approved: 'border-emerald-200 bg-emerald-50',
    rejected: 'border-red-100 bg-red-50',
  };

  return (
    <div
      className="p-6"
      style={{ border: '1px solid #e0deda', backgroundColor: '#ffffff' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-inter font-semibold text-[#222222] text-sm">
            {submission.contributor_name}
          </div>
          <div className="font-space-mono text-xs text-[#555555] uppercase tracking-wider mt-0.5">
            {submission.relation}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {futureEdition ? (
            <>
              <BookMarked size={12} className="text-[#555555]" />
              <span className="font-space-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded-sm border border-[#e0deda] bg-[#f4f2ef] text-[#555555]">
                Future Edition
              </span>
            </>
          ) : (
            <>
              {submission.status === 'pending' && <Clock size={12} className="text-amber-500" />}
              {submission.status === 'approved' && <Check size={12} className="text-emerald-600" />}
              {submission.status === 'rejected' && <X size={12} className="text-red-500" />}
              <span className={`font-space-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded-sm ${statusColors[submission.status]}`}>
                {submission.status}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Message */}
      <p
        className="text-sm text-[#555555] mb-4"
        style={{ lineHeight: 1.8 }}
      >
        {submission.message}
      </p>

      {/* Photos */}
      {submission.media_urls.length > 0 && (
        <div className="flex gap-2 mb-4">
          {submission.media_urls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="w-20 h-20 object-cover"
              style={{ filter: 'grayscale(15%) sepia(8%)' }}
            />
          ))}
        </div>
      )}

      <PageTag className="block mb-3 text-[10px]">
        {new Date(submission.created_at).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric',
        })}
      </PageTag>

      {/* Actions — only shown when not locked and not a future-edition card */}
      {!readonly && !futureEdition && submission.status === 'pending' && onApprove && onReject && (
        <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid #e0deda' }}>
          <HeirloomButton
            variant="primary"
            size="sm"
            loading={acting === 'approving'}
            disabled={acting !== null}
            onClick={async () => { setActing('approving'); await onApprove(submission.id, bookId); setActing(null); }}
          >
            <Check size={12} className="mr-1" /> Approve
          </HeirloomButton>
          <HeirloomButton
            variant="danger"
            size="sm"
            loading={acting === 'rejecting'}
            disabled={acting !== null}
            onClick={async () => { setActing('rejecting'); await onReject(submission.id); setActing(null); }}
          >
            <X size={12} className="mr-1" /> Reject
          </HeirloomButton>
        </div>
      )}

      {/* Future-edition footer note */}
      {futureEdition && (
        <p
          className="font-space-mono text-xs text-[#555555] mt-4 pt-4"
          style={{ borderTop: '1px solid #e0deda', lineHeight: 1.6 }}
        >
          Received after this edition was finalized — preserved for the next print.
        </p>
      )}
    </div>
  );
}
