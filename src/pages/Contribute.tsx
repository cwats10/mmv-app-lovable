import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SubmissionForm } from '@/components/submission/SubmissionForm';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';

import { supabase } from '@/lib/supabase';
import type { Vault } from '@/types';
import { BookOpen, CheckCircle } from 'lucide-react';
import { useSubmissions } from '@/hooks/useSubmissions';

export default function Contribute() {
  const { token } = useParams<{ token: string }>();
  const [vault, setVault] = useState<Vault | null>(null);
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
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true); }
        else { setVault(data as Vault); }
        setLoading(false);
      });
  }, [token]);

  async function handleSubmit(data: Parameters<typeof submitContribution>[0]) {
    await submitContribution(data);
    setSubmitted(true);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-bg">
        <p className="font-inter text-sm text-muted-text">Loading…</p>
      </div>
    );
  }

  if (notFound || !vault) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-bg px-4 text-center">
        <PageTag>Not Found</PageTag>
        <h1 className="mt-3 font-playfair text-3xl font-semibold text-dark-text">
          This link has expired or is invalid.
        </h1>
        <p className="mt-2 font-inter text-sm text-muted-text">
          Please check the link and try again.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-bg px-4 text-center">
        <CheckCircle className="h-12 w-12 text-emerald-600" />
        <PageTag className="mt-4 block">Memory Received</PageTag>
        <h1 className="mt-3 font-playfair text-3xl font-semibold text-dark-text">Thank you.</h1>
        <p className="mt-2 max-w-md font-inter text-sm text-muted-text">
          Your memory has been received and will be reviewed for inclusion in{' '}
          <strong>{vault.missionary_name}</strong>'s Memory Book.
          This is a gift that will last generations.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-bg">
      {/* Book-style header */}
      <section className="relative border-b border-border-light px-8 py-16 text-center">
        
        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="flex items-center justify-center gap-2 text-dark-text">
            <BookOpen className="h-5 w-5" />
            <span className="font-playfair text-lg font-semibold">Mission Memory Vault</span>
          </div>
          <Divider className="my-5" />
          <PageTag>You've been invited to contribute</PageTag>
          <h1 className="mt-3 font-playfair text-3xl font-semibold text-dark-text">
            {vault.mission_name || `${vault.missionary_name}'s Mission`}
          </h1>
          <p className="mt-3 font-inter text-sm text-muted-text">
            You have been invited to share a memory for{' '}
            <strong>{vault.missionary_name}</strong>.
            Your words and photos will become part of a printed heirloom book, treasured for generations.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto max-w-xl px-6 py-12">
        <PageTag>Your Contribution</PageTag>
        <h2 className="mt-2 font-playfair text-2xl font-semibold text-dark-text">Share your memory</h2>
        <Divider className="my-5" />
        <SubmissionForm
          vaultId={vault.id}
          missionaryName={vault.missionary_name}
          onSubmit={handleSubmit}
        />
      </section>
    </div>
  );
}
