import { Link } from "react-router-dom";
import { Arrow, CtaBand, FaqList, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";
import DiagnosticForm from "@/components/marketing/DiagnosticForm";
import { CONTACT_EMAIL, INTEGRATIONS, MARKETING_ROUTES, PRACTICE_AREAS } from "@/lib/marketing";

export const HOME_META = {
  title: "AR Oversight & Collections Software for Law Firms | LexCollect",
  description:
    "LexCollect gives law firms one live view of every dollar owed, reconciles case, payment, accounting and bank data, and runs collections with a name on every account.",
};

const Hero = () => (
  <section className="hero" id="top">
    <div className="container hero__grid">
      <div className="hero__copy">
        <p className="eyebrow">AR oversight for law firms</p>
        <h1>
          Know where every dollar is. <em>Collect the ones that are late.</em>
        </h1>
        <p className="lead">
          LexCollect is accounts-receivable oversight and collections software for law firms. It reconciles your
          case-management, payment, accounting and bank data into one live view of what you're owed, puts a name on
          every delinquent account, and tracks every call, promise and escalation until the money lands.
        </p>
        <div className="actions">
          <a className="btn btn--primary" href="#contact">
            Book a diagnostic <Arrow />
          </a>
          <Link className="btn btn--ghost" to={MARKETING_ROUTES.results}>
            See the results
          </Link>
        </div>
        <p className="hero__note">Built inside a working law firm on a $21M receivables book. Fits any practice that bills.</p>
      </div>

      <div className="hero__visual">
        <div className="cradle">
          <figure className="report" aria-label="Example LexCollect AR oversight snapshot">
            <div className="report__head">
              <span>
                <b>AR Oversight</b> · Firm snapshot
              </span>
              <span>Live view</span>
            </div>
            <div className="report__was">
              <span>Receivables, reconciled to the books</span>
              <s>$21.4M "somewhere in four systems"</s>
            </div>
            <table>
              <thead>
                <tr>
                  <th>What the firm sees</th>
                  <th className="col-records">Accounts</th>
                  <th>Amount</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Delinquent and late AR, by aging bucket</td>
                  <td className="col-records">—</td>
                  <td>$15,668,704</td>
                  <td>
                    <span className="tag tag--yes">Collectors</span>
                  </td>
                </tr>
                <tr className="is-fixable">
                  <td>Payments matched to a client, contract and invoice</td>
                  <td className="col-records">2,013</td>
                  <td>$1,190,204</td>
                  <td>
                    <span className="tag tag--yes">Done</span>
                  </td>
                </tr>
                <tr>
                  <td>Payments that need a human to confirm the payer</td>
                  <td className="col-records">759</td>
                  <td>$370,447</td>
                  <td>
                    <span className="tag tag--yes">Billing</span>
                  </td>
                </tr>
                <tr className="is-fixable">
                  <td>Willing payers whose card failed, not delinquent</td>
                  <td className="col-records">228</td>
                  <td>$928,000</td>
                  <td>
                    <span className="tag tag--yes">Intake</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="report__foot">
              <span className="k">Gap to the firm's ground truth</span>
              <strong className="v">&lt; 5%</strong>
              <span className="s">every remaining dollar explained and assigned</span>
            </div>
          </figure>
        </div>
        <p className="report__caption">Figures from a live LexCollect deployment at a high-volume practice. Yours will look like your firm.</p>
      </div>
    </div>
  </section>
);

const Stats = () => (
  <section className="stats" aria-label="LexCollect results at a glance">
    <div className="container stats__grid">
      <div className="stat">
        <span className="stat__num">$21.4M</span>
        <span className="stat__label">receivables book reconciled to the firm's ground truth</span>
      </div>
      <div className="stat">
        <span className="stat__num">$3.5M</span>
        <span className="stat__label">in contract balances re-linked to the right clients</span>
      </div>
      <div className="stat">
        <span className="stat__num">2,013</span>
        <span className="stat__label">payments matched to a client, contract and invoice</span>
      </div>
      <div className="stat">
        <span className="stat__num">
          7<small>queues</small>
        </span>
        <span className="stat__label">for escalations, so billing, legal and management hand off with a record</span>
      </div>
    </div>
  </section>
);

interface Pillar {
  title: string;
  text: string;
  mods: string[];
  lead?: boolean;
}

const PILLARS: Pillar[] = [
  {
    title: "See every dollar: financial visibility",
    text: "One live receivables view across your case system, payment processor, books and bank. Aging, open AR over time, expected deposits and a certified monthly snapshot you can hand to the partners.",
    mods: ["AR Oversight", "Controller AR Oversight", "AR Movement & Projection", "Monthly AR snapshots"],
    lead: true,
  },
  {
    title: "Collect more of what you already earned",
    text: "Most 'missing' money was billed and never followed. LexCollect shows what's late, who owes it and what each account is worth, so your team works the biggest dollars first.",
    mods: ["Collections monthly view", "Aging breakdown", "Revenue forecast", "Collection flow"],
  },
  {
    title: "Recover hard debt without burning the relationship",
    text: "A prioritized call queue, promise-to-pay tracking, hardship requests and reconciled balances, so nobody calls a client who already paid through a relative.",
    mods: ["Call Queue", "Payment Commitments", "Collector Workspace", "Card Recovery"],
  },
  {
    title: "Hold the team accountable",
    text: "Every call, outcome, dollar and commission by collector, by day. Scorecards for collectors and intake, contact rates, and a daily activity log that doesn't depend on memory.",
    mods: ["Collector Performance", "Daily Activity Log", "Outcome Distribution", "Collections KPI"],
  },
  {
    title: "Improve internal communication",
    text: "Billing, legal, intake and management look at the same client, the same contract status and the same escalation. Hand-offs carry a queue, a priority and an owner instead of an email chain.",
    mods: ["Escalation Management", "Legal & Management inboxes", "Hand-off queues", "Filing-deadline watch"],
  },
  {
    title: "Know which products make the money, and when",
    text: "Billing by case type, contract lifecycle and progression, and the legal pipeline by stage. See which services generate cash and where in the life of a matter it arrives.",
    mods: ["Billing by Case Type", "Contract Lifecycle", "Case Pipeline", "Practice Area Distribution"],
  },
  {
    title: "Build trust with clients",
    text: "A client 360 with contact details, matters, ledger and payment plan, blended with the latest processor payments. The person who picks up the phone knows what was paid, by whom, and for what.",
    mods: ["Client Lookup", "Payment ledger", "Plan freshness", "Take a payment"],
  },
  {
    title: "CRM capability, built in",
    text: "Intake and consult tracking, HubSpot deals validated against real payments before a lead counts as a client, and case data joined to money so the CRM and the books finally agree.",
    mods: ["HubSpot sync", "Consult funnel", "MyCase 360", "Filevine sync"],
  },
];

const Pillars = () => (
  <section className="section" id="what-you-get">
    <div className="container">
      <div className="section-head">
        <p className="eyebrow">What your firm gets</p>
        <h2>Eight things a firm needs from its receivables, in one system.</h2>
        <p className="lead">
          Each one maps to a working part of LexCollect, not a roadmap. The dashboard names under each are the screens
          your team will actually open.
        </p>
      </div>
      <ol className="pillars">
        {PILLARS.map((p, i) => (
          <li key={p.title} className={`pillar${p.lead ? " pillar--lead" : ""}`}>
            <span className="pillar__num">0{i + 1}</span>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
            <div className="pillar__mods">
              {p.mods.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <div className="actions">
        <Link className="btn btn--ghost" to={MARKETING_ROUTES.platform}>
          Explore the platform <Arrow />
        </Link>
      </div>
    </div>
  </section>
);

const Oversight = () => (
  <section className="section section--deep section--rule" id="oversight">
    <div className="container">
      <div className="split split--center">
        <div>
          <p className="eyebrow">AR Oversight</p>
          <h2>A receivables number the partners can trust, every month.</h2>
          <p className="lead">
            Most firms have four versions of "what we're owed": the case system, the processor, the books and a
            spreadsheet. LexCollect reconciles them into one, then explains every dollar of difference.
          </p>
          <p>
            <strong>Reconciled, not exported.</strong> Payments are traced from the case system to the bank deposit,
            including payments made by someone other than the client.
            <br />
            <strong>Certified snapshots.</strong> AR is captured monthly, so trends are real history, not a re-run of
            today's data.
            <br />
            <strong>Nothing dropped.</strong> A payment that can't be tied to a client is counted and queued for a
            person, never left in a suspense account.
          </p>
          <p className="muted">
            At the first firm we deployed in, the reconciled book landed within 5% of the firm's own ground truth, and
            the remaining gap was a named backlog with an owner.{" "}
            <Link to={MARKETING_ROUTES.results}>Read how.</Link>
          </p>
        </div>
        <div className="monitor" aria-label="Example AR oversight checks">
          <div className="monitor__head">
            <span>
              <b>Oversight checks</b>
            </span>
            <span>Example</span>
          </div>
          <ul>
            <li>
              <span className="name">ar.snapshot.monthly</span>
              <span className="state">Certified</span>
              <span className="meta">Captured on the 1st · trend over 12 months</span>
            </li>
            <li>
              <span className="name">reconcile.lawpay_to_contracts</span>
              <span className="state">Healthy</span>
              <span className="meta">2,013 matched · 759 queued for review</span>
            </li>
            <li className="is-flagged">
              <span className="name">contracts.status.paid_without_payments</span>
              <span className="state">Flagged</span>
              <span className="meta">428 contracts marked Paid with ~4% collected · reclassified, audited, reversible</span>
            </li>
            <li>
              <span className="name">clients.duplicates_and_orphans</span>
              <span className="state">Healthy</span>
              <span className="meta">561 orphan contracts re-linked · 89 duplicates merged</span>
            </li>
            <li>
              <span className="name">payments.idempotency</span>
              <span className="state">Healthy</span>
              <span className="meta">Webhook retries can't book a payment twice</span>
            </li>
          </ul>
          <div className="monitor__foot">Every check has an owner. A green status means the job really ran.</div>
        </div>
      </div>
    </div>
  </section>
);

const HardDebt = () => (
  <section className="section section--rule" id="collections">
    <div className="container">
      <div className="section-head">
        <p className="eyebrow">Recover hard debt</p>
        <h2>From "they stopped paying" to a plan, a promise and a payment.</h2>
        <p className="lead">
          Collections in LexCollect is a loop with a record at every step, so a partner can see what happened on any
          account without asking.
        </p>
      </div>
      <ol className="steps">
        <li className="step">
          <span className="step__num">01</span>
          <h3>Queue</h3>
          <p>Delinquent accounts ranked by balance, aging and last contact. Consult-only and junk records are kept out by default.</p>
        </li>
        <li className="step">
          <span className="step__num">02</span>
          <h3>Call</h3>
          <p>The collector sees the contract, ledger, plan and last payment before dialing. Every call is logged with an outcome.</p>
        </li>
        <li className="step">
          <span className="step__num">03</span>
          <h3>Commit</h3>
          <p>Promises to pay get a date and an amount, then get followed up. Missed installments surface while they're small.</p>
        </li>
        <li className="step step--highlight">
          <span className="step__num">04</span>
          <h3>Escalate or close</h3>
          <p>Hardship, legal questions and disputes go to the right queue with a priority. Paid accounts drop off. Nothing sits in limbo.</p>
        </li>
      </ol>
      <div className="split" style={{ marginTop: "var(--sp-60)" }}>
        <div className="card">
          <span className="kicker">Aging you can act on</span>
          <h3>Dollars collected by &lt;30, 31–60, 61–90 and 90+ days</h3>
          <p>Every month, by collector. Hard debt is a bucket with a trend, not a feeling.</p>
        </div>
        <div className="card">
          <span className="kicker">Willing payers, separated</span>
          <h3>Failed cards are not delinquency</h3>
          <p>
            At one firm, LexCollect found $928K across 228 clients who wanted to pay but whose auto-draft had failed.
            They get a "update your card" nudge, not a collections call.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const Results = () => (
  <section className="section section--light section--rule" id="results">
    <div className="container">
      <div className="section-head">
        <p className="eyebrow">Results</p>
        <h2>What it did inside a working firm.</h2>
        <p className="lead">
          LexCollect was built in the finance department of a high-volume practice running MyCase, Filevine, LawPay,
          HubSpot and QuickBooks. These are the numbers from that deployment.
        </p>
      </div>
      <div className="wins">
        <div className="win">
          <span className="win__label">Reconciliation</span>
          <span className="win__num">$21.4M</span>
          <p className="win__text">Receivables book reconciled to the firm's ground truth, with the remaining gap explained line by line.</p>
        </div>
        <div className="win">
          <span className="win__label">Data integrity</span>
          <span className="win__num">428</span>
          <p className="win__text">Contracts marked "Paid" with only ~4% collected were found and reclassified, with an audit trail.</p>
        </div>
        <div className="win">
          <span className="win__label">Migration</span>
          <span className="win__num">
            0<small>mismatches</small>
          </span>
          <p className="win__text">1,395 Filevine projects reconciled against the firm's case lists during the MyCase-to-Filevine move.</p>
        </div>
        <div className="win">
          <span className="win__label">Escalations</span>
          <span className="win__num">
            7<small>queues</small>
          </span>
          <p className="win__text">Legal, case management, compliance, customer care, management, sales and billing ops, each with an inbox.</p>
        </div>
      </div>
      <div className="actions">
        <Link className="btn btn--ghost" to={MARKETING_ROUTES.results}>
          Read the full results <Arrow />
        </Link>
      </div>
    </div>
  </section>
);

const Adapts = () => (
  <section className="section section--rule" id="adapts">
    <div className="container">
      <div className="split split--wide-right">
        <div>
          <p className="eyebrow">Suited to your firm</p>
          <h2>Built for how law firms actually work, then shaped to yours.</h2>
          <p className="lead">
            Roles, rosters, queues, practice areas and integrations are configuration, not code. Your collectors appear
            automatically. Your escalation targets are your departments.
          </p>
          <p className="muted">
            Practice areas we work with today: {PRACTICE_AREAS.join(", ").toLowerCase()}. Not on the list?{" "}
            <Link to={MARKETING_ROUTES.contact}>Tell us about yours.</Link>
          </p>
        </div>
        <div className="grid grid--2">
          <div className="card">
            <span className="kicker">Partners &amp; owners</span>
            <h3>The number, and the reason</h3>
            <p>Executive insights, certified AR, collector performance and the biggest movers in the book this month.</p>
          </div>
          <div className="card">
            <span className="kicker">Controllers &amp; administrators</span>
            <h3>Reconciled, forecastable, defensible</h3>
            <p>Controller AR oversight, expected deposits, cashflow analytics and a report builder for the month-end packet.</p>
          </div>
          <div className="card">
            <span className="kicker">Collections &amp; billing</span>
            <h3>A queue that's already prioritized</h3>
            <p>Call queue, workspace, commitments, hardship requests and the client's full ledger on one screen.</p>
          </div>
          <div className="card">
            <span className="kicker">Attorneys &amp; paralegals</span>
            <h3>Legal sees what billing sees</h3>
            <p>Case pipeline by stage, filing-deadline watch and an inbox for the escalations that need a lawyer.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Integrations = () => (
  <section className="integrations" aria-label="Integrations">
    <div className="container">
      <span className="kicker">Connects to</span>
      <ul>
        {INTEGRATIONS.map((i) => (
          <li key={i}>{i}</li>
        ))}
        <li className="more">Your bank</li>
        <li className="more">Spreadsheets &amp; imports</li>
      </ul>
    </div>
  </section>
);

const FAQS = [
  {
    q: "What is LexCollect?",
    a: "LexCollect is accounts-receivable oversight and collections software for law firms. It reconciles your case-management system, payment processor, accounting and bank into one view of what you're owed, then runs collections with a queue, commitments, escalations and performance tracking on top of that reconciled data.",
  },
  {
    q: "Is it only for immigration firms?",
    a: "No. The first deployment was at a high-volume immigration practice, which is the hardest case for receivables: flat fees, payment plans and payers who aren't the client. The same system fits any practice that bills, and roles, queues and practice areas are configured per firm.",
  },
  {
    q: "How is it different from a collections tool?",
    a: "A collections tool starts from a list of people who owe money. LexCollect starts a step earlier and reconciles whether they actually do, so your team calls the right people with the right balance. Collections is one of eight parts of the system.",
  },
  {
    q: "Which systems does it connect to?",
    a: `Today: ${INTEGRATIONS.join(", ")}, plus bank deposits and spreadsheet imports. If you run something else, tell us on the first call and we'll confirm the fit.`,
  },
  {
    q: "Does it replace our case-management or accounting software?",
    a: "No. LexCollect sits across the systems you already use and reconciles them. Your team keeps working in the same case-management and accounting tools.",
  },
  {
    q: "What does a diagnostic involve?",
    a: "One conversation about your systems, then a first look at your book: what's late, what's unmatched, what's recoverable now, and what your team could clear first. No exports are needed for the first call.",
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
          <h2>Find out what's late, what's unmatched and what's recoverable now.</h2>
          <p className="lead">
            Tell us about your firm and the systems you use. We'll show you where money is stuck, what each account is
            worth, and what your team can collect first.
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
              <span>Which case-management, payment and accounting tools you run, and where the money seems to go missing.</span>
            </li>
            <li>
              <b>You see what's recoverable</b>
              <span>A first view of your book: late, unmatched, failed-card and ready-to-call, with a dollar figure on each.</span>
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
      <Pillars />
      <Oversight />
      <HardDebt />
      <Results />
      <Adapts />
      <Integrations />
      <Faq />
      <BookDiagnostic />
      <CtaBand
        title="See what your own book says."
        lead="One conversation, your systems, and a first look at what's late, what's unmatched and what's recoverable this month."
        secondary={{ to: MARKETING_ROUTES.platform, label: "Explore the platform" }}
      />
    </SiteShell>
  );
};

export default LandingPage;
