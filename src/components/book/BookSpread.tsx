import { GridOverlay } from '@/components/common/GridOverlay';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import type { Submission, Vault, ImagePosition } from '@/types';

interface BookSpreadProps {
  vault: Vault;
  submission?: Submission;
  pageNumber?: number;
  isCover?: boolean;
}

const IMAGE_STYLE: React.CSSProperties = {
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: '12px',
  filter: 'grayscale(20%) sepia(10%)',
};

function SubmissionPage({ submission }: { submission: Submission }) {
  const position: ImagePosition = submission.image_layout?.position ?? 'bottom';
  const primaryUrl = submission.media_urls[0];

  const fullMessage = (
    <p
      style={{
        fontSize: '0.95rem',
        lineHeight: 1.8,
        color: '#555555',
      }}
    >
      {submission.message}
    </p>
  );

  const photoBlock = (extraStyle?: React.CSSProperties) =>
    primaryUrl ? (
      <div
        style={{
          backgroundImage: `url('${primaryUrl}')`,
          ...IMAGE_STYLE,
          ...extraStyle,
        }}
      />
    ) : null;

  const contributorMeta = (
    <div
      className="flex justify-between items-end pt-8"
      style={{ borderTop: '1px solid #e0deda', marginTop: 'auto', paddingTop: '2rem' }}
    >
      <div style={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '0.05em', color: '#222222' }}>
        {submission.contributor_name}
      </div>
      <div className="font-space-mono text-xs text-[#555555] uppercase tracking-widest">
        {submission.relation}
      </div>
    </div>
  );

  // ── top: photo spans full width at top, text below ──────────────────────────
  if (position === 'top') {
    return (
      <div className="flex flex-col h-full">
        <PageTag className="mb-6">[ {submission.relation} ]</PageTag>
        {photoBlock({ height: 220, marginBottom: '2rem' })}
        <h2
          className="font-playfair"
          style={{ fontSize: '2rem', fontWeight: 400, lineHeight: 1.2, marginBottom: '1.5rem', color: '#222222' }}
        >
          "{submission.message.slice(0, 100)}{submission.message.length > 100 ? '…' : ''}"
        </h2>
        {fullMessage}
        {contributorMeta}
      </div>
    );
  }

  // ── bottom: text first, photo at bottom (original behaviour) ─────────────────
  if (position === 'bottom') {
    return (
      <div className="flex flex-col h-full">
        <PageTag className="mb-8">[ {submission.relation} ]</PageTag>
        <h2
          className="font-playfair"
          style={{ fontSize: '3rem', fontWeight: 400, lineHeight: 1.2, marginBottom: '3rem', letterSpacing: '-0.01em', color: '#222222' }}
        >
          "{submission.message.slice(0, 140)}{submission.message.length > 140 ? '…' : ''}"
        </h2>
        {fullMessage}
        {primaryUrl && (
          <div className="flex gap-6 mt-auto" style={{ paddingTop: '3rem' }}>
            {submission.media_urls.slice(0, 2).map((url, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ height: 250, backgroundImage: `url('${url}')`, ...IMAGE_STYLE }}
              />
            ))}
          </div>
        )}
        {contributorMeta}
      </div>
    );
  }

  // ── center: text above, photo centered, text continues below ─────────────────
  if (position === 'center') {
    return (
      <div className="flex flex-col h-full">
        <PageTag className="mb-6">[ {submission.relation} ]</PageTag>
        {fullMessage}
        {photoBlock({ height: 200, margin: '2rem 0' })}
        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#777777' }}>
          {submission.message.slice(0, 200)}
          {submission.message.length > 200 ? '…' : ''}
        </p>
        {contributorMeta}
      </div>
    );
  }

  // ── float-left: photo floats left, text wraps right and below ────────────────
  if (position === 'float-left') {
    return (
      <div className="flex flex-col h-full">
        <PageTag className="mb-6">[ {submission.relation} ]</PageTag>
        <div style={{ overflow: 'hidden' }}>
          {primaryUrl && (
            <div
              style={{
                float: 'left',
                width: '44%',
                height: 220,
                marginRight: '1.5rem',
                marginBottom: '0.5rem',
                backgroundImage: `url('${primaryUrl}')`,
                ...IMAGE_STYLE,
              }}
            />
          )}
          <h2
            className="font-playfair"
            style={{ fontSize: '1.6rem', fontWeight: 400, lineHeight: 1.25, marginBottom: '1rem', color: '#222222' }}
          >
            "{submission.message.slice(0, 80)}{submission.message.length > 80 ? '…' : ''}"
          </h2>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#555555' }}>
            {submission.message}
          </p>
        </div>
        {contributorMeta}
      </div>
    );
  }

  // ── float-right: photo floats right, text wraps left and below ───────────────
  if (position === 'float-right') {
    return (
      <div className="flex flex-col h-full">
        <PageTag className="mb-6">[ {submission.relation} ]</PageTag>
        <div style={{ overflow: 'hidden' }}>
          {primaryUrl && (
            <div
              style={{
                float: 'right',
                width: '44%',
                height: 220,
                marginLeft: '1.5rem',
                marginBottom: '0.5rem',
                backgroundImage: `url('${primaryUrl}')`,
                ...IMAGE_STYLE,
              }}
            />
          )}
          <h2
            className="font-playfair"
            style={{ fontSize: '1.6rem', fontWeight: 400, lineHeight: 1.25, marginBottom: '1rem', color: '#222222' }}
          >
            "{submission.message.slice(0, 80)}{submission.message.length > 80 ? '…' : ''}"
          </h2>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#555555' }}>
            {submission.message}
          </p>
        </div>
        {contributorMeta}
      </div>
    );
  }

  // fallback
  return null;
}

export function BookSpread({ vault, submission, pageNumber, isCover }: BookSpreadProps) {
  return (
    <div
      className="relative flex"
      style={{
        width: '1200px',
        height: '800px',
        backgroundColor: '#ffffff',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      }}
    >
      {/* Binding crease */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.05), rgba(0,0,0,0.1), rgba(0,0,0,0.05))',
          width: '2px',
        }}
      />

      {/* Left Page */}
      <div
        className="relative flex-1 flex flex-col overflow-hidden"
        style={{
          padding: '6rem 5rem',
          backgroundColor: '#f4f2ef',
        }}
      >
        <GridOverlay />

        <div className="relative z-10 flex flex-col h-full">
          <PageTag className="mb-12">
            [ {vault.missionary_name} ]
          </PageTag>

          <h1
            className="font-playfair"
            style={{
              fontSize: '4.5rem',
              fontWeight: 400,
              lineHeight: 1.1,
              marginBottom: '2rem',
              letterSpacing: '-0.02em',
              color: '#222222',
            }}
          >
            {vault.mission_name || 'Memory Vault'}
          </h1>

          <Divider className="my-8" />

          <p
            style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: '#555555',
              maxWidth: '85%',
            }}
          >
            {isCover
              ? 'A collection of memories, stories, and impact from the people whose lives you touched during your service.'
              : submission?.message?.slice(0, 120) + '…'}
          </p>

          {/* Photo — left page */}
          {vault.cover_image_url && (
            <div className="mt-auto" style={{ paddingTop: '4rem' }}>
              <div
                style={{
                  height: '450px',
                  backgroundImage: `url('${vault.cover_image_url}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '12px',
                  filter: 'grayscale(20%) sepia(10%)',
                }}
              />
            </div>
          )}

          {pageNumber && (
            <div
              className="absolute bottom-16 right-20 font-space-mono text-xs text-[#555555]"
            >
              {String(pageNumber).padStart(2, '0')}
            </div>
          )}
        </div>
      </div>

      {/* Right Page */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{
          padding: '6rem 5rem',
          backgroundColor: '#ffffff',
        }}
      >
        {submission ? (
          <SubmissionPage submission={submission} />
        ) : (
          <div className="flex flex-col h-full items-center justify-center">
            <PageTag>[ Memory Vault ]</PageTag>
            <h2
              className="font-playfair mt-8 text-center"
              style={{ fontSize: '2.5rem', fontWeight: 400, color: '#222222' }}
            >
              Stories of Service
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
