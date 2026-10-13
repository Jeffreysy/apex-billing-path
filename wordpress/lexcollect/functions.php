<?php
/**
 * LexCollect theme functions.
 *
 * @package LexCollect
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'LEXCOLLECT_VERSION', '2.2.2' );

/**
 * Site-wide links. Edit these two lines after installing the theme.
 *
 * LEXCOLLECT_BOOKING_URL: the Google Calendar appointment (booking) page.
 *   While it is empty, every "Book a call" button goes to the Contact page.
 * LEXCOLLECT_APP_LOGIN_URL: the LexCollect workspace sign-in page for clients.
 */
if ( ! defined( 'LEXCOLLECT_BOOKING_URL' ) ) {
	define( 'LEXCOLLECT_BOOKING_URL', '' );
}
if ( ! defined( 'LEXCOLLECT_APP_LOGIN_URL' ) ) {
	define( 'LEXCOLLECT_APP_LOGIN_URL', 'https://app.lexcollect.com/login' );
}

/**
 * Google Fonts stylesheet for IBM Plex Serif, Sans and Mono.
 * To self-host instead: Appearance > Editor > Styles > Typography > Manage fonts.
 */
function lexcollect_fonts_url() {
	return 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;1,400&display=swap';
}

add_action(
	'after_setup_theme',
	function () {
		add_theme_support( 'editor-styles' );
		add_editor_style( array( lexcollect_fonts_url(), 'style.css' ) );
	}
);

add_action(
	'wp_enqueue_scripts',
	function () {
		wp_enqueue_style( 'lexcollect-fonts', lexcollect_fonts_url(), array(), null );
		wp_enqueue_style( 'lexcollect', get_stylesheet_uri(), array(), LEXCOLLECT_VERSION );
		// The marketing site's own stylesheet (scoped under body.lc), generated from the React site.
		wp_enqueue_style( 'lexcollect-marketing', get_theme_file_uri( 'assets/css/marketing.css' ), array( 'lexcollect' ), LEXCOLLECT_VERSION );
		wp_enqueue_script( 'lexcollect-site', get_theme_file_uri( 'assets/js/site.js' ), array(), LEXCOLLECT_VERSION, true );
	}
);

// Lets marketing.css hide inactive tab panels and stage entrance animations
// before site.js runs, so the page never jumps. Same line as in the React index.html.
add_action(
	'wp_head',
	function () {
		echo '<script>document.documentElement.classList.add("lc-js");</script>' . PHP_EOL;
	},
	1
);

add_filter(
	'wp_resource_hints',
	function ( $urls, $relation ) {
		if ( 'preconnect' === $relation ) {
			$urls[] = 'https://fonts.googleapis.com';
			$urls[] = array( 'href' => 'https://fonts.gstatic.com', 'crossorigin' );
		}
		return $urls;
	},
	10,
	2
);

// Browser-tab icon until a Site Icon is set in Settings > General.
add_action(
	'wp_head',
	function () {
		if ( ! has_site_icon() ) {
			echo '<link rel="icon" href="' . esc_url( get_theme_file_uri( 'assets/images/favicon.svg' ) ) . '" type="image/svg+xml">' . "\n";
		}
		echo '<meta name="theme-color" content="#0B2540">' . "\n";
	}
);

add_action(
	'init',
	function () {
		register_block_pattern_category( 'lexcollect', array( 'label' => __( 'LexCollect sections', 'lexcollect' ) ) );
		register_block_pattern_category( 'lexcollect-pages', array( 'label' => __( 'LexCollect full pages', 'lexcollect' ) ) );
	}
);

// Scopes the marketing stylesheet to the whole site.
add_filter(
	'body_class',
	function ( $classes ) {
		$classes[] = 'lc';
		return $classes;
	}
);

/**
 * Where "Book a call" buttons go: the booking page if set, else the Contact page.
 *
 * @return string
 */
function lexcollect_booking_url() {
	return LEXCOLLECT_BOOKING_URL ? LEXCOLLECT_BOOKING_URL : lexcollect_page_url( 'contact' );
}

/**
 * URL of a post by slug, falling back to /slug/ before the post exists.
 *
 * @param string $slug Post slug.
 * @return string
 */
function lexcollect_post_url( $slug ) {
	$post = get_page_by_path( $slug, OBJECT, 'post' );
	return $post ? get_permalink( $post ) : home_url( '/' . $slug . '/' );
}

/**
 * URL of a page by slug, falling back to /slug/ before the page exists.
 *
 * @param string $slug Page slug.
 * @return string
 */
function lexcollect_page_url( $slug ) {
	$page = get_page_by_path( $slug );
	return $page ? get_permalink( $page ) : home_url( '/' . $slug . '/' );
}

/**
 * Returns a pattern file's rendered markup so page patterns can reuse section patterns.
 *
 * @param string $name File name in /patterns without .php.
 * @return string
 */
function lexcollect_pattern( $name ) {
	$file = get_theme_file_path( 'patterns/' . sanitize_file_name( $name ) . '.php' );
	if ( ! file_exists( $file ) ) {
		return '';
	}
	ob_start();
	include $file;
	return ob_get_clean();
}

/**
 * Jetpack SEO skips the Blog (posts) page, so use the SEO title and description
 * saved on that page there. Does nothing when those fields are empty.
 *
 * @param string $key jetpack_seo_html_title or advanced_seo_description.
 * @return string
 */
function lexcollect_blog_page_seo( $key ) {
	if ( ! is_home() || is_front_page() ) {
		return '';
	}
	return trim( (string) get_post_meta( (int) get_option( 'page_for_posts' ), $key, true ) );
}

add_filter(
	'pre_get_document_title',
	function ( $title ) {
		$custom = lexcollect_blog_page_seo( 'jetpack_seo_html_title' );
		return '' !== $custom ? esc_html( $custom ) : $title;
	},
	20
);

add_filter(
	'jetpack_seo_meta_tags',
	function ( $tags ) {
		$desc = lexcollect_blog_page_seo( 'advanced_seo_description' );
		if ( '' !== $desc ) {
			$tags['description'] = $desc;
		}
		return $tags;
	}
);

add_filter(
	'jetpack_open_graph_tags',
	function ( $tags ) {
		$title = lexcollect_blog_page_seo( 'jetpack_seo_html_title' );
		$desc  = lexcollect_blog_page_seo( 'advanced_seo_description' );
		if ( '' !== $title ) {
			$tags['og:title'] = $title;
		}
		if ( '' !== $desc ) {
			$tags['og:description'] = $desc;
		}
		return $tags;
	}
);

require get_theme_file_path( 'inc/contact-form.php' );
require get_theme_file_path( 'inc/setup.php' );
