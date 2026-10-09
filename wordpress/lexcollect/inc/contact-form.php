<?php
/**
 * Built-in contact form, placed with the shortcode [lexcollect_contact].
 *
 * Each submission is saved under "Inquiries" in wp-admin and emailed to the
 * site admin address, so a lead is never lost if email delivery fails.
 * Change the recipient with the lexcollect_contact_recipient filter.
 *
 * @package LexCollect
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'init',
	function () {
		register_post_type(
			'lc_inquiry',
			array(
				'labels'          => array(
					'name'          => __( 'Inquiries', 'lexcollect' ),
					'singular_name' => __( 'Inquiry', 'lexcollect' ),
					'menu_name'     => __( 'Inquiries', 'lexcollect' ),
					'all_items'     => __( 'All inquiries', 'lexcollect' ),
					'edit_item'     => __( 'Inquiry', 'lexcollect' ),
					'not_found'     => __( 'No inquiries yet.', 'lexcollect' ),
				),
				'public'          => false,
				'show_ui'         => true,
				'show_in_rest'    => false,
				'menu_position'   => 26,
				'menu_icon'       => 'dashicons-email-alt',
				'supports'        => array( 'title', 'editor' ),
				'capability_type' => 'post',
				'capabilities'    => array( 'create_posts' => 'do_not_allow' ),
				'map_meta_cap'    => true,
			)
		);
	}
);

/**
 * Select options used by the form and the validator.
 *
 * @return array
 */
function lexcollect_contact_options() {
	return array(
		'size' => array( '1–10 people', '11–25 people', '26–75 people', '75+ people' ),
	);
}

add_shortcode( 'lexcollect_contact', 'lexcollect_contact_form' );

/**
 * Renders the call-request form.
 *
 * [lexcollect_contact]                        bare form (home page)
 * [lexcollect_contact heading="Request a call"] boxed form with a heading (contact page)
 *
 * @param array $atts Shortcode attributes.
 * @return string
 */
function lexcollect_contact_form( $atts = array() ) {
	$atts    = shortcode_atts( array( 'heading' => '' ), $atts, 'lexcollect_contact' );
	$heading = trim( (string) $atts['heading'] );
	// Read-only status flag from our own redirect; no data is changed here.
	$status   = isset( $_GET['lc_sent'] ) ? sanitize_key( wp_unslash( $_GET['lc_sent'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$messages = array(
		'ok'      => array( '', __( 'Thanks, your request is in. We reply within one business day.', 'lexcollect' ) ),
		'invalid' => array( 'form-status--error', __( 'Please add your name, firm, a valid email, what your firm does and its size, then send again.', 'lexcollect' ) ),
		'limit'   => array( 'is-error', __( 'We received several requests from your network in the last hour. Please email us instead.', 'lexcollect' ) ),
	);
	$opts     = lexcollect_contact_options();

	ob_start();
	?>
	<form class="form<?php echo $heading ? ' contact-card' : ''; ?>" id="lc-contact" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<?php if ( $heading ) : ?>
			<h2 style="font-size:var(--fs-2xl)"><?php echo esc_html( $heading ); ?></h2>
		<?php endif; ?>
		<?php if ( isset( $messages[ $status ] ) ) : ?>
			<p class="form-status <?php echo esc_attr( $messages[ $status ][0] ); ?>" role="status"><?php echo esc_html( $messages[ $status ][1] ); ?></p>
		<?php endif; ?>
		<div class="form-row">
			<div class="field"><label for="lc-name"><?php esc_html_e( 'Full name', 'lexcollect' ); ?></label><input id="lc-name" name="lc_name" type="text" autocomplete="name" required maxlength="120"></div>
			<div class="field"><label for="lc-firm"><?php esc_html_e( 'Firm name', 'lexcollect' ); ?></label><input id="lc-firm" name="lc_firm" type="text" autocomplete="organization" required maxlength="160"></div>
		</div>
		<div class="form-row">
			<div class="field"><label for="lc-email"><?php esc_html_e( 'Work email', 'lexcollect' ); ?></label><input id="lc-email" name="lc_email" type="email" autocomplete="email" required maxlength="160"></div>
			<div class="field"><label for="lc-phone"><?php esc_html_e( 'Phone', 'lexcollect' ); ?> <span class="opt"><?php esc_html_e( '(optional)', 'lexcollect' ); ?></span></label><input id="lc-phone" name="lc_phone" type="tel" autocomplete="tel" maxlength="40"></div>
		</div>
		<div class="form-row">
			<div class="field"><label for="lc-firmtype"><?php esc_html_e( 'What your firm does', 'lexcollect' ); ?></label><input id="lc-firmtype" name="lc_firmtype" type="text" required maxlength="120" placeholder="<?php esc_attr_e( 'e.g. professional services with payment plans', 'lexcollect' ); ?>"></div>
			<div class="field">
				<label for="lc-size"><?php esc_html_e( 'Firm size', 'lexcollect' ); ?></label>
				<select id="lc-size" name="lc_size" required>
					<option value=""><?php esc_html_e( 'Choose one', 'lexcollect' ); ?></option>
					<?php foreach ( $opts['size'] as $o ) : ?>
						<option><?php echo esc_html( $o ); ?></option>
					<?php endforeach; ?>
				</select>
			</div>
		</div>
		<div class="field"><label for="lc-systems"><?php esc_html_e( 'Systems you use', 'lexcollect' ); ?> <span class="opt"><?php esc_html_e( '(client management, payments, accounting)', 'lexcollect' ); ?></span></label><input id="lc-systems" name="lc_systems" type="text" maxlength="300" placeholder="<?php esc_attr_e( 'e.g. MyCase, LawPay, QuickBooks', 'lexcollect' ); ?>"></div>
		<div class="field"><label for="lc-message"><?php esc_html_e( "What's going on?", 'lexcollect' ); ?> <span class="opt"><?php esc_html_e( '(optional)', 'lexcollect' ); ?></span></label><textarea id="lc-message" name="lc_message" maxlength="4000" placeholder="<?php esc_attr_e( 'Unmatched payments, a growing unapplied balance, payment plans that drift...', 'lexcollect' ); ?>"></textarea></div>
		<div class="hp" aria-hidden="true"><label for="lc-website">Website</label><input id="lc-website" name="lc_website" type="text" tabindex="-1" autocomplete="off"></div>
		<input type="hidden" name="action" value="lexcollect_contact">
		<input type="hidden" name="lc_ts" value="<?php echo esc_attr( time() ); ?>">
		<input type="hidden" name="lc_return" value="<?php echo esc_url( get_permalink() ); ?>">
		<div>
			<button type="submit" class="btn btn--primary"><?php esc_html_e( 'Request my call', 'lexcollect' ); ?> <span class="arrow" aria-hidden="true">&rarr;</span></button>
			<p class="form-note" style="margin-top:0.9rem"><?php esc_html_e( "We'll only use your details to respond to this request.", 'lexcollect' ); ?></p>
		</div>
	</form>
	<?php
	return ob_get_clean();
}

add_action( 'admin_post_nopriv_lexcollect_contact', 'lexcollect_handle_contact' );
add_action( 'admin_post_lexcollect_contact', 'lexcollect_handle_contact' );

/**
 * Validates, stores and emails a submission, then redirects back to the form.
 *
 * No nonce: this is a public, logged-out form, so a nonce adds no CSRF
 * protection and would break on cached pages. Spam is handled with a
 * honeypot field, a minimum fill time and a per-IP hourly limit.
 */
function lexcollect_handle_contact() {
	// phpcs:disable WordPress.Security.NonceVerification.Missing
	$return = isset( $_POST['lc_return'] ) ? esc_url_raw( wp_unslash( $_POST['lc_return'] ) ) : '';
	$return = wp_validate_redirect( $return, home_url( '/' ) );
	$back   = function ( $code ) use ( $return ) {
		wp_safe_redirect( add_query_arg( 'lc_sent', $code, $return ) . '#lc-contact' );
		exit;
	};

	// Bots get a normal-looking success so they don't retry.
	$ts = isset( $_POST['lc_ts'] ) ? absint( $_POST['lc_ts'] ) : 0;
	if ( ! empty( $_POST['lc_website'] ) || ! $ts || time() - $ts < 3 ) {
		$back( 'ok' );
	}

	$ip    = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
	$key   = 'lc_contact_' . md5( $ip );
	$count = (int) get_transient( $key );
	if ( $count >= 5 ) {
		$back( 'limit' );
	}
	set_transient( $key, $count + 1, HOUR_IN_SECONDS );

	$opts = lexcollect_contact_options();
	$get  = function ( $field, $cb = 'sanitize_text_field' ) {
		return isset( $_POST[ $field ] ) ? call_user_func( $cb, wp_unslash( $_POST[ $field ] ) ) : '';
	};
	$data = array(
		'Name'           => $get( 'lc_name' ),
		'Firm'           => $get( 'lc_firm' ),
		'Email'          => $get( 'lc_email', 'sanitize_email' ),
		'Phone'          => $get( 'lc_phone' ),
		'Firm type'      => $get( 'lc_firmtype' ),
		'Firm size'      => $get( 'lc_size' ),
		'Systems'        => $get( 'lc_systems' ),
		'Message'        => $get( 'lc_message', 'sanitize_textarea_field' ),
	);
	// phpcs:enable

	if ( '' === $data['Name'] || '' === $data['Firm'] || ! is_email( $data['Email'] )
		|| '' === $data['Firm type']
		|| ! in_array( $data['Firm size'], $opts['size'], true ) ) {
		$back( 'invalid' );
	}

	$lines = array();
	foreach ( $data as $label => $value ) {
		if ( '' !== $value ) {
			$lines[] = $label . ': ' . $value;
		}
	}
	$body = implode( "\n", $lines );

	wp_insert_post(
		array(
			'post_type'    => 'lc_inquiry',
			'post_status'  => 'private',
			'post_title'   => $data['Firm'] . ' (' . $data['Name'] . ')',
			'post_content' => $body,
		)
	);

	$to = apply_filters( 'lexcollect_contact_recipient', get_option( 'admin_email' ) );
	wp_mail(
		$to,
		/* translators: 1: firm name, 2: person's name */
		sprintf( __( 'New call request: %1$s (%2$s)', 'lexcollect' ), $data['Firm'], $data['Name'] ),
		$body . "\n\n" . __( 'All inquiries:', 'lexcollect' ) . ' ' . admin_url( 'edit.php?post_type=lc_inquiry' ),
		array( 'Reply-To: ' . $data['Name'] . ' <' . $data['Email'] . '>' )
	);

	$back( 'ok' );
}
