import { Link } from "react-router-dom";
import { FaqList, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";
import DiagnosticForm from "@/components/marketing/DiagnosticForm";
import { CONTACT_EMAIL, MARKETING_ROUTES } from "@/lib/marketing";

export const CONTACT_META = {
  title: "Book a Call About Your Firm's Receivables and Client Trust | LexCollect",
  description:
    "Tell us about your immigration practice and the systems you use. We'll show you where payments are going unseen, which families have lost touch, and what a respectful message would bring back.",
};

const FAQS = [
  {
    q: "Do we need to be an immigration firm?",
    a: "LexCollect is built for immigration and humanitarian practices, where payment plans, family payers and client trust matter most. Other firms that bill on payment plans fit too. Tell us what your firm does and which systems you run, and we'll tell you honestly how well LexCollect fits.",
  },
  {
    q: "What should we have ready for the call?",
    a: "The names of your case management, payment, accounting and banking systems, plus a rough sense of how many active payment plans or open cases you carry. No exports are needed for a first conversation.",
  },
  {
    q: "Who from our firm should join?",
    a: "Whoever knows where the money goes: usually the owner or managing partner, plus the administrator, controller or bookkeeper.",
  },
];

const ContactPage = () => {
  usePageMeta(CONTACT_META.title, CONTACT_META.description);

  return (
    <SiteShell>
      <section className="ct-hero">
        <div className="container">
          <div className="ct-hero__grid">
            <div className="ct-hero__copy">
              <p className="breadcrumb">
                <Link to={MARKETING_ROUTES.home}>Home</Link> / Contact
              </p>
              <p className="eyebrow">Book a call</p>
              <h1>Book a call about your receivables, and the families behind them.</h1>
              <p className="lead">
                Tell us about your practice and the systems you use. We'll show you where payments are going unseen,
                which families have quietly lost touch, and what a respectful message would bring back.
              </p>
              <ol className="next-steps">
                <li>
                  <b>We reply within one business day</b>
                  <span>to set up a time that works for your team.</span>
                </li>
                <li>
                  <b>We walk through your systems</b>
                  <span>Your case management, payment and accounting tools, and where payments seem to go missing.</span>
                </li>
                <li>
                  <b>You see what's fixable</b>
                  <span>A first view of where money is stuck, by cause, and which families your team could reconnect with first.</span>
                </li>
              </ol>
              <p className="hm-start__alt">
                Prefer email? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                <br />
                Already a client? <Link to={MARKETING_ROUTES.login}>Log in to your workspace</Link>
              </p>
            </div>
            <div className="hm-start__form ct-form">
              <p className="ct-form__title">Request a call</p>
              <DiagnosticForm sourcePage="contact" idPrefix="contact" />
            </div>
          </div>
        </div>
      </section>

      <section className="section section--deep section--rule">
        <div className="container">
          <div className="split">
            <div data-reveal>
              <p className="eyebrow">Before you book</p>
              <h2>Common questions</h2>
            </div>
            <FaqList items={FAQS} />
          </div>
        </div>
      </section>
    </SiteShell>
  );
};

export default ContactPage;
