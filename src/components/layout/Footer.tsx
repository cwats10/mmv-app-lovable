export function Footer() {
  return (
    <footer
      className="border-t border-[#e0deda] py-8 px-8"
      style={{ backgroundColor: '#f4f2ef' }}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <span className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">
          Memory Vault — Heirloom Books
        </span>
        <span className="font-space-mono text-xs text-[#555555]">
          © {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
