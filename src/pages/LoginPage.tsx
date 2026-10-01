import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import AuthPageShell from "@/components/AuthPageShell";
import { getDefaultRouteForRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const NOT_ACTIVATED_MESSAGE =
  "This email doesn't have an active LexCollect account yet. If you were invited, open the link from your invite, or ask your administrator to send a new one.";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingMagicLink, setSendingMagicLink] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      const from = typeof location.state?.from === "string" ? location.state.from : null;
      navigate(from || getDefaultRouteForRole(role), { replace: true });
    }
  }, [loading, session, role, navigate, location.state]);

  const handlePasswordSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (error) {
      toast.error(error.message || "Unable to sign in");
      return;
    }

    toast.success("Signed in successfully");
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }

    setSendingMagicLink(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        // LexCollect accounts are created by an administrator, never from the sign-in page.
        shouldCreateUser: false,
      },
    });
    setSendingMagicLink(false);

    if (error) {
      // Supabase reports unknown emails, and invited people who have not accepted yet, as signups.
      const notActivated = error.code === "signup_disabled" || error.code === "otp_disabled";
      toast.error(notActivated ? NOT_ACTIVATED_MESSAGE : error.message || "Unable to send magic link");
      return;
    }

    toast.success("Magic link sent. Check your email to finish signing in.");
  };

  return (
    <AuthPageShell title="LexCollect" description="Secure sign in">
      <form onSubmit={handlePasswordSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@company.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign In"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={sendingMagicLink}
          onClick={handleMagicLink}
        >
          {sendingMagicLink ? "Sending..." : "Email Me a Magic Link"}
        </Button>
      </form>
    </AuthPageShell>
  );
};

export default LoginPage;
