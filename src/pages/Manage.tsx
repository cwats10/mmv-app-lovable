import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { SubmissionCard } from '@/components/submission/SubmissionCard';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { GridOverlay } from '@/components/common/GridOverlay';
import { supabase } from '@/integrations/supabase/client';
import type { Submission, BookStatus } from '@/types';
import { Users, BookMarked } from 'lucide-react';
import { formatServiceDates } from '@/lib/utils';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

interface ManagerContext {
  vault: {
    id: string;
    missionary_name: string;
    mission_name: string;
    mission_start: string | null;
    mission_end: string | null;
    vault_type: 'pre' | 'post';
  };
  book: {
    id: string;
    status: BookStatus;
    locked_at: string | null;
  } | null;
}

const LOCKED_STATUSES: BookStatus[] = ['purchased', 'printing', 'delivered'];

export default function Manage() {
  const { token } = useParams<{ token: string }>();
  const [context, setContext] = useState<ManagerContext | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionError, setActionError] = useState('');

  async function callManager<T>(body: Record<string, unknown>): Promise<T> {
    const { data, error } = await supabase.functions.invoke('manager-action', {
      body: { manager_token: token, ...body },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data as T;
  }

  const loadSubmissions = useCallback(async () => {
    const data = await callManager<{ submissions: Submission[] }>({ action: 'list-submissions' });
    setSubmissions(data.submissions);
  }, [token]);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      callManager<ManagerContext>({ action: 'get-context' }),
      callManager<{ submissions: Submission[] }>({ action: 'list-submissions' }),
    ])
      .then(([ctx, subData]) => {
        setContext(ctx);
        setSubmissions(subData.submissions);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleApprove(submissionId: string) {
    setActionError('');
    try {
      await callManager({ action: 'approve', submission_id: submissionId });
      await loadSubmissions();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  }

  async function handleReject(submissionId: string) {
    setActionError('');
    try {
      await callManager({ action: 'reject', submission_id: submissionId });
      await loadSubmissions();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  }

  async function handleDelete(submissionId: string) {
    setActionError('');
    try {
      await callManager({ action: 'delete', submission_id: submissionId });
      await loadSubmissions();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4f2ef' }}>
        <span className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">Loading…</span>
      </div>
    );
  }

  if (notFound || !context) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
        style={{ backgroundColor: '#f4f2ef' }}
      >
        <PageTag className="block mb-4">Not Found</PageTag>
        <h1 className="font-playfair text-4xl font-normal text-[#222222] mb-3">
          This link is invalid or has been revoked.
        </h1>
        <p className="text-sm text-[#555555]">Contact the vault owner to get a new manager link.</p>
      </div>
    );
  }

  const { vault, book } = context;
  const isLocked = !!book && LOCKED_STATUSES.includes(book.status);

  function isFutureEdition(s: Submission) {
    if (!isLocked || !book?.locked_at) return false;
    return new Date(s.created_at) > new Date(book.locked_at);
  }

  const currentEdition = submissions.filter((s) => !isFutureEdition(s));
  const futureEdition  = submissions.filter((s) => isFutureEdition(s));

  const filtered = filter === 'all'
    ? currentEdition
    : currentEdition.filter((s) => s.status === filter);

  const counts = {
    all:      currentEdition.length,
    pending:  currentEdition.filter((s) => s.status === 'pending').length,
    approved: currentEdition.filter((s) => s.status === 'approved').length,
    rejected: currentEdition.filter((s) => s.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#d1cfcb' }}>
      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: '#f4f2ef', borderBottom: '1px solid #e0deda' }}
      >
        <GridOverlay />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 flex flex-col">
          <div className="flex items-center gap-2 mb-6 sm:mb-8">
            <Users size={16} strokeWidth={1.5} className="text-[#555555]" />
            <span className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">
              Manager View
            </span>
          </div>

          <PageTag className="block mb-4">Submission Review</PageTag>

          <h1
            className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-normal text-[#222222]"
            style={{ lineHeight: 1.1, letterSpacing: '-0.02em' }}
          >
            {vault.mission_name || `${vault.missionary_name}'s Mission`}
          </h1>

          <Divider className="my-6" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#555555]" style={{ lineHeight: 1.8 }}>
              You have been invited to help review memories for{' '}
              <strong className="text-[#222222] font-medium">{vault.missionary_name}</strong>.
              {vault.mission_start || vault.mission_end
                ? ` ${formatServiceDates(vault.mission_start, vault.mission_end)}.`
                : ''}
            </p>

            {/* Permission reminder */}
            <div
              className="flex-shrink-0 px-4 py-3 text-xs font-space-mono text-[#555555] uppercase tracking-widest"
              style={{ border: '1px solid #e0deda', backgroundColor: '#ffffff', lineHeight: 1.6 }}
            >
              Can: Approve · Reject<br />
              Cannot: Purchase · Finalize
            </div>
          </div>
        </div>
      </div>

      {/* Finalized banner */}
      {isLocked && (
        <div
          className="max-w-4xl mx-auto px-6 pt-8"
        >
          <div
            className="flex items-start gap-3 px-5 py-4"
            style={{ backgroundColor: '#f4f2ef', border: '1px solid #e0deda' }}
          >
            <BookMarked size={14} strokeWidth={1.5} className="text-[#555555] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[#555555]" style={{ lineHeight: 1.7 }}>
              This edition has been{' '}
              <strong className="text-[#222222] font-medium">finalized</strong>. Submissions are
              shown here for reference. Any memories received after finalization are preserved in
              the Future Edition Queue below.
            </p>
          </div>
        </div>
      )}

      {/* Submission list */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-10">

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-0 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="px-3 py-2 text-[10px] font-space-mono uppercase tracking-wider transition-colors sm:px-4 sm:text-xs"
              style={{
                backgroundColor: filter === t ? '#222222' : '#ffffff',
                color: filter === t ? '#ffffff' : '#555555',
                border: '1px solid #e0deda',
              }}
            >
              {t} ({counts[t]})
            </button>
          ))}
        </div>

        {/* Error banner */}
        {actionError && (
          <div
            className="mb-6 px-4 py-3 text-sm text-red-700 font-inter"
            style={{ border: '1px solid #fca5a5', backgroundColor: '#fef2f2' }}
          >
            {actionError}
          </div>
        )}

        {/* Current edition submissions */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ backgroundColor: '#ffffff', border: '1px solid #e0deda' }}>
            <span className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">
              No {filter === 'all' ? '' : filter} submissions yet.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                onApprove={isLocked ? undefined : (_id) => handleApprove(submission.id)}
                onReject={isLocked ? undefined : (_id) => handleReject(submission.id)}
                onDelete={() => handleDelete(submission.id)}
                readonly={isLocked}
              />
            ))}
          </div>
        )}

        {/* Future edition queue */}
        {futureEdition.length > 0 && (
          <div className="mt-12">
            <div
              className="flex items-center gap-3 mb-4 pb-4"
              style={{ borderBottom: '1px solid #e0deda' }}
            >
              <BookMarked size={14} strokeWidth={1.5} className="text-[#555555]" />
              <div>
                <PageTag>Future Edition Queue</PageTag>
                <p className="text-xs text-[#555555] mt-1" style={{ lineHeight: 1.6 }}>
                  {futureEdition.length}{' '}
                  {futureEdition.length === 1 ? 'memory' : 'memories'} received after
                  this edition was finalized — preserved for the next print run.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {futureEdition.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  readonly
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
