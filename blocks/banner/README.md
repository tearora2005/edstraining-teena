# Banner

A full-width banner with an image, a bold title, and an optional call-to-action button, styled with a solid blue background by default.

## Authoring (da.live)

In your da.live document, insert a table (**Insert > Table**) with 2 columns and 2 rows:

1. **Row 1** — merge both cells into one and type `Banner`. This names the block.
2. **Row 2** — leave as two separate cells:
   - **Left cell**: insert the banner image.
   - **Right cell**: type the title as a heading (e.g. `## Welcome to our site`) or plain text, and optionally a button link below it.

| Banner |  |
| --- | --- |
| (image) | ## Title text |

Only the first content row is used — add just one image, one title, and (optionally) one button per Banner block.

### Adding a button

Below the title, on its own line, add a link and italicize it (da.live's "Emphasis" formatting) to render it as an outlined button, e.g. *[Shop Now](https://example.com)*. This uses the site's standard [button formatting convention](https://www.aem.live/developer/markup-sections-blocks#buttons) — the same italicized-link pattern works anywhere on the page, not just in this block.

## Variants

### Dark

Add `(dark)` after the block name to swap the background from blue to a dark neutral:

| banner (dark) |  |
| --- | --- |
| (image) | Welcome to my banner block |

## Authoring notes

- **Image**: any image works; it's cropped to a 4:3 ratio on mobile and fills the full banner height on tablet/desktop.
- **Title**: use a heading level (H1–H6) if this banner needs to contribute to the page's heading hierarchy, or plain text otherwise. It always renders large, bold, and in the banner's text color regardless of heading level.
- **Button**: optional. Renders as an outlined button with an arrow, in the banner's text color.
- Alt text on the image carries through automatically — always add descriptive alt text when inserting the image in da.live.

## Layout behavior

- **Mobile** (< 600px): image on top, title and button stacked below.
- **Tablet/desktop** (>= 600px): image on the left (~50% width), title and button on the right filling the remaining space, minimum banner height 400px.

## Customizing the look

The background and text color are exposed as CSS custom properties scoped to the block, so a page- or section-level override can restyle a specific banner without touching the block's CSS:

- `--banner-background-color` (default `#1473e6`)
- `--banner-text-color` (default `#fff`)
