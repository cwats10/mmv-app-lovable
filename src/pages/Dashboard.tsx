import { useState, useCallback } from 'react';
import { Plus, BookOpen, Archive } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AppShell } from '@/components/layout/AppShell';
import { VaultCard } from '@/components/vault/VaultCard';
import { CreateVaultModal } from '@/components/vault/CreateVaultModal';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { useAuth } from '@/hooks/useAuth';
import { useVaults } from '@/hooks/useVaults';

const TOUR_DISMISSED_KEY = 'mmv_tour_dismissed';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { vaults, loading, createVault } = useVaults(user?.id);
  const [showCreate, setShowCreate] = useState(false);
  const [tourDismissed, setTourDismissed] = useState(() => !!localStorage.getItem(TOUR_DISMISSED_KEY));

  const showTour = !loading && vaults.length === 0 && !tourDismissed;

  const dismissTour = useCallback(() => {
    localStorage.setItem(TOUR_DISMISSED_KEY, '1');
    setTourDismissed(true);
  }, []);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <PageTag>Your Vaults</PageTag>
          <h1 className="mt-2 font-playfair text-3xl font-semibold text-dark-text">
            {profile?.name ? `Welcome, ${profile.name.split(' ')[0]}` : 'Mission Memory Vault'}
          </h1>
        </div>
        <HeirloomButton onClick={() => setShowCreate(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Vault
        </HeirloomButton>
      </div>

      <Divider className="my-8" />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border-light bg-white p-6 space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : vaults.length === 0 ? (
        <div className="mx-auto max-w-md py-20 text-center border border-border-light bg-white p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-bg">
            <Archive className="h-8 w-8 text-muted-text" />
          </div>
          <h2 className="mt-6 font-playfair text-2xl font-semibold text-dark-text">
            Start Your First Memory Vault
          </h2>
          <p className="mt-3 font-inter text-sm leading-relaxed text-muted-text">
            Create a vault to start collecting memories, stories, and photos from family and friends.
          </p>
          <HeirloomButton onClick={() => setShowCreate(true)} size="lg" className="mt-8">
            <Plus className="mr-1.5 h-4 w-4" /> Create Vault
          </HeirloomButton>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vaults.map((vault) => (
            <VaultCard key={vault.id} vault={vault} />
          ))}
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
          onComplete={dismissTour}
          onCreateVault={() => setShowCreate(true)}
        />
      )}
    </AppShell>
  );
}
