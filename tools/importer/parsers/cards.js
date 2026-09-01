/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards
 * Base block: cards
 * Source: marketing-landing template (wknd-trendsetters.site)
 * Generated: 2026-08-31
 *
 * Structure (cards library, images present → 2 columns):
 *   Cell 1: image (mandatory) — the card's image.
 *   Cell 2: text content (mandatory) — meta, heading, and a CTA link.
 * Each card is an <a> card link whose href becomes the card CTA. This site uses
 * two card flavours that share the same shape:
 *   - .article-card / .article-card-body (blog & article-listing grids)
 *   - .trend-card   / .trend-card-body   (card-gallery trend grids)
 */
export default function parse(element, { document }) {
  let cards = Array.from(element.querySelectorAll(
    ':scope > a.article-card, :scope > .article-card, :scope > a.trend-card, :scope > .trend-card',
  ));

  // Fallback for classless grid cards (e.g. the "Trends that turn heads" grid):
  // plain <div> children each holding an image + heading + description, with no
  // card class. Treat every direct child <div> that contains an image as a card.
  let plainGridCards = false;
  if (!cards.length) {
    cards = Array.from(element.querySelectorAll(':scope > div')).filter((d) => d.querySelector('img'));
    plainGridCards = cards.length > 0;
  }

  const cells = [];

  cards.forEach((card) => {
    const img = card.querySelector('.article-card-image img, .trend-card-image img, img');
    // For classless grid cards the whole <div> is the body (minus the image).
    const body = card.querySelector('.article-card-body, .trend-card-body')
      || (plainGridCards ? card : null);

    // Build the text cell from clones so we never mutate the live source DOM
    // mid-loop (a move/append on the live tree can abort the whole parse in the
    // browser importer, dropping every card after the first).
    const textNodes = [];
    if (body) {
      const href = card.getAttribute('href');
      Array.from(body.childNodes).forEach((node) => {
        // For classless grid cards the image lives inside the body div — it is
        // already captured in cell 1, so skip it (and any <picture> wrapping it)
        // to avoid duplicating the image in the text cell.
        if (
          plainGridCards
          && node.nodeType === 1
          && (node.tagName === 'IMG' || node.tagName === 'PICTURE' || node.querySelector?.('img'))
        ) return;
        let clone = node.cloneNode(true);
        // Normalize a leading inline tag (e.g. <span class="tag">) into a <p> so
        // every cell child is a block element. A cell whose markdown starts with
        // a bare inline node breaks the html2md table roundtrip and silently
        // drops all following card rows.
        if (clone.nodeType === 1 && clone.tagName === 'SPAN') {
          const p = document.createElement('p');
          p.textContent = clone.textContent;
          clone = p;
        }
        // Preserve the card link by wrapping the heading text in an anchor.
        if (
          href
          && clone.nodeType === 1
          && /^H[1-6]$/.test(clone.tagName)
        ) {
          // Strip a disambiguation fragment (e.g. "#c3") used only to keep
          // identical-href sibling cards from being de-duplicated during import;
          // the authored destination is the fragment-less URL.
          const cleanHref = href.replace(/#c\d+$/, '');
          const link = document.createElement('a');
          link.setAttribute('href', cleanHref);
          while (clone.firstChild) link.appendChild(clone.firstChild);
          clone.appendChild(link);
        }
        // Skip empty whitespace-only text nodes that add noise to the cell.
        if (clone.nodeType === 3 && !clone.textContent.trim()) return;
        textNodes.push(clone);
      });
    }

    cells.push([img ? img.cloneNode(true) : '', textNodes.length ? textNodes : '']);
  });

  // Fallback: no cards found — keep original content in one cell.
  if (!cells.length) {
    cells.push(['', Array.from(element.childNodes)]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
