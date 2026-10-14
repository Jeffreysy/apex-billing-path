<?php
/**
 * One-click starter content: Appearance > LexCollect setup.
 *
 * Creates the Home, About, Platform, Results, Blog and Contact pages from the theme's
 * page patterns, sets Home as the front page and Blog as the posts page, and
 * adds a starter article as a draft. Pages that already exist are left alone.
 *
 * @package LexCollect
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Pages the setup creates, keyed by slug.
 *
 * @return array
 */
function lexcollect_setup_pages() {
	return array(
		'home'     => array( 'title' => 'Home', 'pattern' => 'page-home', 'template' => 'page-marketing' ),
		'about'    => array( 'title' => 'About', 'pattern' => 'page-about', 'template' => 'page-marketing' ),
		'platform' => array( 'title' => 'Platform', 'pattern' => 'page-platform', 'template' => 'page-marketing' ),
		'results'  => array( 'title' => 'Results', 'pattern' => 'page-results', 'template' => 'page-marketing' ),
		'blog'     => array( 'title' => 'Blog', 'pattern' => '', 'template' => '' ),
		'contact'  => array( 'title' => 'Contact', 'pattern' => 'page-contact', 'template' => 'page-marketing' ),
	);
}

add_action(
	'admin_menu',
	function () {
		add_theme_page(
			__( 'LexCollect setup', 'lexcollect' ),
			__( 'LexCollect setup', 'lexcollect' ),
			'edit_theme_options',
			'lexcollect-setup',
			'lexcollect_setup_screen'
		);
	}
);

add_action(
	'admin_notices',
	function () {
		if ( get_option( 'lexcollect_setup_done' ) || ! current_user_can( 'edit_theme_options' ) ) {
			return;
		}
		$screen = get_current_screen();
		if ( ! $screen || ! in_array( $screen->id, array( 'themes', 'dashboard' ), true ) ) {
			return;
		}
		printf(
			'<div class="notice notice-info"><p><strong>%1$s</strong> %2$s <a class="button button-primary" style="margin-left:8px" href="%3$s">%4$s</a></p></div>',
			esc_html__( 'LexCollect theme is active.', 'lexcollect' ),
			esc_html__( 'Create the Home, About, Platform, Results, Blog and Contact pages in one click.', 'lexcollect' ),
			esc_url( admin_url( 'themes.php?page=lexcollect-setup' ) ),
			esc_html__( 'Open setup', 'lexcollect' )
		);
	}
);

/**
 * Renders the setup screen.
 */
function lexcollect_setup_screen() {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		return;
	}
	$done = get_option( 'lexcollect_setup_done' );
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'LexCollect setup', 'lexcollect' ); ?></h1>
		<?php if ( $done ) : ?>
			<div class="notice notice-success inline"><p><?php esc_html_e( 'Setup has run. Your pages are listed below.', 'lexcollect' ); ?></p></div>
		<?php endif; ?>
		<p style="max-width:640px"><?php esc_html_e( 'This creates your six pages with the designed layouts and copy, makes Home your front page and Blog your posts page, and saves a starter article as a draft. Pages that already exist (matched by their web address) are not touched, so it is safe to run again.', 'lexcollect' ); ?></p>
		<table class="widefat striped" style="max-width:640px;margin:16px 0">
			<thead><tr><th><?php esc_html_e( 'Page', 'lexcollect' ); ?></th><th><?php esc_html_e( 'Status', 'lexcollect' ); ?></th></tr></thead>
			<tbody>
			<?php foreach ( lexcollect_setup_pages() as $slug => $p ) : ?>
				<?php $page = get_page_by_path( $slug ); ?>
				<tr>
					<td><?php echo esc_html( $p['title'] ); ?> <code>/<?php echo esc_html( $slug ); ?>/</code></td>
					<td>
						<?php if ( $page ) : ?>
							<?php esc_html_e( 'Exists', 'lexcollect' ); ?> &middot;
							<a href="<?php echo esc_url( get_edit_post_link( $page ) ); ?>"><?php esc_html_e( 'Edit', 'lexcollect' ); ?></a> &middot;
							<a href="<?php echo esc_url( get_permalink( $page ) ); ?>"><?php esc_html_e( 'View', 'lexcollect' ); ?></a>
						<?php else : ?>
							<?php esc_html_e( 'Will be created', 'lexcollect' ); ?>
						<?php endif; ?>
					</td>
				</tr>
			<?php endforeach; ?>
			</tbody>
		</table>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="lexcollect_setup">
			<?php wp_nonce_field( 'lexcollect_setup' ); ?>
			<?php submit_button( $done ? __( 'Create any missing pages', 'lexcollect' ) : __( 'Create my pages', 'lexcollect' ) ); ?>
		</form>
		<h2><?php esc_html_e( 'Next steps', 'lexcollect' ); ?></h2>
		<ol style="max-width:640px">
			<li><?php esc_html_e( 'Replace every yellow "Placeholder" or "Add figure" tag and every [bracketed] field with real content.', 'lexcollect' ); ?></li>
			<li><?php esc_html_e( 'Set LEXCOLLECT_BOOKING_URL (your Google Calendar booking page) and LEXCOLLECT_APP_LOGIN_URL at the top of functions.php.', 'lexcollect' ); ?></li>
			<li><?php esc_html_e( 'Set your Site Icon in Settings > General (use lexcollect-site-icon-512.png from the Brand folder).', 'lexcollect' ); ?></li>
			<li><?php esc_html_e( 'Call requests are saved under Inquiries, emailed to the addresses below, and confirmed to the visitor by email. The Inquiries list shows whether each email went out.', 'lexcollect' ); ?></li>
			<li><?php esc_html_e( 'Change colors, fonts and spacing site-wide in Appearance > Editor > Styles.', 'lexcollect' ); ?></li>
		</ol>

		<h2 id="lc-test-mail"><?php esc_html_e( 'Test email delivery', 'lexcollect' ); ?></h2>
		<?php $result = get_transient( 'lexcollect_test_mail_' . get_current_user_id() ); ?>
		<?php if ( $result ) : ?>
			<?php delete_transient( 'lexcollect_test_mail_' . get_current_user_id() ); ?>
			<div class="notice inline <?php echo false !== strpos( $result, 'failed' ) ? 'notice-error' : 'notice-success'; ?>">
				<p><?php echo esc_html( $result ); ?></p>
			</div>
		<?php endif; ?>
		<p style="max-width:640px">
			<?php
			/* translators: %s: comma-separated email addresses */
			echo esc_html( sprintf( __( 'Call requests are emailed to: %s.', 'lexcollect' ), implode( ', ', lexcollect_contact_recipients() ) ) );
			echo ' ';
			esc_html_e( 'This sends those addresses a test message, and sends you a sample of the confirmation a visitor gets. If either is missing after a few minutes, check spam, then install WP Mail SMTP and connect it to the firm mailbox.', 'lexcollect' );
			?>
		</p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="lexcollect_test_mail">
			<?php wp_nonce_field( 'lexcollect_test_mail' ); ?>
			<?php submit_button( __( 'Send a test email', 'lexcollect' ), 'secondary' ); ?>
		</form>
	</div>
	<?php
}

add_action(
	'admin_post_lexcollect_test_mail',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to send a test email.', 'lexcollect' ) );
		}
		check_admin_referer( 'lexcollect_test_mail' );

		$user = wp_get_current_user();
		$to   = lexcollect_contact_recipients();
		$firm = lexcollect_mail(
			$to,
			__( 'LexCollect test: call requests reach this inbox', 'lexcollect' ),
			__( 'This is a test from your website. If you can read it, call requests from the booking form will reach this inbox.', 'lexcollect' )
		);
		$sample = lexcollect_send_confirmation(
			array(
				'Name'      => $user->display_name,
				'Firm'      => get_bloginfo( 'name' ),
				'Email'     => $user->user_email,
				'Firm size' => '',
				'Systems'   => '',
			)
		);

		set_transient(
			'lexcollect_test_mail_' . get_current_user_id(),
			/* translators: 1: result for the firm addresses, 2: those addresses, 3: result for the sample, 4: your address */
			sprintf( __( 'Test to the firm: %1$s (%2$s). Sample confirmation to you: %3$s (%4$s).', 'lexcollect' ), $firm, implode( ', ', $to ), $sample, $user->user_email ),
			5 * MINUTE_IN_SECONDS
		);
		wp_safe_redirect( admin_url( 'themes.php?page=lexcollect-setup#lc-test-mail' ) );
		exit;
	}
);

add_action(
	'admin_post_lexcollect_setup',
	function () {
		if ( ! current_user_can( 'edit_theme_options' ) || ! current_user_can( 'publish_pages' ) ) {
			wp_die( esc_html__( 'You do not have permission to run setup.', 'lexcollect' ) );
		}
		check_admin_referer( 'lexcollect_setup' );

		$ids = array();
		foreach ( lexcollect_setup_pages() as $slug => $p ) {
			$existing = get_page_by_path( $slug );
			if ( $existing ) {
				$ids[ $slug ] = $existing->ID;
				continue;
			}
			$id = wp_insert_post(
				array(
					'post_type'    => 'page',
					'post_status'  => 'publish',
					'post_title'   => $p['title'],
					'post_name'    => $slug,
					'post_content' => $p['pattern'] ? lexcollect_pattern( $p['pattern'] ) : '',
				),
				true
			);
			if ( is_wp_error( $id ) ) {
				continue;
			}
			if ( $p['template'] ) {
				update_post_meta( $id, '_wp_page_template', $p['template'] );
			}
			$ids[ $slug ] = $id;
		}

		if ( ! empty( $ids['home'] ) && ! empty( $ids['blog'] ) ) {
			update_option( 'show_on_front', 'page' );
			update_option( 'page_on_front', $ids['home'] );
			update_option( 'page_for_posts', $ids['blog'] );
		}

		foreach ( array( 'Reconciliation', 'Payment plans', 'Collections', 'Operations' ) as $cat ) {
			if ( ! term_exists( $cat, 'category' ) ) {
				wp_insert_term( $cat, 'category' );
			}
		}

		$article_slug = 'immigration-firms-lose-money-between-systems';
		if ( ! get_page_by_path( $article_slug, OBJECT, 'post' ) ) {
			$cat = get_term_by( 'name', 'Reconciliation', 'category' );
			wp_insert_post(
				array(
					'post_type'     => 'post',
					'post_status'   => 'draft',
					'post_title'    => 'Where Immigration Firms Lose Money, and Trust, Between the Case System and the Bank',
					'post_name'     => $article_slug,
					'post_excerpt'  => 'Payment plans, payments from relatives and sponsors, and batched deposits. Five places immigration firms lose track of money families have already paid, what it costs the relationship, and how to find it.',
					'post_content'  => lexcollect_pattern( 'post-article' ),
					'post_category' => $cat ? array( (int) $cat->term_id ) : array(),
				)
			);
		}

		update_option( 'lexcollect_setup_done', time() );
		wp_safe_redirect( admin_url( 'themes.php?page=lexcollect-setup' ) );
		exit;
	}
);
