import { supabase } from "@/integrations/supabase/client";

// TODO: replace with the firm's real inbox before launch. Shown in the footer
// and on the contact page.
export const CONTACT_EMAIL = "hello@yourdomain.com";

// TODO: paste the Google Calendar appointment (booking) page URL here. While it
// is empty, every "Book a call" button goes to the contact page instead.
export const BOOKING_URL = "";

export const MARKETING_ROUTES = {
  home: "/",
  platform: "/platform",
  results: "/results",
  about: "/about",
  blog: "/blog",
  contact: "/contact",
  login: "/login",
} as const;

/** Systems LexCollect reads from or writes to today. */
export const INTEGRATIONS = ["MyCase", "Filevine", "LawPay", "HubSpot", "QuickBooks"] as const;

export const BLOG_POST_SLUG = "where-firms-lose-money-between-systems";
export const blogPostPath = (slug: string) => `${MARKETING_ROUTES.blog}/${slug}`;

export interface DiagnosticInquiry {
  fullName: string;
  firmName: string;
  email: string;
  phone?: string;
  firmType?: string;
  firmSize?: string;
  systems?: string;
  message?: string;
  sourcePage?: string;
}

const trimOrNull = (value: string | undefined) => {
  const v = (value ?? "").trim();
  return v.length ? v : null;
};

// `website_inquiries` is created by supabase/migrations/20261008230000_website_inquiries.sql.
// The generated Database types don't include it until `npx supabase gen types`
// is re-run, so this goes through the untyped client like other new tables do.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inquiries = () => (supabase as any).from("website_inquiries");

export async function submitDiagnosticInquiry(input: DiagnosticInquiry): Promise<void> {
  const { error } = await inquiries().insert({
    kind: "diagnostic",
    status: "new",
    full_name: trimOrNull(input.fullName),
    firm_name: trimOrNull(input.firmName),
    email: input.email.trim(),
    phone: trimOrNull(input.phone),
    practice_area: trimOrNull(input.firmType),
    firm_size: trimOrNull(input.firmSize),
    systems: trimOrNull(input.systems),
    message: trimOrNull(input.message),
    source_page: trimOrNull(input.sourcePage),
  });
  if (error) throw error;
}

export async function subscribeToNewsletter(email: string, sourcePage?: string): Promise<void> {
  const { error } = await inquiries().insert({
    kind: "newsletter",
    status: "new",
    email: email.trim(),
    source_page: trimOrNull(sourcePage),
  });
  if (error) throw error;
}
