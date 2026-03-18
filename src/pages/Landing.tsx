import { Link } from 'react-router-dom';
import worldMap from '@/assets/world-map.png';
import { PublicShell } from '@/components/layout/PublicShell';
import { BookSpread } from '@/components/book/BookSpread';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { GridOverlay } from '@/components/common/GridOverlay';
import { TestimonialCarousel } from '@/components/landing/TestimonialCarousel';
import { MissionImpactSection } from '@/components/landing/MissionImpactSection';
import type { Vault, Submission } from '@/types';
import { ArrowRight } from 'lucide-react';

const DEMO_VAULT: Vault = {
  id: 'demo',
  created_at: '',
  owner_id: '',
  missionary_name: 'Elder James Mitchell',
  mission_name: 'Japan Tokyo North Mission',
  mission_start: '2022-03-01',
  mission_end: '2024-03-01',
  vault_type: 'post',
  submission_token: 'demo',
  cover_image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
};

const DEMO_SUBMISSION: Submission = {
  id: 'demo',
  created_at: '',
  vault_id: 'demo',
  book_id: 'demo',
  contributor_name: 'Margaret Mitchell',
  relation: 'Mother',
  message: 'We missed you every single day. But we knew you were exactly where you were meant to be. The letters you sent home were read aloud at Sunday dinner. Your little sister has memorized the one you wrote about the family you baptized in Sendai.',
  media_urls: [
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?auto=format&fit=crop&q=80&w=600',
  ],
  status: 'approved',
};

const STEPS = [
  {
    number: '01',
    title: 'Create Your Vault',
    body: 'Set up a mission memory vault for your missionary in minutes. Add their name, mission, and a cover photo.',
  },
  {
    number: '02',
    title: 'Share the Link',
    body: 'Send the unique link to family, friends, and mission companions. Anyone can contribute, no account needed.',
  },
  {
    number: '03',
    title: 'Hold the Book',
    body: 'Review every submission, approve the ones you love, and order a museum-quality printed book delivered to your door.',
  },
];

export default function Landing() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative px-8 py-24 text-center bg-white">
        <img
          src={worldMap}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-contain opacity-[0.3] grayscale"
        />
        <GridOverlay />
        <div className="relative z-10 mx-auto max-w-3xl">
          
          <h1 className="mt-4 font-playfair text-4xl font-semibold leading-tight text-dark-text md:text-5xl lg:text-6xl">
            Your child served.{' '}
            <em className="font-normal italic">The world felt it.</em>{' '}
            Now hold it forever.
          </h1>
          <p className="mt-6 font-inter text-base leading-relaxed text-muted-text md:text-lg">
            Journals collect dust. A Mission Memory Vault is read. Gather the stories of the lives your missionary touched, from the people who were there, and give your family a printed keepsake that will be treasured for generations.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <Link to="/auth?tab=signup">
              <HeirloomButton size="lg">
                Create Your Vault <ArrowRight className="ml-2 h-4 w-4" />
              </HeirloomButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Book Preview */}
      <section className="px-8 py-16">
        <div className="mx-auto max-w-4xl">
          <PageTag className="mb-4 block text-center">Museum-Grade Printed Book, 100% Heirloom Quality</PageTag>
          <BookSpread vault={DEMO_VAULT} submission={DEMO_SUBMISSION} isCover />
        </div>
      </section>

      {/* How It Works */}
      <section className="px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <PageTag>How It Works</PageTag>
          <h2 className="mt-3 font-playfair text-3xl font-semibold text-dark-text">
            Simple. Elegant. Priceless.
          </h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
          {STEPS.map(({ number, title, body }) => (
            <div key={number} className="border border-border-light bg-white p-6">
              <span className="font-space-mono text-3xl font-bold text-border-light">{number}</span>
              <Divider className="my-4" />
              <h3 className="font-playfair text-xl font-semibold text-dark-text">{title}</h3>
              <p className="mt-2 font-inter text-sm text-muted-text">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Impact */}
      <MissionImpactSection />

      {/* Testimonials */}
      <TestimonialCarousel />

      {/* Pricing */}
      <section className="px-8 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <PageTag>Pricing</PageTag>
          <h2 className="mt-3 font-playfair text-3xl font-semibold text-dark-text">
            Two tiers. Both unforgettable.
          </h2>
          <p className="mt-3 font-inter text-sm text-muted-text">
            Create your vault and collect stories for free. Purchase your book when you're ready, and we'll deliver a printed keepsake along with a digital PDF copy.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Standard */}
            <div className="border border-border-light bg-white p-8 text-left">
              <PageTag>Standard</PageTag>
              <p className="mt-2 font-playfair text-5xl font-semibold text-dark-text">$149</p>
              <Divider className="my-5" />
              <p className="font-inter text-sm text-muted-text">
                High-quality hardcover print
              </p>
              <ul className="mt-5 space-y-2">
                {[
                  'Unlimited story submissions',
                  'You approve every entry',
                  'High-quality printed hardcover',
                  'Digital PDF copy included',
                  'Delivered to your door',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 font-inter text-sm text-dark-text">
                    <span className="text-accent-gold">·</span> {item}
                  </li>
                ))}
              </ul>
              <Link to="/auth?tab=signup" className="mt-6 block">
                <HeirloomButton className="w-full" size="lg">
                  Get Started
                </HeirloomButton>
              </Link>
            </div>

            {/* Heirloom */}
            <div className="relative border-2 border-dark-text bg-dark-text p-8 text-left shadow-lg ring-1 ring-dark-text/5">
              <span className="absolute -top-3 right-6 bg-accent-gold px-3 py-0.5 font-space-mono text-[10px] uppercase tracking-widest text-white">
                Client's Choice
              </span>
              <PageTag className="text-stone-400">Heirloom</PageTag>
              <p className="mt-2 font-playfair text-5xl font-semibold text-white">$449</p>
              <Divider className="my-5 border-white/20" />
              <p className="font-inter text-sm text-stone-300">
                Vegan leather or fabric layflat book
              </p>
              <ul className="mt-5 space-y-2">
                {[
                  'Everything in Standard',
                  'Choose vegan leather or fabric cover',
                  'Layflat binding for full-spread photos',
                  'Museum-grade print quality',
                  'Digital PDF copy included',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 font-inter text-sm text-stone-200">
                    <span className="text-accent-gold">·</span> {item}
                  </li>
                ))}
              </ul>
              <Link to="/auth?tab=signup" className="mt-6 block">
                <HeirloomButton className="w-full border-white/20 bg-white text-dark-text hover:bg-stone-100" size="lg">
                  Get Started
                </HeirloomButton>
              </Link>
            </div>
          </div>

          <p className="mt-4 font-space-mono text-[10px] text-muted-text">
            No subscription. No hidden fees. Purchase before your book is created.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-8 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <PageTag>Begin Today</PageTag>
          <h2 className="mt-3 font-playfair text-3xl font-semibold text-dark-text md:text-4xl">
            The stories exist.{' '}
            <em className="font-normal italic">Don't let them disappear.</em>
          </h2>
          <p className="mt-4 font-inter text-base text-muted-text">
            Your missionary changed lives. The people who witnessed it want to share their stories. Give them a way to do that and give your family a book they'll read for generations.
          </p>
          <Link to="/auth?tab=signup" className="mt-8 inline-block">
            <HeirloomButton size="lg">
              Create Your Vault <ArrowRight className="ml-2 h-4 w-4" />
            </HeirloomButton>
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
