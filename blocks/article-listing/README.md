# Article Listing

Fetches a published index (by default the site's [query-index](../../helix-query.yaml), `/query-index.json`) and renders every row as a dynamic list: thumbnail, linked title, and description.

## Authoring (da.live)

Insert a single-cell table:

| Article Listing |
| --- |
| /query-index.json |

Row 1 names the block; row 2 (optional) is a link or plain text path to the JSON endpoint to render. If left empty, it defaults to `/query-index.json` — the site-wide index configured in [helix-query.yaml](../../helix-query.yaml).

To list only a subset of pages (e.g. just `/blog/**`), point it at a separate index or a filtered sheet that returns the same `{ data: [{ path, title, description, image }] }` shape.

## Behavior

- Fetches the whole response in one request (the default index endpoint returns up to 1000 rows) and renders every row — there's no "Load more" pagination in this block, unlike [Employee List](../employee-list/README.md).
- Each row needs a `path` (used as the link target) and `title` (used as the link text, falling back to `path` if blank); `image` and `description` are optional and simply omitted from the rendered item when missing.

## Customizing the look

Titles use `--heading-font-size-s` and `--text-color`; descriptions use `--dark-color`. On narrow screens (< 600px) each item stacks the thumbnail above the text instead of side-by-side.
