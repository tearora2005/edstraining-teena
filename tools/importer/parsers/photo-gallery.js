/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: photo-gallery
 * Base block: photo-gallery (custom — no library convention found)
 * Source: marketing-landing template (wknd-trendsetters.site)
 * Generated: 2026-08-31
 *
 * Structure: a grid of image tiles. Each direct-child div wraps one <img>.
 * Rendered as a single-column block with one image per row.
 */
export default function parse(element, { document }) {
  // Collect all gallery images (one per tile).
  const images = Array.from(element.querySelectorAll('img'));

  const cells = [];
  images.forEach((img) => {
    cells.push([img]);
  });

  // Fallback: if no images found, keep original content in a single cell.
  if (!cells.length) {
    cells.push([Array.from(element.childNodes)]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'photo-gallery', cells });
  element.replaceWith(block);
}
