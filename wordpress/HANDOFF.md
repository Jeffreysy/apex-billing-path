# Handoff: publish the LexCollect site to WordPress

You are picking up from a cloud session that built the LexCollect marketing site and a matching WordPress theme. Everything is on branch `claude/kind-johnson-ydz4mq` of `Jeffreysy/apex-billing-path` (PR #4). Your job is to get the WordPress site updated, with the user logged in to wp-admin in their browser.

## What exists

- **The theme, ready to upload:** `wordpress/lexcollect.zip` (version 2.0.0). Source folder: `wordpress/lexcollect/`.
- **How it was made:** the five marketing pages (Home, About, Platform, Results, Contact), header and footer are generated from the React site by `scripts/build-wordpress-theme.py`, fed by `PRERENDER_TARGET=wp npx vite-node --mode production scripts/prerender-marketing.tsx <dir>`. Each page is one HTML block styled by `assets/css/marketing.css` (scoped under `body.lc`). The blog uses the theme's native block templates.
- **The form:** `[lexcollect_contact]` shortcode (home) and `[lexcollect_contact heading="Request a call"]` (contact). Submissions save under Inquiries in wp-admin and email the admin address.
- **Clickable preview of what the pages should look like:** https://claude.ai/artifact/4t9aBfahBNU8tks2htwva8

## Do this in wp-admin

1. **Before anything, check what's there.** Appearance › Themes (which theme is active?) and Pages (do Home, About, Services, Blog, Contact already exist with real content?). If an older LexCollect theme (1.0.x) is active, the new one replaces it. If pages already exist, see "Existing pages" below.
2. **Upload the theme.** Appearance › Themes › Add New Theme › Upload Theme › `wordpress/lexcollect.zip` › Install Now › Activate. If WordPress says a theme with that folder name exists, choose "Replace active with uploaded."
3. **Create the pages.** Appearance › LexCollect setup › Create my pages. This creates Home, About, Platform, Results, Blog and Contact, sets Home as the front page and Blog as the posts page, adds four categories, and saves a starter article as a draft. It skips any page whose slug already exists.
4. **Set the two constants** at the top of `functions.php` (Appearance › Theme File Editor, or edit the file and re-upload):
   - `LEXCOLLECT_BOOKING_URL`: the user's Google Calendar appointment booking page. Ask the user for it. While empty, every "Book a call" button goes to the Contact page.
   - `LEXCOLLECT_APP_LOGIN_URL`: the client workspace sign-in URL. Default is `https://app.lexcollect.com/login`; confirm with the user.
5. **Site icon:** Settings › General › Site Icon. Use `public/brand/site-icon-512.png` from the repo.
6. **Check every page in the browser** against the preview link above: Home, About, Platform, Results, Blog, Contact, and the draft article. Look for the header menu (Platform, Results, About, Blog, Contact, Log in, Book a call), full-bleed dark sections, the momentum card on About, the comparison table on Platform, and the form on Home and Contact.
7. **Submit a test inquiry** on Contact and confirm it appears under Inquiries in wp-admin.
8. **Email:** if the site has no SMTP plugin, suggest WP Mail SMTP so form emails arrive reliably.

## Existing pages

Setup never overwrites a page. If Home, About or Contact already exist with old content:

- Open the page › the three-dot menu › Code editor, delete the content, and insert the matching pattern: + inserter › Patterns › "LexCollect full pages" › Home page / About page / Platform page / Results page / Contact page.
- Set the page template to "Marketing page" (Page sidebar › Template) so the sections run full width.
- An old "Services" page can be deleted or redirected to Platform.

## Known gaps the user still has to fill

- **Booking link** (above). Also set `BOOKING_URL` in `src/lib/marketing.ts` in the repo so the React site matches.
- **Contact email:** `hello@yourdomain.com` placeholder in the footer and contact page. In the repo it is `CONTACT_EMAIL` in `src/lib/marketing.ts`; in WordPress it is inside the generated page HTML, so fix it in the repo and rebuild, or edit the HTML blocks.
- **Founder note and photo** on About: yellow "Placeholder: replace" tag.
- **"Add figure" tags** on Results: paying clients gained, hard-delinquent dollars collected, revenue traced to LexCollect. The repo had no before-and-after figures, so none were invented.
- **Email and SMS sending:** the site says LexCollect sends automated email and SMS sequences. The app repo has no sending integration. Confirm with the user which tool does it today, or soften the wording.
- **Supabase migration** `supabase/migrations/20261008230000_website_inquiries.sql` is not applied yet (the React site's form writes to that table). Not needed for WordPress.

## If something looks wrong

Styling problems almost always mean `assets/css/marketing.css` didn't load or `body` is missing the `lc` class (added by a `body_class` filter in `functions.php`). Layout problems on the marketing pages usually mean the page template isn't "Marketing page". Copy changes should be made in the React source (`src/pages/LandingPage.tsx`, `src/pages/marketing/*.tsx`) and rebuilt with the two commands above, so the app and WordPress stay identical; a quick one-off fix can be made directly in the page's HTML block.

The theme passed `php -l` on every file but was not installed on a live WordPress site before this handoff, because the build container could not reach wordpress.org. Expect to fix small things on first install.
