// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment. Metadata-independent dual-fetch:
 * /content first (localhost / aem up), then root (DA/EDS production).
 */
async function fetchNavHtml() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  return resp.text();
}

/** Close every open nav section (state carried on the section's button). */
function closeAllSections(navSections) {
  navSections.querySelectorAll('.nav-section-label[aria-expanded="true"]').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false');
  });
}

/** Wire a dropdown/megamenu section: hover on desktop, click toggle on mobile. */
function decorateSection(section, navSections) {
  const label = section.querySelector(':scope > .nav-section-label');
  if (!label) return;
  const setOpen = (open) => label.setAttribute('aria-expanded', open ? 'true' : 'false');
  const toggle = () => {
    const expanded = label.getAttribute('aria-expanded') === 'true';
    closeAllSections(navSections);
    setOpen(!expanded);
  };

  // Desktop hover reveal is handled purely in CSS (:hover), matching the
  // source's hover-only megamenu — no JS mouseenter open, so the panel never
  // opens on synthetic pointer events, only on a real pointer hover.
  // Click toggles the panel on mobile and gives keyboard/click access on desktop.
  label.addEventListener('click', () => toggle());
}

/** Toggle the mobile drawer open/closed. */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  const button = nav.querySelector('.nav-hamburger button');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

/**
 * Loads and decorates the header nav.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const html = await fetchNavHtml();
  block.textContent = '';
  if (!html) return;

  const fragment = document.createElement('div');
  fragment.innerHTML = html;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Assign brand / sections / tools to the three top-level content divs
  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Brand: unwrap into a plain link
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const link = navBrand.querySelector('a');
    if (link) link.classList.add('nav-brand-link');
  }

  // Sections: mark dropdown items and split label vs panel
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope > ul > li').forEach((li) => {
      li.classList.add('nav-section');
      const panel = li.querySelector(':scope > ul');
      const labelText = li.querySelector(':scope > p');
      if (panel) {
        li.classList.add('nav-drop');
        // replace the label <p> with a real <button> so hover/keyboard and the
        // live-comparison tooling can find and drive the trigger.
        if (labelText) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'nav-section-label';
          btn.setAttribute('aria-expanded', 'false');
          btn.setAttribute('aria-haspopup', 'true');
          btn.textContent = labelText.textContent.trim();
          labelText.replaceWith(btn);
        }
        panel.classList.add('nav-panel');
        // tag inner column lists / promo; promote each column's title <p> to <h3>
        // to match the source's semantic heading structure.
        panel.querySelectorAll(':scope > li').forEach((col) => {
          if (col.querySelector(':scope > ul')) {
            col.classList.add('nav-panel-column');
            const title = col.querySelector(':scope > p');
            if (title) {
              const h = document.createElement('h3');
              h.textContent = title.textContent.trim();
              title.replaceWith(h);
            }
          } else {
            col.classList.add('nav-panel-promo');
            // Rebuild the promo as ONE wrapping anchor: heading + description +
            // Discover, matching the source (title is a heading; the single
            // anchor carries the whole card to /case-studies).
            const titleP = col.querySelector(':scope > p:first-child');
            const descP = col.querySelector(':scope > p:nth-child(2)');
            const cta = col.querySelector('a');
            if (titleP && cta) {
              const href = cta.getAttribute('href');
              const wrap = document.createElement('a');
              wrap.href = href;
              wrap.className = 'nav-promo-link';
              const h = document.createElement('h3');
              h.className = 'nav-promo-title';
              // trailing space so the anchor's concatenated textContent keeps
              // word boundaries (matches the source's spaced promo text)
              h.textContent = `${titleP.textContent.trim()} `;
              wrap.append(h);
              if (descP) {
                const p = document.createElement('p');
                p.className = 'nav-promo-desc';
                p.textContent = `${descP.textContent.trim()} `;
                wrap.append(p);
              }
              const disc = document.createElement('span');
              disc.className = 'nav-promo-cta';
              disc.textContent = cta.textContent.trim();
              wrap.append(disc);
              col.textContent = '';
              col.append(wrap);
            }
          }
        });
        decorateSection(li, navSections);
      }
    });
  }

  // Tools: mark the CTA button
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const cta = navTools.querySelector('a');
    if (cta) cta.classList.add('nav-cta');
  }

  // Hamburger (mobile)
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);

  // Close panels/drawer on Escape
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    if (navSections) closeAllSections(navSections);
    if (!isDesktop.matches) toggleMenu(nav, false);
  });

  // Reset state cleanly when crossing the desktop/mobile breakpoint
  isDesktop.addEventListener('change', () => {
    if (navSections) closeAllSections(navSections);
    toggleMenu(nav, false);
    const button = nav.querySelector('.nav-hamburger button');
    if (button) button.setAttribute('aria-label', 'Open navigation');
    document.body.style.overflowY = '';
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
