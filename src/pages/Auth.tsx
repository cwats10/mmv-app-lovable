import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { BookOpen } from 'lucide-react';

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
    try {
      if (tab === 'signup') {
        await signUp(form.email, form.password, form.name, form.referral || undefined);
      } else {
        await signIn(form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#f4f2ef' }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-12">
        <BookOpen size={18} strokeWidth={1.5} className="text-[#222222]" />
        <span className="font-playfair text-xl font-normal text-[#222222]">Memory Vault</span>
      </Link>

      <div
        className="w-full max-w-md"
        style={{ backgroundColor: '#ffffff', border: '1px solid #e0deda' }}
      >
        {/* Tab header */}
        <div className="flex">
          {(['signin', 'signup'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className="flex-1 py-4 text-sm font-inter transition-colors"
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

        <div className="p-8">
          <PageTag className="block mb-3">
            {tab === 'signin' ? 'Welcome back' : 'Start your vault'}
          </PageTag>
          <h1 className="font-playfair text-3xl font-normal text-[#222222] mb-2">
            {tab === 'signin' ? 'Sign in to your account' : 'Create your account'}
          </h1>

          <Divider className="my-6" />

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="font-space-mono text-xs text-[#555555] uppercase tracking-widest block mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  className="w-full px-4 py-3 text-sm font-inter text-[#222222] outline-none"
                  style={{ border: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
                />
              </div>
            )}

            <div>
              <label className="font-space-mono text-xs text-[#555555] uppercase tracking-widest block mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="w-full px-4 py-3 text-sm font-inter text-[#222222] outline-none"
                style={{ border: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
              />
            </div>

            <div>
              <label className="font-space-mono text-xs text-[#555555] uppercase tracking-widest block mb-2">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                className="w-full px-4 py-3 text-sm font-inter text-[#222222] outline-none"
                style={{ border: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
              />
            </div>

            {tab === 'signup' && (
              <div>
                <label className="font-space-mono text-xs text-[#555555] uppercase tracking-widest block mb-2">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter referral code"
                  value={form.referral}
                  onChange={(e) => set('referral', e.target.value)}
                  className="w-full px-4 py-3 text-sm font-inter text-[#222222] outline-none"
                  style={{ border: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 font-inter">{error}</p>
            )}

            <HeirloomButton type="submit" loading={loading} size="lg" className="w-full mt-2">
              {tab === 'signin' ? 'Sign In' : 'Create Account'}
            </HeirloomButton>
          </form>
        </div>
      </div>

      <p className="mt-6 text-sm text-[#555555] font-inter">
        {tab === 'signin' ? (
          <>Don't have an account?{' '}
            <button onClick={() => setTab('signup')} className="text-[#222222] underline">
              Create one
            </button>
          </>
        ) : (
          <>Already have an account?{' '}
            <button onClick={() => setTab('signin')} className="text-[#222222] underline">
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
