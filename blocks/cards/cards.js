import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    // Only re-optimize same-origin/relative images — the ?width= convention is
    // an AEM-hosted feature. External absolute URLs (e.g. an un-migrated source
    // host) reject the query param and would break; leave those images as-is.
    const src = img.getAttribute('src') || '';
    const isExternal = /^https?:\/\//i.test(src) && !src.startsWith(window.location.origin);
    if (isExternal) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  /* split the meta paragraph ("Category May 12") into a category pill + date */
  ul.querySelectorAll('.cards-card-body > p:first-child').forEach((meta) => {
    const text = meta.textContent.trim();
    const dateMatch = text.match(/\s+([A-Z][a-z]{2,}\.?\s+\d{1,2}(?:,\s*\d{4})?)$/);
    meta.classList.add('cards-card-meta');
    meta.textContent = '';
    if (dateMatch) {
      const category = text.slice(0, dateMatch.index).trim();
      const [, dateText] = dateMatch;
      const tag = document.createElement('span');
      tag.className = 'cards-card-tag';
      tag.textContent = category;
      const date = document.createElement('span');
      date.className = 'cards-card-date';
      date.textContent = dateText;
      meta.append(tag, date);
    } else {
      const tag = document.createElement('span');
      tag.className = 'cards-card-tag';
      tag.textContent = text;
      meta.append(tag);
    }
  });

  block.replaceChildren(ul);
}
