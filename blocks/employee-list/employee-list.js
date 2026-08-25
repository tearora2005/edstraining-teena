import fetchPlaceholders from '../../scripts/placeholders.js';

const PAGE_SIZE = 10;
const COLUMNS = ['Name', 'Department', 'Experience', 'City'];

async function fetchPage(path, offset) {
  const url = new URL(path, window.location.href);
  url.searchParams.set('limit', PAGE_SIZE);
  url.searchParams.set('offset', offset);
  const resp = await fetch(url.href);
  if (!resp.ok) return null;
  return resp.json();
}

function renderRow(employee) {
  const row = document.createElement('tr');
  COLUMNS.forEach((column) => {
    const cell = document.createElement('td');
    cell.textContent = employee[column] || '';
    row.append(cell);
  });
  return row;
}

/**
 * loads and decorates the employee list block
 * @param {Element} block The employee-list block element
 */
export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  block.textContent = '';

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  COLUMNS.forEach((column) => {
    const th = document.createElement('th');
    th.textContent = column;
    headRow.append(th);
  });
  thead.append(headRow);
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);
  block.append(table);

  const placeholders = await fetchPlaceholders();
  const loadMoreButton = document.createElement('button');
  loadMoreButton.type = 'button';
  loadMoreButton.className = 'button secondary employee-list-load-more';
  loadMoreButton.textContent = placeholders.loadMore || 'Load more';
  block.append(loadMoreButton);

  let offset = 0;

  async function loadNextPage() {
    const json = await fetchPage(path, offset);
    if (!json || json.data.length === 0) {
      loadMoreButton.remove();
      return;
    }
    json.data.forEach((employee) => tbody.append(renderRow(employee)));
    offset += json.data.length;
    if (offset >= json.total) {
      loadMoreButton.remove();
    }
  }

  loadMoreButton.addEventListener('click', loadNextPage);
  await loadNextPage();
}
