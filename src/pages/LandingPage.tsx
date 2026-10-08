import { Link } from "react-router-dom";
import { Arrow, CtaBand, FaqList, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";
import DiagnosticForm from "@/components/marketing/DiagnosticForm";
import { CONTACT_EMAIL, INTEGRATIONS, MARKETING_ROUTES } from "@/lib/marketing";

export const HOME_META = {
  title: "AR Oversight & Collections Software for Firms | LexCollect",
  description:
    "LexCollect gives firms one live view of every dollar owed, reconciles client, payment, accounting and bank data, and runs collections with a name on every account.",
};

/* Illustrative six-month trend. Your firm's data fills this view in the product. */
const MOMENTUM = {
  months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
  payingClients: [412, 438, 467, 503, 541, 586],
  hardDebtCollected: [61, 74, 92, 118, 139, 163], // $K per month
  cashFlow: [388, 402, 431, 468, 507, 549], // $K per month
};

const Spark = ({ values, id }: { values: number[]; id: string }) => {
  const w = 220;
  const h = 56;
  const pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (i: number) => pad + (i * (w - pad * 2)) / (values.length - 1);
  const y = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `${x(0)},${h - 1} ${pts} ${x(values.length - 1)},${h - 1}`;
  const last = values.length - 1;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} role="img" aria-labelledby={`${id}-t`} preserveAspectRatio="none">
      <title id={`${id}-t`}>Six-month trend, rising</title>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3DD9C7" stopOpacity="0.28" />
          <stop offset="1" stopColor="#3DD9C7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id}-g)`} />
      <polyline points={pts} fill="none" stroke="#3DD9C7" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={x(last)} cy={y(values[last])} r="4" fill="#3DD9C7" stroke="#F1F4F7" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const pct = (arr: number[]) => Math.round(((arr[arr.length - 1] - arr[0]) / arr[0]) * 100);

const MomentumCard = () => (
  <figure className="momentum" aria-label="Illustrative collections momentum over six months">
    <div className="momentum__head">
      <span>
        <b>AR Oversight</b> · Collections momentum
      </span>
      <span>{MOMENTUM.months[0]}–{MOMENTUM.months[5]}</span>
    </div>
    <div className="momentum__grid">
      <div className="panel-stat">
        <span className="panel-stat__label">Paying clients</span>
        <span className="panel-stat__num">
          {MOMENTUM.payingClients[5].toLocaleString()}
          <small>+{pct(MOMENTUM.payingClients)}%</small>
        </span>
        <Spark values={MOMENTUM.payingClients} id="sp-clients" />
        <span className="panel-stat__foot">current and on plan, up every month</span>
      </div>
      <div className="panel-stat">
        <span className="panel-stat__label">Hard-delinquent $ collected</span>
        <span className="panel-stat__num">
          ${MOMENTUM.hardDebtCollected[5]}K<small>+{pct(MOMENTUM.hardDebtCollected)}%</small>
        </span>
        <Spark values={MOMENTUM.hardDebtCollected} id="sp-debt" />
        <span className="panel-stat__foot">90+ day balances recovered per month</span>
      </div>
      <div className="panel-stat">
        <span className="panel-stat__label">Monthly cash flow</span>
        <span className="panel-stat__num">
          ${MOMENTUM.cashFlow[5]}K<small>+{pct(MOMENTUM.cashFlow)}%</small>
        </span>
        <Spark values={MOMENTUM.cashFlow} id="sp-cash" />
        <span className="panel-stat__foot">collected across all sources</span>
      </div>
    </div>
    <div className="momentum__foot">
      <span className="k">Traced to LexCollect</span>
      <strong className="v">every dollar</strong>
      <span className="s">each payment carries its origin, collector and outcome</span>
    </div>
  </figure>
);

const Hero = () => (
  <section className="hero" id="top">
    <div className="container hero__grid">
      <div className="hero__copy">
        <p className="eyebrow">AR oversight for firms</p>
        <h1>
          Know where every dollar is. <em>Collect the ones that are late.</em>
        </h1>
        <p className="lead">
          LexCollect is accounts-receivable oversight and collections software for firms. It reconciles your
          client-management, payment, accounting and bank data into one live view of what you're owed, puts a name on
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
        <p className="hero__note">Built inside a working firm on a $21M receivables book. Fits any firm that bills.</p>
      </div>

      <div className="hero__visual">
        <div className="cradle">
          <MomentumCard />
        </div>
        <p className="report__caption">Illustrative six-month trend. In the product this view is your firm's live data.</p>
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
        <span className="stat__num">228</span>
        <span className="stat__label">willing payers segmented for an "update your card" email instead of a collections call</span>
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
    text: "One live receivables view across your client-management system, payment processor, books and bank. Aging, open AR over time, expected deposits and a certified monthly snapshot you can hand to the partners.",
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
    text: "Billing, service teams, intake and management look at the same client, the same contract status and the same escalation. Hand-offs carry a queue, a priority and an owner instead of an email chain.",
    mods: ["Escalation Management", "Department inboxes", "Hand-off queues", "Deadline watch"],
  },
  {
    title: "Know which products make the money, and when",
    text: "Billing by product, contract lifecycle and progression, and the service pipeline by stage. See which products generate cash and where in the life of an engagement it arrives.",
    mods: ["Billing by Product", "Contract Lifecycle", "Service Pipeline", "Product Mix"],
  },
  {
    title: "Build trust with clients",
    text: "A client 360 with contact details, engagements, ledger and payment plan, blended with the latest processor payments. The person who picks up the phone knows what was paid, by whom, and for what.",
    mods: ["Client Lookup", "Payment ledger", "Plan freshness", "Take a payment"],
  },
  {
    title: "CRM capability, built in",
    text: "Intake and consult tracking, HubSpot deals validated against real payments before a lead counts as a client, email segments built from real balances, and client data joined to money so the CRM and the books finally agree.",
    mods: ["HubSpot sync", "Consult funnel", "Email segments", "Client 360"],
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
          <p>Hardship, service questions and disputes go to the right queue with a priority. Paid accounts drop off. Nothing sits in limbo.</p>
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
          <span className="win__label">Data integrity</span>
          <span className="win__num">428</span>
          <p className="win__text">Contracts marked "Paid" with only ~4% collected were found and reclassified, with an audit trail.</p>
        </div>
        <div className="win">
          <span className="win__label">Migration</span>
          <span className="win__num">
            0<small>mismatches</small>
          </span>
          <p className="win__text">1,395 records reconciled against the firm's own lists during the MyCase-to-Filevine migration.</p>
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
          <h2>Built for how firms actually work, then shaped to yours.</h2>
          <p className="lead">
            Roles, rosters, queues, product lines and integrations are configuration, not code. Your collectors appear
            automatically. Your escalation targets are your departments.
          </p>
          <p className="muted">
            If your firm bills clients, runs payment plans and has someone chasing late accounts, it fits.{" "}
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
    a: "LexCollect is accounts-receivable oversight and collections software for firms. It reconciles your client-management system, payment processor, accounting and bank into one view of what you're owed, then runs collections with a queue, commitments, escalations and performance tracking on top of that reconciled data.",
  },
  {
    q: "What kind of firm is it for?",
    a: "Any firm that bills clients and carries receivables: flat fees, retainers, installment plans or invoices. The first deployment was a high-volume firm with thousands of payment plans and payers who weren't the client, which is the hardest version of the problem. Roles, queues and product lines are configured per firm.",
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
    q: "Does it replace our client-management or accounting software?",
    a: "No. LexCollect sits across the systems you already use and reconciles them. Your team keeps working in the same client-management and accounting tools.",
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
              <span>Which client-management, payment and accounting tools you run, and where the money seems to go missing.</span>
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
