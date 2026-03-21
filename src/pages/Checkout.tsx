import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { CheckCircle } from 'lucide-react';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return; }
    supabase.functions
      .invoke('verify-checkout-session', { body: { session_id: sessionId } })
      .then(({ error }) => {
        setStatus(error ? 'error' : 'success');
      });
  }, [sessionId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-bg px-4 text-center">
      <div className="flex items-center gap-2 text-dark-text">
        <BookOpen className="h-5 w-5" />
        <span className="font-playfair text-lg font-semibold">Mission Memory Vault</span>
      </div>
      <Divider className="my-6 w-32" />

      {status === 'loading' && (
        <p className="font-inter text-sm text-muted-text">Confirming your order…</p>
      )}

      {status === 'success' && (
        <div className="max-w-md">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-600" />
          <PageTag className="mt-4 block">Order Confirmed</PageTag>
          <h1 className="mt-3 font-playfair text-3xl font-semibold text-dark-text">
            Your book is on its way.
          </h1>
          <p className="mt-2 font-inter text-sm text-muted-text">
            Your Memory Book has been ordered and will be sent to print. You will receive a tracking notification once it ships.
          </p>
          <Link to="/dashboard" className="mt-6 inline-block">
            <HeirloomButton>Return to Dashboard</HeirloomButton>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="max-w-md">
          <PageTag>Something went wrong</PageTag>
          <h1 className="mt-3 font-playfair text-3xl font-semibold text-dark-text">
            We couldn't confirm your order.
          </h1>
          <p className="mt-2 font-inter text-sm text-muted-text">
            Please contact support or return to your dashboard.
          </p>
          <Link to="/dashboard" className="mt-6 inline-block">
            <HeirloomButton>Return to Dashboard</HeirloomButton>
          </Link>
        </div>
      )}
    </div>
  );
}
