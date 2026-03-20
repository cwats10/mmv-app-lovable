import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';
import { cn } from '@/lib/utils';

interface VaultCoverProps {
  missionaryName: string;
  theme: 'light' | 'dark';
  className?: string;
}

export function VaultCover({ missionaryName, theme, className }: VaultCoverProps) {
  const isLight = theme === 'light';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        className
      )}
      style={{ backgroundColor: isLight ? '#f4f1ec' : '#2b2b2a' }}
    >
      <img
        src={isLight ? logoDark : logoLight}
        alt="Mission Memory Vault"
        className="w-4/5 max-w-[280px] object-contain"
      />
      <p
        className="font-playfair text-xs font-medium tracking-wide"
        style={{ color: isLight ? '#2b2b2a' : '#f4f1ec' }}
      >
        {missionaryName}
      </p>
    </div>
  );
}
