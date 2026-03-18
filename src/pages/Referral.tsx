import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { useAuth } from '@/hooks/useAuth';
import { useReferral } from '@/hooks/useReferral';
import { Copy, Check, Gift } from 'lucide-react';

export default function Referral() {
  const { user, profile } = useAuth();
  const { referrals, loading, totalConverted, totalRewards } = useReferral(user?.id);
  const [copied, setCopied] = useState(false);

  const referralUrl = profile?.referral_code
    ? `${window.location.origin}/auth?tab=signup&ref=${profile.referral_code}`
    : '';

  async function copy() {
    if (!referralUrl) return;
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <AppShell>
      <PageTag>Referrals</PageTag>
      <h1 className="mt-2 font-playfair text-3xl font-semibold text-dark-text">Share Mission Memory Vault</h1>

      <Divider className="my-8" />

      {/* Referral link */}
      <div className="border border-border-light bg-white p-6">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-accent-gold" />
          <h3 className="font-playfair text-lg font-semibold text-dark-text">Your Referral Link</h3>
        </div>
        <p className="mt-2 font-inter text-sm text-muted-text">
          Share this link with other mothers who might want to create a Memory Book for their missionary. When they sign up, you'll both receive a reward.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <input
            readOnly
            value={referralUrl}
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

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Referred', value: referrals.length },
          { label: 'Converted', value: totalConverted },
          { label: 'Rewards Earned', value: `$${totalRewards.toFixed(0)}` },
        ].map(({ label, value }) => (
          <div key={label} className="border border-border-light bg-white p-4 text-center">
            <p className="font-playfair text-2xl font-semibold text-dark-text">{value}</p>
            <p className="font-space-mono text-[10px] uppercase tracking-wider text-muted-text">{label}</p>
          </div>
        ))}
      </div>

      {/* Referral list */}
      <div className="mt-8">
        <h3 className="font-playfair text-lg font-semibold text-dark-text">Referral History</h3>
        <Divider className="my-4" />
        {loading ? (
          <p className="py-8 text-center font-inter text-sm text-muted-text">Loading…</p>
        ) : referrals.length === 0 ? (
          <div className="border border-border-light bg-white p-8 text-center">
            <p className="font-inter text-sm text-muted-text">No referrals yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between border border-border-light bg-white px-5 py-3">
                <div>
                  <p className="font-inter text-sm text-dark-text">{r.referred_email}</p>
                  <p className="font-space-mono text-[10px] text-muted-text">
                    {new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span className="font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
