import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Submission } from '@/types';

export function useSubmissions(vaultId: string | undefined) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!vaultId) { setLoading(false); return; }
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('vault_id', vaultId)
      .order('created_at', { ascending: false });
    setSubmissions((data as Submission[]) || []);
    setLoading(false);
  }, [vaultId]);

  useEffect(() => { fetch(); }, [fetch]);

  // Real-time subscription for new submissions
  useEffect(() => {
    if (!vaultId) return;
    const channel = supabase
      .channel(`submissions-${vaultId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions', filter: `vault_id=eq.${vaultId}` },
        () => fetch()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [vaultId, fetch]);

  async function approve(submissionId: string, bookId: string) {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'approved', book_id: bookId })
      .eq('id', submissionId);
    if (error) throw error;
    await fetch();
  }

  async function reject(submissionId: string) {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'rejected' })
      .eq('id', submissionId);
    if (error) throw error;
    await fetch();
  }

  // Public insert — no auth required
  async function submitContribution(params: {
    vault_id: string;
    contributor_name: string;
    relation: string;
    message: string;
    media_urls: string[];
    image_layout?: { position: string };
  }) {
    const { error } = await supabase.from('submissions').insert(params);
    if (error) throw error;
  }

  const pending = submissions.filter((s) => s.status === 'pending');
  const approved = submissions.filter((s) => s.status === 'approved');
  const rejected = submissions.filter((s) => s.status === 'rejected');

  return { submissions, pending, approved, rejected, loading, approve, reject, submitContribution, refetch: fetch };
}
