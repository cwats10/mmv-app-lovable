import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function formatServiceDates(start: string | null, end: string | null): string {
  if (!start && !end) return '';
  const s = start ? formatDate(start) : '';
  const e = end ? formatDate(end) : 'Present';
  return `${s} — ${e}`;
}

export function generateShareUrl(token: string): string {
  const base = window.location.origin;
  return `${base}/contribute/${token}`;
}

export function generateManagerUrl(token: string): string {
  const base = window.location.origin;
  return `${base}/manage/${token}`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}
