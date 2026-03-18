import { useCallback, useRef, useState } from 'react';

export function GridOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="pointer-events-auto absolute inset-0 z-20"
    >
      {/* Base grid with edge fade */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, hsl(37 42% 61% / 0.3) 1px, transparent 1px), linear-gradient(to bottom, hsl(37 42% 61% / 0.3) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)',
        }}
      />

      {/* Mouse highlight glow */}
      {mousePos && (
        <div
          className="absolute inset-0 transition-opacity duration-150"
          style={{
            backgroundImage:
              'linear-gradient(to right, hsl(var(--primary) / 0.12) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary) / 0.12) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: `radial-gradient(circle 200px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(circle 200px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
          }}
        />
      )}
    </div>
  );
}
