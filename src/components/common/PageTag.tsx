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
      style={style}
      className={cn(
        'font-space-mono text-xs uppercase tracking-widest text-[#555555]',
        className
      )}
    >
      {children}
    </span>
  );
}
