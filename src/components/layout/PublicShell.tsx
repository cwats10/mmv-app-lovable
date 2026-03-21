import { Link } from 'react-router-dom';
import { Footer } from './Footer';

interface PublicShellProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function PublicShell({ children, showNav = true }: PublicShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-stone-bg">
      {showNav && (
        <header className="flex items-center justify-between px-8 py-6">
          <Link to="/" className="text-dark-text">
            <span className="font-playfair text-lg font-semibold">Mission Memory Vault</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              to="/auth"
              className="font-inter text-sm text-muted-text transition-colors hover:text-dark-text"
            >
              Sign In
            </Link>
            <Link
              to="/auth?tab=signup"
              className="bg-dark-text px-5 py-2 font-inter text-sm text-white transition-colors hover:bg-[#3a3a3a]"
            >
              Get Started
            </Link>
          </nav>
        </header>
      )}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
