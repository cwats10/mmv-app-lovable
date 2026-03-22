import { cn } from '@/lib/utils';

interface DividerProps {
  className?: string;
  variant?: 'default' | 'brand';
}

export function Divider({ className, variant = 'default' }: DividerProps) {
  return (
    <hr
      className={cn(
        'border-t',
        variant === 'brand' ? 'border-primary' : 'border-border-light',
        className,
      )}
    />
  );
}
