/**
 * trigger-pipeline — Supabase Edge Function
 *
 * Orchestrates book production:
 *   1. Fetch book + vault from Supabase
 *   2. Fetch all approved submissions for this book
 *   3. Assemble the GoldenPayload (includes image_layout per page)
 *   4. Invoke the generate-pdf function → gets back { pdf_url }
 *   5. POST to Print-on-Demand API (Gelato / Blurb)
 *   6. Update book.status → 'printing', store pdf_url + pod_order_id
 *
 * Input: { book_id: string, book_inches?: number }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
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
    const { book_id, book_inches } = await req.json();
    if (!book_id) throw new Error('book_id is required');

    // ── 1. Fetch book + vault ─────────────────────────────────────────────────
    const { data: book, error: bookErr } = await supabase
      .from('books')
      .select('*, vaults(*)')
      .eq('id', book_id)
      .single();
    if (bookErr || !book) throw new Error('Book not found');

    const vault = book.vaults;

    // ── 2. Fetch approved submissions (ordered by page_order, then created_at) ─
    const { data: submissions, error: subErr } = await supabase
      .from('submissions')
      .select('*')
      .eq('book_id', book_id)
      .eq('status', 'approved')
      .order('page_order', { ascending: true, nullsFirst: false })
      .order('created_at');

    if (subErr) throw new Error(`Failed to fetch submissions: ${subErr.message}`);
    if (!submissions || submissions.length === 0) {
      throw new Error('No approved submissions found for this book.');
    }

    // ── 3. Assemble Golden Payload ────────────────────────────────────────────
    const serviceDates = [
      vault.mission_start
        ? new Date(vault.mission_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : '',
      vault.mission_end
        ? new Date(vault.mission_end).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Present',
    ]
      .filter(Boolean)
      .join(' — ');

    const coverPage = {
      page_number   : 1,
      template_type : 'cover' as const,
      content: {
        contributor_name: '',
        relation        : '',
        message         : '',
        image_urls      : vault.cover_image_url ? [vault.cover_image_url] : [],
      },
    };

    const contentPages = submissions.map((sub: Record<string, unknown>, i: number) => {
      const mediaUrls  = (sub.media_urls as string[]) ?? [];
      const hasImage   = mediaUrls.length > 0;
      // image_layout is stored as JSONB; default to 'bottom' when image present
      const imageLayout = (sub.image_layout as { position: string } | null) ?? (hasImage ? { position: 'bottom' } : null);
      // New page_layout from the enhanced template system
      const pageLayout = (sub.page_layout as Record<string, unknown> | null) ?? null;

      return {
        page_number   : i + 2,
        template_type : (hasImage ? 'standard_text_with_image' : 'standard_text_only') as
                          'standard_text_with_image' | 'standard_text_only',
        image_layout  : imageLayout,
        page_layout   : pageLayout,
        content: {
          contributor_name: sub.contributor_name as string,
          relation        : sub.relation as string,
          message         : sub.message as string,
          image_urls      : mediaUrls,
        },
      };
    });

    const bookSizeMap: Record<string, number> = { '10x10': 10, '12x12': 12 };
    const bookInches = bookSizeMap[vault.book_size] ?? 12;

    const goldenPayload = {
      book_id        : book.id,
      client_id      : vault.owner_id,
      missionary_name: vault.missionary_name,
      mission_name   : vault.mission_name,
      service_dates  : serviceDates,
      cover_image_url: vault.cover_image_url || '',
      cover_theme    : vault.cover_theme || 'dark',
      design_theme   : 'museum_archive_elegant',
      book_inches    : book_inches ?? bookInches,
      pages          : [coverPage, ...contentPages],
      pages          : [coverPage, ...contentPages],
      metadata: {
        total_pages     : contentPages.length + 1,
        vault_type      : vault.vault_type === 'pre' ? 'pre_mission' : 'post_mission',
        delivery_address: book.delivery_address || {},
      },
    };

    // ── 4. Generate PDF (internal function invocation) ────────────────────────
    const { data: pdfResult, error: pdfErr } = await supabase.functions.invoke(
      'generate-pdf',
      { body: goldenPayload },
    );

    if (pdfErr) throw new Error(`PDF generation failed: ${pdfErr.message}`);
    const pdfUrl: string | null = pdfResult?.pdf_url ?? null;

    // ── 5. Print-on-Demand API ────────────────────────────────────────────────
    //      Wire POD_API_URL + POD_API_KEY env vars when ready.
    const POD_API_URL = Deno.env.get('POD_API_URL');
    let podOrderId: string | null = null;

    if (POD_API_URL && pdfUrl) {
      const podRes = await fetch(POD_API_URL, {
        method : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization : `Bearer ${Deno.env.get('POD_API_KEY')}`,
        },
        body: JSON.stringify({
          ...goldenPayload,
          pdf_url: pdfUrl,
        }),
      });
      const podData = await podRes.json();
      podOrderId = podData.order_id ?? null;
    }

    // ── 6. Update book status ─────────────────────────────────────────────────
    await supabase
      .from('books')
      .update({
        status      : 'printing',
        pdf_url     : pdfUrl,
        pod_order_id: podOrderId,
      })
      .eq('id', book_id);

    return new Response(
      JSON.stringify({
        success       : true,
        pdf_url       : pdfUrl,
        pod_order_id  : podOrderId,
        page_count    : pdfResult?.page_count ?? contentPages.length + 2,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error) {
    console.error('trigger-pipeline error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    );
  }
});
