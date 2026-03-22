import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { VaultCover } from '@/components/vault/VaultCover';
import { ImageGallery } from '@/components/submission/ImageGallery';
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

/** Image area — shows gallery for multiple images, single image for one, or placeholder */
function ImageArea({ submission, layout }: { submission: Submission; layout?: PageLayout }) {
  const urls = submission.media_urls;
  const position = layout?.imagePosition ?? 'center';

  if (urls.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-stone-100">
        <span className="font-space-mono text-xs text-muted-text">[ No Image ]</span>
      </div>
    );
  }

  return <ImageGallery imageUrls={urls} imagePosition={position} />;
}

/** Full-bleed image with a caption bar at the bottom */
function FullImageCaptionPage({ submission, layout }: { submission: Submission; layout: PageLayout }) {
  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden" style={{ flexBasis: '78%' }}>
        <ImageArea submission={submission} layout={layout} />
      </div>
      <div className="flex flex-col gap-1 p-3" style={{ flexBasis: '22%' }}>
        <div className="flex-1 overflow-y-auto">
          <p className="font-inter text-xs leading-relaxed text-muted-text">
            {submission.message}
          </p>
        </div>
        <ContributorFooter submission={submission} />
      </div>
    </div>
  );
}

/** Image on top, text on bottom */
function ImageTopTextBottomPage({ submission, layout }: { submission: Submission; layout: PageLayout }) {
  const ratio = layout.customSplit?.ratio ?? 0.45;
  const align = layout.textAlignment ?? 'left';

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 overflow-hidden" style={{ flex: `0 0 ${ratio * 100}%` }}>
        <ImageArea submission={submission} layout={layout} />
      </div>
      <div className="flex flex-1 flex-col justify-between overflow-y-auto p-3" style={{ textAlign: align }}>
        <div>
          <Divider className="my-1" />
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
  const ratio = layout.customSplit?.ratio ?? 0.45;
  const align = layout.textAlignment ?? 'left';

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col overflow-y-auto p-3" style={{ flex: `0 0 ${(1 - ratio) * 100}%`, textAlign: align }}>
        <Divider className="my-1" />
        <p className="font-inter text-xs leading-relaxed text-muted-text">
          {submission.message}
        </p>
        <div className="mt-auto">
          <ContributorFooter submission={submission} />
        </div>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <ImageArea submission={submission} layout={layout} />
      </div>
    </div>
  );
}

/** Side-by-side: image on left, text on right */
function SideBySideLeftPage({ submission, layout }: { submission: Submission; layout: PageLayout }) {
  const ratio = layout.customSplit?.ratio ?? 0.5;
  const align = layout.textAlignment ?? 'left';

  return (
    <div className="flex h-full flex-row">
      <div className="relative overflow-hidden" style={{ flex: `0 0 ${ratio * 100}%` }}>
        <ImageArea submission={submission} layout={layout} />
      </div>
      <div className="flex flex-1 flex-col justify-between overflow-y-auto p-3" style={{ textAlign: align }}>
        <div>
          <Divider className="my-1" />
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
  const align = layout.textAlignment ?? 'left';

  return (
    <div className="flex h-full flex-row">
      <div className="flex flex-col justify-between overflow-y-auto p-3" style={{ flex: `0 0 ${(1 - ratio) * 100}%`, textAlign: align }}>
        <div>
          <Divider className="my-1" />
          <p className="font-inter text-xs leading-relaxed text-muted-text">
            {submission.message}
          </p>
        </div>
        <ContributorFooter submission={submission} />
      </div>
      <div className="relative flex-1 overflow-hidden">
        <ImageArea submission={submission} layout={layout} />
      </div>
    </div>
  );
}

/** Text-only page with elegant typography */
function TextOnlyPage({ submission, layout }: { submission: Submission; layout: PageLayout }) {
  const align = layout.textAlignment ?? 'left';

  return (
    <div className="flex h-full flex-col justify-between p-4" style={{ textAlign: align }}>
      <div className="flex-1 overflow-y-auto">
        <Divider className="my-1" />
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
      return <FullImageCaptionPage submission={submission} layout={layout} />;
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
  // Only render as spread if allowance is 2 AND submission has spreadPage2 layout data
  const hasSpreadData = !!layout.spreadPage2;
  if (pageAllowance === 2 && submission && hasSpreadData) {
    // Resolve layouts for each page
    const layout1 = layout;
    const layout2 = layout.spreadPage2 ?? { template: 'text-only' as const };

    // Split images between pages
    const page1Images = submission.media_urls.length <= 1
      ? submission.media_urls
      : submission.media_urls.slice(0, Math.ceil(submission.media_urls.length / 2));
    const page2Images = submission.media_urls.length <= 1
      ? []
      : submission.media_urls.slice(Math.ceil(submission.media_urls.length / 2));

    // Split message text between pages (by paragraph, then by midpoint)
    const splitMessage = (msg: string): [string, string] => {
      const paragraphs = msg.split(/\n\n+/);
      if (paragraphs.length >= 2) {
        const mid = Math.ceil(paragraphs.length / 2);
        return [paragraphs.slice(0, mid).join('\n\n'), paragraphs.slice(mid).join('\n\n')];
      }
      const charMid = Math.ceil(msg.length / 2);
      const spaceIdx = msg.indexOf(' ', charMid);
      const breakAt = spaceIdx > -1 ? spaceIdx : charMid;
      return [msg.slice(0, breakAt), msg.slice(breakAt).trimStart()];
    };

    const [msg1, msg2] = splitMessage(submission.message);

    const page1Submission: Submission = { ...submission, media_urls: page1Images, message: msg1 };
    const page2Submission: Submission = { ...submission, media_urls: page2Images.length > 0 ? page2Images : [], message: msg2 };

    return (
      <div className="relative mx-auto flex aspect-[2/1] w-full max-w-4xl overflow-hidden border border-border-light bg-white shadow-xl">
        {/* Binding crease */}
        <div className="absolute inset-y-0 left-1/2 z-10 w-px -translate-x-1/2 bg-border-light" />

        {/* Left Page */}
        <div className="relative w-1/2 overflow-hidden">
          <ContributorPage submission={page1Submission} layout={layout1} />
        </div>

        {/* Right Page */}
        <div className="relative w-1/2 overflow-hidden border-l border-border-light">
          <ContributorPage submission={page2Submission} layout={layout2} />
        </div>
      </div>
    );
  }

  // ── Single page mode ────────────────────────────────────────────────────
  return (
    <div className="relative mx-auto aspect-square w-full max-w-xl overflow-hidden border border-border-light bg-white shadow-xl">
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
