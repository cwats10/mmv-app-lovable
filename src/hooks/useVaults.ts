import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Vault, VaultWithBook } from '@/types';

export function useVaults(userId: string | undefined) {
  const [vaults, setVaults] = useState<VaultWithBook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVaults = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('vaults')
      .select('*, books(id, status)')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    setVaults((data as VaultWithBook[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchVaults(); }, [fetchVaults]);

  async function createVault(params: {
    missionary_name: string;
    mission_name: string;
    mission_start: string | null;
    mission_end: string | null;
    vault_type: 'pre' | 'post';
    cover_theme: 'light' | 'dark';
    contributor_page_allowance: 1 | 2;
  }): Promise<Vault> {
    const { data, error } = await supabase
      .from('vaults')
      .insert({ ...params, owner_id: userId })
      .select()
      .single();
    if (error) throw error;

    await supabase.from('books').insert({ vault_id: data.id });
    await fetchVaults();
    return data as Vault;
  }

  async function updateVault(id: string, updates: Partial<Vault>) {
    const { error } = await supabase.from('vaults').update(updates).eq('id', id);
    if (error) throw error;
    await fetchVaults();
  }

  async function deleteVault(id: string) {
    const { error } = await supabase.from('vaults').delete().eq('id', id);
    if (error) throw error;
    await fetchVaults();
  }

  return { vaults, loading, createVault, updateVault, deleteVault, refetch: fetchVaults };
}

export function useVault(vaultId: string | undefined) {
  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVault = useCallback(async () => {
    if (!vaultId) { setLoading(false); return; }
    const { data } = await supabase
      .from('vaults')
      .select('*')
      .eq('id', vaultId)
      .single();
    setVault(data as Vault | null);
    setLoading(false);
  }, [vaultId]);

  useEffect(() => { fetchVault(); }, [fetchVault]);

  return { vault, loading, refetch: fetchVault };
}
