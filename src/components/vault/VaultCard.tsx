import { Link } from 'react-router-dom';
import type { VaultWithBook } from '@/types';
import { BookStatusBadge } from '@/components/book/BookStatusBadge';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { formatServiceDates } from '@/lib/utils';

interface VaultCardProps {
  vault: VaultWithBook;
  pendingCount?: number;
}

export function VaultCard({ vault, pendingCount = 0 }: VaultCardProps) {
  const book = vault.books?.[0];

  return (
    <Link
      to={`/dashboard/vault/${vault.id}`}
      className="group block"
      style={{
        backgroundColor: '#f4f2ef',
        border: '1px solid #e0deda',
        padding: '2rem',
        transition: 'all 0.2s',
      }}
    >
      {/* Cover image */}
      {vault.cover_image_url ? (
        <div
          className="mb-6 overflow-hidden"
          style={{
            height: '180px',
            backgroundImage: `url('${vault.cover_image_url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(15%) sepia(8%)',
          }}
        />
      ) : (
        <div
          className="mb-6 flex items-center justify-center"
          style={{
            height: '180px',
            backgroundColor: '#e0deda',
          }}
        >
          <span className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">No Cover</span>
        </div>
      )}

      <PageTag className="block mb-3">
        {vault.vault_type === 'post' ? 'Post-Mission' : 'Pre-Mission'}
      </PageTag>

      <h3
        className="font-playfair text-2xl font-normal text-[#222222] mb-1 group-hover:underline"
        style={{ letterSpacing: '-0.01em' }}
      >
        {vault.missionary_name}
      </h3>

      <p className="text-sm text-[#555555] mb-4">
        {vault.mission_name || 'Mission details not set'}
      </p>

      {(vault.mission_start || vault.mission_end) && (
        <p className="font-space-mono text-xs text-[#555555] mb-4">
          {formatServiceDates(vault.mission_start, vault.mission_end)}
        </p>
      )}

      <Divider className="mb-4" />

      <div className="flex items-center justify-between">
        {book ? (
          <BookStatusBadge status={book.status} />
        ) : (
          <span className="font-space-mono text-xs text-[#555555]">No book</span>
        )}

        {pendingCount > 0 && (
          <span
            className="font-space-mono text-xs px-2 py-1"
            style={{ backgroundColor: '#222222', color: '#ffffff' }}
          >
            {pendingCount} pending
          </span>
        )}
      </div>
    </Link>
  );
}
