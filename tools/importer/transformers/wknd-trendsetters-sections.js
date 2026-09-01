/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters section breaks and Section Metadata.
 * Section selectors come from page-templates.json (payload.template.sections),
 * which are DOM-verified boundaries from page analysis.
 *
 * Breaks are inserted in beforeTransform (while every section element still
 * exists, before parsers replace them) using a temporary marker <hr>. Metadata
 * is inserted in afterTransform, anchored to that marker (or the original
 * element for the first section). See generate-import-transformer.md.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';
const SECTION_ANCHOR_ATTR = 'data-excat-anchor';

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Preserve source in-page anchors: any <section id="..."> that a jump link
    // (href="#id") targets loses its id during import. Capture those ids now and
    // re-emit them as Section Metadata `anchor` values so #id links keep working.
    const anchorTargets = new Set();
    element.querySelectorAll('a[href^="#"]').forEach((a) => {
      const id = a.getAttribute('href').slice(1);
      if (id) anchorTargets.add(id);
    });

    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess

      // Does this section (or a source section wrapping it) carry a targeted id?
      const idEl = sectionEl.id && anchorTargets.has(sectionEl.id)
        ? sectionEl
        : sectionEl.closest('[id]');
      const anchorId = idEl && anchorTargets.has(idEl.id) ? idEl.id : null;

      // First section with neither style nor anchor needs no break/metadata.
      if (i === 0 && !section.style && !anchorId) continue;

      const hr = document.createElement('hr');
      if (section.style || anchorId) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      if (anchorId) hr.setAttribute(SECTION_ANCHOR_ATTR, anchorId);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have now run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists: the
    // marker <hr> placed above, or (first section, no marker inserted) the
    // original element itself.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchorId = marker && marker.getAttribute(SECTION_ANCHOR_ATTR);
      // Emit metadata when the section is styled OR carries a preserved anchor.
      if (!section.style && !anchorId) continue;

      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue; // neither survived — selector didn't match post-parse; skip, never guess

      const cells = {};
      if (section.style) cells.style = section.style;
      if (anchorId) cells.anchor = anchorId;

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells,
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        marker.removeAttribute(SECTION_ANCHOR_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
