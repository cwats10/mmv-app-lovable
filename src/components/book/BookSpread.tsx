import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { VaultCover } from '@/components/vault/VaultCover';
import type { Submission, Vault } from '@/types';

interface BookSpreadProps {
  vault: Vault;
  submission?: Submission;
  pageNumber?: number;
  isCover?: boolean;
  isBackCover?: boolean;
}

export function BookSpread({ vault, submission, pageNumber, isCover }: BookSpreadProps) {
  if (isCover) {
    return (
      <div className="relative mx-auto aspect-square w-full max-w-xl overflow-hidden border border-border-light shadow-xl">
        <VaultCover
          missionaryName={vault.missionary_name}
          theme={vault.cover_theme || 'dark'}
          bleedSafe
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex aspect-[2/1.3] w-full max-w-4xl overflow-hidden border border-border-light bg-white shadow-xl">

      {/* Binding crease */}
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border-light" />

      {/* Left Page */}
      <div className="relative flex w-1/2 flex-col justify-between p-8">
        <div>
          <PageTag>[ {vault.missionary_name} ]</PageTag>
          <Divider className="my-4" />
          <h2 className="font-playfair text-2xl font-semibold text-dark-text">
            {vault.mission_name || 'Mission Memory Vault'}
          </h2>
          <p className="mt-3 font-inter text-sm leading-relaxed text-muted-text">
            {submission?.message?.slice(0, 120) + '…'}
          </p>
        </div>

        {pageNumber && (
          <div className="mt-4">
            <Divider />
            <p className="mt-2 font-space-mono text-[10px] text-muted-text">
              {String(pageNumber).padStart(2, '0')}
            </p>
          </div>
        )}
      </div>

      {/* Right Page */}
      <div className="relative flex w-1/2 flex-col justify-between border-l border-border-light p-8">
        {submission ? (
          <>
            <div>
              <PageTag>[ {submission.relation} ]</PageTag>
              <Divider className="my-4" />
              <h3 className="font-playfair text-lg italic text-dark-text">
                "{submission.message.slice(0, 140)}{submission.message.length > 140 ? '…' : ''}"
              </h3>
              <p className="mt-3 font-inter text-sm leading-relaxed text-muted-text">
                {submission.message}
              </p>
            </div>

            {submission.media_urls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {submission.media_urls.slice(0, 2).map((url, i) => (
                  <div key={i} className="aspect-square overflow-hidden">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 border-t border-border-light pt-3">
              <p className="font-playfair text-sm font-semibold text-dark-text">
                {submission.contributor_name}
              </p>
              <p className="font-space-mono text-[10px] uppercase tracking-wider text-muted-text">
                {submission.relation}
              </p>
            </div>
          </>
        ) : (
          <div>
            <PageTag>[ Mission Memory Vault ]</PageTag>
            <Divider className="my-4" />
            <h3 className="font-playfair text-xl text-dark-text">Stories of Service</h3>
          </div>
        )}
      </div>
    </div>
  );
}
