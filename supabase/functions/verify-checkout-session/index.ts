import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' });
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate the requesting user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const { session_id } = await req.json();
    if (!session_id) throw new Error('Missing session_id');

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed');
    }

    const book_id = session.metadata?.book_id;
    if (!book_id) throw new Error('Missing book_id in session metadata');

    // Verify the requesting user owns the vault that contains this book
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, vault_id, vaults(client_id)')
      .eq('id', book_id)
      .single();

    if (bookError || !book) throw new Error('Book not found');

    const clientId = (book.vaults as unknown as { client_id: string } | null)?.client_id;
    if (clientId !== user.id) throw new Error('Forbidden');

    // Upsert purchased status — idempotent with the stripe-webhook path
    await supabase
      .from('books')
      .update({
        status: 'purchased',
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('id', book_id);

    return new Response(JSON.stringify({ success: true, book_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
