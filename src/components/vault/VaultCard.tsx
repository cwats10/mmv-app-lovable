import { Link } from 'react-router-dom';
import type { VaultWithBook } from '@/types';
import { BookStatusBadge } from '@/components/book/BookStatusBadge';
import { VaultCover } from '@/components/vault/VaultCover';
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
      to={`/vault/${vault.id}`}
      className="group block border border-border-light bg-white transition-shadow hover:shadow-md"
    >
      <VaultCover
        missionaryName={vault.missionary_name}
        theme={(vault as any).cover_theme || 'dark'}
        className="aspect-[16/9]"
      />

      <div className="p-5">
        <PageTag>{vault.vault_type === 'post' ? 'Post-Mission' : 'Pre-Mission'}</PageTag>
        <h3 className="mt-2 font-playfair text-xl font-semibold text-dark-text">
          {vault.missionary_name}
        </h3>
        <p className="mt-1 font-inter text-sm text-muted-text">
          {vault.mission_name || 'Mission details not set'}
        </p>

        {(vault.mission_start || vault.mission_end) && (
          <p className="mt-1 font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
            {formatServiceDates(vault.mission_start, vault.mission_end)}
          </p>
        )}

        <Divider className="my-4" />

        <div className="flex items-center justify-between">
          {book ? (
            <BookStatusBadge status={book.status} />
          ) : (
            <span className="font-inter text-xs text-muted-text">No book</span>
          )}

          {pendingCount > 0 && (
            <span className="font-space-mono text-[10px] text-amber-600">
              {pendingCount} pending
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
