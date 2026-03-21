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
    <div className="min-w-0 border border-accent/30 bg-accent/15 p-4 sm:p-6">
      <div className="mb-4 flex items-start gap-3 min-w-0">
        <Users size={14} strokeWidth={1.5} className="mt-0.5 flex-shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <PageTag className="mb-1 block">Manager Link</PageTag>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Share this link with trusted helpers — family members, a co-organiser, or a
            mission companion — who can review and approve submissions on your behalf.
            Managers <strong className="font-medium text-foreground">cannot</strong> purchase
            or finalize the book. Only you can do that.
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
        <div className="min-w-0 flex-1 overflow-hidden border border-border-light bg-white px-4 py-3 text-sm font-space-mono text-muted-foreground">
          <p className="truncate">{url}</p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex w-full shrink-0 items-center justify-center gap-2 border border-foreground px-4 py-3 text-sm font-inter text-foreground transition-colors hover:bg-foreground hover:text-background sm:w-auto"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
