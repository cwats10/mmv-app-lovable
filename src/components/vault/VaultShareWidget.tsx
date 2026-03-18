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
    <div
      className="p-6"
      style={{ border: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
    >
      <PageTag className="block mb-4">Share This Vault</PageTag>

      <p className="text-sm text-[#555555] mb-4" style={{ lineHeight: 1.7 }}>
        Send this link to family, friends, and mission companions. Anyone with the link can submit a memory.
      </p>

      <div className="flex gap-2">
        <div
          className="flex-1 px-4 py-3 text-sm font-space-mono text-[#555555] overflow-hidden"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e0deda',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {url}
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-2 px-4 py-3 text-sm font-inter transition-colors"
          style={{
            backgroundColor: copied ? '#222222' : 'transparent',
            color: copied ? '#ffffff' : '#222222',
            border: '1px solid #222222',
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
