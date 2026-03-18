import { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
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

const TOUR_DONE_KEY = 'mmv_tour_done';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { vaults, loading, createVault } = useVaults(user?.id);
  const [showCreate, setShowCreate] = useState(false);
  const [tourDone, setTourDone] = useState(() => localStorage.getItem(TOUR_DONE_KEY) === '1');

  function completeTour() {
    localStorage.setItem(TOUR_DONE_KEY, '1');
    setTourDone(true);
  }

  return (
    <AppShell>
      {/* Onboarding Tour */}
      {!loading && !tourDone && (
        <OnboardingTour
          onComplete={completeTour}
          onCreateVault={() => setShowCreate(true)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <PageTag>Your Vaults</PageTag>
          <h1 className="mt-2 font-playfair text-3xl font-semibold text-dark-text">
            {profile?.name ? `Welcome, ${profile.name.split(' ')[0]}` : 'Mission Memory Vault'}
          </h1>
        </div>
        <HeirloomButton data-tour="new-vault-btn" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Vault
        </HeirloomButton>
      </div>

      <Divider className="my-8" />

      {loading ? (
        <div className="py-20 text-center">
          <p className="font-inter text-sm text-muted-text">Loading…</p>
        </div>
      ) : vaults.length === 0 ? (
        <div className="mx-auto max-w-md py-20 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-border-light" />
          <PageTag className="mt-4 block">No Vaults Yet</PageTag>
          <h2 className="mt-2 font-playfair text-2xl font-semibold text-dark-text">
            Create Your First Vault
          </h2>
          <p className="mt-2 font-inter text-sm text-muted-text">
            A vault holds all the memories gathered for your missionary. Share the link and watch the stories arrive.
          </p>
          <HeirloomButton onClick={() => setShowCreate(true)} size="lg" className="mt-6">
            Create a Vault
          </HeirloomButton>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vaults.map((vault) => (
              <VaultCard key={vault.id} vault={vault} />
            ))}
          </div>

          {/* Message Bank */}
          <Divider className="my-10" />
          <MessageBank vaults={vaults} profile={profile} />
        </>
      )}

      {showCreate && (
        <CreateVaultModal
          onClose={() => setShowCreate(false)}
          onCreate={createVault}
        />
      )}
    </AppShell>
  );
}
