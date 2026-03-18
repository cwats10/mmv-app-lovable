import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { supabase } from '@/lib/supabase';

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
    >
      <div
        className="w-full max-w-lg relative"
        style={{ backgroundColor: '#ffffff', border: '1px solid #e0deda' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-8 pb-0">
          <div>
            <PageTag className="block mb-3">New Vault</PageTag>
            <h2 className="font-playfair text-3xl font-normal text-[#222222]">
              Create a Memory Vault
            </h2>
          </div>
          <button onClick={onClose} className="text-[#555555] hover:text-[#222222] mt-1">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <Divider className="mx-8 mt-6 mb-6" />

        <form onSubmit={submit} className="px-8 pb-8 space-y-5">
          {/* Vault type toggle */}
          <div>
            <label className="font-space-mono text-xs text-[#555555] uppercase tracking-widest block mb-2">
              Vault Type
            </label>
            <div className="flex gap-0">
              {(['post', 'pre'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set('vault_type', type)}
                  className="flex-1 py-2.5 text-sm font-inter transition-colors"
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

          {/* Missionary name */}
          <div>
            <label className="font-space-mono text-xs text-[#555555] uppercase tracking-widest block mb-2">
              Missionary Name *
            </label>
            <input
              required
              type="text"
              placeholder="Elder John Doe"
              value={form.missionary_name}
              onChange={(e) => set('missionary_name', e.target.value)}
              className="w-full px-4 py-3 text-sm font-inter text-[#222222] outline-none"
              style={{ border: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
            />
          </div>

          {/* Mission name */}
          <div>
            <label className="font-space-mono text-xs text-[#555555] uppercase tracking-widest block mb-2">
              Mission Name
            </label>
            <input
              type="text"
              placeholder="Japan Tokyo South Mission"
              value={form.mission_name}
              onChange={(e) => set('mission_name', e.target.value)}
              className="w-full px-4 py-3 text-sm font-inter text-[#222222] outline-none"
              style={{ border: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
            />
          </div>

          {/* Dates */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-space-mono text-xs text-[#555555] uppercase tracking-widest block mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={form.mission_start}
                onChange={(e) => set('mission_start', e.target.value)}
                className="w-full px-4 py-3 text-sm font-inter text-[#222222] outline-none"
                style={{ border: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
              />
            </div>
            <div className="flex-1">
              <label className="font-space-mono text-xs text-[#555555] uppercase tracking-widest block mb-2">
                End Date
              </label>
              <input
                type="date"
                value={form.mission_end}
                onChange={(e) => set('mission_end', e.target.value)}
                className="w-full px-4 py-3 text-sm font-inter text-[#222222] outline-none"
                style={{ border: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
              />
            </div>
          </div>

          {/* Cover photo */}
          <div>
            <label className="font-space-mono text-xs text-[#555555] uppercase tracking-widest block mb-2">
              Cover Photo
            </label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full py-3 text-sm font-inter text-[#555555] transition-colors hover:text-[#222222]"
              style={{ border: '1px dashed #e0deda', backgroundColor: '#f4f2ef' }}
            >
              {uploading ? 'Uploading…' : coverUrl ? '✓ Cover uploaded' : 'Upload cover photo'}
            </button>
          </div>

          <HeirloomButton type="submit" loading={loading} size="lg" className="w-full mt-2">
            Create Vault
          </HeirloomButton>
        </form>
      </div>
    </div>
  );
}
