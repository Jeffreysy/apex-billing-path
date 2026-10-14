<?php
/**
 * Branded confirmation email for the visitor after a call request.
 *
 * Email clients ignore stylesheets and most modern CSS, so the layout is a
 * 600px table with inline styles, web-safe fallbacks for IBM Plex, and a PNG
 * logo (Gmail and Outlook drop SVG). The wordmark is live text, so the email
 * still reads as LexCollect with images off. A plain-text part goes with it.
 *
 * The visitor types the address, so anyone could aim this email at a stranger.
 * To keep it useless as a spam relay it repeats only short, link-free answers
 * and never the free-text message. The form's honeypot, minimum fill time and
 * per-IP hourly limit apply before anything is sent.
 *
 * @package LexCollect
 */

/**
 * Brand palette, from marketing.css.
 */
function lexcollect_email_colors() {
	return array(
		'ink'       => '#0B2540',
		'navy'      => '#123A63',
		'teal'      => '#12A594',
		'teal_deep' => '#0E7C6F',
		'mist'      => '#F1F4F7',
		'slate'     => '#5A6B7D',
		'line'      => '#D6DEE6',
		'white'     => '#FFFFFF',
	);
}

/**
 * A visitor's answer, if it is safe to repeat back: short and with nothing
 * that reads as a link or address. Otherwise ''.
 *
 * @param string $value Sanitized form value.
 * @param int    $max   Longest value to repeat.
 */
function lexcollect_email_echo( $value, $max = 80 ) {
	$value = trim( (string) $value );
	if ( '' === $value || mb_strlen( $value ) > $max ) {
		return '';
	}
	if ( preg_match( '~https?:|www\.|@|[a-z0-9-]\.[a-z]{2,}\b~i', $value ) ) {
		return '';
	}
	return $value;
}

/**
 * First name for the greeting, or '' when the name field holds anything but a name.
 *
 * @param string $name Full name from the form.
 */
function lexcollect_email_first_name( $name ) {
	$first = strtok( trim( (string) $name ), " \t" );
	return ( false !== $first && preg_match( "/^\p{L}[\p{L}'’\-]{0,29}$/u", $first ) ) ? $first : '';
}

/**
 * Builds the email.
 *
 * @param array $data Sanitized submission, keyed by the labels in lexcollect_handle_contact().
 * @return array { subject, html, text }
 */
function lexcollect_confirmation_email( array $data ) {
	$c       = lexcollect_email_colors();
	$first   = lexcollect_email_first_name( $data['Name'] ?? '' );
	$site    = home_url( '/' );
	$host    = wp_parse_url( $site, PHP_URL_HOST );
	$inbox   = LEXCOLLECT_CONTACT_EMAIL;
	$booking = LEXCOLLECT_BOOKING_URL;
	$logo    = get_theme_file_uri( 'assets/images/email-mark.png' );

	$subject   = __( 'Your LexCollect call request is in', 'lexcollect' );
	$preheader = __( "We reply within one business day. Here's what happens next.", 'lexcollect' );
	/* translators: %s: the visitor's first name */
	$heading = $first ? sprintf( __( 'Thanks, %s. Your request is in.', 'lexcollect' ), $first ) : __( 'Thanks. Your request is in.', 'lexcollect' );
	$intro   = __( "We'll reply within one business day to set a time that works for your team. Here's what happens next.", 'lexcollect' );

	$steps = array(
		array( __( 'We reply within one business day', 'lexcollect' ), __( 'to set a time that works for your team.', 'lexcollect' ) ),
		array( __( 'We walk through your systems', 'lexcollect' ), __( 'Your case management, payment and accounting tools, and where payments seem to go missing.', 'lexcollect' ) ),
		array( __( "You see what's recoverable", 'lexcollect' ), __( 'Late, never credited, failed-card and ready-to-reconnect, with a dollar figure on each.', 'lexcollect' ) ),
	);

	$answers = array_filter(
		array(
			__( 'Firm', 'lexcollect' )      => lexcollect_email_echo( $data['Firm'] ?? '' ),
			__( 'Firm size', 'lexcollect' ) => lexcollect_email_echo( $data['Firm size'] ?? '' ),
			__( 'Systems', 'lexcollect' )   => lexcollect_email_echo( $data['Systems'] ?? '', 120 ),
		)
	);

	$serif = "'IBM Plex Serif', Georgia, 'Times New Roman', serif";
	$sans  = "'IBM Plex Sans', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
	$mono  = "'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace";

	ob_start();
	?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title><?php echo esc_html( $subject ); ?></title>
</head>
<body style="margin:0;padding:0;background:<?php echo esc_attr( $c['mist'] ); ?>;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;"><?php echo esc_html( $preheader ); ?>&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:<?php echo esc_attr( $c['mist'] ); ?>;">
<tr><td align="center" style="padding:32px 12px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

<tr><td style="background:<?php echo esc_attr( $c['ink'] ); ?>;padding:26px 36px;">
	<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
		<td style="vertical-align:middle;padding-right:12px;"><img src="<?php echo esc_url( $logo ); ?>" width="26" height="29" alt="" style="display:block;border:0;"></td>
		<td style="vertical-align:middle;font-size:21px;line-height:1;font-weight:600;letter-spacing:-0.01em;color:<?php echo esc_attr( $c['white'] ); ?>;"><span style="font-family:<?php echo esc_attr( $serif ); ?>;">Lex</span><span style="font-family:<?php echo esc_attr( $sans ); ?>;">Collect</span></td>
	</tr></table>
</td></tr>
<tr><td style="background:<?php echo esc_attr( $c['teal'] ); ?>;height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>

<tr><td style="background:<?php echo esc_attr( $c['white'] ); ?>;padding:40px 36px 36px;font-family:<?php echo esc_attr( $sans ); ?>;color:<?php echo esc_attr( $c['ink'] ); ?>;">
	<p style="margin:0 0 14px;font-size:12px;line-height:1.4;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:<?php echo esc_attr( $c['teal_deep'] ); ?>;"><?php esc_html_e( 'Request received', 'lexcollect' ); ?></p>
	<h1 style="margin:0 0 16px;font-family:<?php echo esc_attr( $serif ); ?>;font-size:28px;line-height:1.2;font-weight:600;letter-spacing:-0.01em;color:<?php echo esc_attr( $c['ink'] ); ?>;"><?php echo esc_html( $heading ); ?></h1>
	<p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:<?php echo esc_attr( $c['slate'] ); ?>;"><?php echo esc_html( $intro ); ?></p>

	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
	<?php foreach ( $steps as $i => $step ) : ?>
		<tr>
			<td valign="top" style="width:40px;padding:14px 0;border-top:1px solid <?php echo esc_attr( $c['line'] ); ?>;font-family:<?php echo esc_attr( $mono ); ?>;font-size:13px;line-height:1.6;font-weight:500;color:<?php echo esc_attr( $c['teal_deep'] ); ?>;"><?php echo esc_html( sprintf( '%02d', $i + 1 ) ); ?></td>
			<td valign="top" style="padding:14px 0;border-top:1px solid <?php echo esc_attr( $c['line'] ); ?>;font-size:15px;line-height:1.55;color:<?php echo esc_attr( $c['slate'] ); ?>;"><b style="color:<?php echo esc_attr( $c['ink'] ); ?>;font-weight:600;"><?php echo esc_html( $step[0] ); ?></b><br><?php echo esc_html( $step[1] ); ?></td>
		</tr>
	<?php endforeach; ?>
	</table>

	<?php if ( $answers ) : ?>
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
		<tr><td style="background:<?php echo esc_attr( $c['mist'] ); ?>;border-left:3px solid <?php echo esc_attr( $c['teal'] ); ?>;padding:18px 20px;">
			<p style="margin:0 0 10px;font-size:12px;line-height:1.4;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:<?php echo esc_attr( $c['slate'] ); ?>;"><?php esc_html_e( 'What you told us', 'lexcollect' ); ?></p>
			<?php foreach ( $answers as $label => $value ) : ?>
				<p style="margin:0 0 4px;font-size:15px;line-height:1.5;color:<?php echo esc_attr( $c['ink'] ); ?>;"><span style="color:<?php echo esc_attr( $c['slate'] ); ?>;"><?php echo esc_html( $label ); ?>:</span> <?php echo esc_html( $value ); ?></p>
			<?php endforeach; ?>
		</td></tr>
	</table>
	<?php endif; ?>

	<?php if ( $booking ) : ?>
	<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
		<tr><td style="background:<?php echo esc_attr( $c['teal'] ); ?>;">
			<a href="<?php echo esc_url( $booking ); ?>" style="display:inline-block;padding:14px 24px;font-family:<?php echo esc_attr( $sans ); ?>;font-size:15px;line-height:1;font-weight:600;color:<?php echo esc_attr( $c['ink'] ); ?>;text-decoration:none;"><?php esc_html_e( 'Pick a time now', 'lexcollect' ); ?> &rarr;</a>
		</td></tr>
	</table>
	<?php endif; ?>

	<p style="margin:32px 0 0;font-size:15px;line-height:1.6;color:<?php echo esc_attr( $c['slate'] ); ?>;"><?php esc_html_e( 'Questions before we talk? Reply to this email, or write to', 'lexcollect' ); ?> <a href="mailto:<?php echo esc_attr( $inbox ); ?>" style="color:<?php echo esc_attr( $c['teal_deep'] ); ?>;font-weight:600;text-decoration:none;white-space:nowrap;"><?php echo esc_html( $inbox ); ?></a>.</p>
	<p style="margin:20px 0 0;font-size:15px;line-height:1.6;color:<?php echo esc_attr( $c['ink'] ); ?>;"><?php esc_html_e( 'The LexCollect team', 'lexcollect' ); ?></p>
</td></tr>

<tr><td style="padding:24px 36px 8px;font-family:<?php echo esc_attr( $sans ); ?>;font-size:12px;line-height:1.6;color:<?php echo esc_attr( $c['slate'] ); ?>;">
	<p style="margin:0 0 8px;"><b style="color:<?php echo esc_attr( $c['navy'] ); ?>;">LexCollect</b> &middot; <?php esc_html_e( 'Accounts receivable for firms', 'lexcollect' ); ?> &middot; <a href="<?php echo esc_url( $site ); ?>" style="color:<?php echo esc_attr( $c['slate'] ); ?>;white-space:nowrap;"><?php echo esc_html( $host ); ?></a></p>
	<?php /* translators: %s: the site's domain */ ?>
	<p style="margin:0;"><?php echo esc_html( sprintf( __( "You're getting this because this address was used to request a call at %s. If that wasn't you, ignore this email; we won't write again unless you reply.", 'lexcollect' ), $host ) ); ?></p>
</td></tr>

</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>
	<?php
	$html = ob_get_clean();

	$text = array( $heading, '', $intro, '' );
	foreach ( $steps as $i => $step ) {
		$text[] = sprintf( '%02d  %s', $i + 1, $step[0] );
		$text[] = '    ' . $step[1];
	}
	if ( $answers ) {
		$text[] = '';
		$text[] = __( 'What you told us', 'lexcollect' );
		foreach ( $answers as $label => $value ) {
			$text[] = $label . ': ' . $value;
		}
	}
	if ( $booking ) {
		$text[] = '';
		$text[] = __( 'Pick a time now:', 'lexcollect' ) . ' ' . $booking;
	}
	$text[] = '';
	$text[] = __( 'Questions before we talk? Reply to this email, or write to', 'lexcollect' ) . ' ' . $inbox . '.';
	$text[] = '';
	$text[] = __( 'The LexCollect team', 'lexcollect' );
	$text[] = $site;

	return array(
		'subject' => $subject,
		'html'    => $html,
		'text'    => implode( "\n", $text ),
	);
}

/**
 * Sends the confirmation from "LexCollect", with replies going to the firm inbox.
 *
 * The sending address stays WordPress's own (or the SMTP plugin's), so the
 * email passes the domain's SPF and DKIM checks; only the display name changes.
 *
 * @param array $data Sanitized submission.
 * @return bool Whether the mailer accepted the message.
 */
function lexcollect_send_confirmation( array $data ) {
	$email     = lexcollect_confirmation_email( $data );
	$from_name = static function () {
		return 'LexCollect';
	};
	$alt_body  = static function ( $phpmailer ) use ( $email ) {
		$phpmailer->AltBody = $email['text']; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	};

	add_filter( 'wp_mail_from_name', $from_name );
	add_action( 'phpmailer_init', $alt_body );
	$sent = wp_mail(
		$data['Email'],
		$email['subject'],
		$email['html'],
		array(
			'Content-Type: text/html; charset=UTF-8',
			'Reply-To: LexCollect <' . LEXCOLLECT_CONTACT_EMAIL . '>',
		)
	);
	remove_action( 'phpmailer_init', $alt_body );
	remove_filter( 'wp_mail_from_name', $from_name );

	return $sent;
}
