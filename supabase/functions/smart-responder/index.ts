// Keep the oldest LawPay webhook slug on the same implementation as payment-received.
// Some LawPay/Zapier configurations may still call /functions/v1/smart-responder.
import "../payment-received/index.ts";
