import { Link } from "react-router-dom";
import { Arrow, CtaBand, PageHero, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";
import { MARKETING_ROUTES } from "@/lib/marketing";

export const ABOUT_META = {
  title: "About LexCollect | AR Diagnostics for Law Firms",
  description:
    "LexCollect builds accounts-receivable diagnostics for law firms: software that reconciles four systems, prices every break by cause, and assigns the fix.",
};

const PRINCIPLES = [
  {
    title: "Every finding has a price",
    text: "A cause, a record count and a dollar figure. If we can't put a price on a problem, we say so instead of guessing.",
  },
  {
    title: "Fixable and not-yet-fixable are different lists",
    text: "Mixing them is how a team spends a month on problems nobody can solve yet. We keep them apart.",
  },
  {
    title: "Every fix has an owner",
    text: "Work that belongs to everyone gets done by no one. LexCollect routes each item to one named person.",
  },
  {
    title: "Trust comes from checking",
    text: "The system audits its own pipelines. A green status has to mean the job really ran.",
  },
];

const AboutPage = () => {
  usePageMeta(ABOUT_META.title, ABOUT_META.description);

  return (
    <SiteShell>
      <PageHero
        crumb="About"
        eyebrow="About LexCollect"
        title="We start one step earlier than collections."
        lead="Most AR tools begin with a list of people who owe money and help you call them. LexCollect begins with a harder question: what is actually wrong with how this firm's money moves?"
      />

      <section className="section">
        <div className="container">
          <div className="split split--wide-left">
            <div>
              <p className="eyebrow">Our story</p>
              <h2>Why we built a diagnostic, not a call list</h2>
              <p>
                A law firm's money crosses a case-management system, a payment processor, an accounting system and a
                bank. Every handoff is a place a dollar can go missing, get attached to the wrong client, or stop being
                tracked.
              </p>
              <p>
                Most firms never see those gaps, because seeing them means reconciling four systems that were never
                designed to agree. So the gaps become one line in a monthly report, "unattributed," and a spreadsheet
                someone means to get to.
              </p>
              <p>
                LexCollect reconciles those systems continuously. Then it does the part that makes it a diagnostic rather
                than a report. It breaks each problem into named causes, prices them, and hands the fixable ones to the
                person who can fix them.
              </p>
            </div>
            <blockquote className="pullquote">
              A report would say "$8.3M unattributed." The diagnostic says "$2.5M of it is fixable this week. Here are
              the records, and here is the cause of each."
              <cite>The difference is the product</cite>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="section section--deep section--rule">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">System map</p>
            <h2>What's actually built</h2>
            <p className="lead">
              Measured by what exists today, not by a roadmap. Collections is the smallest working part of LexCollect.
              Reconciliation and diagnosis are the bulk of it.
            </p>
          </div>
          <div
            className="sysmap"
            role="img"
            aria-label="About 92% of LexCollect is reconciliation, diagnosis, routing and self-monitoring; about 8% is the collections call list"
          >
            <div className="sysmap__bar">
              <div className="core">Reconciliation · Diagnosis · Routing · Self-monitoring</div>
              <div className="coll">8%</div>
            </div>
            <div className="sysmap__key">
              <span>~92% finding and fixing breaks</span>
              <span>~8% collections call list</span>
            </div>
          </div>
          <div className="grid grid--4">
            <div className="card">
              <span className="kicker">01</span>
              <h3>Reconciliation</h3>
              <p>Ties every dollar to a real client, invoice and deposit, or flags it as untied.</p>
            </div>
            <div className="card">
              <span className="kicker">02</span>
              <h3>Diagnosis</h3>
              <p>Splits each break by cause, prices it, and sorts it into fixable now or not yet.</p>
            </div>
            <div className="card">
              <span className="kicker">03</span>
              <h3>Routing &amp; monitoring</h3>
              <p>Assigns fixable work to a person, and audits 44 internal pipelines for silent failure.</p>
            </div>
            <div className="card">
              <span className="kicker">04</span>
              <h3>Collections</h3>
              <p>A call list built on reconciled data, so your team only calls people who actually owe.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--rule">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Principles</p>
            <h2>How we work</h2>
          </div>
          <div className="grid grid--2">
            {PRINCIPLES.map((p, i) => (
              <div className="card" key={p.title}>
                <span className="kicker">Principle 0{i + 1}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--deep section--rule">
        <div className="container">
          <div className="split split--center">
            <div>
              <p className="eyebrow">Who we serve</p>
              <h2>Built for firms in the middle</h2>
              <p className="lead">
                Mid-size and growing law firms that are past the point where receivables can be held in someone's head,
                but don't have a finance department to chase them full time.
              </p>
              <p className="muted">
                We're starting with immigration practices, where flat fees, payment plans and third-party payers make
                the problem hardest to see. Other practice areas are next.
              </p>
              <div className="actions">
                <Link className="btn btn--ghost" to={MARKETING_ROUTES.services}>
                  See what LexCollect does <Arrow />
                </Link>
              </div>
            </div>
            <div className="founder">
              <div className="avatar-ph">Founder photo</div>
              <div>
                <span className="placeholder-tag">Placeholder: replace</span>
                <p className="muted" style={{ marginTop: "1rem" }}>
                  [A short note from the founder: who you are, the moment you saw how much money firms lose between
                  systems, and why you built LexCollect to find it. Two or three sentences in your own voice.]
                </p>
                <p>
                  <strong>[Founder name]</strong>
                  <br />
                  <span className="muted small">Founder, LexCollect</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        title="See what your own numbers say."
        lead="One conversation, your systems, and a first look at where your firm's money is stuck."
      />
    </SiteShell>
  );
};

export default AboutPage;
