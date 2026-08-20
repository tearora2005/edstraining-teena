import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the banner block
 * @param {Element} block The banner block element
 */
export default function decorate(block) {
  const cells = [...block.firstElementChild.children];
  cells.forEach((cell) => {
    cell.className = cell.querySelector('picture') ? 'banner-image' : 'banner-text';
  });
  block.replaceChildren(...cells);

  block.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, true, [{ width: '1200' }]));
  });
}
