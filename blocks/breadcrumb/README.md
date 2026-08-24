# Breadcrumb

A simple two-step breadcrumb trail — **Home** followed by the current page's title — generated automatically from page metadata. No content is authored inside the block itself.

## Authoring (da.live)

In your da.live document, insert a table (**Insert > Table**) with 1 column and 1 row:

1. **Row 1** — type `Breadcrumb`. This names the block. Leave it empty otherwise — no other rows or cells are needed.

| Breadcrumb |
| --- |

The trail is built entirely from the page's title, not from anything typed into the block.

## Setting the page title

The breadcrumb's second (current-page) step uses the page's `og:title` metadata, falling back to the browser document title if that isn't set. Set this in da.live via the page's **Title** property (**Sheet/Page properties**), the same title used for SEO and social sharing — no extra configuration is needed for the breadcrumb specifically.

## Authoring notes

- **Home** always links to `/` and is not configurable per page.
- The current-page step is plain text (not a link), since it represents the page you're already on.
- This is a fixed two-level trail (Home → current page) — it does not reflect the page's position in a deeper navigation hierarchy.

## Customizing the look

Colors and typography use the site's global CSS custom properties (`--text-color`, `--link-color`, `--body-font-size-xs`) rather than block-local overrides, so the breadcrumb automatically matches sitewide theme changes.
