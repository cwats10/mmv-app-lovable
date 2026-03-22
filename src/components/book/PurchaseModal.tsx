import { useState } from 'react';
import { PageTag } from '@/components/common/PageTag';
import { ErrorBanner } from '@/components/common/ErrorBanner';
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

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC','AS','GU','MP','PR','VI',
] as const;

const ZIP_RE = /^\d{5}(-\d{4})?$/;

interface FieldErrors {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

function validateAddress(addr: DeliveryAddress): FieldErrors {
  const errors: FieldErrors = {};
  if (addr.street.trim().length < 5) errors.street = 'Street address must be at least 5 characters.';
  if (addr.city.trim().length < 2) errors.city = 'City must be at least 2 characters.';
  if (!addr.state) errors.state = 'Please select a state.';
  if (!ZIP_RE.test(addr.zip.trim())) errors.zip = 'Enter a valid ZIP code (e.g. 84601 or 84601-1234).';
  return errors;
}

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  book: Book;
  vault: Vault;
  approvedCount?: number;
}

const inputClass = 'w-full border border-border-light bg-stone-bg px-4 py-3 font-inter text-sm text-dark-text outline-none';
const labelClass = 'mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text';
const fieldErrorClass = 'mt-1 font-inter text-xs text-red-600';

export function PurchaseModal({ open, onClose, book, vault }: PurchaseModalProps) {
  const [tier, setTier] = useState<Tier>('classic');
  const [extraCopies, setExtraCopies] = useState(0);
  const [address, setAddress] = useState<DeliveryAddress>({ street: '', city: '', state: '', zip: '', country: 'United States' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const pricing = PRICING[tier];
  const sizeDiscount = vault.book_size === '10x10' ? 10 : 0;
  const subtotal = pricing.base + pricing.extra * extraCopies - sizeDiscount;

  function set(field: keyof DeliveryAddress, value: string) {
    setAddress((a) => ({ ...a, [field]: value }));
    setFieldErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handlePurchase() {
    const errors = validateAddress(address);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('');
      return;
    }

    const trimmed: DeliveryAddress = {
      street: address.street.trim(),
      city: address.city.trim(),
      state: address.state,
      zip: address.zip.trim(),
      country: address.country,
    };

    setError('');
    setPurchasing(true);
    try {
      await supabase.from('books').update({ delivery_address: trimmed as unknown as null }).eq('id', book.id);
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
          {/* Street */}
          <div>
            <label className={labelClass}>Street</label>
            <input
              value={address.street}
              onChange={(e) => set('street', e.target.value)}
              placeholder="123 Main St, Apt 4"
              className={inputClass}
            />
            {fieldErrors.street && <p className={fieldErrorClass}>{fieldErrors.street}</p>}
          </div>

          {/* City */}
          <div>
            <label className={labelClass}>City</label>
            <input
              value={address.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="Provo"
              className={inputClass}
            />
            {fieldErrors.city && <p className={fieldErrorClass}>{fieldErrors.city}</p>}
          </div>

          {/* State */}
          <div>
            <label className={labelClass}>State</label>
            <select
              value={address.state}
              onChange={(e) => set('state', e.target.value)}
              className={inputClass}
            >
              <option value="">Select state…</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {fieldErrors.state && <p className={fieldErrorClass}>{fieldErrors.state}</p>}
          </div>

          {/* ZIP */}
          <div>
            <label className={labelClass}>ZIP Code</label>
            <input
              value={address.zip}
              onChange={(e) => set('zip', e.target.value)}
              placeholder="84601"
              maxLength={10}
              className={inputClass}
            />
            {fieldErrors.zip && <p className={fieldErrorClass}>{fieldErrors.zip}</p>}
          </div>

          {/* Country */}
          <div>
            <label className={labelClass}>Country</label>
            <select
              value={address.country}
              onChange={(e) => set('country', e.target.value)}
              className={inputClass}
            >
              <option value="United States">United States</option>
            </select>
          </div>
        </div>

        <ErrorBanner message={error} className="mt-4" />

        <Divider className="my-5" />

        <div className="flex gap-3">
          <HeirloomButton variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </HeirloomButton>
          <HeirloomButton loading={purchasing} onClick={handlePurchase} className="flex-1">
            Confirm & Pay — ${subtotal}
          </HeirloomButton>
        </div>
      </div>
    </div>
  );
}
