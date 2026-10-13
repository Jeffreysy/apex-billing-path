<?php
/**
 * Title: Call to action
 * Slug: lexcollect/cta
 * Categories: lexcollect, call-to-action
 * Keywords: cta, call to action, book, call, banner
 * Viewport Width: 1400
 * Description: Navy band with the L-bracket, headline and two buttons.
 *
 * @package LexCollect
 */

?>
<!-- wp:group {"tagName":"section","align":"full","className":"lc-cta","backgroundColor":"navy","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}},"layout":{"type":"constrained"}} -->
<section class="wp-block-group alignfull lc-cta has-navy-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)"><!-- wp:group {"align":"wide","layout":{"type":"constrained","contentSize":"820px","justifyContent":"left"}} -->
<div class="wp-block-group alignwide"><!-- wp:paragraph {"className":"lc-eyebrow"} -->
<p class="lc-eyebrow">Book a call</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">See what your own book says.</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"lc-lead"} -->
<p class="lc-lead">One conversation, your systems, and a first look at what's late, what's unmatched and which clients one message would bring back.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--50)"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( lexcollect_booking_url() ); ?>">Book a call →</a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( lexcollect_page_url( 'platform' ) ); ?>">Explore the platform</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group --></section>
<!-- /wp:group -->
