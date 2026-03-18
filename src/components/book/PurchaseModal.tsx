import { useState } from 'react';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { X, Minus, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { DeliveryAddress, Book, Vault } from '@/types';

type Tier = 'classic' | 'heirloom';

const PRICING = {
  classic:  { base: 149, extra: 99,  label: 'Classic' },
  heirloom: { base: 449, extra: 349, label: 'Heirloom' },
} as const;

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  book: Book;
  vault: Vault;
}

export function PurchaseModal({ open, onClose, book, vault }: PurchaseModalProps) {
  const [tier, setTier] = useState<Tier>('classic');
  const [extraCopies, setExtraCopies] = useState(0);
  const [address, setAddress] = useState<DeliveryAddress>({ street: '', city: '', state: '', zip: '', country: 'United States' });
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const pricing = PRICING[tier];
  const subtotal = pricing.base + pricing.extra * extraCopies;

  async function handlePurchase() {
    if (!address.street || !address.city || !address.state || !address.zip) {
      setError('Please complete all required address fields.');
      return;
    }
    setError('');
    setPurchasing(true);
    try {
      await supabase.from('books').update({ delivery_address: address as unknown as null }).eq('id', book.id);
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout-session', {
        body: { book_id: book.id, design_tier: tier, extra_copies: extraCopies },
      });
      if (fnError) throw fnError;
      if (data?.url) window.location.href = data.url;
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPurchasing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border-light bg-white p-8">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-text hover:text-dark-text">
          <X className="h-5 w-5" />
        </button>

        <PageTag>Purchase & Print</PageTag>
        <h2 className="mt-2 font-playfair text-2xl font-semibold text-dark-text">
          {vault.missionary_name}'s Memory Book
        </h2>

        <Divider className="my-5" />

        {/* Tier selection */}
        <label className="mb-2 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
          Edition
        </label>
        <div className="mb-6 grid grid-cols-2 gap-3">
          {(['classic', 'heirloom'] as Tier[]).map((t) => {
            const p = PRICING[t];
            const selected = tier === t;
            return (
              <button
                key={t}
                onClick={() => setTier(t)}
                className="border px-4 py-4 text-left transition-colors"
                style={{
                  borderColor: selected ? '#222222' : '#e0deda',
                  backgroundColor: selected ? '#faf9f7' : 'transparent',
                }}
              >
                <span className="block font-playfair text-base font-semibold text-dark-text">{p.label}</span>
                <span className="block font-inter text-sm text-muted-text">${p.base}</span>
                <span className="block font-space-mono text-[10px] text-muted-text">+${p.extra}/extra copy</span>
              </button>
            );
          })}
        </div>

        {/* Extra copies */}
        <label className="mb-2 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
          Additional Copies
        </label>
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => setExtraCopies((c) => Math.max(0, c - 1))}
            className="flex h-9 w-9 items-center justify-center border border-border-light text-dark-text hover:bg-stone-bg"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[2rem] text-center font-inter text-lg font-semibold text-dark-text">{extraCopies}</span>
          <button
            onClick={() => setExtraCopies((c) => Math.min(20, c + 1))}
            className="flex h-9 w-9 items-center justify-center border border-border-light text-dark-text hover:bg-stone-bg"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Subtotal */}
        <div className="mb-6 flex items-baseline justify-between border border-border-light bg-stone-bg px-4 py-3">
          <span className="font-space-mono text-[10px] uppercase tracking-wider text-muted-text">Estimated Total</span>
          <span className="font-playfair text-xl font-semibold text-dark-text">${subtotal}</span>
        </div>

        <Divider className="my-5" />

        {/* Delivery address */}
        <label className="mb-2 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
          Delivery Address
        </label>
        <div className="space-y-3">
          {(['street', 'city', 'state', 'zip', 'country'] as (keyof DeliveryAddress)[]).map((field) => (
            <div key={field}>
              <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                value={address[field]}
                onChange={(e) => setAddress((a) => ({ ...a, [field]: e.target.value }))}
                className="w-full border border-border-light bg-stone-bg px-4 py-3 font-inter text-sm text-dark-text outline-none"
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 border border-red-200 bg-red-50 px-4 py-2">
            <p className="font-inter text-sm text-red-600">{error}</p>
          </div>
        )}

        <Divider className="my-5" />

        <div className="flex gap-3">
          <HeirloomButton variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </HeirloomButton>
          <HeirloomButton loading={purchasing} onClick={handlePurchase} className="flex-1">
            Confirm & Pay: ${subtotal}
          </HeirloomButton>
        </div>
      </div>
    </div>
  );
}
