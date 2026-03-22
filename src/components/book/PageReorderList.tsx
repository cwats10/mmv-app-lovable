import { useState, useRef, useCallback, useEffect } from 'react';
import { GripVertical } from 'lucide-react';
import type { Submission } from '@/types';

interface Props {
  submissions: Submission[];
  onReorder: (orderedIds: string[]) => Promise<void>;
}

export function PageReorderList({ submissions, onReorder }: Props) {
  const [items, setItems] = useState(submissions);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const dragItem = useRef<number | null>(null);
  const prevIdsRef = useRef<string>('');

  // Only sync when the source submission IDs actually change (new DB data)
  useEffect(() => {
    const sourceKey = submissions.map(s => s.id).join(',');
    if (sourceKey !== prevIdsRef.current) {
      prevIdsRef.current = sourceKey;
      setItems(submissions);
    }
  }, [submissions]);

  const handleDragStart = useCallback((idx: number) => {
    dragItem.current = idx;
    setDragIdx(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  }, []);

  const handleDrop = useCallback((idx: number) => {
    const from = dragItem.current;
    if (from === null || from === idx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }

    const newItems = [...items];
    const [moved] = newItems.splice(from, 1);
    newItems.splice(idx, 0, moved);
    setItems(newItems);
    setDragIdx(null);
    setOverIdx(null);
    dragItem.current = null;
  }, [items]);

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setOverIdx(null);
  }, []);

  const hasChanges = items.some((item, i) => item.id !== submissions[i]?.id);

  async function saveOrder() {
    setSaving(true);
    try {
      await onReorder(items.map((s) => s.id));
      prevIdsRef.current = items.map(s => s.id).join(',');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-space-mono text-[10px] uppercase tracking-widest text-muted-text">
          Drag to reorder pages
        </p>
        {hasChanges && (
          <button
            onClick={saveOrder}
            disabled={saving}
            className="px-4 py-1.5 font-space-mono text-[10px] uppercase tracking-wider transition-colors"
            style={{
              backgroundColor: '#222222',
              color: '#ffffff',
              border: '1px solid #222222',
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save Order'}
          </button>
        )}
      </div>

      <div className="space-y-1">
        {items.map((sub, idx) => (
          <div
            key={sub.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={handleDragEnd}
            className="flex items-center gap-3 border bg-white px-4 py-3 transition-all"
            style={{
              borderColor: overIdx === idx ? '#222222' : '#e0deda',
              opacity: dragIdx === idx ? 0.4 : 1,
              cursor: 'grab',
              transform: overIdx === idx && dragIdx !== idx ? 'translateY(2px)' : 'none',
            }}
          >
            <GripVertical className="h-4 w-4 flex-shrink-0 text-muted-text" />

            {/* Page number */}
            <span className="font-space-mono text-[10px] text-muted-text">
              {String(idx + 1).padStart(2, '0')}
            </span>

            {/* Thumbnail */}
            {sub.media_urls.length > 0 ? (
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden">
                <img src={sub.media_urls[0]} alt="" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-stone-100">
                <span className="font-space-mono text-[8px] text-muted-text">TXT</span>
              </div>
            )}

            {/* Contributor info */}
            <div className="flex-1 min-w-0">
              <p className="truncate font-playfair text-sm font-semibold text-dark-text">
                {sub.contributor_name}
              </p>
              <p className="truncate font-space-mono text-[10px] text-muted-text">
                {sub.relation} — {sub.message.slice(0, 60)}{sub.message.length > 60 ? '…' : ''}
              </p>
            </div>

            {/* Template badge */}
            {sub.page_layout && (
              <span className="flex-shrink-0 font-space-mono text-[8px] uppercase tracking-wider text-muted-text">
                {(sub.page_layout as any).template?.replace(/-/g, ' ') ?? 'default'}
              </span>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="border border-border-light bg-white p-8 text-center">
          <p className="font-inter text-sm text-muted-text">
            No approved submissions to reorder yet.
          </p>
        </div>
      )}
    </div>
  );
}
