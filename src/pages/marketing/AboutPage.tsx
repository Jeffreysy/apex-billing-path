import { Link } from "react-router-dom";
import { Arrow, BOOK_CALL_LABEL, BookCallLink, CtaBand, PageHero, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";
import MomentumCard from "@/components/marketing/MomentumCard";
import { MARKETING_ROUTES } from "@/lib/marketing";

export const ABOUT_META = {
  title: "About LexCollect | An Accounting Department at Your Fingertips",
  description:
    "LexCollect was built in a firm's finance department to reconcile receivables, automate client outreach, and give partners a number they can trust. An elite accounting firm's visibility and automation, as a service.",
};

/**
 * The founder block renders only once both fields are filled in, so the public
 * page never shows a placeholder. Add a photo at public/brand/founder.jpg and set
 * `photo` to "/brand/founder.jpg" to show it.
 */
const FOUNDER = {
  name: "",
  note: "",
  photo: "",
};

const STORY = [
  {
    kicker: "Before",
    title: "Five systems, each right about its own piece",
    text: "The firm ran MyCase, then Filevine, took payments through LawPay, tracked leads in HubSpot and closed the books in QuickBooks. None of them agreed about the whole, and the “true AR” lived in a spreadsheet someone rebuilt from raw exports every month.",
  },
  {
    kicker: "What we built",
    title: "The thing in the middle",
    text: "It reconciled a $21M book to the firm's own ground truth, found hundreds of contracts marked paid that weren't, re-linked $3.5M of balances to the right clients, and replaced rounds of calls with reconciled lists, automated email and SMS, and a record of every contact.",
  },
  {
    kicker: "What came next",
    title: "Queues, a certified number, other firms",
    text: "Escalations moved out of email and into queues with owners. The partners got a certified number every month. Then other firms asked for it. That's LexCollect.",
  },
];

const OUTCOMES = [
  { title: "Maximize revenue", text: "Collect more of what was already billed, add paying clients, and see which products to sell more of." },
  { title: "Financial visibility", text: "One reconciled, certified view of receivables across every system." },
  { title: "Recover hard debt", text: "A prioritized queue, sequences instead of call rounds, promises that get followed, and failed cards handled gently." },
  { title: "Accountability", text: "Every team member measured from the full record, every day." },
  { title: "Internal communication", text: "Escalations with queues, priorities and owners instead of email chains." },
  { title: "Client trust", text: "The connection between firm and client, rebuilt: nobody is chased for money they already paid." },
  { title: "Products & lifecycle", text: "Cash by product and where in an engagement's life it arrives." },
  { title: "Works with your CRM", text: "Any CRM that exports or has an API. Leads validated by money, and a client 360 the books agree with." },
];

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

const FIT = [
  "We bill clients and carry receivables",
  "We run payment plans or installments",
  "Our systems don't agree on what we're owed",
  "Someone on our team chases late accounts by hand",
];

const AboutPage = () => {
  usePageMeta(ABOUT_META.title, ABOUT_META.description);
  const showFounder = Boolean(FOUNDER.name && FOUNDER.note);

  return (
    <SiteShell>
      <PageHero
        crumb="About"
        eyebrow="About LexCollect"
        title={
          <>
            An elite accounting department, <em>at your fingertips.</em>
          </>
        }
        lead="LexCollect is an AR accounting service for firms. It reconciles your client, payment, accounting and bank data into one live view of what you're owed, automates the outreach that keeps clients current, and rebuilds the connection between your firm and the people who owe it money."
        aside={
          <figure className="page-hero__figure">
            <div className="page-hero__visual">
              <div className="hm-cradle" aria-hidden="true" />
              <MomentumCard />
            </div>
            <figcaption>Illustrative six-month trend. In the product this view is your firm's live data.</figcaption>
          </figure>
        }
      >
        <div className="actions">
          <BookCallLink className="btn btn--primary">
            {BOOK_CALL_LABEL} <Arrow />
          </BookCallLink>
          <Link className="btn btn--ghost" to={MARKETING_ROUTES.results}>
            See the results
          </Link>
        </div>
      </PageHero>

      <section className="section section--light ab-story" id="story">
        <div className="container">
          <div className="ab-story__grid">
            <div className="ab-story__lead" data-reveal>
              <p className="eyebrow">Our story</p>
              <blockquote className="ab-quote">
                The partners didn't need a prettier report. They needed one number they could trust, and a way to
                reconnect with the clients behind it.
              </blockquote>
              <p className="ab-quote__cite">Why LexCollect exists</p>
            </div>
            <ol className="ab-chapters">
              {STORY.map((c, i) => (
                <li key={c.kicker} data-reveal data-reveal-delay={i * 100}>
                  <span className="ab-chapters__kicker">{c.kicker}</span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section ab-outcomes" id="outcomes">
        <div className="container">
          <div className="hm-roles__head" data-reveal>
            <p className="eyebrow">What we care about</p>
            <h2>Eight outcomes, not eight features.</h2>
            <p className="lead">Every part of the platform exists to move one of these. If it doesn't, we don't build it.</p>
          </div>
          <ol className="hm-roles__grid ab-outcomes__grid">
            {OUTCOMES.map((o, i) => (
              <li key={o.title} className="hm-role" data-reveal data-reveal-delay={(i % 4) * 70}>
                <span className="hm-role__who">{String(i + 1).padStart(2, "0")}</span>
                <h3>{o.title}</h3>
                <p>{o.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--light ab-principles" id="principles">
        <div className="container">
          <div className="ab-principles__grid">
            <div className="ab-principles__head" data-reveal>
              <p className="eyebrow">Principles</p>
              <h2>How we work.</h2>
              <p className="lead">Four rules every number, message and cleanup has to pass before it reaches a partner or a client.</p>
            </div>
            <ol className="ab-principles__list">
              {PRINCIPLES.map((p, i) => (
                <li key={p.title} data-reveal data-reveal-delay={i * 80}>
                  <span className="ab-principles__num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section section--deep ab-serve" id="who">
        <div className="container">
          <div className="ab-serve__grid">
            <div data-reveal>
              <p className="eyebrow">Who we serve</p>
              <h2>Firms past the point of keeping receivables in someone's head.</h2>
              <p className="lead">
                Mid-size and growing firms with payment plans, multiple systems and someone chasing late accounts, but no
                finance department to chase every dollar full time.
              </p>
              <p className="muted">
                The first deployment was a firm with thousands of installment plans and payers who weren't the client,
                which is the hardest version of the problem. The system fits any firm that bills.
              </p>
              {showFounder && (
                <div className="ab-founder">
                  {FOUNDER.photo && <img src={FOUNDER.photo} alt={FOUNDER.name} width={72} height={72} />}
                  <div>
                    <p>{FOUNDER.note}</p>
                    <p className="ab-founder__name">
                      <b>{FOUNDER.name}</b> · Founder, LexCollect
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div
              className="ab-fit"
              data-fit
              data-fit-labels="Tick what's true for your firm.|Worth a conversation.|A good fit.|A strong fit.|Built for firms like yours."
              data-reveal
              data-reveal-delay="120"
            >
              <p className="ab-fit__title">Is LexCollect a fit?</p>
              <ul>
                {FIT.map((f, i) => (
                  <li key={f}>
                    <label>
                      <input type="checkbox" name={`fit-${i}`} />
                      <span>{f}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className="ab-fit__foot">
                <span className="ab-fit__result" data-fit-result aria-live="polite">
                  Tick what's true for your firm.
                </span>
                <BookCallLink className="btn btn--primary btn--sm">
                  {BOOK_CALL_LABEL} <Arrow />
                </BookCallLink>
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
