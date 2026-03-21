import { useState } from 'react';
import { Copy, Check, Users } from 'lucide-react';
import { generateManagerUrl } from '@/lib/utils';
import { PageTag } from '@/components/common/PageTag';

interface ManagerShareWidgetProps {
  managerToken: string;
}

export function ManagerShareWidget({ managerToken }: ManagerShareWidgetProps) {
  const [copied, setCopied] = useState(false);
  const url = generateManagerUrl(managerToken);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div
      className="p-6 bg-accent/15 border border-accent/30"
    >
      <div className="flex items-start gap-3 mb-4">
        <Users size={14} strokeWidth={1.5} className="text-[#555555] mt-0.5 flex-shrink-0" />
        <div>
          <PageTag className="block mb-1">Manager Link</PageTag>
          <p className="text-sm text-[#555555]" style={{ lineHeight: 1.7 }}>
            Share this link with trusted helpers — family members, a co-organiser, or a
            mission companion — who can review and approve submissions on your behalf.
            Managers <strong className="text-[#222222] font-medium">cannot</strong> purchase
            or finalize the book. Only you can do that.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div
          className="min-w-0 flex-1 px-4 py-3 text-sm font-space-mono text-[#555555] truncate"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e0deda',
          }}
        >
          {url}
        </div>
        <button
          onClick={copy}
          className="flex shrink-0 items-center justify-center gap-2 px-4 py-3 text-sm font-inter transition-colors"
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
