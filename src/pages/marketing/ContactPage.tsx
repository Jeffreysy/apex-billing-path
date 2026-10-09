import { Link } from "react-router-dom";
import { FaqList, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";
import DiagnosticForm from "@/components/marketing/DiagnosticForm";
import { CONTACT_EMAIL, MARKETING_ROUTES } from "@/lib/marketing";

export const CONTACT_META = {
  title: "Book a Call About Your Firm's Receivables | LexCollect",
  description:
    "Tell us about your firm and the systems you use. We'll show you where money is stuck, what each account is worth, and which clients one message would bring back.",
};

const FAQS = [
  {
    q: "Do we need to be a particular kind of firm?",
    a: "No. If your firm bills clients, carries receivables and has someone chasing late accounts, it fits. Tell us what your firm does and which systems you run, and we'll tell you honestly how well LexCollect fits.",
  },
  {
    q: "What should we have ready for the call?",
    a: "The names of your client-management, payment, accounting and banking systems, plus a rough sense of how many active payment plans or open accounts you carry. No exports are needed for a first conversation.",
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
              <h1>Book a call about your firm's receivables.</h1>
              <p className="lead">
                Tell us about your firm and the systems you use. We'll show you where money is stuck, what each account
                is worth, and which clients one message would bring back.
              </p>
              <ol className="next-steps">
                <li>
                  <b>We reply within one business day</b>
                  <span>to set up a time that works for your team.</span>
                </li>
                <li>
                  <b>We walk through your systems</b>
                  <span>Your client-management, payment and accounting tools, and where the money seems to go missing.</span>
                </li>
                <li>
                  <b>You see what's fixable</b>
                  <span>A first view of where money is stuck, by cause, and what your team could clear first.</span>
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
