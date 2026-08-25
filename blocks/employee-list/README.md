# Employee List

Renders employee records from a published spreadsheet, 10 at a time, with a "Load more" button that fetches and appends the next 10. The button label comes from the site's placeholders sheet, not the block content.

## 1. Author the employees spreadsheet

In da.live, create a **Sheet** document (e.g. at `/employees`) with these columns:

| Name | Department | Experience | City |
| --- | --- | --- | --- |
| Jane Doe | Engineering | 5 years | Austin |
| John Smith | Sales | 3 years | Seattle |

Preview and publish it — it becomes available at `/employees.json`, returning `{ total, offset, limit, data }`. The block requests it with `?limit=10&offset=N`, relying on the platform's built-in sheet pagination — it never downloads the whole sheet at once.

## 2. Add the "Load More" placeholder

In your site's `placeholders` sheet (root-level, `Key`/`Text` columns), add a row:

| Key | Text |
| --- | --- |
| Load More | Load More |

Keys are camelCased automatically (`Load More` → `loadMore`) by [scripts/placeholders.js](../../scripts/placeholders.js). If this row is missing, the block falls back to the literal text "Load more".

## 3. Author the block

Insert a single-cell table:

| Employee List |
| --- |
| /employees.json |

Row 1 names the block; row 2 is a link (or plain text) pointing at the published sheet's JSON endpoint.

## Behavior

- Renders a table with Name/Department/Experience/City columns, 10 rows per page.
- Clicking **Load more** fetches the next 10 rows via `?offset=`/`?limit=` and appends them without re-rendering existing rows.
- The button removes itself once every row has been loaded.

## Customizing the look

Table borders and header text use `--light-color`, `--dark-color`, and `--body-font-size-xs`. The button reuses the site's global `.button.secondary` style, so it matches other secondary buttons without block-specific styling.
