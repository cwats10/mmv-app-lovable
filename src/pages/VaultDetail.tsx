import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { VaultShareWidget } from '@/components/vault/VaultShareWidget';
import { VaultCover } from '@/components/vault/VaultCover';
import { BookStatusBadge } from '@/components/book/BookStatusBadge';
import { BookSpread } from '@/components/book/BookSpread';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { useVault } from '@/hooks/useVaults';
import { useBook } from '@/hooks/useBook';
import { useSubmissions } from '@/hooks/useSubmissions';
import { formatServiceDates } from '@/lib/utils';
import { ChevronRight, Eye, X } from 'lucide-react';

export default function VaultDetail() {
  const { id } = useParams<{ id: string }>();
  const { vault, loading: vaultLoading } = useVault(id);
  const { book } = useBook(id);
  const { pending, approved, rejected, submissions } = useSubmissions(id);
  const [previewOpen, setPreviewOpen] = useState(false);

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
