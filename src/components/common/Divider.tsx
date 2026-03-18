import { cn } from '@/lib/utils';

export function Divider({ className }: { className?: string }) {
  return (
    <div
      className={cn('w-8 h-px bg-[#222222]', className)}
    />
  );
}
