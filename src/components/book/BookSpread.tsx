import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { VaultCover } from '@/components/vault/VaultCover';
import type { Submission, Vault, PageLayout } from '@/types';

interface BookSpreadProps {
  vault: Vault;
  submission?: Submission;
  pageNumber?: number;
  isCover?: boolean;
  isBackCover?: boolean;
}

/** Resolve the effective layout for a submission, falling back to defaults. */
export function resolveLayout(submission?: Submission): PageLayout {
  if (submission?.page_layout) return submission.page_layout;
  const hasImages = (submission?.media_urls?.length ?? 0) > 0;
  return { template: hasImages ? 'image-top-text-bottom' : 'text-only' };
}

/** Contributor attribution footer */
function ContributorFooter({ submission }: { submission: Submission }) {
  return (
    <div className="border-t border-border-light pt-2">
      <p className="font-playfair text-sm font-semibold text-dark-text">
        {submission.contributor_name}
      </p>
      <p className="font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
        {submission.relation}
      </p>
    </div>
  );
}

/** Page number displayed at the bottom center */
function PageNumber({ num }: { num: number }) {
  return (
    <p className="mt-auto pt-2 text-center font-space-mono text-[10px] text-muted-text">
      {String(num).padStart(2, '0')}
    </p>
  );
}

/** Full-bleed image with a caption bar at the bottom */
function FullImageCaptionPage({ submission }: { submission: Submission }) {
  const imgUrl = submission.media_urls[0];
  return (
    <div className="flex h-full flex-col">
      {/* Image fills ~78% of the page */}
      <div className="relative flex-1 overflow-hidden" style={{ flexBasis: '78%' }}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: 'grayscale(8%) sepia(4%)' }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-stone-100">
            <span className="font-space-mono text-xs text-muted-text">[ No Image ]</span>
          </div>
        )}
      </div>
      {/* Caption area */}
      <div className="flex flex-col gap-1 p-4" style={{ flexBasis: '22%' }}>
        <p className="font-inter text-xs leading-relaxed text-muted-text line-clamp-3">
          {submission.message}
        </p>
        <ContributorFooter submission={submission} />
      </div>
    </div>
  );
}

/** Image on top, text on bottom */
function ImageTopTextBottomPage({ submission, layout }: { submission: Submission; layout: PageLayout }) {
  const ratio = layout.customSplit?.ratio ?? 0.55;
  const imgUrl = submission.media_urls[0];
  const align = layout.textAlignment ?? 'left';

  return (
    <div className="flex h-full flex-col">
      {/* Image area */}
      <div className="relative overflow-hidden" style={{ flex: `0 0 ${ratio * 100}%` }}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: 'grayscale(8%) sepia(4%)' }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-stone-100">
            <span className="font-space-mono text-xs text-muted-text">[ No Image ]</span>
          </div>
        )}
      </div>
      {/* Text area */}
      <div className="flex flex-1 flex-col justify-between p-5" style={{ textAlign: align }}>
        <div>
          <Divider className="my-2" />
          <p className="font-inter text-xs leading-relaxed text-muted-text">
            {submission.message}
          </p>
        </div>
        <ContributorFooter submission={submission} />
      </div>
    </div>
  );
}

/** Text on top, image on bottom */
function TextTopImageBottomPage({ submission, layout }: { submission: Submission; layout: PageLayout }) {
  const ratio = layout.customSplit?.ratio ?? 0.55;
  const imgUrl = submission.media_urls[0];
  const align = layout.textAlignment ?? 'left';

  return (
    <div className="flex h-full flex-col">
      {/* Text area */}
      <div className="flex flex-col p-5" style={{ flex: `0 0 ${(1 - ratio) * 100}%`, textAlign: align }}>
        <Divider className="my-2" />
        <p className="font-inter text-xs leading-relaxed text-muted-text">
          {submission.message}
        </p>
        <div className="mt-auto">
          <ContributorFooter submission={submission} />
        </div>
      </div>
      {/* Image area */}
      <div className="relative flex-1 overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: 'grayscale(8%) sepia(4%)' }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-stone-100">
            <span className="font-space-mono text-xs text-muted-text">[ No Image ]</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Side-by-side: image on left, text on right */
function SideBySideLeftPage({ submission, layout }: { submission: Submission; layout: PageLayout }) {
  const ratio = layout.customSplit?.ratio ?? 0.5;
  const imgUrl = submission.media_urls[0];
  const align = layout.textAlignment ?? 'left';

  return (
    <div className="flex h-full flex-row">
      {/* Image area */}
      <div className="relative overflow-hidden" style={{ flex: `0 0 ${ratio * 100}%` }}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: 'grayscale(8%) sepia(4%)' }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-stone-100">
            <span className="font-space-mono text-xs text-muted-text">[ No Image ]</span>
          </div>
        )}
      </div>
      {/* Text area */}
      <div className="flex flex-1 flex-col justify-between p-5" style={{ textAlign: align }}>
        <div>
          <PageTag>[ {submission.relation} ]</PageTag>
          <Divider className="my-2" />
          <p className="font-inter text-xs leading-relaxed text-muted-text">
            {submission.message}
          </p>
        </div>
        <ContributorFooter submission={submission} />
      </div>
    </div>
  );
}

/** Side-by-side: text on left, image on right */
function SideBySideRightPage({ submission, layout }: { submission: Submission; layout: PageLayout }) {
  const ratio = layout.customSplit?.ratio ?? 0.5;
  const imgUrl = submission.media_urls[0];
  const align = layout.textAlignment ?? 'left';

  return (
    <div className="flex h-full flex-row">
      {/* Text area */}
      <div className="flex flex-col justify-between p-5" style={{ flex: `0 0 ${(1 - ratio) * 100}%`, textAlign: align }}>
        <div>
          <PageTag>[ {submission.relation} ]</PageTag>
          <Divider className="my-2" />
          <p className="font-inter text-xs leading-relaxed text-muted-text">
            {submission.message}
          </p>
        </div>
        <ContributorFooter submission={submission} />
      </div>
      {/* Image area */}
      <div className="relative flex-1 overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: 'grayscale(8%) sepia(4%)' }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-stone-100">
            <span className="font-space-mono text-xs text-muted-text">[ No Image ]</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Text-only page with elegant typography */
function TextOnlyPage({ submission, layout }: { submission: Submission; layout: PageLayout }) {
  const align = layout.textAlignment ?? 'left';

  return (
    <div className="flex h-full flex-col justify-between p-8" style={{ textAlign: align }}>
      <div>
        <PageTag>[ {submission.relation} ]</PageTag>
        <Divider className="my-4" />
        {submission.message.length > 0 && (
          <h3 className="mb-4 font-playfair text-lg italic text-dark-text">
            &ldquo;{submission.message.slice(0, 140)}{submission.message.length > 140 ? '...' : ''}&rdquo;
          </h3>
        )}
        <p className="font-inter text-sm leading-relaxed text-muted-text">
          {submission.message}
        </p>
      </div>
      <ContributorFooter submission={submission} />
    </div>
  );
}

/** Renders a single contributor page based on their chosen template */
export function ContributorPage({ submission, layout }: { submission: Submission; layout: PageLayout }) {
  const template = layout.template;

  switch (template) {
    case 'full-image-caption':
      return <FullImageCaptionPage submission={submission} />;
    case 'image-top-text-bottom':
      return <ImageTopTextBottomPage submission={submission} layout={layout} />;
    case 'text-top-image-bottom':
      return <TextTopImageBottomPage submission={submission} layout={layout} />;
    case 'side-by-side-left':
      return <SideBySideLeftPage submission={submission} layout={layout} />;
    case 'side-by-side-right':
      return <SideBySideRightPage submission={submission} layout={layout} />;
    case 'text-only':
      return <TextOnlyPage submission={submission} layout={layout} />;
    case 'custom': {
      // Custom layout resolves to the closest standard layout based on split direction
      const dir = layout.customSplit?.direction ?? 'vertical';
      if (dir === 'horizontal') {
        return <SideBySideLeftPage submission={submission} layout={layout} />;
      }
      return <ImageTopTextBottomPage submission={submission} layout={layout} />;
    }
    default:
      return <ImageTopTextBottomPage submission={submission} layout={layout} />;
  }
}

export function BookSpread({ vault, submission, pageNumber, isCover, isBackCover }: BookSpreadProps) {
  const theme = vault.cover_theme || 'dark';
  const bgColor = theme === 'light' ? '#f4f1ec' : '#2b2b2a';
  const pageAllowance = vault.contributor_page_allowance ?? 1;

  if (isBackCover) {
    return (
      <div
        className="relative mx-auto aspect-square w-full max-w-xl overflow-hidden border border-border-light shadow-xl"
        style={{ backgroundColor: bgColor }}
      />
    );
  }

  if (isCover) {
    return (
      <div className="relative mx-auto aspect-square w-full max-w-xl overflow-hidden border border-border-light shadow-xl">
        <VaultCover
          missionaryName={vault.missionary_name}
          theme={theme}
          className="h-full w-full"
        />
      </div>
    );
  }

  const layout = resolveLayout(submission);

  // ── 2-page spread mode ──────────────────────────────────────────────────
  if (pageAllowance === 2 && submission) {
    const hasImages = submission.media_urls.length > 0;
    const secondImage = submission.media_urls[1] ?? submission.media_urls[0];

    return (
      <div className="relative mx-auto flex aspect-[2/1.3] w-full max-w-4xl overflow-hidden border border-border-light bg-white shadow-xl">
        {/* Binding crease */}
        <div className="absolute inset-y-0 left-1/2 z-10 w-px -translate-x-1/2 bg-border-light" />

        {/* Left Page — full-bleed image */}
        <div className="relative w-1/2 overflow-hidden">
          {hasImages ? (
            <img
              src={submission.media_urls[0]}
              alt=""
              className="h-full w-full object-cover"
              style={{ filter: 'grayscale(8%) sepia(4%)' }}
            />
          ) : (
            <div className="flex h-full flex-col justify-between bg-[#faf9f7] p-8">
              <div>
                <PageTag>[ {vault.missionary_name} ]</PageTag>
                <Divider className="my-4" />
                <h2 className="font-playfair text-2xl font-semibold text-dark-text">
                  {vault.mission_name || 'Mission Memory Vault'}
                </h2>
              </div>
              {pageNumber && <PageNumber num={pageNumber} />}
            </div>
          )}
          {/* Overlay contributor tag on image */}
          {hasImages && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6">
              <p className="font-space-mono text-[10px] uppercase tracking-widest text-white/80">
                [ {submission.relation} ]
              </p>
              <p className="mt-1 font-playfair text-lg font-semibold text-white">
                {submission.contributor_name}
              </p>
            </div>
          )}
        </div>

        {/* Right Page — text + optional second image */}
        <div className="relative flex w-1/2 flex-col justify-between border-l border-border-light p-8">
          <div className="flex-1 overflow-hidden">
            <PageTag>[ {submission.relation} ]</PageTag>
            <Divider className="my-3" />
            {submission.message.length > 0 && (
              <h3 className="mb-3 font-playfair text-lg italic text-dark-text">
                &ldquo;{submission.message.slice(0, 120)}{submission.message.length > 120 ? '...' : ''}&rdquo;
              </h3>
            )}
            <p className="font-inter text-sm leading-relaxed text-muted-text">
              {submission.message}
            </p>

            {/* Second image inline if available */}
            {submission.media_urls.length > 1 && (
              <div className="mt-4 overflow-hidden" style={{ maxHeight: '40%' }}>
                <img
                  src={secondImage}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ filter: 'grayscale(8%) sepia(4%)' }}
                />
              </div>
            )}
          </div>

          <div className="mt-3">
            <ContributorFooter submission={submission} />
            {pageNumber && <PageNumber num={pageNumber} />}
          </div>
        </div>
      </div>
    );
  }

  // ── Single page mode ────────────────────────────────────────────────────
  return (
    <div className="relative mx-auto aspect-[1/1.3] w-full max-w-xl overflow-hidden border border-border-light bg-white shadow-xl">
      {submission ? (
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-hidden">
            <ContributorPage submission={submission} layout={layout} />
          </div>
          {pageNumber && (
            <div className="px-5 pb-2">
              <PageNumber num={pageNumber} />
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-full flex-col justify-between p-8">
          <div>
            <PageTag>[ Mission Memory Vault ]</PageTag>
            <Divider className="my-4" />
            <h3 className="font-playfair text-xl text-dark-text">Stories of Service</h3>
          </div>
          {pageNumber && <PageNumber num={pageNumber} />}
        </div>
      )}
    </div>
  );
}
