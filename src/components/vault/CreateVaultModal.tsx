import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { supabase } from '@/integrations/supabase/client';

interface CreateVaultModalProps {
  onClose: () => void;
  onCreate: (params: {
    missionary_name: string;
    mission_name: string;
    mission_start: string | null;
    mission_end: string | null;
    vault_type: 'pre' | 'post';
    cover_image_url: string | null;
  }) => Promise<unknown>;
}

export function CreateVaultModal({ onClose, onCreate }: CreateVaultModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    missionary_name: '',
    mission_name: '',
    mission_start: '',
    mission_end: '',
    vault_type: 'post' as 'pre' | 'post',
  });

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('vault-covers').upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from('vault-covers').getPublicUrl(path);
      setCoverUrl(data.publicUrl);
    }
    setUploading(false);
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
        cover_image_url: coverUrl,
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
                  backgroundColor: form.vault_type === type ? '#222222' : 'transparent',
                  color: form.vault_type === type ? '#ffffff' : '#555555',
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

        {/* Cover photo */}
        <div className="mb-6">
          <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
            Cover Photo
          </label>
          <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full border border-dashed border-border-light bg-stone-bg py-3 font-inter text-sm text-muted-text transition-colors hover:text-dark-text"
          >
            {uploading ? 'Uploading…' : coverUrl ? '✓ Cover uploaded' : 'Upload cover photo'}
          </button>
        </div>

        <HeirloomButton type="submit" loading={loading} className="w-full">
          Create Vault
        </HeirloomButton>
      </form>
    </div>
  );
}
