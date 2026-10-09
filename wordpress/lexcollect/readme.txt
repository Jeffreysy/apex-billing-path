=== LexCollect ===
Contributors: lexcollect
Requires at least: 6.6
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 2.0.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Block theme for LexCollect, AR accounting services for firms.

== Description ==

A full-site-editing (block) theme. Brand colors, IBM Plex fonts, font sizes and the spacing scale are defined in theme.json, so they appear as native options in the editor sidebar and in Appearance > Editor > Styles.

Full-page patterns ("LexCollect full pages"): Home, About, Platform, Results, Contact. Each is one HTML block generated from the LexCollect React site (scripts/build-wordpress-theme.py in the apex-billing-path repository), styled by assets/css/marketing.css. Edit the copy in the block editor's HTML block, or in the React source and rebuild.

Section patterns ("LexCollect sections"): Call to action, Blog header, Post grid, Footer.

== Installation ==

1. Appearance > Themes > Add New Theme > Upload Theme, choose lexcollect.zip, Install Now, Activate.
2. Appearance > LexCollect setup > Create my pages.
3. Set LEXCOLLECT_BOOKING_URL (Google Calendar booking page) and LEXCOLLECT_APP_LOGIN_URL at the top of functions.php.
4. Replace every yellow "Placeholder" / "Add figure" tag and every [bracketed] field.

== Contact form ==

The Contact and Home pages use the shortcode [lexcollect_contact]. Submissions are emailed to the address in Settings > General and saved under "Inquiries" in wp-admin. For reliable email delivery, install an SMTP plugin such as WP Mail SMTP.

== Copyright ==

LexCollect theme, (C) 2026 LexCollect. Distributed under the terms of the GNU GPL.
IBM Plex fonts: SIL Open Font License 1.1, loaded from Google Fonts.
