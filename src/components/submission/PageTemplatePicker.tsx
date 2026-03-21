import { useState } from 'react';
import type { PageLayout, PageTemplate } from '@/types';
import { PAGE_TEMPLATES } from '@/components/book/pageTemplates';
import { PagePreview } from '@/components/submission/PagePreview';

interface Props {
  layout: PageLayout;
  hasImages: boolean;
  onChange: (layout: PageLayout) => void;
  message?: string;
  contributorName?: string;
  relation?: string;
  photoUrls?: string[];
}

/** Mini page preview icon showing the template's image/text split */
function TemplateThumbnail({ template, active }: { template: PageTemplate; active: boolean }) {
  const bg = active ? '#222222' : '#faf9f7';
  const imgColor = active ? '#ffffff' : '#d4d0cc';
  const textColor = active ? 'rgba(255,255,255,0.5)' : '#e0deda';
  const borderColor = active ? '#222222' : '#e0deda';
  const w = 48;
  const h = 62;

  // Render a tiny page mockup with image/text zones
  const zones: Record<PageTemplate, React.ReactNode> = {
    'full-image-caption': (
      <>
        <rect x={2} y={2} width={w - 4} height={h * 0.75} rx={1} fill={imgColor} />
        <rect x={4} y={h * 0.78} width={w * 0.7} height={3} rx={1} fill={textColor} />
        <rect x={4} y={h * 0.78 + 5} width={w * 0.5} height={3} rx={1} fill={textColor} />
      </>
    ),
    'image-top-text-bottom': (
      <>
        <rect x={2} y={2} width={w - 4} height={h * 0.5} rx={1} fill={imgColor} />
        <rect x={4} y={h * 0.56} width={w * 0.8} height={3} rx={1} fill={textColor} />
        <rect x={4} y={h * 0.56 + 5} width={w * 0.6} height={3} rx={1} fill={textColor} />
        <rect x={4} y={h * 0.56 + 10} width={w * 0.7} height={3} rx={1} fill={textColor} />
      </>
    ),
    'text-top-image-bottom': (
      <>
        <rect x={4} y={4} width={w * 0.8} height={3} rx={1} fill={textColor} />
        <rect x={4} y={9} width={w * 0.6} height={3} rx={1} fill={textColor} />
        <rect x={4} y={14} width={w * 0.7} height={3} rx={1} fill={textColor} />
        <rect x={2} y={h * 0.4} width={w - 4} height={h * 0.55} rx={1} fill={imgColor} />
      </>
    ),
    'side-by-side-left': (
      <>
        <rect x={2} y={2} width={w * 0.45} height={h - 4} rx={1} fill={imgColor} />
        <rect x={w * 0.52} y={6} width={w * 0.38} height={3} rx={1} fill={textColor} />
        <rect x={w * 0.52} y={11} width={w * 0.3} height={3} rx={1} fill={textColor} />
        <rect x={w * 0.52} y={16} width={w * 0.35} height={3} rx={1} fill={textColor} />
      </>
    ),
    'side-by-side-right': (
      <>
        <rect x={4} y={6} width={w * 0.38} height={3} rx={1} fill={textColor} />
        <rect x={4} y={11} width={w * 0.3} height={3} rx={1} fill={textColor} />
        <rect x={4} y={16} width={w * 0.35} height={3} rx={1} fill={textColor} />
        <rect x={w * 0.52} y={2} width={w * 0.45} height={h - 4} rx={1} fill={imgColor} />
      </>
    ),
    'text-only': (
      <>
        <rect x={4} y={6} width={w * 0.8} height={3} rx={1} fill={textColor} />
        <rect x={4} y={11} width={w * 0.6} height={3} rx={1} fill={textColor} />
        <rect x={4} y={16} width={w * 0.75} height={3} rx={1} fill={textColor} />
        <rect x={4} y={24} width={w * 0.8} height={3} rx={1} fill={textColor} />
        <rect x={4} y={29} width={w * 0.5} height={3} rx={1} fill={textColor} />
        <rect x={4} y={34} width={w * 0.7} height={3} rx={1} fill={textColor} />
        <rect x={4} y={42} width={w * 0.6} height={3} rx={1} fill={textColor} />
        <rect x={4} y={47} width={w * 0.8} height={3} rx={1} fill={textColor} />
      </>
    ),
    custom: (
      <>
        <rect x={2} y={2} width={w - 4} height={h * 0.45} rx={1} fill={imgColor} />
        <line x1={2} y1={h * 0.5} x2={w - 2} y2={h * 0.5} stroke={active ? '#fff' : '#bbb'} strokeWidth={1} strokeDasharray="2 2" />
        <rect x={4} y={h * 0.55} width={w * 0.7} height={3} rx={1} fill={textColor} />
        <rect x={4} y={h * 0.55 + 5} width={w * 0.5} height={3} rx={1} fill={textColor} />
      </>
    ),
  };

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        border: `1.5px solid ${borderColor}`,
        borderRadius: 3,
        backgroundColor: bg,
        flexShrink: 0,
      }}
    >
      {zones[template]}
    </svg>
  );
}

/** Slider for the custom layout split ratio */
function CustomSplitEditor({ layout, onChange }: { layout: PageLayout; onChange: (l: PageLayout) => void }) {
  const direction = layout.customSplit?.direction ?? 'vertical';
  const ratio = layout.customSplit?.ratio ?? 0.5;

  return (
    <div className="mt-4 space-y-3 border border-border-light bg-stone-bg p-4">
      <p className="font-space-mono text-[10px] uppercase tracking-widest text-muted-text">
        Custom Layout
      </p>

      {/* Direction toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...layout, customSplit: { direction: 'vertical', ratio } })}
          className="px-3 py-1.5 font-space-mono text-[10px] uppercase tracking-wider transition-colors"
          style={{
            border: `1px solid ${direction === 'vertical' ? '#222' : '#e0deda'}`,
            backgroundColor: direction === 'vertical' ? '#222' : 'transparent',
            color: direction === 'vertical' ? '#fff' : '#555',
          }}
        >
          Stack (Top/Bottom)
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...layout, customSplit: { direction: 'horizontal', ratio } })}
          className="px-3 py-1.5 font-space-mono text-[10px] uppercase tracking-wider transition-colors"
          style={{
            border: `1px solid ${direction === 'horizontal' ? '#222' : '#e0deda'}`,
            backgroundColor: direction === 'horizontal' ? '#222' : 'transparent',
            color: direction === 'horizontal' ? '#fff' : '#555',
          }}
        >
          Side by Side
        </button>
      </div>

      {/* Ratio slider */}
      <div>
        <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
          Image Size: {Math.round(ratio * 100)}%
        </label>
        <input
          type="range"
          min={30}
          max={70}
          value={Math.round(ratio * 100)}
          onChange={(e) =>
            onChange({ ...layout, customSplit: { direction, ratio: Number(e.target.value) / 100 } })
          }
          className="w-full accent-dark-text"
        />
        <div className="flex justify-between font-space-mono text-[9px] text-muted-text">
          <span>More Text</span>
          <span>More Image</span>
        </div>
      </div>

      {/* Text alignment */}
      <div>
        <label className="mb-1 block font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
          Text Alignment
        </label>
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onChange({ ...layout, textAlignment: a })}
              className="px-3 py-1.5 font-space-mono text-[10px] uppercase tracking-wider transition-colors"
              style={{
                border: `1px solid ${layout.textAlignment === a ? '#222' : '#e0deda'}`,
                backgroundColor: layout.textAlignment === a ? '#222' : 'transparent',
                color: layout.textAlignment === a ? '#fff' : '#555',
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PageTemplatePicker({ layout, hasImages, onChange, message, contributorName, relation, photoUrls }: Props) {
  const [showCustom, setShowCustom] = useState(layout.template === 'custom');

  const available = PAGE_TEMPLATES.filter(
    (t) => hasImages || !t.requiresImage
  );

  function selectTemplate(id: PageTemplate) {
    const isCustom = id === 'custom';
    setShowCustom(isCustom);
    onChange({
      ...layout,
      template: id,
      ...(isCustom ? { customSplit: layout.customSplit ?? { direction: 'vertical', ratio: 0.5 } } : {}),
    });
  }

  return (
    <div>
      <p className="mb-3 font-space-mono text-[10px] uppercase tracking-widest text-muted-text">
        Choose Your Page Layout
      </p>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {available.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTemplate(t.id)}
            className="flex flex-col items-center gap-1.5 p-1.5 transition-all"
            title={t.description}
          >
            <TemplateThumbnail template={t.id} active={layout.template === t.id} />
            <span
              className="font-space-mono text-[8px] uppercase leading-tight tracking-wider"
              style={{ color: layout.template === t.id ? '#222' : '#999' }}
            >
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {showCustom && <CustomSplitEditor layout={layout} onChange={onChange} />}

      {/* Live preview — always shown so contributors see exactly what their page will look like */}
      <div className="mt-5 flex justify-center">
        <PagePreview
          layout={layout}
          message={message ?? ''}
          contributorName={contributorName ?? ''}
          relation={relation ?? ''}
          photoUrls={photoUrls ?? []}
        />
      </div>
    </div>
  );
}
