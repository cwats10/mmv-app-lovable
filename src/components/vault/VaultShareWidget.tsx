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
    <div className="border border-border-light bg-white p-6">
      <PageTag>Share This Vault</PageTag>
      <p className="mt-2 font-inter text-sm text-muted-text">
        Send this link to family, friends, and mission companions. Anyone with the link can submit a memory.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <input
          readOnly
          value={url}
          className="flex-1 border border-border-light bg-stone-bg px-4 py-2.5 font-mono text-xs text-dark-text"
        />
        <button
          onClick={copy}
          className="flex items-center gap-1.5 border border-border-light px-4 py-2.5 font-inter text-sm text-muted-text transition-colors hover:text-dark-text"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
