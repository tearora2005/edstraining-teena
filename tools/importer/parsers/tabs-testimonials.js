/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: tabs-testimonials
 * Base block: tabs
 * Source: marketing-landing template (wknd-trendsetters.site)
 * Generated: 2026-08-31
 *
 * Structure (tabs library): 2 columns, one row per tab.
 *   Cell 1: tab label (mandatory) — from the tab-menu buttons.
 *   Cell 2: tab content (mandatory) — from the matching tab-pane.
 * Tab labels and panes are paired by document order.
 */
export default function parse(element, { document }) {
  const panes = Array.from(element.querySelectorAll('.tabs-content > .tab-pane'));
  const menuButtons = Array.from(element.querySelectorAll('.tab-menu .tab-menu-link'));

  const cells = [];
  const count = Math.max(panes.length, menuButtons.length);

  for (let i = 0; i < count; i += 1) {
    const button = menuButtons[i];
    const pane = panes[i];

    // Label cell: prefer the person's name from the menu button; fall back to a numbered label.
    let labelCell;
    if (button) {
      const name = button.querySelector('strong');
      labelCell = name ? name.textContent.trim() : (button.textContent.trim() || `Tab ${i + 1}`);
    } else {
      labelCell = `Tab ${i + 1}`;
    }

    // Content cell: the full tab-pane content (image + testimonial text).
    const contentCell = pane ? Array.from(pane.childNodes) : '';

    cells.push([labelCell, contentCell]);
  }

  // Fallback: nothing extracted — keep original content in a single cell.
  if (!cells.length) {
    cells.push(['', Array.from(element.childNodes)]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-testimonials', cells });
  element.replaceWith(block);
}
