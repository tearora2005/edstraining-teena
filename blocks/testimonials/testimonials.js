import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Testimonials block
 * Content model — one row per testimonial, three cells:
 *   Cell 1: avatar image (optional)
 *   Cell 2: the quote text
 *   Cell 3: the name (optionally a second line for role/title)
 *
 * Renders a list of cards, each a <figure> with the avatar, a <blockquote>
 * quote, and a <figcaption> name/role.
 * @param {Element} block The testimonials block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const li = document.createElement('li');
    const figure = document.createElement('figure');

    // Avatar = the cell containing a picture (usually the first).
    const avatarCell = cells.find((c) => c.querySelector('picture'));
    const textCells = cells.filter((c) => c !== avatarCell);

    if (avatarCell) {
      const avatar = document.createElement('div');
      avatar.className = 'testimonials-avatar';
      avatar.append(avatarCell.querySelector('picture'));
      figure.append(avatar);
    }

    // First text cell = quote; remaining text cell(s) = name/role.
    const [quoteCell, ...nameCells] = textCells;

    if (quoteCell) {
      const quote = document.createElement('blockquote');
      quote.className = 'testimonials-quote';
      while (quoteCell.firstChild) quote.append(quoteCell.firstChild);
      figure.append(quote);
    }

    if (nameCells.length) {
      const caption = document.createElement('figcaption');
      caption.className = 'testimonials-cite';
      nameCells.forEach((cell) => {
        while (cell.firstChild) caption.append(cell.firstChild);
      });
      // Style the first line as the name, subsequent line(s) as the role.
      const lines = [...caption.children];
      if (lines[0]) lines[0].classList.add('testimonials-name');
      lines.slice(1).forEach((el) => el.classList.add('testimonials-role'));
      if (caption.textContent.trim() || caption.children.length) figure.append(caption);
    }

    li.append(figure);
    ul.append(li);
  });

  // Re-optimize same-origin avatar images (skip external hosts — see cards.js).
  ul.querySelectorAll('picture > img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    const isExternal = /^https?:\/\//i.test(src) && !src.startsWith(window.location.origin);
    if (isExternal) return;
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]),
    );
  });

  block.replaceChildren(ul);
}
