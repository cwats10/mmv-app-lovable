/**
 * admin-actions: Edge function for admin-only operations.
 * Validates the caller is an admin before executing any action.
 *
 * Actions:
 *   - delete_user: Deletes a user from auth + cascading profile
 *   - reset_password: Sends a password reset email to a user
 *   - delete_vault: Deletes a vault and all associated data
 *   - finalize_vault: Sets all pending submissions to approved, creates a book if none exists
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    // Verify the caller is an admin
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user: caller } } = await anonClient.auth.getUser();
    if (!caller) throw new Error('Invalid token');

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Check admin status
    const { data: isAdmin } = await serviceClient.rpc('is_admin', { _user_id: caller.id });
    if (!isAdmin) throw new Error('Forbidden: admin access required');

    const { action, ...params } = await req.json();

    let result: Record<string, unknown> = { success: true };

    switch (action) {
      case 'delete_user': {
        const { user_id } = params;
        if (!user_id) throw new Error('user_id is required');
        // Delete from auth (cascade handles profiles)
        const { error } = await serviceClient.auth.admin.deleteUser(user_id);
        if (error) throw error;
        break;
      }

      case 'reset_password': {
        const { email } = params;
        if (!email) throw new Error('email is required');
        const siteUrl = Deno.env.get('SUPABASE_URL')!.replace('.supabase.co', '.lovable.app');
        const { error } = await serviceClient.auth.admin.generateLink({
          type: 'recovery',
          email,
          options: { redirectTo: `${siteUrl}/reset-password` },
        });
        if (error) throw error;
        result.message = `Password reset email sent to ${email}`;
        break;
      }

      case 'delete_vault': {
        const { vault_id } = params;
        if (!vault_id) throw new Error('vault_id is required');
        // Delete submissions first, then books, then vault
        await serviceClient.from('submissions').delete().eq('vault_id', vault_id);
        await serviceClient.from('books').delete().eq('vault_id', vault_id);
        const { error } = await serviceClient.from('vaults').delete().eq('id', vault_id);
        if (error) throw error;
        break;
      }

      case 'finalize_vault': {
        const { vault_id } = params;
        if (!vault_id) throw new Error('vault_id is required');

        // Approve all pending submissions
        await serviceClient
          .from('submissions')
          .update({ status: 'approved' })
          .eq('vault_id', vault_id)
          .eq('status', 'pending');

        // Create a book if one doesn't exist yet
        const { data: existingBooks } = await serviceClient
          .from('books')
          .select('id')
          .eq('vault_id', vault_id);

        if (!existingBooks || existingBooks.length === 0) {
          await serviceClient.from('books').insert({ vault_id });
        }

        result.message = 'Vault finalized: all submissions approved';
        break;
      }

      case 'toggle_admin': {
        const { user_id, is_admin } = params;
        if (!user_id) throw new Error('user_id is required');
        const newVal = is_admin === 'true';
        const { error } = await serviceClient
          .from('profiles')
          .update({ is_admin: newVal })
          .eq('id', user_id);
        if (error) throw error;
        result.message = `Admin ${newVal ? 'granted' : 'revoked'}`;
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('admin-actions error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
