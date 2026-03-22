import { useState, useRef } from 'react';
import { Upload, X, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { PageTemplatePicker } from '@/components/submission/PageTemplatePicker';
import { supabase } from '@/integrations/supabase/client';
import type { PageLayout, PageTemplate } from '@/types';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25 MB

/** Character limits by template and book size (based on 12pt / 4mm font at 10×10 or 12×12 inches) */
const CHAR_LIMITS: Record<string, Record<PageTemplate, number>> = {
  '10x10': {
    'text-only': 3800,
    'image-top-text-bottom': 2000,
    'text-top-image-bottom': 2000,
    'side-by-side-left': 1900,
    'side-by-side-right': 1900,
    'full-image-caption': 1500,
    'custom': 2000,
  },
  '12x12': {
    'text-only': 5800,
    'image-top-text-bottom': 3100,
    'text-top-image-bottom': 3100,
    'side-by-side-left': 2900,
    'side-by-side-right': 2900,
    'full-image-caption': 2200,
    'custom': 3100,
  },
};

function getCharLimit(bookSize: string, template: PageTemplate, pageAllowance: 1 | 2): number {
  const sizeMap = CHAR_LIMITS[bookSize] || CHAR_LIMITS['10x10'];
  const base = sizeMap[template] || sizeMap['text-only'];
  return pageAllowance === 2 ? Math.round(base * 1.8) : base;
}

const RELATIONS = [
  'Mother', 'Father', 'Sister', 'Brother', 'Grandparent',
  'Aunt / Uncle', 'Friend', 'Mission Companion', 'Ward Member',
  'Mission President',
];

interface SubmissionFormProps {
  vaultId: string;
  missionaryName: string;
  bookSize?: '10x10' | '12x12';
  pageAllowance?: 1 | 2;
  onSubmit: (data: {
    vault_id: string;
    contributor_name: string;
    relation: string;
    message: string;
    media_urls: string[];
    page_layout: PageLayout;
  }) => Promise<void>;
}

export function SubmissionForm({ vaultId, missionaryName, bookSize = '10x10', pageAllowance = 1, onSubmit }: SubmissionFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<{ url: string; name: string }[]>([]);
  const [pageLayout, setPageLayout] = useState<PageLayout>({ template: 'image-top-text-bottom' });
  const [page2Layout, setPage2Layout] = useState<PageLayout>({ template: 'text-only' });
  const [activePage, setActivePage] = useState<1 | 2>(1);
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

    // Validate file types
    const unsupported = files.filter((f) => !ACCEPTED_TYPES.includes(f.type));
    if (unsupported.length > 0) {
      toast.error('Unsupported file type. Please upload JPG, PNG, WebP, or HEIC images only.');
      return;
    }

    // Validate individual file sizes
    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      toast.error('Each photo must be under 10MB.');
      return;
    }

    // Validate total combined size
    const existingSize = 0; // We can't track existing sizes after upload, so validate new batch
    const batchSize = files.reduce((sum, f) => sum + f.size, 0);
    if (batchSize > MAX_TOTAL_SIZE) {
      toast.error('Total upload size must be under 25MB.');
      return;
    }

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

    // If this is the first image and template is text-only, auto-switch
    if (photos.length === 0 && uploaded.length > 0 && pageLayout.template === 'text-only') {
      setPageLayout({ ...pageLayout, template: 'image-top-text-bottom' });
    }
    // For page 2 in spread mode, auto-switch if images overflow
    if (pageAllowance === 2 && uploaded.length > 0 && page2Layout.template === 'text-only') {
      const totalPhotos = photos.length + uploaded.length;
      if (totalPhotos > 1) {
        setPage2Layout({ ...page2Layout, template: 'image-top-text-bottom' });
      }
    }
  }

  function removePhoto(url: string) {
    const remaining = photos.filter((ph) => ph.url !== url);
    setPhotos(remaining);
    if (remaining.length === 0 && pageLayout.template !== 'text-only') {
      setPageLayout({ ...pageLayout, template: 'text-only' });
    }
    if (pageAllowance === 2 && remaining.length <= 1 && page2Layout.template !== 'text-only') {
      setPage2Layout({ ...page2Layout, template: 'text-only' });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.contributor_name || !form.relation || !form.message) return;
    setLoading(true);
    try {
      // Encode both page layouts into the page_layout JSON
      const finalLayout: PageLayout = pageAllowance === 2
        ? { ...pageLayout, spreadPage2: page2Layout }
        : pageLayout;

      await onSubmit({
        vault_id: vaultId,
        contributor_name: form.contributor_name.trim(),
        relation: form.relation,
        message: form.message.trim(),
        media_urls: photos.map((p) => p.url),
        page_layout: finalLayout,
      });
    } finally {
      setLoading(false);
    }
  }

  const charLimit = getCharLimit(bookSize, pageLayout.template, pageAllowance);
  const charCount = form.message.length;
  const hasImages = photos.length > 0;
  const isSpread = pageAllowance === 2;

  // Determine which layout is active for the template picker
  const activeLayout = activePage === 1 ? pageLayout : page2Layout;
  const activeOnChange = activePage === 1 ? setPageLayout : setPage2Layout;

  // For spread mode, split images between pages for the preview
  const hasPage2Images = isSpread && photos.length > 1;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Spread indicator */}
      {isSpread && (
        <div className="flex items-center gap-3 border border-border-light bg-[#faf9f7] p-4">
          <BookOpen className="h-5 w-5 flex-shrink-0 text-dark-text" />
          <div>
            <p className="font-playfair text-sm font-semibold text-dark-text">
              Two-Page Spread
            </p>
            <p className="font-inter text-xs text-muted-text">
              You have a full two-page spread to share your memory. Customize each page individually below.
            </p>
          </div>
        </div>
      )}

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
        <input
          list="relation-suggestions"
          value={form.relation}
          onChange={(e) => set('relation', e.target.value)}
          placeholder="e.g. Mother, Friend, Mission Companion…"
          className="w-full border border-border-light bg-white px-4 py-3 font-inter text-sm text-dark-text outline-none"
        />
        <datalist id="relation-suggestions">
          {RELATIONS.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
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
          maxLength={charLimit}
          className="w-full resize-none border border-border-light bg-white px-4 py-3 font-inter text-sm text-dark-text outline-none"
          placeholder={`Share a memory, story, or message for ${missionaryName}…`}
        />
        <p className={`mt-1 text-right font-space-mono text-[10px] ${charCount > charLimit * 0.9 ? 'text-red-500' : 'text-muted-text'}`}>
          {charCount.toLocaleString()} / {charLimit.toLocaleString()}
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
              <div key={p.url} className="group relative h-16 w-16 overflow-hidden bg-[#f0eeea]">
                <img src={p.url} alt={p.name} className="h-full w-full object-contain" />
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

      {/* Page Layout Picker */}
      <div className="border-t border-border-light pt-5">
        {/* Page tabs for spread mode */}
        {isSpread && (
          <div className="mb-4 flex gap-2">
            {([1, 2] as const).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setActivePage(pageNum)}
                className="px-4 py-2 font-space-mono text-[10px] uppercase tracking-wider transition-colors"
                style={{
                  border: `1.5px solid ${activePage === pageNum ? '#222' : '#e0deda'}`,
                  backgroundColor: activePage === pageNum ? '#222' : 'transparent',
                  color: activePage === pageNum ? '#fff' : '#555',
                }}
              >
                Page {pageNum}
              </button>
            ))}
          </div>
        )}

        <PageTemplatePicker
          layout={activeLayout}
          hasImages={activePage === 1 ? hasImages : hasPage2Images}
          onChange={activeOnChange}
          message={form.message}
          contributorName={form.contributor_name}
          relation={form.relation}
          photoUrls={photos.map((p) => p.url)}
          pageAllowance={pageAllowance}
          activePage={activePage}
          page2Layout={page2Layout}
        />
      </div>

      <HeirloomButton type="submit" loading={loading} className="w-full" size="lg">
        Submit Memory
      </HeirloomButton>
    </form>
  );
}
