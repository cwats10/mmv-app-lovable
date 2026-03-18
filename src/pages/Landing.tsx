import { Link } from 'react-router-dom';
import { PublicShell } from '@/components/layout/PublicShell';
import { BookSpread } from '@/components/book/BookSpread';
import { PageTag } from '@/components/common/PageTag';
import { Divider } from '@/components/common/Divider';
import { HeirloomButton } from '@/components/common/HeirloomButton';
import { GridOverlay } from '@/components/common/GridOverlay';
import type { Vault, Submission } from '@/types';
import { ArrowRight, Shield, Clock, Heart } from 'lucide-react';

// Demo data for the BookSpread preview
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
  manager_token: 'demo',
  cover_image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
  archived_at: null,
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
  image_layout: { position: 'float-right' },
  archived_at: null,
};

const ONBOARDING_STEPS = [
  {
    number: '01',
    title: 'Answer 3 questions about your missionary',
    body: 'Name, mission, and a cover photo. Your vault is live in under 10 minutes.',
  },
  {
    number: '02',
    title: 'We generate your link and invite messages',
    body: 'Paste them into your ward group chat, Facebook, or family text. No account required for contributors.',
  },
  {
    number: '03',
    title: 'We handle reminders, layout, and print',
    body: 'Review and approve every memory. When you\'re ready, order. Your book arrives in about 3 weeks.',
  },
];

const BONUSES = [
  {
    title: 'Invite Kit for Moms',
    description: 'Ready-to-send scripts for texts, Facebook posts, ward chats, and emails. No figuring out what to say.',
    removes: 'Removes: "I don\'t know how to ask people."',
  },
  {
    title: 'Contributor Prompt Pack',
    description: 'Guided prompts built right into the contribution page — "How did they impact you?" "What\'s your favorite memory?" No one stares at a blank page.',
    removes: 'Removes: "I don\'t know what to write."',
  },
  {
    title: 'Welcome-Home Moment Guide',
    description: 'Four curated ideas for how to present the book — from a quiet moment after the homecoming talk to a slideshow at the reception.',
    removes: 'Removes: "How do I make this feel special?"',
  },
];

const GUARANTEES = [
  {
    icon: Clock,
    title: 'On-Time Farewell / Homecoming Promise',
    body: 'Order within our production window and we guarantee delivery before your milestone. If we miss it through any fault of ours, we upgrade you to our Heirloom edition at no extra cost.',
  },
  {
    icon: Heart,
    title: 'Full-Heart Book Promise',
    body: 'If fewer than 30 people have submitted when you\'re ready to print, contact us. We\'ll help you fill the remaining pages with mission photos, journal excerpts, and personalized prompts so the book never feels incomplete.',
  },
  {
    icon: Shield,
    title: 'Perfect Print Promise',
    body: 'If your book arrives damaged or has a print defect, we\'ll reprint and reship it — no questions, no return required.',
  },
];

export default function Landing() {
  return (
    <PublicShell>
      {/* Hero */}
 sync/from-main
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: '#f4f2ef', borderBottom: '1px solid #e0deda' }}
      >

      <section className="relative px-8 py-24 text-center bg-white">
        <img
          src={worldMap}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-contain opacity-[0.3] grayscale"
        />
 main
        <GridOverlay />
        <div className="relative z-10 max-w-5xl mx-auto px-8 py-28 flex flex-col items-start">
          <PageTag className="block mb-6">Heirloom Memory Books</PageTag>

          <h1
            className="font-playfair font-normal text-[#222222]"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              maxWidth: '18ch',
              marginBottom: '2rem',
            }}
          >
            A book that makes your missionary say,{' '}
            <em>"I had no idea."</em>
          </h1>

          <Divider className="mb-6" />

          <p
            className="text-[#555555] mb-4"
            style={{ fontSize: '1.05rem', lineHeight: 1.8, maxWidth: '50ch' }}
          >
            Every handmade memory collection we've helped create has ended in tears of gratitude.
            Now we've made that process push-button simple.
          </p>
          <p
            className="text-[#555555] mb-10"
            style={{ fontSize: '1.05rem', lineHeight: 1.8, maxWidth: '50ch' }}
          >
            No scrapbooking. No layout. No chasing people.{' '}
            <strong className="text-[#222222] font-normal">Set it up in 10 minutes. Book in your hands in 3 weeks. We do all of it.</strong>
          </p>

          <div className="flex items-center gap-4">
            <Link to="/auth?tab=signup">
              <HeirloomButton size="lg">
                Start Free — No Card Required <ArrowRight size={15} className="ml-2" />
              </HeirloomButton>
            </Link>
            <Link to="/auth" className="text-sm font-inter text-[#555555] hover:text-[#222222] transition-colors">
              Sign in
            </Link>
          </div>

          <p className="mt-5 font-space-mono text-xs text-[#555555] uppercase tracking-widest">
            Set up in 10 min · Contributors need no account · Book delivered in ~3 weeks
          </p>
        </div>
      </section>

      {/* Book Preview */}
      <section className="py-20 overflow-x-auto" style={{ backgroundColor: '#d1cfcb' }}>
        <div className="flex justify-center px-8">
          <div className="w-full overflow-x-auto flex justify-center">
            <BookSpread vault={DEMO_VAULT} submission={DEMO_SUBMISSION} pageNumber={2} />
          </div>
        </div>
        <p className="text-center mt-6 font-space-mono text-xs text-[#555555] uppercase tracking-widest">
          Museum-Grade Printed Book — 100% Heirloom Quality
        </p>
      </section>

      {/* How It Works — 3-step activation */}
      <section className="py-20" style={{ backgroundColor: '#f4f2ef', borderTop: '1px solid #e0deda' }}>
        <div className="max-w-5xl mx-auto px-8">
          <PageTag className="block mb-4 text-center">How It Works</PageTag>
          <h2
            className="font-playfair font-normal text-center text-[#222222] mb-4"
            style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}
          >
            Three steps. We carry the rest.
          </h2>
          <p className="text-center text-sm text-[#555555] mb-16" style={{ lineHeight: 1.8 }}>
            From your first click to book in hand, the whole process takes less time than you think.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ONBOARDING_STEPS.map(({ number, title, body }) => (
              <div key={number} className="flex flex-col">
                <span
                  className="font-playfair text-5xl text-[#e0deda] font-normal mb-4"
                  style={{ letterSpacing: '-0.04em' }}
                >
                  {number}
                </span>
                <h3 className="font-playfair text-xl font-normal text-[#222222] mb-3">{title}</h3>
                <Divider className="mb-4" />
                <p className="text-sm text-[#555555]" style={{ lineHeight: 1.8 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emotional callout */}
      <section className="py-20" style={{ backgroundColor: '#222222' }}>
        <div className="max-w-3xl mx-auto px-8 text-center">
          <PageTag className="block mb-6" style={{ color: '#e0deda' }}>
            A Mother's Perspective
          </PageTag>
          <h2
            className="font-playfair font-normal italic"
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
              lineHeight: 1.3,
              color: '#f4f2ef',
              marginBottom: '2rem',
            }}
          >
            "My grandchildren will never get to meet the people their father served in Brazil.{' '}
            But now they'll know exactly who he was — and why it mattered."
          </h2>
          <p className="font-space-mono text-xs uppercase tracking-widest" style={{ color: '#555555' }}>
            — Patricia H., Mother of Elder Tyler H., Brazil Manaus Mission
          </p>
        </div>
      </section>

      {/* Bonuses */}
      <section className="py-20" style={{ backgroundColor: '#f4f2ef', borderTop: '1px solid #e0deda' }}>
        <div className="max-w-5xl mx-auto px-8">
          <PageTag className="block mb-4 text-center">What's Included</PageTag>
          <h2
            className="font-playfair font-normal text-center text-[#222222] mb-4"
            style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}
          >
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-center text-sm text-[#555555] mb-16" style={{ lineHeight: 1.8 }}>
            Every vault comes with these tools to remove every obstacle between you and a complete book.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BONUSES.map(({ title, description, removes }) => (
              <div
                key={title}
                className="p-6 flex flex-col"
                style={{ border: '1px solid #e0deda', backgroundColor: '#ffffff' }}
              >
                <h3 className="font-playfair text-lg font-normal text-[#222222] mb-3">{title}</h3>
                <Divider className="mb-4" />
                <p className="text-sm text-[#555555] mb-4" style={{ lineHeight: 1.8 }}>{description}</p>
                <p
                  className="font-space-mono text-xs mt-auto pt-4"
                  style={{ color: '#555555', borderTop: '1px solid #e0deda' }}
                >
                  {removes}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-20" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e0deda' }}>
        <div className="max-w-5xl mx-auto px-8">
          <PageTag className="block mb-4 text-center">Our Promises</PageTag>
          <h2
            className="font-playfair font-normal text-center text-[#222222] mb-4"
            style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}
          >
            The risk is ours. Not yours.
          </h2>
          <p className="text-center text-sm text-[#555555] mb-16" style={{ lineHeight: 1.8 }}>
            We know what you're worried about. We've built a promise around every single one of those fears.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GUARANTEES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="p-6 flex flex-col"
                style={{ border: '1px solid #e0deda', backgroundColor: '#f4f2ef' }}
              >
                <Icon size={18} strokeWidth={1.5} className="text-[#555555] mb-4" />
                <h3 className="font-playfair text-lg font-normal text-[#222222] mb-3">{title}</h3>
                <Divider className="mb-4" />
                <p className="text-sm text-[#555555]" style={{ lineHeight: 1.8 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20" style={{ backgroundColor: '#f4f2ef', borderTop: '1px solid #e0deda' }}>
        <div className="max-w-4xl mx-auto px-8">
          <PageTag className="block mb-4 text-center">Pricing</PageTag>
          <h2
            className="font-playfair font-normal text-center text-[#222222] mb-4"
            style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}
          >
            Create free. Pay when you're ready to print.
          </h2>
          <Divider className="mx-auto my-6" />
          <p className="text-center text-sm text-[#555555] mb-12" style={{ lineHeight: 1.8 }}>
            Your vault and all contributions are free to collect, forever. You only pay when you order the printed book.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Classic */}
            <div className="p-8" style={{ border: '1px solid #e0deda', backgroundColor: '#ffffff' }}>
              <PageTag className="block mb-4">Classic</PageTag>
              <div
                className="font-playfair font-normal text-[#222222] mb-1"
                style={{ fontSize: '3.5rem', letterSpacing: '-0.03em', lineHeight: 1 }}
              >
                $149
              </div>
              <p className="text-xs text-[#555555] font-space-mono mb-6">Hardcover · Free shipping</p>
              <ul className="text-sm text-[#555555] space-y-2 mb-8" style={{ lineHeight: 1.8 }}>
                {[
                  'Unlimited story submissions',
                  'You approve every entry',
                  'High-resolution photo printing',
                  'Premium hardcover binding',
                  'Delivered in ~3 weeks',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[#222222] shrink-0">—</span> {item}
                  </li>
                ))}
              </ul>
              <Link to="/auth?tab=signup">
                <HeirloomButton variant="secondary" size="lg" className="w-full">
                  Start Free
                </HeirloomButton>
              </Link>
            </div>

            {/* Heirloom */}
            <div
              className="p-8 relative"
              style={{ border: '1.5px solid #222222', backgroundColor: '#ffffff' }}
            >
              <div
                className="absolute top-0 right-0 px-3 py-1 font-space-mono text-xs uppercase tracking-widest text-white"
                style={{ backgroundColor: '#222222' }}
              >
                Best
              </div>
              <PageTag className="block mb-4">Heirloom</PageTag>
              <div
                className="font-playfair font-normal text-[#222222] mb-1"
                style={{ fontSize: '3.5rem', letterSpacing: '-0.03em', lineHeight: 1 }}
              >
                $449
              </div>
              <p className="text-xs text-[#555555] font-space-mono mb-6">Premium lay-flat · Archival paper</p>
              <ul className="text-sm text-[#555555] space-y-2 mb-8" style={{ lineHeight: 1.8 }}>
                {[
                  'Everything in Classic',
                  'Premium lay-flat binding',
                  'Archival-grade paper stock',
                  'Gold foil spine detail',
                  'Delivered in ~3 weeks',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[#222222] shrink-0">—</span> {item}
                  </li>
                ))}
              </ul>
              <Link to="/auth?tab=signup">
                <HeirloomButton size="lg" className="w-full">
                  Start Free
                </HeirloomButton>
              </Link>
            </div>
          </div>

          <p className="text-center font-space-mono text-xs text-[#555555] uppercase tracking-widest">
            No subscription · No hidden fees · Invite Kit, Prompt Pack &amp; Reveal Guide included with every book
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="relative overflow-hidden py-24"
        style={{ backgroundColor: '#f4f2ef', borderTop: '1px solid #e0deda' }}
      >
        <GridOverlay />
        <div className="relative z-10 max-w-3xl mx-auto px-8 text-center">
          <PageTag className="block mb-4">Begin Today</PageTag>
          <h2
            className="font-playfair font-normal text-[#222222] mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
          >
            The stories exist.{' '}
            <em>Don't let them disappear.</em>
          </h2>
          <Divider className="mx-auto my-6" />
          <p className="text-sm text-[#555555] mb-4" style={{ lineHeight: 1.8 }}>
            Your missionary changed lives. The people who witnessed it want to share their stories. Give them a way — and give your family a book they'll read for generations.
          </p>
          <p className="font-space-mono text-xs text-[#555555] uppercase tracking-widest mb-10">
            Set up in 10 min · No card required · Book in your hands in ~3 weeks
          </p>
          <Link to="/auth?tab=signup">
            <HeirloomButton size="lg">
              Create Your Vault <ArrowRight size={15} className="ml-2" />
            </HeirloomButton>
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
