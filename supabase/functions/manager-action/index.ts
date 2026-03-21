import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * manager-action Edge Function
 *
 * Handles all manager review operations. Uses the service role key so it
 * can bypass RLS — the manager_token is the trust boundary; every action
 * first validates that the supplied token maps to a real, active vault.
 *
 * Managers CAN:   approve / reject submissions
 * Managers CANNOT: purchase, finalize, change vault settings
 *
 * Actions:
 *   get-context      → { vault, book }
 *   list-submissions → { submissions[] }
 *   approve          → validates book is not locked, sets status=approved
 *   reject           → validates book is not locked, sets status=rejected
 */

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function ok(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}

function err(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

const LOCKED_STATUSES = ['purchased', 'printing', 'delivered'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, manager_token, submission_id } = await req.json();

    if (!manager_token) return err('manager_token is required', 401);

    // ── Validate manager token ───────────────────────────────────────────────
    const { data: vault, error: vaultErr } = await supabase
      .from('vaults')
      .select('id, missionary_name, mission_name, mission_start, mission_end, vault_type')
      .eq('manager_token', manager_token)
      .single();

    if (vaultErr || !vault) return err('Invalid or expired manager link', 403);

    // ── get-context ──────────────────────────────────────────────────────────
    if (action === 'get-context') {
      const { data: book } = await supabase
        .from('books')
        .select('id, status, locked_at')
        .eq('vault_id', vault.id)
        .single();

      return ok({ vault, book: book ?? null });
    }

    // ── list-submissions ─────────────────────────────────────────────────────
    if (action === 'list-submissions') {
      const { data: submissions } = await supabase
        .from('submissions')
        .select('*')
        .eq('vault_id', vault.id)
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      return ok({ submissions: submissions ?? [] });
    }

    // ── approve ──────────────────────────────────────────────────────────────
    if (action === 'approve') {
      if (!submission_id) return err('submission_id is required');

      const { data: book } = await supabase
        .from('books')
        .select('id, status')
        .eq('vault_id', vault.id)
        .single();

      if (!book) return err('Book not found');
      if (LOCKED_STATUSES.includes(book.status)) {
        return err('This edition has been finalized. New approvals are not possible for the current print run.');
      }

      const { error: updateErr } = await supabase
        .from('submissions')
        .update({ status: 'approved', book_id: book.id })
        .eq('id', submission_id)
        .eq('vault_id', vault.id); // guard: submission must belong to this vault

      if (updateErr) throw updateErr;
      return ok({ success: true });
    }

    // ── reject ───────────────────────────────────────────────────────────────
    if (action === 'reject') {
      if (!submission_id) return err('submission_id is required');

      const { data: book } = await supabase
        .from('books')
        .select('status')
        .eq('vault_id', vault.id)
        .single();

      if (!book) return err('Book not found');
      if (LOCKED_STATUSES.includes(book.status)) {
        return err('This edition has been finalized. Submission status cannot be changed.');
      }

      const { error: updateErr } = await supabase
        .from('submissions')
        .update({ status: 'rejected' })
        .eq('id', submission_id)
        .eq('vault_id', vault.id);

      if (updateErr) throw updateErr;
      return ok({ success: true });
    }

    // ── delete ───────────────────────────────────────────────────────────────
    if (action === 'delete') {
      if (!submission_id) return err('submission_id is required');

      const { error: deleteErr } = await supabase
        .from('submissions')
        .delete()
        .eq('id', submission_id)
        .eq('vault_id', vault.id);

      if (deleteErr) throw deleteErr;
      return ok({ success: true });
    }

    return err(`Unknown action: ${action}`);
  } catch (e: unknown) {
    return err((e as Error).message ?? 'Internal server error', 500);
  }
});
