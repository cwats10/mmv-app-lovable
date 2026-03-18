import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { ImageLayoutPicker } from '@/components/submission/ImageLayoutPicker';
import { supabase } from '@/lib/supabase';
import type { ImagePosition } from '@/types';

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
    image_layout: { position: ImagePosition };
  }) => Promise<void>;
}

export function SubmissionForm({ vaultId, missionaryName, onSubmit }: SubmissionFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<{ url: string; name: string }[]>([]);
  const [imagePosition, setImagePosition] = useState<ImagePosition>('float-right');
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
        image_layout: { position: imagePosition },
      });
    } finally {
      setLoading(false);
    }
  }

  const charCount = form.message.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="font-space-mono text-xs text-[#555555] uppercase tracking-widest block mb-2">
          Your Name *
        </label>
        <input
          required
          type="text"
          placeholder={`Your name`}
          value={form.contributor_name}
          onChange={(e) => set('contributor_name', e.target.value)}
          className="w-full px-4 py-3 text-sm font-inter text-[#222222] outline-none"
          style={{ border: '1px solid #e0deda', backgroundColor: '#ffffff' }}
        />
      </div>

      {/* Relation */}
      <div>
        <label className="font-space-mono text-xs text-[#555555] uppercase tracking-widest block mb-2">
          Your Relationship to {missionaryName} *
        </label>
        <select
          required
          value={form.relation}
          onChange={(e) => set('relation', e.target.value)}
          className="w-full px-4 py-3 text-sm font-inter text-[#222222] outline-none appearance-none"
          style={{ border: '1px solid #e0deda', backgroundColor: '#ffffff' }}
        >
          <option value="">Select your relationship…</option>
          {RELATIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="font-space-mono text-xs text-[#555555] uppercase tracking-widest block mb-2">
          Your Message *
        </label>

        {/* Writing prompts */}
        <div className="mb-3">
          <p className="font-space-mono text-xs text-[#555555] mb-2">Need a prompt? Choose one to get started:</p>
          <div className="flex flex-col gap-1.5">
            {[
              `How did ${missionaryName} impact you?`,
              `What was your favorite moment with ${missionaryName}?`,
              `What is your hope for ${missionaryName} as they arrive home?`,
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => set('message', form.message ? form.message : prompt + ' ')}
                className="text-left text-xs font-inter px-3 py-2 transition-colors hover:text-[#222222]"
                style={{ border: '1px solid #e0deda', backgroundColor: '#f4f2ef', color: '#555555', lineHeight: 1.5 }}
              >
                <span className="text-[#e0deda] mr-1.5">→</span>{prompt}
              </button>
            ))}
          </div>
        </div>

        <textarea
          required
          rows={6}
          maxLength={1000}
          placeholder={`Share a memory, a story, or a word of thanks for ${missionaryName}'s service…`}
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          className="w-full px-4 py-3 text-sm font-inter text-[#222222] outline-none resize-none"
          style={{ border: '1px solid #e0deda', backgroundColor: '#ffffff', lineHeight: 1.8 }}
        />
        <div className="text-right mt-1">
          <span className="font-space-mono text-xs text-[#555555]">
            {charCount} / 1000
          </span>
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="font-space-mono text-xs text-[#555555] uppercase tracking-widest block mb-2">
          Photos (Optional — up to 6)
        </label>

        {photos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {photos.map((photo) => (
              <div key={photo.url} className="relative">
                <img
                  src={photo.url}
                  alt=""
                  className="w-20 h-20 object-cover"
                  style={{ filter: 'grayscale(15%) sepia(8%)' }}
                />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.url)}
                  className="absolute top-0.5 right-0.5 bg-[#222222] text-white rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < 6 && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 w-full py-3 text-sm font-inter text-[#555555] hover:text-[#222222] transition-colors justify-center"
              style={{ border: '1px dashed #e0deda', backgroundColor: '#f4f2ef' }}
            >
              <Upload size={14} />
              {uploading ? 'Uploading…' : 'Add Photos'}
            </button>
          </>
        )}
      </div>

      {/* Image Layout Picker — only shown when at least one photo is uploaded */}
      {photos.length > 0 && (
        <div
          className="pt-6"
          style={{ borderTop: '1px solid #e0deda' }}
        >
          <label className="font-space-mono text-xs text-[#555555] uppercase tracking-widest block mb-4">
            Photo Layout
          </label>
          <p className="text-sm text-[#555555] mb-5" style={{ lineHeight: 1.7 }}>
            Choose where your photo appears on the page. Drag it directly or tap a preset below.
          </p>
          <ImageLayoutPicker
            photoUrl={photos[0].url}
            position={imagePosition}
            onChange={setImagePosition}
          />
        </div>
      )}

      <HeirloomButton type="submit" loading={loading} size="lg" className="w-full">
        Submit Memory
      </HeirloomButton>
    </form>
  );
}
