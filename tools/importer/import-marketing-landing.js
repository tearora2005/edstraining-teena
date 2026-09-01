/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsParser from './parsers/columns.js';
import photoGalleryParser from './parsers/photo-gallery.js';
import tabsTestimonialsParser from './parsers/tabs-testimonials.js';
import cardsParser from './parsers/cards.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import heroParser from './parsers/hero.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PARSER REGISTRY
const parsers = {
  columns: columnsParser,
  'photo-gallery': photoGalleryParser,
  'tabs-testimonials': tabsTestimonialsParser,
  cards: cardsParser,
  'accordion-faq': accordionFaqParser,
  hero: heroParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'marketing-landing',
  description: 'Marketing landing page: full-width hero banner followed by stacked promotional content sections and feature blocks',
  urls: [
    'https://wknd-trendsetters.site/',
    'https://wknd-trendsetters.site/fashion-trends-of-the-season',
    'https://wknd-trendsetters.site/fashion-trends-young-adults',
  ],
  blocks: [
    {
      "name": "hero",
      "instances": [
        "#main-content > section.section.inverse-section > div.container > div.grid-layout.desktop-1-column"
      ]
    },
    {
      "name": "tabs-testimonials",
      "instances": [
        "#main-content div.tabs-wrapper"
      ]
    },
    {
      "name": "accordion-faq",
      "instances": [
        "#main-content div.grid-layout:has(.faq-list)"
      ]
    },
    {
      "name": "photo-gallery",
      "instances": [
        "#main-content > section.section > div.container > div.grid-layout.grid-gap-sm"
      ]
    },
    {
      "name": "cards",
      "instances": [
        "#main-content > section.section > div.container > div.grid-layout.desktop-4-column.grid-gap-md",
        "#main-content > section.section > div.container > div.grid-layout.desktop-3-column.grid-gap-lg"
      ]
    },
    {
      "name": "columns",
      "instances": [
        "#main-content > header.section > div.container > div.grid-layout.grid-gap-xxl:not(:has(.faq-list))",
        "#main-content > section.section > div.container > div.grid-layout.grid-gap-xxl:not(:has(.faq-list))",
        "#main-content > section.section > div.container > div.grid-layout.tablet-1-column.grid-gap-lg:not(.desktop-3-column)"
      ]
    }
  ],
  sections: [
    { id: 'rc1', name: 'intro-columns', selector: '#main-content > header.section.secondary-section', style: 'grey', blocks: ['columns'], defaultContent: [] },
    { id: 'rc2', name: 'feature-columns', selector: '#main-content > section.section:nth-of-type(1)', style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'rc3', name: 'photo-gallery', selector: '#main-content > section.section.secondary-section:nth-of-type(2)', style: 'grey', blocks: ['photo-gallery'], defaultContent: ['#main-content > section.section.secondary-section:nth-of-type(2) > div.container > div.utility-text-align-center.utility-margin-bottom-8rem'] },
    { id: 'rc4', name: 'testimonials-tabs', selector: '#main-content > section.section:nth-of-type(3)', style: null, blocks: ['tabs-testimonials'], defaultContent: [] },
    { id: 'rc5', name: 'latest-articles-cards', selector: '#main-content > section.section.secondary-section:nth-of-type(4)', style: 'grey', blocks: ['cards'], defaultContent: ['#main-content > section.section.secondary-section:nth-of-type(4) > div.container > div.utility-text-align-center'] },
    { id: 'rc6', name: 'faq-accordion', selector: '#main-content > section.section:nth-of-type(5)', style: null, blocks: ['accordion-faq'], defaultContent: ['#main-content > section.section:nth-of-type(5) > div.container > div.grid-layout > div:nth-of-type(1)'] },
    { id: 'rc7', name: 'closing-hero', selector: '#main-content > section.section.inverse-section', style: 'dark', blocks: ['hero'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block; skip elements already detached by an earlier parser
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (root URL → /index to avoid empty-path crash)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
