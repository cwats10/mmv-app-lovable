import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { supabase } from '@/lib/supabase';

const RELATIONS = [
  'Mother', 'Father', 'Sister', 'Brother', 'Grandparent',
  'Aunt / Uncle', 'Friend', 'Mission Companion', 'Ward Member',
  'Mission President', 'Other',
];

interface SubmissionFormProps {
  vaultId: string;
  missionaryName: string;
  onSubmit: (data: {
    vault_id: string;
    contributor_name: string;
    relation: string;
    message: string;
    media_urls: string[];
  }) => Promise<void>;
}

export function SubmissionForm({ vaultId, missionaryName, onSubmit }: SubmissionFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<{ url: string; name: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    contributor_name: '',
    relation: '',
    message: '',
  });

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);

    const uploaded: { url: string; name: string }[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `${vaultId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('submission-media').upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from('submission-media').getPublicUrl(path);
        uploaded.push({ url: data.publicUrl, name: file.name });
      }
    }
    setPhotos((p) => [...p, ...uploaded].slice(0, 6));
    setUploading(false);
  }

  function removePhoto(url: string) {
    setPhotos((p) => p.filter((ph) => ph.url !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.contributor_name || !form.relation || !form.message) return;
    setLoading(true);
    try {
      await onSubmit({
        vault_id: vaultId,
        contributor_name: form.contributor_name.trim(),
        relation: form.relation,
        message: form.message.trim(),
        media_urls: photos.map((p) => p.url),
      });
    } finally {
      setLoading(false);
    }
  }

  const charCount = form.message.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
          Your Name *
        </label>
        <input
          value={form.contributor_name}
          onChange={(e) => set('contributor_name', e.target.value)}
          className="w-full border border-border-light bg-white px-4 py-3 font-inter text-sm text-dark-text outline-none"
        />
      </div>

      {/* Relation */}
      <div>
        <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
          Your Relationship to {missionaryName} *
        </label>
        <select
          value={form.relation}
          onChange={(e) => set('relation', e.target.value)}
          className="w-full appearance-none border border-border-light bg-white px-4 py-3 font-inter text-sm text-dark-text outline-none"
        >
          <option value="">Select your relationship…</option>
          {RELATIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
          Your Memory *
        </label>
        <textarea
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          rows={6}
          maxLength={2000}
          className="w-full resize-none border border-border-light bg-white px-4 py-3 font-inter text-sm text-dark-text outline-none"
          placeholder={`Share a memory, story, or message for ${missionaryName}…`}
        />
        <p className="mt-1 text-right font-space-mono text-[10px] text-muted-text">
          {charCount} / 2000
        </p>
      </div>

      {/* Photos */}
      <div>
        <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
          Photos (optional, up to 6)
        </label>
        <input type="file" ref={fileRef} className="hidden" accept="image/*" multiple onChange={handlePhotoUpload} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || photos.length >= 6}
          className="flex w-full items-center justify-center gap-2 border border-dashed border-border-light bg-stone-bg py-3 font-inter text-sm text-muted-text transition-colors hover:text-dark-text"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading…' : 'Add Photos'}
        </button>

        {photos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {photos.map((p) => (
              <div key={p.url} className="group relative h-16 w-16 overflow-hidden">
                <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(p.url)}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <HeirloomButton type="submit" loading={loading} className="w-full" size="lg">
        Submit Memory
      </HeirloomButton>
    </form>
  );
}
