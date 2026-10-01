# LexCollect website (static preview)

Static preview of the marketing site. The live site runs on WordPress; every
token in `assets/css/styles.css` has a matching preset in the theme's
`theme.json`, so keep the two in sync. This folder is not part of the app
build (Vite only bundles from the root `index.html` and `public/`).

Open `index.html` directly in a browser to preview.

## Files

| Path | Notes |
|---|---|
| `index.html` | Landing page. Layout is final; copy is draft (see below). |
| `assets/css/styles.css` | Site stylesheet. Does not load fonts itself: each page links IBM Plex from Google Fonts. |
| `assets/js/site.js` | Mobile menu, blog filter chips, preview-only forms, footer year. |
| `assets/img/logo.svg` | Logo: white dollar sign on a Teal tile. Same artwork as the app (`public/favicon.svg`, `src/components/BrandLogo.tsx`). |
| `assets/img/mark*.svg`, `favicon.svg` | Earlier "LC" mark from the logo review. Kept for reference, no longer used. |

## Content to fill in

Search `index.html` for `CONTENT:` to find each spot. Anything with a yellow
**Placeholder** tag on the page must be replaced or removed before publishing.

- Hero headline, lead and the "read-only" promise
- Stats strip (three figures are placeholders)
- The four systems and integrations named (MyCase, Filevine, LawPay)
- Onboarding steps and the pipeline monitor's job names
- Testimonials (both are placeholders)
- FAQ answers (two are placeholders)
- Reply-time promise, email and phone in the contact section

The diagnostic report, bar chart and monitor use sample figures and are
captioned as illustrative. The hero and "The diagnostic" section share the
same numbers, so change them together.

## Fixes made to the supplied assets

These need copying into the WordPress theme as well:

- Primary buttons inside `.section--light` showed Teal-deep text on Teal (1.7:1)
- `.card--light` kept white headings (invisible) and a 2.2:1 kicker
- Kickers and focus rings in light sections were tuned for dark grounds (2.0:1, 1.6:1)
- `[hidden]` now overrides component `display` rules, so the blog filter can hide `.featured`
- The comparison table's `.yes` tick no longer appears on the legend's "Fix" labels
- Contrast: `.no` 4.0 to 5.0:1, placeholders 4.49 to 5.1:1, input borders 2.4 to 4.1:1
- Mobile menu closes on nav link click and on resize to desktop
- Demo form confirmation is now focusable, so screen readers announce it

## Markup notes for other pages

- `.nav-toggle` needs `aria-label` and `aria-controls` pointing at the nav's `id`
- `.form-status` should carry `role="status"`
- Blog `.chip` buttons need `type="button"` and an initial `aria-pressed`
- Give `.compare-wrap` `tabindex="0"` and an `aria-label` so keyboard users can scroll the table
- `.col-records` must be on both the `th` and the `td` of the report's records column
- Use `.card--light` (not `.card`) inside `.section--light`; dark cards there get dark headings
