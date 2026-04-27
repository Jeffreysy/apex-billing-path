// Keep the legacy LawPay webhook slug on the same implementation as payment-received.
// LawPay may still be configured to call /functions/v1/lawpay-webhook.
import "../payment-received/index.ts";
