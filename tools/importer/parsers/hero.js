/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero
 * Base block: hero
 * Source: marketing-landing template (wknd-trendsetters.site)
 * Generated: 2026-08-31
 *
 * Structure (hero library): 1 column, 3 rows.
 *   Row 2 (single cell): background image (optional).
 *   Row 3 (single cell): title, subheading, and CTA (all optional).
 */
export default function parse(element, { document }) {
  const bgImage = element.querySelector('img');
  const heading = element.querySelector('h1, h2, h3, .h1-heading, [class*="heading"]');
  const subheading = element.querySelector('p, .subheading');
  const ctaLinks = Array.from(element.querySelectorAll('.button-group a, a.button'));

  const cells = [];

  // Row 2: background image (only if present).
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 3: text content in a single cell.
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);

  // Empty-block guard.
  if (!bgImage && !heading && !subheading && !ctaLinks.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
