import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border-light px-8 py-8 text-center">
      <p className="font-space-mono text-[10px] uppercase tracking-[0.2em] text-muted-text">
        © {new Date().getFullYear()} Mission Memory Vault · Heirloom Memory Books
      </p>
      <div className="mt-2 flex items-center justify-center gap-3">
        <Link
          to="/terms"
          className="font-inter text-xs text-muted-text underline transition-colors hover:text-dark-text"
        >
          Terms of Service
        </Link>
        <span className="text-xs text-muted-text">·</span>
        <Link
          to="/privacy"
          className="font-inter text-xs text-muted-text underline transition-colors hover:text-dark-text"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
