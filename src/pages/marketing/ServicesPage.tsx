import { CtaBand, FaqList, PageHero, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";

export const SERVICES_META = {
  title: "Law Firm Payment Reconciliation & AR Software | LexCollect",
  description:
    "Payment reconciliation, AR diagnostics, routed work queues, pipeline monitoring and collections for law firms, in one system built to find stuck money.",
};

interface Module {
  id: string;
  num: string;
  eyebrow: string;
  title: string;
  lede: string;
  sizeNote?: string;
  caps: { title: string; text: string }[];
}

const MODULES: Module[] = [
  {
    id: "reconciliation",
    num: "01",
    eyebrow: "Reconciliation",
    title: "Payment reconciliation across four systems",
    lede: "Every dollar tied to a real client, invoice and deposit, or explicitly flagged as untied.",
    caps: [
      {
        title: "Continuous ingest",
        text: "Case management, payment processor, accounting and CRM data, pulled in continuously. No month-end exports.",
      },
      {
        title: "Client, invoice and deposit matching",
        text: "Each payment is traced from the case system to the bank deposit, including payments made by someone other than the client.",
      },
      {
        title: "Nothing dropped silently",
        text: "If a dollar can't be tied to a client, it's labeled untied and counted. It doesn't disappear into a suspense account.",
      },
    ],
  },
  {
    id: "diagnosis",
    num: "02",
    eyebrow: "Diagnosis",
    title: "AR diagnostics, priced by cause",
    lede: "Each break gets a named cause, a record count and a dollar figure. Then it's sorted into fixable now or not yet fixable.",
    caps: [
      {
        title: "Named causes",
        text: '"Unattributed" becomes specific: payments with no invoice, invoices with no client link, records that only match by name.',
      },
      {
        title: "Dollar figures, not scores",
        text: "Every cause shows what it's worth, so you fix the most expensive problems first.",
      },
      {
        title: "Fixable now vs. not yet",
        text: "What your team can clear this week is kept apart from what needs an upstream fix first.",
      },
    ],
  },
  {
    id: "routing",
    num: "03",
    eyebrow: "Routing",
    title: "Fixable work, assigned to a person",
    lede: "A finding nobody owns is just a longer report. LexCollect turns each fixable break into a work item with a name on it.",
    caps: [
      {
        title: "Owner-based queues",
        text: "Each item goes to whoever can fix it: billing, intake, your bookkeeper or an attorney.",
      },
      {
        title: "Records attached",
        text: "Every work item carries its records and its cause, so nobody starts from a blank spreadsheet.",
      },
      {
        title: "Progress in dollars",
        text: "Track what's been cleared in dollars recovered, not tickets closed.",
      },
    ],
  },
  {
    id: "monitoring",
    num: "04",
    eyebrow: "Self-monitoring",
    title: "Pipeline monitoring that catches silent failure",
    lede: "LexCollect assumes it will fail, and checks. That's what makes its numbers worth trusting.",
    caps: [
      {
        title: "44 pipelines watched",
        text: "Every internal job that moves or checks your data is audited on its own schedule.",
      },
      {
        title: "Silent blind spots",
        text: "Data that stopped arriving without raising an error is found and flagged.",
      },
      {
        title: "Heartbeat lies",
        text: "Jobs that stopped running while their status still read green are caught, not trusted.",
      },
    ],
  },
  {
    id: "collections",
    num: "05",
    eyebrow: "Collections",
    title: "Law firm collections, informed by the diagnosis",
    lede: "The call list is about 8% of LexCollect, and it works better because of the other 92%.",
    sizeNote: "≈ 8% of the system",
    caps: [
      {
        title: "Reconciled call lists",
        text: "Payments are reconciled first, so your team calls people who actually owe. Nobody calls a family who paid through a relative last month.",
      },
      {
        title: "Payment-plan follow-up",
        text: "Missed installments are surfaced while they're still small and easy to recover.",
      },
      {
        title: "Context before the call",
        text: "Whoever makes the call sees what was paid, by whom, and against which matter.",
      },
    ],
  },
];

const FAQS = [
  {
    q: "Does LexCollect replace our case-management or accounting software?",
    a: "No. LexCollect sits across the systems you already use and reconciles them. Your team keeps working in the same case-management and accounting tools.",
  },
  {
    q: "What happens when a record can't be matched automatically?",
    a: "It's flagged as untied and counted, never dropped. Records that only match by name go to a person for a quick review instead of being matched on a guess.",
  },
  {
    q: "Who on our team uses LexCollect?",
    a: "Whoever owns the fix. That's usually the firm administrator, the billing team, the bookkeeper and intake staff, and sometimes an attorney for matter-level questions.",
  },
  {
    q: "Is LexCollect a collections agency?",
    a: "No. LexCollect is software. Your firm keeps the client relationship and decides who is contacted, when and how.",
  },
];

const ServicesPage = () => {
  usePageMeta(SERVICES_META.title, SERVICES_META.description);

  return (
    <SiteShell>
      <PageHero
        crumb="Services"
        eyebrow="Services"
        title="Law firm AR software that reconciles, diagnoses and routes the fix."
        lead="LexCollect is one system with five working parts. Most of it exists to answer the question collections tools skip: where is the money, and why isn't it where it should be?"
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
                {m.sizeNote && <span className="size-note">{m.sizeNote}</span>}
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
                  <td className="is-us">What's broken, and why</td>
                  <td>Who owes money</td>
                  <td>Whatever was exported</td>
                </tr>
                <tr>
                  <th scope="row">Reconciles case system, payments, accounting and bank</th>
                  <td className="is-us yes">Continuously</td>
                  <td className="no">No</td>
                  <td>Manually, monthly</td>
                </tr>
                <tr>
                  <th scope="row">Prices each problem by cause</th>
                  <td className="is-us yes">Yes</td>
                  <td className="no">No</td>
                  <td className="no">No</td>
                </tr>
                <tr>
                  <th scope="row">Separates fixable now from not yet</th>
                  <td className="is-us yes">Yes</td>
                  <td className="no">No</td>
                  <td className="no">No</td>
                </tr>
                <tr>
                  <th scope="row">Assigns each fix to a person</th>
                  <td className="is-us yes">Yes, with records attached</td>
                  <td>Call queues only</td>
                  <td className="no">No</td>
                </tr>
                <tr>
                  <th scope="row">Audits its own data pipelines</th>
                  <td className="is-us yes">44 pipelines</td>
                  <td className="no">No</td>
                  <td className="no">No</td>
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
            <h2>From first call to first fix</h2>
          </div>
          <ol className="steps">
            <li className="step">
              <span className="step__num">01</span>
              <h3>Connect your systems</h3>
              <p>We connect your case management, payment processor, accounting and bank data.</p>
            </li>
            <li className="step">
              <span className="step__num">02</span>
              <h3>Get your first diagnostic</h3>
              <p>A priced breakdown of every break by cause, split into fixable now and not yet.</p>
            </li>
            <li className="step step--highlight">
              <span className="step__num">03</span>
              <h3>Work the queue</h3>
              <p>
                Fixable items go to your team. LexCollect keeps reconciling and watching, so fixed problems stay fixed.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section section--deep section--rule">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">Questions</p>
              <h2>Services FAQ</h2>
            </div>
            <FaqList items={FAQS} />
          </div>
        </div>
      </section>

      <CtaBand
        title="Start with a priced list of what's broken."
        lead="We'll walk through your systems and show you what LexCollect would find first."
      />
    </SiteShell>
  );
};

export default ServicesPage;
