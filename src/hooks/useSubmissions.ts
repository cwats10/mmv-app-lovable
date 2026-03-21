import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Submission, PageLayout } from '@/types';

export function useSubmissions(vaultId: string | undefined) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    if (!vaultId) { setLoading(false); return; }
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('vault_id', vaultId)
      .order('page_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    setSubmissions((data as Submission[]) || []);
    setLoading(false);
  }, [vaultId]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  useEffect(() => {
    if (!vaultId) return;
    const channel = supabase
      .channel(`submissions-${vaultId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions', filter: `vault_id=eq.${vaultId}` },
        () => fetchSubmissions()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [vaultId, fetchSubmissions]);

  async function approve(submissionId: string, bookId: string) {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'approved', book_id: bookId })
      .eq('id', submissionId);
    if (error) throw error;
    await fetchSubmissions();
  }

  async function reject(submissionId: string) {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'rejected' })
      .eq('id', submissionId);
    if (error) throw error;
    await fetchSubmissions();
  }

  async function submitContribution(params: {
    vault_id: string;
    contributor_name: string;
    relation: string;
    message: string;
    media_urls: string[];
    page_layout?: PageLayout;
  }) {
    const { error } = await supabase.from('submissions').insert({
      vault_id: params.vault_id,
      contributor_name: params.contributor_name,
      relation: params.relation,
      message: params.message,
      media_urls: params.media_urls,
      page_layout: params.page_layout ?? null,
    });
    if (error) throw error;
  }

  async function reorderSubmissions(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      supabase.from('submissions').update({ page_order: index }).eq('id', id)
    );
    await Promise.all(updates);
    await fetchSubmissions();
  }

  const pending = submissions.filter((s) => s.status === 'pending');
  const approved = submissions.filter((s) => s.status === 'approved');
  const rejected = submissions.filter((s) => s.status === 'rejected');

  return { submissions, loading, approve, reject, submitContribution, reorderSubmissions, pending, approved, rejected, refetch: fetchSubmissions };
}
