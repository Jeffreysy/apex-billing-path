import { useState, type FormEvent } from "react";
import { CONTACT_EMAIL, submitDiagnosticInquiry } from "@/lib/marketing";
import { Arrow } from "./SiteChrome";

interface FormState {
  name: string;
  firm: string;
  email: string;
  phone: string;
  firmType: string;
  size: string;
  systems: string;
  message: string;
  /** Honeypot. Hidden from people; bots that fill it are dropped silently. */
  website: string;
}

const EMPTY: FormState = {
  name: "",
  firm: "",
  email: "",
  phone: "",
  firmType: "",
  size: "",
  systems: "",
  message: "",
  website: "",
};

type Status = "idle" | "sending" | "sent" | "error";

interface Props {
  /** Shown above the fields when the form stands alone (contact page). */
  heading?: string;
  /** Recorded with the inquiry so you know which page converted. */
  sourcePage: string;
  idPrefix?: string;
}

/** The "Book a diagnostic" lead form. Saves to `website_inquiries` in Supabase. */
const DiagnosticForm = ({ heading, sourcePage, idPrefix = "lc" }: Props) => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const id = (field: string) => `${idPrefix}-${field}`;

  const update = (key: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;

    // Honeypot hit: look successful, store nothing.
    if (form.website.trim()) {
      setStatus("sent");
      return;
    }

    setStatus("sending");
    try {
      await submitDiagnosticInquiry({
        fullName: form.name,
        firmName: form.firm,
        email: form.email,
        phone: form.phone,
        firmType: form.firmType,
        firmSize: form.size,
        systems: form.systems,
        message: form.message,
        sourcePage,
      });
      setStatus("sent");
      setForm(EMPTY);
    } catch (err) {
      console.error("Diagnostic inquiry failed", err);
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="form-status form-status--done" role="status" aria-live="polite">
        <p className="eyebrow">Request received</p>
        <h3>Thanks. We'll reply within one business day.</h3>
        <p className="muted">
          We'll set up a time with your team and walk through your systems. If anything is urgent in the meantime,
          write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </div>
    );
  }

  return (
    <form className={heading ? "form contact-card" : "form"} onSubmit={onSubmit} noValidate={false}>
      {heading && <h2 style={{ fontSize: "var(--fs-2xl)" }}>{heading}</h2>}

      <div className="form-row">
        <div className="field">
          <label htmlFor={id("name")}>Full name</label>
          <input id={id("name")} type="text" required autoComplete="name" value={form.name} onChange={update("name")} />
        </div>
        <div className="field">
          <label htmlFor={id("firm")}>Firm name</label>
          <input id={id("firm")} type="text" required autoComplete="organization" value={form.firm} onChange={update("firm")} />
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor={id("email")}>Work email</label>
          <input id={id("email")} type="email" required autoComplete="email" value={form.email} onChange={update("email")} />
        </div>
        <div className="field">
          <label htmlFor={id("phone")}>
            Phone <span className="opt">(optional)</span>
          </label>
          <input id={id("phone")} type="tel" autoComplete="tel" value={form.phone} onChange={update("phone")} />
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor={id("firmType")}>What your firm does</label>
          <input
            id={id("firmType")}
            type="text"
            required
            placeholder="e.g. professional services with payment plans"
            value={form.firmType}
            onChange={update("firmType")}
          />
        </div>
        <div className="field">
          <label htmlFor={id("size")}>Firm size</label>
          <select id={id("size")} required value={form.size} onChange={update("size")}>
            <option value="">Choose one</option>
            <option>1–10 people</option>
            <option>11–25 people</option>
            <option>26–75 people</option>
            <option>75+ people</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor={id("systems")}>
          Systems you use <span className="opt">(client management, payments, accounting)</span>
        </label>
        <input
          id={id("systems")}
          type="text"
          placeholder="e.g. MyCase, LawPay, QuickBooks"
          value={form.systems}
          onChange={update("systems")}
        />
      </div>

      <div className="field">
        <label htmlFor={id("message")}>
          What's going on? <span className="opt">(optional)</span>
        </label>
        <textarea
          id={id("message")}
          placeholder="Unmatched payments, a growing unapplied balance, payment plans that drift..."
          value={form.message}
          onChange={update("message")}
        />
      </div>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={update("website")} />
      </div>

      <div>
        <button type="submit" className="btn btn--primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Request my call"} <Arrow />
        </button>
        <p className="form-note" style={{ marginTop: "0.9rem" }}>
          We'll only use your details to respond to this request.
        </p>
      </div>

      {status === "error" && (
        <p className="form-status form-status--error" role="alert">
          Something went wrong and your request wasn't saved. Please try again, or email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      )}
    </form>
  );
};

export default DiagnosticForm;
