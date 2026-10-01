import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { getDefaultRouteForRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BrandMark, BrandWordmark } from "@/components/BrandLogo";

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
      },
    });
    setSendingMagicLink(false);

    if (error) {
      toast.error(error.message || "Unable to send magic link");
      return;
    }

    toast.success("Magic link sent. Check your email to finish signing in.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-sidebar">
      <div className="ledger-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10">
        <div className="relative w-full max-w-md pb-5 pl-5">
          {/* The L from the mark, cradling the sign-in card */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 top-[14%] border-b-[14px] border-l-[14px] border-sidebar-accent"
            aria-hidden="true"
          />
          <Card className="relative border-0 shadow-2xl">
            <CardHeader className="space-y-4 text-center">
              <BrandMark className="mx-auto h-12 w-auto" />
              <div>
                <CardTitle className="text-3xl">
                  <BrandWordmark />
                </CardTitle>
                <CardDescription className="mt-3 font-mono text-xs uppercase tracking-[0.14em]">
                  Secure sign in
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
