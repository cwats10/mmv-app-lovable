import { useState, useEffect, useCallback, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BookStatusBadge } from '@/components/book/BookStatusBadge';
import type { Book, Vault, Profile } from '@/types';
import {
  Zap, Trash2, KeyRound, Users, Archive, BookOpen,
  CheckCircle, Download, AlertTriangle,
import { ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

/* ── Types ────────────────────────────────────────────────────────────────── */

interface AdminBook extends Book {
  vaults: Pick<Vault, 'missionary_name' | 'mission_name'>;
}

interface AdminVault extends Vault {
  profiles?: Pick<Profile, 'name' | 'email'>;
  submissions: { count: number }[];
  books: Pick<Book, 'id' | 'status' | 'pdf_url'>[];
}

type Tab = 'users' | 'vaults' | 'books';

/* ── Helpers ──────────────────────────────────────────────────────────────── */

async function adminAction(action: string, params: Record<string, string>) {
  const { data, error } = await supabase.functions.invoke('admin-actions', {
    body: { action, ...params },
  });
  if (error) throw new Error(error.message || 'Action failed');
  if (data?.error) throw new Error(data.error);
  return data;
}

/* ── Confirm dialog ───────────────────────────────────────────────────────── */

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm border border-border-light bg-white p-6">
        <div className="mb-1 flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <h2 className="font-playfair text-lg font-semibold text-dark-text">{title}</h2>
        </div>
        <p className="mt-2 font-inter text-sm text-muted-text">{description}</p>
        <div className="mt-6 flex gap-3">
          <HeirloomButton variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </HeirloomButton>
          <HeirloomButton variant="danger" size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </HeirloomButton>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export default function Admin() {
  const { profile, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('users');

  // Data
  const [users, setUsers] = useState<(Profile & { referral_count: number })[]>([]);
  const [vaults, setVaults] = useState<AdminVault[]>([]);
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [loading, setLoading] = useState(true);

  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  /* ── Data fetching ────────────────────────────────────────────────────── */

  const fetchUsers = useCallback(async () => {
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const profileList = (profiles as Profile[]) || [];
    // Fetch referral counts
    const { data: referralCounts } = await supabase
      .from('referrals')
      .select('referrer_id');
    const countMap = new Map<string, number>();
    (referralCounts || []).forEach((r: { referrer_id: string }) => {
      countMap.set(r.referrer_id, (countMap.get(r.referrer_id) || 0) + 1);
    });
    setUsers(profileList.map((p) => ({ ...p, referral_count: countMap.get(p.id) || 0 })));
  }, []);

  const fetchVaults = useCallback(async () => {
    const { data } = await supabase
      .from('vaults')
      .select('*, submissions(count), books(id, status, pdf_url)')
      .order('created_at', { ascending: false });
    // Fetch owner profiles separately
    const vaultData = (data as unknown as AdminVault[]) || [];
    if (vaultData.length > 0) {
      const ownerIds = [...new Set(vaultData.map((v) => v.owner_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', ownerIds);
      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
      vaultData.forEach((v) => {
        v.profiles = profileMap.get(v.owner_id) as Pick<Profile, 'name' | 'email'> | undefined;
      });
    }
    setVaults(vaultData);
  }, []);

  const fetchBooks = useCallback(async () => {
    const { data } = await supabase
      .from('books')
      .select('*, vaults(missionary_name, mission_name)')
      .order('created_at', { ascending: false });
    setBooks((data as unknown as AdminBook[]) || []);
  }, []);

  useEffect(() => {
    if (!profile?.is_admin) return;
    setLoading(true);
    Promise.all([fetchUsers(), fetchVaults(), fetchBooks()]).then(() => setLoading(false));
  }, [profile, fetchUsers, fetchVaults, fetchBooks]);

  /* ── Actions ──────────────────────────────────────────────────────────── */

  function askConfirm(title: string, description: string, confirmLabel: string, onConfirm: () => void) {
    setConfirm({ title, description, confirmLabel, onConfirm });
  }

  async function handleDeleteUser(userId: string, email: string) {
    askConfirm(
      'Delete Account',
      `This will permanently delete the account for ${email} and all associated data. This cannot be undone.`,
      'Delete Account',
      async () => {
        setActionLoading(userId);
        try {
          await adminAction('delete_user', { user_id: userId });
          toast.success(`Account deleted: ${email}`);
          await fetchUsers();
          await fetchVaults();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Failed to delete user');
        } finally {
          setActionLoading(null);
          setConfirm(null);
        }
      },
    );
  }

  async function handleResetPassword(email: string) {
    setActionLoading(email);
    try {
      await adminAction('reset_password', { email });
      toast.success(`Password reset email sent to ${email}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteVault(vaultId: string, name: string) {
    askConfirm(
      'Delete Vault',
      `This will permanently delete the vault "${name}" along with all submissions and books inside it.`,
      'Delete Vault',
      async () => {
        setActionLoading(vaultId);
        try {
          await adminAction('delete_vault', { vault_id: vaultId });
          toast.success('Vault deleted');
          await fetchVaults();
          await fetchBooks();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Failed to delete vault');
        } finally {
          setActionLoading(null);
          setConfirm(null);
        }
      },
    );
  }

  async function handleFinalizeVault(vaultId: string) {
    setActionLoading(`finalize-${vaultId}`);
    try {
      await adminAction('finalize_vault', { vault_id: vaultId });
      toast.success('Vault finalized: all submissions approved');
      await fetchVaults();
      await fetchBooks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to finalize vault');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleTriggerPipeline(bookId: string) {
    setActionLoading(`pipeline-${bookId}`);
    try {
      await supabase.functions.invoke('trigger-pipeline', { body: { book_id: bookId } });
      toast.success('Print pipeline triggered');
      await fetchBooks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to trigger pipeline');
    } finally {
      setActionLoading(null);
    }
  }

  /* ── Guards ───────────────────────────────────────────────────────────── */

  if (authLoading) return null;
  if (!profile?.is_admin) return <Navigate to="/dashboard" replace />;

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'users', label: 'Users', icon: <Users className="h-4 w-4" />, count: users.length },
    { key: 'vaults', label: 'Vaults', icon: <Archive className="h-4 w-4" />, count: vaults.length },
    { key: 'books', label: 'Books', icon: <BookOpen className="h-4 w-4" />, count: books.length },
  ];

  return (
    <AppShell>
      <PageTag>Internal</PageTag>
      <h1 className="mt-2 font-playfair text-3xl font-semibold text-dark-text">Admin Console</h1>
      <Divider className="my-6" />

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border-light">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 font-inter text-sm transition-colors ${
              tab === t.key
                ? 'border-b-2 border-dark-text font-medium text-dark-text'
                : 'text-muted-text hover:text-dark-text'
            }`}
          >
            {t.icon}
            {t.label}
            <span className="ml-1 rounded-full bg-border-light px-2 py-0.5 text-[10px]">{t.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <p className="font-inter text-sm text-muted-text">Loading...</p>
        </div>
      ) : (
        <div className="mt-6">
          {tab === 'users' && <UsersTable users={users} profile={profile} actionLoading={actionLoading} onDelete={handleDeleteUser} onResetPassword={handleResetPassword} />}
          {tab === 'vaults' && <VaultsTable vaults={vaults} actionLoading={actionLoading} onDelete={handleDeleteVault} onFinalize={handleFinalizeVault} />}
          {tab === 'books' && <BooksTable books={books} actionLoading={actionLoading} onTriggerPipeline={handleTriggerPipeline} />}
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title || ''}
        description={confirm?.description || ''}
        confirmLabel={confirm?.confirmLabel || ''}
        onConfirm={confirm?.onConfirm || (() => {})}
        onCancel={() => setConfirm(null)}
        loading={!!actionLoading}
      />
    </AppShell>
  );
}

/* ── Users Tab ────────────────────────────────────────────────────────────── */

function UsersTable({
  users,
  profile,
  actionLoading,
  onDelete,
  onResetPassword,
}: {
  users: (Profile & { referral_count: number })[];
  profile: Profile;
  actionLoading: string | null;
  onDelete: (id: string, email: string) => void;
  onResetPassword: (email: string) => void;
}) {
  if (users.length === 0) {
    return <EmptyState message="No users found." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border-light">
            {['Name', 'Email', 'Referral Code', 'Referrals', 'Admin', 'Joined', 'Actions'].map((h) => (
              <th key={h} className="px-4 py-3 text-left font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-border-light">
              <td className="px-4 py-3 font-inter text-sm text-dark-text">{u.name || '\u2014'}</td>
              <td className="px-4 py-3 font-inter text-sm text-muted-text">{u.email}</td>
              <td className="px-4 py-3 font-space-mono text-xs text-muted-text">{u.referral_code}</td>
              <td className="px-4 py-3 font-inter text-sm text-muted-text">{u.referral_count}</td>
              <td className="px-4 py-3 font-inter text-sm">{u.is_admin ? <span className="text-green-700">Yes</span> : <span className="text-muted-text">No</span>}</td>
              <td className="px-4 py-3 font-inter text-sm text-muted-text">{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="flex gap-2 px-4 py-3">
                <HeirloomButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onResetPassword(u.email)}
                  loading={actionLoading === u.email}
                  title="Send password reset email"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                </HeirloomButton>
                {u.id !== profile.id && (
                  <HeirloomButton
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(u.id, u.email)}
                    loading={actionLoading === u.id}
                    title="Delete account"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </HeirloomButton>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Vaults Tab ───────────────────────────────────────────────────────────── */

function VaultsTable({
  vaults,
  actionLoading,
  onDelete,
  onFinalize,
}: {
  vaults: AdminVault[];
  actionLoading: string | null;
  onDelete: (id: string, name: string) => void;
  onFinalize: (id: string) => void;
}) {
  if (vaults.length === 0) {
    return <EmptyState message="No vaults found." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border-light">
            {['Missionary', 'Mission', 'Owner', 'Submissions', 'Created', 'Actions'].map((h) => (
              <th key={h} className="px-4 py-3 text-left font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vaults.map((v) => {
            const subCount = v.submissions?.[0]?.count ?? 0;
            return (
              <tr key={v.id} className="border-b border-border-light">
                <td className="px-4 py-3 font-inter text-sm text-dark-text">{v.missionary_name}</td>
                <td className="px-4 py-3 font-inter text-sm text-muted-text">{v.mission_name}</td>
                <td className="px-4 py-3 font-inter text-sm text-muted-text">{v.profiles?.email || 'Unknown'}</td>
                <td className="px-4 py-3 font-inter text-sm text-muted-text">{subCount}</td>
                <td className="px-4 py-3 font-inter text-sm text-muted-text">{new Date(v.created_at).toLocaleDateString()}</td>
                <td className="flex gap-2 px-4 py-3">
                  <HeirloomButton
                    variant="secondary"
                    size="sm"
                    onClick={() => onFinalize(v.id)}
                    loading={actionLoading === `finalize-${v.id}`}
                    title="Approve all submissions and create book"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                  </HeirloomButton>
                  <HeirloomButton
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(v.id, `${v.missionary_name} - ${v.mission_name}`)}
                    loading={actionLoading === v.id}
                    title="Delete vault"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </HeirloomButton>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Books Tab ────────────────────────────────────────────────────────────── */

function BooksTable({
  books,
  actionLoading,
  onTriggerPipeline,
}: {
  books: AdminBook[];
  actionLoading: string | null;
  onTriggerPipeline: (id: string) => void;
}) {
  if (books.length === 0) {
    return <EmptyState message="No books yet." />;
  }
  return (
    <div className="overflow-x-auto">
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
              <td className="px-4 py-3 font-inter text-sm text-dark-text">{book.vaults?.missionary_name}</td>
              <td className="px-4 py-3 font-inter text-sm text-muted-text">{book.vaults?.mission_name}</td>
              <td className="px-4 py-3"><BookStatusBadge status={book.status} /></td>
              <td className="px-4 py-3 font-inter text-sm text-muted-text">{new Date(book.created_at).toLocaleDateString()}</td>
              <td className="flex gap-2 px-4 py-3">
                {book.pdf_url && (
                  <a href={book.pdf_url} target="_blank" rel="noopener noreferrer">
                    <HeirloomButton variant="ghost" size="sm" title="Download PDF">
                      <Download className="h-3.5 w-3.5" />
                    </HeirloomButton>
                  </a>
                )}
                {book.status === 'purchased' && (
                  <HeirloomButton
                    size="sm"
                    loading={actionLoading === `pipeline-${book.id}`}
                    onClick={() => onTriggerPipeline(book.id)}
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
    </div>
  );
}

/* ── Shared ────────────────────────────────────────────────────────────────── */

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-border-light bg-white p-8 text-center">
      <p className="font-inter text-sm text-muted-text">{message}</p>
    </div>
  );
}
