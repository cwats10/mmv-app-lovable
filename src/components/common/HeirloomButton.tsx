import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface HeirloomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const HeirloomButton = forwardRef<HTMLButtonElement, HeirloomButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-inter font-medium tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
sync/from-main
      primary: 'bg-[#222222] text-white hover:bg-[#3a3a3a] active:bg-[#111]',
      secondary: 'bg-transparent text-[#222222] border border-[#222222] hover:bg-[#222222] hover:text-white',
      ghost: 'bg-transparent text-[#555555] hover:text-[#222222] hover:bg-[#e0deda]',

      primary: 'bg-[#1B4332] text-white hover:bg-[#143528] active:bg-[#0D261D]',
      secondary: 'bg-transparent text-dark-text border border-dark-text hover:bg-dark-text hover:text-white',
      ghost: 'bg-transparent text-muted-text hover:text-dark-text hover:bg-border-light',
main
      danger: 'bg-transparent text-red-600 border border-red-300 hover:bg-red-50',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5',
      md: 'text-sm px-5 py-2.5',
      lg: 'text-base px-8 py-3.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
            {children}
          </span>
        ) : children}
      </button>
    );
  }
);

HeirloomButton.displayName = 'HeirloomButton';
