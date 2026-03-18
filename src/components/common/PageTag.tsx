import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface PageTagProps {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function PageTag({ children, className, style }: PageTagProps) {
  return (
    <span
      className={cn(
        'inline-block font-space-mono text-[10px] uppercase tracking-[0.2em] text-muted-text',
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}
