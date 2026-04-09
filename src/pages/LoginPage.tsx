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
import { DollarSign } from "lucide-react";

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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.18),transparent_38%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.4))]">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="select-none text-[clamp(4rem,15vw,12rem)] font-black uppercase tracking-[0.32em] text-primary/8">
          LexCollect
        </div>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10">
        <Card className="w-full max-w-md border-white/50 bg-card/95 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">LexCollect</CardTitle>
              <CardDescription className="mt-1">
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
  );
};

export default LoginPage;
