import { Link } from "react-router-dom";
import { CtaBand, PageHero, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";
import { INTEGRATIONS, MARKETING_ROUTES } from "@/lib/marketing";

export const RESULTS_META = {
  title: "Results: Reconciliation, Migration & Collections at a Law Firm | LexCollect",
  description:
    "What LexCollect did inside a working law firm: a $21.4M book reconciled, 561 orphan contracts re-linked, a Filevine migration with zero mismatches, and escalations with seven hand-off queues.",
};

const ResultsPage = () => {
  usePageMeta(RESULTS_META.title, RESULTS_META.description);

  return (
    <SiteShell>
      <PageHero
        crumb="Results"
        eyebrow="Results"
        title="What LexCollect did inside a working firm."
        lead={`LexCollect was built in the finance department of a high-volume practice with a $21M receivables book spread across ${INTEGRATIONS.join(", ")} and the bank. Everything below happened there. Every number came out of the system, not a slide deck.`}
      />

      <section className="section section--deep">
        <div className="container">
          <div className="wins">
            <div className="win">
              <span className="win__label">Receivables reconciled</span>
              <span className="win__num">$21.4M</span>
              <p className="win__text">Matched to the firm's ground truth within 5%, with the remaining gap explained and assigned.</p>
            </div>
            <div className="win">
              <span className="win__label">Balances re-linked</span>
              <span className="win__num">$3.5M</span>
              <p className="win__text">561 contracts with no client attached were tied back to real people, with every change audited.</p>
            </div>
            <div className="win">
              <span className="win__label">Payments matched</span>
              <span className="win__num">2,013</span>
              <p className="win__text">$1.19M of processor payments tied to a client, contract and invoice. 759 more queued for a human.</p>
            </div>
            <div className="win win--pending">
              <span className="win__label">Delinquent dollars collected</span>
              <span className="win__num">+[ ]%</span>
              <p className="win__text">Month-over-month hard-debt recovery after go-live.</p>
              <span className="placeholder-tag">Add figure</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className="story" id="reconciliation">
            <div>
              <p className="story__num" aria-hidden="true">
                01
              </p>
              <p className="eyebrow">Reconciliation</p>
              <h2>A $21M book, reconciled to the firm's own ground truth</h2>
              <p className="story__lede">
                The firm's "true AR" lived in a spreadsheet built from raw exports. The database said something else.
                LexCollect closed the gap and explained what was left.
              </p>
              <ul className="facts">
                <li>
                  <b>$21,425,589</b>
                  <span>the firm's ground-truth receivables figure</span>
                </li>
                <li>
                  <b>&lt; 5%</b>
                  <span>gap after reconciliation, attributable to a named unmatched-payment backlog and timing</span>
                </li>
                <li>
                  <b>428</b>
                  <span>contracts carried as "Paid" with only ~4% of their value collected, reclassified</span>
                </li>
                <li>
                  <b>561</b>
                  <span>orphan contracts worth $3.5M with no client, re-linked or given a client record</span>
                </li>
                <li>
                  <b>89</b>
                  <span>duplicate client records merged, references moved, nothing hard-deleted</span>
                </li>
              </ul>
            </div>
            <div className="prose-sm">
              <p>
                <strong>Zombie "Paid" contracts.</strong> A prior import had marked 428 contracts as paid simply because
                they weren't in the firm's AR spreadsheet. Only about 4% of their value had ever been collected.
                LexCollect found them by comparing status to actual payments, reclassified them as abandoned, and kept
                every change reversible.
              </p>
              <p>
                <strong>Orphan contracts.</strong> 561 contracts had balances but no client attached. 27 were re-linked
                through case references embedded in the contract, 3 by normalized name, 2 were flagged as ambiguous for
                a person, and 529 got a proper client record created from the contract itself. Every merge and link
                was written to an audit table.
              </p>
              <p>
                <strong>Duplicates.</strong> Exact and near-duplicate client records were merged into one survivor, with
                all 23 related tables repointed, so a client's calls, payments, plan and escalations finally sat in one
                place.
              </p>
              <p>
                <strong>Self-verifying.</strong> Each cleanup migration checked itself against the ground truth before
                committing, so a fix that moved the book by more than $50K would have stopped itself.
              </p>
            </div>
          </article>

          <article className="story" id="payments">
            <div>
              <p className="story__num" aria-hidden="true">
                02
              </p>
              <p className="eyebrow">Payment matching</p>
              <h2>Thousands of processor payments, tied to the right client</h2>
              <p className="story__lede">
                LawPay knew who paid. The case system knew who owed. Nothing connected the two, especially when a
                spouse, parent or employer was the one paying.
              </p>
              <ul className="facts">
                <li>
                  <b>2,013</b>
                  <span>payments ($1,190,204) matched to a client, contract and invoice</span>
                </li>
                <li>
                  <b>759</b>
                  <span>payments ($370,447) queued for human confirmation with ranked suggestions</span>
                </li>
                <li>
                  <b>243</b>
                  <span>new unmatched payments arrived in six days, which is why matching runs continuously</span>
                </li>
              </ul>
            </div>
            <div className="prose-sm">
              <p>
                <strong>Suggestions, not guesses.</strong> For every unmatched payment, LexCollect ranks the five most
                likely clients using name similarity, amount against the client's installment, and timing against their
                due date. Nothing is auto-matched below a confidence threshold. A person confirms, and the confirmation
                is recorded with who did it and how.
              </p>
              <p>
                <strong>Real-world names.</strong> ALL-CAPS processor names, corrected names left in a notes field, two
                surnames in a different order. The matcher reads all of them.
              </p>
              <p>
                <strong>Booked once.</strong> Payment webhooks retry and handlers race. Idempotency guards mean a
                payment can't be booked twice no matter how many times the processor sends it.
              </p>
            </div>
          </article>

          <article className="story" id="migration">
            <div>
              <p className="story__num" aria-hidden="true">
                03
              </p>
              <p className="eyebrow">Migration</p>
              <h2>Moving from MyCase to Filevine without losing a dollar</h2>
              <p className="story__lede">
                A case-management migration is where receivables usually get lost. LexCollect reconciled both systems
                against the firm's case lists before, during and after the move.
              </p>
              <ul className="facts">
                <li>
                  <b>1,395</b>
                  <span>Filevine projects reconciled against 548 firm case-list records</span>
                </li>
                <li>
                  <b>448 / 196 / 18</b>
                  <span>exact, case-number-only and name-only matches, each tier reviewed separately</span>
                </li>
                <li>
                  <b>0</b>
                  <span>mismatches needing manual correction</span>
                </li>
                <li>
                  <b>733</b>
                  <span>Filevine projects that weren't on any firm case list, surfaced for intake to confirm</span>
                </li>
              </ul>
            </div>
            <div className="prose-sm">
              <p>
                <strong>Direct payment sync.</strong> Filevine payments now post straight into LexCollect through a
                webhook, with no middleware. Each one matches by invoice number, updates the invoice and contract
                balances, and logs a collections activity, so the collector sees it before the next call.
              </p>
              <p>
                <strong>History, through the same door.</strong> Historical Filevine payments were backfilled through
                the identical booking pipeline as live ones, so old and new money follow one set of rules.
              </p>
              <p>
                <strong>MyCase kept in the picture.</strong> MyCase contacts, cases, ledgers and payment plans are synced
                into the client 360, so staff still see the full history during and after the transition.
              </p>
            </div>
          </article>

          <article className="story" id="hard-debt">
            <div>
              <p className="story__num" aria-hidden="true">
                04
              </p>
              <p className="eyebrow">Hard debt</p>
              <h2>Delinquent dollars, worked by name and measured by bucket</h2>
              <p className="story__lede">
                Once the book was reconciled, the firm could see its delinquent balance, split it by age, and put a
                collector's name on every account.
              </p>
              <ul className="facts">
                <li>
                  <b>$15.7M</b>
                  <span>delinquent and late receivables made visible by aging bucket and collector</span>
                </li>
                <li>
                  <b>$928K</b>
                  <span>across 228 willing payers with a failed card, separated from true delinquency</span>
                </li>
                <li>
                  <b>86%</b>
                  <span>of the "autopay decline" turned out to be clients finishing their plans, not a card leak</span>
                </li>
                <li className="is-pending">
                  <b>Add figure</b>
                  <span>delinquent dollars collected per month before and after go-live</span>
                </li>
              </ul>
            </div>
            <div className="prose-sm">
              <p>
                <strong>The right list.</strong> Consult-only contacts, raw import noise and abandoned contracts are
                classified and kept out of the queue by default, so collectors spend their day on real accounts.
              </p>
              <p>
                <strong>A record of every call.</strong> Outcome, dollars, duration, origin and commission are logged per
                activity. The firm's old collector dashboard had been showing about 8% of real activity. LexCollect
                now certifies per-collector figures from the full log.
              </p>
              <p>
                <strong>Promises that get followed.</strong> Payment commitments carry a date and an amount, and missed
                installments surface while they're still small.
              </p>
              <p>
                <strong>Willing payers treated differently.</strong> The failed-card segment gets an "update your card"
                nudge instead of a collections call, which protects the relationship and recovers money faster.
              </p>
            </div>
          </article>

          <article className="story" id="trust">
            <div>
              <p className="story__num" aria-hidden="true">
                05
              </p>
              <p className="eyebrow">Trust &amp; firm accounts</p>
              <h2>Operating, trust and the books, reconciled as one</h2>
              <p className="story__lede">
                Retainers and advance fees have to land in trust. Earned fees have to land in operating. The firm has
                to be able to prove both.
              </p>
              <ul className="facts">
                <li>
                  <b>Trust / IOLTA</b>
                  <span>routing for retainer and advance-fee deposits, separate from operating</span>
                </li>
                <li>
                  <b>Every txn</b>
                  <span>processor transactions reconciled to a client, contract and invoice, or queued</span>
                </li>
                <li>
                  <b>Monthly</b>
                  <span>certified AR snapshots, so history is real history</span>
                </li>
                <li>
                  <b>5 cohorts</b>
                  <span>HubSpot "Case Won" deals validated against payment evidence before a client counts as active</span>
                </li>
              </ul>
            </div>
            <div className="prose-sm">
              <p>
                <strong>Trust and operating, kept apart.</strong> Payments taken in LexCollect are routed to the firm's
                operating or Trust / IOLTA account based on what they're for, so a retainer never lands in the wrong
                place.
              </p>
              <p>
                <strong>The CRM and the books agree.</strong> A deal marked won in HubSpot only becomes an active client
                when there's payment evidence behind it. Deals with no money yet are held for review rather than
                inflating the client count.
              </p>
              <p>
                <strong>Locked down.</strong> Row-level security on every table, no anonymous reads of financial data,
                and an audit log of who changed what.
              </p>
            </div>
          </article>

          <article className="story" id="escalations">
            <div>
              <p className="story__num" aria-hidden="true">
                06
              </p>
              <p className="eyebrow">Escalations</p>
              <h2>Internal hand-offs with a queue, a priority and an owner</h2>
              <p className="story__lede">
                Before, an escalation was an email. Now it's a record that billing, legal and management all see, with a
                status that has to be closed.
              </p>
              <ul className="facts">
                <li>
                  <b>7</b>
                  <span>hand-off queues: legal, case management, compliance, customer care, management, sales, billing ops</span>
                </li>
                <li>
                  <b>9</b>
                  <span>source contexts, from inbound call to attorney request to refund follow-up</span>
                </li>
                <li>
                  <b>4</b>
                  <span>priorities, with urgent and high surfaced to the right inbox automatically</span>
                </li>
              </ul>
            </div>
            <div className="prose-sm">
              <p>
                <strong>Inboxes per department.</strong> Legal sees what needs a lawyer. Management sees what needs a
                decision. Collectors see what's theirs. The same escalation, three views.
              </p>
              <p>
                <strong>Hardship handled, not hidden.</strong> Hardship requests are their own workflow, so a client in
                trouble gets a considered answer instead of another call.
              </p>
              <p>
                <strong>Deadlines respected.</strong> A filing-deadline watch shows statute and filing dates on the client
                record and firm-wide, so collections never collides with a legal deadline.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="section section--deep section--rule">
        <div className="container">
          <div className="split split--center">
            <div>
              <p className="eyebrow">Suited to your firm</p>
              <h2>Everything above is configuration at your firm, not a rebuild.</h2>
              <p className="lead">
                Collectors come from a live roster. Escalation targets are your departments. Practice areas, aging
                buckets, outcome labels and queues are set per firm. The integrations are the ones you already pay for.
              </p>
              <p className="muted">
                The first deployment was an immigration practice because that's the hardest version of the problem.
                The system doesn't care what you practice. <Link to={MARKETING_ROUTES.contact}>Tell us about your firm.</Link>
              </p>
            </div>
            <div className="grid grid--2">
              <div className="card">
                <span className="kicker">Week 1</span>
                <h3>Connect and reconcile</h3>
                <p>We connect your systems, pull history and show you the first reconciled book with the gaps named.</p>
              </div>
              <div className="card">
                <span className="kicker">Week 2</span>
                <h3>Configure the firm</h3>
                <p>Roles, roster, queues, practice areas and escalation targets set to match how you already work.</p>
              </div>
              <div className="card">
                <span className="kicker">Week 3</span>
                <h3>Work the queue</h3>
                <p>Collectors start from a prioritized list with the ledger in front of them. Activity is logged from day one.</p>
              </div>
              <div className="card">
                <span className="kicker">Month 1</span>
                <h3>First certified snapshot</h3>
                <p>A receivables number the partners can trust, with the trend starting from a real baseline.</p>
              </div>
            </div>
          </div>
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
