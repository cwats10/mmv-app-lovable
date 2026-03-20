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

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 -mt-[5%]',
        bleedSafe && 'p-[8%]',
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
        className="font-playfair text-base font-medium tracking-wide"
        style={{ color: isLight ? '#2b2b2a' : '#f4f1ec' }}
      >
        {missionaryName}
      </p>
    </div>
  );
}
