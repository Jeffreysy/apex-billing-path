import { CtaBand, FaqList, PageHero, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";
import { INTEGRATIONS } from "@/lib/marketing";

export const PLATFORM_META = {
  title: "AR Oversight, Automation & Client Connection Platform for Firms | LexCollect",
  description:
    "AR oversight, continuous reconciliation and migration, a Connect queue with automated email and SMS, team accountability, escalations, product and lifecycle analytics, CRM compatibility and forecasting for firms, in one service.",
};

interface Module {
  id: string;
  num: string;
  eyebrow: string;
  title: string;
  lede: string;
  screens: string[];
  caps: { title: string; text: string }[];
}

const MODULES: Module[] = [
  {
    id: "oversight",
    num: "01",
    eyebrow: "AR Oversight",
    title: "One live view of everything your firm is owed",
    lede: "Aging, open AR over time, expected deposits and a certified monthly snapshot, reconciled across every system you run.",
    screens: ["Financial Oversight", "AR Oversight", "Controller AR Oversight", "AR Movement & Projection", "Live AR"],
    caps: [
      {
        title: "Aging you can defend",
        text: "Current, late and delinquent balances by bucket, by client and by product, built from reconciled payments rather than exported statuses.",
      },
      {
        title: "Certified monthly snapshots",
        text: "AR is captured on a schedule so the twelve-month trend is real history. Fallback to the last certified figure when live detail is slow.",
      },
      {
        title: "Movement and projection",
        text: "Which clients moved the book this period, what's expected from active plans, and where the trend is heading.",
      },
    ],
  },
  {
    id: "reconciliation",
    num: "02",
    eyebrow: "Automation & data integrity",
    title: "The work of a finance department, done every day",
    lede: "Processor, client system, CRM and books reconciled continuously. Migrations between incompatible systems reconciled record by record. Anything that can't be tied is counted and queued for a person.",
    screens: ["Continuous reconciliation", "Migration reconciliation", "CRM validation", "Unmatched payment review", "Data Import"],
    caps: [
      {
        title: "Ranked match suggestions",
        text: "Unmatched payments get the five most likely clients by name similarity, amount and timing. A person confirms. Nothing is matched on a guess.",
      },
      {
        title: "Duplicates and orphans healed",
        text: "Duplicate client records merged into one survivor with every related table repointed. Contracts with no client re-linked or given one.",
      },
      {
        title: "Booked once, audited always",
        text: "Idempotency guards stop a payment being booked twice on webhook retries. Every merge, link and reclassification is written to an audit table and reversible.",
      },
    ],
  },
  {
    id: "collections",
    num: "03",
    eyebrow: "Connect",
    title: "Rebuild the connection between your firm and the clients who owe it",
    lede: "A prioritized queue, automated email and SMS to the right client lists, and a record of every message, promise and reply. A person steps in only when the client needs one.",
    screens: ["Connect Queue", "Automated email & SMS", "Client lists & sequences", "Payment Commitments", "Card Recovery", "Daily Activity Log"],
    caps: [
      {
        title: "Queue intelligence",
        text: "Accounts ranked by balance, aging and last contact, built from reconciled balances. Consult-only records, import noise and abandoned contracts stay out by default.",
      },
      {
        title: "Automated messaging, in your voice",
        text: "Missed installment, failed card, balance due, plan complete: each list gets its own email and SMS sequence, sent from your firm, logged on the account, and stopped the moment a payment lands.",
      },
      {
        title: "Commitments and hardship",
        text: "Promises to pay carry a date and amount and get followed up automatically. Hardship requests are a workflow, not a sticky note.",
      },
    ],
  },
  {
    id: "accountability",
    num: "04",
    eyebrow: "Accountability",
    title: "Every team member, every outreach, every dollar, every day",
    lede: "Scorecards for billing, client relations and intake, built from the full activity log and certified per person.",
    screens: ["Team Performance", "Collections KPI", "Outcome Distribution", "Origin breakdown", "Coverage tracking"],
    caps: [
      {
        title: "Monthly scorecards",
        text: "Outreach, dollars collected, average per contact, commission, collection rate, contacts per day and connected per day, per team member.",
      },
      {
        title: "Outcomes and origins",
        text: "Where collected dollars came from (AR list, email sequence, SMS, follow-up, transfer, service-team request) and how each contact ended, with dirty labels normalized.",
      },
      {
        title: "Today, not last month",
        text: "A date-stamped row per team member for the current day, and new-client contact counts by day of week.",
      },
    ],
  },
  {
    id: "escalations",
    num: "05",
    eyebrow: "Unique escalations & internal connection",
    title: "Hand-offs with a queue, a priority and an owner",
    lede: "Billing, service teams, intake and management look at the same record. An escalation has a status that has to be closed.",
    screens: ["Escalation Management", "Department inboxes", "Management inbox", "Hardship requests", "Deadline watch"],
    caps: [
      {
        title: "Seven hand-off queues",
        text: "Service teams, compliance, customer care, management, sales, billing ops and a custom queue, each with its own inbox and the live roster as assignees.",
      },
      {
        title: "Context travels with it",
        text: "Source (client reply, service-team request, refund follow-up, compliance review), priority, notes and the client's ledger, all on the escalation.",
      },
      {
        title: "Deadlines in view",
        text: "Service and contract deadlines appear on the client record and in a firm-wide panel, so collections never collides with a commitment the firm has made.",
      },
    ],
  },
  {
    id: "products",
    num: "06",
    eyebrow: "Products & lifecycle",
    title: "Which products make the money, and when it arrives",
    lede: "Billing by product, contract lifecycle and the service pipeline by stage, so partners can see what to sell more of.",
    screens: ["Billing by Product", "Contract Lifecycle", "Contract Progression", "Service Pipeline by Stage", "Product Mix", "Monthly Intakes"],
    caps: [
      {
        title: "Cash by product",
        text: "What each product line bills and collects, and how long it takes to do it.",
      },
      {
        title: "Contract lifecycle",
        text: "From signed to current to paid, with abandoned and delinquent contracts classified honestly instead of hidden in 'Paid'.",
      },
      {
        title: "Service pipeline",
        text: "Active engagements by stage, product mix and twelve months of intakes, next to the money those engagements produce.",
      },
    ],
  },
  {
    id: "crm",
    num: "07",
    eyebrow: "Works with your CRM",
    title: "Compatible with any CRM that exports or has an API",
    lede: "Contact, engagements, ledger, plan and escalations on one screen, with the latest processor payments blended in. Your CRM stays your CRM.",
    screens: ["Any CRM with export or API", "Client Lookup", "Client 360", "HubSpot sync", "Email segments", "Take a payment"],
    caps: [
      {
        title: "Everything about the client",
        text: "Contact details, engagements, payment ledger and plan from the client system, plus fresh processor payments with a freshness stamp.",
      },
      {
        title: "Leads validated by money, segments built from balances",
        text: "HubSpot deals marked won become active clients only when payment evidence exists. Email segments (failed card, missed installment, paid in full) come from reconciled balances, so the right client gets the right message.",
      },
      {
        title: "Take a payment, correctly",
        text: "Card or ACH, routed to operating or Trust / IOLTA based on what it's for, logged as an activity on the account.",
      },
    ],
  },
  {
    id: "reporting",
    num: "08",
    eyebrow: "Reporting & forecasting",
    title: "Forecasts from plans, not hopes",
    lede: "Expected deposits and collections built from active payment plans and history, with a report builder for the month-end packet.",
    screens: ["Reporting & Forecasting", "Revenue Forecast (8 weeks)", "Expected Deposits", "Historical Collections", "Report Builder"],
    caps: [
      {
        title: "Eight-week revenue forecast",
        text: "What should land each week from scheduled installments, against what actually did.",
      },
      {
        title: "Historical collections",
        text: "Monthly collections classified by type, with quarter views for the partners' meeting.",
      },
      {
        title: "Print-ready packets",
        text: "Build the month-end report once, print it clean, and send the same numbers to everyone.",
      },
    ],
  },
];

const FAQS = [
  {
    q: "Does LexCollect replace our client-management or accounting software?",
    a: "No. LexCollect sits across the systems you already use and reconciles them. Your team keeps working in the same client-management and accounting tools.",
  },
  {
    q: "What happens when a payment can't be matched automatically?",
    a: "It's counted, queued and shown with ranked suggestions. A person confirms the match, and the confirmation is recorded. Nothing is matched on a guess and nothing is dropped.",
  },
  {
    q: "Who on our team uses it?",
    a: "Partners and owners for the certified number and executive insights. Controllers and administrators for oversight, forecasting and reporting. Billing and client relations for the Connect queue, sequences and commitments. Service teams for the pipeline, deadline watch and their escalation inbox. Access is by role.",
  },
  {
    q: "How is it configured for our firm?",
    a: "Your team comes from a live roster. Escalation targets are your departments. Message sequences, product lines, outcome labels, origin buckets and aging thresholds are set per firm. Integrations are the ones you already run, and any CRM that exports or has an API can be connected.",
  },
  {
    q: "Is LexCollect a collections agency? Do you provide collectors?",
    a: "No to both. LexCollect is the accounting department's toolkit, delivered as a service: the reconciled book, the queues, the automated email and SMS, the commitments and the record. Your firm keeps the client relationship and decides who is contacted, when and how.",
  },
];

const PlatformPage = () => {
  usePageMeta(PLATFORM_META.title, PLATFORM_META.description);

  return (
    <SiteShell>
      <PageHero
        crumb="Platform"
        eyebrow="Platform"
        title="An accounting department's visibility and automation, in one service."
        lead="Eight working parts, the visibility and automation of a high-level accounting firm at your fingertips. Each one is a screen your team will open, built on the same reconciled data, so the partner, the controller and the person messaging the client are looking at the same dollar."
      >
        <nav className="jump" aria-label="On this page">
          {MODULES.map((m) => (
            <a key={m.id} href={`#${m.id}`}>
              {m.num} {m.eyebrow}
            </a>
          ))}
        </nav>
      </PageHero>

      <section className="section">
        <div className="container">
          {MODULES.map((m) => (
            <article className="module" id={m.id} key={m.id}>
              <div>
                <p className="module__num" aria-hidden="true">
                  {m.num}
                </p>
                <p className="eyebrow">{m.eyebrow}</p>
                <h2>{m.title}</h2>
                <p className="module__lede">{m.lede}</p>
                <div className="module__screens" aria-label="Screens in this module">
                  {m.screens.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="caps">
                {m.caps.map((c) => (
                  <div key={c.title}>
                    <h3>{c.title}</h3>
                    <p>{c.text}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--deep section--rule">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Compare</p>
            <h2>How LexCollect compares</h2>
            <p className="lead">
              Most firms track receivables with a collections tool, a spreadsheet, or both. Here's where the difference
              shows up.
            </p>
          </div>
          <div className="compare-wrap">
            <table className="compare">
              <thead>
                <tr>
                  <th scope="col">Capability</th>
                  <th scope="col" className="is-us">
                    LexCollect
                  </th>
                  <th scope="col">Collections tool</th>
                  <th scope="col">Spreadsheet + report</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Starts from</th>
                  <td className="is-us">A reconciled book</td>
                  <td>Who owes money</td>
                  <td>Whatever was exported</td>
                </tr>
                <tr>
                  <th scope="row">Reconciles client system, processor, CRM, books and bank</th>
                  <td className="is-us yes">Continuously</td>
                  <td className="no">No</td>
                  <td>Manually, monthly</td>
                </tr>
                <tr>
                  <th scope="row">Automated email and SMS to reconciled client lists</th>
                  <td className="is-us yes">Yes, in your voice</td>
                  <td>Dialer</td>
                  <td className="no">No</td>
                </tr>
                <tr>
                  <th scope="row">Separates failed cards from delinquency</th>
                  <td className="is-us yes">Yes</td>
                  <td className="no">No</td>
                  <td className="no">No</td>
                </tr>
                <tr>
                  <th scope="row">Per-person scorecards from the full activity log</th>
                  <td className="is-us yes">Yes, certified</td>
                  <td>Contact counts</td>
                  <td className="no">No</td>
                </tr>
                <tr>
                  <th scope="row">Escalations with queues, priorities and inboxes</th>
                  <td className="is-us yes">Seven queues</td>
                  <td>Notes</td>
                  <td className="no">No</td>
                </tr>
                <tr>
                  <th scope="row">Cash by product and contract lifecycle</th>
                  <td className="is-us yes">Yes</td>
                  <td className="no">No</td>
                  <td>If someone builds it</td>
                </tr>
                <tr>
                  <th scope="row">Trust / IOLTA vs operating routing</th>
                  <td className="is-us yes">Yes</td>
                  <td className="no">No</td>
                  <td className="no">No</td>
                </tr>
                <tr>
                  <th scope="row">Integrations</th>
                  <td className="is-us">Any CRM with export or API · {INTEGRATIONS.join(", ")}, bank</td>
                  <td>Processor</td>
                  <td>Exports</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section--rule">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Getting started</p>
            <h2>From first conversation to first certified snapshot</h2>
          </div>
          <ol className="steps">
            <li className="step">
              <span className="step__num">01</span>
              <h3>Connect your systems</h3>
              <p>We connect your client-management system, payment processor, CRM, accounting and bank data, and pull history.</p>
            </li>
            <li className="step">
              <span className="step__num">02</span>
              <h3>Reconcile and configure</h3>
              <p>You get the first reconciled book with the gaps named, and we set roles, roster, queues, message sequences and product lines to match your firm.</p>
            </li>
            <li className="step step--highlight">
              <span className="step__num">03</span>
              <h3>Work the queue</h3>
              <p>Sequences go out to reconciled lists and your team works the queue of clients who need a person. LexCollect keeps reconciling and logging, so the first month ends with a certified number.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section section--deep section--rule">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">Questions</p>
              <h2>Platform FAQ</h2>
            </div>
            <FaqList items={FAQS} />
          </div>
        </div>
      </section>

      <CtaBand
        title="Start with a reconciled book and a connected client list."
        lead="We'll walk through your systems and show you what LexCollect would find first."
      />
    </SiteShell>
  );
};

export default PlatformPage;
