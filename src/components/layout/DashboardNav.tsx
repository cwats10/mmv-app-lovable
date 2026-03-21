import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Gift, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const links = [
  { to: '/dashboard', label: 'Vaults', icon: Home },
  { to: '/referral', label: 'Referrals', icon: Gift },
];

export function DashboardNav() {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  return (
    <header className="border-b border-border-light bg-white px-8 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-dark-text">
          <BookOpen className="h-5 w-5" />
          <span className="font-playfair text-lg font-semibold">Mission Memory Vault</span>
        </Link>

        <nav className="flex items-center gap-6">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-1.5 font-inter text-sm transition-colors',
                location.pathname.startsWith(to)
                  ? 'text-dark-text'
                  : 'text-muted-text hover:text-dark-text'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}

          {profile?.is_admin && (
            <Link
              to="/admin"
              className="font-inter text-sm text-muted-text transition-colors hover:text-dark-text"
            >
              Admin
            </Link>
          )}

          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 font-inter text-sm text-muted-text transition-colors hover:text-dark-text"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </nav>
      </div>
    </header>
  );
}
