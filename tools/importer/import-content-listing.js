/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';
import photoGalleryParser from './parsers/photo-gallery.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PARSER REGISTRY
const parsers = {
  hero: heroParser,
  columns: columnsParser,
  cards: cardsParser,
  'photo-gallery': photoGalleryParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'content-listing',
  description: 'Content index/listing page: hero header followed by a repeating grid of card teasers linking to detail pages',
  urls: [
    'https://wknd-trendsetters.site/blog',
    'https://wknd-trendsetters.site/case-studies',
    'https://wknd-trendsetters.site/fashion-insights',
  ],
  blocks: [
    {
      "name": "hero",
      "instances": [
        "#main-content > header.section > div.container > div.grid-layout.grid-gap-xxl:not(:has(.faq-list))",
        "#main-content > section.section.inverse-section > div.container > div.grid-layout.desktop-1-column"
      ]
    },
    {
      "name": "columns",
      "instances": [
        "#main-content > section.section > div.container > div.grid-layout.tablet-1-column.grid-gap-lg:not(.desktop-3-column)"
      ]
    },
    {
      "name": "cards",
      "instances": [
        "#main-content > section.section > div.container > div.grid-layout.desktop-4-column.grid-gap-md"
      ]
    },
    {
      "name": "photo-gallery",
      "instances": [
        "#main-content > section.section > div.container > div.grid-layout.grid-gap-sm"
      ]
    }
  ],
  sections: [
    { id: 'rc1', name: 'blog-hero-header', selector: '#main-content > header.section.secondary-section', style: 'grey', blocks: ['hero'], defaultContent: [] },
    { id: 'rc2', name: 'featured-article', selector: '#main-content > section.section:nth-of-type(1)', style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'rc3', name: 'latest-articles-grid', selector: '#articles', style: 'grey', blocks: ['cards'], defaultContent: ['#articles > div.container > div.utility-text-align-center'] },
    { id: 'rc4', name: 'subscribe-cta', selector: '#main-content > section.section.accent-section', style: 'accent', blocks: [], defaultContent: ['#main-content > section.section.accent-section > div.container'] },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

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

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

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

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

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
