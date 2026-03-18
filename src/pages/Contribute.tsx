import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SubmissionForm } from '@/components/submission/SubmissionForm';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { GridOverlay } from '@/components/common/GridOverlay';
import { supabase } from '@/lib/supabase';
import type { Vault, BookStatus } from '@/types';
import { BookOpen, CheckCircle, Archive } from 'lucide-react';
import { useSubmissions } from '@/hooks/useSubmissions';

const FINALIZED_STATUSES: BookStatus[] = ['purchased', 'printing', 'delivered'];

export default function Contribute() {
  const { token } = useParams<{ token: string }>();
  const [vault, setVault] = useState<Vault | null>(null);
  const [bookStatus, setBookStatus] = useState<BookStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const { submitContribution } = useSubmissions(vault?.id);

  useEffect(() => {
    if (!token) return;

    supabase
      .from('vaults')
      .select('*')
      .eq('submission_token', token)
      .is('archived_at', null)
      .single()
      .then(async ({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setVault(data as Vault);

        // Also load the linked book status so we can give contributors
        // accurate context about whether their memory goes into the
        // current print or is held for a future edition.
        const { data: bookData } = await supabase
          .from('books')
          .select('status')
          .eq('vault_id', data.id)
          .single();

        if (bookData) setBookStatus(bookData.status as BookStatus);

        setLoading(false);
      });
  }, [token]);

  async function handleSubmit(data: Parameters<typeof submitContribution>[0]) {
    await submitContribution(data);
    setSubmitted(true);
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#f4f2ef' }}
      >
        <span className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">Loading…</span>
      </div>
    );
  }

  if (notFound || !vault) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
        style={{ backgroundColor: '#f4f2ef' }}
      >
        <PageTag className="block mb-4">Not Found</PageTag>
        <h1 className="font-playfair text-4xl font-normal text-[#222222] mb-3">
          This link has expired or is invalid.
        </h1>
        <p className="text-sm text-[#555555]">Please check the link and try again.</p>
      </div>
    );
  }

  const isFinalized = bookStatus !== null && FINALIZED_STATUSES.includes(bookStatus);

  if (submitted) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
        style={{ backgroundColor: '#f4f2ef' }}
      >
        <CheckCircle size={40} strokeWidth={1} className="text-emerald-500 mb-6" />
        <PageTag className="block mb-4">Memory Received</PageTag>
        <h1 className="font-playfair text-4xl font-normal text-[#222222] mb-3">
          Thank you.
        </h1>
        <p className="text-sm text-[#555555] max-w-sm" style={{ lineHeight: 1.8 }}>
          Your memory has been received and will be{' '}
          {isFinalized
            ? 'treasured and preserved for the next edition of '
            : 'reviewed for inclusion in '}
          <span className="text-[#222222] font-medium">{vault.missionary_name}'s</span> Memory Book.
          This is a gift that will last generations.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#d1cfcb' }}>
      {/* Book-style header */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: '#f4f2ef', borderBottom: '1px solid #e0deda' }}
      >
        <GridOverlay />
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-14 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <BookOpen size={16} strokeWidth={1.5} className="text-[#555555]" />
            <span className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">
              Memory Vault
            </span>
          </div>

          <PageTag className="block mb-4">
            You've been invited to contribute
          </PageTag>

          <h1
            className="font-playfair text-4xl sm:text-5xl font-normal text-[#222222]"
            style={{ lineHeight: 1.1, letterSpacing: '-0.02em' }}
          >
            {vault.mission_name || `${vault.missionary_name}'s Mission`}
          </h1>

          <Divider className="my-6" />

          <p className="text-sm text-[#555555] max-w-lg" style={{ lineHeight: 1.8 }}>
            You have been invited to share a memory for{' '}
            <strong className="text-[#222222] font-medium">{vault.missionary_name}</strong>.
            Your words and photos will become part of a printed heirloom book — treasured for generations.
          </p>
        </div>
      </div>

      {/* Future-edition notice — shown only when the current book is finalized */}
      {isFinalized && (
        <div
          className="max-w-2xl mx-auto px-6 pt-8"
        >
          <div
            className="flex items-start gap-4 p-5"
            style={{ backgroundColor: '#f4f2ef', border: '1px solid #e0deda' }}
          >
            <Archive size={16} strokeWidth={1.5} className="text-[#555555] mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-space-mono text-xs text-[#555555] uppercase tracking-widest mb-1">
                Current Edition Finalized
              </p>
              <p className="text-sm text-[#555555]" style={{ lineHeight: 1.8 }}>
                The current print edition of this Memory Book has already been
                finalized. Your memory is still deeply welcome — it will be
                carefully preserved and included in the next edition.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-14">
        <div
          className="p-8 sm:p-12"
          style={{ backgroundColor: '#ffffff', border: '1px solid #e0deda' }}
        >
          <PageTag className="block mb-4">Your Contribution</PageTag>
          <h2 className="font-playfair text-2xl font-normal text-[#222222] mb-8">
            Share your memory
          </h2>
          <SubmissionForm
            vaultId={vault.id}
            missionaryName={vault.missionary_name}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
