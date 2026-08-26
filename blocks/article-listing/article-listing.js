import { createOptimizedPicture } from '../../scripts/aem.js';

function renderItem(row) {
  const li = document.createElement('li');
  li.className = 'article-listing-item';

  if (row.image) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'article-listing-item-image';
    imageWrapper.append(createOptimizedPicture(row.image, row.title || '', false, [{ width: '300' }]));
    li.append(imageWrapper);
  }

  const body = document.createElement('div');
  body.className = 'article-listing-item-body';

  const title = document.createElement('p');
  title.className = 'article-listing-item-title';
  const link = document.createElement('a');
  link.href = row.path;
  link.textContent = row.title || row.path;
  title.append(link);
  body.append(title);

  if (row.description) {
    const description = document.createElement('p');
    description.className = 'article-listing-item-description';
    description.textContent = row.description;
    body.append(description);
  }

  li.append(body);
  return li;
}

/**
 * loads and decorates the article listing block
 * @param {Element} block The article-listing block element
 */
export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  block.textContent = '';

  const resp = await fetch(path || '/query-index.json');
  if (!resp.ok) return;
  const json = await resp.json();

  const list = document.createElement('ul');
  list.className = 'article-listing-items';
  json.data.forEach((row) => list.append(renderItem(row)));
  block.append(list);
}
