import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Gift, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const links = [
  { to: '/dashboard', label: 'Vaults', icon: Home },
  { to: '/referral', label: 'Referrals', icon: Gift },
];

export function DashboardNav() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-border-light bg-white px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link to="/dashboard" className="text-dark-text">
          <span className="font-playfair text-lg font-semibold">Mission Memory Vault</span>
        </Link>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="sm:hidden text-muted-text"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
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

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <nav className="mt-4 flex flex-col gap-3 sm:hidden border-t border-border-light pt-4">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'flex items-center gap-2 font-inter text-sm transition-colors py-1',
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
              onClick={() => setMenuOpen(false)}
              className="font-inter text-sm text-muted-text transition-colors hover:text-dark-text py-1"
            >
              Admin
            </Link>
          )}

          <button
            onClick={() => { signOut(); setMenuOpen(false); }}
            className="flex items-center gap-2 font-inter text-sm text-muted-text transition-colors hover:text-dark-text py-1"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </nav>
      )}
    </header>
  );
}
