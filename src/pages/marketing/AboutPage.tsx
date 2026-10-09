import { Link } from "react-router-dom";
import { Arrow, BOOK_CALL_LABEL, BookCallLink, CtaBand, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";
import MomentumCard from "@/components/marketing/MomentumCard";
import { MARKETING_ROUTES } from "@/lib/marketing";

export const ABOUT_META = {
  title: "About LexCollect | An Accounting Department at Your Fingertips",
  description:
    "LexCollect was built in a firm's finance department to reconcile receivables, automate client outreach, and give partners a number they can trust. An elite accounting firm's visibility and automation, as a service.",
};

const PRINCIPLES = [
  {
    title: "Reconcile before you collect",
    text: "A message built on unreconciled data wastes the firm's credibility and the client's trust. We tie every dollar to a client, contract and invoice before anyone is contacted.",
  },
  {
    title: "Every finding has a price and an owner",
    text: "A cause, a record count, a dollar figure and a name. If we can't put a price on a problem, we say so instead of guessing.",
  },
  {
    title: "Measure people from the full record",
    text: "Scorecards come from every logged contact, not a sample. The first firm's old dashboard showed 8% of real activity. Ours certifies the whole thing.",
  },
  {
    title: "Trust comes from checking",
    text: "Cleanups verify themselves against ground truth. Payments can't book twice. Every merge is audited and reversible. A green status means the job really ran.",
  },
];

const AboutPage = () => {
  usePageMeta(ABOUT_META.title, ABOUT_META.description);

  return (
    <SiteShell>
      <section className="hero" id="top">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="breadcrumb">
              <Link to={MARKETING_ROUTES.home}>Home</Link> / About
            </p>
            <p className="eyebrow">About LexCollect</p>
            <h1>
              An elite accounting department, <em>at your fingertips.</em>
            </h1>
            <p className="lead">
              LexCollect is an AR accounting service for firms. It reconciles your client, payment, accounting and bank
              data into one live view of what you're owed, automates the outreach that keeps clients current, and
              rebuilds the connection between your firm and the people who owe it money.
            </p>
            <div className="actions">
              <BookCallLink className="btn btn--primary">
                {BOOK_CALL_LABEL} <Arrow />
              </BookCallLink>
              <Link className="btn btn--ghost" to={MARKETING_ROUTES.results}>
                See the results
              </Link>
            </div>
            <p className="hero__note">Built inside a working firm on a $21M receivables book. Compatible with any system that exports or has an API.</p>
          </div>
          <div className="hero__visual">
            <div className="cradle">
              <MomentumCard />
            </div>
            <p className="report__caption">Illustrative six-month trend. In the product this view is your firm's live data.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split split--wide-left">
            <div>
              <p className="eyebrow">Our story</p>
              <h2>The receivables problem, from the inside</h2>
              <p>
                The firm ran MyCase, then Filevine, took payments through LawPay, tracked leads in HubSpot and closed the
                books in QuickBooks. Each system was right about its own piece. None of them agreed about the whole, and
                the "true AR" lived in a spreadsheet someone rebuilt from raw exports every month.
              </p>
              <p>
                So we built the thing in the middle. It reconciled a $21M book to the firm's own ground truth, found
                hundreds of contracts marked paid that weren't, re-linked $3.5M of balances to the right clients, and
                replaced rounds of calls with reconciled lists, automated email and SMS, and a record of every contact.
              </p>
              <p>
                Then the escalations moved out of email and into queues with owners. Then the partners got a certified
                number every month. Then other firms asked for it. That's LexCollect.
              </p>
            </div>
            <blockquote className="pullquote">
              The partners didn't need a prettier report. They needed one number they could trust, and a way to
              reconnect with the clients behind it.
              <cite>Why LexCollect exists</cite>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="section section--deep section--rule">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">What we care about</p>
            <h2>Eight outcomes, not eight features</h2>
            <p className="lead">
              Every part of the platform exists to move one of these. If it doesn't, we don't build it.
            </p>
          </div>
          <div className="grid grid--4">
            <div className="card">
              <span className="kicker">01</span>
              <h3>Maximize revenue</h3>
              <p>Collect more of what was already billed, add paying clients, and see which products to sell more of.</p>
            </div>
            <div className="card">
              <span className="kicker">02</span>
              <h3>Financial visibility</h3>
              <p>One reconciled, certified view of receivables across every system.</p>
            </div>
            <div className="card">
              <span className="kicker">03</span>
              <h3>Recover hard debt</h3>
              <p>A prioritized queue, sequences instead of call rounds, promises that get followed, and failed cards handled gently.</p>
            </div>
            <div className="card">
              <span className="kicker">04</span>
              <h3>Accountability</h3>
              <p>Every team member measured from the full record, every day.</p>
            </div>
            <div className="card">
              <span className="kicker">05</span>
              <h3>Internal communication</h3>
              <p>Escalations with queues, priorities and owners instead of email chains.</p>
            </div>
            <div className="card">
              <span className="kicker">06</span>
              <h3>Client trust</h3>
              <p>The connection between firm and client, rebuilt: nobody is chased for money they already paid.</p>
            </div>
            <div className="card">
              <span className="kicker">07</span>
              <h3>Products &amp; lifecycle</h3>
              <p>Cash by product and where in an engagement's life it arrives.</p>
            </div>
            <div className="card">
              <span className="kicker">08</span>
              <h3>Works with your CRM</h3>
              <p>Compatible with any CRM that exports or has an API. Leads validated by money, and a client 360 the books agree with.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--rule">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Principles</p>
            <h2>How we work</h2>
          </div>
          <div className="grid grid--2">
            {PRINCIPLES.map((p, i) => (
              <div className="card" key={p.title}>
                <span className="kicker">Principle 0{i + 1}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--deep section--rule">
        <div className="container">
          <div className="split split--center">
            <div>
              <p className="eyebrow">Who we serve</p>
              <h2>Firms past the point of keeping receivables in someone's head</h2>
              <p className="lead">
                Mid-size and growing firms with payment plans, multiple systems and a collections function, but
                without a finance department to chase every dollar full time.
              </p>
              <p className="muted">
                The first deployment was a firm with thousands of installment plans and payers who weren't the client,
                which is the hardest version of the problem. The system fits any firm that bills.
              </p>
              <div className="actions">
                <Link className="btn btn--ghost" to={MARKETING_ROUTES.results}>
                  See the results <Arrow />
                </Link>
              </div>
            </div>
            <div className="founder">
              <div className="avatar-ph">Founder photo</div>
              <div>
                <span className="placeholder-tag">Placeholder: replace</span>
                <p className="muted" style={{ marginTop: "1rem" }}>
                  [A short note from the founder: who you are, the moment you saw how much money the firm was owed but
                  couldn't see, and why you built LexCollect to find and collect it. Two or three sentences in your own
                  voice.]
                </p>
                <p>
                  <strong>[Founder name]</strong>
                  <br />
                  <span className="muted small">Founder, LexCollect</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        title="See what your own numbers say."
        lead="One conversation, your systems, and a first look at what's late, what's unmatched and what's recoverable now."
      />
    </SiteShell>
  );
};

export default AboutPage;
