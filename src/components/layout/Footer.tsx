export function Footer() {
  return (
    <footer className="border-t border-border-light px-8 py-8 text-center">
      <p className="font-space-mono text-[10px] uppercase tracking-[0.2em] text-muted-text">
        © {new Date().getFullYear()} Mission Memory Vault · Heirloom Memory Books
      </p>
    </footer>
  );
}
