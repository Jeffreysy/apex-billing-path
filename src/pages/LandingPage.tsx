import { Link } from "react-router-dom";
import { Arrow, BOOK_CALL_LABEL, BookCallLink, BrandMark, FaqList, ProofStrip, SiteShell, usePageMeta, type ProofItem } from "@/components/marketing/SiteChrome";
import DiagnosticForm from "@/components/marketing/DiagnosticForm";
import { AccountCard, type AccountState, MockConnect, MockRecover, MockRun, MockSee, usd } from "@/components/marketing/Mocks";
import { CONTACT_EMAIL, INTEGRATIONS, MARKETING_ROUTES } from "@/lib/marketing";

export const HOME_META = {
  title: "AR Accounting Services for Firms | LexCollect",
  description:
    "LexCollect is an accounts-receivable accounting service for firms: one reconciled number for everything you're owed, and an automatic way back to the clients behind every late balance.",
};

/*
 * Every figure in a product mock on this page is example data and is labelled
 * that way on screen. The only real figures are the deployment results (Proof,
 * ResultsBand), which repeat what the Results page already publishes.
 *
 * One fictional client, Ana Morales, runs through the hero queue, the Connect
 * tab and the four-step loop, so the page tells one story instead of four.
 */

/* ---------- Hero ---------- */

const AGING = [
  { key: "current", label: "Current", amt: 1_121_400 },
  { key: "d30", label: "1–30 days", amt: 468_900 },
  { key: "d60", label: "31–60", amt: 301_250 },
  { key: "d90", label: "61–90", amt: 187_670 },
  { key: "d90p", label: "90+", amt: 406_900 },
];
const AGING_TOTAL = AGING.reduce((s, a) => s + a.amt, 0); // 2,486,120

const QUEUE = [
  { client: "A. Morales", kind: "Payment plan", due: 1050, late: "34 days", from: "Card failed", to: "Update link sent", tone: "info" },
  { client: "J. Patel", kind: "Flat fee", due: 3200, late: "61 days", from: "No contact in 52 days", to: "Promise · Oct 15", tone: "info" },
  { client: "K. Brooks", kind: "Retainer", due: 940, late: "12 days", from: "Installment due", to: "Paid · closed", tone: "ok" },
];

const HeroDash = () => (
  <figure className="hm-dash" data-dash aria-label="Example of the LexCollect receivables view">
    <div className="hm-dash__bar">
      <span className="hm-dash__app">
        <BrandMark />
        Receivables
      </span>
      <span className="hm-dash__seg" aria-hidden="true">
        <span className="is-on">Today</span>
        <span>Month</span>
        <span>Year</span>
      </span>
      <span className="hm-example">Example data</span>
    </div>

    <div className="hm-dash__kpis">
      <div className="hm-kpi hm-kpi--lead">
        <span className="hm-kpi__label">Open receivables</span>
        <span className="hm-kpi__num" data-count={AGING_TOTAL} data-prefix="$">
          {usd(AGING_TOTAL)}
        </span>
        <span className="hm-kpi__foot">Reconciled across 4 systems</span>
      </div>
      <div className="hm-kpi">
        <span className="hm-kpi__label">Collected this week</span>
        <span className="hm-kpi__num" data-count={84300} data-prefix="$">
          {usd(84300)}
        </span>
        <span className="hm-kpi__foot">Traced to the bank</span>
      </div>
      <div className="hm-kpi">
        <span className="hm-kpi__label">Promises due</span>
        <span className="hm-kpi__num" data-count={12}>
          12
        </span>
        <span className="hm-kpi__foot">This week</span>
      </div>
    </div>

    <div className="hm-aging">
      <div className="hm-aging__head">
        <span>Aging</span>
        <span>Hover or tap a band</span>
      </div>
      <div className="hm-aging__bar" role="img" aria-label="Aging of open receivables by days past due">
        {AGING.map((a, i) => (
          <span
            key={a.key}
            className={`hm-aging__band hm-aging__band--${i + 1}`}
            data-seg={a.key}
            style={{ flexGrow: a.amt, transitionDelay: `${120 + i * 90}ms` }}
            aria-label={`${a.label}: ${usd(a.amt)}`}
          />
        ))}
      </div>
      <ul className="hm-aging__legend">
        {AGING.map((a, i) => (
          <li key={a.key} data-seg={a.key}>
            <i className={`hm-aging__sw hm-aging__band--${i + 1}`} aria-hidden="true" />
            <span>{a.label}</span>
            <b>{usd(a.amt)}</b>
          </li>
        ))}
      </ul>
    </div>

    <div className="hm-queue">
      <div className="hm-queue__head">
        <span>Today's queue</span>
        <span>3 of 37</span>
      </div>
      <table>
        <thead>
          <tr>
            <th scope="col">Client</th>
            <th scope="col">Past due</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {QUEUE.map((q) => (
            <tr key={q.client}>
              <td>
                <b>{q.client}</b>
                <span>
                  {q.kind} · {q.late}
                </span>
              </td>
              <td className="num">{usd(q.due)}</td>
              <td>
                <span className={`hm-chip hm-chip--${q.tone}`} data-status-from={q.from}>
                  {q.to}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </figure>
);

const Hero = () => (
  <section className="hm-hero" id="top">
    <div className="container">
      <div className="hm-hero__grid">
        <div className="hm-hero__copy">
          <p className="eyebrow">Accounts-receivable accounting for firms</p>
          <h1>
            Every dollar accounted for. <em>Every client connected.</em>
          </h1>
          <p className="lead">
            One reconciled number for everything your firm is owed, across your client system, processor, books and
            bank. And an automatic, on-brand way back to the client behind every late balance.
          </p>
          <div className="actions">
            <BookCallLink className="btn btn--primary">
              {BOOK_CALL_LABEL} <Arrow />
            </BookCallLink>
            <a className="btn btn--ghost" href="#platform">
              See how it works
            </a>
          </div>
        </div>
        <div className="hm-hero__visual">
          <div className="hm-cradle" aria-hidden="true" />
          <HeroDash />
        </div>
      </div>
      <div className="hm-works">
        <span>Works across</span>
        <ul>
          {INTEGRATIONS.map((i) => (
            <li key={i}>{i}</li>
          ))}
          <li>Your bank</li>
        </ul>
      </div>
    </div>
  </section>
);

/* ---------- Proof ---------- */

const PROOF: ProofItem[] = [
  { n: 21.4, decimals: 1, prefix: "$", suffix: "M", label: "receivables book reconciled to the firm's own ground truth" },
  { n: 3.5, decimals: 1, prefix: "$", suffix: "M", label: "in balances re-linked to the right clients through a system migration" },
  { n: 228, label: "willing payers reached with one message instead of a collections call" },
  { n: 928, prefix: "$", suffix: "K", label: "kept out of hard debt by separating failed cards from delinquency" },
];

const Proof = () => (
  <ProofStrip
    label="Results from the first deployment"
    items={PROOF}
    intro={
      <>
        From the first deployment, inside a high-volume firm.{" "}
        <Link to={MARKETING_ROUTES.results}>
          Read the results <Arrow />
        </Link>
      </>
    }
  />
);

/* ---------- The four versions, reconciled ---------- */

const RECONCILED = 412_860;
const SOURCES = [
  { system: "Client system", tool: "MyCase", raw: 411_410, note: "+$1,450.00 · 2 payments made by a relative, now linked to the client" },
  { system: "Processor", tool: "LawPay", raw: 412_860, note: "Matches the deposit record" },
  { system: "Books", tool: "QuickBooks", raw: 414_060, note: "−$1,200.00 · 1 duplicate entry removed" },
  { system: "Bank", tool: "Operating account", raw: 402_331.06, note: "+$10,528.94 · deposit in transit, cleared Oct 1" },
];

const Recon = () => (
  <section className="section section--light hm-recon" id="reconcile">
    <div className="container">
      <div className="hm-recon__grid">
        <div className="hm-recon__copy" data-reveal>
          <p className="eyebrow">Every dollar accounted for</p>
          <h2>Most firms have four versions of what they collected.</h2>
          <p className="lead">
            The client system, the processor, the books and the bank each tell a different story, so the partners pick
            one and hope. LexCollect ties them into one number and explains every dollar of difference.
          </p>
          <ul className="hm-ticks">
            <li>Payments traced from the client system to the bank deposit</li>
            <li>Payments made by a relative or employer linked to the right client</li>
            <li>A certified snapshot every month, so trends are real history</li>
          </ul>
        </div>

        <div className="hm-recon__panel" data-recon data-state="after" data-reveal data-reveal-delay="120">
          <div className="hm-recon__head">
            <span className="hm-recon__title">Collections this month</span>
            <div className="hm-toggle" role="group" aria-label="Show the numbers">
              <button type="button" data-recon-set="before" aria-pressed="false">
                Before
              </button>
              <button type="button" data-recon-set="after" aria-pressed="true">
                With LexCollect
              </button>
            </div>
          </div>
          <ul className="hm-recon__rows">
            {SOURCES.map((s) => {
              const diff = s.raw - RECONCILED;
              const off = Math.max(-1, Math.min(1, diff / 6000));
              return (
                <li key={s.tool} style={{ ["--off" as string]: off.toFixed(3) }}>
                  <span className="hm-recon__src">
                    <b>{s.system}</b>
                    <span>{s.tool}</span>
                  </span>
                  <span className="hm-recon__track">
                    <span className="hm-recon__amt">
                      <span className="v-before">{usd(s.raw, 2)}</span>
                      <span className="v-after">{usd(RECONCILED, 2)}</span>
                    </span>
                  </span>
                  <span className="hm-recon__note">
                    <span className={`v-before${diff === 0 ? "" : " is-off"}`}>{diff === 0 ? "Matches" : "Doesn't match"}</span>
                    <span className="v-after">{s.note}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="hm-recon__foot">
            <span className="v-before">4 systems, 4 different answers</span>
            <span className="v-after">
              Reconciled <b>{usd(RECONCILED, 2)}</b> · every difference explained
            </span>
            <span className="hm-example">Example data</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ---------- Platform explorer ---------- */

interface Capability {
  id: string;
  tab: string;
  title: string;
  text: string;
  points: string[];
  screens: string;
  Mock: (props: { id?: string }) => JSX.Element;
}

const CAPABILITIES: Capability[] = [
  {
    id: "see",
    tab: "See every dollar",
    title: "A receivables number the partners can trust, every month.",
    text: "One live view across your client system, processor, books and bank, with a certified snapshot on the 1st that you can hand to the partners.",
    points: ["Aging and open AR from real history, not a re-run of today", "Expected deposits by week", "Unmatched payments counted and queued, never parked"],
    screens: "AR Management · Controller view · AR Movement · Monthly snapshots",
    Mock: MockSee,
  },
  {
    id: "connect",
    tab: "Reconnect clients",
    title: "Most late accounts aren't refusals. They're clients the firm lost touch with.",
    text: "The right message, by email or text, goes to the right client at the right moment, in your firm's voice. A person steps in only when the client needs one.",
    points: ["Balances reconciled before anything is sent", "Failed cards get an update link, not a collections call", "Every reply and promise logged to the account"],
    screens: "Connect queue · Email & SMS · Client lists · Commitments",
    Mock: MockConnect,
  },
  {
    id: "recover",
    tab: "Recover hard debt",
    title: "Older balances get a plan the client can keep.",
    text: "Ninety-day-plus accounts get a sequence instead of a shouting match: a reconciled balance first, a clear message, a plan, and a record of every promise.",
    points: ["Promises tracked to the date and the dollar", "Missed installments surface while they're small", "Hardship requests routed to the right person"],
    screens: "Hard-debt sequences · Promise tracking · Hardship requests · Card recovery",
    Mock: MockRecover,
  },
  {
    id: "run",
    tab: "Run like a department",
    title: "The work an elite accounting team does by hand, done every day.",
    text: "Reconciliation, duplicate cleanup, migration between systems and payment booking run on their own, each with a named check and an owner when something breaks.",
    points: ["A green status means the job really ran", "Payments can't be booked twice", "Outcomes by team member, by day"],
    screens: "Continuous reconciliation · Team performance · Escalations · Daily activity",
    Mock: MockRun,
  },
];

const Explore = () => (
  <section className="section hm-explore" id="platform">
    <div className="container">
      <div className="hm-explore__head" data-reveal>
        <p className="eyebrow">The platform</p>
        <h2>One place for the whole receivables job.</h2>
        <p className="lead">Four jobs an accounting department does for a firm, each one a working part of LexCollect today.</p>
      </div>
      <div className="hm-tabs" data-tabs data-autoplay="9000" data-reveal>
        <div className="hm-tabs__list" aria-label="Platform capabilities">
          {CAPABILITIES.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={`hm-tab${i === 0 ? " is-active" : ""}`}
              data-tab={c.id}
              id={`tab-${c.id}`}
              aria-controls={`panel-${c.id}`}
            >
              <span className="hm-tab__num">0{i + 1}</span>
              <span className="hm-tab__label">{c.tab}</span>
            </button>
          ))}
        </div>
        {CAPABILITIES.map((c, i) => (
          <div
            key={c.id}
            className={`hm-panel${i === 0 ? " is-active" : ""}`}
            data-panel={c.id}
            id={`panel-${c.id}`}
            aria-labelledby={`tab-${c.id}`}
          >
            <div className="hm-panel__copy">
              <h3>{c.title}</h3>
              <p>{c.text}</p>
              <ul className="hm-ticks">
                {c.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className="hm-panel__screens">
                <span>Screens</span> {c.screens}
              </p>
            </div>
            <div className="hm-panel__visual">
              <c.Mock />
            </div>
          </div>
        ))}
      </div>
      <div className="actions">
        <Link className="btn btn--ghost" to={MARKETING_ROUTES.platform}>
          Explore the full platform <Arrow />
        </Link>
      </div>
    </div>
  </section>
);

/* ---------- The loop, one client at a time ---------- */

const LOOP: { key: string; title: string; text: string; card: AccountState }[] = [
  {
    key: "queue",
    title: "Queue",
    text: "Late accounts are ranked by balance, age and last contact, built from reconciled balances. Consult-only and junk records stay out.",
    card: {
      status: "In today's queue · #3",
      tone: "warn",
      rows: [
        ["Past due", "$1,050 · 3 installments"],
        ["Days late", "34"],
        ["Last contact", "41 days ago"],
        ["Reason", "Card on file failed"],
      ],
    },
  },
  {
    key: "connect",
    title: "Connect",
    text: "A clear, on-brand text or email goes out: a failed card, a missed installment, a balance due. It's logged, and a person steps in only when needed.",
    card: {
      status: "Message sent · 9:14 AM",
      tone: "info",
      rows: [
        ["Channel", "Text message"],
        ["Template", "Update your card"],
        ["Delivered", "Yes · read 9:20 AM"],
        ["Reply", "“Can I catch up on the 15th?”"],
      ],
    },
  },
  {
    key: "commit",
    title: "Commit",
    text: "A promise to pay gets a date and an amount, then a reminder the day before. A missed installment surfaces while it's still small.",
    card: {
      status: "Promise · $1,050 on Oct 15",
      tone: "info",
      rows: [
        ["Card", "Updated by client"],
        ["Reminder", "Oct 14 · scheduled"],
        ["Owner", "Billing team"],
        ["Autopay", "Resumes after catch-up"],
      ],
    },
  },
  {
    key: "close",
    title: "Close",
    text: "Paid accounts drop off the queue on their own. Hardship and disputes go to the right team with a priority. Nothing sits in limbo.",
    card: {
      status: "Paid · removed from queue",
      tone: "ok",
      rows: [
        ["Paid", "$1,050 · Oct 15"],
        ["Plan", "Current · autopay on"],
        ["Collections call", "Never needed"],
        ["Record", "Every message and promise kept"],
      ],
    },
  },
];

const Loop = () => (
  <section className="section section--light hm-loop" id="connect">
    <div className="container">
      <div className="hm-loop__head" data-reveal>
        <p className="eyebrow">Every client connected</p>
        <h2>From “they stopped paying” to a plan and a payment.</h2>
        <p className="lead">One account, four steps, a record at every one. A partner can see what happened without asking.</p>
      </div>
      <div className="hm-loop__grid" data-scrolly>
        <ol className="hm-loop__steps">
          {LOOP.map((s, i) => (
            <li key={s.key} className={`hm-step${i === 0 ? " is-active" : ""}`} data-step={s.key}>
              <span className="hm-step__num">0{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <div className="hm-step__card">
                <AccountCard state={s.card} />
              </div>
            </li>
          ))}
        </ol>
        <div className="hm-loop__stage" aria-hidden="true">
          <div className="hm-loop__sticky">
            {LOOP.map((s, i) => (
              <div key={s.key} className={`hm-loop__frame${i === 0 ? " is-active" : ""}`} data-stage={s.key}>
                <AccountCard state={s.card} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ---------- Results ---------- */

const FINDINGS = [
  { num: "$928K", text: "across 228 clients whose cards had failed. They got an update-your-card message, not a collections call." },
  { num: "428", text: "contracts marked Paid with about 4% actually collected, found, reclassified and audited." },
  { num: "561", text: "orphan contracts re-linked to the right clients, and 89 duplicate client records merged." },
];

const ResultsBand = () => (
  <section className="section section--deep hm-results" id="results">
    <div className="container">
      <div className="hm-results__grid">
        <div data-reveal>
          <p className="eyebrow">Results</p>
          <blockquote className="hm-results__quote">
            At the first firm we deployed in, the reconciled book landed within 5% of the firm's own ground truth. The
            rest was a named backlog with an owner.
          </blockquote>
          <p className="muted">
            A high-volume firm running MyCase, Filevine, LawPay, HubSpot and QuickBooks, with thousands of payment plans
            and payers who weren't the client.
          </p>
          <Link className="hm-link" to={MARKETING_ROUTES.results}>
            Read the full results <Arrow />
          </Link>
        </div>
        <ul className="hm-findings">
          {FINDINGS.map((f, i) => (
            <li key={f.num} data-reveal data-reveal-delay={i * 90}>
              <span className="hm-findings__num">{f.num}</span>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

/* ---------- Roles ---------- */

const ROLES = [
  { who: "Partners & owners", what: "The number, and the reason behind it", text: "Certified AR, team performance and the biggest movers in the book this month." },
  { who: "Controllers & administrators", what: "Reconciled, forecastable, defensible", text: "Expected deposits, cash-flow analytics and the month-end packet, ready." },
  { who: "Billing & client relations", what: "A queue that's already prioritized", text: "Messages, promises, hardship requests and the client's full ledger on one screen." },
  { who: "Service teams", what: "Delivery sees what billing sees", text: "Pipeline by stage, deadline watch and an inbox for escalations that need someone who knows the client." },
];

const Roles = () => (
  <section className="section hm-roles" id="who">
    <div className="container">
      <div className="hm-roles__head" data-reveal>
        <p className="eyebrow">Suited to your firm</p>
        <h2>Built for everyone who touches the money.</h2>
        <p className="lead">
          Roles, queues, messages, product lines and integrations are configuration, not code. Your clients hear from
          your firm, in your voice.
        </p>
      </div>
      <ul className="hm-roles__grid">
        {ROLES.map((r, i) => (
          <li key={r.who} className="hm-role" data-reveal data-reveal-delay={i * 70}>
            <span className="hm-role__who">{r.who}</span>
            <h3>{r.what}</h3>
            <p>{r.text}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

/* ---------- FAQ ---------- */

const FAQS = [
  {
    q: "What is LexCollect?",
    a: "An accounts-receivable accounting service for firms: the visibility, automation and client connection of a high-level accounting department, delivered as software and run by people who know receivables. It reconciles your client system, processor, books and bank into one view of what you're owed, then runs the outreach, promises, escalations and reporting on top of it.",
  },
  {
    q: "Do you provide collectors?",
    a: "No. LexCollect provides the connection: the queues, the automated email and text, the promises and the record. Your own team handles the conversations that need a person, with the client's reconciled ledger in front of them.",
  },
  {
    q: "Does it replace our client-management or accounting software?",
    a: "No. LexCollect sits across the systems you already run and reconciles them. Your team keeps working in the same tools.",
  },
  {
    q: "Which systems does it connect to?",
    a: `Any CRM or practice system that exports or has an API. Working today with ${INTEGRATIONS.join(", ")}, plus bank deposits and spreadsheet exports. If you run something else, tell us on the first call.`,
  },
  {
    q: "What does the first call involve?",
    a: "One conversation about your systems, then a first look at your book: what's late, what's unmatched, which clients have simply lost touch, and what you could recover first. No exports needed for the first call.",
  },
];

const Faq = () => (
  <section className="section section--rule hm-faq" id="faq">
    <div className="container">
      <div className="split">
        <div data-reveal>
          <p className="eyebrow">Questions</p>
          <h2>What firm owners ask first.</h2>
        </div>
        <FaqList items={FAQS} />
      </div>
    </div>
  </section>
);

/* ---------- Start ---------- */

const Start = () => (
  <section className="section hm-start" id="contact">
    <div className="container">
      <div className="hm-start__grid">
        <div className="hm-start__copy">
          <p className="eyebrow">Book a call</p>
          <h2>See what your own book says.</h2>
          <p className="lead">
            Tell us about your firm and the systems you use. We'll show you where money is stuck, what each account is
            worth, and which clients one message would bring back.
          </p>
          <ol className="next-steps">
            <li>
              <b>We reply within one business day</b>
              <span>to set a time that works for your team.</span>
            </li>
            <li>
              <b>We walk through your systems</b>
              <span>Your client-management, payment and accounting tools, and where money seems to go missing.</span>
            </li>
            <li>
              <b>You see what's recoverable</b>
              <span>Late, unmatched, failed-card and ready-to-connect, with a dollar figure on each.</span>
            </li>
          </ol>
          <p className="hm-start__alt">
            Prefer email? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <br />
            Already a client? <Link to={MARKETING_ROUTES.login}>Log in to your workspace</Link>
          </p>
        </div>
        <div className="hm-start__form">
          <DiagnosticForm sourcePage="home" idPrefix="home" />
        </div>
      </div>
    </div>
  </section>
);

const LandingPage = () => {
  usePageMeta(HOME_META.title, HOME_META.description);

  return (
    <SiteShell>
      <Hero />
      <Proof />
      <Recon />
      <Explore />
      <Loop />
      <ResultsBand />
      <Roles />
      <Faq />
      <Start />
    </SiteShell>
  );
};

export default LandingPage;
