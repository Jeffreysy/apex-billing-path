import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BOOKING_URL, CONTACT_EMAIL, MARKETING_ROUTES } from "@/lib/marketing";
import { initMarketingSite } from "@/lib/marketing-site";
import "@/styles/marketing.css";

const NAV_LINKS = [
  { to: MARKETING_ROUTES.platform, label: "Platform" },
  { to: MARKETING_ROUTES.results, label: "Results" },
  { to: MARKETING_ROUTES.about, label: "About" },
  { to: MARKETING_ROUTES.blog, label: "Blog" },
  { to: MARKETING_ROUTES.contact, label: "Contact" },
];

export const BrandMark = () => (
  <svg viewBox="0 0 686 759" aria-hidden="true">
    <path fill="#FFFFFF" d="M0 0H160V609H686V759H0Z" />
    <path fill="#3DD9C7" d="M203 0H686V227H559V127H330V439H559V360H686V567H203Z" />
  </svg>
);

export const Brand = () => (
  <Link className="brand" to={MARKETING_ROUTES.home} aria-label="LexCollect home">
    <BrandMark />
    <span className="wordmark">
      <span className="lex">Lex</span>
      <span className="collect">Collect</span>
    </span>
  </Link>
);

export const Arrow = () => (
  <span className="arrow" aria-hidden="true">
    &rarr;
  </span>
);

export const BOOK_CALL_LABEL = "Book a call";

/**
 * The "Book a call" link. Opens the Google Calendar booking page when
 * BOOKING_URL is set; otherwise goes to the contact page.
 */
export const BookCallLink = ({
  className,
  children,
  onClick,
}: {
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}) => {
  const label = children ?? BOOK_CALL_LABEL;
  if (BOOKING_URL) {
    return (
      <a className={className} href={BOOKING_URL} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {label}
      </a>
    );
  }
  return (
    <Link className={className} to={MARKETING_ROUTES.contact} onClick={onClick}>
      {label}
    </Link>
  );
};

/** Sets the document title and meta description for a marketing page. */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content ?? null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== null) meta.content = previousDescription;
    };
  }, [title, description]);
}

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isCurrent = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <header className={`site-header${open ? " nav-open" : ""}`}>
      <div className="container">
        <Brand />
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span className="visually-hidden">Menu</span>
        </button>
        <nav className="nav" id="site-nav" aria-label="Main">
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} aria-current={isCurrent(l.to) ? "page" : undefined} onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to={MARKETING_ROUTES.login} onClick={() => setOpen(false)}>
                Log in
              </Link>
            </li>
          </ul>
          <BookCallLink className="btn btn--primary btn--sm" onClick={() => setOpen(false)} />
        </nav>
      </div>
    </header>
  );
};

export const SiteFooter = () => (
  <footer className="site-footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>Accounts-receivable accounting for firms. Every dollar accounted for, every client connected.</p>
        </div>
        <div className="footer-col">
          <h2>Platform</h2>
          <ul>
            <li>
              <Link to={`${MARKETING_ROUTES.platform}#management`}>AR Management</Link>
            </li>
            <li>
              <Link to={`${MARKETING_ROUTES.platform}#reconciliation`}>Reconciliation</Link>
            </li>
            <li>
              <Link to={`${MARKETING_ROUTES.platform}#collections`}>Connect</Link>
            </li>
            <li>
              <Link to={`${MARKETING_ROUTES.platform}#escalations`}>Escalations</Link>
            </li>
            <li>
              <Link to={`${MARKETING_ROUTES.platform}#crm`}>Client CRM</Link>
            </li>
            <li>
              <Link to={MARKETING_ROUTES.results}>Results</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h2>Company</h2>
          <ul>
            <li>
              <Link to={MARKETING_ROUTES.about}>About</Link>
            </li>
            <li>
              <Link to={MARKETING_ROUTES.blog}>Blog</Link>
            </li>
            <li>
              <Link to={MARKETING_ROUTES.contact}>Contact</Link>
            </li>
            <li>
              <Link to={MARKETING_ROUTES.login}>Client log in</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h2>Get started</h2>
          <ul>
            <li>
              <BookCallLink />
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} LexCollect. All rights reserved.</span>
        <nav aria-label="Legal">
          <Link to={MARKETING_ROUTES.contact}>Privacy policy</Link>
          <Link to={MARKETING_ROUTES.contact}>Terms</Link>
        </nav>
      </div>
    </div>
  </footer>
);

/**
 * Wraps a marketing page in the scoped `.lc` theme with header and footer, and
 * wires the page's interactions (src/lib/marketing-site.ts, shared with WordPress).
 */
export const SiteShell = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (ref.current ? initMarketingSite(ref.current) : undefined), []);
  return (
    <div className="lc" ref={ref}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
};

interface PageHeroProps {
  crumb: string;
  eyebrow: string;
  title: ReactNode;
  lead: ReactNode;
  /** Actions or other content under the lead. */
  children?: ReactNode;
  /** A product visual beside the copy; the hero becomes two columns. */
  aside?: ReactNode;
  narrow?: boolean;
}

export const PageHero = ({ crumb, eyebrow, title, lead, children, aside }: PageHeroProps) => (
  <section className={`page-hero${aside ? " page-hero--split" : ""}`}>
    <div className="container">
      <div className="page-hero__grid">
        <div className="page-hero__copy">
          <p className="breadcrumb">
            <Link to={MARKETING_ROUTES.home}>Home</Link> / {crumb}
          </p>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lead">{lead}</p>
          {children}
        </div>
        {aside && <div className="page-hero__aside">{aside}</div>}
      </div>
    </div>
  </section>
);

export interface SubNavItem {
  id: string;
  label: string;
}

/** Sticky in-page menu that marks the section you're reading (data-spy, src/lib/marketing-site.ts). */
export const SubNav = ({ label, items }: { label: string; items: SubNavItem[] }) => (
  <nav className="subnav" aria-label={label} data-spy>
    <div className="container">
      <ol>
        {items.map((it, i) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className={i === 0 ? "is-active" : undefined}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {it.label}
            </a>
          </li>
        ))}
      </ol>
    </div>
  </nav>
);

export interface TimelineItem {
  kicker: string;
  title: string;
  text: string;
}

/** Horizontal steps joined by a rule, the brand's square nodes on it. */
export const Timeline = ({ items }: { items: TimelineItem[] }) => (
  <ol className="tl">
    {items.map((it, i) => (
      <li key={it.title} className="tl__item" data-reveal data-reveal-delay={i * 90}>
        <span className="tl__kicker">{it.kicker}</span>
        <h3>{it.title}</h3>
        <p>{it.text}</p>
      </li>
    ))}
  </ol>
);

export interface ProofItem {
  n: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

/** A band of headline figures that count up as they scroll into view. */
export const ProofStrip = ({ intro, items, label }: { intro?: ReactNode; items: ProofItem[]; label: string }) => (
  <section className="hm-proof" aria-label={label}>
    <div className="container">
      {intro && (
        <p className="hm-proof__intro" data-reveal>
          {intro}
        </p>
      )}
      <ul className="hm-proof__grid">
        {items.map((p, i) => {
          const d = p.decimals ?? 0;
          return (
            <li key={p.label} data-reveal data-reveal-delay={i * 80}>
              <span className="hm-proof__num" data-count={p.n} data-decimals={d} data-prefix={p.prefix ?? ""} data-suffix={p.suffix ?? ""}>
                {p.prefix}
                {p.n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}
                {p.suffix}
              </span>
              <span className="hm-proof__label">{p.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);

interface CtaBandProps {
  title: string;
  lead?: string;
  secondary?: { to: string; label: string };
}

export const CtaBand = ({ title, lead, secondary }: CtaBandProps) => (
  <section className="cta-band">
    <div className="container">
      <p className="eyebrow">Book a call</p>
      <h2>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
      <div className="actions">
        <BookCallLink className="btn btn--primary">
          {BOOK_CALL_LABEL} <Arrow />
        </BookCallLink>
        {secondary && (
          <Link className="btn btn--ghost" to={secondary.to}>
            {secondary.label}
          </Link>
        )}
      </div>
    </div>
  </section>
);

export interface FaqItem {
  q: string;
  a: ReactNode;
}

export const FaqList = ({ items }: { items: FaqItem[] }) => (
  <div className="faq">
    {items.map((f, i) => (
      <details key={f.q} open={i === 0}>
        <summary>
          <h3>{f.q}</h3>
        </summary>
        <div>
          <p>{f.a}</p>
        </div>
      </details>
    ))}
  </div>
);
