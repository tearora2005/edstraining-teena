/**
 * Quote block
 * Content model (single column):
 *   Row 1 (required): the quotation text
 *   Row 2 (optional): the attribution line (e.g. "Author Name, Role")
 *
 * Renders a semantic <blockquote> with the quote body and, when present,
 * a <cite> attribution.
 * @param {Element} block The quote block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // First row = quote text; last row (when there is more than one) = attribution.
  const quoteRow = rows[0];
  const attributionRow = rows.length > 1 ? rows[rows.length - 1] : null;

  const blockquote = document.createElement('blockquote');
  const quoteText = document.createElement('div');
  quoteText.className = 'quote-text';
  // move the quote cell's content (first cell of the first row)
  const quoteCell = quoteRow.firstElementChild || quoteRow;
  while (quoteCell.firstChild) quoteText.append(quoteCell.firstChild);
  blockquote.append(quoteText);

  if (attributionRow) {
    const cite = document.createElement('cite');
    cite.className = 'quote-attribution';
    const attrCell = attributionRow.firstElementChild || attributionRow;
    while (attrCell.firstChild) cite.append(attrCell.firstChild);
    // only add if it actually has content
    if (cite.textContent.trim() || cite.children.length) blockquote.append(cite);
  }

  block.replaceChildren(blockquote);
}
