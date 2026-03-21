import { ContributorPage } from '@/components/book/BookSpread';
import type { PageLayout, Submission } from '@/types';

interface Props {
  layout: PageLayout;
  message: string;
  contributorName: string;
  relation: string;
  photoUrls: string[];
}

/**
 * Renders a live miniature preview of a contributor page using the actual
 * form data and chosen layout. Reuses the same ContributorPage renderer
 * that the book preview and PDF pipeline use, so what you see here is
 * exactly what will appear in the printed book.
 */
export function PagePreview({ layout, message, contributorName, relation, photoUrls }: Props) {
  // Build a mock Submission from current form state
  const mockSubmission: Submission = {
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

  return (
    <div>
      <p className="mb-2 font-space-mono text-[10px] uppercase tracking-widest text-muted-text">
        Live Preview
      </p>
      <div className="mx-auto overflow-hidden border border-border-light bg-white shadow-lg"
        style={{
          width: 280,
          aspectRatio: '1 / 1.3',
        }}
      >
        <div className="h-full w-full overflow-hidden">
          <ContributorPage submission={mockSubmission} layout={layout} />
        </div>
      </div>
    </div>
  );
}
