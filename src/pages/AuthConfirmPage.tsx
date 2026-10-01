import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { AuthError, EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import AuthPageShell from "@/components/AuthPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type LinkType = Extract<EmailOtpType, "invite" | "recovery" | "magiclink" | "email">;

const LINK_COPY: Record<LinkType, { title: string; description: string; action: string }> = {
  invite: {
    title: "Welcome to LexCollect",
    description: "You've been invited to LexCollect. Accept the invite to choose your password.",
    action: "Accept Invite",
  },
  recovery: {
    title: "Set your password",
    description: "Continue to choose a new password for your LexCollect account.",
    action: "Continue",
  },
  magiclink: {
    title: "Sign in to LexCollect",
    description: "Continue to finish signing in.",
    action: "Sign In",
  },
  email: {
    title: "Sign in to LexCollect",
    description: "Continue to finish signing in.",
    action: "Sign In",
  },
};

export const EXPIRED_LINK_MESSAGE =
  "This link has expired or was already used. Ask your LexCollect administrator to send a new invite, or sign in if you've already set a password.";

const INVALID_LINK_MESSAGE = "This link is incomplete or invalid. Open the most recent email from LexCollect and try again.";

function isLinkType(value: string | null): value is LinkType {
  return value !== null && Object.prototype.hasOwnProperty.call(LINK_COPY, value);
}

// Supabase's own /verify redirect reports failures in the URL hash, e.g. #error_code=otp_expired.
function readRedirectError(): string | null {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const code = params.get("error_code");
  const description = params.get("error_description");
  if (!code && !description) return null;
  return code === "otp_expired" ? EXPIRED_LINK_MESSAGE : description || INVALID_LINK_MESSAGE;
}

function describeVerifyError(error: AuthError): string {
  if (error.code === "otp_expired" || /expired|invalid/i.test(error.message)) {
    return EXPIRED_LINK_MESSAGE;
  }
  return error.message || INVALID_LINK_MESSAGE;
}

/**
 * Landing page for LexCollect auth emails. The email links carry a token_hash that is only
 * redeemed when the person clicks the button here, so mail scanners that prefetch links
 * (e.g. Microsoft Safe Links) can't burn the one-time token before the recipient opens it.
 */
const AuthConfirmPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { session, user, loading } = useAuth();

  const tokenHash = searchParams.get("token_hash");
  const typeParam = searchParams.get("type");
  const linkType = isLinkType(typeParam) ? typeParam : null;

  const [redirectError] = useState(readRedirectError);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!tokenHash || !linkType) return;

    setVerifying(true);
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: linkType });
    setVerifying(false);

    if (error) {
      setVerifyError(describeVerifyError(error));
      return;
    }

    if (linkType === "magiclink" || linkType === "email") {
      navigate("/home", { replace: true });
      return;
    }

    // Drop the spent token from the URL so a refresh lands on the password step.
    setSearchParams({}, { replace: true });
  };

  const handleSetPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!password || password.length < 8) {
      toast.error("Use a password with at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    });
    setSaving(false);

    if (error) {
      toast.error(error.message || "Unable to save password");
      return;
    }

    toast.success("Password saved. Welcome to LexCollect.");
    navigate("/home", { replace: true });
  };

  const awaitingConfirm = Boolean(tokenHash && linkType);
  const errorMessage =
    redirectError || verifyError || (!awaitingConfirm && !loading && !session ? INVALID_LINK_MESSAGE : null);

  if (errorMessage) {
    return (
      <AuthPageShell title="Link unavailable" description="We couldn't sign you in with this link.">
        <div className="space-y-4">
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">{errorMessage}</p>
          <Button type="button" className="w-full" onClick={() => navigate("/login", { replace: true })}>
            Go to Sign In
          </Button>
        </div>
      </AuthPageShell>
    );
  }

  if (awaitingConfirm && linkType) {
    const copy = LINK_COPY[linkType];
    return (
      <AuthPageShell title={copy.title} description={copy.description}>
        <Button type="button" className="w-full" disabled={verifying} onClick={handleConfirm}>
          {verifying ? "Verifying..." : copy.action}
        </Button>
      </AuthPageShell>
    );
  }

  if (loading) {
    return <AuthPageShell title="LexCollect" description="Checking your link..." />;
  }

  return (
    <AuthPageShell title="Choose your password" description="You'll use this with your email to sign in to LexCollect.">
      <form onSubmit={handleSetPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="confirm-email">Email</Label>
          <Input id="confirm-email" type="email" value={user?.email || ""} autoComplete="username" readOnly disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-new-password">New password</Label>
          <Input
            id="confirm-new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-repeat-password">Confirm password</Label>
          <Input
            id="confirm-repeat-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Saving..." : "Save Password & Continue"}
        </Button>
      </form>
    </AuthPageShell>
  );
};

export default AuthConfirmPage;
