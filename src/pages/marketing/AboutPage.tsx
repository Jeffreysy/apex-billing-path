import { Link } from "react-router-dom";
import { Arrow, BOOK_CALL_LABEL, BookCallLink, CtaBand, PageHero, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";
import MomentumCard from "@/components/marketing/MomentumCard";
import { MARKETING_ROUTES } from "@/lib/marketing";

export const ABOUT_META = {
  title: "About LexCollect | The Accounting Department Immigration Firms Never Had",
  description:
    "LexCollect was built inside a high-volume immigration firm to give partners one source of truth across every system and to protect the trust between the firm and the families it serves. High-level accounting and visibility, as a service.",
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
    text: "The firm ran MyCase, then Filevine, took payments through LawPay, tracked leads in HubSpot and closed the books in QuickBooks. Families paid from their own cards, a cousin's or a sponsor's. None of the systems agreed about the whole, so a family who had paid could still look overdue, and the “true AR” lived in a spreadsheet someone rebuilt from raw exports every month.",
  },
  {
    kicker: "What we built",
    title: "The thing in the middle",
    text: "It reconciled a $21M book to the firm's own ground truth, found hundreds of contracts marked paid that weren't, re-linked $3.5M of balances to the right clients, and replaced rounds of calls with reconciled lists, respectful email and SMS, and a record of every contact.",
  },
  {
    kicker: "What came next",
    title: "Queues, a certified number, other firms",
    text: "Escalations moved out of email and into queues with owners. The partners got a certified number every month. Then other firms asked for it. That's LexCollect.",
  },
];

const OUTCOMES = [
  { title: "Client trust", text: "The connection between firm and family, rebuilt: nobody is chased for money they already paid, and nobody who is struggling is ignored." },
  { title: "Maximize revenue", text: "Collect more of what was already billed, add paying clients, and see which case types to grow." },
  { title: "Financial visibility", text: "One reconciled, certified view of receivables across every system." },
  { title: "Recover hard debt", text: "A prioritized queue, respectful sequences instead of call rounds, promises that get followed, and failed cards handled gently." },
  { title: "Accountability", text: "Every team member measured from the full record, every day." },
  { title: "Internal communication", text: "Escalations with queues, priorities and owners instead of email chains." },
  { title: "Case types & lifecycle", text: "Cash by case type, and where in a case's life it arrives." },
  { title: "Works with every system", text: "Any case system or CRM that exports or has an API. Leads validated by money, and a client 360 the books agree with." },
];

const PRINCIPLES = [
  {
    title: "Reconcile before you reach out",
    text: "A message built on unreconciled data costs the firm its credibility and the family its trust. We tie every dollar to a client, contract and invoice before anyone is contacted.",
  },
  {
    title: "Write for someone who may be afraid",
    text: "Every message is clear, respectful and in the firm's own name. It thanks people for what they've paid, offers a plan before a deadline, and never reads like a threat. Hardship gets a person, not another reminder.",
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
  "We handle immigration or humanitarian cases",
  "Our clients pay flat fees on payment plans",
  "Relatives, sponsors or employers often pay for our clients",
  "Our systems don't agree on who has paid",
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
            The accounting department <em>immigration firms never had.</em>
          </>
        }
        lead="LexCollect was built inside a high-volume immigration firm, where thousands of families were paying for their cases in installments and the firm's systems couldn't agree on who had paid. It reconciles your case, payment, accounting and bank data into one source of truth, and protects the trust between your firm and the families who depend on it."
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
                The partners didn't need a prettier report. They needed one number they could trust, and a way back
                to the families behind it.
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
              <p className="lead">Five rules every number, message and cleanup has to pass before it reaches a partner or a family.</p>
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
              <h2>Immigration and humanitarian firms carrying families on payment plans.</h2>
              <p className="lead">
                Practices handling asylum, family petitions, U and T visas, VAWA, DACA and TPS renewals, removal defense
                and naturalization: flat fees on long payment plans, payments from relatives and sponsors, several
                systems, and no finance department to watch every dollar full time.
              </p>
              <p className="muted">
                The first deployment was a high-volume immigration firm with thousands of installment plans and payers
                who weren't the client, which is the hardest version of the problem. The same system fits any firm that
                bills on payment plans.
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
        title="See what your own numbers say, and who they're about."
        lead="One conversation, your systems, and a first look at what's late, which payments were never credited, and which families are ready to reconnect."
      />
    </SiteShell>
  );
};

export default AboutPage;
