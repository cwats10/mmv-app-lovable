import { useState } from 'react';
import { toast } from 'sonner';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronRight, Eye, X, Settings, Trash2, Share2, MessageSquare, Check, Circle, Mail } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function VaultDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vault, loading: vaultLoading, updateVault: updateSingleVault } = useVault(id);
  const { user, profile } = useAuth();
  const { deleteVault } = useVaults(user?.id);
  const { book } = useBook(id);
  const { pending, approved, rejected, submissions, totalCount, hasMore, loadMore, loadingMore, deleteSubmission } = useSubmissions(id);
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
          <p className="font-inter text-sm text-muted-foreground">Loading…</p>
        </div>
      </AppShell>
    );
  }

  if (!vault) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <p className="font-inter text-sm text-muted-foreground">Vault not found.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 font-inter text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">Vaults</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{vault.missionary_name}</span>
      </div>

      {/* Header */}
      <div>
        <PageTag>{vault.vault_type === 'post' ? 'Post-Mission Vault' : 'Pre-Mission Vault'}</PageTag>
        <h1 className="mt-1 font-playfair text-2xl font-semibold text-foreground sm:text-3xl">
          {vault.missionary_name}
        </h1>
        <p className="font-inter text-sm text-muted-foreground">{vault.mission_name}</p>
        {(vault.mission_start || vault.mission_end) && (
          <p className="mt-1 font-space-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {formatServiceDates(vault.mission_start, vault.mission_end)}
          </p>
        )}
      </div>

      {/* Compact stats row */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: totalCount },
          { label: 'Pending', value: pending.length },
          { label: 'Approved', value: approved.length },
          { label: 'Rejected', value: rejected.length },
        ].map(({ label, value }) => (
          <div key={label} className="border border-border bg-card px-3 py-2.5 text-center">
            <p className="font-playfair text-xl font-semibold text-foreground">{value}</p>
            <p className="font-space-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Book status + preview actions */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {book && (
            <>
              <PageTag>Memory Book</PageTag>
              <BookStatusBadge status={book.status} />
              {pending.length > 0 && (
                <span className="font-inter text-xs text-amber-600">
                  {pending.length} awaiting review
                </span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {approved.length > 0 && (
            <HeirloomButton variant="ghost" size="sm" onClick={() => setPreviewOpen(true)}>
              <Eye className="mr-1.5 h-4 w-4" /> Preview
            </HeirloomButton>
          )}
          {book && (
            <Link to={`/vault/${vault.id}/book/${book.id}`}>
              <HeirloomButton size="sm">
                {book.status === 'collecting' ? 'Review Book' : 'View Book'}
              </HeirloomButton>
            </Link>
          )}
        </div>
      </div>

      {/* Pricing summary */}
      {book && book.status === 'collecting' && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border border-border bg-card px-4 py-2.5">
          <p className="font-inter text-xs text-muted-foreground">
            {vault.book_size === '10x10'
              ? 'Classic 10×10 — $149 · Heirloom 10×10 — $439'
              : 'Classic 12×12 — $149 · Heirloom 12×12 — $449'}
          </p>
          {profile && (profile as any).reward_balance > 0 && (
            <p className="font-inter text-xs font-medium text-emerald-600">
              You have ${(profile as any).reward_balance} in rewards to apply
            </p>
          )}
        </div>
      )}

      {/* Order Status Timeline */}
      {book && ['purchased', 'printing', 'delivered', 'disputed'].includes(book.status) && (
        <div className="mt-4 border border-border bg-card px-4 py-5 sm:px-6">
          <PageTag>Order Status</PageTag>

          <div className="mt-4 flex items-start gap-0">
            {([
              { key: 'purchased', label: 'Order Placed' },
              { key: 'generating', label: 'Generating PDF' },
              { key: 'printing', label: 'Sent to Printer' },
              { key: 'shipped', label: 'Shipped' },
              { key: 'delivered', label: 'Delivered' },
            ] as const).map((step, i, arr) => {
              const statusOrder = ['purchased', 'generating', 'printing', 'shipped', 'delivered'];
              const currentIdx = book.status === 'delivered' ? 4
                : book.status === 'printing' ? (book.pdf_url ? 2 : 1)
                : 0;
              const done = i <= currentIdx;
              const active = i === currentIdx;

              return (
                <div key={step.key} className="flex flex-1 flex-col items-center text-center">
                  {/* Dot + connector */}
                  <div className="flex w-full items-center">
                    {i > 0 && (
                      <div
                        className="h-0.5 flex-1 transition-colors"
                        style={{ backgroundColor: done ? '#2b2b2a' : '#e0deda' }}
                      />
                    )}
                    <div
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors"
                      style={{
                        backgroundColor: done ? '#2b2b2a' : '#f4f1ec',
                        border: done ? 'none' : '1.5px solid #e0deda',
                      }}
                    >
                      {done ? (
                        <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                      ) : (
                        <Circle className="h-2 w-2 text-muted-foreground" />
                      )}
                    </div>
                    {i < arr.length - 1 && (
                      <div
                        className="h-0.5 flex-1 transition-colors"
                        style={{ backgroundColor: i < currentIdx ? '#2b2b2a' : '#e0deda' }}
                      />
                    )}
                  </div>
                  <span
                    className="mt-1.5 font-space-mono text-[9px] uppercase tracking-wider sm:text-[10px]"
                    style={{ color: done ? '#2b2b2a' : '#999' }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-inter text-xs text-muted-foreground">
              Estimated delivery: 2–3 weeks from purchase
            </p>
            <a
              href="mailto:support@missionmemoryvault.com"
              className="inline-flex items-center gap-1 font-inter text-xs text-muted-foreground underline transition-colors hover:text-foreground"
            >
              <Mail className="h-3 w-3" /> Contact Support
            </a>
          </div>
        </div>
      )}

      <Tabs defaultValue="sharing" className="mt-8">
        <TabsList className="grid w-full grid-cols-3 bg-muted h-auto">
          <TabsTrigger value="sharing" className="gap-1.5 font-inter text-xs sm:text-sm px-2 py-2">
            <Share2 className="h-3.5 w-3.5 hidden sm:inline-block" /> Sharing
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5 font-inter text-xs sm:text-sm px-2 py-2">
            <Settings className="h-3.5 w-3.5 hidden sm:inline-block" /> Settings
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-1.5 font-inter text-xs sm:text-sm px-2 py-2">
            <MessageSquare className="h-3.5 w-3.5 hidden sm:inline-block" /> Messages
          </TabsTrigger>
        </TabsList>

        {/* Sharing Tab */}
        <TabsContent value="sharing" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
            <VaultShareWidget submissionToken={vault.submission_token} />
            {isOwner && vault.manager_token && (
              <ManagerShareWidget managerToken={vault.manager_token} />
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6 space-y-8">
          <div className="border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <PageTag>Book Settings</PageTag>
            </div>
            <div>
              <label className="mb-2 block font-space-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Pages Per Contributor
              </label>
              <div className="flex max-w-sm">
                {([1, 2] as const).map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={async () => {
                      if (vault.contributor_page_allowance !== n) {
                        try {
                          await updateSingleVault({ contributor_page_allowance: n });
                        } catch {
                          toast.error('Failed to update page allowance.');
                        }
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
              <p className="mt-1.5 font-inter text-[11px] text-muted-foreground">
                {(vault.contributor_page_allowance ?? 1) === 1
                  ? 'Each contributor creates one beautifully designed page.'
                  : 'Each contributor gets a full two-page spread with a showcase image and their story.'}
              </p>
            </div>

            {/* Book Size */}
            <div className="mt-6">
              <label className="mb-2 block font-space-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Book Size
              </label>
              <div className="flex max-w-sm">
                {(['10x10', '12x12'] as const).map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={async () => {
                      if (vault.book_size !== size) {
                        try {
                          await updateSingleVault({ book_size: size });
                        } catch {
                          toast.error('Failed to update book size.');
                        }
                      }
                    }}
                    className="flex-1 py-2 font-inter text-sm transition-colors"
                    style={{
                      backgroundColor: (vault.book_size ?? '12x12') === size ? '#2b2b2a' : 'transparent',
                      color: (vault.book_size ?? '12x12') === size ? '#fefefe' : '#555555',
                      border: '1px solid #e0deda',
                      borderRight: size === '10x10' ? 'none' : '1px solid #e0deda',
                    }}
                  >
                    {size === '10x10' ? '10×10 in' : '12×12 in'}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 font-inter text-[11px] text-muted-foreground">
                {(vault.book_size ?? '12x12') === '10x10'
                  ? '10×10 inch — compact format, $10 less per book.'
                  : '12×12 inch — larger premium format.'}
              </p>
            </div>
          </div>

          {/* Delete vault — owner only */}
          {isOwner && (
            <div className="border-t border-border pt-6">
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
        </TabsContent>

        {/* Message Bank Tab */}
        <TabsContent value="messages" className="mt-6">
          {totalCount > 0 && (
            <p className="mb-3 font-inter text-xs text-muted-foreground">
              Showing {submissions.length} of {totalCount} submission{totalCount !== 1 ? 's' : ''}
            </p>
          )}
          <MessageBank vaults={[vault]} profile={profile} />
          {hasMore && (
            <div className="mt-6 text-center">
              <HeirloomButton variant="ghost" size="sm" loading={loadingMore} onClick={loadMore}>
                Load More
              </HeirloomButton>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Book preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-foreground/95 p-4 sm:p-8">
          <div className="mx-auto max-w-5xl">
            <button
              onClick={() => setPreviewOpen(false)}
              className="mb-6 text-background transition-colors hover:text-muted-foreground"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="mb-8">
              <BookSpread vault={vault} isCover />
            </div>
            {approved.map((sub, i) => (
              <div key={sub.id} className="mb-8">
                <BookSpread vault={vault} submission={sub} pageNumber={i + 1} />
              </div>
            ))}
            <div className="mb-8">
              <BookSpread vault={vault} isBackCover />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}