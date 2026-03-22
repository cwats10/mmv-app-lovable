import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';


export default function Auth() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<'signin' | 'signup'>(
    searchParams.get('tab') === 'signup' ? 'signup' : 'signin'
  );
  const [form, setForm] = useState({ name: '', email: '', password: '', referral: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const trimmedEmail = form.email.trim();
    const trimmedName = form.name.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    if (tab === 'signup' && !trimmedName) {
      setError('Please enter your name.');
      setLoading(false);
      return;
    }

    try {
      if (tab === 'signup') {
        await signUp(trimmedEmail, form.password, trimmedName, form.referral.trim() || undefined);
      } else {
        await signIn(trimmedEmail, form.password);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-bg px-4">
      <div className="w-full max-w-md border border-border-light bg-white">
        {/* Logo */}
        <div className="flex items-center justify-center pt-8">
          <span className="font-playfair text-lg font-semibold text-dark-text">Mission Memory Vault</span>
        </div>

        {/* Tab header */}
        <div className="mt-6 flex">
          {(['signin', 'signup'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className="flex-1 py-4 font-inter text-sm transition-colors"
              style={{
                backgroundColor: tab === t ? '#222222' : 'transparent',
                color: tab === t ? '#ffffff' : '#555555',
                borderBottom: tab !== t ? '1px solid #e0deda' : 'none',
              }}
            >
              {t === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <PageTag>{tab === 'signin' ? 'Welcome back' : 'Start your vault'}</PageTag>
          <h1 className="mt-2 font-playfair text-2xl font-semibold text-dark-text">
            {tab === 'signin' ? 'Sign in to your account' : 'Create your account'}
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

          <div className="mb-4">
            <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className="w-full border border-border-light bg-stone-bg px-4 py-3 font-inter text-sm text-dark-text outline-none"
            />
          </div>

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

          <HeirloomButton type="submit" loading={loading} className="w-full">
            {tab === 'signin' ? 'Sign In' : 'Create Account'}
          </HeirloomButton>

          <p className="mt-4 text-center font-inter text-sm text-muted-text">
            {tab === 'signin' ? (
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
