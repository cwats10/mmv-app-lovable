export function GridOverlay() {
  return (
    <div
sync/from-main
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundSize: '100px 100px',
        backgroundImage: `
          linear-gradient(to right, #e0deda 1px, transparent 1px),
          linear-gradient(to bottom, #e0deda 1px, transparent 1px)
        `,
        opacity: 0.3,
      }}
    />
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
            'linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)',
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
main
  );
}
