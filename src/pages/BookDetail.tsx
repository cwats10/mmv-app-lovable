import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { SubmissionCard } from '@/components/submission/SubmissionCard';
import { BookStatusBadge } from '@/components/book/BookStatusBadge';
import { BookSpread } from '@/components/book/BookSpread';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { useVault } from '@/hooks/useVaults';
import { useBook } from '@/hooks/useBook';
import { useSubmissions } from '@/hooks/useSubmissions';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { ChevronRight, Eye, X, MapPin, BookMarked, Plus, Minus } from 'lucide-react';
import type { DeliveryAddress, DesignTier } from '@/types';

// ── Pricing constants ──────────────────────────────────────────────────────────
const PRICE = {
  classic : { base: 149, extra: 99  },
  heirloom: { base: 449, extra: 349 },
} as const;

function orderTotal(tier: DesignTier, copies: number, rewardBalance: number): {
  base: number; extras: number; discount: number; total: number;
} {
  const base    = PRICE[tier].base;
  const extras  = PRICE[tier].extra * copies;
  const subtotal = base + extras;
  const discount = Math.min(rewardBalance, subtotal);
  return { base, extras, discount, total: subtotal - discount };
}

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

export default function BookDetail() {
  const { id: vaultId, bookId } = useParams<{ id: string; bookId: string }>();
  const { vault } = useVault(vaultId);
  const { book } = useBook(vaultId);
  const { submissions, pending, approved, reject, approve, refetch } = useSubmissions(vaultId);
  const { profile } = useAuth();

  const [filter, setFilter] = useState<FilterTab>('all');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Checkout form state
  const [tier, setTier] = useState<DesignTier>('classic');
  const [extraCopies, setExtraCopies] = useState(0);
  const [address, setAddress] = useState<DeliveryAddress>({ street: '', city: '', state: '', zip: '', country: 'United States' });
  const [purchasing, setPurchasing] = useState(false);
  const [addressError, setAddressError] = useState('');

  const rewardBalance = profile?.reward_balance ?? 0;
  const pricing = orderTotal(tier, extraCopies, rewardBalance);

  const isLocked = !!(book && !['collecting', 'review'].includes(book.status));

  // Submissions that arrived AFTER the book was locked belong to a future edition.
  // locked_at is stamped by a DB trigger when status moves to 'purchased'.
  function isFutureEdition(s: typeof submissions[number]) {
    if (!isLocked || !book?.locked_at) return false;
    return new Date(s.created_at) > new Date(book.locked_at);
  }

  const currentEditionSubmissions = submissions.filter((s) => !isFutureEdition(s));
  const futureEditionSubmissions  = submissions.filter((s) => isFutureEdition(s));

  const filtered = (filter === 'all' ? currentEditionSubmissions
    : currentEditionSubmissions.filter((s) => s.status === filter));

  async function handleApprove(submissionId: string, bId?: string) {
    await approve(submissionId, bId);
    await refetch();
  }

  async function handleReject(submissionId: string) {
    await reject(submissionId);
  }

  async function handlePurchase() {
    if (!book || !vault) return;
    if (!address.street || !address.city || !address.state || !address.zip) {
      setAddressError('Please complete all address fields.');
      return;
    }
    setAddressError('');
    setPurchasing(true);
    try {
      // Persist tier, copies, and address before creating the Stripe session
      await supabase.from('books').update({
        delivery_address: address,
        design_tier     : tier,
        extra_copies    : extraCopies,
      }).eq('id', book.id);

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { book_id: book.id, design_tier: tier, extra_copies: extraCopies },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setAddressError('Something went wrong. Please try again.');
    } finally {
      setPurchasing(false);
    }
  }

  if (!vault || !book) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-24">
          <span className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">Loading…</span>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-10 pb-32 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 font-space-mono text-xs text-[#555555]">
          <Link to="/dashboard" className="hover:text-[#222222] uppercase tracking-widest">Vaults</Link>
          <ChevronRight size={12} />
          <Link to={`/dashboard/vault/${vaultId}`} className="hover:text-[#222222] uppercase tracking-widest">
            {vault.missionary_name}
          </Link>
          <ChevronRight size={12} />
          <span className="uppercase tracking-widest text-[#222222]">Book</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <PageTag className="block mb-2">Memory Book</PageTag>
            <h1 className="font-playfair text-4xl font-normal text-[#222222]">
              {vault.missionary_name}
            </h1>
            <p className="text-sm text-[#555555] mt-1">{vault.mission_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <BookStatusBadge status={book.status} />
            {approved.length > 0 && (
              <HeirloomButton
                variant="secondary"
                size="sm"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye size={13} className="mr-1.5" /> Preview Book
              </HeirloomButton>
            )}
          </div>
        </div>

        <Divider className="mb-8" />

        {/* Filter tabs */}
        <div className="flex gap-0 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as FilterTab[]).map((t) => {
            const counts = {
              all: currentEditionSubmissions.length,
              pending: currentEditionSubmissions.filter(s => s.status === 'pending').length,
              approved: currentEditionSubmissions.filter(s => s.status === 'approved').length,
              rejected: currentEditionSubmissions.filter(s => s.status === 'rejected').length,
            };
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className="px-4 py-2 text-xs font-space-mono uppercase tracking-wider transition-colors"
                style={{
                  backgroundColor: filter === t ? '#222222' : 'transparent',
                  color: filter === t ? '#ffffff' : '#555555',
                  border: '1px solid #e0deda',
                  borderRight: t !== 'rejected' ? 'none' : '1px solid #e0deda',
                }}
              >
                {t} ({counts[t]})
              </button>
            );
          })}
        </div>

        {/* Current-edition submissions */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <span className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">
              No {filter === 'all' ? '' : filter} submissions yet.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                bookId={bookId}
                onApprove={isLocked ? undefined : handleApprove}
                onReject={isLocked ? undefined : handleReject}
                readonly={isLocked}
              />
            ))}
          </div>
        )}

        {/* Future-edition queue — memories received after this book was finalized */}
        {futureEditionSubmissions.length > 0 && (
          <div className="mt-12">
            <div
              className="flex items-center gap-3 mb-4 pb-4"
              style={{ borderBottom: '1px solid #e0deda' }}
            >
              <BookMarked size={14} strokeWidth={1.5} className="text-[#555555]" />
              <div>
                <PageTag>Future Edition Queue</PageTag>
                <p className="text-xs text-[#555555] mt-1" style={{ lineHeight: 1.6 }}>
                  {futureEditionSubmissions.length}{' '}
                  {futureEditionSubmissions.length === 1 ? 'memory' : 'memories'} received
                  after this edition was finalized — preserved for the next print run.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {futureEditionSubmissions.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  readonly
                  futureEdition
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pinned purchase bar */}
      {!isLocked && (
        <div
          className="fixed bottom-0 right-0 flex items-center justify-between px-8 py-4 z-20"
          style={{ left: '240px', backgroundColor: '#ffffff', borderTop: '1px solid #e0deda' }}
        >
          <div className="flex items-center gap-4">
            <span className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">
              {approved.length} approved {approved.length !== 1 ? 'stories' : 'story'}
            </span>
            {pending.length > 0 && (
              <span className="font-space-mono text-xs text-amber-600">
                {pending.length} pending review
              </span>
            )}
          </div>
          <HeirloomButton
            variant="primary"
            size="lg"
            disabled={approved.length === 0}
            onClick={() => setCheckoutOpen(true)}
          >
            Purchase & Print
          </HeirloomButton>
        </div>
      )}

      {/* Book preview modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto py-12 px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
        >
          <button
            onClick={() => setPreviewOpen(false)}
            className="self-end mb-6 text-white hover:text-[#e0deda] transition-colors"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
          <div className="space-y-8">
            {approved.map((sub, i) => (
              <BookSpread key={sub.id} vault={vault} submission={sub} pageNumber={i + 2} />
            ))}
          </div>
        </div>
      )}

      {/* Checkout configuration modal */}
      {checkoutOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-10 px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="w-full max-w-lg"
            style={{ backgroundColor: '#ffffff', border: '1px solid #e0deda' }}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <PageTag className="block mb-2">Complete Your Order</PageTag>
                  <h2 className="font-playfair text-2xl font-normal text-[#222222]">
                    Configure your book
                  </h2>
                </div>
                <button onClick={() => setCheckoutOpen(false)}>
                  <X size={18} strokeWidth={1.5} className="text-[#555555]" />
                </button>
              </div>

              <Divider className="mb-6" />

              {/* ── Edition ── */}
              <div className="mb-6">
                <p className="font-space-mono text-xs text-[#555555] uppercase tracking-widest mb-3">
                  Edition
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    {
                      id: 'classic' as DesignTier,
                      name: 'Classic',
                      price: 149,
                      features: ['Hardcover binding', 'Standard paper stock', 'Museum-quality print'],
                    },
                    {
                      id: 'heirloom' as DesignTier,
                      name: 'Heirloom',
                      price: 449,
                      features: ['Premium lay-flat binding', 'Archival paper stock', 'Museum-quality print', 'Gold foil spine'],
                    },
                  ] as const).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTier(t.id)}
                      className="text-left p-4 transition-colors"
                      style={{
                        border: `1.5px solid ${tier === t.id ? '#222222' : '#e0deda'}`,
                        backgroundColor: tier === t.id ? '#f4f2ef' : '#ffffff',
                      }}
                    >
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="font-space-mono text-xs uppercase tracking-widest text-[#222222]">
                          {t.name}
                        </span>
                        <span className="font-playfair text-xl text-[#222222]">${t.price}</span>
                      </div>
                      <ul className="space-y-1">
                        {t.features.map((f) => (
                          <li key={f} className="font-space-mono text-xs text-[#555555]">— {f}</li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Extra copies ── */}
              <div className="mb-6">
                <p className="font-space-mono text-xs text-[#555555] uppercase tracking-widest mb-1">
                  Extra Copies
                </p>
                <p className="text-xs text-[#555555] font-inter mb-3" style={{ lineHeight: 1.6 }}>
                  Want copies for grandparents or your own home? Add identical copies to this order
                  for <strong className="text-[#222222]">${PRICE[tier].extra} each</strong>.
                </p>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setExtraCopies((n) => Math.max(0, n - 1))}
                    disabled={extraCopies === 0}
                    className="flex items-center justify-center w-8 h-8 transition-colors"
                    style={{
                      border: '1px solid #e0deda',
                      color: extraCopies === 0 ? '#e0deda' : '#222222',
                    }}
                  >
                    <Minus size={13} />
                  </button>
                  <span className="font-playfair text-xl text-[#222222] w-6 text-center">
                    {extraCopies}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExtraCopies((n) => Math.min(20, n + 1))}
                    className="flex items-center justify-center w-8 h-8 transition-colors"
                    style={{ border: '1px solid #e0deda', color: '#222222' }}
                  >
                    <Plus size={13} />
                  </button>
                  <span className="font-space-mono text-xs text-[#555555]">
                    {extraCopies === 0 ? 'No extra copies' : `${extraCopies} extra ${extraCopies === 1 ? 'copy' : 'copies'}`}
                  </span>
                </div>
              </div>

              {/* ── Order summary ── */}
              <div
                className="mb-6 p-4"
                style={{ border: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
              >
                <p className="font-space-mono text-xs text-[#555555] uppercase tracking-widest mb-3">
                  Order Summary
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm font-inter text-[#555555]">
                    <span>{tier === 'classic' ? 'Classic' : 'Heirloom'} Edition</span>
                    <span>${pricing.base}</span>
                  </div>
                  {extraCopies > 0 && (
                    <div className="flex justify-between text-sm font-inter text-[#555555]">
                      <span>{extraCopies} extra {extraCopies === 1 ? 'copy' : 'copies'}</span>
                      <span>${pricing.extras}</span>
                    </div>
                  )}
                  {pricing.discount > 0 && (
                    <div className="flex justify-between text-sm font-inter" style={{ color: '#555555' }}>
                      <span>Referral credit</span>
                      <span>−${pricing.discount}</span>
                    </div>
                  )}
                  <div
                    className="flex justify-between pt-2 mt-2"
                    style={{ borderTop: '1px solid #e0deda' }}
                  >
                    <span className="font-space-mono text-xs uppercase tracking-widest text-[#222222]">
                      Total
                    </span>
                    <span className="font-playfair text-xl text-[#222222]">${pricing.total}</span>
                  </div>
                </div>
              </div>

              {/* ── Delivery address ── */}
              <div className="mb-5">
                <p className="font-space-mono text-xs text-[#555555] uppercase tracking-widest mb-3">
                  Delivery Address
                </p>
                <div className="space-y-3">
                  {(['street', 'city', 'state', 'zip', 'country'] as (keyof DeliveryAddress)[]).map((field) => (
                    <div key={field}>
                      <label className="font-space-mono text-xs text-[#555555] uppercase tracking-widest block mb-1">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        type="text"
                        value={address[field]}
                        onChange={(e) => setAddress((a) => ({ ...a, [field]: e.target.value }))}
                        className="w-full px-4 py-2.5 text-sm font-inter text-[#222222] outline-none"
                        style={{ border: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {addressError && (
                <p className="text-sm text-red-600 font-inter mb-4">{addressError}</p>
              )}

              <HeirloomButton
                variant="primary"
                size="lg"
                loading={purchasing}
                onClick={handlePurchase}
                className="w-full"
              >
                <MapPin size={13} className="mr-1.5" /> Pay ${pricing.total} & Print
              </HeirloomButton>

              {/* Fine print */}
              <p
                className="font-space-mono text-center mt-4"
                style={{ fontSize: '0.6rem', color: '#e0deda', letterSpacing: '0.08em', lineHeight: 1.7 }}
              >
                ADDITIONAL-COPY PRICING APPLIES TO IDENTICAL COPIES IN THE SAME ORDER.
                NEW DESIGNS ARE SEPARATE BOOKS.
              </p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
