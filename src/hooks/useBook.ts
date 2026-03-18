import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Book, DeliveryAddress } from '@/types';

export function useBook(vaultId: string | undefined) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vaultId) return;
    supabase
      .from('books')
      .select('*')
      .eq('vault_id', vaultId)
      .single()
      .then(({ data }) => {
        setBook(data as unknown as Book | null);
        setLoading(false);
      });
  }, [vaultId]);

  async function updateStatus(bookId: string, status: Book['status']) {
    const { data, error } = await supabase
      .from('books')
      .update({ status })
      .eq('id', bookId)
      .select()
      .single();
    if (error) throw error;
    setBook(data as unknown as Book);
  }

  async function saveDeliveryAddress(bookId: string, address: DeliveryAddress) {
    const { data, error } = await supabase
      .from('books')
      .update({ delivery_address: address })
      .eq('id', bookId)
      .select()
      .single();
    if (error) throw error;
    setBook(data as Book);
  }

  return { book, loading, updateStatus, saveDeliveryAddress };
}
