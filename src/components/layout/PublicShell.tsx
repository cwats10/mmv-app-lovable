import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Footer } from './Footer';

interface PublicShellProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function PublicShell({ children, showNav = true }: PublicShellProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f4f2ef' }}>
      {showNav && (
        <header
          className="flex items-center justify-between px-8 py-5"
          style={{ borderBottom: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
        >
          <Link to="/" className="flex items-center gap-2">
            <BookOpen size={18} strokeWidth={1.5} className="text-[#222222]" />
            <span className="font-playfair text-lg font-normal text-[#222222]">Memory Vault</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/auth"
              className="font-inter text-sm text-[#555555] hover:text-[#222222] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/auth?tab=signup"
              className="font-inter text-sm bg-[#222222] text-white px-4 py-2 hover:bg-[#3a3a3a] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </header>
      )}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
