import { createOptimizedPicture } from '../../scripts/aem.js';
import fetchPlaceholders from '../../scripts/placeholders.js';

const PAGE_SIZE = 10;

/**
 * Fetch one page of the query index using limit/offset.
 * @param {string} path index endpoint (e.g. /query-index.json)
 * @param {number} offset row offset
 * @returns {Promise<object|null>} the sheet JSON ({ data, total, offset, limit })
 */
async function fetchPage(path, offset) {
  const url = new URL(path, window.location.href);
  url.searchParams.set('limit', PAGE_SIZE);
  url.searchParams.set('offset', offset);
  const resp = await fetch(url.href);
  if (!resp.ok) return null;
  return resp.json();
}

/**
 * Render a single article as a card <li>.
 * @param {object} row index row ({ path, title, description, image })
 * @returns {HTMLLIElement}
 */
function renderCard(row) {
  const li = document.createElement('li');
  li.className = 'article-list-card';

  const link = document.createElement('a');
  link.className = 'article-list-card-link';
  link.href = row.path;

  if (row.image) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'article-list-card-image';
    imageWrapper.append(
      createOptimizedPicture(row.image, row.title || '', false, [{ width: '400' }]),
    );
    link.append(imageWrapper);
  }

  const body = document.createElement('div');
  body.className = 'article-list-card-body';

  const title = document.createElement('h3');
  title.className = 'article-list-card-title';
  title.textContent = row.title || row.path;
  body.append(title);

  if (row.description) {
    const description = document.createElement('p');
    description.className = 'article-list-card-description';
    description.textContent = row.description;
    body.append(description);
  }

  link.append(body);
  li.append(link);
  return li;
}

/**
 * loads and decorates the article list block
 * @param {Element} block The article-list block element
 */
export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = (link ? link.getAttribute('href') : block.textContent.trim()) || '/query-index.json';
  block.textContent = '';

  const list = document.createElement('ul');
  list.className = 'article-list-cards';
  block.append(list);

  const placeholders = await fetchPlaceholders();
  const loadMoreButton = document.createElement('button');
  loadMoreButton.type = 'button';
  loadMoreButton.className = 'button secondary article-list-load-more';
  loadMoreButton.textContent = placeholders.loadMore || 'Load more';

  let offset = 0;

  async function loadNextPage() {
    loadMoreButton.disabled = true;
    const json = await fetchPage(path, offset);
    if (!json || !json.data || json.data.length === 0) {
      loadMoreButton.remove();
      return;
    }
    json.data.forEach((row) => list.append(renderCard(row)));
    offset += json.data.length;
    // Stop when we've rendered everything the index reports.
    if (typeof json.total === 'number' && offset >= json.total) {
      loadMoreButton.remove();
    } else {
      loadMoreButton.disabled = false;
    }
  }

  loadMoreButton.addEventListener('click', loadNextPage);
  block.append(loadMoreButton);
  await loadNextPage();
}
