<?php
/**
 * Title: Post grid
 * Slug: lexcollect/post-grid
 * Categories: lexcollect, query
 * Keywords: blog, posts, query, grid
 * Inserter: no
 * Description: Three-column grid of article cards with pagination. Used by the blog, archive and search templates.
 *
 * @package LexCollect
 */

?>
<!-- wp:group {"tagName":"section","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|80"}}},"layout":{"type":"constrained"}} -->
<section class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--80)"><!-- wp:query {"queryId":1,"query":{"perPage":9,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":true},"align":"wide","className":"lc-post-grid"} -->
<div class="wp-block-query alignwide lc-post-grid"><!-- wp:post-template {"style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":"18rem"}} -->
<!-- wp:group {"className":"lc-post-card","layout":{"type":"default"}} -->
<div class="wp-block-group lc-post-card"><!-- wp:group {"className":"lc-post-cover","layout":{"type":"default"}} -->
<div class="wp-block-group lc-post-cover"><!-- wp:post-featured-image {"isLink":true,"aspectRatio":"16/9"} /--></div>
<!-- /wp:group -->

<!-- wp:group {"className":"lc-post-card__body","layout":{"type":"default"}} -->
<div class="wp-block-group lc-post-card__body"><!-- wp:post-terms {"term":"category"} /-->

<!-- wp:post-title {"level":3,"isLink":true} /-->

<!-- wp:post-excerpt {"moreText":"Read →","excerptLength":24} /-->

<!-- wp:post-date /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- /wp:post-template -->

<!-- wp:query-pagination {"layout":{"type":"flex","justifyContent":"space-between"}} -->
<!-- wp:query-pagination-previous /-->

<!-- wp:query-pagination-numbers /-->

<!-- wp:query-pagination-next /-->
<!-- /wp:query-pagination -->

<!-- wp:query-no-results -->
<!-- wp:paragraph {"className":"lc-muted"} -->
<p class="lc-muted">No articles here yet. Check back soon.</p>
<!-- /wp:paragraph -->
<!-- /wp:query-no-results --></div>
<!-- /wp:query --></section>
<!-- /wp:group -->
