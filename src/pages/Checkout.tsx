import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { BookOpen, CheckCircle } from 'lucide-react';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return; }
    // Verify via edge function and update book status
    supabase.functions
      .invoke('verify-checkout-session', { body: { session_id: sessionId } })
      .then(({ error }) => {
        setStatus(error ? 'error' : 'success');
      });
  }, [sessionId]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: '#f4f2ef' }}
    >
      <Link to="/" className="flex items-center gap-2 mb-14">
        <BookOpen size={18} strokeWidth={1.5} className="text-[#222222]" />
        <span className="font-playfair text-xl font-normal text-[#222222]">Memory Vault</span>
      </Link>

      {status === 'loading' && (
        <span className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">
          Confirming your order…
        </span>
      )}

      {status === 'success' && (
        <div className="max-w-md">
          <CheckCircle size={40} strokeWidth={1} className="text-emerald-500 mb-6 mx-auto" />
          <PageTag className="block mb-4">Order Confirmed</PageTag>
          <h1 className="font-playfair text-4xl font-normal text-[#222222] mb-3">
            Your book is on its way.
          </h1>
          <Divider className="my-6 mx-auto" />
          <p className="text-sm text-[#555555] mb-10" style={{ lineHeight: 1.8 }}>
            Your Memory Book has been ordered and will be sent to print. You will receive a tracking notification once it ships.
          </p>
          <Link to="/dashboard">
            <HeirloomButton size="lg">Return to Dashboard</HeirloomButton>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="max-w-md">
          <PageTag className="block mb-4">Something went wrong</PageTag>
          <h1 className="font-playfair text-3xl font-normal text-[#222222] mb-3">
            We couldn't confirm your order.
          </h1>
          <p className="text-sm text-[#555555] mb-8">
            Please contact support or return to your dashboard.
          </p>
          <Link to="/dashboard">
            <HeirloomButton variant="secondary" size="lg">Return to Dashboard</HeirloomButton>
          </Link>
        </div>
      )}
    </div>
  );
}
