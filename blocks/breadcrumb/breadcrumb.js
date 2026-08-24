import { getMetadata } from '../../scripts/aem.js';

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const title = getMetadata('og:title') || document.title;
  const ul = document.createElement('ul');
  block.append(ul);
  const trail = [{
    text: 'Home',
    link: '/',
  }, {
    text: title,
  }];
  while (trail.length) {
    const step = trail.shift();
    const li = document.createElement('li');
    ul.append(li);
    let wrap = li;
    if (step.link) {
      wrap = document.createElement('a');
      wrap.href = step.link;
      li.append(wrap);
    }
    const span = document.createElement('span');
    wrap.append(span);
    span.textContent = step.text;
  }
}
