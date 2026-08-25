import { toCamelCase } from './aem.js';

/**
 * Fetches and caches the placeholders key/value sheet.
 * @param {string} prefix Path prefix to the placeholders sheet, defaults to the site root
 * @returns {Promise<object>} The placeholders object, keyed by camelCased Key column
 */
export default async function fetchPlaceholders(prefix = '') {
  window.placeholders = window.placeholders || {};
  if (!window.placeholders[prefix]) {
    window.placeholders[prefix] = new Promise((resolve) => {
      fetch(`${prefix}/placeholders.json`)
        .then((resp) => resp.json())
        .then((json) => {
          const placeholders = {};
          json.data.forEach((row) => {
            placeholders[toCamelCase(row.Key)] = row.Text;
          });
          window.placeholders[prefix] = placeholders;
          resolve(placeholders);
        })
        .catch(() => {
          window.placeholders[prefix] = {};
          resolve(window.placeholders[prefix]);
        });
    });
  }
  return window.placeholders[prefix];
}
