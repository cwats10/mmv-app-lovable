import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' });
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Pricing (cents) ──────────────────────────────────────────────────────────
const PRICE_CENTS = {
  classic : { base: 14900, extra: 9900  },
  heirloom: { base: 44900, extra: 34900 },
} as const;

type Tier = 'classic' | 'heirloom';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')!;
    const token      = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error('Unauthorized');

    const { book_id, design_tier = 'classic', extra_copies = 0 } = await req.json();
    const tier        = (PRICE_CENTS[design_tier as Tier] ? design_tier : 'classic') as Tier;
    const extraCount  = Math.max(0, Math.min(20, Number(extra_copies) || 0));

    // ── Fetch book + profile ────────────────────────────────────────────────
    const { data: book }    = await supabase.from('books').select('*, vaults(*)').eq('id', book_id).single();
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!book) throw new Error('Book not found');

    // ── Stripe customer ─────────────────────────────────────────────────────
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email   : user.email,
        name    : profile?.name ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    // ── Build line items ────────────────────────────────────────────────────
    const tierName  = tier === 'classic' ? 'Classic' : 'Heirloom';
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        quantity   : 1,
        price_data : {
          currency    : 'usd',
          unit_amount : PRICE_CENTS[tier].base,
          product_data: {
            name       : `Memory Vault — ${tierName} Edition`,
            description: `Museum-quality hardcover Memory Book for ${book.vaults?.missionary_name ?? 'your missionary'}`,
          },
        },
      },
    ];

    if (extraCount > 0) {
      lineItems.push({
        quantity   : extraCount,
        price_data : {
          currency    : 'usd',
          unit_amount : PRICE_CENTS[tier].extra,
          product_data: {
            name       : `${tierName} Edition — Additional Copy`,
            description: 'Identical copy of this order. Same design, same print run.',
          },
        },
      });
    }

    // ── Reward credit discount ──────────────────────────────────────────────
    const subtotalCents    = PRICE_CENTS[tier].base + PRICE_CENTS[tier].extra * extraCount;
    const rewardBalance    = profile?.reward_balance ?? 0;
    const discountCents    = Math.min(Math.round(rewardBalance * 100), subtotalCents);
    let   discounts: Stripe.Checkout.SessionCreateParams['discounts'];

    if (discountCents > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: discountCents,
        currency  : 'usd',
        duration  : 'once',
        name      : 'Referral Credit',
        metadata  : { supabase_user_id: user.id },
      });
      discounts = [{ coupon: coupon.id }];
    }

    // ── Stripe Checkout session ─────────────────────────────────────────────
    const origin  = req.headers.get('origin') || Deno.env.get('SITE_URL') || 'http://localhost:5173';
    const session = await stripe.checkout.sessions.create({
      customer    : customerId,
      mode        : 'payment',
      line_items  : lineItems,
      ...(discounts ? { discounts } : {}),
      metadata    : {
        book_id,
        user_id                 : user.id,
        design_tier             : tier,
        extra_copies            : String(extraCount),
        discount_applied_cents  : String(discountCents),
      },
      success_url : `${origin}/checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url  : `${origin}/dashboard/vault/${book.vaults?.id}/book/${book_id}`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status : 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    );
  }
});
