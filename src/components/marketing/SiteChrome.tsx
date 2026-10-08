import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { CONTACT_EMAIL, MARKETING_ROUTES } from "@/lib/marketing";
import "@/styles/marketing.css";

const NAV_LINKS = [
  { to: MARKETING_ROUTES.about, label: "About" },
  { to: MARKETING_ROUTES.services, label: "Services" },
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
          <Link className="btn btn--primary btn--sm" to={MARKETING_ROUTES.contact} onClick={() => setOpen(false)}>
            Book a diagnostic
          </Link>
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
          <p>Accounts-receivable software that finds where a law firm's money is stuck, prices each break, and routes the fix.</p>
        </div>
        <div className="footer-col">
          <h2>Platform</h2>
          <ul>
            <li>
              <Link to={`${MARKETING_ROUTES.services}#reconciliation`}>Reconciliation</Link>
            </li>
            <li>
              <Link to={`${MARKETING_ROUTES.services}#diagnosis`}>Diagnosis</Link>
            </li>
            <li>
              <Link to={`${MARKETING_ROUTES.services}#routing`}>Routing</Link>
            </li>
            <li>
              <Link to={`${MARKETING_ROUTES.services}#monitoring`}>Self-monitoring</Link>
            </li>
            <li>
              <Link to={`${MARKETING_ROUTES.services}#collections`}>Collections</Link>
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
              <Link to={MARKETING_ROUTES.contact}>Book a diagnostic</Link>
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

/** Wraps a marketing page in the scoped `.lc` theme with header and footer. */
export const SiteShell = ({ children }: { children: ReactNode }) => (
  <div className="lc">
    <a className="skip-link" href="#main">
      Skip to content
    </a>
    <SiteHeader />
    <main id="main">{children}</main>
    <SiteFooter />
  </div>
);

interface PageHeroProps {
  crumb: string;
  eyebrow: string;
  title: ReactNode;
  lead: ReactNode;
  children?: ReactNode;
  narrow?: boolean;
}

export const PageHero = ({ crumb, eyebrow, title, lead, children }: PageHeroProps) => (
  <section className="page-hero">
    <div className="container">
      <p className="breadcrumb">
        <Link to={MARKETING_ROUTES.home}>Home</Link> / {crumb}
      </p>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lead">{lead}</p>
      {children}
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
      <p className="eyebrow">Book a diagnostic</p>
      <h2>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
      <div className="actions">
        <Link className="btn btn--primary" to={MARKETING_ROUTES.contact}>
          Book a diagnostic <Arrow />
        </Link>
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
