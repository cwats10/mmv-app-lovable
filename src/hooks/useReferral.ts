import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Referral } from '@/types';

export function useReferral(userId: string | undefined) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReferrals((data as Referral[]) || []);
        setLoading(false);
      });
  }, [userId]);

  const totalConverted = referrals.filter((r) => r.status !== 'pending').length;
  const totalRewards = referrals.reduce((sum, r) => sum + (r.reward_amount || 0), 0);

  return { referrals, loading, totalConverted, totalRewards };
}
