export function GridOverlay() {
  return (
    <div
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
  );
}
