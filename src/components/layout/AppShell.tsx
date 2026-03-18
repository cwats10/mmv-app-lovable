import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DashboardNav } from './DashboardNav';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-bg">
        <p className="font-inter text-sm text-muted-text">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!user.email_confirmed_at) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-bg px-4">
        <div className="w-full max-w-md border border-border-light bg-white p-8 text-center">
          <h1 className="font-playfair text-2xl font-semibold text-dark-text">
            Verify your email
          </h1>
          <p className="mt-3 font-inter text-sm text-muted-text">
            We sent a verification link to <strong>{user.email}</strong>. Please check your inbox and click the link to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 font-inter text-sm text-dark-text underline"
          >
            I've verified, refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-bg">
      <DashboardNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
