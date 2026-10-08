import { Link } from "react-router-dom";
import { FaqList, PageHero, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";
import DiagnosticForm from "@/components/marketing/DiagnosticForm";
import { CONTACT_EMAIL, MARKETING_ROUTES } from "@/lib/marketing";

export const CONTACT_META = {
  title: "Book an AR Diagnostic for Your Law Firm | LexCollect",
  description:
    "Tell us about your firm and the systems you use. We'll show you where money is stuck, what each break is worth, and what your team can fix now.",
};

const FAQS = [
  {
    q: "Do we need to be an immigration firm?",
    a: "No. We started with immigration practices, but the four-system problem exists in any firm that bills. Tell us your practice area and we'll tell you honestly how well LexCollect fits.",
  },
  {
    q: "What should we have ready for the call?",
    a: "The names of your case-management, payment, accounting and banking systems, plus a rough sense of how many active payment plans or open matters you carry. No exports are needed for a first conversation.",
  },
  {
    q: "Who from our firm should join?",
    a: "Whoever knows where the money goes: usually the firm owner or managing partner, plus the firm administrator or bookkeeper.",
  },
];

const ContactPage = () => {
  usePageMeta(CONTACT_META.title, CONTACT_META.description);

  return (
    <SiteShell>
      <PageHero
        crumb="Contact"
        eyebrow="Contact"
        title="Book an AR diagnostic for your firm."
        lead="Tell us about your firm and the systems you use. We'll show you where money is stuck, what each break is worth, and what your team can fix now."
      />

      <section className="section">
        <div className="container">
          <div className="split split--wide-left">
            <DiagnosticForm heading="Request a diagnostic" sourcePage="contact" idPrefix="contact" />

            <aside>
              <p className="eyebrow">What happens next</p>
              <ol className="next-steps">
                <li>
                  <b>We reply within one business day</b>
                  <span>To set up a time that works for your team.</span>
                </li>
                <li>
                  <b>We walk through your systems</b>
                  <span>
                    Which case-management, payment and accounting tools you run, and where the money seems to go
                    missing.
                  </span>
                </li>
                <li>
                  <b>You see what's fixable</b>
                  <span>A first view of where money is stuck, by cause, and what your team could clear first.</span>
                </li>
              </ol>
              <div style={{ marginTop: "var(--sp-50)" }}>
                <div className="contact-line">
                  <span className="kicker">Email</span>
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </div>
                <div className="contact-line">
                  <span className="kicker">Already a client?</span>
                  <Link to={MARKETING_ROUTES.login}>Log in to your workspace</Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section section--deep section--rule">
        <div className="container">
          <div className="split">
            <div>
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
