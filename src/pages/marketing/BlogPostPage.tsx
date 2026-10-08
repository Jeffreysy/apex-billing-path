import { Link, Navigate, useParams } from "react-router-dom";
import { CtaBand, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";
import { BLOG_POST_SLUG, MARKETING_ROUTES } from "@/lib/marketing";
import { PostCard, UPCOMING_POSTS } from "./BlogPage";

export const BLOG_POST_META = {
  title: "Where Immigration Firms Lose Money Between Systems | LexCollect",
  description:
    "Flat fees, payment plans and third-party payers: five places immigration law firms lose track of money they've already been paid, and how to find it.",
};

const Article = () => (
  <article>
    <header className="article-head">
      <div className="container container--narrow">
        <p className="breadcrumb">
          <Link to={MARKETING_ROUTES.home}>Home</Link> / <Link to={MARKETING_ROUTES.blog}>Blog</Link> / Immigration
          practice
        </p>
        <p className="eyebrow">Immigration practice</p>
        <h1>Where Immigration Firms Lose Money Between the Case System and the Bank</h1>
        <div className="article-meta">
          <span>By the LexCollect team</span>
          <span>8 min read</span>
        </div>
      </div>
    </header>

    <div className="container container--narrow">
      <div className="prose">
        <p>
          Ask an immigration firm owner where their receivables problem is and most will say collections: clients who
          stop paying partway through a payment plan. That's real. But in many firms, a large share of the "missing"
          money was actually paid. It arrived and was deposited. It just never got attached to the right client,
          invoice or matter.
        </p>
        <p>That money isn't lost to a client who won't pay. It's lost in the handoffs between the systems your firm runs on.</p>

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
          can go missing, get attached to the wrong client, or stop being tracked.
        </p>

        <h2>Five places immigration firms lose track of money</h2>
        <h3>1. Payments with no invoice to land on</h3>
        <p>
          A fee is agreed at the consultation, the client pays a deposit, and the invoice gets created days later, or
          never. The payment is real but has nothing in the case system to match against. Multiply that by a few
          hundred payment plans and the unmatched pile grows every month.
        </p>
        <h3>2. Payers who aren't the client</h3>
        <p>
          In immigration practice, the person paying is often not the client. It might be a spouse, a parent, a U.S.
          sponsor or an employer. The payment processor records the payer's name, the case system knows the client's
          name, and nothing connects the two.
        </p>
        <h3>3. Names that only almost match</h3>
        <p>
          Transliterated names, two surnames, a first and last name in a different order, a nickname on the card. A
          human can see that "Maria Garcia Lopez" and "GARCIA, MARIA" are probably the same person. Software that needs
          an exact match can't. Those records should go to a person for review, not be matched on a guess and not be
          left sitting unmatched.
        </p>
        <h3>4. One family, several matters</h3>
        <p>
          A household may have several filings open at once. A payment that lands on the wrong matter makes one case
          look overpaid and another look overdue. That second case can end up on a collections call list.
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
          should fix it. So it rolls into next month's report.
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
            <strong>Name the cause of every break.</strong> "No invoice," "invoice not linked to a client" and
            "name-only match" are different problems with different owners.
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

        <div className="callout">
          <h2>Key takeaways</h2>
          <ul>
            <li>Much of an immigration firm's "missing" money has been paid but never attributed.</li>
            <li>Third-party payers, name variations and multi-matter families make attribution harder than in most practice areas.</li>
            <li>A total isn't a diagnosis. Split it by cause, price each cause, and separate what's fixable now.</li>
            <li>Every fixable break needs one named owner.</li>
          </ul>
        </div>

        <p>
          LexCollect does this reconciliation continuously for law firms, starting with immigration practices. If you'd
          like to see what's fixable at your firm, <Link to={MARKETING_ROUTES.contact}>book a diagnostic</Link>.
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
            <h2 style={{ fontSize: "var(--fs-2xl)" }}>More on law firm AR</h2>
          </div>
          <div className="grid grid--3">
            {UPCOMING_POSTS.slice(0, 3).map((p) => (
              <PostCard key={p.title} post={p} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Find out what's fixable at your firm this week." />
    </SiteShell>
  );
};

export default BlogPostPage;
