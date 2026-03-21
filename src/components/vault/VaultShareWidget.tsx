import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { generateShareUrl } from '@/lib/utils';
import { PageTag } from '@/components/common/PageTag';

interface VaultShareWidgetProps {
  submissionToken: string;
}

export function VaultShareWidget({ submissionToken }: VaultShareWidgetProps) {
  const [copied, setCopied] = useState(false);
  const url = generateShareUrl(submissionToken);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="min-w-0 border border-forest/20 bg-forest p-4 sm:p-6">
      <PageTag className="text-forest-foreground/70">Share This Vault</PageTag>
      <p className="mt-2 font-inter text-sm leading-relaxed text-forest-foreground/80">
        Send this link to family, friends, and mission companions. Anyone with the link can submit a memory.
      </p>
      <div className="mt-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 overflow-hidden border border-forest-foreground/20 bg-forest-foreground/10 px-4 py-2.5 font-mono text-xs text-forest-foreground">
          <p className="truncate">{url}</p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex w-full shrink-0 items-center justify-center gap-1.5 border border-forest-foreground/30 px-4 py-2.5 font-inter text-sm text-forest-foreground transition-colors hover:bg-forest-foreground/10 sm:w-auto"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
