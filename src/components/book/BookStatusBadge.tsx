import type { BookStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<BookStatus, string> = {
  collecting: 'Collecting',
  review: 'In Review',
  purchased: 'Purchased',
  printing: 'Printing',
  delivered: 'Delivered',
};

const STATUS_STYLES: Record<BookStatus, string> = {
  collecting: 'bg-blue-50 text-blue-700 border-blue-200',
  review: 'bg-amber-50 text-amber-700 border-amber-200',
  purchased: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  printing: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-stone-bg text-dark-text border-border-light',
};

interface BookStatusBadgeProps {
  status: BookStatus;
  className?: string;
}

export function BookStatusBadge({ status, className }: BookStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full border px-3 py-0.5 font-space-mono text-[10px] uppercase tracking-wider',
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
