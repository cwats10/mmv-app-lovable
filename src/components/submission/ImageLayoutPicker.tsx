import { useState, useRef, useEffect } from 'react';
import type { ImagePosition } from '@/types';

interface Props {
  photoUrl: string;
  position: ImagePosition;
  onChange: (position: ImagePosition) => void;
}

type ZoneDef = {
  id: ImagePosition;
  label: string;
  // percentage-based bounds within the page preview
  x: number;
  y: number;
  w: number;
  h: number;
};

const ZONES: ZoneDef[] = [
  { id: 'top',         label: 'Top',         x:  5, y:  4, w: 90, h: 28 },
  { id: 'float-left',  label: 'Float Left',  x:  3, y: 16, w: 42, h: 54 },
  { id: 'float-right', label: 'Float Right', x: 55, y: 16, w: 42, h: 54 },
  { id: 'center',      label: 'Center',      x: 18, y: 35, w: 64, h: 28 },
  { id: 'bottom',      label: 'Bottom',      x:  5, y: 68, w: 90, h: 28 },
];

function nearestZone(xPct: number, yPct: number): ImagePosition {
  let best = ZONES[0];
  let bestDist = Infinity;
  for (const z of ZONES) {
    const cx = z.x + z.w / 2;
    const cy = z.y + z.h / 2;
    const d = Math.hypot(xPct - cx, yPct - cy);
    if (d < bestDist) { bestDist = d; best = z; }
  }
  return best.id;
}

// Renders grey placeholder lines to simulate text in a given area
function TextLines({ count, style }: { count: number; style: React.CSSProperties }) {
  return (
    <div style={{ position: 'absolute', ...style }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 5,
            borderRadius: 2,
            backgroundColor: '#d4d0cc',
            marginBottom: 4,
            width: i === count - 1 ? '58%' : '100%',
          }}
        />
      ))}
    </div>
  );
}

// Shows text line placeholders arranged around the selected image position
function PageTextLayout({ position }: { position: ImagePosition }) {
  const pad = 14;

  switch (position) {
    case 'top':
      return (
        <TextLines
          count={9}
          style={{ left: pad, right: pad, top: '35%' }}
        />
      );

    case 'float-left':
      return (
        <>
          <TextLines count={7} style={{ left: '48%', right: pad, top: '16%' }} />
          <TextLines count={3} style={{ left: pad, right: pad, top: '73%' }} />
        </>
      );

    case 'float-right':
      return (
        <>
          <TextLines count={7} style={{ left: pad, right: '47%', top: '16%' }} />
          <TextLines count={3} style={{ left: pad, right: pad, top: '73%' }} />
        </>
      );

    case 'center':
      return (
        <>
          <TextLines count={4} style={{ left: pad, right: pad, top: pad }} />
          <TextLines count={4} style={{ left: pad, right: pad, top: '66%' }} />
        </>
      );

    case 'bottom':
      return (
        <TextLines count={9} style={{ left: pad, right: pad, top: pad }} />
      );

    default:
      return null;
  }
}

// Compact position icon shown in the quick-pick buttons
function ZoneIcon({ zone, active }: { zone: ZoneDef; active: boolean }) {
  const fill = active ? '#ffffff' : '#555555';
  const bg = active ? '#222222' : '#f4f2ef';
  const border = active ? '#222222' : '#e0deda';

  // Render a tiny page mockup (24×30) with a highlight block in the zone position
  const scaleX = 24 / 100;
  const scaleY = 30 / 100;

  return (
    <div
      style={{
        width: 24,
        height: 30,
        position: 'relative',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: 2,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: zone.x * scaleX,
          top: zone.y * scaleY,
          width: zone.w * scaleX,
          height: zone.h * scaleY,
          backgroundColor: fill,
          opacity: active ? 0.9 : 0.4,
          borderRadius: 1,
        }}
      />
    </div>
  );
}

export function ImageLayoutPicker({ photoUrl, position, onChange }: Props) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hoverZone, setHoverZone] = useState<ImagePosition | null>(null);

  const activeZone = ZONES.find((z) => z.id === position)!;

  function getPct(clientX: number, clientY: number) {
    const rect = pageRef.current!.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }

  function startDrag(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    setDragging(true);
  }

  useEffect(() => {
    if (!dragging) return;

    function onMove(e: MouseEvent | TouchEvent) {
      const point = 'touches' in e ? e.touches[0] : e;
      const { x, y } = getPct(point.clientX, point.clientY);
      setHoverZone(nearestZone(x, y));
    }

    function onUp(e: MouseEvent | TouchEvent) {
      const point = 'changedTouches' in e ? e.changedTouches[0] : (e as MouseEvent);
      const { x, y } = getPct(point.clientX, point.clientY);
      onChange(nearestZone(x, y));
      setDragging(false);
      setHoverZone(null);
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging, onChange]);

  return (
    <div>
      <p className="font-space-mono text-xs text-[#555555] uppercase tracking-widest mb-3">
        Drag your photo to place it on the page
      </p>

      {/* Page preview */}
      <div className="flex justify-center mb-4">
        <div
          ref={pageRef}
          className="relative"
          style={{
            width: 260,
            height: 336,
            backgroundColor: '#faf9f7',
            border: '1px solid #e0deda',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            userSelect: 'none',
            overflow: 'hidden',
            cursor: dragging ? 'grabbing' : 'default',
          }}
        >
          {/* Simulated text lines */}
          <PageTextLayout position={hoverZone ?? position} />

          {/* Drop zone highlights shown while dragging */}
          {dragging && ZONES.map((z) => {
            const isHover = hoverZone === z.id;
            return (
              <div
                key={z.id}
                style={{
                  position: 'absolute',
                  left: `${z.x}%`,
                  top: `${z.y}%`,
                  width: `${z.w}%`,
                  height: `${z.h}%`,
                  border: `1.5px dashed ${isHover ? '#222222' : '#c0bbb5'}`,
                  backgroundColor: isHover ? 'rgba(34,34,34,0.05)' : 'transparent',
                  zIndex: 20,
                  pointerEvents: 'none',
                  transition: 'background-color 0.1s',
                }}
              />
            );
          })}

          {/* Draggable photo positioned in active zone */}
          <div
            onMouseDown={startDrag}
            onTouchStart={startDrag}
            title="Drag to reposition"
            style={{
              position: 'absolute',
              left: `${(hoverZone ? ZONES.find((z) => z.id === hoverZone)! : activeZone).x}%`,
              top: `${(hoverZone ? ZONES.find((z) => z.id === hoverZone)! : activeZone).y}%`,
              width: `${(hoverZone ? ZONES.find((z) => z.id === hoverZone)! : activeZone).w}%`,
              height: `${(hoverZone ? ZONES.find((z) => z.id === hoverZone)! : activeZone).h}%`,
              backgroundImage: `url('${photoUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              cursor: dragging ? 'grabbing' : 'grab',
              zIndex: 30,
              filter: 'grayscale(12%) sepia(6%)',
              transition: dragging ? 'none' : 'left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            }}
          />

          {/* Drag hint overlay shown on the photo when not dragging */}
          {!dragging && (
            <div
              style={{
                position: 'absolute',
                left: `${activeZone.x}%`,
                top: `${activeZone.y}%`,
                width: `${activeZone.w}%`,
                height: `${activeZone.h}%`,
                zIndex: 31,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  color: '#fff',
                  fontSize: 9,
                  fontFamily: 'Space Mono, monospace',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '3px 7px',
                  borderRadius: 2,
                  opacity: 0.8,
                }}
              >
                drag to move
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick-select buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        {ZONES.map((z) => (
          <button
            key={z.id}
            type="button"
            onClick={() => onChange(z.id)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-space-mono uppercase tracking-widest transition-all"
            style={{
              border: `1px solid ${position === z.id ? '#222222' : '#e0deda'}`,
              backgroundColor: position === z.id ? '#222222' : 'transparent',
              color: position === z.id ? '#ffffff' : '#555555',
            }}
          >
            <ZoneIcon zone={z} active={position === z.id} />
            {z.label}
          </button>
        ))}
      </div>
    </div>
  );
}
