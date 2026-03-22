import { ContributorPage } from '@/components/book/BookSpread';
import type { PageLayout, Submission } from '@/types';

interface Props {
  layout: PageLayout;
  message: string;
  contributorName: string;
  relation: string;
  photoUrls: string[];
  pageAllowance?: 1 | 2;
  activePage?: 1 | 2;
  page2Layout?: PageLayout;
}

function buildMockSubmission(
  layout: PageLayout,
  message: string,
  contributorName: string,
  relation: string,
  photoUrls: string[],
): Submission {
  return {
    id: 'preview',
    created_at: new Date().toISOString(),
    vault_id: '',
    book_id: null,
    contributor_name: contributorName || 'Your Name',
    relation: relation || 'Relationship',
    message: message || 'Your memory will appear here...',
    media_urls: photoUrls,
    status: 'pending',
    page_order: null,
    page_layout: layout,
  };
}

export function PagePreview({
  layout,
  message,
  contributorName,
  relation,
  photoUrls,
  pageAllowance = 1,
  activePage = 1,
  page2Layout,
}: Props) {
  const isSpread = pageAllowance === 2;

  // Split message text between pages for spread mode
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

  // For spread mode, split images between pages
  const page1Photos = isSpread && photoUrls.length > 1
    ? photoUrls.slice(0, Math.ceil(photoUrls.length / 2))
    : photoUrls;
  const page2Photos = isSpread && photoUrls.length > 1
    ? photoUrls.slice(Math.ceil(photoUrls.length / 2))
    : [];

  if (isSpread) {
    const [msg1, msg2] = splitMessage(message);
    const mock1 = buildMockSubmission(layout, msg1, contributorName, relation, page1Photos);
    const effectivePage2Layout = page2Layout ?? { template: 'text-only' as const };
    const mock2 = buildMockSubmission(effectivePage2Layout, msg2, contributorName, relation, page2Photos);

    return (
      <div>
        <p className="mb-2 font-space-mono text-[10px] uppercase tracking-widest text-muted-text">
          Live Preview — Two-Page Spread
        </p>

        {/* Spread preview showing both pages */}
        <div
          className="mx-auto flex overflow-hidden border border-border-light bg-white shadow-lg"
          style={{ width: 480, aspectRatio: '2 / 1' }}
        >
          {/* Page 1 */}
          <div
            className="relative h-full overflow-hidden"
            style={{
              width: '50%',
              outline: activePage === 1 ? '2px solid #222' : 'none',
              outlineOffset: '-2px',
            }}
          >
            <ContributorPage submission={mock1} layout={layout} />
          </div>

          {/* Binding crease */}
          <div className="w-px bg-border-light" />

          {/* Page 2 */}
          <div
            className="relative h-full overflow-hidden"
            style={{
              width: '50%',
              outline: activePage === 2 ? '2px solid #222' : 'none',
              outlineOffset: '-2px',
            }}
          >
            <ContributorPage submission={mock2} layout={effectivePage2Layout} />
          </div>
        </div>

        {/* Page labels */}
        <div className="mt-1 flex justify-around">
          <span className="font-space-mono text-[9px] uppercase tracking-wider text-muted-text">
            Page 1{activePage === 1 ? ' (editing)' : ''}
          </span>
          <span className="font-space-mono text-[9px] uppercase tracking-wider text-muted-text">
            Page 2{activePage === 2 ? ' (editing)' : ''}
          </span>
        </div>
      </div>
    );
  }

  // Single page preview
  const mockSubmission = buildMockSubmission(layout, message, contributorName, relation, photoUrls);

  return (
    <div>
      <p className="mb-2 font-space-mono text-[10px] uppercase tracking-widest text-muted-text">
        Live Preview
      </p>
      <div className="mx-auto overflow-hidden border border-border-light bg-white shadow-lg"
        style={{
          width: 280,
          aspectRatio: '1 / 1',
        }}
      >
        <div className="h-full w-full overflow-hidden">
          <ContributorPage submission={mockSubmission} layout={layout} />
        </div>
      </div>
    </div>
  );
}
