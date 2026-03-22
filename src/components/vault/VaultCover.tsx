import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';
import { cn } from '@/lib/utils';

interface VaultCoverProps {
  missionaryName: string;
  theme: 'light' | 'dark';
  className?: string;
  /** When true, adds inner padding to keep content inside the print safe zone */
  bleedSafe?: boolean;
}

export function VaultCover({ missionaryName, theme, className, bleedSafe }: VaultCoverProps) {
  const isLight = theme === 'light';
  const bg = isLight ? '#f4f1ec' : '#2b2b2a';

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-2',
        className
      )}
      style={{ backgroundColor: bg }}
    >
      <img
        src={isLight ? logoDark : logoLight}
        alt="Mission Memory Vault"
        className="w-4/5 max-w-[280px] object-contain"
      />
      <p
        className="text-base font-normal tracking-wide"
        style={{ color: isLight ? '#2b2b2a' : '#f4f1ec', fontFamily: "'DM Serif Display', serif" }}
      >
        {missionaryName}
      </p>
    </div>
  );
}
