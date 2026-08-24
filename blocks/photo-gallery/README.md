# Photo Gallery

A responsive grid of photos that opens a full-screen lightbox with previous/next navigation, a thumbnail strip, and an optional slideshow when a photo is clicked.

Adapted from the [Block Party](https://www.aem.live/developer/block-party/) [photo-gallery block](https://main--da--akasjain-helix.aem.live/photo-gallery). The lightbox interaction was ported to this project's plain-DOM style, and the source's PNG icon sprites were replaced with CSS-drawn shapes since those image assets aren't part of this project.

## Authoring (da.live)

In your da.live document, insert a table (**Insert > Table**) with 2 columns and as many rows as you need:

1. **Row 1** — merge both cells into one and type `Photo Gallery`. This names the block.
2. **Row 2+** — one row per photo:
   - **Left cell**: insert the photo.
   - **Right cell**: type an optional caption as plain text.

| Photo Gallery |  |
| --- | --- |
| (image) | Building Entrance |
| (image) | Exterior Building View |
| (image) | Lawn Area |
| (image) |  |

Add as many photo rows as you like — each becomes one grid item.

## Authoring notes

- **Image**: required on every row; missing images will break that row's grid item.
- **Caption**: optional. If left blank, the lightbox title is blank and the image's accessible name falls back to its filename.
- Alt text isn't set separately from the caption — the caption text doubles as the image's `alt` attribute (or the filename if no caption is given). Keep captions descriptive since they serve both purposes.

## Interaction behavior

- Clicking a grid photo opens a full-screen lightbox on that image.
- **Previous/next arrows** and **arrow keys** step through photos; **Escape** or the **×** button closes the lightbox.
- The **thumbnail strip** along the bottom jumps directly to a photo and scrolls to keep the active thumbnail in view.
- The **play button** starts/stops an auto-advancing slideshow (3s per photo); any manual navigation stops it.
- On mobile (< 600px), the thumbnail strip is hidden to save space; arrows and swipe-free tap navigation still work.

## Customizing the look

Lightbox text and controls use the site's global CSS custom properties (`--dark-color`, `--link-color`, `--body-font-size-xs`), so it stays consistent with sitewide theme changes without block-local overrides.
