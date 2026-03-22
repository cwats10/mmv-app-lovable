import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border-light px-8 py-8 text-center">
      <p className="font-space-mono text-[10px] uppercase tracking-[0.2em] text-muted-text">
        © {new Date().getFullYear()} Mission Memory Vault · Heirloom Memory Books
      </p>
      <Link
        to="/terms"
        className="mt-2 inline-block font-inter text-xs text-muted-text underline transition-colors hover:text-dark-text"
      >
        Terms of Service
      </Link>
    </footer>
  );
}
