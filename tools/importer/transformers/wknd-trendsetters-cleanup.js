/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters site-wide cleanup.
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content. All selectors verified against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Skip-link and top navbar (mega menu, mobile toggle) block/precede content.
    // Verified in cleaned.html: <a class="skip-link">, <div class="navbar">
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      '.navbar',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome and in-page navigation.
    // Verified in cleaned.html: <footer class="footer inverse-footer">,
    // <div class="breadcrumbs"> inside the feature-columns section.
    WebImporter.DOMUtils.remove(element, [
      'footer.footer',
      '.breadcrumbs',
    ]);
  }
}
