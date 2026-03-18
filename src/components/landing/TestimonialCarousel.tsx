import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const TESTIMONIALS = [
  {
    quote:
      "My grandchildren will never get to meet the people their father served in Brazil. But now they'll know exactly who he was and why it mattered.",
    name: 'Patricia H.',
    relation: 'Mother of Elder Tyler H.',
    mission: 'Brazil Manaus Mission',
  },
  {
    quote:
      "When the book arrived, my son sat on the couch and read every page without saying a word. Then he looked up with tears and said, 'I didn't know they remembered me.'",
    name: 'Linda S.',
    relation: 'Mother of Elder Connor S.',
    mission: 'Philippines Cebu Mission',
  },
  {
    quote:
      "We gave it to her at homecoming. She opened it in front of the whole family and couldn't stop crying. It was the most meaningful gift we've ever given.",
    name: 'Robert & Karen W.',
    relation: 'Parents of Sister Emily W.',
    mission: 'Ghana Accra West Mission',
  },
  {
    quote:
      "I was a companion of his for six months. Writing my story for the vault brought back memories I didn't even know I still carried. His family deserved to read them.",
    name: 'Elder Davis M.',
    relation: 'Mission Companion',
    mission: 'Argentina Buenos Aires South Mission',
  },
];

export function TestimonialCarousel() {
  return (
    <section className="px-8 py-16">
      <div className="mx-auto max-w-3xl">
        <Carousel opts={{ loop: true }} className="relative">
          <CarouselContent>
            {TESTIMONIALS.map((t, i) => (
              <CarouselItem key={i}>
                <div className="border border-border-light bg-white p-10 text-center">
                  <PageTag>
                    {i === 0
                      ? "A Mother's Perspective"
                      : i === 3
                        ? "A Companion's Perspective"
                        : "A Family's Perspective"}
                  </PageTag>
                  <Divider className="my-5" />
                  <h2 className="font-playfair text-xl italic text-dark-text md:text-2xl">
                    "{t.quote}"
                  </h2>
                  <p className="mt-4 font-inter text-sm text-muted-text">
                    {t.name}, {t.relation}, {t.mission}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 -translate-x-1/2" />
          <CarouselNext className="right-0 translate-x-1/2" />
        </Carousel>
      </div>
    </section>
  );
}
