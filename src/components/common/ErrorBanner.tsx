interface ErrorBannerProps {
  message?: string;
  className?: string;
}

export function ErrorBanner({ message, className = '' }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div className={`border border-red-200 bg-red-50 px-4 py-2 ${className}`}>
      <p className="font-inter text-sm text-red-600">{message}</p>
    </div>
  );
}
