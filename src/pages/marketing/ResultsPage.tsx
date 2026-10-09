import { Link } from "react-router-dom";
import { CtaBand, PageHero, ProofStrip, SiteShell, SubNav, Timeline, usePageMeta, type ProofItem } from "@/components/marketing/SiteChrome";
import { INTEGRATIONS, MARKETING_ROUTES } from "@/lib/marketing";

export const RESULTS_META = {
  title: "Results: Reconciliation, Migration & Client Connection at a Working Firm | LexCollect",
  description:
    "What LexCollect did inside a working firm: a $21.4M book reconciled, 561 orphan contracts re-linked, a migration with zero mismatches, email segments from real balances, and escalations with seven hand-off queues.",
};

/*
 * Every figure on this page comes from the first deployment. Figures that are
 * still being measured are `null` and are not rendered, so the public page never
 * shows a placeholder. Fill one in and it appears.
 */

const HEADLINE: ProofItem[] = [
  { n: 21.4, decimals: 1, prefix: "$", suffix: "M", label: "receivables reconciled to the firm's ground truth, within 5%, the gap explained and assigned" },
  { n: 3.5, decimals: 1, prefix: "$", suffix: "M", label: "in contract balances re-linked to the right clients through a migration between two CRMs" },
  { n: 1395, label: "records reconciled in that migration, with 0 mismatches needing manual correction" },
  { n: 228, label: "willing payers with a failed card ($928K) reached with one message instead of a collections call" },
];

/** Still being measured. Set `value` (e.g. "+38") to publish one. */
const PENDING_HEADLINE: { label: string; value: string | null; text: string }[] = [
  { label: "Paying clients gained", value: null, text: "Net new current and on-plan clients per month after go-live." },
  { label: "Hard-delinquent $ collected", value: null, text: "Month-over-month recovery of 90+ day balances after go-live." },
  { label: "Revenue traced to LexCollect", value: null, text: "Dollars collected from a LexCollect queue, email segment or commitment, by origin." },
];

interface Fact {
  value: string | null;
  label: string;
}

interface Story {
  id: string;
  short: string;
  eyebrow: string;
  title: string;
  lede: string;
  facts: Fact[];
  notes: { title: string; text: string }[];
}

const STORIES: Story[] = [
  {
    id: "reconciliation",
    short: "Reconciliation",
    eyebrow: "Reconciliation",
    title: "A $21M book, reconciled to the firm's own ground truth.",
    lede: "The firm's “true AR” lived in a spreadsheet built from raw exports. The database said something else. LexCollect closed the gap and explained what was left.",
    facts: [
      { value: "$21,425,589", label: "the firm's ground-truth receivables figure" },
      { value: "< 5%", label: "gap after reconciliation, attributable to a named unmatched-payment backlog and timing" },
      { value: "428", label: "contracts carried as “Paid” with only ~4% of their value collected, reclassified" },
      { value: "561", label: "orphan contracts worth $3.5M with no client, re-linked or given a client record" },
      { value: "89", label: "duplicate client records merged, references moved, nothing hard-deleted" },
    ],
    notes: [
      { title: "Zombie “Paid” contracts.", text: "A prior import had marked 428 contracts as paid simply because they weren't in the firm's AR spreadsheet. Only about 4% of their value had ever been collected. LexCollect found them by comparing status to actual payments, reclassified them as abandoned, and kept every change reversible." },
      { title: "Orphan contracts.", text: "561 contracts had balances but no client attached. 27 were re-linked through reference numbers embedded in the contract, 3 by normalized name, 2 were flagged as ambiguous for a person, and 529 got a proper client record created from the contract itself. Every merge and link was written to an audit table." },
      { title: "Duplicates.", text: "Exact and near-duplicate client records were merged into one survivor, with all 23 related tables repointed, so a client's messages, payments, plan and escalations finally sat in one place." },
      { title: "Self-verifying.", text: "Each cleanup migration checked itself against the ground truth before committing, so a fix that moved the book by more than $50K would have stopped itself." },
    ],
  },
  {
    id: "payments",
    short: "Payment matching",
    eyebrow: "Payment matching",
    title: "Thousands of processor payments, tied to the right client.",
    lede: "The processor knew who paid. The client system knew who owed. Nothing connected the two, especially when a spouse, parent or employer was the one paying.",
    facts: [
      { value: "2,013", label: "payments ($1,190,204) matched to a client, contract and invoice" },
      { value: "759", label: "payments ($370,447) queued for human confirmation with ranked suggestions" },
      { value: "243", label: "new unmatched payments arrived in six days, which is why matching runs continuously" },
    ],
    notes: [
      { title: "Suggestions, not guesses.", text: "For every unmatched payment, LexCollect ranks the five most likely clients using name similarity, amount against the client's installment, and timing against their due date. Nothing is auto-matched below a confidence threshold. A person confirms, and the confirmation is recorded with who did it and how." },
      { title: "Real-world names.", text: "ALL-CAPS processor names, corrected names left in a notes field, two surnames in a different order. The matcher reads all of them." },
      { title: "Booked once.", text: "Payment webhooks retry and handlers race. Idempotency guards mean a payment can't be booked twice no matter how many times the processor sends it." },
    ],
  },
  {
    id: "migration",
    short: "Migration",
    eyebrow: "Migration",
    title: "A mass financial migration between two incompatible CRMs, without losing a dollar.",
    lede: "Moving every client's balance, plan and history from MyCase to Filevine is where receivables usually get lost. LexCollect reconciled both systems against the firm's own client lists before, during and after the move.",
    facts: [
      { value: "$3.5M", label: "in contract balances re-linked to the right clients during the move" },
      { value: "1,395", label: "records in the new system reconciled against 548 records on the firm's own lists" },
      { value: "448 / 196 / 18", label: "exact, reference-number-only and name-only matches, each tier reviewed separately" },
      { value: "0", label: "mismatches needing manual correction" },
      { value: "733", label: "records in the new system that weren't on any firm list, surfaced for intake to confirm" },
    ],
    notes: [
      { title: "Direct payment sync.", text: "Filevine payments now post straight into LexCollect through a webhook, with no middleware. Each one matches by invoice number, updates the invoice and contract balances, and logs an activity on the account, so the next message reflects it." },
      { title: "History, through the same door.", text: "Historical Filevine payments were backfilled through the identical booking pipeline as live ones, so old and new money follow one set of rules." },
      { title: "The old system kept in the picture.", text: "Contacts, engagements, ledgers and payment plans from the previous system are synced into the client 360, so staff still see the full history during and after the transition." },
    ],
  },
  {
    id: "hard-debt",
    short: "Hard debt",
    eyebrow: "Hard debt",
    title: "Delinquent dollars, reconnected by message and measured by bucket.",
    lede: "Once the book was reconciled, the firm could see its delinquent balance, split it by age, and reach every account with the right message instead of another round of calls.",
    facts: [
      { value: "$15.7M", label: "delinquent and late receivables made visible by aging bucket and owner" },
      { value: "$928K", label: "across 228 willing payers with a failed card, separated from true delinquency" },
      { value: "86%", label: "of the “autopay decline” turned out to be clients finishing their plans, not a card leak" },
      { value: null, label: "delinquent dollars collected per month before and after go-live" },
    ],
    notes: [
      { title: "The right list.", text: "Consult-only contacts, raw import noise and abandoned contracts are classified and kept out of the queue by default, so every message and every conversation lands on a real account." },
      { title: "A record of every contact.", text: "Outcome, dollars, origin and commission are logged per activity, whether it was an email, an SMS or a conversation. The firm's old activity dashboard had been showing about 8% of real activity. LexCollect now certifies per-person figures from the full log." },
      { title: "Promises that get followed.", text: "Payment commitments carry a date and an amount, and missed installments surface while they're still small." },
      { title: "Willing payers treated differently.", text: "The failed-card segment gets an “update your card” email instead of a collections call, which protects the relationship and recovers money faster." },
    ],
  },
  {
    id: "trust",
    short: "Trust & accounts",
    eyebrow: "Trust & firm accounts",
    title: "Operating, trust and the books, reconciled as one.",
    lede: "Retainers and advance fees have to land in trust. Earned fees have to land in operating. The firm has to be able to prove both.",
    facts: [
      { value: "Trust / IOLTA", label: "routing for retainer and advance-fee deposits, separate from operating" },
      { value: "Every txn", label: "processor transactions reconciled to a client, contract and invoice, or queued" },
      { value: "Monthly", label: "certified AR snapshots, so history is real history" },
      { value: "5 cohorts", label: "HubSpot “won” deals validated against payment evidence before a client counts as active" },
    ],
    notes: [
      { title: "Trust and operating, kept apart.", text: "Payments taken in LexCollect are routed to the firm's operating account or client trust account (including IOLTA) based on what they're for, so a retainer never lands in the wrong place." },
      { title: "The CRM and the books agree.", text: "A deal marked won in HubSpot only becomes an active client when there's payment evidence behind it. Deals with no money yet are held for review rather than inflating the client count." },
      { title: "Locked down.", text: "Row-level security on every table, no anonymous reads of financial data, and an audit log of who changed what." },
    ],
  },
  {
    id: "escalations",
    short: "Escalations",
    eyebrow: "Unique escalations & internal connection",
    title: "Internal hand-offs with a queue, a priority and an owner.",
    lede: "Before, an escalation was an email. Now it's a record that billing, service teams and management all see, with a status that has to be closed.",
    facts: [
      { value: "7", label: "hand-off queues: service teams, compliance, customer care, management, sales, billing ops, plus a custom one" },
      { value: "9", label: "source contexts, from client reply to service-team request to refund follow-up" },
      { value: "4", label: "priorities, with urgent and high surfaced to the right inbox automatically" },
    ],
    notes: [
      { title: "Inboxes per department.", text: "Service teams see what needs someone who knows the client. Management sees what needs a decision. Billing sees what's theirs. The same escalation, three views." },
      { title: "Hardship handled, not hidden.", text: "Hardship requests are their own workflow, so a client in trouble gets a considered answer instead of another message." },
      { title: "Deadlines respected.", text: "A deadline watch shows the firm's commitments on the client record and firm-wide, so collections never collides with a promise the firm has made." },
    ],
  },
  {
    id: "growth",
    short: "Growth",
    eyebrow: "Growth you can trace",
    title: "More paying clients, and revenue with a source on it.",
    lede: "Every collected dollar in LexCollect carries its origin, message and outcome, so the revenue the system produced is a report, not an estimate.",
    facts: [
      { value: null, label: "net new paying clients per month after go-live" },
      { value: null, label: "monthly cash flow before and after go-live" },
      { value: null, label: "revenue collected from a LexCollect queue, email segment or commitment" },
      { value: "7", label: "origin buckets on every collected dollar: AR list, email sequence, SMS, follow-up, transfer, service-team request, and more" },
    ],
    notes: [
      { title: "Segments, not blasts.", text: "Email segments come from reconciled balances: failed card, missed installment, paid in full, no invoice yet. The right client gets the right message, and the response shows up as a payment with that segment as its origin." },
      { title: "Paying clients, counted honestly.", text: "A client counts as paying when there's a payment behind them, not when a deal is marked won. The monthly view shows current and on-plan clients gained and lost, so growth is net, not gross." },
      { title: "Revenue attribution.", text: "Dollars from the Connect queue, from a commitment kept, from an email or SMS sequence and from a transfer are summed separately, by person and by month. That's the number you put next to the LexCollect invoice." },
    ],
  },
];

const ONBOARDING = [
  { kicker: "Week 1", title: "Connect and reconcile", text: "We connect your systems, pull history and show you the first reconciled book with the gaps named." },
  { kicker: "Week 2", title: "Configure the firm", text: "Roles, roster, queues, product lines and escalation targets set to match how you already work." },
  { kicker: "Week 3", title: "Work the queue", text: "Sequences go out to reconciled lists. Your team works the clients who need a person, with the ledger in front of them." },
  { kicker: "Month 1", title: "First certified snapshot", text: "A receivables number the partners can trust, with the trend starting from a real baseline." },
];

const ResultsPage = () => {
  usePageMeta(RESULTS_META.title, RESULTS_META.description);
  const published = PENDING_HEADLINE.filter((p) => p.value);

  return (
    <SiteShell>
      <PageHero
        crumb="Results"
        eyebrow="Results"
        title="What LexCollect did inside a working firm."
        lead={`LexCollect was built in the finance department of a high-volume firm with a $21M receivables book spread across ${INTEGRATIONS.join(", ")} and the bank. Everything below happened there. Every number came out of the system, not a slide deck.`}
      />

      <ProofStrip label="Headline results" items={HEADLINE} />

      {published.length > 0 && (
        <section className="section section--tight section--deep">
          <div className="container">
            <div className="wins">
              {published.map((p) => (
                <div className="win" key={p.label}>
                  <span className="win__label">{p.label}</span>
                  <span className="win__num">{p.value}</span>
                  <p className="win__text">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="subnav-scope">
      <SubNav label="Result stories" items={STORIES.map((s) => ({ id: s.id, label: s.short }))} />

      <section className="section rs-stories">
        <div className="container">
          {STORIES.map((s, i) => {
            const facts = s.facts.filter((f) => f.value);
            return (
              <article className="rs-story" id={s.id} key={s.id}>
                <header className="rs-story__head" data-reveal>
                  <p className="pf-module__eyebrow">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {s.eyebrow}
                  </p>
                  <h2>{s.title}</h2>
                  <p className="rs-story__lede">{s.lede}</p>
                </header>
                <div className="rs-story__body">
                  <aside className="rs-ledger" aria-label={`${s.short}: key figures`} data-reveal>
                    <p className="rs-ledger__head">Key figures</p>
                    <dl>
                      {facts.map((f) => (
                        <div key={f.label}>
                          <dt>{f.value}</dt>
                          <dd>{f.label}</dd>
                        </div>
                      ))}
                    </dl>
                  </aside>
                  <div className="rs-notes">
                    {s.notes.map((n) => (
                      <p key={n.title} data-reveal>
                        <strong>{n.title}</strong> {n.text}
                      </p>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      </div>

      <section className="section section--deep section--rule rs-onboard">
        <div className="container">
          <div className="section-head" data-reveal>
            <p className="eyebrow">Suited to your firm</p>
            <h2>Everything above is configuration at your firm, not a rebuild.</h2>
            <p className="lead">
              Your team comes from a live roster. Escalation targets are your departments. Message sequences, product
              lines, aging buckets, outcome labels and queues are set per firm.{" "}
              <Link to={MARKETING_ROUTES.contact}>Tell us about your firm.</Link>
            </p>
          </div>
          <Timeline items={ONBOARDING} />
        </div>
      </section>

      <CtaBand
        title="Want these numbers for your firm?"
        lead="One conversation, your systems, and a first look at what's late, what's unmatched and what's recoverable now."
        secondary={{ to: MARKETING_ROUTES.platform, label: "Explore the platform" }}
      />
    </SiteShell>
  );
};

export default ResultsPage;
