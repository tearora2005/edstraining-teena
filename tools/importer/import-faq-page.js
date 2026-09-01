/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsParser from './parsers/columns.js';
import accordionFaqParser from './parsers/accordion-faq.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PARSER REGISTRY
const parsers = {
  columns: columnsParser,
  'accordion-faq': accordionFaqParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'faq-page',
  description: 'FAQ page: hero header followed by an accordion of expandable question/answer items and a supporting cards section',
  urls: [
    'https://wknd-trendsetters.site/faq',
  ],
  blocks: [
    {
      name: 'columns',
      instances: [
        '#main-content > header.section.secondary-section > div.container > div.grid-layout',
        '#main-content > section.section.secondary-section > div.container > div.grid-layout',
      ],
    },
    { name: 'accordion-faq', instances: ['#main-content > section.section:nth-of-type(1) > div.container > div.faq-list'] },
  ],
  sections: [
    { id: 'rc1', name: 'faq-hero-header', selector: '#main-content > header.section.secondary-section', style: 'grey', blocks: ['columns'], defaultContent: [] },
    { id: 'rc2', name: 'faq-accordion', selector: '#main-content > section.section:nth-of-type(1)', style: null, blocks: ['accordion-faq'], defaultContent: [] },
    { id: 'rc3', name: 'connect-columns', selector: '#main-content > section.section.secondary-section', style: 'grey', blocks: ['columns'], defaultContent: [] },
    { id: 'rc4', name: 'join-cta', selector: '#main-content > section.section.accent-section', style: 'accent', blocks: [], defaultContent: ['#main-content > section.section.accent-section > div.container'] },
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
