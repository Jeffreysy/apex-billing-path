import { Link } from "react-router-dom";
import { Arrow, BrandMark, CtaBand, FaqList, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";
import DiagnosticForm from "@/components/marketing/DiagnosticForm";
import { CONTACT_EMAIL, INTEGRATIONS, MARKETING_ROUTES } from "@/lib/marketing";

export const HOME_META = {
  title: "AR Accounting Services for Firms | LexCollect",
  description:
    "LexCollect is an accounts-receivable accounting service for firms: internal efficiency, client connection, and financial and revenue recognition, built on the systems you already run.",
};

const PROMISES = [
  {
    title: "Internal efficiency",
    text: "Reconciliation, migration, follow-up and reporting run every day without a spreadsheet or a second hire.",
  },
  {
    title: "Client connection",
    text: "The right message to the right client at the right moment, by email or SMS, with a record of every reply.",
  },
  {
    title: "Financial recognition",
    text: "One reconciled, certified view of what the firm is owed, across every system it runs.",
  },
  {
    title: "Revenue recognition",
    text: "Every collected dollar carries its origin, so the revenue your firm earns, and the revenue LexCollect produces, is a report.",
  },
];

const Hero = () => (
  <section className="hero hero--brand" id="top">
    <div className="container">
      <div className="brand-hero">
        <div className="brand-hero__mark" aria-hidden="true">
          <BrandMark />
        </div>
        <p className="eyebrow">AR accounting services for firms</p>
        <h1 className="brand-hero__slogan">
          Every dollar accounted for. <em>Every client connected.</em>
        </h1>
        <p className="lead">
          LexCollect is an accounts-receivable accounting service. We give firms the visibility, automation and client
          connection of an elite accounting department, built on the systems you already run.
        </p>
        <div className="actions">
          <a className="btn btn--primary" href="#contact">
            Book a diagnostic <Arrow />
          </a>
          <Link className="btn btn--ghost" to={MARKETING_ROUTES.about}>
            Why LexCollect
          </Link>
        </div>
      </div>
      <ul className="promises" aria-label="What LexCollect improves">
        {PROMISES.map((p) => (
          <li key={p.title} className="promise">
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </li>
        ))}
      </ul>
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
        <span className="stat__label">in contract balances re-linked to the right clients through a migration between incompatible systems</span>
      </div>
      <div className="stat">
        <span className="stat__num">228</span>
        <span className="stat__label">willing payers reconnected with an "update your card" message instead of a collections call</span>
      </div>
      <div className="stat">
        <span className="stat__num">
          7<small>queues</small>
        </span>
        <span className="stat__label">for escalations, so billing, service teams and management hand off with a record</span>
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
    text: "One live receivables view across your client system, payment processor, books and bank. Aging, open AR over time, expected deposits and a certified monthly snapshot you can hand to the partners.",
    mods: ["AR Management", "Controller AR Management", "AR Movement & Projection", "Monthly AR snapshots"],
    lead: true,
  },
  {
    title: "Connect: rebuild the firm-to-client relationship",
    text: "Most late accounts aren't refusals. They're clients the firm lost touch with. LexCollect reconnects them: the right message, by email or SMS, to the right list, at the right moment, with a person stepping in only when it matters.",
    mods: ["Connect Queue", "Automated email & SMS", "Client lists", "Payment Commitments"],
    lead: true,
  },
  {
    title: "Collect more of what you already earned",
    text: "Most 'missing' money was billed and never followed. LexCollect shows what's late, who owes it and what each account is worth, so the biggest dollars are worked first.",
    mods: ["Collections monthly view", "Aging breakdown", "Revenue forecast", "Collection flow"],
  },
  {
    title: "Recover hard debt without burning the relationship",
    text: "Ninety-day-plus balances get a sequence, not a shouting match: reconciled balance first, a clear message, a plan the client can keep, and a record of every promise.",
    mods: ["Hard-debt sequences", "Hardship requests", "Card Recovery", "Promise tracking"],
  },
  {
    title: "Automation that runs like a finance department",
    text: "Continuous reconciliation, duplicate and orphan cleanup, migration between systems and payment booking that can't double-count. The work an elite accounting team would do by hand, done every day.",
    mods: ["Continuous reconciliation", "Migration reconciliation", "Unmatched payment review", "Idempotent booking"],
  },
  {
    title: "Hold the team accountable",
    text: "Every outreach, outcome, dollar and commission by team member, by day. Scorecards, contact rates and a daily activity log that doesn't depend on memory.",
    mods: ["Team Performance", "Daily Activity Log", "Outcome Distribution", "Collections KPI"],
  },
  {
    title: "Unique escalations and internal connection",
    text: "Billing, service teams, intake and management look at the same client, the same contract status and the same escalation. Hand-offs carry a queue, a priority and an owner instead of an email chain.",
    mods: ["Escalation Management", "Department inboxes", "Hand-off queues", "Deadline watch"],
  },
  {
    title: "Know which products make the money, and when",
    text: "Billing by product, contract lifecycle and progression, and the service pipeline by stage. See which products generate cash and where in the life of an engagement it arrives.",
    mods: ["Billing by Product", "Contract Lifecycle", "Service Pipeline", "Product Mix"],
  },
  {
    title: "Works with the CRM you already have",
    text: "Compatible with any CRM or practice system that exports or has an API connection. Intake and consult tracking, deals validated against real payments, and client data joined to money so the CRM and the books finally agree.",
    mods: ["Any CRM with export or API", "HubSpot sync", "Consult funnel", "Client 360"],
  },
];

const Pillars = () => (
  <section className="section" id="what-you-get">
    <div className="container">
      <div className="section-head">
        <p className="eyebrow">What your firm gets</p>
        <h2>AR accounting as a service: everything a firm needs from its receivables.</h2>
        <p className="lead">
          Visibility, automation and the connection to your clients. Each one maps to a working part of LexCollect, not
          a roadmap. The names under each are the screens your team will actually open.</p>
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

const Management = () => (
  <section className="section section--deep section--rule" id="management">
    <div className="container">
      <div className="split split--center">
        <div>
          <p className="eyebrow">AR Management</p>
          <h2>A receivables number the partners can trust, every month.</h2>
          <p className="lead">
            Most firms have four versions of "what we're owed": the client system, the processor, the books and a
            spreadsheet. LexCollect reconciles them into one, then explains every dollar of difference.
          </p>
          <p>
            <strong>Reconciled, not exported.</strong> Payments are traced from the client system to the bank deposit,
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
        <div className="monitor" aria-label="Example AR management checks">
          <div className="monitor__head">
            <span>
              <b>Management checks</b>
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
              <span className="name">reconcile.processor_to_contracts</span>
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

const Connect = () => (
  <section className="section section--rule" id="connect">
    <div className="container">
      <div className="section-head">
        <p className="eyebrow">Connect</p>
        <h2>From "they stopped paying" to a message, a plan and a payment.</h2>
        <p className="lead">
          The connection between a firm and its clients is the part most AR tools skip. LexCollect runs it as a loop
          with a record at every step, so a partner can see what happened on any account without asking.
        </p>
      </div>
      <ol className="steps">
        <li className="step">
          <span className="step__num">01</span>
          <h3>Queue</h3>
          <p>Late accounts ranked by balance, aging and last contact, built from reconciled balances. Consult-only and junk records are kept out by default.</p>
        </li>
        <li className="step">
          <span className="step__num">02</span>
          <h3>Connect</h3>
          <p>Automated email and SMS to the right client list: a missed installment, a failed card, a balance due. Clear, on brand, and logged. A person steps in only when the client needs one.</p>
        </li>
        <li className="step">
          <span className="step__num">03</span>
          <h3>Commit</h3>
          <p>Promises to pay get a date and an amount, then get followed up automatically. Missed installments surface while they're small.</p>
        </li>
        <li className="step step--highlight">
          <span className="step__num">04</span>
          <h3>Escalate or close</h3>
          <p>Hardship, service questions and disputes go to the right queue with a priority. Paid accounts drop off. Nothing sits in limbo.</p>
        </li>
      </ol>
      <div className="split" style={{ marginTop: "var(--sp-60)" }}>
        <div className="card">
          <span className="kicker">Trust, regained</span>
          <h3>Nobody gets a collections message for money they already paid</h3>
          <p>Balances are reconciled before any message goes out, including payments made by a relative or employer. That alone changes how clients feel about the firm.</p>
        </div>
        <div className="card">
          <span className="kicker">Willing payers, separated</span>
          <h3>Failed cards are not delinquency</h3>
          <p>
            At one firm, LexCollect found $928K across 228 clients who wanted to pay but whose auto-draft had failed.
            They got an "update your card" message, not a collections call, and the relationship stayed intact.
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
          LexCollect was built in the finance department of a high-volume firm running MyCase, Filevine, LawPay,
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
          <span className="win__label">Migration</span>
          <span className="win__num">$3.5M</span>
          <p className="win__text">Contract balances re-linked to the right clients during a mass financial migration between two incompatible CRMs.</p>
        </div>
        <div className="win">
          <span className="win__label">Connection</span>
          <span className="win__num">228</span>
          <p className="win__text">Willing payers reconnected with one message instead of a collections call. $928K of balances kept out of hard debt.</p>
        </div>
        <div className="win">
          <span className="win__label">Escalations</span>
          <span className="win__num">
            7<small>queues</small>
          </span>
          <p className="win__text">Service teams, compliance, customer care, management, sales, billing ops and more, each with an inbox.</p>
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
          <h2>An accounting department's judgment, shaped to how your firm works.</h2>
          <p className="lead">
            Roles, rosters, queues, message sequences, product lines and integrations are configuration, not code. Your
            team appears automatically. Your escalation targets are your departments. Your clients hear from your firm,
            in your voice.
          </p>
          <p className="muted">
            If your firm bills clients, runs payment plans and has money it can't quite account for, it fits.{" "}
            <Link to={MARKETING_ROUTES.contact}>Tell us about yours.</Link>
          </p>
        </div>
        <div className="grid grid--2">
          <div className="card">
            <span className="kicker">Partners &amp; owners</span>
            <h3>The number, and the reason</h3>
            <p>Executive insights, certified AR, team performance and the biggest movers in the book this month.</p>
          </div>
          <div className="card">
            <span className="kicker">Controllers &amp; administrators</span>
            <h3>Reconciled, forecastable, defensible</h3>
            <p>Controller AR management, expected deposits, cashflow analytics and a report builder for the month-end packet.</p>
          </div>
          <div className="card">
            <span className="kicker">Billing &amp; client relations</span>
            <h3>A queue that's already prioritized</h3>
            <p>Connect queue, automated email and SMS, commitments, hardship requests and the client's full ledger on one screen.</p>
          </div>
          <div className="card">
            <span className="kicker">Service teams</span>
            <h3>Delivery sees what billing sees</h3>
            <p>Pipeline by stage, deadline watch and an inbox for the escalations that need someone who knows the client.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Integrations = () => (
  <section className="integrations" aria-label="Integrations">
    <div className="container">
      <span className="kicker">Compatible with any CRM that exports or has an API · working today with</span>
      <ul>
        {INTEGRATIONS.map((i) => (
          <li key={i}>{i}</li>
        ))}
        <li className="more">Your bank</li>
        <li className="more">Spreadsheets &amp; exports</li>
      </ul>
    </div>
  </section>
);

const FAQS = [
  {
    q: "What is LexCollect?",
    a: "LexCollect is an accounts-receivable accounting service for firms: the visibility, automation and client connection of a high-level accounting department, delivered as software and run by people who know receivables. It reconciles your client system, payment processor, accounting and bank into one view of what you're owed, then runs the outreach, commitments, escalations and reporting on top of that reconciled data.",
  },
  {
    q: "Do you provide collectors?",
    a: "No. LexCollect provides the connection: the queues, the automated email and SMS, the commitments and the record. Your own team handles the conversations that need a person, with the client's reconciled ledger in front of them.",
  },
  {
    q: "What kind of firm is it for?",
    a: "Any firm that bills clients and carries receivables: flat fees, retainers, installment plans or invoices. The first deployment was a high-volume firm with thousands of payment plans and payers who weren't the client, which is the hardest version of the problem. Roles, queues, messages and product lines are configured per firm.",
  },
  {
    q: "Which systems does it connect to?",
    a: `Any CRM or practice system that exports or has an API connection. Working today with ${INTEGRATIONS.join(", ")}, plus bank deposits and spreadsheet exports. If you run something else, tell us on the first call and we'll confirm the fit.`,
  },
  {
    q: "Does it replace our client-management or accounting software?",
    a: "No. LexCollect sits across the systems you already use and reconciles them. Your team keeps working in the same client-management and accounting tools.",
  },
  {
    q: "What does a diagnostic involve?",
    a: "One conversation about your systems, then a first look at your book: what's late, what's unmatched, which clients have simply lost touch, and what your firm could recover first. No exports are needed for the first call.",
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
          <h2>Find out what's late, what's unmatched and who's just lost touch.</h2>
          <p className="lead">
            Tell us about your firm and the systems you use. We'll show you where money is stuck, what each account is
            worth, and which clients a single message would bring back.
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
              <span>Which client-management, payment and accounting tools you run, and where the money seems to go missing.</span>
            </li>
            <li>
              <b>You see what's recoverable</b>
              <span>A first view of your book: late, unmatched, failed-card and ready-to-connect, with a dollar figure on each.</span>
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
      <Management />
      <Connect />
      <Results />
      <Adapts />
      <Integrations />
      <Faq />
      <BookDiagnostic />
      <CtaBand
        title="See what your own book says."
        lead="One conversation, your systems, and a first look at what's late, what's unmatched and which clients one message would bring back."
        secondary={{ to: MARKETING_ROUTES.platform, label: "Explore the platform" }}
      />
    </SiteShell>
  );
};

export default LandingPage;
