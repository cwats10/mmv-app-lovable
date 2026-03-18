import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BookOpen, Home, Gift, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const links = [
  { to: '/dashboard', label: 'Vaults',    icon: Home, tourId: 'nav-vaults'    },
  { to: '/referral',  label: 'Referrals', icon: Gift, tourId: 'nav-referrals' },
];

export function DashboardNav() {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: '240px',
        minHeight: '100vh',
        backgroundColor: '#f4f2ef',
        borderRight: '1px solid #e0deda',
        padding: '2.5rem 1.5rem',
      }}
    >
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-2 mb-10">
        <BookOpen size={18} strokeWidth={1.5} className="text-[#222222]" />
        <span className="font-playfair text-lg font-normal text-[#222222]">Memory Vault</span>
      </Link>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ to, label, icon: Icon, tourId }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              data-tour={tourId}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-sm',
                active
                  ? 'bg-[#222222] text-white'
                  : 'text-[#555555] hover:text-[#222222] hover:bg-[#e0deda]'
              )}
            >
              <Icon size={15} strokeWidth={1.5} />
              <span className="font-inter">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: profile + signout */}
      <div className="mt-auto pt-6 border-t border-[#e0deda] space-y-3">
        {profile && (
          <div className="px-3">
            <p className="text-xs font-medium text-[#222222] truncate">{profile.name || profile.email}</p>
            <p className="text-xs text-[#555555] truncate">{profile.email}</p>
          </div>
        )}
        {profile?.is_admin && (
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#555555] hover:text-[#222222] hover:bg-[#e0deda] rounded-sm"
          >
            <Settings size={15} strokeWidth={1.5} />
            Admin
          </Link>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#555555] hover:text-[#222222] hover:bg-[#e0deda] rounded-sm w-full text-left"
        >
          <LogOut size={15} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
