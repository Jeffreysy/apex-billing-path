# Handoff: publish the LexCollect site to WordPress

## Current state (2026-10-08): published

The site is live at **https://lex-collect.com** (WordPress.com Business). Read this before uploading anything:

- **The theme on the site lives in the folder `lexcollect-v2`** (Theme Name "LexCollect 2"), not `lexcollect`. It was installed next to the site's older LexCollect 1.0.1 theme, which is not in this repo and stays installed as the rollback. To ship an update, re-zip `wordpress/lexcollect.zip` with the top folder renamed to `lexcollect-v2/` and the `Theme Name:` line changed to `LexCollect 2`, upload it, and choose "Replace installed with uploaded." Uploading `lexcollect.zip` as-is installs a second, separate theme.
- **A theme upload does not change page content.** Each page stores its pattern's HTML in the post. After a pattern changes, write it to the page too: from any wp-admin editor screen, `wp.apiFetch({ path: '/wp/v2/pages/<id>', method: 'POST', data: { content, template: 'page-marketing' } })`, with `content` read from `/wp/v2/block-patterns/patterns`. Page ids: Home 10, About 11, Contact 14, Platform 50, Results 51, Blog 13. Services (12) is a draft.
- **Version 2.1.0 is live:** a redesigned home page, plus page interactions in `src/lib/marketing-site.ts`, which `build-wordpress-theme.py` bundles into `assets/js/site.js` with esbuild. Interactions are driven by data attributes on server-rendered markup, so React and WordPress share one implementation.
- **Version 2.4.0 is built but not uploaded yet, and replaces 2.3.0** (which was never uploaded, so 2.4.0 carries everything 2.3.0 had). 2.4.0 rewrites the site's story for immigration and humanitarian law firms: trust between the firm and the families it serves, one source of truth across the firm's systems, and high-level accounting. Every marketing page changed, plus the article. To ship it: upload the theme, then rewrite the content of **all five pages** (Home 10, About 11, Contact 14, Platform 50, Results 51) from their patterns. Then update the live article at `/immigration-firms-lose-money-between-systems/`: open the post, select all blocks and delete them, then + inserter › Patterns › LexCollect › "Article: Where Immigration Firms Lose Money, and Trust", set the title to match, and update.
- **Version 2.3.0 (included in 2.4.0).** It adds the firm inbox, `jeff@lex-collect.com` (`LEXCOLLECT_CONTACT_EMAIL` in `functions.php`), to the footer, the contact page, and the call form, and sends call requests there instead of the WordPress admin address. It also turns the home hero's "Works across" list into a sliding logo strip (static for visitors who turn motion off). And every visitor who sends the call form now gets a branded confirmation email (`inc/confirmation-email.php`): sent as "LexCollect", replies go to the firm inbox, with the next steps and a short summary of their answers. To ship it: upload the theme as above, then rewrite the content of Home (10) and Contact (14) from their patterns, since the email and the strip live in page HTML. The footer updates with the theme.
- **WordPress.com caches pages for a few minutes after an upload.** If a page still shows the old styles, check the `marketing.css?m=` timestamp and the `x-ac` response header before assuming the upload failed.

The original publishing checklist follows.

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
- **Contact email:** done in 2.3.0: `jeff@lex-collect.com`. In the repo it is `CONTACT_EMAIL` in `src/lib/marketing.ts`; in WordPress it is `LEXCOLLECT_CONTACT_EMAIL` in `functions.php` plus the generated page HTML.
- **Confirmation email delivery:** the email goes out through WordPress's mailer from the site's own sending address, with only the display name set to LexCollect, so it doesn't fail the domain's SPF/DKIM checks. For the best inbox placement, install WP Mail SMTP and connect it to the jeff@lex-collect.com mailbox (step 8 above); the confirmation then sends from that address. Send yourself a test request after uploading.
- **React site form:** the React copy of the call form saves to Supabase (`website_inquiries`) and sends no email. The live site is WordPress, so this only matters if the React pages are ever served publicly; they would need an email provider and an edge function.
- **MyCase, Filevine and LawPay logos:** the logo strip shows these three as names, because no open logo set has them and the build container could not reach the vendors' sites. Add each official one-colour SVG path to `src/lib/integration-logos.ts` and rebuild. The other five marks are Simple Icons and Iconify paths (CC0).
- **Founder note and photo** on About: yellow "Placeholder: replace" tag.
- **"Add figure" tags** on Results: paying clients gained, hard-delinquent dollars collected, revenue traced to LexCollect. The repo had no before-and-after figures, so none were invented.
- **Email and SMS sending:** the site says LexCollect sends automated email and SMS sequences. The app repo has no sending integration. Confirm with the user which tool does it today, or soften the wording.
- **Supabase migration** `supabase/migrations/20261008230000_website_inquiries.sql` is not applied yet (the React site's form writes to that table). Not needed for WordPress.

## If something looks wrong

Styling problems almost always mean `assets/css/marketing.css` didn't load or `body` is missing the `lc` class (added by a `body_class` filter in `functions.php`). Layout problems on the marketing pages usually mean the page template isn't "Marketing page". Copy changes should be made in the React source (`src/pages/LandingPage.tsx`, `src/pages/marketing/*.tsx`) and rebuilt with the two commands above, so the app and WordPress stay identical; a quick one-off fix can be made directly in the page's HTML block.

The theme passed `php -l` on every file but was not installed on a live WordPress site before this handoff, because the build container could not reach wordpress.org. Expect to fix small things on first install.
