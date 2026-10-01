import type { Database } from "@/integrations/supabase/types";

export type UserRole = Database["public"]["Enums"]["user_role"];

export const ALL_USER_ROLES: UserRole[] = [
  "admin",
  "partner",
  "attorney",
  "paralegal",
  "billing_clerk",
  "read_only",
];

// Landing page for invite, password-recovery, and magic-link emails.
export const AUTH_CONFIRM_PATH = "/auth/confirm";

export function getAuthConfirmUrl(): string {
  return `${window.location.origin}${AUTH_CONFIRM_PATH}`;
}

export function getDefaultRouteForRole(role: UserRole | null | undefined): string {
  switch (role) {
    case "admin":
    case "partner":
      return "/";
    case "billing_clerk":
      return "/collections";
    case "attorney":
    case "paralegal":
      return "/legal";
    case "read_only":
      return "/clients";
    default:
      return "/clients";
  }
}

export function canAccessCollections(role: UserRole | null | undefined): boolean {
  return role === "admin" || role === "partner" || role === "billing_clerk";
}

export function canAccessLegal(role: UserRole | null | undefined): boolean {
  return role === "admin" || role === "partner" || role === "attorney" || role === "paralegal";
}

export function canAccessAdmin(role: UserRole | null | undefined): boolean {
  return role === "admin" || role === "partner";
}

export function canAccessFinancial(role: UserRole | null | undefined): boolean {
  return role === "admin" || role === "partner" || role === "billing_clerk" || role === "read_only";
}

export function canAccessReporting(role: UserRole | null | undefined): boolean {
  return role === "admin" || role === "partner" || role === "billing_clerk" || role === "read_only";
}

export function canAccessContracts(role: UserRole | null | undefined): boolean {
  return role === "admin" || role === "partner" || role === "billing_clerk" || role === "read_only";
}

export function canAccessClients(role: UserRole | null | undefined): boolean {
  return !!role && ALL_USER_ROLES.includes(role);
}

export function canAccessSettings(role: UserRole | null | undefined): boolean {
  return !!role && ALL_USER_ROLES.includes(role);
}
