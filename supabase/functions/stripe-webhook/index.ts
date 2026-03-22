import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' });
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')!);
  } catch (err: unknown) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, { status: 400 });
  }

  switch (event.type) {
    // ── Successful checkout ───────────────────────────────────────────────
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const book_id = session.metadata?.book_id;

      if (book_id) {
        const userId             = session.metadata?.user_id;
        const discountApplied    = parseInt(session.metadata?.discount_applied_cents ?? '0', 10);

        // Mark book as purchased
        const { data: book } = await supabase
          .from('books')
          .update({
            status: 'purchased',
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq('id', book_id)
          .select('vault_id')
          .single();

        // Deduct the reward credit that was applied at checkout (prevent double-use)
        if (discountApplied > 0 && userId) {
          await supabase.rpc('increment_reward_balance', {
            uid  : userId,
            delta: -(discountApplied / 100),
          });
        }

        // Credit $20 referral rewards on first book purchase by the referred user
        if (book?.vault_id) {
          const { data: vault } = await supabase
            .from('vaults')
            .select('owner_id')
            .eq('id', book.vault_id)
            .single();

          if (vault?.owner_id) {
            const { data: referral } = await supabase
              .from('referrals')
              .select('id, referrer_id')
              .eq('referred_user_id', vault.owner_id)
              .eq('status', 'converted')
              .single();

            if (referral) {
              await Promise.all([
                supabase.rpc('increment_reward_balance', { uid: referral.referrer_id, delta: 20 }),
                supabase.rpc('increment_reward_balance', { uid: vault.owner_id, delta: 20 }),
              ]);
              await supabase
                .from('referrals')
                .update({ status: 'rewarded', reward_amount: 20 })
                .eq('id', referral.id);
            }
          }
        }
      }
      break;
    }

    // ── Refund issued — reset book to review ──────────────────────────────
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntent = charge.payment_intent as string | null;

      if (paymentIntent) {
        await supabase
          .from('books')
          .update({ status: 'review' })
          .eq('stripe_payment_intent_id', paymentIntent);
      }
      break;
    }

    // ── Payment failed — log for observability ────────────────────────────
    case 'charge.failed': {
      const charge = event.data.object as Stripe.Charge;
      console.error('[stripe-webhook] charge.failed', {
        charge_id       : charge.id,
        payment_intent  : charge.payment_intent,
        failure_code    : charge.failure_code,
        failure_message : charge.failure_message,
        amount          : charge.amount,
        customer        : charge.customer,
      });
      break;
    }

    // ── Dispute opened — flag the book ────────────────────────────────────
    case 'charge.dispute.created': {
      const dispute = event.data.object as Stripe.Dispute;
      const paymentIntent = dispute.payment_intent as string | null;

      if (paymentIntent) {
        await supabase
          .from('books')
          .update({ status: 'disputed' })
          .eq('stripe_payment_intent_id', paymentIntent);
      }
      console.error('[stripe-webhook] charge.dispute.created', {
        dispute_id     : dispute.id,
        payment_intent : paymentIntent,
        amount         : dispute.amount,
        reason         : dispute.reason,
      });
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
