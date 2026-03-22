import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
        setBooks((data as unknown as AdminBook[]) || []);
        setLoading(false);
      });
  }, [profile]);

  async function triggerPipeline(bookId: string) {
    setTriggeringId(bookId);
    try {
      await supabase.functions.invoke('trigger-pipeline', { body: { book_id: bookId } });
      const { data } = await supabase
        .from('books')
        .select('*, vaults(missionary_name, mission_name)')
        .order('created_at', { ascending: false });
      setBooks((data as unknown as AdminBook[]) || []);
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
      <PageTag>Internal</PageTag>
      <h1 className="mt-2 font-playfair text-3xl font-semibold text-dark-text">Admin Console</h1>
      <Divider className="my-8" />

      <PageTag>All Books</PageTag>

      {loading ? (
        <div className="py-20 text-center">
          <p className="font-inter text-sm text-muted-text">Loading…</p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          {books.length === 0 ? (
            <div className="border border-border-light bg-white p-8 text-center">
              <p className="font-inter text-sm text-muted-text">No books yet.</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border-light">
                  {['Missionary', 'Mission', 'Status', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="border-b border-border-light">
                    <td className="px-4 py-3 font-inter text-sm text-dark-text">
                      {book.vaults?.missionary_name}
                    </td>
                    <td className="px-4 py-3 font-inter text-sm text-muted-text">
                      {book.vaults?.mission_name}
                    </td>
                    <td className="px-4 py-3">
                      <BookStatusBadge status={book.status} />
                    </td>
                    <td className="px-4 py-3 font-inter text-sm text-muted-text">
                      {new Date(book.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {book.status === 'purchased' && (
                        <HeirloomButton
                          size="sm"
                          loading={triggeringId === book.id}
                          onClick={() => triggerPipeline(book.id)}
                        >
                          <Zap className="mr-1 h-3.5 w-3.5" />
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
    </AppShell>
  );
}
