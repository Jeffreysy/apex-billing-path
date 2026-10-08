import { Link } from "react-router-dom";
import { Arrow, CtaBand, FaqList, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";
import DiagnosticForm from "@/components/marketing/DiagnosticForm";
import { CONTACT_EMAIL, MARKETING_ROUTES } from "@/lib/marketing";

export const HOME_META = {
  title: "Law Firm Accounts Receivable Software | LexCollect",
  description:
    "LexCollect finds where your law firm's money is stuck across case management, payments, accounting and the bank, prices each break, and routes the fix.",
};

const Hero = () => (
  <section className="hero" id="top">
    <div className="container hero__grid">
      <div className="hero__copy">
        <p className="eyebrow">AR diagnostics for law firms</p>
        <h1>
          Find the money your firm earned but <em>can't account for.</em>
        </h1>
        <p className="lead">
          LexCollect is accounts-receivable software for law firms. It reconciles your case-management system, payment
          processor, accounting and bank, finds every place money is stuck, and prices each cause. Then it routes the
          fixable ones to the person who can fix them.
        </p>
        <div className="actions">
          <a className="btn btn--primary" href="#contact">
            Book a diagnostic <Arrow />
          </a>
          <a className="btn btn--ghost" href="#how-it-works">
            See how it works
          </a>
        </div>
        <p className="hero__note">Built first for immigration practices. Expanding to more practice areas.</p>
      </div>

      <div className="hero__visual">
        <div className="cradle">
          <figure className="report" aria-label="Example LexCollect diagnostic: unattributed receipts broken down by cause">
            <div className="report__head">
              <span>
                <b>Diagnostic</b> · Unattributed receipts
              </span>
              <span>Example output</span>
            </div>
            <div className="report__was">
              <span>A report says</span>
              <s>$8.3M unattributed</s>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Cause</th>
                  <th className="col-records">Records</th>
                  <th>Amount</th>
                  <th>Fixable now</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>bare_no_invoice</code>
                  </td>
                  <td className="col-records">18,005</td>
                  <td>$2,961,458</td>
                  <td>
                    <span className="tag tag--no">No</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>invoice_no_client_link</code>
                  </td>
                  <td className="col-records">3,739</td>
                  <td>$2,792,012</td>
                  <td>
                    <span className="tag tag--no">No</span>
                  </td>
                </tr>
                <tr className="is-fixable">
                  <td>
                    <code>invoice_no_client_link</code>
                  </td>
                  <td className="col-records">1,809</td>
                  <td>$1,529,218</td>
                  <td>
                    <span className="tag tag--yes">Yes</span>
                  </td>
                </tr>
                <tr className="is-fixable">
                  <td>
                    <code>name_only_review</code>
                  </td>
                  <td className="col-records">1,902</td>
                  <td>$1,002,123</td>
                  <td>
                    <span className="tag tag--yes">Yes</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="report__foot">
              <span className="k">Fixable this week</span>
              <strong className="v">$2,531,341</strong>
              <span className="s">3,711 records, each with a named cause</span>
            </div>
          </figure>
        </div>
        <p className="report__caption">Illustrative diagnostic. Figures are an example of LexCollect's output format.</p>
      </div>
    </div>
  </section>
);

const Stats = () => (
  <section className="stats" aria-label="LexCollect at a glance">
    <div className="container stats__grid">
      <div className="stat">
        <span className="stat__num">4</span>
        <span className="stat__label">systems reconciled continuously: case management, payments, accounting and bank</span>
      </div>
      <div className="stat">
        <span className="stat__num">
          2<small>lists</small>
        </span>
        <span className="stat__label">for every problem found: fixable now, and not yet</span>
      </div>
      <div className="stat">
        <span className="stat__num">
          1<small>owner</small>
        </span>
        <span className="stat__label">named for every fixable break, with the records attached</span>
      </div>
      <div className="stat">
        <span className="stat__num">44</span>
        <span className="stat__label">internal pipelines LexCollect audits for silent failure</span>
      </div>
    </div>
  </section>
);

const SYSTEMS = [
  {
    name: "Case management",
    what: "The matter, the flat fee and the payment plan.",
    breaks: "A fee is agreed but no invoice is created, so the payment has nothing to land on.",
  },
  {
    name: "Payment processor",
    what: "Cards, ACH and payment links.",
    breaks: "A spouse, a sponsor or an employer pays, and the name on the payment isn't the client's.",
  },
  {
    name: "Accounting",
    what: "The books your bookkeeper closes each month.",
    breaks: "Payments are posted in batches, and single payments lose their client and invoice.",
  },
  {
    name: "Bank",
    what: "Where the money actually lands.",
    breaks: "Deposits that match nothing upstream sit unexplained, month after month.",
  },
];

const Problem = () => (
  <section className="section" id="problem">
    <div className="container">
      <div className="section-head">
        <p className="eyebrow">The problem</p>
        <h2>Your firm's money crosses four systems that were never designed to agree.</h2>
        <p className="lead">
          Every handoff is a place a dollar can go missing, get attached to the wrong client, or stop being tracked. Most
          firms never see those gaps, because seeing them means reconciling all four systems at once.
        </p>
      </div>
      <ol className="chain">
        {SYSTEMS.map((s, i) => (
          <li key={s.name}>
            <span className="idx">0{i + 1} / SYSTEM</span>
            <h3>{s.name}</h3>
            <p>{s.what}</p>
            <p className="break">
              <b>Where it breaks</b>
              {s.breaks}
            </p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

const Diagnostic = () => (
  <section className="section section--deep section--rule" id="diagnostic">
    <div className="container">
      <div className="section-head">
        <p className="eyebrow">Report vs. diagnostic</p>
        <h2>A report tells you how much. A diagnostic tells you why, and what you can fix this week.</h2>
      </div>
      <div className="versus">
        <div className="panel panel--muted">
          <span className="panel__label">What a report says</span>
          <p className="big">$8.3M</p>
          <p>unattributed</p>
          <hr />
          <p className="muted">
            True, and not much use. Nobody can act on a single number that size, so it rolls into next month's report.
          </p>
        </div>
        <div className="panel panel--accent">
          <span className="panel__label">What LexCollect says</span>
          <div
            className="bar"
            role="img"
            aria-label="$8.3M split by cause: $1.53M and $1.00M fixable now, $2.96M and $2.79M not yet fixable"
          >
            <span className="seg-yes" style={{ flex: 18.5 }}></span>
            <span className="seg-yes alt" style={{ flex: 12.1 }}></span>
            <span className="seg-no" style={{ flex: 35.7 }}></span>
            <span className="seg-no alt" style={{ flex: 33.7 }}></span>
          </div>
          <ul className="legend">
            <li>
              <span className="sw" style={{ background: "#12A594" }}></span>
              <code>invoice_no_client_link</code>
              <span className="amt">$1,529,218</span>
              <span className="fix yes">Fix now</span>
            </li>
            <li>
              <span className="sw" style={{ background: "#3DD9C7" }}></span>
              <code>name_only_review</code>
              <span className="amt">$1,002,123</span>
              <span className="fix yes">Fix now</span>
            </li>
            <li>
              <span className="sw" style={{ background: "#123A63" }}></span>
              <code>bare_no_invoice</code>
              <span className="amt">$2,961,458</span>
              <span className="fix">Not yet</span>
            </li>
            <li>
              <span className="sw" style={{ background: "#1C4A78" }}></span>
              <code>invoice_no_client_link</code>
              <span className="amt">$2,792,012</span>
              <span className="fix">Not yet</span>
            </li>
          </ul>
          <p className="punch">
            $2.5M of it is <em>fixable this week.</em> Here are the records, and here is the cause of each. That
            difference is the product.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const STEPS = [
  {
    name: "Ingest",
    text: "Case management, payment processor, accounting and CRM data, pulled in continuously. No monthly exports.",
  },
  {
    name: "Reconcile",
    text: "Every dollar is tied to a real client, invoice and deposit. Anything that can't be tied is flagged as untied.",
  },
  {
    name: "Diagnose",
    text: "Each break is split by cause and given a dollar figure, then sorted into fixable now and not yet fixable.",
  },
  {
    name: "Route & watch",
    text: "Fixable work goes to a named person. The system also audits its own pipelines, so failures can't hide.",
    highlight: true,
  },
];

const HowItWorks = () => (
  <section className="section section--rule" id="how-it-works">
    <div className="container">
      <div className="section-head">
        <p className="eyebrow">How it works</p>
        <h2>One loop, running continuously</h2>
        <p className="lead">
          LexCollect doesn't wait for month-end. It pulls your data in, reconciles it, diagnoses what's broken and hands
          out the work, then does it again.
        </p>
      </div>
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s.name} className={`step${s.highlight ? " step--highlight" : ""}`}>
            <span className="step__num">0{i + 1}</span>
            <h3>{s.name}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
      <div className="actions">
        <Link className="btn btn--ghost" to={MARKETING_ROUTES.services}>
          Explore the platform <Arrow />
        </Link>
      </div>
    </div>
  </section>
);

const Immigration = () => (
  <section className="section section--rule" id="immigration">
    <div className="container">
      <div className="split split--wide-right">
        <div>
          <p className="eyebrow">Built for immigration firms</p>
          <h2>Immigration practices first</h2>
          <p className="lead">
            Immigration firms run on flat fees, payment plans and families. Those are exactly the conditions where money
            slips between systems.
          </p>
          <p className="muted">
            Not an immigration firm? The same four-system problem exists in every practice that bills. We're adding
            practice areas one at a time. <Link to={MARKETING_ROUTES.contact}>Tell us about yours.</Link>
          </p>
        </div>
        <div className="grid grid--2">
          <div className="card">
            <span className="kicker">Volume</span>
            <h3>Payment plans at scale</h3>
            <p>Hundreds of small installments a month, and each one can land without an invoice to match.</p>
          </div>
          <div className="card">
            <span className="kicker">Third-party payers</span>
            <h3>Payers who aren't the client</h3>
            <p>
              A spouse, a parent or an employer pays the fee. LexCollect ties the payment to the right client and matter
              so it doesn't sit unmatched.
            </p>
          </div>
          <div className="card">
            <span className="kicker">Identity</span>
            <h3>Names that don't match</h3>
            <p>
              Transliterations, two surnames, names in a different order. Records that match by name only go to a quick
              human review. They're never matched on a guess.
            </p>
          </div>
          <div className="card">
            <span className="kicker">Households</span>
            <h3>Families with several matters</h3>
            <p>
              One household, several filings. Each payment is reconciled to the right matter, so a paid case doesn't
              show up as overdue.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const SelfAudit = () => (
  <section className="section section--deep section--rule" id="self-audit">
    <div className="container">
      <div className="split split--center">
        <div>
          <p className="eyebrow">Self-monitoring</p>
          <h2>Software that assumes it will fail</h2>
          <p className="lead">
            LexCollect monitors 44 of its own pipelines. It looks for two kinds of failure most software never checks
            for.
          </p>
          <p>
            <strong>Silent blind spots:</strong> data that stopped arriving without raising an error.
            <br />
            <strong>Heartbeat lies:</strong> jobs that quietly stopped running while their status still read green.
          </p>
          <p className="muted">
            When LexCollect can't vouch for a number, it says so. That's why you can trust the numbers it does report.
          </p>
        </div>
        <div className="monitor" aria-label="Example pipeline monitor">
          <div className="monitor__head">
            <span>
              <b>Pipeline audit</b>
            </span>
            <span>Example</span>
          </div>
          <ul>
            <li>
              <span className="name">ingest.case_management</span>
              <span className="state">Healthy</span>
              <span className="meta">Last verified run · 6 min ago</span>
            </li>
            <li>
              <span className="name">ingest.payment_processor</span>
              <span className="state">Healthy</span>
              <span className="meta">Last verified run · 4 min ago</span>
            </li>
            <li className="is-flagged">
              <span className="name">ingest.accounting</span>
              <span className="state">Heartbeat lie</span>
              <span className="meta">Status reads green. Last real run was 9 days ago. Assigned to operations.</span>
            </li>
            <li>
              <span className="name">reconcile.bank_deposits</span>
              <span className="state">Healthy</span>
              <span className="meta">Last verified run · 11 min ago</span>
            </li>
            <li>
              <span className="name">diagnose.unattributed</span>
              <span className="state">Healthy</span>
              <span className="meta">Last verified run · 18 min ago</span>
            </li>
          </ul>
          <div className="monitor__foot">44 pipelines watched · 1 flagged · 0 hidden</div>
        </div>
      </div>
    </div>
  </section>
);

const FAQS = [
  {
    q: "What is LexCollect?",
    a: "LexCollect is accounts-receivable software for law firms. It reconciles your case-management system, payment processor, accounting system and bank. It finds where money is stuck, lost or unaccounted for, and prices each problem by cause. Then it turns what's fixable today into work assigned to a person.",
  },
  {
    q: "How is it different from a collections tool?",
    a: "A collections tool starts from a list of people who owe money and helps you call them. LexCollect starts a step earlier and asks what is actually wrong with how the firm's money moves. Collections is part of LexCollect, but only about 8% of the system. Most of it is reconciliation and diagnosis.",
  },
  {
    q: "Which systems does LexCollect connect to?",
    a: "LexCollect pulls from your case-management system, payment processor, accounting system and CRM, and reconciles them against your bank deposits. Tell us which platforms you run and we'll confirm the fit on the first call.",
  },
  {
    q: "Is LexCollect only for immigration firms?",
    a: "We're starting with immigration practices because flat fees, payment plans and third-party payers make the problem especially visible there. The same problem exists in any firm that bills, and we're expanding to more practice areas.",
  },
  {
    q: 'What does "fixable now" mean?',
    a: "Some breaks can be fixed today, like linking an invoice to the right client or confirming a name-only match. Others need an upstream change first. LexCollect keeps these in separate lists so your team spends its time on work that can actually be finished.",
  },
];

const Faq = () => (
  <section className="section section--rule" id="faq">
    <div className="container">
      <div className="split">
        <div>
          <p className="eyebrow">Questions</p>
          <h2>Frequently asked questions</h2>
          <p className="lead">Short answers to what firm owners ask first.</p>
        </div>
        <FaqList items={FAQS} />
      </div>
    </div>
  </section>
);

const BookDiagnostic = () => (
  <section className="section section--deep section--rule" id="contact">
    <div className="container">
      <div className="split split--wide-left">
        <div>
          <p className="eyebrow">Book a diagnostic</p>
          <h2>Book an AR diagnostic for your firm.</h2>
          <p className="lead">
            Tell us about your firm and the systems you use. We'll show you where money is stuck, what each break is
            worth, and what your team can fix now.
          </p>
          <div style={{ marginTop: "var(--sp-50)" }}>
            <DiagnosticForm sourcePage="home" idPrefix="home" />
          </div>
        </div>

        <aside className="contact-card">
          <h3>What happens next</h3>
          <ol className="next-steps">
            <li>
              <b>We reply within one business day</b>
              <span>to set up a time that works for your team.</span>
            </li>
            <li>
              <b>We walk through your systems</b>
              <span>
                Which case-management, payment and accounting tools you run, and where the money seems to go missing.
              </span>
            </li>
            <li>
              <b>You see what's fixable</b>
              <span>A first view of where money is stuck, by cause, and what your team could clear first.</span>
            </li>
          </ol>
          <div className="contact-line">
            <span className="kicker">Email</span>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
          <div className="contact-line">
            <span className="kicker">Already a client?</span>
            <Link to={MARKETING_ROUTES.login}>Log in to your workspace</Link>
          </div>
        </aside>
      </div>
    </div>
  </section>
);

const LandingPage = () => {
  usePageMeta(HOME_META.title, HOME_META.description);

  return (
    <SiteShell>
      <Hero />
      <Stats />
      <Problem />
      <Diagnostic />
      <HowItWorks />
      <Immigration />
      <SelfAudit />
      <Faq />
      <BookDiagnostic />
      <CtaBand
        title="Find out what's fixable at your firm this week."
        lead="We'll show you where money is stuck across your systems, what each break is worth, and which ones your team can fix now."
        secondary={{ to: MARKETING_ROUTES.services, label: "Explore the platform" }}
      />
    </SiteShell>
  );
};

export default LandingPage;
