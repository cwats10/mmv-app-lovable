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
      <div className="p-10 max-w-3xl">
        <div className="mb-10">
          <PageTag className="block mb-3">Referrals</PageTag>
          <h1 className="font-playfair text-4xl font-normal text-[#222222]">
            Share Memory Vault
          </h1>
        </div>

        <Divider className="mb-10" />

        {/* Referral link */}
        <div className="mb-10">
          <PageTag className="block mb-3">Your Referral Link</PageTag>
          <p className="text-sm text-[#555555] mb-4" style={{ lineHeight: 1.7 }}>
            Share this link with other families preparing a missionary. When they sign up and purchase their first book, you both receive <strong>$20 in credit</strong> — automatically applied at your next checkout.
          </p>
          <div className="flex gap-2">
            <div
              className="flex-1 px-4 py-3 text-sm font-space-mono text-[#555555] overflow-hidden"
              style={{
                border: '1px solid #e0deda',
                backgroundColor: '#f4f2ef',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {referralUrl}
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

        {/* Available credit banner */}
        {profile && profile.reward_balance > 0 && (
          <div
            className="flex items-center justify-between px-5 py-4 mb-8"
            style={{ border: '1px solid #222222', backgroundColor: '#f4f2ef' }}
          >
            <div>
              <p className="font-space-mono text-xs text-[#555555] uppercase tracking-widest mb-1">
                Available Credit
              </p>
              <p className="font-playfair text-2xl text-[#222222]">
                ${profile.reward_balance.toFixed(2)}
              </p>
            </div>
            <p className="text-xs text-[#555555] font-inter max-w-xs text-right" style={{ lineHeight: 1.7 }}>
              Applied automatically at checkout toward your next book.
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Referred', value: referrals.length },
            { label: 'Converted', value: totalConverted },
            { label: 'Rewards Earned', value: `$${totalRewards.toFixed(0)}` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="p-5 text-center"
              style={{ border: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
            >
              <div className="font-playfair text-3xl text-[#222222] mb-1">{value}</div>
              <PageTag>{label}</PageTag>
            </div>
          ))}
        </div>

        {/* Referral list */}
        <div>
          <PageTag className="block mb-4">Referral History</PageTag>
          {loading ? (
            <p className="text-sm text-[#555555]">Loading…</p>
          ) : referrals.length === 0 ? (
            <div className="py-12 text-center" style={{ border: '1px solid #e0deda' }}>
              <Gift size={28} strokeWidth={1} className="text-[#e0deda] mx-auto mb-4" />
              <p className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">
                No referrals yet
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ border: '1px solid #e0deda' }}>
              {referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-inter text-[#222222]">{r.referred_email}</p>
                    <p className="font-space-mono text-xs text-[#555555] mt-0.5">
                      {new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span
                    className="font-space-mono text-xs uppercase tracking-wider px-2.5 py-1"
                    style={{
                      backgroundColor: r.status === 'converted' || r.status === 'rewarded' ? '#f4f2ef' : 'transparent',
                      border: '1px solid #e0deda',
                      color: r.status === 'pending' ? '#555555' : '#222222',
                    }}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
