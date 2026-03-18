import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>(
    searchParams.get('tab') === 'signup' ? 'signup' : 'signin'
  );
  const [form, setForm] = useState({ name: '', email: '', password: '', referral: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (tab === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(form.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (resetError) throw resetError;
        setSuccess('Check your email for a password reset link.');
      } else if (tab === 'signup') {
        await signUp(form.email, form.password, form.name, form.referral || undefined);
        setSuccess('Account created! Please check your email to verify your address before signing in.');
      } else {
        await signIn(form.email, form.password);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const headings: Record<typeof tab, { tag: string; title: string }> = {
    signin: { tag: 'Welcome back', title: 'Sign in to your account' },
    signup: { tag: 'Start your vault', title: 'Create your account' },
    forgot: { tag: 'Reset password', title: 'Forgot your password?' },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-bg px-4">
      <div className="w-full max-w-md border border-border-light bg-white">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 pt-8">
          <span className="font-playfair text-lg font-semibold text-dark-text">Mission Memory Vault</span>
        </div>

        {/* Tab header */}
        {tab !== 'forgot' && (
          <div className="mt-6 flex">
            {(['signin', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                className="flex-1 py-4 font-inter text-sm transition-colors"
                style={{
                  backgroundColor: tab === t ? '#2b2b2a' : 'transparent',
                  color: tab === t ? '#fefefe' : '#555555',
                  borderBottom: tab !== t ? '1px solid #e0deda' : 'none',
                }}
              >
                {t === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8">
          <PageTag>{headings[tab].tag}</PageTag>
          <h1 className="mt-2 font-playfair text-2xl font-semibold text-dark-text">
            {headings[tab].title}
          </h1>
          <Divider className="my-5" />

          {tab === 'signup' && (
            <div className="mb-4">
              <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
                Your Name
              </label>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="w-full border border-border-light bg-stone-bg px-4 py-3 font-inter text-sm text-dark-text outline-none"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="w-full border border-border-light bg-stone-bg px-4 py-3 font-inter text-sm text-dark-text outline-none"
            />
          </div>

          {tab !== 'forgot' && (
            <div className="mb-4">
              <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
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
          )}

          {tab === 'signup' && (
            <div className="mb-4">
              <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
                Referral Code (Optional)
              </label>
              <input
                value={form.referral}
                onChange={(e) => set('referral', e.target.value)}
                className="w-full border border-border-light bg-stone-bg px-4 py-3 font-inter text-sm text-dark-text outline-none"
              />
            </div>
          )}

          {error && (
            <div className="mb-4 border border-red-200 bg-red-50 px-4 py-2">
              <p className="font-inter text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 border border-green-200 bg-green-50 px-4 py-2">
              <p className="font-inter text-sm text-green-700">{success}</p>
            </div>
          )}

          <HeirloomButton type="submit" loading={loading} className="w-full">
            {tab === 'signin' ? 'Sign In' : tab === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </HeirloomButton>

          {tab === 'signin' && (
            <p className="mt-3 text-center">
              <button
                type="button"
                onClick={() => { setTab('forgot'); setError(''); setSuccess(''); }}
                className="font-inter text-sm text-muted-text underline hover:text-dark-text"
              >
                Forgot your password?
              </button>
            </p>
          )}

          <p className="mt-4 text-center font-inter text-sm text-muted-text">
            {tab === 'forgot' ? (
              <>
                Back to{' '}
                <button type="button" onClick={() => { setTab('signin'); setSuccess(''); }} className="text-dark-text underline">
                  Sign in
                </button>
              </>
            ) : tab === 'signin' ? (
              <>Don't have an account?{' '}
                <button type="button" onClick={() => setTab('signup')} className="text-dark-text underline">
                  Create one
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button type="button" onClick={() => setTab('signin')} className="text-dark-text underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
