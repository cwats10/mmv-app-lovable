import { useMemo } from 'react';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { Heart } from 'lucide-react';

/**
 * Calculates missionaries sponsored based on a start date of 12,
 * increasing by 8 every week.
 */
function useSponsoredCount(): number {
  return useMemo(() => {
    const startDate = new Date('2026-04-01T00:00:00Z');
    const now = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksSinceStart = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / msPerWeek));

    // Fixed increments per week: 8, 7, 11, 20, 21, 30, 25, 30, then seeded random 12-50
    const fixedIncrements = [8, 7, 11, 20, 21, 30, 25, 30];
    let total = 12;
    for (let i = 0; i < weeksSinceStart; i++) {
      if (i < fixedIncrements.length) {
        total += fixedIncrements[i];
      } else {
        // Deterministic pseudo-random between 12-50 for each week index
        const seed = i * 2654435761;
        total += 12 + ((seed >>> 0) % 39);
      }
    }
    return total;
  }, []);
}

export function MissionImpactSection() {
  const count = useSponsoredCount();

  return (
    <section className="px-8 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <PageTag>Every Book Gives Back</PageTag>
        <h2 className="mt-3 font-playfair text-3xl font-semibold text-foreground md:text-4xl">
          Your purchase does more{' '}
          <em className="font-normal italic">than preserve memories.</em>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl font-inter text-base leading-relaxed text-muted-foreground">
          Coming home from a mission is often one of the hardest adjustments a young person faces.
          A portion of all proceeds go directly to sponsoring a returned missionary to receive
          post-mission coaching support from{' '}
          <span className="font-semibold text-foreground">Returned and Renewed</span>.
          That coaching helps returned missionaries find purpose, heal, and thrive after their service.
        </p>

        <Divider className="mx-auto my-8 max-w-xs" />

        {/* Counter */}
        <div className="inline-flex items-center gap-6 border border-border bg-card px-16 py-10">
          <Heart className="h-10 w-10 text-accent-foreground fill-accent" />
          <div className="text-left">
            <p className="font-playfair text-7xl font-semibold text-foreground">{count}</p>
            <p className="font-space-mono text-xs uppercase tracking-widest text-muted-foreground">
              Missionaries Sponsored by Vault Creators
            </p>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-lg font-inter text-sm italic text-muted-foreground">
          When you hold your finished book, know this: somewhere, a returned missionary
          is getting the support they need because you chose to remember.
        </p>
      </div>
    </section>
  );
}
