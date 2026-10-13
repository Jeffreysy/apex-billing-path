import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { UserRole } from "@/lib/auth";

type Profile = Tables<"profiles">;

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  mustChangePassword: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadProfileForUser(user: User | null) {
  if (!user) {
    return { profile: null, role: null as UserRole | null };
  }

  const [{ data: roleData }, profileResult] = await Promise.all([
    supabase.rpc("current_user_role"),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);

  const profile = profileResult.error ? null : profileResult.data;
  const role = (roleData || profile?.role || "read_only") as UserRole | null;

  return { profile, role };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);
  // Whose profile is currently loaded: undefined = nothing resolved yet, null = signed out.
  const loadedUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    let active = true;

    const syncAuthState = async (nextSession: Session | null) => {
      if (!active) return;

      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);
      loadedUserId.current = nextUser?.id ?? null;

      if (!nextUser) {
        setProfile(null);
        setRole(null);
        setMustChangePassword(false);
        setLoading(false);
        return;
      }

      const { profile: nextProfile, role: nextRole } = await loadProfileForUser(nextUser);
      if (!active) return;

      setProfile(nextProfile);
      setRole(nextRole);
      setMustChangePassword(Boolean(nextUser.user_metadata?.must_change_password));
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => {
      void syncAuthState(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      const nextUserId = nextSession?.user?.id ?? null;
      const sameUser =
        loadedUserId.current !== undefined && nextUserId !== null && nextUserId === loadedUserId.current;
      if (sameUser && event !== "SIGNED_OUT") {
        // TOKEN_REFRESHED, or the SIGNED_IN supabase-js re-emits when the tab regains focus, for the user
        // already loaded: swap in the fresh session WITHOUT the full-app loader. Flipping `loading` here
        // unmounted every page on each token refresh / refocus — resetting page state (e.g. the Executive
        // Insights month) and re-firing every query.
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        if (event === "USER_UPDATED") {
          setMustChangePassword(Boolean(nextSession?.user?.user_metadata?.must_change_password));
        }
        return;
      }
      // Initial session, a different user signing in, or sign-out: full reload of profile + role.
      setLoading(true);
      void syncAuthState(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, profile, role, mustChangePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
