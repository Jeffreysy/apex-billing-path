import { Link, Navigate, useParams } from "react-router-dom";
import { CtaBand, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";
import { BLOG_POST_SLUG, MARKETING_ROUTES } from "@/lib/marketing";
import { PostCard, UPCOMING_POSTS } from "./BlogPage";

export const BLOG_POST_META = {
  title: "Where Immigration Firms Lose Money, and Trust, Between the Case System and the Bank | LexCollect",
  description:
    "Payments from relatives and sponsors, names that almost match, families with several matters: five places immigration firms lose track of money clients already paid, what it costs the relationship, and how to fix it.",
};

const Article = () => (
  <article>
    <header className="article-head">
      <div className="container container--narrow">
        <p className="breadcrumb">
          <Link to={MARKETING_ROUTES.home}>Home</Link> / <Link to={MARKETING_ROUTES.blog}>Blog</Link> / Reconciliation
        </p>
        <p className="eyebrow">Reconciliation &amp; client trust</p>
        <h1>Where Immigration Firms Lose Money, and Trust, Between the Case System and the Bank</h1>
        <div className="article-meta">
          <span>By Jeff Soto-Gil</span>
          <span>9 min read</span>
        </div>
      </div>
    </header>

    <div className="container container--narrow">
      <div className="prose">
        <p>
          Picture a client. We'll call her Rosa. She came to your firm two years ago, after months of working up the
          courage to talk to a lawyer at all. Her case costs more than she earns in three months, so she pays $300 a
          month on a plan. She cleans offices at night. Some months her brother pays from his card, because that's how
          families work.
        </p>
        <p>
          One month the payment arrives under her brother's name. The processor records it. The case system, which only
          knows Rosa, doesn't. Three weeks later someone from the firm calls from a number she doesn't recognize to say
          she's behind.
        </p>
        <p>
          Rosa did everything right. What she hears is that the people she trusted with her future don't see her. Maybe
          she stops answering. Maybe she stops paying. Maybe she misses the call about her next filing, because she has
          stopped picking up numbers she doesn't know.
        </p>
        <p>
          Rosa is a composite, but most immigration firms will recognize her. And nobody at the firm was careless. The
          payment was real, and it was deposited. It just never got attached to the right client. That's what this
          article is about: money lost in the handoffs between a firm's systems, and the trust that gets lost with it.
        </p>

        <h2>Why trust is the whole job in immigration practice</h2>
        <p>
          Most businesses can absorb a billing mistake. An immigration firm often can't, because its clients aren't most
          customers.
        </p>
        <p>
          Many are undocumented, waiting years on a decision, or part of a mixed-status family. They live with a fear
          most of us never carry: that a knock at the door, an official-looking letter or a call from an unknown number
          is the start of losing everything they've built here. They work long hours, often in jobs that offer no
          security, to keep a household running here and often to support family back home. Your fee comes out of that.
        </p>
        <p>
          So every installment is more than a payment. It says: I believe this firm can protect my family's future. When
          the firm's records get that payment wrong, the damage isn't to a balance. It's to the relationship the whole
          case depends on: the client who sends documents on time, comes to appointments prepared, and picks up when the
          firm calls.
        </p>

        <h2>The four systems every dollar crosses</h2>
        <p>At a typical immigration practice, a single payment touches four systems before anyone can say it's been received.</p>
        <h3>1. Case management</h3>
        <p>
          This is where the matter lives, along with the flat fee, the payment plan and the client record. It's the
          firm's idea of who owes what.
        </p>
        <h3>2. Payment processor</h3>
        <p>
          Cards, ACH and payment links. It records who paid and how much, using whatever name and details the payer
          typed in.
        </p>
        <h3>3. Accounting</h3>
        <p>The books your bookkeeper closes each month. Payments often arrive here in batches, not one at a time.</p>
        <h3>4. Bank</h3>
        <p>Where the money actually lands, as deposits that may bundle many payments together.</p>
        <p>
          None of these systems were designed to agree with each other. Every handoff between them is a place a dollar
          can go missing, get attached to the wrong client, or stop being tracked. And every one of those dollars belongs
          to a family who thinks it has been counted.
        </p>

        <h2>Five places immigration firms lose track of money</h2>
        <h3>1. Payments with no invoice to land on</h3>
        <p>
          A fee is agreed at the consultation, the client pays a deposit, and the invoice gets created days later, or
          never. The payment is real but has nothing in the case system to match against. Multiply that by a few hundred
          payment plans and the unmatched pile grows every month. The family has paid. The firm can't show it.
        </p>
        <h3>2. Payers who aren't the client</h3>
        <p>
          In immigration practice, the person paying is often not the client. It might be a spouse, a parent, a U.S.
          sponsor, an employer or a cousin in another state. The payment processor records the payer's name, the case
          system knows the client's name, and nothing connects the two. This is Rosa's story, and it's the most common
          one.
        </p>
        <h3>3. Names that only almost match</h3>
        <p>
          Transliterated names, two surnames, a first and last name in a different order, a nickname on the card. A
          person can see that "Maria Garcia Lopez" and "GARCIA, MARIA" are probably the same client. Software that needs
          an exact match can't. Those records should go to a person for review, not be matched on a guess and not be left
          sitting unmatched. Getting a client's name wrong is its own small message about whether the firm sees them.
        </p>
        <h3>4. One family, several matters</h3>
        <p>
          A household may have several filings open at once. A payment that lands on the wrong matter makes one case look
          overpaid and another look overdue. That second case can end up on a call list, and a family that has paid every
          month gets asked why they stopped.
        </p>
        <h3>5. Batched deposits</h3>
        <p>
          When a processor pays out in batches, the bank shows one deposit for many payments. If the batch isn't broken
          back out, individual payments lose their client and invoice somewhere between the processor and the books.
        </p>

        <blockquote>
          A report says "$8.3M unattributed." A diagnostic says which part of it you can fix this week, and why the rest
          is stuck.
        </blockquote>

        <h2>Why a monthly report doesn't catch it</h2>
        <p>
          Most firms see this problem as one number: unapplied, unattributed or unreconciled money. A single total is
          true, but nobody can act on it. It doesn't say which records are involved, what caused each problem, or who
          should fix it. So it rolls into next month's report, and the families behind it keep getting the wrong
          messages.
        </p>
        <p>
          The fix starts with breaking that number apart. Split it by cause, count the records behind each cause, and
          put a dollar figure on each one. Then separate the causes your team can fix today from the ones that need an
          upstream change first.
        </p>

        <h2>How to find out what's fixable this week</h2>
        <ol>
          <li>
            <strong>Reconcile all four systems, not two.</strong> Matching the processor to the bank isn't enough.
            Payments have to be traced back to a client, an invoice and a matter.
          </li>
          <li>
            <strong>Name the cause of every break.</strong> "No invoice," "paid by someone else," "invoice not linked to
            a client" and "name-only match" are different problems with different owners.
          </li>
          <li>
            <strong>Price each cause.</strong> Record counts tell you about workload. Dollar figures tell you what to do
            first.
          </li>
          <li>
            <strong>Split fixable now from not yet.</strong> Keep a separate list for problems that need a process change
            upstream.
          </li>
          <li>
            <strong>Give each fix an owner.</strong> Intake, billing and the bookkeeper each own different causes. Route
            the work to them with the records attached.
          </li>
        </ol>

        <h2>Then reach out like a firm they can trust</h2>
        <p>
          Once the record is right, how the firm reaches out matters as much as what it says. A few rules protect the
          relationship:
        </p>
        <ul>
          <li>
            <strong>Check every system before anyone is contacted.</strong> Never ask a family about a payment until
            you've looked for it everywhere it could have landed.
          </li>
          <li>
            <strong>Lead with what they've done right.</strong> Thank them for the payments they've made before
            mentioning the one that's missing.
          </li>
          <li>
            <strong>Use the firm's name and a familiar voice.</strong> A message from the team they know is a reminder.
            A call from an unknown number can feel like a threat.
          </li>
          <li>
            <strong>Say what hasn't changed.</strong> If it's true, tell them plainly that a billing question doesn't
            affect their case.
          </li>
          <li>
            <strong>Offer a plan before a deadline.</strong> Work slows down, people get sick, money goes home. A plan
            they can keep is worth more than a balance they can't.
          </li>
          <li>
            <strong>Send hardship to a person.</strong> Someone who can actually say yes, not another automated reminder.
          </li>
          <li>
            <strong>Write in the language they read best.</strong> A message they can't fully understand is a message
            they have to be afraid of.
          </li>
        </ul>

        <div className="callout">
          <h2>Key takeaways</h2>
          <ul>
            <li>Much of an immigration firm's "missing" money has been paid but never attributed.</li>
            <li>
              Payments from relatives and sponsors, name variations and families with several matters make attribution
              harder than in most practice areas.
            </li>
            <li>When the record is wrong, the client experiences it as not being seen, and trust is what the case runs on.</li>
            <li>A total isn't a diagnosis. Split it by cause, price each cause, and separate what's fixable now.</li>
            <li>Reconcile before you reach out, and reach out like a firm they can trust.</li>
          </ul>
        </div>

        <p>
          LexCollect does this reconciliation continuously for immigration and humanitarian law firms, and runs the
          respectful outreach on top of it. If you'd like to see what's fixable at your firm,{" "}
          <Link to={MARKETING_ROUTES.contact}>book a call</Link>.
        </p>
      </div>
    </div>
  </article>
);

const BlogPostPage = () => {
  const { slug } = useParams();
  usePageMeta(BLOG_POST_META.title, BLOG_POST_META.description);

  if (slug !== BLOG_POST_SLUG) {
    return <Navigate to={MARKETING_ROUTES.blog} replace />;
  }

  return (
    <SiteShell>
      <Article />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Keep reading</p>
            <h2 style={{ fontSize: "var(--fs-2xl)" }}>More on receivables and client trust</h2>
          </div>
          <div className="grid grid--3">
            {UPCOMING_POSTS.slice(0, 3).map((p) => (
              <PostCard key={p.title} post={p} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Find out what's fixable at your firm this week, and who it's about." />
    </SiteShell>
  );
};

export default BlogPostPage;
