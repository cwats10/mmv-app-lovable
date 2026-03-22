import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { PageTag } from '@/components/common/PageTag';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { Divider } from '@/components/common/Divider';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setReady(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain at least one letter and one number.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-bg px-4">
      <div className="w-full max-w-md border border-border-light bg-white">
        <div className="flex items-center justify-center gap-2 pt-8">
          <span className="font-playfair text-lg font-semibold text-dark-text">Mission Memory Vault</span>
        </div>

        <div className="p-8">
          <PageTag>Security</PageTag>
          <h1 className="mt-2 font-playfair text-2xl font-semibold text-dark-text">
            Set a new password
          </h1>
          <Divider className="my-5" />

          {!ready && !success && (
            <p className="font-inter text-sm text-muted-text">
              This link is invalid or has expired. Please request a new password reset from the{' '}
              <a href="/auth" className="text-dark-text underline">sign in page</a>.
            </p>
          )}

          {success && (
            <div className="border border-green-200 bg-green-50 px-4 py-3">
              <p className="font-inter text-sm text-green-700">
                Password updated successfully! Redirecting to your dashboard...
              </p>
            </div>
          )}

          {ready && !success && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    className="w-full border border-border-light bg-stone-bg px-4 py-3 pr-12 font-inter text-sm text-dark-text outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-dark-text"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                  className="w-full border border-border-light bg-stone-bg px-4 py-3 font-inter text-sm text-dark-text outline-none"
                />
              </div>

              <ErrorBanner message={error} className="mb-4" />

              <HeirloomButton type="submit" loading={loading} className="w-full">
                Update Password
              </HeirloomButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
