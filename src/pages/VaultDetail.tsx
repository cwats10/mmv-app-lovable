import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { VaultShareWidget } from '@/components/vault/VaultShareWidget';
import { ManagerShareWidget } from '@/components/vault/ManagerShareWidget';
import { VaultCover } from '@/components/vault/VaultCover';
import { BookStatusBadge } from '@/components/book/BookStatusBadge';
import { BookSpread } from '@/components/book/BookSpread';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { useVault, useVaults } from '@/hooks/useVaults';
import { useBook } from '@/hooks/useBook';
import { useSubmissions } from '@/hooks/useSubmissions';
import { useAuth } from '@/hooks/useAuth';
import { MessageBank } from '@/components/dashboard/MessageBank';
import { formatServiceDates } from '@/lib/utils';
import { ChevronRight, Eye, X, Settings, Trash2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function VaultDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vault, loading: vaultLoading } = useVault(id);
  const { user, profile } = useAuth();
  const { updateVault, deleteVault } = useVaults(user?.id);
  const { book } = useBook(id);
  const { pending, approved, rejected, submissions } = useSubmissions(id);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?.id === vault?.owner_id;

  const handleDelete = async () => {
    if (!vault) return;
    setDeleting(true);
    try {
      await deleteVault(vault.id);
      navigate('/dashboard');
    } catch {
      setDeleting(false);
    }
  };

  if (vaultLoading) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <p className="font-inter text-sm text-muted-text">Loading…</p>
        </div>
      </AppShell>
    );
  }

  if (!vault) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <p className="font-inter text-sm text-muted-text">Vault not found.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 font-inter text-sm text-muted-text">
        <Link to="/dashboard" className="hover:text-dark-text">Vaults</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-dark-text">{vault.missionary_name}</span>
      </div>

      {/* Header */}
      <div>
        <PageTag>{vault.vault_type === 'post' ? 'Post-Mission Vault' : 'Pre-Mission Vault'}</PageTag>
        <h1 className="mt-1 font-playfair text-3xl font-semibold text-dark-text">
          {vault.missionary_name}
        </h1>
        <p className="font-inter text-sm text-muted-text">{vault.mission_name}</p>
        {(vault.mission_start || vault.mission_end) && (
          <p className="mt-1 font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
            {formatServiceDates(vault.mission_start, vault.mission_end)}
          </p>
        )}
      </div>

      <Divider className="my-8" />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: submissions.length },
          { label: 'Pending', value: pending.length },
          { label: 'Approved', value: approved.length },
          { label: 'Rejected', value: rejected.length },
        ].map(({ label, value }) => (
          <div key={label} className="border border-border-light bg-white p-4 text-center">
            <p className="font-playfair text-2xl font-semibold text-dark-text">{value}</p>
            <p className="font-space-mono text-[10px] uppercase tracking-wider text-muted-text">{label}</p>
          </div>
        ))}
      </div>

      {/* Book preview button */}
      {approved.length > 0 && (
        <div className="mt-8">
          <HeirloomButton variant="ghost" size="sm" onClick={() => setPreviewOpen(true)}>
            <Eye className="mr-1.5 h-4 w-4" /> Preview Book
          </HeirloomButton>
        </div>
      )}

      {/* Share widget */}
      <div className="mt-8">
        <VaultShareWidget submissionToken={vault.submission_token} />
      </div>

      {/* Book status + action */}
      {book && (
        <div className="mt-8 flex items-center justify-between border border-border-light bg-white p-6">
          <div className="flex items-center gap-3">
            <PageTag>Memory Book</PageTag>
            <BookStatusBadge status={book.status} />
            {pending.length > 0 && (
              <span className="font-inter text-xs text-amber-600">
                {pending.length} awaiting review
              </span>
            )}
          </div>
          <Link to={`/vault/${vault.id}/book/${book.id}`}>
            <HeirloomButton size="sm">
              {book.status === 'collecting' ? 'Review Book' : 'View Book'}
            </HeirloomButton>
          </Link>
        </div>
      )}

      {/* Book Settings */}
      <div className="mt-8 border border-border-light bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-4 w-4 text-muted-text" />
          <PageTag>Book Settings</PageTag>
        </div>

        <div>
          <label className="mb-2 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
            Pages Per Contributor
          </label>
          <div className="flex max-w-sm">
            {([1, 2] as const).map((n) => (
              <button
                key={n}
                onClick={async () => {
                  if (vault.contributor_page_allowance !== n) {
                    await updateVault(vault.id, { contributor_page_allowance: n });
                    window.location.reload();
                  }
                }}
                className="flex-1 py-2 font-inter text-sm transition-colors"
                style={{
                  backgroundColor: (vault.contributor_page_allowance ?? 1) === n ? '#2b2b2a' : 'transparent',
                  color: (vault.contributor_page_allowance ?? 1) === n ? '#fefefe' : '#555555',
                  border: '1px solid #e0deda',
                  borderRight: n === 1 ? 'none' : '1px solid #e0deda',
                }}
              >
                {n === 1 ? '1 Page' : '2 Pages (Spread)'}
              </button>
            ))}
          </div>
          <p className="mt-1.5 font-inter text-[11px] text-muted-text">
            {(vault.contributor_page_allowance ?? 1) === 1
              ? 'Each contributor creates one beautifully designed page.'
              : 'Each contributor gets a full two-page spread with a showcase image and their story.'}
          </p>
        </div>
      </div>

      {/* Message Bank */}
      <div className="mt-12 pt-12 border-t border-border-light">
        <MessageBank vaults={[vault]} profile={profile} />
      </div>

      {/* Delete vault — owner only */}
      {isOwner && (
        <div className="mt-12 border-t border-border-light pt-8">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <HeirloomButton variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete Vault
              </HeirloomButton>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-playfair">Delete this vault?</AlertDialogTitle>
                <AlertDialogDescription className="font-inter text-sm">
                  This will permanently delete <strong>{vault.missionary_name}</strong>'s vault, all submissions, and the associated book. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-inter text-sm">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 text-white hover:bg-red-700 font-inter text-sm"
                >
                  {deleting ? 'Deleting…' : 'Delete Vault'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Book preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-dark-text/95 p-8">
          <div className="mx-auto max-w-5xl">
            <button
              onClick={() => setPreviewOpen(false)}
              className="mb-6 text-white transition-colors hover:text-border-light"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Cover spread */}
            <div className="mb-8">
              <BookSpread vault={vault} isCover />
            </div>

            {/* Content spreads */}
            {approved.map((sub, i) => (
              <div key={sub.id} className="mb-8">
                <BookSpread vault={vault} submission={sub} pageNumber={i + 1} />
              </div>
            ))}

            {/* Back cover */}
            <div className="mb-8">
              <BookSpread vault={vault} isBackCover />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
