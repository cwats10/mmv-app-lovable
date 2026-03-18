import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HeirloomButton } from '@/components/common/HeirloomButton';

import inviteContributorsImg from '@/assets/onboarding/invite-contributors.png';
import reviewQueueImg from '@/assets/onboarding/review-queue.png';
import vaultPendingImg from '@/assets/onboarding/vault-pending.png';
import memoriesPreservedImg from '@/assets/onboarding/memories-preserved.png';
import messageBankImg from '@/assets/onboarding/message-bank.png';

// ── Step definitions ─────────────────────────────────────────────────────────

type Position = 'center' | 'below' | 'right';

interface TourStep {
  title: string;
  body: string;
  /** data-tour attribute on the element to highlight. Omit for centered steps. */
  target?: string;
  position?: Position;
  /** Label for the primary button on the very last step. */
  cta?: string;
  /** Optional image(s) to show inside the card for contextless steps. */
  image?: string | string[];
}

const STEPS: TourStep[] = [
  {
    title: 'Welcome to Memory Vault',
    body:
      "You're about to build something that will last generations. This quick tour walks you through how the vault works, from the very first contribution all the way to a printed heirloom book.",
  },
  {
    title: 'Start Here: Create a Vault',
    body:
      "A vault holds everything for one missionary. Give them a name, add the mission, and set the dates. Each vault gets its own contribution link and review queue, living right here on your dashboard.",
    target: 'new-vault-btn',
    position: 'below',
  },
  {
    title: 'Invite Contributors',
    body:
      "Share your vault's unique contribution link with anyone. No account required. Each person writes their memory, uploads a photo, and drags it to where they'd like it placed on the page. It arrives in your review queue automatically.",
    image: inviteContributorsImg,
  },
  {
    title: 'Review, Approve, and Delegate',
    body:
      "Approve the memories you want in the book; reject the ones that don't fit. Need help? Share the manager link with someone you trust. They can curate submissions, but only you can purchase and finalize the book.",
    image: [vaultPendingImg, reviewQueueImg],
  },
  {
    title: 'Memories Are Never Lost',
    body:
      "Contributions are preserved forever. Once a book is printed, late arrivals queue automatically for the next edition. The vault stays open for years, and nothing is ever deleted.",
    image: memoriesPreservedImg,
  },
  {
    title: 'Your Vaults',
    body:
      "All your vaults live here, one click from anywhere in the app. You can manage multiple missionaries from a single account, each with its own contributors, queue, and book.",
    target: 'nav-vaults',
    position: 'right',
  },
  {
    title: 'Referrals',
    body:
      "Know other families preparing a missionary? Share your referral code from the Referrals page. When they create an account, you both earn a reward toward a future book.",
    target: 'nav-referrals',
    position: 'right',
  },
  {
    title: 'Message Bank',
    body:
      "Need help spreading the word? The Message Bank gives you ready-to-send messages for text, email, Facebook, Instagram, and ward announcements — personalized for each vault. Just pick a tab, copy, and paste.",
    image: messageBankImg,
  },
  {
    title: "You're Ready",
    body:
      "When the memories are in and you've approved the ones you want, finalize the book and we'll print and ship it to your door. The vault stays open, so the next edition is always waiting.",
    cta: 'Create My First Vault',
  },
];

// ── Positioning ──────────────────────────────────────────────────────────────

const CARD_W       = 380;
const CARD_W_IMAGE = 620;
const OFFSET = 20;
const PAD    = 8;

function getWrapperStyle(step: TourStep, rect: DOMRect | null): React.CSSProperties {
  if (!rect || !step.position || step.position === 'center') {
    return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (step.position === 'below') {
    const rawLeft = rect.left + rect.width / 2 - CARD_W / 2;
    return {
      left: Math.max(16, Math.min(rawLeft, vw - CARD_W - 16)),
      top:  Math.min(rect.bottom + OFFSET, vh - 340),
    };
  }

  if (step.position === 'right') {
    return {
      left: Math.min(rect.right + OFFSET, vw - CARD_W - 16),
      top:  Math.max(16, Math.min(rect.bottom + 10, vh - 340)),
    };
  }

  return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
}

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  /** Called when the user completes or skips the tour. */
  onComplete: () => void;
  /** Called additionally when the user clicks the final CTA button. */
  onCreateVault?: () => void;
}

export function OnboardingTour({ onComplete, onCreateVault }: Props) {
  const [step, setStep]       = useState(0);
  const [rect, setRect]       = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  // ── Measure target element ──────────────────────────────────────────────
  useEffect(() => {
    if (!current.target) {
      setRect(null);
      return;
    }
    const measure = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${current.target}"]`);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [step, current.target]);

  // ── Fade-in card on each step ──────────────────────────────────────────
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, [step]);

  // ── Handlers ────────────────────────────────────────────────────────────
  function next() {
    if (isLast) {
      onComplete();
      onCreateVault?.();
    } else {
      setStep((s) => s + 1);
    }
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  const wrapperStyle = getWrapperStyle(current, rect);

  return createPortal(
    <>
      {/* Dark backdrop */}
      <div
        style={{
          position:        'fixed',
          inset:           0,
          backgroundColor: 'rgba(34,34,34,0.72)',
          zIndex:          9997,
        }}
      />

      {/* Spotlight ring around target */}
      {rect && (
        <div
          style={{
            position:  'fixed',
            left:      rect.left  - PAD,
            top:       rect.top   - PAD,
            width:     rect.width  + PAD * 2,
            height:    rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(34,34,34,0.72)',
            border:    '1.5px solid rgba(255,255,255,0.18)',
            borderRadius: 4,
            zIndex:    9998,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Card wrapper (handles fixed positioning) */}
      <div style={{ position: 'fixed', zIndex: 9999, pointerEvents: 'none', ...wrapperStyle }}>

        {/* Inner card (handles fade-in; never overrides the wrapper's transform) */}
        <div
          style={{
            width:           CARD_W,
            backgroundColor: '#ffffff',
            border:          '1px solid #e0deda',
            boxShadow:       '0 24px 64px rgba(0,0,0,0.28)',
            padding:         '2rem',
            pointerEvents:   'all',
            opacity:         visible ? 1 : 0,
            transform:       visible ? 'translateY(0)' : 'translateY(10px)',
            transition:      'opacity 0.22s ease, transform 0.22s ease',
          }}
        >
          {/* Step counter */}
          <span
            style={{
              display:       'block',
              fontFamily:    '"Space Mono", monospace',
              fontSize:      '0.65rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         '#555555',
              marginBottom:  '0.75rem',
            }}
          >
            {step + 1} &nbsp;/&nbsp; {STEPS.length}
          </span>

          {/* Title */}
          <h2
            style={{
              fontFamily:   '"Playfair Display", serif',
              fontSize:     '1.5rem',
              fontWeight:   400,
              color:        '#222222',
              lineHeight:   1.2,
              marginBottom: '0.75rem',
            }}
          >
            {current.title}
          </h2>

          {/* Divider */}
          <div
            style={{
              height:          1,
              backgroundColor: '#e0deda',
              margin:          '0.875rem 0 1rem',
            }}
          />

          {/* Optional image(s) */}
          {current.image && (
            <div
              style={{
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: Array.isArray(current.image) ? 'row' : 'column',
                gap: Array.isArray(current.image) ? '6px' : 0,
              }}
            >
              {(Array.isArray(current.image) ? current.image : [current.image]).map(
                (src, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      borderRadius: 6,
                      overflow: 'hidden',
                      border: '1px solid #e0deda',
                    }}
                  >
                    <img
                      src={src}
                      alt={`${current.title} ${idx + 1}`}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                ),
              )}
            </div>
          )}

          {/* Body */}
          <p
            style={{
              fontFamily:   '"Inter", sans-serif',
              fontSize:     '0.875rem',
              color:        '#555555',
              lineHeight:   1.85,
              marginBottom: '1.75rem',
            }}
          >
            {current.body}
          </p>

          {/* Progress dots (clickable for quick navigation) */}
          <div
            style={{
              display:      'flex',
              gap:          '6px',
              alignItems:   'center',
              marginBottom: '1.5rem',
            }}
          >
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                title={`Step ${i + 1}`}
                style={{
                  width:           i === step ? 22 : 7,
                  height:          7,
                  borderRadius:    4,
                  backgroundColor: i === step ? '#222222' : '#e0deda',
                  border:          'none',
                  cursor:          'pointer',
                  padding:         0,
                  transition:      'width 0.25s ease, background-color 0.2s ease',
                  flexShrink:      0,
                }}
              />
            ))}
          </div>

          {/* Actions */}
          <div
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Skip (hidden on last step) */}
            <button
              onClick={onComplete}
              style={{
                fontFamily:    '"Space Mono", monospace',
                fontSize:      '0.65rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color:         '#555555',
                background:    'none',
                border:        'none',
                cursor:        'pointer',
                padding:       0,
                visibility:    isLast ? 'hidden' : 'visible',
              }}
            >
              Skip Tour
            </button>

            {/* Back + Next/CTA */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {step > 0 && (
                <HeirloomButton variant="secondary" size="sm" onClick={back}>
                  ← Back
                </HeirloomButton>
              )}
              <HeirloomButton variant="primary" size="sm" onClick={next}>
                {isLast ? (current.cta ?? 'Get Started') : 'Next →'}
              </HeirloomButton>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
