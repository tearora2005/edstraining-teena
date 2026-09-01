/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: accordion-faq
 * Base block: accordion
 * Source: marketing-landing template (wknd-trendsetters.site)
 * Generated: 2026-08-31
 *
 * Structure (accordion library): 2 columns, one row per item.
 *   Cell 1: title (mandatory) — the FAQ question text from summary > span.
 *   Cell 2: content (mandatory) — the answer body from .faq-answer.
 * The decorative +/- SVG icon in each summary is intentionally dropped.
 * The intro heading div is section default content, not part of the block.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.faq-item, details'));

  const cells = [];

  items.forEach((item) => {
    const summary = item.querySelector('.faq-question, summary');
    // Prefer the question text (span) and exclude the decorative icon.
    const questionSpan = summary ? summary.querySelector('span') : null;
    let titleCell;
    if (questionSpan) {
      titleCell = questionSpan.textContent.trim();
    } else if (summary) {
      titleCell = summary.textContent.trim();
    } else {
      titleCell = '';
    }

    const answer = item.querySelector('.faq-answer');
    const contentCell = answer ? Array.from(answer.childNodes) : '';

    cells.push([titleCell, contentCell]);
  });

  // Fallback: no items found — keep original content in one cell.
  if (!cells.length) {
    cells.push(['', Array.from(element.childNodes)]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
