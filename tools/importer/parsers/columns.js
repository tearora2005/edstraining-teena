/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns
 * Base block: columns
 * Source: marketing-landing template (wknd-trendsetters.site)
 * Generated: 2026-08-31
 *
 * Structure: outer .grid-layout whose direct-child divs each become a column.
 * In the source, column 1 is a text group (heading, subheading, button-group)
 * and column 2 is a stack of images. Content is organized by direct children.
 */
export default function parse(element, { document }) {
  // Each direct child of the grid becomes a column cell.
  const columnEls = Array.from(element.querySelectorAll(':scope > div'));

  const cells = [];

  if (columnEls.length) {
    // Single content row: one cell per direct-child column.
    const row = columnEls.map((col) => {
      const contents = Array.from(col.childNodes).filter((n) => {
        if (n.nodeType === 3) return n.textContent.trim().length > 0; // keep non-empty text
        return true;
      });
      return contents.length ? contents : col;
    });
    cells.push(row);
  } else {
    // Fallback: no direct-child columns found — put whole element content in one cell.
    cells.push([Array.from(element.childNodes)]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
