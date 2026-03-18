import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { BookStatusBadge } from '@/components/book/BookStatusBadge';
import type { Book, Vault } from '@/types';
import { Zap } from 'lucide-react';

interface AdminBook extends Book {
  vaults: Pick<Vault, 'missionary_name' | 'mission_name'>;
}

export default function Admin() {
  const { profile, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.is_admin) return;
    supabase
      .from('books')
      .select('*, vaults(missionary_name, mission_name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBooks((data as AdminBook[]) || []);
        setLoading(false);
      });
  }, [profile]);

  async function triggerPipeline(bookId: string) {
    setTriggeringId(bookId);
    try {
      await supabase.functions.invoke('trigger-pipeline', { body: { book_id: bookId } });
      // Refresh
      const { data } = await supabase
        .from('books')
        .select('*, vaults(missionary_name, mission_name)')
        .order('created_at', { ascending: false });
      setBooks((data as AdminBook[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setTriggeringId(null);
    }
  }

  if (authLoading) return null;
  if (!profile?.is_admin) return <Navigate to="/dashboard" replace />;

  return (
    <AppShell>
      <div className="p-10">
        <div className="mb-8">
          <PageTag className="block mb-3">Internal</PageTag>
          <h1 className="font-playfair text-4xl font-normal text-[#222222]">Admin Console</h1>
        </div>

        <Divider className="mb-8" />

        <PageTag className="block mb-4">All Books</PageTag>

        {loading ? (
          <p className="font-space-mono text-xs text-[#555555]">Loading…</p>
        ) : (
          <div style={{ border: '1px solid #e0deda' }}>
            {books.length === 0 ? (
              <div className="p-8 text-center">
                <span className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">No books yet.</span>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}>
                    {['Missionary', 'Mission', 'Status', 'Created', 'Actions'].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 font-space-mono text-xs text-[#555555] uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id} style={{ borderBottom: '1px solid #e0deda' }}>
                      <td className="px-5 py-4 font-inter text-[#222222]">
                        {book.vaults?.missionary_name}
                      </td>
                      <td className="px-5 py-4 text-[#555555]">{book.vaults?.mission_name}</td>
                      <td className="px-5 py-4">
                        <BookStatusBadge status={book.status} />
                      </td>
                      <td className="px-5 py-4 font-space-mono text-xs text-[#555555]">
                        {new Date(book.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        {book.status === 'purchased' && (
                          <HeirloomButton
                            variant="secondary"
                            size="sm"
                            loading={triggeringId === book.id}
                            onClick={() => triggerPipeline(book.id)}
                          >
                            <Zap size={12} className="mr-1.5" />
                            Trigger Print
                          </HeirloomButton>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
