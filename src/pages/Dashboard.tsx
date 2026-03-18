import { useState, useEffect } from 'react';
import { Plus, HelpCircle, BookOpen } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { VaultCard } from '@/components/vault/VaultCard';
import { CreateVaultModal } from '@/components/vault/CreateVaultModal';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { MessageBank } from '@/components/dashboard/MessageBank';
import { useAuth } from '@/hooks/useAuth';
import { useVaults } from '@/hooks/useVaults';

const TOUR_KEY = 'mmv_tour_v1';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { vaults, loading, createVault } = useVaults(user?.id);
  const [showCreate, setShowCreate] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Show the tour for any user who hasn't seen it yet.
  // A small delay lets the page fully render before the overlay appears.
  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      const t = setTimeout(() => setShowTour(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  function completeTour() {
    localStorage.setItem(TOUR_KEY, '1');
    setShowTour(false);
  }

  function restartTour() {
    setShowTour(true);
  }

  return (
    <AppShell>
      <div className="p-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <PageTag className="block mb-3">Your Vaults</PageTag>
            <h1 className="font-playfair text-4xl font-normal text-[#222222]">
              {profile?.name ? `Welcome, ${profile.name.split(' ')[0]}` : 'Memory Vault'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Subtle tour re-launch link */}
            <button
              onClick={restartTour}
              className="flex items-center gap-1.5 font-space-mono text-xs text-[#555555] uppercase tracking-widest hover:text-[#222222] transition-colors"
              title="Replay the walkthrough tour"
            >
              <HelpCircle size={13} strokeWidth={1.5} />
              Tour
            </button>

            <HeirloomButton data-tour="new-vault-btn" onClick={() => setShowCreate(true)}>
              <Plus size={14} className="mr-2" /> New Vault
            </HeirloomButton>
          </div>
        </div>

        <Divider className="mb-10" />

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <span className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">
              Loading…
            </span>
          </div>
        ) : vaults.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen size={32} strokeWidth={1} className="text-[#e0deda] mb-6" />
            <PageTag className="block mb-4">No Vaults Yet</PageTag>
            <h2 className="font-playfair text-3xl font-normal text-[#222222] mb-3">
              Create Your First Vault
            </h2>
            <p className="text-sm text-[#555555] mb-8 max-w-sm" style={{ lineHeight: 1.8 }}>
              A vault holds all the memories gathered for your missionary. Share the link — and watch the stories arrive.
            </p>
            <HeirloomButton onClick={() => setShowCreate(true)} size="lg">
              <Plus size={14} className="mr-2" /> Create a Vault
            </HeirloomButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaults.map((vault) => (
              <VaultCard key={vault.id} vault={vault} />
            ))}
          </div>
        )}
      </div>

      {/* Message Bank */}
      {!loading && (
        <div className="px-10 pb-10 mt-4">
          <Divider className="mb-10" />
          <MessageBank vaults={vaults} profile={profile} />
        </div>
      )}

      {showCreate && (
        <CreateVaultModal
          onClose={() => setShowCreate(false)}
          onCreate={createVault}
        />
      )}

      {showTour && (
        <OnboardingTour
          onComplete={completeTour}
          onCreateVault={() => setShowCreate(true)}
        />
      )}
    </AppShell>
  );
}
