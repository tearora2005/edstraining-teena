// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

/**
 * loads and decorates the testimonials tabs block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // build tablist (rendered below the panels, matching the source design)
  const tablist = document.createElement('div');
  tablist.className = 'tabs-testimonials-list';
  tablist.setAttribute('role', 'tablist');

  const rows = [...block.children];
  rows.forEach((row, i) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    const contentCell = cells[1] || labelCell;
    const id = toClassName(labelCell.textContent);

    // gather content from the panel cell
    const picture = contentCell.querySelector('picture');
    const img = contentCell.querySelector('img');
    const strong = contentCell.querySelector('strong');
    const name = (strong ? strong.textContent : labelCell.textContent).trim();
    const namePara = strong ? strong.closest('p') : null;
    const rolePara = namePara ? namePara.nextElementSibling : null;
    const role = rolePara ? rolePara.textContent.trim() : '';
    const quotePara = rolePara ? rolePara.nextElementSibling : null;
    const quote = quotePara ? quotePara.textContent.trim() : '';

    // rebuild the row as a tabpanel with a clean 2-column structure
    row.className = 'tabs-testimonials-panel';
    row.id = `tabpanel-${id}`;
    row.setAttribute('aria-hidden', !!i);
    row.setAttribute('aria-labelledby', `tab-${id}`);
    row.setAttribute('role', 'tabpanel');
    row.textContent = '';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'tabs-testimonials-image';
    if (picture) imageWrap.append(picture);

    const body = document.createElement('div');
    body.className = 'tabs-testimonials-body';
    const nameEl = document.createElement('p');
    nameEl.className = 'tabs-testimonials-name';
    nameEl.textContent = name;
    const roleEl = document.createElement('p');
    roleEl.className = 'tabs-testimonials-role';
    roleEl.textContent = role;
    const quoteEl = document.createElement('p');
    quoteEl.className = 'tabs-testimonials-quote';
    quoteEl.textContent = quote;
    body.append(nameEl, roleEl, quoteEl);

    row.append(imageWrap, body);

    // build the tab button: avatar + name + role
    const button = document.createElement('button');
    button.className = 'tabs-testimonials-tab';
    button.id = `tab-${id}`;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');

    const avatar = document.createElement('span');
    avatar.className = 'tabs-testimonials-avatar';
    if (img) {
      const avatarImg = document.createElement('img');
      avatarImg.src = img.getAttribute('src');
      avatarImg.alt = name;
      avatarImg.loading = 'lazy';
      avatar.append(avatarImg);
    }
    const tabText = document.createElement('span');
    tabText.className = 'tabs-testimonials-tab-text';
    const tabName = document.createElement('span');
    tabName.className = 'tabs-testimonials-tab-name';
    tabName.textContent = name;
    const tabRole = document.createElement('span');
    tabRole.className = 'tabs-testimonials-tab-role';
    tabRole.textContent = role;
    tabText.append(tabName, tabRole);
    button.append(avatar, tabText);

    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      row.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
  });

  block.append(tablist);
}
