import type { ReactNode } from "react";
import { Arrow, BOOK_CALL_LABEL, BookCallLink, CtaBand, FaqList, PageHero, SiteShell, SubNav, Timeline, usePageMeta } from "@/components/marketing/SiteChrome";
import { AccountCard, MockConnect, MockEscalation, MockRun, MockSee } from "@/components/marketing/Mocks";
import { INTEGRATIONS } from "@/lib/marketing";

export const PLATFORM_META = {
  title: "Accounting, Reconciliation & Client Connection Platform for Immigration Firms | LexCollect",
  description:
    "One source of truth for immigration and humanitarian law firms: AR management, continuous reconciliation across case management, payments, books and bank, respectful automated email and SMS, team accountability, escalations, case-type analytics and forecasting, in one service.",
};

interface Module {
  id: string;
  short: string;
  eyebrow: string;
  title: string;
  lede: string;
  screens: string[];
  caps: { title: string; text: string }[];
  /** A product mock. Modules without one show their screens as an app menu. */
  visual?: ReactNode;
}

const MODULES: Module[] = [
  {
    id: "management",
    short: "AR Management",
    eyebrow: "AR Management",
    title: "One live view of everything your firm is owed.",
    lede: "Aging, open AR over time, expected deposits and a certified monthly snapshot, reconciled across your case system, processor, books and bank.",
    screens: ["Financial Management", "AR Management", "Controller AR Management", "AR Movement & Projection", "Live AR"],
    caps: [
      { title: "Aging you can defend", text: "Current, late and delinquent balances by bucket, by client and by product, built from reconciled payments rather than exported statuses." },
      { title: "Certified monthly snapshots", text: "AR is captured on a schedule so the twelve-month trend is real history. Fallback to the last certified figure when live detail is slow." },
      { title: "Movement and projection", text: "Which clients moved the book this period, what's expected from active plans, and where the trend is heading." },
    ],
    visual: <MockSee id="pf-chart" />,
  },
  {
    id: "reconciliation",
    short: "Automation",
    eyebrow: "Automation & data integrity",
    title: "The work of a finance department, done every day.",
    lede: "Processor, case system, CRM and books reconciled continuously, including the payments a relative or sponsor made. Migrations between incompatible systems reconciled record by record. Anything that can't be tied is counted and queued for a person.",
    screens: ["Continuous reconciliation", "Migration reconciliation", "CRM validation", "Unmatched payment review", "Data Import"],
    caps: [
      { title: "Ranked match suggestions", text: "Unmatched payments get the five most likely clients by name similarity (two surnames, transliterations, a relative's name), amount and timing. A person confirms. Nothing is matched on a guess." },
      { title: "Duplicates and orphans healed", text: "Duplicate client records merged into one survivor with every related table repointed. Contracts with no client re-linked or given one." },
      { title: "Booked once, audited always", text: "Idempotency guards stop a payment being booked twice on webhook retries. Every merge, link and reclassification is written to an audit table and reversible." },
    ],
    visual: <MockRun />,
  },
  {
    id: "collections",
    short: "Connect",
    eyebrow: "Connect",
    title: "Reach families the way a trusted firm should.",
    lede: "A prioritized queue, respectful automated email and SMS in your firm's name, and a record of every message, promise and reply. A person steps in only when the family needs one.",
    screens: ["Connect Queue", "Automated email & SMS", "Client lists & sequences", "Payment Commitments", "Card Recovery", "Daily Activity Log"],
    caps: [
      { title: "Queue intelligence", text: "Accounts ranked by balance, aging and last contact, built from reconciled balances. Consult-only records, import noise and abandoned contracts stay out by default." },
      { title: "Messages that build trust", text: "Missed installment, failed card, balance due, plan complete: each list gets its own email and SMS sequence, written in your firm's voice, logged on the account, and stopped the moment a payment lands. The plan-complete message is a thank-you." },
      { title: "Commitments and hardship", text: "Promises to pay carry a date and amount and get followed up automatically. When work dries up or a family is in crisis, the hardship request is a workflow with an owner, not a sticky note." },
    ],
    visual: <MockConnect />,
  },
  {
    id: "accountability",
    short: "Accountability",
    eyebrow: "Accountability",
    title: "Every team member, every outreach, every dollar, every day.",
    lede: "Scorecards for billing, client relations and intake, built from the full activity log and certified per person.",
    screens: ["Team Performance", "Collections KPI", "Outcome Distribution", "Origin breakdown", "Coverage tracking"],
    caps: [
      { title: "Monthly scorecards", text: "Outreach, dollars collected, average per contact, commission, collection rate, contacts per day and connected per day, per team member." },
      { title: "Outcomes and origins", text: "Where collected dollars came from (AR list, email sequence, SMS, follow-up, transfer, service-team request) and how each contact ended, with dirty labels normalized." },
      { title: "Today, not last month", text: "A date-stamped row per team member for the current day, and new-client contact counts by day of week." },
    ],
  },
  {
    id: "escalations",
    short: "Escalations",
    eyebrow: "Unique escalations & internal connection",
    title: "Hand-offs with a queue, a priority and an owner.",
    lede: "Billing, case teams, intake and management look at the same record. An escalation has a status that has to be closed.",
    screens: ["Escalation Management", "Department inboxes", "Management inbox", "Hardship requests", "Deadline watch"],
    caps: [
      { title: "Seven hand-off queues", text: "Service teams, compliance, customer care, management, sales, billing ops and a custom queue, each with its own inbox and the live roster as assignees." },
      { title: "Context travels with it", text: "Source (client reply, service-team request, refund follow-up, compliance review), priority, notes and the client's ledger, all on the escalation." },
      { title: "Deadlines in view", text: "Case and contract deadlines appear on the client record and in a firm-wide panel, so a payment message never collides with a case deadline or a commitment the firm has made." },
    ],
    visual: <MockEscalation />,
  },
  {
    id: "products",
    short: "Products",
    eyebrow: "Products & lifecycle",
    title: "Which case types make the money, and when it arrives.",
    lede: "Billing by case type, contract lifecycle and the case pipeline by stage, so partners can see which practice areas carry the firm.",
    screens: ["Billing by Product", "Contract Lifecycle", "Contract Progression", "Service Pipeline by Stage", "Product Mix", "Monthly Intakes"],
    caps: [
      { title: "Cash by case type", text: "What each case type bills and collects, and how long it takes to do it." },
      { title: "Contract lifecycle", text: "From signed to current to paid, with abandoned and delinquent contracts classified honestly instead of hidden in ‘Paid’." },
      { title: "Case pipeline", text: "Active cases by stage, case mix and twelve months of intakes, next to the money those cases produce." },
    ],
  },
  {
    id: "crm",
    short: "Your CRM",
    eyebrow: "Works with your CRM",
    title: "Compatible with any case system or CRM that exports or has an API.",
    lede: "Contact, matters, ledger, plan and escalations on one screen, with the latest processor payments blended in. Your case system stays your case system.",
    screens: ["Any CRM with export or API", "Client Lookup", "Client 360", "HubSpot sync", "Email segments", "Take a payment"],
    caps: [
      { title: "Everything about the client", text: "Contact details, matters, payment ledger and plan from the case system, plus fresh processor payments with a freshness stamp." },
      { title: "Leads validated by money", text: "HubSpot deals marked won become active clients only when payment evidence exists. Email segments come from reconciled balances, so the right client gets the right message." },
      { title: "Take a payment, correctly", text: "Card or ACH, routed to operating or Trust / IOLTA based on what it's for, logged as an activity on the account." },
    ],
    visual: (
      <AccountCard
        state={{
          status: "Client 360 · synced 4 min ago",
          tone: "ok",
          rows: [
            ["Plan", "$350 a month · current"],
            ["Last payment", "$1,050 · Oct 15 · processor"],
            ["Messages", "3 this month · all logged"],
            ["Open escalations", "None"],
          ],
        }}
      />
    ),
  },
  {
    id: "reporting",
    short: "Reporting",
    eyebrow: "Reporting & forecasting",
    title: "Forecasts from plans, not hopes.",
    lede: "Expected deposits and collections built from active payment plans and history, with a report builder for the month-end packet.",
    screens: ["Reporting & Forecasting", "Revenue Forecast (8 weeks)", "Expected Deposits", "Historical Collections", "Report Builder"],
    caps: [
      { title: "Eight-week revenue forecast", text: "What should land each week from scheduled installments, against what actually did." },
      { title: "Historical collections", text: "Monthly collections classified by type, with quarter views for the partners' meeting." },
      { title: "Print-ready packets", text: "Build the month-end report once, print it clean, and send the same numbers to everyone." },
    ],
  },
];

/** For modules without a mock: the module's screens, shown as the app's own menu. */
const ScreensCard = ({ m }: { m: Module }) => (
  <div className="hm-mock pf-screens">
    <div className="hm-mock__head">
      <span>{m.eyebrow}</span>
      <span className="hm-example">Screens</span>
    </div>
    <ul>
      {m.screens.map((s, i) => (
        <li key={s} className={i === 0 ? "is-on" : undefined}>
          <span>{s}</span>
          <span aria-hidden="true">&rarr;</span>
        </li>
      ))}
    </ul>
  </div>
);

const COMPARE: { row: string; us: string; tool: string; sheet: string; usYes?: boolean; toolNo?: boolean; sheetNo?: boolean }[] = [
  { row: "Starts from", us: "A reconciled book", tool: "Who owes money", sheet: "Whatever was exported" },
  { row: "Reconciles case system, processor, CRM, books and bank", us: "Continuously", usYes: true, tool: "No", toolNo: true, sheet: "Manually, monthly" },
  { row: "Credits payments made by a relative, sponsor or employer", us: "Yes, with a person confirming", usYes: true, tool: "No", toolNo: true, sheet: "If someone notices" },
  { row: "Respectful email and SMS to reconciled client lists", us: "Yes, in your voice", usYes: true, tool: "Dialer", sheet: "No", sheetNo: true },
  { row: "Separates failed cards from delinquency", us: "Yes", usYes: true, tool: "No", toolNo: true, sheet: "No", sheetNo: true },
  { row: "Per-person scorecards from the full activity log", us: "Yes, certified", usYes: true, tool: "Contact counts", sheet: "No", sheetNo: true },
  { row: "Escalations with queues, priorities and inboxes", us: "Seven queues", usYes: true, tool: "Notes", sheet: "No", sheetNo: true },
  { row: "Cash by case type and contract lifecycle", us: "Yes", usYes: true, tool: "No", toolNo: true, sheet: "If someone builds it" },
  { row: "Trust / IOLTA vs operating routing", us: "Yes", usYes: true, tool: "No", toolNo: true, sheet: "No", sheetNo: true },
  { row: "Integrations", us: `Any CRM with export or API · ${INTEGRATIONS.join(", ")}, bank`, tool: "Processor", sheet: "Exports" },
];

const START = [
  { kicker: "Step 01", title: "Connect your systems", text: "We connect your case management system, payment processor, CRM, accounting and bank data, and pull history." },
  { kicker: "Step 02", title: "Reconcile and configure", text: "You get the first reconciled book with the gaps named, and we set roles, roster, queues, message sequences and case types to match your firm." },
  { kicker: "Step 03", title: "Work the queue", text: "Respectful sequences go out to reconciled lists and your team works the families who need a person. The first month ends with a certified number." },
];

const FAQS = [
  {
    q: "Does LexCollect replace our case management or accounting software?",
    a: "No. LexCollect sits across the systems you already use and reconciles them. Your team keeps working in the same case management and accounting tools.",
  },
  {
    q: "What happens when a payment can't be matched automatically?",
    a: "It's counted, queued and shown with ranked suggestions. A person confirms the match, and the confirmation is recorded. Nothing is matched on a guess and nothing is dropped.",
  },
  {
    q: "Who on our team uses it?",
    a: "Partners and owners for the certified number and executive insights. Controllers and administrators for management, forecasting and reporting. Billing and client relations for the Connect queue, sequences and commitments. Attorneys and paralegals for the case pipeline, deadline watch and their escalation inbox. Access is by role.",
  },
  {
    q: "How is it configured for our firm?",
    a: "Your team comes from a live roster. Escalation targets are your departments. Message sequences, case types, outcome labels, origin buckets and aging thresholds are set per firm. Integrations are the ones you already run, and any case system or CRM that exports or has an API can be connected.",
  },
  {
    q: "Is LexCollect a collections agency? Do you provide collectors?",
    a: "No to both. Nobody from LexCollect calls your clients. LexCollect is the accounting department's toolkit, delivered as a service: the reconciled book, the queues, the respectful email and SMS, the commitments and the record. Your firm keeps the client relationship and decides who is contacted, when and how.",
  },
];

const PlatformPage = () => {
  usePageMeta(PLATFORM_META.title, PLATFORM_META.description);

  return (
    <SiteShell>
      <PageHero
        crumb="Platform"
        eyebrow="Platform"
        title="One source of truth for your practice, and every family in it."
        lead="A high-level accounting department's visibility and automation in eight working parts, on the same reconciled data, so the partner, the controller and the person messaging the family are looking at the same dollar."
      >
        <div className="actions">
          <BookCallLink className="btn btn--primary">
            {BOOK_CALL_LABEL} <Arrow />
          </BookCallLink>
          <a className="btn btn--ghost" href="#compare">
            How it compares
          </a>
        </div>
      </PageHero>

      <div className="subnav-scope">
      <SubNav label="Platform modules" items={MODULES.map((m) => ({ id: m.id, label: m.short }))} />

      <section className="section pf-modules">
        <div className="container">
          {MODULES.map((m, i) => (
            <article className={`pf-module${i % 2 ? " pf-module--flip" : ""}`} id={m.id} key={m.id}>
              <div className="pf-module__copy" data-reveal>
                <p className="pf-module__eyebrow">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {m.eyebrow}
                </p>
                <h2>{m.title}</h2>
                <p className="pf-module__lede">{m.lede}</p>
                <dl className="pf-caps">
                  {m.caps.map((c) => (
                    <div key={c.title}>
                      <dt>{c.title}</dt>
                      <dd>{c.text}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="pf-module__visual hm-panel__visual" data-reveal data-reveal-delay="120">
                {m.visual ?? <ScreensCard m={m} />}
              </div>
            </article>
          ))}
        </div>
      </section>
      </div>

      <section className="section section--light pf-compare" id="compare">
        <div className="container">
          <div className="section-head" data-reveal>
            <p className="eyebrow">Compare</p>
            <h2>How LexCollect compares.</h2>
            <p className="lead">Most immigration firms track receivables with a collections tool, a spreadsheet, or both. Here's where the difference shows up.</p>
          </div>
          <div className="pf-compare__wrap" data-reveal>
            <table className="pf-table">
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
                {COMPARE.map((r) => (
                  <tr key={r.row}>
                    <th scope="row">{r.row}</th>
                    <td className={`is-us${r.usYes ? " yes" : ""}`}>{r.us}</td>
                    <td className={r.toolNo ? "no" : undefined}>{r.tool}</td>
                    <td className={r.sheetNo ? "no" : undefined}>{r.sheet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section pf-start" id="start">
        <div className="container">
          <div className="section-head" data-reveal>
            <p className="eyebrow">Getting started</p>
            <h2>From first conversation to first certified snapshot.</h2>
          </div>
          <Timeline items={START} />
        </div>
      </section>

      <section className="section section--deep section--rule">
        <div className="container">
          <div className="split">
            <div data-reveal>
              <p className="eyebrow">Questions</p>
              <h2>Platform FAQ</h2>
            </div>
            <FaqList items={FAQS} />
          </div>
        </div>
      </section>

      <CtaBand
        title="Start with one source of truth and a client list you can trust."
        lead="We'll walk through your systems and show you what LexCollect would find first."
      />
    </SiteShell>
  );
};

export default PlatformPage;
