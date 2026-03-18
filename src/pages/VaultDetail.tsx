import { useParams, Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { VaultShareWidget } from '@/components/vault/VaultShareWidget';
import { ManagerShareWidget } from '@/components/vault/ManagerShareWidget';
import { BookStatusBadge } from '@/components/book/BookStatusBadge';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { useVault } from '@/hooks/useVaults';
import { useBook } from '@/hooks/useBook';
import { useSubmissions } from '@/hooks/useSubmissions';
import { formatServiceDates } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export default function VaultDetail() {
  const { id } = useParams<{ id: string }>();
  const { vault, loading: vaultLoading } = useVault(id);
  const { book } = useBook(id);
  const { pending, approved, rejected, submissions } = useSubmissions(id);

  if (vaultLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-24">
          <span className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">Loading…</span>
        </div>
      </AppShell>
    );
  }

  if (!vault) {
    return (
      <AppShell>
        <div className="p-10">
          <p className="text-[#555555]">Vault not found.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-10 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 font-space-mono text-xs text-[#555555]">
          <Link to="/dashboard" className="hover:text-[#222222] uppercase tracking-widest">Vaults</Link>
          <ChevronRight size={12} />
          <span className="uppercase tracking-widest text-[#222222]">{vault.missionary_name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start gap-6 mb-8">
          {vault.cover_image_url && (
            <div
              className="flex-shrink-0"
              style={{
                width: '100px',
                height: '100px',
                backgroundImage: `url('${vault.cover_image_url}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'grayscale(15%) sepia(8%)',
              }}
            />
          )}
          <div>
            <PageTag className="block mb-2">
              {vault.vault_type === 'post' ? 'Post-Mission Vault' : 'Pre-Mission Vault'}
            </PageTag>
            <h1 className="font-playfair text-4xl font-normal text-[#222222] mb-1">
              {vault.missionary_name}
            </h1>
            <p className="text-[#555555] text-sm">{vault.mission_name}</p>
            {(vault.mission_start || vault.mission_end) && (
              <p className="font-space-mono text-xs text-[#555555] mt-1">
                {formatServiceDates(vault.mission_start, vault.mission_end)}
              </p>
            )}
          </div>
        </div>

        <Divider className="mb-8" />

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: submissions.length },
            { label: 'Pending', value: pending.length },
            { label: 'Approved', value: approved.length },
            { label: 'Rejected', value: rejected.length },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="p-5 text-center"
              style={{ border: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
            >
              <div className="font-playfair text-3xl text-[#222222] mb-1">{value}</div>
              <PageTag>{label}</PageTag>
            </div>
          ))}
        </div>

        {/* Share widgets */}
        <div className="mb-4">
          <VaultShareWidget submissionToken={vault.submission_token} />
        </div>
        <div className="mb-8">
          <ManagerShareWidget managerToken={vault.manager_token} />
        </div>

        {/* Book status + action */}
        {book && (
          <div
            className="flex items-center justify-between p-6"
            style={{ border: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
          >
            <div>
              <PageTag className="block mb-2">Memory Book</PageTag>
              <div className="flex items-center gap-3">
                <BookStatusBadge status={book.status} />
                {pending.length > 0 && (
                  <span className="font-space-mono text-xs text-amber-600">
                    {pending.length} awaiting review
                  </span>
                )}
              </div>
            </div>
            <Link to={`/dashboard/vault/${vault.id}/book/${book.id}`}>
              <HeirloomButton variant="primary">
                {book.status === 'collecting' ? 'Review Book' : 'View Book'}
                <ChevronRight size={14} className="ml-1" />
              </HeirloomButton>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
