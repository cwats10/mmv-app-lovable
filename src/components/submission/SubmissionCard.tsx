import { useState } from 'react';
import type { Submission } from '@/types';
import { PageTag } from '@/components/common/PageTag';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { Check, X, Clock, Trash } from 'lucide-react';

interface SubmissionCardProps {
  submission: Submission;
  bookId?: string;
  onApprove?: (id: string, bookId: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  readonly?: boolean;
}

export function SubmissionCard({ submission, bookId, onApprove, onReject, onDelete, readonly }: SubmissionCardProps) {
  const [acting, setActing] = useState<'approving' | 'rejecting' | 'deleting' | null>(null);

  const statusColors = {
    pending: 'border-amber-200 bg-amber-50',
    approved: 'border-emerald-200 bg-emerald-50',
    rejected: 'border-red-100 bg-red-50',
  };

  return (
    <div className={`border ${statusColors[submission.status]} p-5`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-playfair text-lg font-semibold text-dark-text">
            {submission.contributor_name}
          </h4>
          <PageTag>{submission.relation}</PageTag>
        </div>
        <div className="flex items-center gap-1.5">
          {submission.status === 'pending' && <Clock className="h-3.5 w-3.5 text-amber-600" />}
          {submission.status === 'approved' && <Check className="h-3.5 w-3.5 text-emerald-600" />}
          {submission.status === 'rejected' && <X className="h-3.5 w-3.5 text-red-500" />}
          <span className="font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
            {submission.status}
          </span>
        </div>
      </div>

      {/* Message */}
      <p className="mt-3 font-inter text-sm leading-relaxed text-dark-text">
        {submission.message}
      </p>

      {/* Photos */}
      {submission.media_urls.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {submission.media_urls.map((url, i) => (
            <img key={i} src={url} alt="" className="h-20 w-20 rounded object-cover" />
          ))}
        </div>
      )}

      <p className="mt-3 font-space-mono text-[10px] text-muted-text">
        {new Date(submission.created_at).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric',
        })}
      </p>

      {/* Actions */}
      {!readonly && submission.status === 'pending' && onApprove && onReject && bookId && (
        <div className="mt-4 flex gap-3">
          <HeirloomButton
            size="sm"
            loading={acting === 'approving'}
            onClick={async () => { setActing('approving'); await onApprove(submission.id, bookId); setActing(null); }}
          >
            Approve
          </HeirloomButton>
          <HeirloomButton
            variant="danger"
            size="sm"
            loading={acting === 'rejecting'}
            onClick={async () => { setActing('rejecting'); await onReject(submission.id); setActing(null); }}
          >
            Reject
          </HeirloomButton>
        </div>
      )}

      {/* Delete */}
      {onDelete && (
        <div className="mt-3 flex justify-end">
          <button
            disabled={acting === 'deleting'}
            onClick={async () => { setActing('deleting'); await onDelete(submission.id); setActing(null); }}
            className="flex items-center gap-1 text-xs font-inter text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
          >
            <Trash className="h-3 w-3" />
            {acting === 'deleting' ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
}
