import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PageHero, SiteShell, usePageMeta } from "@/components/marketing/SiteChrome";
import { BLOG_POST_SLUG, CONTACT_EMAIL, blogPostPath, subscribeToNewsletter } from "@/lib/marketing";

export const BLOG_META = {
  title: "Law Firm AR & Collections Blog | LexCollect",
  description:
    "Practical articles on law firm accounts receivable, payment reconciliation, immigration firm billing and collections, from the team at LexCollect.",
};

type Category = "reconciliation" | "immigration" | "collections" | "operations";

const CATEGORY_LABELS: Record<Category, string> = {
  reconciliation: "Reconciliation",
  immigration: "Immigration practice",
  collections: "Collections",
  operations: "Operations",
};

interface Post {
  cat: Category;
  fig: string;
  cover?: "teal" | "ink" | "mist";
  title: string;
  summary: string;
  readTime: string;
  /** Only published posts have a slug. The rest are planned. */
  slug?: string;
}

export const FEATURED_POST: Post = {
  cat: "immigration",
  fig: "4 handoffs",
  cover: "teal",
  title: "Where Immigration Firms Lose Money Between the Case System and the Bank",
  summary:
    "Flat fees, payment plans and relatives who pay on a client's behalf. Five places immigration firms lose track of money they've already been paid, and how to find it.",
  readTime: "8 min read",
  slug: BLOG_POST_SLUG,
};

export const UPCOMING_POSTS: Post[] = [
  {
    cat: "reconciliation",
    fig: "untied",
    title: "Unattributed Payments: Why Payment-Plan Money Goes Missing",
    summary:
      "The money arrived. It just never got attached to a client. How unattributed payments happen at law firms and how to clear them for good.",
    readTime: "6 min read",
  },
  {
    cat: "operations",
    fig: "$8.3M",
    cover: "mist",
    title: '"$8.3M Unattributed" Is Not an Answer: Report vs. Diagnostic',
    summary: "Why a single total never gets fixed, and what changes when the same money is split by cause and priced.",
    readTime: "5 min read",
  },
  {
    cat: "operations",
    fig: "9 days",
    cover: "ink",
    title: "Heartbeat Lies: When Your Finance Dashboard Is Green and Wrong",
    summary:
      "A sync that stopped running nine days ago can still show a green check. How to tell whether your numbers are real.",
    readTime: "7 min read",
  },
  {
    cat: "collections",
    fig: "paid",
    cover: "teal",
    title: "Stop Calling Clients Who Already Paid",
    summary: "Collections calls to families who paid through a relative damage trust fast. Reconcile first, then call.",
    readTime: "5 min read",
  },
  {
    cat: "immigration",
    fig: "12×",
    title: "Flat Fees and Payment Plans: An AR Checklist for Immigration Firms",
    summary: "A month-end checklist for firms running hundreds of installment plans across families and matters.",
    readTime: "9 min read",
  },
  {
    cat: "reconciliation",
    fig: "2 lists",
    cover: "mist",
    title: "Fixable Now vs. Not Yet: How to Triage an AR Backlog",
    summary:
      "Split the backlog in two before anyone starts working it. Here's how to decide which list each problem belongs on.",
    readTime: "6 min read",
  },
];

export const PostCover = ({ post }: { post: Pick<Post, "fig" | "cover"> }) => (
  <div className={`post-cover${post.cover ? ` post-cover--${post.cover}` : ""}`}>
    <span className="fig">{post.fig}</span>
  </div>
);

export const PostCard = ({ post }: { post: Post }) => {
  const body = (
    <div className="post-card__body">
      <div className="post-card__meta">
        <span className="cat">{CATEGORY_LABELS[post.cat]}</span>
        <span>·</span>
        <span>{post.readTime}</span>
        {!post.slug && (
          <>
            <span>·</span>
            <span>Coming soon</span>
          </>
        )}
      </div>
      <h3>{post.title}</h3>
      <p>{post.summary}</p>
      {post.slug && <span className="more">Read &rarr;</span>}
    </div>
  );
  return post.slug ? (
    <Link className="post-card" to={blogPostPath(post.slug)}>
      <PostCover post={post} />
      {body}
    </Link>
  ) : (
    <div className="post-card post-card--soon">
      <PostCover post={post} />
      {body}
    </div>
  );
};

const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      await subscribeToNewsletter(email, "blog");
      setStatus("sent");
      setEmail("");
    } catch (err) {
      console.error("Newsletter sign-up failed", err);
      setStatus("error");
    }
  };

  return (
    <form className="inline-form" onSubmit={onSubmit}>
      <label className="visually-hidden" htmlFor="nl-email">
        Email address
      </label>
      <input
        id="nl-email"
        type="email"
        placeholder="you@yourfirm.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="btn btn--primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Subscribing…" : "Subscribe"}
      </button>
      {status === "sent" && (
        <p className="form-status" role="status" style={{ flexBasis: "100%" }}>
          You're on the list. One note a month, nothing else.
        </p>
      )}
      {status === "error" && (
        <p className="form-status form-status--error" role="alert" style={{ flexBasis: "100%" }}>
          That didn't go through. Try again, or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      )}
    </form>
  );
};

const BlogPage = () => {
  usePageMeta(BLOG_META.title, BLOG_META.description);
  const [filter, setFilter] = useState<Category | "all">("all");

  const show = (p: Post) => filter === "all" || p.cat === filter;
  const filters: Array<Category | "all"> = ["all", "reconciliation", "immigration", "collections", "operations"];

  return (
    <SiteShell>
      <PageHero
        crumb="Blog"
        eyebrow="The LexCollect blog"
        title="Law firm AR, reconciliation and collections, explained plainly."
        lead="Practical writing for firm owners, controllers and administrators on where law firm money gets stuck, how to reconcile it, and how to collect it."
      />

      <section className="section section--tight">
        <div className="container">
          <div className="chips" role="group" aria-label="Filter articles by topic">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                className="chip"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : CATEGORY_LABELS[f]}
              </button>
            ))}
          </div>

          {show(FEATURED_POST) && FEATURED_POST.slug && (
            <Link className="featured" to={blogPostPath(FEATURED_POST.slug)}>
              <PostCover post={FEATURED_POST} />
              <div className="post-card__body">
                <div className="post-card__meta">
                  <span className="cat">{CATEGORY_LABELS[FEATURED_POST.cat]}</span>
                  <span>·</span>
                  <span>{FEATURED_POST.readTime}</span>
                  <span>·</span>
                  <span>Featured</span>
                </div>
                <h2>{FEATURED_POST.title}</h2>
                <p>{FEATURED_POST.summary}</p>
                <span className="more">Read the article &rarr;</span>
              </div>
            </Link>
          )}

          <div className="grid grid--3">
            {UPCOMING_POSTS.filter(show).map((p) => (
              <PostCard key={p.title} post={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--navy section--tight">
        <div className="container">
          <div className="newsletter">
            <div>
              <p className="eyebrow">Newsletter</p>
              <h2 style={{ fontSize: "var(--fs-2xl)" }}>One practical AR note a month.</h2>
              <p className="lead">For firm owners and administrators. No sales pitch, and you can unsubscribe any time.</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </SiteShell>
  );
};

export default BlogPage;
