# Design System Migration Plan — wknd-trendsetters.site

## Objective
Extract the **global design system** from **https://wknd-trendsetters.site/** and apply it to this AEM Edge Delivery Services project. This captures the site's foundational visual language — colors, typography, spacing, and base element styling — and writes it into the project's global CSS. This is design-only; it does not migrate content, build blocks, or restyle individual blocks.

## Scope of This Task
**In scope** — global/site-level design tokens and base styles:
- Color palette (backgrounds, text, links, brand/accent colors) → CSS custom properties
- Typography (font families, sizes, weights, line-heights, heading scale)
- Spacing scale and layout widths (section max-width, gutters)
- Base element styling (body, headings, links, buttons, default content)
- Written into `styles/styles.css`, `styles/fonts.css`, and `fonts/` as needed

**Out of scope** (possible follow-ups):
- Per-block CSS (hero, cards, accordion, tabs, etc.)
- Content migration / import of any pages
- Navigation and footer instrumentation

## Approach
1. **Extract source design** — Inspect the live site's rendered computed styles to pull the real design tokens (not guessed values): color values, font stacks, type scale, spacing rhythm, and layout constraints.
2. **Map to EDS globals** — Translate the extracted tokens into the boilerplate's CSS custom property conventions and base selectors used in `styles/styles.css` / `styles/fonts.css`.
3. **Apply to project CSS** — Update the global stylesheet(s) and font definitions to reflect the source design system, matching the AEM boilerplate structure and mobile-first responsive conventions.
4. **Verify in preview** — Render a representative page locally and compare base typography, colors, and spacing against the source. Iterate until the global look matches.
5. **Lint** — Run `npm run lint` and fix any CSS issues before wrapping up.

## Checklist
- [ ] Confirm design scope: global design system only (colors, type, spacing, base styles)
- [ ] Extract computed design tokens from the live source site (colors, fonts, type scale, spacing, layout widths)
- [ ] Identify fonts used and how they're loaded; prepare `fonts/` + `fonts.css` as needed
- [ ] Map extracted tokens to the boilerplate's CSS custom properties and base selectors
- [ ] Apply design tokens to `styles/styles.css` (colors, typography, spacing, base elements)
- [ ] Update `styles/fonts.css` and `fonts/` with the source's font families
- [ ] Verify base typography, colors, and spacing in local preview against the source
- [ ] Run `npm run lint` and resolve any issues
- [ ] Summarize what changed and outline optional next steps (block-level styling)

## Deliverables
- Updated global stylesheet(s): `styles/styles.css` (and `styles/fonts.css` if fonts change)
- Any required web font files added under `fonts/`
- A short summary of the extracted design tokens and how they map to the project

## Open Questions
- None blocking. Scope confirmed as **site global design system**. Block-level styling can be a separate follow-up once content pages exist to verify against.

---
*Execution requires Execute mode. Once approved, I'll run the design-system extraction and apply the global styles, then verify in the preview.*
