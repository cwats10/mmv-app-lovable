import { useState } from 'react';
import { X } from 'lucide-react';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { VaultCover } from '@/components/vault/VaultCover';

interface CreateVaultModalProps {
  onClose: () => void;
  onCreate: (params: {
    missionary_name: string;
    mission_name: string;
    mission_start: string | null;
    mission_end: string | null;
    vault_type: 'pre' | 'post';
    cover_theme: 'light' | 'dark';
  }) => Promise<unknown>;
}

export function CreateVaultModal({ onClose, onCreate }: CreateVaultModalProps) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    missionary_name: '',
    mission_name: '',
    mission_start: '',
    mission_end: '',
    vault_type: 'post' as 'pre' | 'post',
    cover_theme: 'dark' as 'light' | 'dark',
  });

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.missionary_name.trim()) return;
    setLoading(true);
    try {
      await onCreate({
        missionary_name: form.missionary_name.trim(),
        mission_name: form.mission_name.trim(),
        mission_start: form.mission_start || null,
        mission_end: form.mission_end || null,
        vault_type: form.vault_type,
        cover_theme: form.cover_theme,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={submit}
        className="relative w-full max-w-lg border border-border-light bg-white p-8"
      >
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-muted-text hover:text-dark-text">
          <X className="h-5 w-5" />
        </button>

        <PageTag>New Vault</PageTag>
        <h2 className="mt-2 font-playfair text-2xl font-semibold text-dark-text">
          Create a Mission Memory Vault
        </h2>

        <Divider className="my-5" />

        {/* Vault type toggle */}
        <div className="mb-5">
          <label className="mb-2 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
            Vault Type
          </label>
          <div className="flex">
            {(['post', 'pre'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => set('vault_type', type)}
                className="flex-1 py-2.5 font-inter text-sm transition-colors"
                style={{
                  backgroundColor: form.vault_type === type ? '#2b2b2a' : 'transparent',
                  color: form.vault_type === type ? '#fefefe' : '#555555',
                  border: '1px solid #e0deda',
                  borderRight: type === 'post' ? 'none' : '1px solid #e0deda',
                }}
              >
                {type === 'post' ? 'Post-Mission' : 'Pre-Mission'}
              </button>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="mb-4">
          <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
            Missionary Name *
          </label>
          <input
            value={form.missionary_name}
            onChange={(e) => set('missionary_name', e.target.value)}
            className="w-full border border-border-light bg-stone-bg px-4 py-3 font-inter text-sm text-dark-text outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
            Mission Name
          </label>
          <input
            value={form.mission_name}
            onChange={(e) => set('mission_name', e.target.value)}
            className="w-full border border-border-light bg-stone-bg px-4 py-3 font-inter text-sm text-dark-text outline-none"
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
              Start Date
            </label>
            <input
              type="date"
              value={form.mission_start}
              onChange={(e) => set('mission_start', e.target.value)}
              className="w-full border border-border-light bg-stone-bg px-4 py-3 font-inter text-sm text-dark-text outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
              End Date
            </label>
            <input
              type="date"
              value={form.mission_end}
              onChange={(e) => set('mission_end', e.target.value)}
              className="w-full border border-border-light bg-stone-bg px-4 py-3 font-inter text-sm text-dark-text outline-none"
            />
          </div>
        </div>

        {/* Cover theme picker */}
        <div className="mb-6">
          <label className="mb-2 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
            Cover Style
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['light', 'dark'] as const).map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => set('cover_theme', theme)}
                className="overflow-hidden border-2 transition-colors"
                style={{
                  borderColor: form.cover_theme === theme ? '#2b2b2a' : '#e0deda',
                }}
              >
                <VaultCover
                  missionaryName={form.missionary_name || 'Missionary Name'}
                  theme={theme}
                  className="aspect-[16/9]"
                />
                <p className="py-1.5 text-center font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
                  {theme}
                </p>
              </button>
            ))}
          </div>
        </div>

        <HeirloomButton type="submit" loading={loading} className="w-full">
          Create Vault
        </HeirloomButton>
      </form>
    </div>
  );
}
