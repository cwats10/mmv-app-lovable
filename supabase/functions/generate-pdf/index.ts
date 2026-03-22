/**
 * generate-pdf — Supabase Edge Function
 *
 * Produces a press-ready PDF for a Memory Vault memory book.
 *
 * ── Print spec ─────────────────────────────────────────────────────────────
 *   Book size  : 11 × 11 inch square (configurable via payload.book_inches)
 *   Bleed      : 0.125" per side   (industry standard)
 *   Safe margin: 0.5"  from trim edge (so 0.625" from PDF edge)
 *   PDF page   : (11 + 2×0.125) × 72 = 810 × 810 pt  [includes bleed]
 *   Content box: 810 − 2×(0.625×72) = 720 × 720 pt
 *
 *   Vector text & shapes render at the printer's native DPI (typically 1200 Dpi).
 *   Raster images are embedded at their original pixel resolution; contributors
 *   should upload images ≥ 1500 px wide for clean 5.5" print reproduction.
 *
 * ── Background fill ─────────────────────────────────────────────────────────
 *   Backgrounds flood-fill the entire 810×810 page so colour reaches into the
 *   bleed zone — no white slivers at the trim edge.
 *
 * ── Fonts ───────────────────────────────────────────────────────────────────
 *   Playfair Display (Regular + Italic + Bold) fetched from Google Fonts CDN.
 *   Space Mono Regular fetched from Google Fonts CDN.
 *   Helvetica / Helvetica-Bold used as built-in PDF fallback.
 *
 * ── Output ──────────────────────────────────────────────────────────────────
 *   Uploads PDF bytes to Supabase Storage (bucket: book-pdfs).
 *   Returns { pdf_url, page_count }.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  PDFDocument,
  rgb,
  StandardFonts,
  type PDFFont,
  type PDFImage,
  type PDFPage,
  type Color,
} from 'https://esm.sh/pdf-lib@1.17.1';

// ─── Dimension constants ────────────────────────────────────────────────────

const PT = 72;                     // points per inch

function dims(bookIn: number) {
  const bleedIn  = 0.125;
  const safeIn   = 0.5;            // from trim edge
  const pagePt   = Math.round((bookIn + 2 * bleedIn) * PT);  // e.g. 810 for 11"
  const bleedPt  = Math.round(bleedIn * PT);                   // 9
  const safePt   = Math.round((bleedIn + safeIn) * PT);        // 45
  const contSize = pagePt - 2 * safePt;                        // 720
  return { pagePt, bleedPt, safePt, contSize };
}

// ─── Colors ──────────────────────────────────────────────────────────────────

const C = {
  cream   : rgb(0.957, 0.945, 0.925),  // #f4f1ec
  white   : rgb(1,     1,     1    ),
  dark    : rgb(0.169, 0.169, 0.165),  // #2b2b2a
  mid     : rgb(0.333, 0.333, 0.333),  // #555555
  light   : rgb(0.878, 0.871, 0.855),  // #e0deda
  warmGray: rgb(0.820, 0.812, 0.800),  // #d1cfcb
  gold    : rgb(0.906, 0.820, 0.573),  // #E7D192
};

// ─── CORS ────────────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Font helpers ─────────────────────────────────────────────────────────────

/** Fetch a Google Font as a TTF Uint8Array by requesting with an old UA (forces TTF). */
async function fetchGoogleFont(
  family: string,
  weight: number,
  italic = false,
): Promise<Uint8Array | null> {
  try {
    const ital = italic ? 'ital,' : '';
    const wt   = italic ? `1,${weight}` : `${weight}`;
    const url  = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:${ital}wght@${wt}`;
    const css  = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)' },
    }).then((r) => r.text());

    // CSS will contain a src line with a .ttf URL when served to old UA
    const match = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+\.ttf)\)/);
    if (!match) return null;

    const bytes = await fetch(match[1]).then((r) => r.arrayBuffer());
    return new Uint8Array(bytes);
  } catch {
    return null;
  }
}

// ─── Image helpers ────────────────────────────────────────────────────────────

async function embedImageFromUrl(pdfDoc: PDFDocument, url: string): Promise<PDFImage | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());

    // Detect by magic bytes
    const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8;
    const isPng  = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E;

    if (isJpeg) return await pdfDoc.embedJpg(bytes);
    if (isPng)  return await pdfDoc.embedPng(bytes);

    // Try both as fallback (some services strip headers)
    try { return await pdfDoc.embedJpg(bytes); } catch (_) { /* ignore */ }
    try { return await pdfDoc.embedPng(bytes); } catch (_) { /* ignore */ }
    return null;
  } catch {
    return null;
  }
}

/**
 * Scale an image to fit within a bounding box while preserving aspect ratio.
 * Returns { x, y, width, height } centred in the box.
 */
function scaleToFit(
  img: PDFImage,
  boxW: number,
  boxH: number,
  anchorX: number,
  anchorY: number,  // bottom-left of the box (pdf-lib y-up)
): { x: number; y: number; width: number; height: number } {
  const { width: iW, height: iH } = img;
  const scale = Math.min(boxW / iW, boxH / iH);
  const w = iW * scale;
  const h = iH * scale;
  return {
    x: anchorX + (boxW - w) / 2,
    y: anchorY + (boxH - h) / 2,
    width: w,
    height: h,
  };
}

// ─── Text helpers ─────────────────────────────────────────────────────────────

/** Word-wrap text to fit within maxWidth at given font + size. */
function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const words  = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current  = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      // Handle a single word longer than maxWidth by character-splitting
      if (font.widthOfTextAtSize(word, size) > maxWidth) {
        let partial = '';
        for (const ch of word) {
          if (font.widthOfTextAtSize(partial + ch, size) <= maxWidth) {
            partial += ch;
          } else {
            if (partial) lines.push(partial);
            partial = ch;
          }
        }
        current = partial;
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Draw wrapped text, returning the y position after the last line. */
function drawWrappedText(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  lineHeight: number,
  x: number,
  yStart: number,   // top of first baseline (y-down logic: we subtract each line)
  maxWidth: number,
  color: Color = C.mid,
): number {
  const lines = wrapText(text, font, size, maxWidth);
  let y = yStart;
  for (const line of lines) {
    page.drawText(line, { x, y, size, font, color });
    y -= lineHeight;
  }
  return y;  // y position after last line
}

// ─── Page background ──────────────────────────────────────────────────────────

function fillBackground(page: PDFPage, pagePt: number, color: Color) {
  page.drawRectangle({ x: 0, y: 0, width: pagePt, height: pagePt, color });
}

/** Draw a subtle horizontal grid (editorial texture) on cream pages. */
function drawCreamGrid(page: PDFPage, pagePt: number, safePt: number, contSize: number) {
  const spacing = 18;  // pt between lines
  const linesCount = Math.ceil(contSize / spacing) + 1;
  for (let i = 0; i <= linesCount; i++) {
    const y = safePt + i * spacing;
    if (y > pagePt) break;
    page.drawLine({
      start     : { x: 0, y },
      end       : { x: pagePt, y },
      thickness : 0.2,
      color     : C.dark,
      opacity   : 0.04,
    });
  }
}

/** Draw a thin horizontal rule line. */
function drawRule(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  color: Color = C.light,
  thickness = 0.5,
) {
  page.drawLine({ start: { x, y }, end: { x: x + width, y }, thickness, color });
}

// ─── Page number ──────────────────────────────────────────────────────────────

function drawPageNumber(
  page: PDFPage,
  pageNum: number,
  pagePt: number,
  safePt: number,
  font: PDFFont,
) {
  const label = String(pageNum).padStart(2, '0');
  const size  = 7;
  const w     = font.widthOfTextAtSize(label, size);
  page.drawText(label, {
    x: (pagePt - w) / 2,
    y: safePt - 20,           // 20pt below the safe boundary (inside bleed)
    size,
    font,
    color: C.light,
  });
}

// ─── Small caps label ─────────────────────────────────────────────────────────

function drawLabel(
  page: PDFPage,
  text: string,
  font: PDFFont,
  x: number,
  y: number,
  color: Color = C.mid,
) {
  page.drawText(text.toUpperCase(), { x, y, size: 7, font, color });
}

// ─── Image grid helper ────────────────────────────────────────────────────

/**
 * Draw multiple images in a grid layout within a bounding box.
 * 1 image: full area. 2: side by side. 3: 1 large left + 2 stacked right.
 * 4: 2×2 grid. 5: 3 top + 2 bottom. 6: 3×2 grid.
 */
function drawImageGrid(
  page: PDFPage,
  images: PDFImage[],
  boxW: number,
  boxH: number,
  anchorX: number,
  anchorY: number,
) {
  if (images.length === 0) return;
  const gap = 6;

  if (images.length === 1) {
    const fit = scaleToFit(images[0], boxW, boxH, anchorX, anchorY);
    page.drawImage(images[0], fit);
    return;
  }

  if (images.length === 2) {
    const slotW = (boxW - gap) / 2;
    for (let i = 0; i < 2; i++) {
      const x = anchorX + i * (slotW + gap);
      const fit = scaleToFit(images[i], slotW, boxH, x, anchorY);
      page.drawImage(images[i], fit);
    }
    return;
  }

  if (images.length === 3) {
    // Left half: 1 large image. Right half: 2 stacked
    const leftW = (boxW - gap) / 2;
    const rightW = (boxW - gap) / 2;
    const fit0 = scaleToFit(images[0], leftW, boxH, anchorX, anchorY);
    page.drawImage(images[0], fit0);

    const slotH = (boxH - gap) / 2;
    for (let i = 0; i < 2; i++) {
      const y = anchorY + (1 - i) * (slotH + gap);
      const fit = scaleToFit(images[i + 1], rightW, slotH, anchorX + leftW + gap, y);
      page.drawImage(images[i + 1], fit);
    }
    return;
  }

  if (images.length === 4) {
    // 2×2 grid
    const slotW = (boxW - gap) / 2;
    const slotH = (boxH - gap) / 2;
    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = anchorX + col * (slotW + gap);
      const y = anchorY + (1 - row) * (slotH + gap);
      const fit = scaleToFit(images[i], slotW, slotH, x, y);
      page.drawImage(images[i], fit);
    }
    return;
  }

  if (images.length === 5) {
    // Top row: 3, bottom row: 2
    const slotH = (boxH - gap) / 2;
    const topSlotW = (boxW - 2 * gap) / 3;
    for (let i = 0; i < 3; i++) {
      const x = anchorX + i * (topSlotW + gap);
      const fit = scaleToFit(images[i], topSlotW, slotH, x, anchorY + slotH + gap);
      page.drawImage(images[i], fit);
    }
    const botSlotW = (boxW - gap) / 2;
    for (let i = 0; i < 2; i++) {
      const x = anchorX + i * (botSlotW + gap);
      const fit = scaleToFit(images[3 + i], botSlotW, slotH, x, anchorY);
      page.drawImage(images[3 + i], fit);
    }
    return;
  }

  // 6 images: 3×2 grid
  const slotW = (boxW - 2 * gap) / 3;
  const slotH = (boxH - gap) / 2;
  const count = Math.min(images.length, 6);
  for (let i = 0; i < count; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = anchorX + col * (slotW + gap);
    const y = anchorY + (1 - row) * (slotH + gap);
    const fit = scaleToFit(images[i], slotW, slotH, x, y);
    page.drawImage(images[i], fit);
  }
}

// ─── Cover page ───────────────────────────────────────────────────────────────

async function drawCoverPage(
  page: PDFPage,
  pagePt: number,
  _safePt: number,
  _contSize: number,
  pdfDoc: PDFDocument,
  fonts: FontSet,
  payload: GoldenPayload,
) {
  const isLight = payload.cover_theme === 'light';
  const bgColor = isLight ? C.cream : C.dark;
  const textColor = isLight ? C.dark : C.cream;

  // Flood-fill entire page (including bleed)
  fillBackground(page, pagePt, bgColor);

  // Fetch DM Serif Display for cover
  let coverFont: PDFFont = fonts.serif;
  const dmSerifBytes = await fetchGoogleFont('DM Serif Display', 400);
  if (dmSerifBytes) {
    coverFont = await pdfDoc.embedFont(dmSerifBytes);
  }

  const cx = pagePt / 2; // centre x

  // ── "Mission Memory Vault" brand text ────────────────────────────────────
  const brandText = 'Mission Memory Vault';
  const brandSize = 44;
  const brandW = coverFont.widthOfTextAtSize(brandText, brandSize);
  const brandY = pagePt / 2 + 30;

  page.drawText(brandText, {
    x: cx - brandW / 2,
    y: brandY,
    size: brandSize,
    font: coverFont,
    color: textColor,
  });

  // ── Gold divider line ────────────────────────────────────────────────────
  const lineW = pagePt * 0.35;
  const lineY = brandY - 24;
  page.drawLine({
    start: { x: cx - lineW / 2, y: lineY },
    end: { x: cx + lineW / 2, y: lineY },
    thickness: 1,
    color: C.gold,
  });

  // ── Missionary name ──────────────────────────────────────────────────────
  const nameSize = 22;
  const nameLines = wrapText(payload.missionary_name, coverFont, nameSize, pagePt * 0.7);
  let nameY = lineY - 30;
  for (const line of nameLines) {
    const lineW2 = coverFont.widthOfTextAtSize(line, nameSize);
    page.drawText(line, {
      x: cx - lineW2 / 2,
      y: nameY,
      size: nameSize,
      font: coverFont,
      color: textColor,
    });
    nameY -= nameSize * 1.3;
  }
}

// ─── Content pages ────────────────────────────────────────────────────────────

interface FontSet {
  serif     : PDFFont;  // Playfair Display Regular
  serifItal : PDFFont;  // Playfair Display Italic
  serifBold : PDFFont;  // Playfair Display Bold or Helvetica-Bold fallback
  mono      : PDFFont;  // Space Mono Regular
  body      : PDFFont;  // Helvetica (body / fallback)
  bodyBold  : PDFFont;  // Helvetica-Bold
}

/** Render a single contributor page. Returns nothing (mutates page). */
async function drawContentPage(
  page: PDFPage,
  pagePt: number,
  safePt: number,
  contSize: number,
  pdfDoc: PDFDocument,
  fonts: FontSet,
  pdfPage: GoldenPage,
  pageNumber: number,
) {
  // White background, full bleed
  fillBackground(page, pagePt, C.white);

  const cx   = safePt;
  const cTop = pagePt - safePt;

  const BODY_SIZE   = 12;             // 12pt ≈ 4mm — matches app char limits
  const BODY_LH     = BODY_SIZE * 1.65; // ~19.8pt leading
  const PULL_SIZE   = 26;
  const PULL_LH     = PULL_SIZE * 1.25;
  const LABEL_SIZE  = 7;
  const LABEL_LH    = LABEL_SIZE * 2;

  const { contributor_name, relation, message, image_urls } = pdfPage.content;
  const { position, ratio: splitRatio } = resolveEffectivePosition(pdfPage);

  // Load all images
  const allImages: PDFImage[] = [];
  for (const url of image_urls) {
    const embedded = await embedImageFromUrl(pdfDoc, url);
    if (embedded) allImages.push(embedded);
  }
  const img: PDFImage | null = allImages[0] ?? null;

  // Pull quote: first complete sentence or first ~90 chars
  const sentenceEnd = message.search(/[.!?]/);
  const pullText = sentenceEnd > 20 && sentenceEnd < 160
    ? message.slice(0, sentenceEnd + 1)
    : message.slice(0, Math.min(90, message.length)) + (message.length > 90 ? '…' : '');

  // ── Attribution footer (always at bottom, drawn last so we reserve space) ────
  const attribHeight = 30;  // reserved for attribution line
  const footerY      = safePt + attribHeight;  // baseline of content above footer

  function drawAttribution() {
    drawRule(page, cx, footerY, contSize, C.light, 0.4);
    page.drawText(contributor_name, {
      x: cx, y: safePt + 12, size: 11, font: fonts.serifBold, color: C.dark,
    });
    const relW = fonts.mono.widthOfTextAtSize(relation.toUpperCase(), LABEL_SIZE);
    page.drawText(relation.toUpperCase(), {
      x: cx + contSize - relW, y: safePt + 14, size: LABEL_SIZE, font: fonts.mono, color: C.mid,
    });
  }

  // Available content height (above footer)
  const availH = cTop - footerY;

  // ── Relation label + rule at top ──────────────────────────────────────────────
  function drawTopLabel(yStart: number): number {
    // Cream pill / label background
    const labelText = `[ ${relation} ]`;
    const labelW    = fonts.mono.widthOfTextAtSize(labelText, LABEL_SIZE) + 10;
    page.drawRectangle({ x: cx, y: yStart - 14, width: labelW, height: 14, color: C.cream });
    page.drawText(labelText.toUpperCase(), { x: cx + 5, y: yStart - 11, size: LABEL_SIZE, font: fonts.mono, color: C.mid });
    drawRule(page, cx, yStart - 18, contSize, C.light);
    return yStart - 26;  // returns y below the label+rule
  }

  // ── Layout: FULL IMAGE + CAPTION ─────────────────────────────────────────────
  if (img && position === 'full-image') {
    const imgH = Math.round(availH * splitRatio);
    const imgBoxY = cTop - imgH;

    // Draw all images in a grid (no cropping)
    drawImageGrid(page, allImages, contSize, imgH, cx, imgBoxY);

    // Caption area below
    let y = imgBoxY - 8;
    drawLabel(page, `[ ${relation} ]`, fonts.mono, cx, y, C.mid);
    y -= 16;

    // Compact message (caption style)
    const captionText = message.length > 300 ? message.slice(0, 297) + '…' : message;
    drawWrappedText(page, captionText, fonts.body, BODY_SIZE, BODY_LH, cx, y, contSize, C.mid);
    drawAttribution();
    drawPageNumber(page, pageNumber, pagePt, safePt, fonts.mono);
    return;
  }

  // ── Layout: NO IMAGE ─────────────────────────────────────────────────────────
  if (!img || position === 'none') {
    let y = drawTopLabel(cTop);
    y -= 8;

    // Pull quote
    const pullLines = wrapText(pullText, fonts.serifItal, PULL_SIZE, contSize);
    for (const line of pullLines) {
      page.drawText(`"${line}"`, { x: cx, y, size: PULL_SIZE, font: fonts.serifItal, color: C.dark });
      y -= PULL_LH;
    }
    y -= 16;

    // Body text
    drawWrappedText(page, message, fonts.body, BODY_SIZE, BODY_LH, cx, y, contSize, C.mid);
    drawAttribution();
    drawPageNumber(page, pageNumber, pagePt, safePt, fonts.mono);
    return;
  }

  // ── Layout: TOP ──────────────────────────────────────────────────────────────
  if (position === 'top') {
    const imgH    = Math.round(availH * splitRatio);
    const imgBoxY = cTop - imgH;

    // Draw images in a grid in the image area
    drawImageGrid(page, allImages, contSize, imgH, cx, imgBoxY);

    let y = imgBoxY - 6;
    y = drawTopLabel(y);
    y -= 8;

    const pullLines = wrapText(`"${pullText}"`, fonts.serifItal, PULL_SIZE, contSize);
    for (const line of pullLines) {
      page.drawText(line, { x: cx, y, size: PULL_SIZE, font: fonts.serifItal, color: C.dark });
      y -= PULL_LH;
    }
    y -= 14;
    drawWrappedText(page, message, fonts.body, BODY_SIZE, BODY_LH, cx, y, contSize, C.mid);
    drawAttribution();
    drawPageNumber(page, pageNumber, pagePt, safePt, fonts.mono);
    return;
  }

  // ── Layout: BOTTOM ───────────────────────────────────────────────────────────
  if (position === 'bottom') {
    // Reserve image space at bottom
    const imgH     = Math.round(availH * splitRatio);
    const imgGap   = 8;

    let y = cTop;
    y = drawTopLabel(y);
    y -= 8;

    // Pull quote
    const pullLines = wrapText(`"${pullText}"`, fonts.serifItal, PULL_SIZE, contSize);
    for (const line of pullLines) {
      page.drawText(line, { x: cx, y, size: PULL_SIZE, font: fonts.serifItal, color: C.dark });
      y -= PULL_LH;
    }
    y -= 14;
    drawWrappedText(page, message, fonts.body, BODY_SIZE, BODY_LH, cx, y, contSize, C.mid);

    // Images at bottom (grid layout for all images)
    const imgAreaY  = footerY + imgGap;
    drawImageGrid(page, allImages, contSize, imgH, cx, imgAreaY);

    drawAttribution();
    drawPageNumber(page, pageNumber, pagePt, safePt, fonts.mono);
    return;
  }

  // ── Layout: CENTER ───────────────────────────────────────────────────────────
  if (position === 'center') {
    const imgH    = Math.round(availH * 0.36);
    const imgW    = Math.round(contSize * 0.7);
    const imgX    = cx + (contSize - imgW) / 2;

    // First block of text
    const firstWords = message.split(/\s+/).slice(0, 40).join(' ');
    const restWords  = message.split(/\s+/).slice(40).join(' ');

    let y = cTop;
    y = drawTopLabel(y);
    y -= 10;

    // First text block
    y = drawWrappedText(page, firstWords, fonts.body, BODY_SIZE, BODY_LH, cx, y, contSize, C.mid);
    y -= 14;

    // Images (centred, constrained to imgW × imgH)
    const imgBotY = y - imgH;
    drawImageGrid(page, allImages, imgW, imgH, imgX, imgBotY);
    y = imgBotY - 14;

    // Rest of text
    if (restWords) {
      drawWrappedText(page, restWords, fonts.body, BODY_SIZE, BODY_LH, cx, y, contSize, C.mid);
    }

    drawAttribution();
    drawPageNumber(page, pageNumber, pagePt, safePt, fonts.mono);
    return;
  }

  // ── Layout: FLOAT-LEFT / FLOAT-RIGHT ─────────────────────────────────────────
  if (position === 'float-left' || position === 'float-right') {
    const isLeft   = position === 'float-left';
    const imgW     = Math.round(contSize * splitRatio);
    const imgH     = Math.round(availH  * 0.65);
    const imgGap   = 16;
    const txtColW  = contSize - imgW - imgGap;

    const imgX = isLeft ? cx : cx + contSize - imgW;
    const txtX = isLeft ? cx + imgW + imgGap : cx;

    // Images placed from top of content area
    const imgBotY = cTop - imgH;
    drawImageGrid(page, allImages, imgW, imgH, imgX, imgBotY);

    // Draw top label spanning full width
    let y = cTop;
    y = drawTopLabel(y);
    y -= 10;

    // Pull quote in the narrow column beside the image
    const pullWrapped = wrapText(`"${pullText}"`, fonts.serifItal, 18, txtColW);
    for (const line of pullWrapped) {
      if (y < imgBotY - 4) break;  // out of image zone — switch to full width below
      page.drawText(line, { x: txtX, y, size: 18, font: fonts.serifItal, color: C.dark });
      y -= 18 * 1.3;
    }
    y -= 10;

    // Body text: narrow column while still in image zone
    const wordsArr = message.split(/\s+/).filter(Boolean);
    let wordIdx = 0;

    // Phase 1: narrow column (beside image)
    while (y > imgBotY - 4 && wordIdx < wordsArr.length) {
      // Build one line
      let line = '';
      while (wordIdx < wordsArr.length) {
        const candidate = line ? `${line} ${wordsArr[wordIdx]}` : wordsArr[wordIdx];
        if (fonts.body.widthOfTextAtSize(candidate, BODY_SIZE) <= txtColW) {
          line = candidate;
          wordIdx++;
        } else break;
      }
      if (line) {
        page.drawText(line, { x: txtX, y, size: BODY_SIZE, font: fonts.body, color: C.mid });
        y -= BODY_LH;
      } else {
        // Single word too wide — force it
        if (wordIdx < wordsArr.length) {
          page.drawText(wordsArr[wordIdx], { x: txtX, y, size: BODY_SIZE, font: fonts.body, color: C.mid });
          wordIdx++;
          y -= BODY_LH;
        }
      }
    }

    // Phase 2: full width below image
    if (wordIdx < wordsArr.length && y > footerY + 10) {
      y = Math.min(y, imgBotY - 8);  // align to just below image
      const remaining = wordsArr.slice(wordIdx).join(' ');
      drawWrappedText(page, remaining, fonts.body, BODY_SIZE, BODY_LH, cx, y, contSize, C.mid);
    }

    drawAttribution();
    drawPageNumber(page, pageNumber, pagePt, safePt, fonts.mono);
    return;
  }

  // Fallback: text-only layout
  let y = drawTopLabel(cTop);
  y -= 8;
  const pullLines = wrapText(`"${pullText}"`, fonts.serifItal, PULL_SIZE, contSize);
  for (const line of pullLines) {
    page.drawText(line, { x: cx, y, size: PULL_SIZE, font: fonts.serifItal, color: C.dark });
    y -= PULL_LH;
  }
  y -= 14;
  drawWrappedText(page, message, fonts.body, BODY_SIZE, BODY_LH, cx, y, contSize, C.mid);
  drawAttribution();
  drawPageNumber(page, pageNumber, pagePt, safePt, fonts.mono);
}

// ─── Back cover ───────────────────────────────────────────────────────────────

function drawBackCover(
  page: PDFPage,
  pagePt: number,
  safePt: number,
  contSize: number,
  fonts: FontSet,
  missionaryName: string,
) {
  fillBackground(page, pagePt, C.cream);
  drawCreamGrid(page, pagePt, safePt, contSize);

  const cx   = safePt;
  const cTop = pagePt - safePt;

  // Centred vertical alignment
  const centerY = pagePt / 2;

  drawRule(page, cx, centerY + 40, contSize, C.light, 0.5);

  page.drawText('Memory Vault', {
    x    : cx + contSize / 2 - fonts.serif.widthOfTextAtSize('Memory Vault', 22) / 2,
    y    : centerY + 12,
    size : 22,
    font : fonts.serif,
    color: C.dark,
  });
  page.drawText('Heirloom Memory Books', {
    x    : cx + contSize / 2 - fonts.mono.widthOfTextAtSize('Heirloom Memory Books', 8) / 2,
    y    : centerY - 6,
    size : 8,
    font : fonts.mono,
    color: C.mid,
  });

  drawRule(page, cx, centerY - 20, contSize, C.light, 0.5);

  const tagline = `A collection of memories for ${missionaryName}`;
  const tagW    = fonts.mono.widthOfTextAtSize(tagline, 7.5);
  page.drawText(tagline, {
    x    : cx + contSize / 2 - tagW / 2,
    y    : safePt + 20,
    size : 7.5,
    font : fonts.mono,
    color: C.light,
  });
}

// ─── Type definitions for payload ─────────────────────────────────────────────

interface ImageLayout { position: 'top' | 'float-left' | 'float-right' | 'center' | 'bottom' | 'none'; }

type PageTemplate =
  | 'full-image-caption'
  | 'image-top-text-bottom'
  | 'text-top-image-bottom'
  | 'side-by-side-left'
  | 'side-by-side-right'
  | 'text-only'
  | 'custom';

interface PageLayout {
  template       : PageTemplate;
  customSplit?   : { direction: 'horizontal' | 'vertical'; ratio: number };
  imagePosition? : string;
  textAlignment? : 'left' | 'center' | 'right';
}

interface GoldenPage {
  page_number   : number;
  template_type : 'cover' | 'standard_text_only' | 'standard_text_with_image';
  image_layout? : ImageLayout;
  page_layout?  : PageLayout;
  content: {
    contributor_name: string;
    relation        : string;
    message         : string;
    image_urls      : string[];
  };
}

interface GoldenPayload {
  book_id          : string;
  missionary_name  : string;
  mission_name     : string;
  service_dates    : string;
  cover_image_url  : string;
  cover_theme      : 'light' | 'dark';
  pages            : GoldenPage[];
  book_inches?     : number;  // optional override; defaults to 12
}

/**
 * Resolve the effective image position from the new page_layout or legacy image_layout.
 * Also returns a split ratio for custom layouts.
 */
function resolveEffectivePosition(
  pdfPage: GoldenPage,
): { position: string; ratio: number } {
  const pl = pdfPage.page_layout;
  if (pl) {
    const ratio = pl.customSplit?.ratio ?? 0.5;
    switch (pl.template) {
      case 'full-image-caption':       return { position: 'full-image', ratio: 0.78 };
      case 'image-top-text-bottom':    return { position: 'top', ratio };
      case 'text-top-image-bottom':    return { position: 'bottom', ratio };
      case 'side-by-side-left':        return { position: 'float-left', ratio };
      case 'side-by-side-right':       return { position: 'float-right', ratio };
      case 'text-only':                return { position: 'none', ratio: 0 };
      case 'custom': {
        const dir = pl.customSplit?.direction ?? 'vertical';
        if (dir === 'horizontal') return { position: 'float-left', ratio };
        return { position: 'top', ratio };
      }
      default: return { position: 'bottom', ratio: 0.38 };
    }
  }
  // Fallback to legacy image_layout
  const legacy = pdfPage.image_layout?.position ?? (pdfPage.content.image_urls.length > 0 ? 'bottom' : 'none');
  return { position: legacy, ratio: 0.38 };
}

// ─── Main build function ──────────────────────────────────────────────────────

async function buildPdf(payload: GoldenPayload): Promise<Uint8Array> {
  const bookIn  = payload.book_inches ?? 12;
  const { pagePt, safePt, contSize } = dims(bookIn);

  // ── Load fonts ────────────────────────────────────────────────────────────────
  const pdfDoc = await PDFDocument.create();

  // Metadata
  pdfDoc.setTitle(`Memory Vault — ${payload.missionary_name}`);
  pdfDoc.setAuthor('Memory Vault');
  pdfDoc.setSubject(payload.mission_name);
  pdfDoc.setCreator('Memory Vault PDF Generator');
  pdfDoc.setProducer('pdf-lib');
  pdfDoc.setCreationDate(new Date());

  // Fetch custom fonts; fall back gracefully to built-in PDF fonts
  const [
    serifBytes,
    serifItalBytes,
    serifBoldBytes,
    monoBytes,
  ] = await Promise.all([
    fetchGoogleFont('Playfair Display', 400),
    fetchGoogleFont('Playfair Display', 400, true),
    fetchGoogleFont('Playfair Display', 700),
    fetchGoogleFont('Space Mono', 400),
  ]);

  const fonts: FontSet = {
    serif     : serifBytes
                  ? await pdfDoc.embedFont(serifBytes)
                  : await pdfDoc.embedFont(StandardFonts.TimesRoman),
    serifItal : serifItalBytes
                  ? await pdfDoc.embedFont(serifItalBytes)
                  : await pdfDoc.embedFont(StandardFonts.TimesRomanItalic),
    serifBold : serifBoldBytes
                  ? await pdfDoc.embedFont(serifBoldBytes)
                  : await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    mono      : monoBytes
                  ? await pdfDoc.embedFont(monoBytes)
                  : await pdfDoc.embedFont(StandardFonts.Courier),
    body      : await pdfDoc.embedFont(StandardFonts.Helvetica),
    bodyBold  : await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  };

  // ── Cover page ────────────────────────────────────────────────────────────────
  const coverPage = pdfDoc.addPage([pagePt, pagePt]);
  await drawCoverPage(coverPage, pagePt, safePt, contSize, pdfDoc, fonts, payload);

  // ── Content pages (skip cover; handle 2-page spreads) ─────────────────────
  const contentPages = payload.pages.filter((p) => p.template_type !== 'cover');
  let pageNum = 2;
  for (const pg of contentPages) {
    const spreadPage2 = (pg.page_layout as PageLayout & { spreadPage2?: PageLayout })?.spreadPage2 ?? null;

    if (spreadPage2) {
      // Split images between pages
      const urls = pg.content.image_urls;
      const page1Images = urls.length > 1 ? urls.slice(0, Math.ceil(urls.length / 2)) : urls;
      const page2Images = urls.length > 1 ? urls.slice(Math.ceil(urls.length / 2)) : [];

      // Split message text
      const msg = pg.content.message;
      const paragraphs = msg.split(/\n\n+/);
      let msg1: string, msg2: string;
      if (paragraphs.length >= 2) {
        const mid = Math.ceil(paragraphs.length / 2);
        msg1 = paragraphs.slice(0, mid).join('\n\n');
        msg2 = paragraphs.slice(mid).join('\n\n');
      } else {
        const charMid = Math.ceil(msg.length / 2);
        const spaceIdx = msg.indexOf(' ', charMid);
        const breakAt = spaceIdx > -1 ? spaceIdx : charMid;
        msg1 = msg.slice(0, breakAt);
        msg2 = msg.slice(breakAt).trimStart();
      }

      // Page 1
      const splitPg1: GoldenPage = {
        ...pg,
        content: { ...pg.content, message: msg1, image_urls: page1Images },
      };
      const p1 = pdfDoc.addPage([pagePt, pagePt]);
      await drawContentPage(p1, pagePt, safePt, contSize, pdfDoc, fonts, splitPg1, pageNum);
      pageNum++;

      // Page 2
      const splitPg2: GoldenPage = {
        ...pg,
        page_layout: spreadPage2,
        content: { ...pg.content, message: msg2, image_urls: page2Images },
      };
      const p2 = pdfDoc.addPage([pagePt, pagePt]);
      await drawContentPage(p2, pagePt, safePt, contSize, pdfDoc, fonts, splitPg2, pageNum);
      pageNum++;
    } else {
      const page = pdfDoc.addPage([pagePt, pagePt]);
      await drawContentPage(page, pagePt, safePt, contSize, pdfDoc, fonts, pg, pageNum);
      pageNum++;
    }
  }

  // ── Back cover ────────────────────────────────────────────────────────────────
  const backPage = pdfDoc.addPage([pagePt, pagePt]);
  drawBackCover(backPage, pagePt, safePt, contSize, fonts, payload.missionary_name);

  return pdfDoc.save();
}

// ─── Edge Function handler ────────────────────────────────────────────────────

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: GoldenPayload = await req.json();

    if (!payload.book_id || !payload.pages?.length) {
      throw new Error('Invalid payload: book_id and pages are required');
    }

    // Generate PDF
    const pdfBytes = await buildPdf(payload);

    // Upload to Supabase Storage
    const fileName = `${payload.book_id}/${Date.now()}.pdf`;
    const { error: uploadErr } = await supabase.storage
      .from('book-pdfs')
      .upload(fileName, pdfBytes, {
        contentType : 'application/pdf',
        cacheControl: '3600',
        upsert      : true,
      });

    if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

    const { data: urlData } = supabase.storage
      .from('book-pdfs')
      .getPublicUrl(fileName);

    const result = {
      pdf_url    : urlData.publicUrl,
      page_count : payload.pages.length + 2,  // cover + content + back cover
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status : 200,
    });
  } catch (err) {
    console.error('generate-pdf error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});
