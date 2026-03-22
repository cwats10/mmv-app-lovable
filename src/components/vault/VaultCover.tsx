import { cn } from '@/lib/utils';

interface VaultCoverProps {
  missionaryName: string;
  theme: 'light' | 'dark';
  className?: string;
  bleedSafe?: boolean;
}

export function VaultCover({ missionaryName, theme, className }: VaultCoverProps) {
  const isLight = theme === 'light';
  const bg = isLight ? '#f4f1ec' : '#2b2b2a';
  const textColor = isLight ? '#2b2b2a' : '#f4f1ec';

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-4',
        className
      )}
      style={{ backgroundColor: bg }}
    >
      <h1
        className="text-4xl font-bold tracking-wide"
        style={{ color: textColor, fontFamily: "'DM Serif Display', serif" }}
      >
        Mission Memory Vault
      </h1>
      <p
        className="text-base font-normal tracking-wide"
        style={{ color: textColor, fontFamily: "'DM Serif Display', serif" }}
      >
        {missionaryName}
      </p>
    </div>
  );
}
